import fs from 'node:fs/promises';
import path from 'node:path';
import { unstable_cache } from 'next/cache';

export type ProductCharacteristic = {
  label: string;
  value: string;
};

export type ProductDoorType = 'interior' | 'entrance';
export type ProductOpening = 'left' | 'right';
export type ProductSize = '850x2040' | '950x2040' | '1200x2040';

export type ProductSizeStock = {
  size: ProductSize;
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

type RawProduct = {
  id: string;
  title: string;
  price: number;
  discountPrice?: number | null;
  image?: string;
  images?: string[];
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

const productsFilePath = path.join(process.cwd(), 'data', 'products.json');
const FALLBACK_PRODUCT_IMAGE = '/images/doors/door-1.jpg';

function uniqueStrings<T extends string>(values: T[]) {
  return [...new Set(values)];
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
    value.filter(
      (item): item is ProductOpening => item === 'left' || item === 'right'
    )
  );
}

function normalizeSizes(value: unknown): ProductSize[] {
  if (!Array.isArray(value)) return [];

  return uniqueStrings(
    value.filter(
      (item): item is ProductSize =>
        item === '850x2040' || item === '950x2040' || item === '1200x2040'
    )
  );
}

function normalizeSizeStocks(value: unknown): ProductSizeStock[] {
  if (!Array.isArray(value)) return [];

  const normalized = value
    .map((item) => {
      if (!item || typeof item !== 'object') return null;

      const typed = item as Partial<ProductSizeStock>;
      const size = typed.size;
      const stockNumber = Number(typed.stock);

      const isValidSize =
        size === '850x2040' || size === '950x2040' || size === '1200x2040';

      if (!isValidSize) return null;
      if (!Number.isFinite(stockNumber)) return null;

      return {
        size,
        stock: stockNumber < 0 ? 0 : Math.round(stockNumber),
      };
    })
    .filter(Boolean) as ProductSizeStock[];

  const merged = new Map<ProductSize, number>();

  normalized.forEach((item) => {
    merged.set(item.size, (merged.get(item.size) || 0) + item.stock);
  });

  return Array.from(merged.entries()).map(([size, stock]) => ({
    size,
    stock,
  }));
}

function getTotalStockFromSizeStocks(sizeStocks: ProductSizeStock[]) {
  return sizeStocks.reduce((sum, item) => sum + item.stock, 0);
}

function normalizeImages(raw: RawProduct): Product {
  const images = Array.isArray(raw.images)
    ? raw.images.map((item) => String(item).trim()).filter(Boolean)
    : [];

  const fallbackImage = String(raw.image || '').trim();
  const normalizedImages =
    images.length > 0 ? images : fallbackImage ? [fallbackImage] : [];

  const primaryImage = normalizedImages[0] || FALLBACK_PRODUCT_IMAGE;

  return {
    id: raw.id,
    title: raw.title,
    price: raw.price,
    discountPrice: raw.discountPrice ?? null,
    image: primaryImage,
    images: normalizedImages.length > 0 ? normalizedImages : [primaryImage],
    description: raw.description,
    type: raw.type,
    doorType: raw.doorType,
    styles: raw.styles,
    openings: raw.openings,
    sizes: raw.sizes,
    sizeStocks: raw.sizeStocks,
    stock: raw.stock,
    isHit: raw.isHit,
    characteristics: raw.characteristics,
  };
}

function normalizeProduct(raw: unknown): Product | null {
  if (!raw || typeof raw !== 'object') return null;

  const item = raw as Partial<RawProduct>;

  const id = String(item.id || '').trim();
  const title = String(item.title || '').trim();
  const price = Number(item.price);
  const description = String(item.description || '').trim();
  const type = item.type === 'street' ? 'street' : 'apartment';
  const doorType = normalizeDoorType(item.doorType, title, type);
  const styles = Array.isArray(item.styles)
    ? item.styles.map((style) => String(style).trim()).filter(Boolean)
    : [];
  const openings = normalizeOpenings(item.openings);
  const rawSizes = normalizeSizes(item.sizes);
  const sizeStocks = normalizeSizeStocks(item.sizeStocks);

  const sizes =
    sizeStocks.length > 0
      ? uniqueStrings(sizeStocks.map((item) => item.size))
      : rawSizes;

  const rawStock = Number(item.stock);
  const stock =
    sizeStocks.length > 0
      ? getTotalStockFromSizeStocks(sizeStocks)
      : Number.isFinite(rawStock)
        ? Math.max(0, Math.round(rawStock))
        : 0;

  const rawDiscountPrice = item.discountPrice;
const parsedDiscountPrice = Number(rawDiscountPrice);

const discountPrice =
  rawDiscountPrice === null || rawDiscountPrice === undefined
    ? null
    : Number.isFinite(parsedDiscountPrice) &&
        parsedDiscountPrice > 0 &&
        parsedDiscountPrice < price
      ? parsedDiscountPrice
      : null;

  const isHit = Boolean(item.isHit);

  const characteristics = Array.isArray(item.characteristics)
    ? item.characteristics
        .map((characteristic) => {
          const typed = characteristic as Partial<ProductCharacteristic>;
          const label = String(typed?.label || '').trim();
          const value = String(typed?.value || '').trim();

          if (!label || !value) return null;

          return { label, value };
        })
        .filter(Boolean) as ProductCharacteristic[]
    : [];

  if (!id || !title || !Number.isFinite(price) || price < 0) {
    return null;
  }

  const normalizedRaw: RawProduct = {
    id,
    title,
    price,
    discountPrice,
    image: String(item.image || '').trim(),
    images: Array.isArray(item.images)
      ? item.images.map((img) => String(img).trim()).filter(Boolean)
      : [],
    description,
    type,
    doorType,
    styles,
    openings,
    sizes,
    sizeStocks,
    stock,
    isHit,
    characteristics,
  };

  return normalizeImages(normalizedRaw);
}

async function readProductsFile(): Promise<Product[]> {
  try {
    const file = await fs.readFile(productsFilePath, 'utf-8');
    const parsed = JSON.parse(file) as unknown;

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.map(normalizeProduct).filter(Boolean) as Product[];
  } catch (error) {
    console.error('Failed to read products:', error);
    return [];
  }
}

const getCachedProductsInternal = unstable_cache(
  async () => {
    return readProductsFile();
  },
  ['products-list'],
  {
    tags: ['products'],
    revalidate: 300,
  }
);

export function getProductTotalStock(product: Pick<Product, 'stock' | 'sizeStocks'>) {
  if (Array.isArray(product.sizeStocks) && product.sizeStocks.length > 0) {
    return getTotalStockFromSizeStocks(product.sizeStocks);
  }

  return Number.isFinite(product.stock) ? Math.max(0, Math.round(product.stock)) : 0;
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
  return readProductsFile();
}

export async function getProductsCached(): Promise<Product[]> {
  return getCachedProductsInternal();
}

export async function getProductById(id: string): Promise<Product | null> {
  const products = await getProducts();
  return products.find((item) => item.id === id) || null;
}

export async function getProductByIdCached(id: string): Promise<Product | null> {
  const products = await getProductsCached();
  return products.find((item) => item.id === id) || null;
}

export async function getAllProductIdsCached(): Promise<string[]> {
  const products = await getProductsCached();
  return products.map((item) => item.id);
}

export async function saveProducts(products: Product[]) {
  const safeProducts = Array.isArray(products) ? products : [];

  await fs.writeFile(
    productsFilePath,
    JSON.stringify(safeProducts, null, 2),
    'utf-8'
  );
}