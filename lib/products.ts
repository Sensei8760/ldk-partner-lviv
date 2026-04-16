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

export type Product = {
  id: string;
  title: string;
  price: number;
  image: string;
  images: string[];
  description: string;
  type: 'street' | 'apartment';
  doorType: ProductDoorType;
  styles: string[];
  openings: ProductOpening[];
  sizes: ProductSize[];
  stock: number;
  isHit: boolean;
  characteristics: ProductCharacteristic[];
};

type RawProduct = {
  id: string;
  title: string;
  price: number;
  image?: string;
  images?: string[];
  description: string;
  type: 'street' | 'apartment';
  doorType: ProductDoorType;
  styles: string[];
  openings: ProductOpening[];
  sizes: ProductSize[];
  stock: number;
  isHit: boolean;
  characteristics: ProductCharacteristic[];
};

const productsFilePath = path.join(process.cwd(), 'data', 'products.json');
const FALLBACK_PRODUCT_IMAGE = '/images/doors/door-1.jpg';

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

  return value.filter(
    (item): item is ProductOpening => item === 'left' || item === 'right'
  );
}

function normalizeSizes(value: unknown): ProductSize[] {
  if (!Array.isArray(value)) return [];

  return value.filter(
    (item): item is ProductSize =>
      item === '850x2040' || item === '950x2040' || item === '1200x2040'
  );
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
    ...raw,
    image: primaryImage,
    images: normalizedImages.length > 0 ? normalizedImages : [primaryImage],
    openings: Array.isArray(raw.openings) ? raw.openings : [],
    sizes: Array.isArray(raw.sizes) ? raw.sizes : [],
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
  const sizes = normalizeSizes(item.sizes);
  const stock = Number.isFinite(Number(item.stock)) ? Number(item.stock) : 0;
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
    stock: Number.isInteger(stock) ? stock : Math.round(stock),
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