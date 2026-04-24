import { NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { auth } from '@/auth';
import { sql } from '@/lib/db';
import { deleteImageKitFile, uploadProductImage } from '@/lib/imagekit';
import {
  createProduct,
  deleteProduct,
  getProductById,
  getProducts,
  type ProductCharacteristic,
  type ProductOpening,
  type ProductSize,
  type ProductSizeStock,
  updateProduct,
} from '@/lib/products';

export const runtime = 'nodejs';

const STYLE_OPTIONS = [
  'ПОРТАЛА',
  'ДПМ+МК',
  'Комфорт NEW',
  'Елегант NEW',
  'Концепт',
  'Модерн',
  'ЛЮКС',
  'ТРІО ЛАЙТ',
  'ТРІО',
  'ТРІО ТЕРМО',
  'ТРІО MOTTURA',
  'Квадро',
  'Стріт',
  'Стріт ТЕРМО',
  'PROF GUARD',
  'Протипожежні + Економ + Епік',
  'РОЗПРОДАЖ',
  'РОЗПРОДАЖ Преміум NEW',
] as const;

const OPENING_OPTIONS = ['left', 'right'] as const;
const SIZE_OPTIONS = ['850x2040', '950x2040', '1200x2040'] as const;

const CHARACTERISTIC_LABELS = [
  'Короб',
  'Полотно',
  'Метал короб/полотно',
  'МДФ',
  'Теплоізоляція',
  'Ущільнення',
  'Замок верхній',
  'Замок нижній',
  'Ручка',
  'Вічко',
  'Антизрізи',
  'Петлі',
  'Лиштва',
  'Колір ззовні',
  'Колір зсередини',
  'Торець',
  'Броненакладка',
] as const;

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

type ProductType = 'street' | 'apartment';

type ValidationErrors = Partial<{
  title: string;
  price: string;
  discountPrice: string;
  imageFront: string;
  imageBack: string;
  images: string;
  type: string;
  doorType: string;
  styles: string;
  openings: string;
  sizeStocks: string;
  description: string;
  characteristics: string;
  general: string;
}>;

type ParsedMultipartPayload = {
  body: Record<string, unknown>;
  imageFrontFile: File | null;
  imageBackFile: File | null;
};

type StoredProductImageRecord = {
  product_db_id: number;
  image_url: string;
  image_file_id: string | null;
  sort_order: number;
};

type AuditAction = 'created' | 'updated' | 'deleted';

function formatValue(value: string | number | boolean | null | undefined) {
  if (value === null || value === undefined || value === '') {
    return 'не вказано';
  }

  if (typeof value === 'boolean') {
    return value ? 'так' : 'ні';
  }

  return String(value);
}

function normalizeStringArray(values: string[]) {
  return [...values].map((item) => item.trim()).filter(Boolean).sort();
}

function normalizeSizeStocksForDiff(sizeStocks: ProductSizeStock[]) {
  return [...sizeStocks]
    .map((item) => ({
      size: item.size,
      leftStock: Math.max(0, Number(item.leftStock) || 0),
      rightStock: Math.max(0, Number(item.rightStock) || 0),
    }))
    .sort((a, b) => a.size.localeCompare(b.size));
}

function normalizeCharacteristicsForDiff(
  characteristics: ProductCharacteristic[]
) {
  return [...characteristics]
    .map((item) => ({
      label: item.label.trim(),
      value: item.value.trim(),
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

function buildUpdateDetails(
  before: Awaited<ReturnType<typeof getProductById>>,
  after: Awaited<ReturnType<typeof getProductById>>
) {
  if (!before || !after) return ['Дані оновлено'];

  const details: string[] = [];

  if (before.title !== after.title) {
    details.push(`Назва: "${before.title}" → "${after.title}"`);
  }

  if (before.price !== after.price) {
    details.push(`Основна ціна: ${before.price} → ${after.price}`);
  }

  if ((before.discountPrice ?? null) !== (after.discountPrice ?? null)) {
    details.push(
      `Ціна зі знижкою: ${formatValue(before.discountPrice)} → ${formatValue(after.discountPrice)}`
    );
  }

  if ((before.description || '') !== (after.description || '')) {
    details.push('Опис оновлено');
  }

  if (before.type !== after.type) {
    details.push(
      `Місце встановлення: ${before.type === 'street' ? 'вулиця' : 'квартира'} → ${
        after.type === 'street' ? 'вулиця' : 'квартира'
      }`
    );
  }

  if (before.doorType !== after.doorType) {
    details.push(
      `Тип дверей: ${before.doorType === 'entrance' ? 'вхідні' : 'міжкімнатні'} → ${
        after.doorType === 'entrance' ? 'вхідні' : 'міжкімнатні'
      }`
    );
  }

  const beforeStyles = normalizeStringArray(before.styles || []);
  const afterStyles = normalizeStringArray(after.styles || []);

  if (JSON.stringify(beforeStyles) !== JSON.stringify(afterStyles)) {
    details.push(
      `Стилі: ${beforeStyles.length ? beforeStyles.join(', ') : 'не вказано'} → ${
        afterStyles.length ? afterStyles.join(', ') : 'не вказано'
      }`
    );
  }

  const beforeImages = (before.images || []).filter(Boolean);
  const afterImages = (after.images || []).filter(Boolean);

  if (JSON.stringify(beforeImages) !== JSON.stringify(afterImages)) {
    details.push('Фото оновлено');
  }

  const beforeSizeStocks = normalizeSizeStocksForDiff(before.sizeStocks || []);
  const afterSizeStocks = normalizeSizeStocksForDiff(after.sizeStocks || []);

  if (JSON.stringify(beforeSizeStocks) !== JSON.stringify(afterSizeStocks)) {
    details.push('Розміри та кількість відкривань оновлено');
  }

  if (before.isHit !== after.isHit) {
    details.push(`Позначка ХІТ: ${before.isHit ? 'так' : 'ні'} → ${after.isHit ? 'так' : 'ні'}`);
  }

  const beforeCharacteristics = normalizeCharacteristicsForDiff(before.characteristics || []);
  const afterCharacteristics = normalizeCharacteristicsForDiff(after.characteristics || []);

  if (JSON.stringify(beforeCharacteristics) !== JSON.stringify(afterCharacteristics)) {
    details.push('Характеристики оновлено');
  }

  return details.length > 0 ? details : ['Без помітних змін'];
}

function unauthorizedResponse() {
  return NextResponse.json({ message: 'Потрібна авторизація.' }, { status: 401 });
}

function revalidateProductsCache(productId?: string) {
  revalidateTag('products', 'max');
  revalidatePath('/catalog');
  revalidatePath('/admin');

  if (productId) {
    revalidatePath(`/catalog/${productId}`);
  }
}

async function createAuditLog(params: {
  action: AuditAction;
  productSlug: string | null;
  productTitle: string;
  actorName?: string | null;
  actorEmail?: string | null;
  actorRole?: string | null;
  details?: string[];
}) {
  await sql`
    INSERT INTO product_audit_logs (
      action,
      product_slug,
      product_title,
      actor_name,
      actor_email,
      actor_role,
      details
    )
    VALUES (
      ${params.action},
      ${params.productSlug},
      ${params.productTitle},
      ${params.actorName ?? null},
      ${params.actorEmail ?? null},
      ${params.actorRole ?? null},
      ${params.details ?? []}
    )
  `;
}

function uniqueStrings<T extends string>(values: T[]) {
  return [...new Set(values)];
}

function isValidImagePath(value: string) {
  if (!value) return false;

  const normalized = value.trim();
  const isLocalPath = /^\/[\w\-./%]+$/i.test(normalized);
  const isRemoteUrl = /^https?:\/\/[^\s/$.?#].[^\s]*$/i.test(normalized);

  return isLocalPath || isRemoteUrl;
}

function getStringField(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === 'string' ? value.trim() : '';
}

function getFileField(formData: FormData, name: string) {
  const value = formData.get(name);

  if (!(value instanceof File)) {
    return null;
  }

  if (value.size <= 0) {
    return null;
  }

  return value;
}

function parseJsonField<T>(value: FormDataEntryValue | null, fallback: T): T {
  if (typeof value !== 'string' || !value.trim()) {
    return fallback;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function validateImageFile(
  file: File | null,
  field: 'imageFront' | 'imageBack'
): ValidationErrors | null {
  if (!file) return null;

  if (!file.type.startsWith('image/')) {
    return {
      [field]: 'Оберіть файл зображення.',
    };
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return {
      [field]: 'Фото повинно бути менше 5 МБ.',
    };
  }

  return null;
}

function normalizeOpenings(value: unknown): ProductOpening[] {
  if (!Array.isArray(value)) return [];

  return uniqueStrings(
    value
      .map((item) => String(item).trim())
      .filter(
        (item): item is ProductOpening =>
          OPENING_OPTIONS.includes(item as ProductOpening)
      )
  );
}

function normalizeSizes(value: unknown): ProductSize[] {
  if (!Array.isArray(value)) return [];

  return uniqueStrings(
    value
      .map((item) => String(item).trim())
      .filter(
        (item): item is ProductSize =>
          SIZE_OPTIONS.includes(item as ProductSize)
      )
  );
}

function normalizeSizeStocks(
  value: unknown,
  openingsFallback: ProductOpening[] = []
): ProductSizeStock[] {
  if (!Array.isArray(value)) return [];

  const normalized = value
    .map((item) => {
      if (!item || typeof item !== 'object') return null;

      const typed = item as Partial<ProductSizeStock>;
      const size = typed.size;

      const isValidSize =
        size === '850x2040' || size === '950x2040' || size === '1200x2040';

      if (!isValidSize) return null;

      const rawLeft = Number(typed.leftStock);
      const rawRight = Number(typed.rightStock);
      const rawStock = Number(typed.stock);

      const hasLeft = Number.isFinite(rawLeft);
      const hasRight = Number.isFinite(rawRight);
      const hasLegacyStock = Number.isFinite(rawStock);

      let leftStock = hasLeft ? Math.max(0, Math.round(rawLeft)) : 0;
      let rightStock = hasRight ? Math.max(0, Math.round(rawRight)) : 0;

      if (!hasLeft && !hasRight && hasLegacyStock) {
        const legacyStock = Math.max(0, Math.round(rawStock));

        if (
          openingsFallback.includes('left') &&
          !openingsFallback.includes('right')
        ) {
          leftStock = legacyStock;
          rightStock = 0;
        } else {
          leftStock = 0;
          rightStock = legacyStock;
        }
      }

      return {
        size,
        leftStock,
        rightStock,
        stock: leftStock + rightStock,
      };
    })
    .filter(Boolean) as ProductSizeStock[];

  const merged = new Map<
    ProductSize,
    { leftStock: number; rightStock: number }
  >();

  normalized.forEach((item) => {
    const current = merged.get(item.size) || { leftStock: 0, rightStock: 0 };

    merged.set(item.size, {
      leftStock: current.leftStock + Math.max(0, item.leftStock ?? 0),
      rightStock: current.rightStock + Math.max(0, item.rightStock ?? 0),
    });
  });

  return Array.from(merged.entries()).map(([size, stocks]) => ({
    size,
    leftStock: stocks.leftStock,
    rightStock: stocks.rightStock,
    stock: stocks.leftStock + stocks.rightStock,
  }));
}

function normalizeCharacteristics(value: unknown): ProductCharacteristic[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      const typed = item as Partial<ProductCharacteristic>;
      const label = String(typed.label || '').trim();
      const fieldValue = String(typed.value || '').trim();

      if (!label || !fieldValue) return null;

      return {
        label,
        value: fieldValue,
      };
    })
    .filter(Boolean) as ProductCharacteristic[];
}

function buildBodyFromFormData(formData: FormData): ParsedMultipartPayload {
  const imageFrontFile = getFileField(formData, 'imageFrontFile');
  const imageBackFile = getFileField(formData, 'imageBackFile');

  return {
    imageFrontFile,
    imageBackFile,
    body: {
      id: getStringField(formData, 'id'),
      title: getStringField(formData, 'title'),
      price: getStringField(formData, 'price'),
      discountPrice: getStringField(formData, 'discountPrice'),
      description: getStringField(formData, 'description'),
      type: getStringField(formData, 'type'),
      doorType: getStringField(formData, 'doorType'),
      isHit: getStringField(formData, 'isHit') === 'true',
      styles: parseJsonField<string[]>(formData.get('styles'), []),
      openings: parseJsonField<ProductOpening[]>(formData.get('openings'), []),
      sizes: parseJsonField<ProductSize[]>(formData.get('sizes'), []),
      sizeStocks: parseJsonField<ProductSizeStock[]>(formData.get('sizeStocks'), []),
      stock: getStringField(formData, 'stock'),
      characteristics: parseJsonField<ProductCharacteristic[]>(
        formData.get('characteristics'),
        []
      ),
      imageFront: getStringField(formData, 'existingImageFront'),
      imageBack: getStringField(formData, 'existingImageBack'),
    },
  };
}

function validateAndNormalizeProduct(
  body: Record<string, unknown>,
  options?: {
    requireFrontImage?: boolean;
  }
):
  | { success: true; data: Omit<Parameters<typeof createProduct>[0], never> }
  | { success: false; errors: ValidationErrors } {
  const errors: ValidationErrors = {};

  const title = String(body.title || '').trim();
  const priceRaw = body.price;
  const price = Number(priceRaw);

  const discountPriceRaw = body.discountPrice;
  const parsedDiscountPrice = Number(discountPriceRaw);
  const discountPrice =
    discountPriceRaw === '' ||
    discountPriceRaw === null ||
    discountPriceRaw === undefined
      ? null
      : parsedDiscountPrice;

  const description = String(body.description || '').trim();
  const type: ProductType = body.type === 'street' ? 'street' : 'apartment';

  const doorType =
    body.doorType === 'interior' || body.doorType === 'entrance'
      ? body.doorType
      : undefined;

  const styles = Array.isArray(body.styles)
    ? uniqueStrings(body.styles.map((item) => String(item).trim()).filter(Boolean))
    : [];

  const openings = normalizeOpenings(body.openings);
  const sizeStocks = normalizeSizeStocks(body.sizeStocks, openings);
  const sizes =
    sizeStocks.length > 0
      ? uniqueStrings(sizeStocks.map((item) => item.size))
      : normalizeSizes(body.sizes);

  const stock =
    sizeStocks.length > 0
      ? sizeStocks.reduce(
          (sum, item) =>
            sum +
            Math.max(0, Number(item.leftStock) || 0) +
            Math.max(0, Number(item.rightStock) || 0),
          0
        )
      : Math.max(0, Math.round(Number(body.stock) || 0));

  const characteristics = normalizeCharacteristics(body.characteristics);

  const imageFront = String(body.imageFront || '').trim();
  const imageBack = String(body.imageBack || '').trim();
  const images = [imageFront, imageBack].filter(Boolean);

  if (!title) {
    errors.title = 'Вкажіть назву товару.';
  } else if (title.length < 5) {
    errors.title = 'Назва має містити щонайменше 5 символів.';
  } else if (title.length > 120) {
    errors.title = 'Назва не повинна перевищувати 120 символів.';
  }

  if (priceRaw === '' || priceRaw === null || priceRaw === undefined) {
    errors.price = 'Вкажіть основну ціну.';
  } else if (!Number.isFinite(price)) {
    errors.price = 'Основна ціна повинна бути числом.';
  } else if (price <= 0) {
    errors.price = 'Основна ціна повинна бути більшою за 0.';
  } else if (price > 9999999) {
    errors.price = 'Основна ціна занадто велика.';
  }

  if (
    discountPriceRaw !== '' &&
    discountPriceRaw !== null &&
    discountPriceRaw !== undefined
  ) {
    if (!Number.isFinite(discountPrice)) {
      errors.discountPrice = 'Ціна зі знижкою повинна бути числом.';
    } else if ((discountPrice ?? 0) <= 0) {
      errors.discountPrice = 'Ціна зі знижкою повинна бути більшою за 0.';
    } else if (Number.isFinite(price) && (discountPrice ?? 0) >= price) {
      errors.discountPrice =
        'Ціна зі знижкою повинна бути меншою за основну ціну.';
    }
  }

  if (options?.requireFrontImage && !imageFront) {
    errors.imageFront = 'Перше фото є обов’язковим.';
  } else if (imageFront && !isValidImagePath(imageFront)) {
    errors.imageFront = 'Некоректний шлях або URL першого фото.';
  }

  if (imageBack && !isValidImagePath(imageBack)) {
    errors.imageBack = 'Некоректний шлях або URL другого фото.';
  }

  if (images.length === 0) {
    errors.images = 'Додайте хоча б одне фото.';
  }

  if (body.type !== 'street' && body.type !== 'apartment') {
    errors.type = 'Оберіть коректне місце встановлення.';
  }

  if (
    body.doorType !== undefined &&
    body.doorType !== 'interior' &&
    body.doorType !== 'entrance'
  ) {
    errors.doorType = 'Оберіть коректний тип дверей.';
  }

  const invalidStyles = styles.filter(
    (style) => !STYLE_OPTIONS.includes(style as (typeof STYLE_OPTIONS)[number])
  );

  if (invalidStyles.length > 0) {
    errors.styles = 'Обрано некоректний стиль.';
  }

  const rawOpenings = Array.isArray(body.openings)
    ? body.openings.map((item) => String(item).trim()).filter(Boolean)
    : [];
  const invalidOpenings = rawOpenings.filter(
    (item) => !OPENING_OPTIONS.includes(item as ProductOpening)
  );

  if (invalidOpenings.length > 0) {
    errors.openings = 'Обрано некоректне відкривання.';
  }

  const hasInvalidSizeStocks =
    Array.isArray(body.sizeStocks) &&
    body.sizeStocks.some((item) => {
      if (!item || typeof item !== 'object') return true;

      const typed = item as Partial<ProductSizeStock>;
      const size = typed.size;
      const rawLeft = Number(typed.leftStock);
      const rawRight = Number(typed.rightStock);
      const rawStock = Number(typed.stock);

      const isValidSize =
        size === '850x2040' || size === '950x2040' || size === '1200x2040';

      const hasLeft = typed.leftStock !== undefined && typed.leftStock !== null;
      const hasRight = typed.rightStock !== undefined && typed.rightStock !== null;
      const hasLegacyStock = typed.stock !== undefined && typed.stock !== null;

      const invalidLeft = hasLeft && (!Number.isFinite(rawLeft) || rawLeft < 0);
      const invalidRight = hasRight && (!Number.isFinite(rawRight) || rawRight < 0);
      const invalidLegacy = hasLegacyStock && (!Number.isFinite(rawStock) || rawStock < 0);

      return !isValidSize || invalidLeft || invalidRight || invalidLegacy;
    });

  if (hasInvalidSizeStocks) {
    errors.sizeStocks =
      'Для кожного вибраного розміру вкажіть коректну кількість лівих і правих дверей.';
  }

  if (description.length > 1000) {
    errors.description = 'Опис не повинен перевищувати 1000 символів.';
  }

  const invalidCharacteristics = characteristics.filter(
    (item) =>
      !CHARACTERISTIC_LABELS.includes(
        item.label as (typeof CHARACTERISTIC_LABELS)[number]
      ) || item.value.length > 200
  );

  if (invalidCharacteristics.length > 0) {
    errors.characteristics =
      'Характеристики містять некоректні назви або занадто довгі значення.';
  }

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  return {
    success: true,
    data: {
      id: String(body.id || '').trim() || undefined,
      title,
      price: Math.round(price),
      discountPrice:
        discountPrice !== null && discountPrice < price
          ? Math.round(discountPrice)
          : null,
      image: imageFront,
      images,
      description,
      type,
      doorType,
      styles,
      openings,
      sizes,
      sizeStocks,
      stock,
      isHit: Boolean(body.isHit),
      characteristics,
    },
  };
}

async function getStoredProductImageRecords(slug: string) {
  const rows = (await sql`
    SELECT
      p.id AS product_db_id,
      pi.image_url,
      pi.image_path AS image_file_id,
      pi.sort_order
    FROM products p
    LEFT JOIN product_images pi
      ON pi.product_id = p.id
    WHERE p.slug = ${slug}
    ORDER BY pi.sort_order ASC, pi.id ASC
  `) as StoredProductImageRecord[];

  const productDbId = rows[0]?.product_db_id ?? null;

  const images = rows
    .filter((row) => Boolean(row.image_url))
    .map((row) => ({
      imageUrl: row.image_url,
      fileId: row.image_file_id,
      sortOrder: row.sort_order,
    }));

  return {
    productDbId,
    images,
  };
}

async function setStoredProductImageFileIds(
  productDbId: number,
  fileIdsBySortOrder: Array<string | null>
) {
  await sql`
    UPDATE product_images
    SET image_path = NULL
    WHERE product_id = ${productDbId}
  `;

  for (let sortOrder = 0; sortOrder < fileIdsBySortOrder.length; sortOrder += 1) {
    const fileId = fileIdsBySortOrder[sortOrder] ?? null;

    await sql`
      UPDATE product_images
      SET image_path = ${fileId}
      WHERE product_id = ${productDbId}
        AND sort_order = ${sortOrder}
    `;
  }
}

export async function GET() {
  const products = await getProducts();
  return NextResponse.json({ products });
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user) {
    return unauthorizedResponse();
  }

  const formData = await request.formData();
  const parsed = buildBodyFromFormData(formData);

  const frontFileError = validateImageFile(parsed.imageFrontFile, 'imageFront');
  const backFileError = validateImageFile(parsed.imageBackFile, 'imageBack');

  if (frontFileError || backFileError) {
    return NextResponse.json(
      {
        message: 'Перевірте правильність вибраних фото.',
        errors: {
          ...(frontFileError || {}),
          ...(backFileError || {}),
        },
      },
      { status: 400 }
    );
  }

  let uploadedFront: { url: string; fileId: string } | null = null;
  let uploadedBack: { url: string; fileId: string } | null = null;

  try {
    let imageFront = String(parsed.body.imageFront || '').trim();
    let imageBack = String(parsed.body.imageBack || '').trim();

    if (parsed.imageFrontFile) {
      uploadedFront = await uploadProductImage(
        parsed.imageFrontFile,
        String(parsed.body.title || 'product'),
        'front'
      );
      imageFront = uploadedFront.url;
    }

    if (parsed.imageBackFile) {
      uploadedBack = await uploadProductImage(
        parsed.imageBackFile,
        String(parsed.body.title || 'product'),
        'back'
      );
      imageBack = uploadedBack.url;
    }

    const validated = validateAndNormalizeProduct(
      {
        ...parsed.body,
        imageFront,
        imageBack,
      },
      {
        requireFrontImage: true,
      }
    );

    if (!validated.success) {
      await Promise.all([
        deleteImageKitFile(uploadedFront?.fileId),
        deleteImageKitFile(uploadedBack?.fileId),
      ]);

      return NextResponse.json(
        {
          message: 'Перевірте правильність заповнення форми.',
          errors: validated.errors,
        },
        { status: 400 }
      );
    }

    const product = await createProduct(validated.data);

    const stored = await getStoredProductImageRecords(product.id);

    if (stored.productDbId) {
      await setStoredProductImageFileIds(stored.productDbId, [
        uploadedFront?.fileId ?? null,
        uploadedBack?.fileId ?? null,
      ]);
    }

    await createAuditLog({
  action: 'created',
  productSlug: product.id,
  productTitle: product.title,
  actorName: session.user.name ?? null,
  actorEmail: session.user.email ?? null,
  actorRole:
    typeof session.user.role === 'string' ? session.user.role : null,
  details: ['Створено новий товар'],
});

    revalidateProductsCache(product.id);

    return NextResponse.json({ ok: true, product });
  } catch (error) {
    await Promise.all([
      deleteImageKitFile(uploadedFront?.fileId),
      deleteImageKitFile(uploadedBack?.fileId),
    ]);

    console.error('Failed to create product:', error);

    return NextResponse.json(
      {
        message: 'Сталася помилка під час створення товару.',
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  const session = await auth();

  if (!session?.user) {
    return unauthorizedResponse();
  }

  const formData = await request.formData();
  const parsed = buildBodyFromFormData(formData);
  const id = String(parsed.body.id || '').trim();

  if (!id) {
    return NextResponse.json(
      {
        message: 'Не передано ID товару.',
        errors: { general: 'Не передано ID товару.' },
      },
      { status: 400 }
    );
  }

  const currentProduct = await getProductById(id);

  if (!currentProduct) {
    return NextResponse.json(
      {
        message: 'Товар не знайдено.',
        errors: { general: 'Товар не знайдено.' },
      },
      { status: 404 }
    );
  }

  const storedBeforeUpdate = await getStoredProductImageRecords(id);
  const currentFrontStored = storedBeforeUpdate.images.find((item) => item.sortOrder === 0);
  const currentBackStored = storedBeforeUpdate.images.find((item) => item.sortOrder === 1);

  const frontFileError = validateImageFile(parsed.imageFrontFile, 'imageFront');
  const backFileError = validateImageFile(parsed.imageBackFile, 'imageBack');

  if (frontFileError || backFileError) {
    return NextResponse.json(
      {
        message: 'Перевірте правильність вибраних фото.',
        errors: {
          ...(frontFileError || {}),
          ...(backFileError || {}),
        },
      },
      { status: 400 }
    );
  }

  let uploadedFront: { url: string; fileId: string } | null = null;
  let uploadedBack: { url: string; fileId: string } | null = null;

  try {
    const currentImages = Array.isArray(currentProduct.images)
      ? currentProduct.images
      : currentProduct.image
        ? [currentProduct.image]
        : [];

    let imageFront =
      String(parsed.body.imageFront || '').trim() || currentImages[0] || '';
    let imageBack =
      String(parsed.body.imageBack || '').trim() || currentImages[1] || '';

    if (parsed.imageFrontFile) {
      uploadedFront = await uploadProductImage(
        parsed.imageFrontFile,
        String(parsed.body.title || currentProduct.title || 'product'),
        'front'
      );
      imageFront = uploadedFront.url;
    }

    if (parsed.imageBackFile) {
      uploadedBack = await uploadProductImage(
        parsed.imageBackFile,
        String(parsed.body.title || currentProduct.title || 'product'),
        'back'
      );
      imageBack = uploadedBack.url;
    }

    const validated = validateAndNormalizeProduct(
      {
        ...parsed.body,
        imageFront,
        imageBack,
      },
      {
        requireFrontImage: true,
      }
    );

    if (!validated.success) {
      await Promise.all([
        deleteImageKitFile(uploadedFront?.fileId),
        deleteImageKitFile(uploadedBack?.fileId),
      ]);

      return NextResponse.json(
        {
          message: 'Перевірте правильність заповнення форми.',
          errors: validated.errors,
        },
        { status: 400 }
      );
    }

    const updatedProduct = await updateProduct(id, validated.data);

    if (!updatedProduct) {
      await Promise.all([
        deleteImageKitFile(uploadedFront?.fileId),
        deleteImageKitFile(uploadedBack?.fileId),
      ]);

      return NextResponse.json(
        {
          message: 'Товар не знайдено.',
          errors: { general: 'Товар не знайдено.' },
        },
        { status: 404 }
      );
    }

    const nextFrontFileId =
      uploadedFront?.fileId ??
      (imageFront && imageFront === currentFrontStored?.imageUrl
        ? currentFrontStored?.fileId ?? null
        : null);

    const nextBackFileId =
      uploadedBack?.fileId ??
      (imageBack && imageBack === currentBackStored?.imageUrl
        ? currentBackStored?.fileId ?? null
        : null);

    const storedAfterUpdate = await getStoredProductImageRecords(id);

    if (storedAfterUpdate.productDbId) {
      await setStoredProductImageFileIds(storedAfterUpdate.productDbId, [
        nextFrontFileId,
        nextBackFileId,
      ]);
    }

    const oldManagedFileIds = uniqueStrings(
      storedBeforeUpdate.images
        .map((item) => item.fileId)
        .filter((item): item is string => Boolean(item))
    );

    const nextManagedFileIds = uniqueStrings(
      [nextFrontFileId, nextBackFileId].filter(
        (item): item is string => Boolean(item)
      )
    );

    const removedFileIds = oldManagedFileIds.filter(
      (fileId) => !nextManagedFileIds.includes(fileId)
    );

    await Promise.all(removedFileIds.map((fileId) => deleteImageKitFile(fileId)));

    await createAuditLog({
  action: 'updated',
  productSlug: updatedProduct.id,
  productTitle: updatedProduct.title,
  actorName: session.user.name ?? null,
  actorEmail: session.user.email ?? null,
  actorRole:
    typeof session.user.role === 'string' ? session.user.role : null,
  details: buildUpdateDetails(currentProduct, updatedProduct),
});

    revalidateProductsCache(id);

    return NextResponse.json({ ok: true, product: updatedProduct });
  } catch (error) {
    await Promise.all([
      deleteImageKitFile(uploadedFront?.fileId),
      deleteImageKitFile(uploadedBack?.fileId),
    ]);

    console.error('Failed to update product:', error);

    return NextResponse.json(
      {
        message: 'Сталася помилка під час оновлення товару.',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const session = await auth();

  if (!session?.user) {
    return unauthorizedResponse();
  }

  const body = await request.json();
  const id = String(body.id || '').trim();

  if (!id) {
    return NextResponse.json(
      { message: 'Не передано ID товару.' },
      { status: 400 }
    );
  }

  try {
    const currentProduct = await getProductById(id);

    if (!currentProduct) {
      return NextResponse.json(
        { message: 'Товар не знайдено.' },
        { status: 404 }
      );
    }

    const storedImages = await getStoredProductImageRecords(id);

    const deleted = await deleteProduct(id);

    if (!deleted) {
      return NextResponse.json(
        { message: 'Товар не знайдено.' },
        { status: 404 }
      );
    }

    const fileIdsToDelete = uniqueStrings(
      storedImages.images
        .map((item) => item.fileId)
        .filter((item): item is string => Boolean(item))
    );

    await Promise.all(fileIdsToDelete.map((fileId) => deleteImageKitFile(fileId)));

    await createAuditLog({
  action: 'deleted',
  productSlug: currentProduct.id,
  productTitle: currentProduct.title,
  actorName: session.user.name ?? null,
  actorEmail: session.user.email ?? null,
  actorRole:
    typeof session.user.role === 'string' ? session.user.role : null,
  details: ['Товар видалено'],
});

    revalidateProductsCache(id);

    return NextResponse.json({ ok: true, deletedId: id });
  } catch (error) {
    console.error('Failed to delete product:', error);

    return NextResponse.json(
      { message: 'Сталася помилка під час видалення товару.' },
      { status: 500 }
    );
  }
}