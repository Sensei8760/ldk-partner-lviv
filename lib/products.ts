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
  description: string;
  type: 'street' | 'apartment';
  styles: string[];
  stock: number;
  isHit: boolean;
  characteristics: ProductCharacteristic[];
};

const productsFilePath = path.join(process.cwd(), 'data', 'products.json');

export async function getProducts(): Promise<Product[]> {
  const file = await fs.readFile(productsFilePath, 'utf-8');
  return JSON.parse(file) as Product[];
}

export async function getProductById(id: string): Promise<Product | null> {
  const products = await getProducts();
  return products.find((item) => item.id === id) || null;
}

export async function saveProducts(products: Product[]) {
  await fs.writeFile(productsFilePath, JSON.stringify(products, null, 2), 'utf-8');
}