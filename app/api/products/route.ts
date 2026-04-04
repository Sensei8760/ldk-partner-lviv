import { auth } from '@/auth';
import { getProducts, saveProducts, type Product } from '@/lib/products';
import { NextResponse } from 'next/server';

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

function normalizeStyles(styles: unknown) {
  if (!Array.isArray(styles)) return [];
  return styles.map((item) => String(item).trim()).filter(Boolean);
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

  if (images.length > 0) {
    return images;
  }

  return singleImage ? [singleImage] : [];
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
  const images = normalizeImages(body);
  const description = String(body.description || '').trim();
  const type = body.type === 'street' ? 'street' : 'apartment';
  const styles = normalizeStyles(body.styles);
  const stock = Number(body.stock || 0);
  const isHit = Boolean(body.isHit);
  const characteristics = normalizeCharacteristics(body.characteristics);

  if (!title || !price || images.length === 0) {
    return NextResponse.json(
      { message: 'Заповни хоча б назву, ціну і хоча б одне фото.' },
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
    image: images[0],
    images,
    description,
    type,
    styles,
    stock,
    isHit,
    characteristics,
  };

  products.unshift(newProduct);
  await saveProducts(products);

  return NextResponse.json({ ok: true, product: newProduct });
}

export async function PATCH(request: Request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
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
  const productIndex = products.findIndex((item) => item.id === id);

  if (productIndex === -1) {
    return NextResponse.json(
      { message: 'Товар не знайдено.' },
      { status: 404 }
    );
  }

  const title = String(body.title || '').trim();
  const price = Number(body.price || 0);
  const images = normalizeImages(body);
  const description = String(body.description || '').trim();
  const type = body.type === 'street' ? 'street' : 'apartment';
  const styles = normalizeStyles(body.styles);
  const stock = Number(body.stock || 0);
  const isHit = Boolean(body.isHit);
  const characteristics = normalizeCharacteristics(body.characteristics);

  if (!title || !price || images.length === 0) {
    return NextResponse.json(
      { message: 'Заповни хоча б назву, ціну і хоча б одне фото.' },
      { status: 400 }
    );
  }

  products[productIndex] = {
    ...products[productIndex],
    title,
    price,
    image: images[0],
    images,
    description,
    type,
    styles,
    stock,
    isHit,
    characteristics,
  };

  await saveProducts(products);

  return NextResponse.json({ ok: true, product: products[productIndex] });
}

export async function DELETE(request: Request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
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

  return NextResponse.json({ ok: true, deletedId: id });
}