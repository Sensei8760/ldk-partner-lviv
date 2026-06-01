import { unstable_cache } from 'next/cache';
import { sql } from './db';

export type ProductCharacteristic = {
  label: string;
  value: string;
};

export type ProductDoorType = 'interior' | 'entrance';
export type ProductOpening = 'left' | 'right';
export type ProductSize = '850x2040' | '950x2040' | '1200x2040';

export type ProductSizeStock = {
  size: ProductSize;
  leftStock?: number;
  rightStock?: number;
  stock: number;
};

export type Product = {
  id: string;
  title: string;
  price: number;
  discountPrice: number | null;
  image: string;
  images: string[];
  description: string;
  type: 'street' | 'apartment';
  doorType: ProductDoorType;
  styles: string[];
  openings: ProductOpening[];
  sizes: ProductSize[];
  sizeStocks: ProductSizeStock[];
  stock: number;
  isHit: boolean;
  characteristics: ProductCharacteristic[];
};

export type ProductUpsertInput = {
  id?: string;
  title: string;
  price: number;
  discountPrice?: number | null;
  image?: string;
  images?: string[];
  description?: string;
  type?: 'street' | 'apartment';
  doorType?: ProductDoorType;
  styles?: string[];
  openings?: ProductOpening[];
  sizes?: ProductSize[];
  sizeStocks?: ProductSizeStock[];
  stock?: number;
  isHit?: boolean;
  characteristics?: ProductCharacteristic[];
};

type ProductRow = {
  id: number;
  slug: string;
  title: string;
  price: number;
  discount_price: number | null;
  description: string;
  type: 'street' | 'apartment';
  door_type: ProductDoorType;
  sizes: string[] | null;
  styles: string[] | null;
  openings: string[] | null;
  stock_total: number;
  is_hit: boolean;
  is_active: boolean;
  created_at: string;
};

type ProductImageRow = {
  product_id: number;
  image_url: string;
  sort_order: number;
};

type ProductSizeStockRow = {
  product_id: number;
  size: ProductSize;
  left_stock: number | null;
  right_stock: number | null;
  stock: number | null;
};

type ProductCharacteristicRow = {
  product_id: number;
  label: string;
  value: string;
  sort_order: number;
};

const FALLBACK_PRODUCT_IMAGE = '/images/doors/door-1.jpg';

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

function uniqueStrings<T extends string>(values: T[]) {
  return [...new Set(values)];
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item).trim()).filter(Boolean);
}

function normalizeDoorType(
  value: unknown,
  title: string,
  type: 'street' | 'apartment'
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
      .filter(
        (item): item is ProductOpening => item === 'left' || item === 'right'
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
          item === '850x2040' || item === '950x2040' || item === '1200x2040'
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

      const stock = leftStock + rightStock;

      return {
        size,
        leftStock,
        rightStock,
        stock,
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

function getTotalStockFromSizeStocks(sizeStocks: ProductSizeStock[]) {
  return sizeStocks.reduce((sum, item) => {
    const leftStock = Math.max(0, Number(item.leftStock) || 0);
    const rightStock = Math.max(0, Number(item.rightStock) || 0);
    const stock =
      Number.isFinite(Number(item.stock)) && Number(item.stock) > 0
        ? Math.max(0, Math.round(Number(item.stock)))
        : leftStock + rightStock;

    return sum + Math.max(stock, leftStock + rightStock);
  }, 0);
}

function getOpeningsFromSizeStocks(sizeStocks: ProductSizeStock[]): ProductOpening[] {
  const hasLeft = sizeStocks.some((item) => Math.max(0, item.leftStock ?? 0) > 0);
  const hasRight = sizeStocks.some((item) => Math.max(0, item.rightStock ?? 0) > 0);

  const openings: ProductOpening[] = [];

  if (hasLeft) openings.push('left');
  if (hasRight) openings.push('right');

  return openings;
}

function normalizeCharacteristics(value: unknown): ProductCharacteristic[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      const typed = item as Partial<ProductCharacteristic>;
      const label = String(typed?.label || '').trim();
      const fieldValue = String(typed?.value || '').trim();

      if (!label || !fieldValue) return null;

      if (
        !CHARACTERISTIC_LABELS.includes(
          label as (typeof CHARACTERISTIC_LABELS)[number]
        )
      ) {
        return null;
      }

      return {
        label,
        value: fieldValue,
      };
    })
    .filter(Boolean) as ProductCharacteristic[];
}

function normalizeImages(input: {
  images?: string[];
  image?: string;
}): { image: string; images: string[] } {
  const images = Array.isArray(input.images)
    ? input.images.map((item) => String(item).trim()).filter(Boolean)
    : [];

  const fallbackImage = String(input.image || '').trim();
  const normalizedImages =
    images.length > 0 ? images : fallbackImage ? [fallbackImage] : [];

  const primaryImage = normalizedImages[0] || FALLBACK_PRODUCT_IMAGE;

  return {
    image: primaryImage,
    images: normalizedImages.length > 0 ? normalizedImages : [primaryImage],
  };
}

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

async function createUniqueId(title: string) {
  const base = slugify(title) || 'product';

  const rows = (await sql`
    SELECT slug
    FROM products
    WHERE slug = ${base}
       OR slug LIKE ${`${base}-%`}
  `) as { slug: string }[];

  const existing = new Set(rows.map((row) => row.slug));

  if (!existing.has(base)) {
    return base;
  }

  let counter = 2;

  while (existing.has(`${base}-${counter}`)) {
    counter += 1;
  }

  return `${base}-${counter}`;
}

function normalizeProductInput(input: ProductUpsertInput): Product {
  const id = String(input.id || '').trim();
  const title = String(input.title || '').trim();
  const price = Number(input.price);
  const type = input.type === 'street' ? 'street' : 'apartment';
  const doorType = normalizeDoorType(input.doorType, title, type);

  const openingsFallback = normalizeOpenings(input.openings || []);
  const rawSizes = normalizeSizes(input.sizes || []);
  const sizeStocks = normalizeSizeStocks(input.sizeStocks || [], openingsFallback);

  const sizes =
    sizeStocks.length > 0
      ? uniqueStrings(sizeStocks.map((item) => item.size))
      : rawSizes;

  const rawStock = Number(input.stock);
  const stock =
    sizeStocks.length > 0
      ? getTotalStockFromSizeStocks(sizeStocks)
      : Number.isFinite(rawStock)
        ? Math.max(0, Math.round(rawStock))
        : 0;

  const discountNumber = Number(input.discountPrice);
  const discountPrice =
    input.discountPrice === null || input.discountPrice === undefined
      ? null
      : Number.isFinite(discountNumber) &&
          discountNumber > 0 &&
          discountNumber < price
        ? discountNumber
        : null;

  const styles = uniqueStrings(
    toStringArray(input.styles || []).filter(Boolean)
  );

  const openings =
    sizeStocks.length > 0
      ? getOpeningsFromSizeStocks(sizeStocks)
      : openingsFallback;

  const characteristics = normalizeCharacteristics(input.characteristics || []);
  const images = normalizeImages({
    image: input.image,
    images: input.images,
  });

  return {
    id,
    title,
    price: Number.isFinite(price) ? Math.max(0, Math.round(price)) : 0,
    discountPrice,
    image: images.image,
    images: images.images,
    description: String(input.description || '').trim(),
    type,
    doorType,
    styles,
    openings,
    sizes,
    sizeStocks,
    stock,
    isHit: Boolean(input.isHit),
    characteristics,
  };
}

function mapRowsToProducts(
  productRows: ProductRow[],
  imageRows: ProductImageRow[],
  sizeStockRows: ProductSizeStockRow[],
  characteristicRows: ProductCharacteristicRow[]
): Product[] {
  const imagesMap = new Map<number, string[]>();
  const sizeStocksMap = new Map<number, ProductSizeStock[]>();
  const characteristicsMap = new Map<number, ProductCharacteristic[]>();

  imageRows.forEach((row) => {
    const current = imagesMap.get(row.product_id) || [];
    current.push(row.image_url);
    imagesMap.set(row.product_id, current);
  });

  sizeStockRows.forEach((row) => {
    const current = sizeStocksMap.get(row.product_id) || [];

    const leftStock = Math.max(0, Number(row.left_stock) || 0);
    const rightStock = Math.max(0, Number(row.right_stock) || 0);
    const legacyStock = Math.max(0, Number(row.stock) || 0);
    const totalStock =
      leftStock > 0 || rightStock > 0 ? leftStock + rightStock : legacyStock;

    current.push({
      size: row.size,
      leftStock,
      rightStock,
      stock: totalStock,
    });

    sizeStocksMap.set(row.product_id, current);
  });

  characteristicRows.forEach((row) => {
    const current = characteristicsMap.get(row.product_id) || [];
    current.push({
      label: row.label,
      value: row.value,
    });
    characteristicsMap.set(row.product_id, current);
  });

  return productRows.map((row) => {
    const relatedImages = imagesMap.get(row.id) || [];
    const relatedSizeStocks = sizeStocksMap.get(row.id) || [];
    const relatedCharacteristics = characteristicsMap.get(row.id) || [];

    const normalizedSizes = normalizeSizes(row.sizes || []);
    const finalSizes =
      relatedSizeStocks.length > 0
        ? uniqueStrings(relatedSizeStocks.map((item) => item.size))
        : normalizedSizes;

    const stock =
      relatedSizeStocks.length > 0
        ? getTotalStockFromSizeStocks(relatedSizeStocks)
        : Math.max(0, Number(row.stock_total) || 0);

    const normalizedImages = normalizeImages({
      images: relatedImages,
    });

    return {
      id: row.slug,
      title: row.title,
      price: Math.max(0, Number(row.price) || 0),
      discountPrice:
        row.discount_price !== null &&
        Number.isFinite(Number(row.discount_price)) &&
        Number(row.discount_price) > 0 &&
        Number(row.discount_price) < Number(row.price)
          ? Number(row.discount_price)
          : null,
      image: normalizedImages.image,
      images: normalizedImages.images,
      description: row.description || '',
      type: row.type === 'street' ? 'street' : 'apartment',
      doorType: row.door_type === 'entrance' ? 'entrance' : 'interior',
      styles: uniqueStrings(toStringArray(row.styles || [])),
      openings:
        relatedSizeStocks.length > 0
          ? getOpeningsFromSizeStocks(relatedSizeStocks)
          : normalizeOpenings(row.openings || []),
      sizes: finalSizes,
      sizeStocks: relatedSizeStocks,
      stock,
      isHit: Boolean(row.is_hit),
      characteristics: relatedCharacteristics,
    };
  });
}

async function getRelationsForProductIds(productIds: number[]) {
  if (productIds.length === 0) {
    return {
      imageRows: [] as ProductImageRow[],
      sizeStockRows: [] as ProductSizeStockRow[],
      characteristicRows: [] as ProductCharacteristicRow[],
    };
  }

  const [imageRowsRaw, sizeStockRowsRaw, characteristicRowsRaw] =
    await Promise.all([
      sql`
        SELECT product_id, image_url, sort_order
        FROM product_images
        WHERE product_id = ANY(${productIds})
        ORDER BY product_id ASC, sort_order ASC, id ASC
      `,
      sql`
        SELECT product_id, size, left_stock, right_stock, stock
        FROM product_size_stocks
        WHERE product_id = ANY(${productIds})
        ORDER BY product_id ASC, id ASC
      `,
      sql`
        SELECT product_id, label, value, sort_order
        FROM product_characteristics
        WHERE product_id = ANY(${productIds})
        ORDER BY product_id ASC, sort_order ASC, id ASC
      `,
    ]);

  const imageRows = imageRowsRaw as ProductImageRow[];
  const sizeStockRows = sizeStockRowsRaw as ProductSizeStockRow[];
  const characteristicRows =
    characteristicRowsRaw as ProductCharacteristicRow[];

  return {
    imageRows,
    sizeStockRows,
    characteristicRows,
  };
}

async function getProductsFromDatabase(): Promise<Product[]> {
  try {
    const productRows = (await sql`
      SELECT
        id,
        slug,
        title,
        price,
        discount_price,
        description,
        type,
        door_type,
        sizes,
        styles,
        openings,
        stock_total,
        is_hit,
        is_active,
        created_at
      FROM products
      WHERE is_active = TRUE
      ORDER BY created_at DESC, id DESC
    `) as ProductRow[];

    const productIds = productRows.map((row) => row.id);
    const relations = await getRelationsForProductIds(productIds);

    return mapRowsToProducts(
      productRows,
      relations.imageRows,
      relations.sizeStockRows,
      relations.characteristicRows
    );
  } catch (error) {
    console.error('[products-list-db] Error', error);
    return [];
  }
}

async function getProductBySlugFromDatabase(slug: string): Promise<Product | null> {
  try {
    const productRows = (await sql`
      SELECT
        id,
        slug,
        title,
        price,
        discount_price,
        description,
        type,
        door_type,
        sizes,
        styles,
        openings,
        stock_total,
        is_hit,
        is_active,
        created_at
      FROM products
      WHERE slug = ${slug}
        AND is_active = TRUE
      LIMIT 1
    `) as ProductRow[];

    const row = productRows[0];

    if (!row) {
      return null;
    }

    const relations = await getRelationsForProductIds([row.id]);

    const products = mapRowsToProducts(
      [row],
      relations.imageRows,
      relations.sizeStockRows,
      relations.characteristicRows
    );

    return products[0] || null;
  } catch (error) {
    console.error('[product-detail-db] Error', error);
    return null;
  }
}

const getCachedProductsInternal = unstable_cache(
  async () => {
    return getProductsFromDatabase();
  },
  ['products-list-db'],
  {
    tags: ['products'],
    revalidate: 300,
  }
);

export function getProductTotalStock(product: Pick<Product, 'stock' | 'sizeStocks'>) {
  if (Array.isArray(product.sizeStocks) && product.sizeStocks.length > 0) {
    return getTotalStockFromSizeStocks(product.sizeStocks);
  }

  return Number.isFinite(product.stock)
    ? Math.max(0, Math.round(product.stock))
    : 0;
}

export function getProductSizes(product: Pick<Product, 'sizes' | 'sizeStocks'>) {
  if (Array.isArray(product.sizeStocks) && product.sizeStocks.length > 0) {
    return uniqueStrings(product.sizeStocks.map((item) => item.size));
  }

  return Array.isArray(product.sizes) ? uniqueStrings(product.sizes) : [];
}

export function getProductDisplayPrice(
  product: Pick<Product, 'price' | 'discountPrice'>
) {
  return product.discountPrice !== null &&
    Number.isFinite(product.discountPrice) &&
    product.discountPrice > 0 &&
    product.discountPrice < product.price
    ? product.discountPrice
    : product.price;
}

export async function getProducts(): Promise<Product[]> {
  return getProductsFromDatabase();
}

export async function getProductsCached(): Promise<Product[]> {
  return getCachedProductsInternal();
}

export async function getProductById(id: string): Promise<Product | null> {
  return getProductBySlugFromDatabase(id);
}

export async function getProductByIdCached(id: string): Promise<Product | null> {
  return getProductBySlugFromDatabase(id);
}

export async function getAllProductIdsCached(): Promise<string[]> {
  const products = await getProductsCached();
  return products.map((item) => item.id);
}

async function insertChildRows(productDbId: number, product: Product) {
  for (let index = 0; index < product.images.length; index += 1) {
    await sql`
      INSERT INTO product_images (product_id, image_url, sort_order)
      VALUES (${productDbId}, ${product.images[index]}, ${index})
    `;
  }

  for (const item of product.sizeStocks) {
    const leftStock = Math.max(0, Number(item.leftStock) || 0);
    const rightStock = Math.max(0, Number(item.rightStock) || 0);
    const stock = leftStock + rightStock;

    await sql`
      INSERT INTO product_size_stocks (product_id, size, left_stock, right_stock, stock)
      VALUES (${productDbId}, ${item.size}, ${leftStock}, ${rightStock}, ${stock})
    `;
  }

  for (let index = 0; index < product.characteristics.length; index += 1) {
    const item = product.characteristics[index];

    await sql`
      INSERT INTO product_characteristics (product_id, label, value, sort_order)
      VALUES (${productDbId}, ${item.label}, ${item.value}, ${index})
    `;
  }
}

async function insertProduct(product: Product): Promise<Product> {
  const insertedRows = (await sql`
    INSERT INTO products (
      slug,
      title,
      price,
      discount_price,
      description,
      type,
      door_type,
      sizes,
      styles,
      openings,
      stock_total,
      is_hit,
      is_active
    )
    VALUES (
      ${product.id},
      ${product.title},
      ${product.price},
      ${product.discountPrice},
      ${product.description},
      ${product.type},
      ${product.doorType},
      ${product.sizes},
      ${product.styles},
      ${product.openings},
      ${product.stock},
      ${product.isHit},
      TRUE
    )
    RETURNING id
  `) as { id: number }[];

  const productDbId = insertedRows[0]?.id;

  if (!productDbId) {
    throw new Error('Failed to insert product.');
  }

  await insertChildRows(productDbId, product);

  const insertedProduct = await getProductBySlugFromDatabase(product.id);

  if (!insertedProduct) {
    throw new Error('Failed to load inserted product.');
  }

  return insertedProduct;
}

export async function createProduct(input: ProductUpsertInput): Promise<Product> {
  const normalized = normalizeProductInput(input);
  const id = normalized.id || (await createUniqueId(normalized.title));

  return insertProduct({
    ...normalized,
    id,
  });
}

export async function updateProduct(
  id: string,
  input: ProductUpsertInput
): Promise<Product | null> {
  const existingRows = (await sql`
    SELECT id
    FROM products
    WHERE slug = ${id}
    LIMIT 1
  `) as { id: number }[];

  const existing = existingRows[0];

  if (!existing) {
    return null;
  }

  const normalized = normalizeProductInput({
    ...input,
    id,
  });

  await sql`
    UPDATE products
    SET
      title = ${normalized.title},
      price = ${normalized.price},
      discount_price = ${normalized.discountPrice},
      description = ${normalized.description},
      type = ${normalized.type},
      door_type = ${normalized.doorType},
      sizes = ${normalized.sizes},
      styles = ${normalized.styles},
      openings = ${normalized.openings},
      stock_total = ${normalized.stock},
      is_hit = ${normalized.isHit}
    WHERE slug = ${id}
  `;

  await sql`DELETE FROM product_images WHERE product_id = ${existing.id}`;
  await sql`DELETE FROM product_size_stocks WHERE product_id = ${existing.id}`;
  await sql`DELETE FROM product_characteristics WHERE product_id = ${existing.id}`;

  await insertChildRows(existing.id, normalized);

  return getProductBySlugFromDatabase(id);
}

export async function deleteProduct(id: string): Promise<boolean> {
  const deletedRows = (await sql`
    DELETE FROM products
    WHERE slug = ${id}
    RETURNING id
  `) as { id: number }[];

  return deletedRows.length > 0;
}

export async function saveProducts(products: Product[]) {
  const safeProducts = Array.isArray(products) ? products : [];
  const normalized = safeProducts.map((item) => normalizeProductInput(item));

  await sql`TRUNCATE TABLE products RESTART IDENTITY CASCADE`;

  for (const product of [...normalized].reverse()) {
    await insertProduct(product);
  }
}