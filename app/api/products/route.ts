import { auth } from '@/auth';
import { getProducts, saveProducts, type Product } from '@/lib/products';
import { NextResponse } from 'next/server';

function parseCharacteristics(text: string) {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [label, ...rest] = line.split(':');

      return {
        label: (label || '').trim(),
        value: rest.join(':').trim(),
      };
    })
    .filter((item) => item.label && item.value);
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/["']/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9а-яіїєґ-]/gi, '')
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

export async function GET() {
  const products = await getProducts();
  return NextResponse.json({ products });
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();

  const title = String(body.title || '').trim();
  const price = Number(body.price || 0);
  const image = String(body.image || '').trim();
  const description = String(body.description || '').trim();
  const type = body.type === 'street' ? 'street' : 'apartment';
  const styles = Array.isArray(body.styles)
    ? body.styles.map((item: unknown) => String(item).trim()).filter(Boolean)
    : [];
  const stock = Number(body.stock || 0);
  const isHit = Boolean(body.isHit);
  const characteristicsText = String(body.characteristicsText || '').trim();

  if (!title || !price || !image) {
    return NextResponse.json(
      { message: 'Заповни хоча б назву, ціну і картинку.' },
      { status: 400 }
    );
  }

  const products = await getProducts();
  const id = createUniqueId(
    title,
    products.map((item) => item.id)
  );

  const newProduct: Product = {
    id,
    title,
    price,
    image,
    description,
    type,
    styles,
    stock,
    isHit,
    characteristics: parseCharacteristics(characteristicsText),
  };

  products.unshift(newProduct);
  await saveProducts(products);

  return NextResponse.json({ ok: true, product: newProduct });
}