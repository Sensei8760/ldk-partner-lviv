import fs from 'node:fs/promises';
import path from 'node:path';

export type ProductCharacteristic = {
  label: string;
  value: string;
};

export type Product = {
  id: string;
  title: string;
  price: number;
  image: string;
  images: string[];
  description: string;
  type: 'street' | 'apartment';
  styles: string[];
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
  styles: string[];
  stock: number;
  isHit: boolean;
  characteristics: ProductCharacteristic[];
};

const productsFilePath = path.join(process.cwd(), 'data', 'products.json');

function normalizeImages(raw: RawProduct): Product {
  const images = Array.isArray(raw.images)
    ? raw.images.map((item) => String(item).trim()).filter(Boolean)
    : [];

  const fallbackImage = String(raw.image || '').trim();
  const normalizedImages =
    images.length > 0 ? images : fallbackImage ? [fallbackImage] : [];

  const primaryImage = normalizedImages[0] || '/images/doors/door-1.jpg';

  return {
    ...raw,
    image: primaryImage,
    images: normalizedImages.length > 0 ? normalizedImages : [primaryImage],
  };
}

export async function getProducts(): Promise<Product[]> {
  const file = await fs.readFile(productsFilePath, 'utf-8');
  const parsed = JSON.parse(file) as RawProduct[];
  return parsed.map(normalizeImages);
}

export async function getProductById(id: string): Promise<Product | null> {
  const products = await getProducts();
  return products.find((item) => item.id === id) || null;
}

export async function saveProducts(products: Product[]) {
  await fs.writeFile(productsFilePath, JSON.stringify(products, null, 2), 'utf-8');
}