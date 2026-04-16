import { auth } from '@/auth';
import {
  getProducts,
  saveProducts,
  type Product,
  type ProductDoorType,
  type ProductOpening,
  type ProductSize,
} from '@/lib/products';
import { revalidatePath, revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';

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

// const DOOR_TYPE_OPTIONS = ['interior', 'entrance'] as const;
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
] as const;

type ProductType = 'street' | 'apartment';

type ValidationErrors = Partial<{
  title: string;
  price: string;
  imageFront: string;
  imageBack: string;
  images: string;
  type: string;
  doorType: string;
  styles: string;
  openings: string;
  sizes: string;
  stock: string;
  description: string;
  characteristics: string;
  general: string;
}>;

type NormalizedPayload = {
  id?: string;
  title: string;
  price: number;
  images: string[];
  imageFront: string;
  imageBack: string;
  description: string;
  type: ProductType;
  doorType: ProductDoorType;
  styles: string[];
  openings: ProductOpening[];
  sizes: ProductSize[];
  stock: number;
  isHit: boolean;
  characteristics: { label: string; value: string }[];
};

function transliterate(value: string) {
  const map: Record<string, string> = {
    а: 'a',
    б: 'b',
    в: 'v',
    г: 'h',
    ґ: 'g',
    д: 'd',
    е: 'e',
    є: 'ye',
    ж: 'zh',
    з: 'z',
    и: 'y',
    і: 'i',
    ї: 'yi',
    й: 'y',
    к: 'k',
    л: 'l',
    м: 'm',
    н: 'n',
    о: 'o',
    п: 'p',
    р: 'r',
    с: 's',
    т: 't',
    у: 'u',
    ф: 'f',
    х: 'kh',
    ц: 'ts',
    ч: 'ch',
    ш: 'sh',
    щ: 'shch',
    ь: '',
    ю: 'yu',
    я: 'ya',
    "'": '',
    '’': '',
    '`': '',
    '"': '',
  };

  return value
    .split('')
    .map((char) => {
      const lower = char.toLowerCase();
      return map[lower] ?? lower;
    })
    .join('');
}

function slugify(value: string) {
  return transliterate(value)
    .toLowerCase()
    .trim()
    .replace(/&/g, ' and ')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function createUniqueId(title: string, existingIds: string[]) {
  const base = slugify(title) || 'product';
  let candidate = base;
  let counter = 2;

  while (existingIds.includes(candidate)) {
    candidate = `${base}-${counter}`;
    counter += 1;
  }

  return candidate;
}

function isValidImagePath(value: string) {
  if (!value) return false;

  const normalized = value.trim();

  const isLocalPath = /^\/[\w\-./%]+$/i.test(normalized);
  const isRemoteUrl = /^https?:\/\/[^\s/$.?#].[^\s]*$/i.test(normalized);

  return isLocalPath || isRemoteUrl;
}

function uniqueStrings(values: string[]) {
  return [...new Set(values)];
}

function normalizeStyles(styles: unknown) {
  if (!Array.isArray(styles)) return [];

  return uniqueStrings(
    styles.map((item) => String(item).trim()).filter(Boolean)
  );
}

function normalizeDoorType(
  value: unknown,
  title: string,
  type: ProductType
): ProductDoorType {
  if (value === 'interior' || value === 'entrance') {
    return value;
  }

  const normalizedTitle = title.trim().toLowerCase();

  if (normalizedTitle.includes('міжкімнат')) {
    return 'interior';
  }

  if (normalizedTitle.includes('вхідн')) {
    return 'entrance';
  }

  return type === 'street' ? 'entrance' : 'interior';
}

function normalizeOpenings(value: unknown): ProductOpening[] {
  if (!Array.isArray(value)) return [];

  return uniqueStrings(
    value
      .map((item) => String(item).trim())
      .filter((item): item is ProductOpening =>
        OPENING_OPTIONS.includes(item as ProductOpening)
      )
  ) as ProductOpening[];
}

function normalizeSizes(value: unknown): ProductSize[] {
  if (!Array.isArray(value)) return [];

  return uniqueStrings(
    value
      .map((item) => String(item).trim())
      .filter((item): item is ProductSize =>
        SIZE_OPTIONS.includes(item as ProductSize)
      )
  ) as ProductSize[];
}

function normalizeCharacteristics(characteristics: unknown) {
  if (!Array.isArray(characteristics)) return [];

  return characteristics
    .map((item) => {
      const typed = item as { label?: unknown; value?: unknown };

      return {
        label: String(typed.label || '').trim(),
        value: String(typed.value || '').trim(),
      };
    })
    .filter((item) => item.label && item.value);
}

function normalizeImages(body: Record<string, unknown>) {
  const directImages = Array.isArray(body.images)
    ? body.images.map((item) => String(item).trim()).filter(Boolean)
    : [];

  const imageFront = String(body.imageFront || '').trim();
  const imageBack = String(body.imageBack || '').trim();
  const singleImage = String(body.image || '').trim();

  const images = directImages.length
    ? directImages
    : [imageFront, imageBack].filter(Boolean);

  const normalizedImages = uniqueStrings(images);

  if (normalizedImages.length > 0) {
    return {
      images: normalizedImages,
      imageFront: normalizedImages[0] || '',
      imageBack: normalizedImages[1] || '',
    };
  }

  if (singleImage) {
    return {
      images: [singleImage],
      imageFront: singleImage,
      imageBack: '',
    };
  }

  return {
    images: [],
    imageFront: '',
    imageBack: '',
  };
}

function validateAndNormalizeProduct(body: unknown):
  | { success: true; data: NormalizedPayload }
  | { success: false; errors: ValidationErrors } {
  const raw = (body ?? {}) as Record<string, unknown>;
  const errors: ValidationErrors = {};

  const title = String(raw.title || '').trim();
  const priceRaw = raw.price;
  const description = String(raw.description || '').trim();
  const type: ProductType = raw.type === 'street' ? 'street' : 'apartment';
  const rawDoorType = raw.doorType;
  const doorType = normalizeDoorType(rawDoorType, title, type);
  const styles = normalizeStyles(raw.styles);
  const openings = normalizeOpenings(raw.openings);
  const sizes = normalizeSizes(raw.sizes);
  const stockRaw = raw.stock;
  const isHit = Boolean(raw.isHit);
  const characteristicsRaw = normalizeCharacteristics(raw.characteristics);
  const { images, imageFront, imageBack } = normalizeImages(raw);

  if (!title) {
    errors.title = 'Вкажіть назву товару.';
  } else if (title.length < 5) {
    errors.title = 'Назва має містити щонайменше 5 символів.';
  } else if (title.length > 120) {
    errors.title = 'Назва не повинна перевищувати 120 символів.';
  }

  const price = Number(priceRaw);
  if (priceRaw === '' || priceRaw === null || priceRaw === undefined) {
    errors.price = 'Вкажіть ціну.';
  } else if (!Number.isFinite(price)) {
    errors.price = 'Ціна повинна бути числом.';
  } else if (price <= 0) {
    errors.price = 'Ціна повинна бути більшою за 0.';
  } else if (price > 9999999) {
    errors.price = 'Ціна занадто велика.';
  }

  if (!imageFront) {
    errors.imageFront = 'Перше фото є обов’язковим.';
  } else if (!isValidImagePath(imageFront)) {
    errors.imageFront = 'Некоректний шлях або URL першого фото.';
  }

  if (imageBack && !isValidImagePath(imageBack)) {
    errors.imageBack = 'Некоректний шлях або URL другого фото.';
  }

  if (images.length === 0) {
    errors.images = 'Додайте хоча б одне фото.';
  }

  if (raw.type !== 'street' && raw.type !== 'apartment') {
    errors.type = 'Некоректний тип товару.';
  }

  if (
    rawDoorType !== undefined &&
    rawDoorType !== 'interior' &&
    rawDoorType !== 'entrance'
  ) {
    errors.doorType = 'Некоректний тип дверей.';
  }

  const invalidStyles = styles.filter(
    (style) => !STYLE_OPTIONS.includes(style as (typeof STYLE_OPTIONS)[number])
  );

  if (invalidStyles.length > 0) {
    errors.styles = 'Містить некоректні стилі.';
  }

  const rawOpenings = Array.isArray(raw.openings)
    ? raw.openings.map((item) => String(item).trim()).filter(Boolean)
    : [];
  const invalidOpenings = rawOpenings.filter(
    (item) => !OPENING_OPTIONS.includes(item as ProductOpening)
  );

  if (invalidOpenings.length > 0) {
    errors.openings = 'Містить некоректне відкривання.';
  }

  const rawSizes = Array.isArray(raw.sizes)
    ? raw.sizes.map((item) => String(item).trim()).filter(Boolean)
    : [];
  const invalidSizes = rawSizes.filter(
    (item) => !SIZE_OPTIONS.includes(item as ProductSize)
  );

  if (invalidSizes.length > 0) {
    errors.sizes = 'Містить некоректний розмір.';
  }

  const stock = Number(stockRaw);
  if (stockRaw === '' || stockRaw === null || stockRaw === undefined) {
    errors.stock = 'Вкажіть кількість в наявності.';
  } else if (!Number.isFinite(stock)) {
    errors.stock = 'Кількість повинна бути числом.';
  } else if (!Number.isInteger(stock)) {
    errors.stock = 'Кількість повинна бути цілим числом.';
  } else if (stock < 0) {
    errors.stock = 'Кількість не може бути меншою за 0.';
  } else if (stock > 9999) {
    errors.stock = 'Кількість занадто велика.';
  }

  if (description.length > 1000) {
    errors.description = 'Опис не повинен перевищувати 1000 символів.';
  }

  const invalidCharacteristics = characteristicsRaw.filter(
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

  const characteristics = CHARACTERISTIC_LABELS.map((label) => {
    const found = characteristicsRaw.find((item) => item.label === label);
    return found ? { label, value: found.value } : null;
  }).filter(Boolean) as { label: string; value: string }[];

  return {
    success: true,
    data: {
      id: String(raw.id || '').trim() || undefined,
      title,
      price,
      images,
      imageFront,
      imageBack,
      description,
      type,
      doorType,
      styles,
      openings,
      sizes,
      stock,
      isHit,
      characteristics,
    },
  };
}

function unauthorizedResponse() {
  return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
}

function revalidateProductsCache(productId?: string) {
  revalidateTag('products', 'max');
  revalidatePath('/catalog');

  if (productId) {
    revalidatePath(`/catalog/${productId}`);
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

  const body = await request.json();
  const validated = validateAndNormalizeProduct(body);

  if (!validated.success) {
    return NextResponse.json(
      {
        message: 'Перевірте правильність заповнення форми.',
        errors: validated.errors,
      },
      { status: 400 }
    );
  }

  const products = await getProducts();

  const id = createUniqueId(
    validated.data.title,
    products.map((item) => item.id)
  );

  const newProduct: Product = {
    id,
    title: validated.data.title,
    price: validated.data.price,
    image: validated.data.images[0],
    images: validated.data.images,
    description: validated.data.description,
    type: validated.data.type,
    doorType: validated.data.doorType,
    styles: validated.data.styles,
    openings: validated.data.openings,
    sizes: validated.data.sizes,
    stock: validated.data.stock,
    isHit: validated.data.isHit,
    characteristics: validated.data.characteristics,
  };

  products.unshift(newProduct);
  await saveProducts(products);
  revalidateProductsCache(id);

  return NextResponse.json({ ok: true, product: newProduct });
}

export async function PATCH(request: Request) {
  const session = await auth();

  if (!session?.user) {
    return unauthorizedResponse();
  }

  const body = await request.json();
  const id = String((body as Record<string, unknown>).id || '').trim();

  if (!id) {
    return NextResponse.json(
      {
        message: 'Не передано ID товару.',
        errors: { general: 'Не передано ID товару.' },
      },
      { status: 400 }
    );
  }

  const validated = validateAndNormalizeProduct(body);

  if (!validated.success) {
    return NextResponse.json(
      {
        message: 'Перевірте правильність заповнення форми.',
        errors: validated.errors,
      },
      { status: 400 }
    );
  }

  const products = await getProducts();
  const productIndex = products.findIndex((item) => item.id === id);

  if (productIndex === -1) {
    return NextResponse.json(
      {
        message: 'Товар не знайдено.',
        errors: { general: 'Товар не знайдено.' },
      },
      { status: 404 }
    );
  }

  products[productIndex] = {
    ...products[productIndex],
    title: validated.data.title,
    price: validated.data.price,
    image: validated.data.images[0],
    images: validated.data.images,
    description: validated.data.description,
    type: validated.data.type,
    doorType: validated.data.doorType,
    styles: validated.data.styles,
    openings: validated.data.openings,
    sizes: validated.data.sizes,
    stock: validated.data.stock,
    isHit: validated.data.isHit,
    characteristics: validated.data.characteristics,
  };

  await saveProducts(products);
  revalidateProductsCache(id);

  return NextResponse.json({ ok: true, product: products[productIndex] });
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

  const products = await getProducts();
  const filteredProducts = products.filter((item) => item.id !== id);

  if (filteredProducts.length === products.length) {
    return NextResponse.json(
      { message: 'Товар не знайдено.' },
      { status: 404 }
    );
  }

  await saveProducts(filteredProducts);
  revalidateProductsCache(id);

  return NextResponse.json({ ok: true, deletedId: id });
}