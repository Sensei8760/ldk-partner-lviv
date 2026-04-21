import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { neon } from '@neondatabase/serverless';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('Missing DATABASE_URL in environment variables.');
}

const sql = neon(databaseUrl);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const productsJsonPath = path.join(__dirname, '..', 'data', 'products.json');

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
];

function uniqueStrings(values) {
  return [...new Set(values)];
}

function transliterate(value) {
  const map = {
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

function slugify(value) {
  return transliterate(String(value || ''))
    .toLowerCase()
    .trim()
    .replace(/&/g, ' and ')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function normalizeDoorType(value, title, type) {
  if (value === 'interior' || value === 'entrance') {
    return value;
  }

  const normalizedTitle = String(title || '').trim().toLowerCase();

  if (normalizedTitle.includes('міжкімнат')) {
    return 'interior';
  }

  if (normalizedTitle.includes('вхідн')) {
    return 'entrance';
  }

  return type === 'street' ? 'entrance' : 'interior';
}

function normalizeOpenings(value) {
  if (!Array.isArray(value)) return [];

  return uniqueStrings(
    value
      .map((item) => String(item).trim())
      .filter((item) => item === 'left' || item === 'right')
  );
}

function normalizeSizes(value) {
  if (!Array.isArray(value)) return [];

  return uniqueStrings(
    value
      .map((item) => String(item).trim())
      .filter(
        (item) =>
          item === '850x2040' || item === '950x2040' || item === '1200x2040'
      )
  );
}

function normalizeSizeStocks(value) {
  if (!Array.isArray(value)) return [];

  const normalized = value
    .map((item) => {
      if (!item || typeof item !== 'object') return null;

      const size = item.size;
      const stock = Number(item.stock);

      const isValidSize =
        size === '850x2040' || size === '950x2040' || size === '1200x2040';

      if (!isValidSize) return null;
      if (!Number.isFinite(stock)) return null;

      return {
        size,
        stock: Math.max(0, Math.round(stock)),
      };
    })
    .filter(Boolean);

  const merged = new Map();

  normalized.forEach((item) => {
    merged.set(item.size, (merged.get(item.size) || 0) + item.stock);
  });

  return Array.from(merged.entries()).map(([size, stock]) => ({
    size,
    stock,
  }));
}

function normalizeCharacteristics(value) {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      const label = String(item?.label || '').trim();
      const fieldValue = String(item?.value || '').trim();

      if (!label || !fieldValue) return null;
      if (!CHARACTERISTIC_LABELS.includes(label)) return null;

      return {
        label,
        value: fieldValue,
      };
    })
    .filter(Boolean);
}

function normalizeImages(item) {
  const images = Array.isArray(item.images)
    ? item.images.map((value) => String(value).trim()).filter(Boolean)
    : [];

  const singleImage = String(item.image || '').trim();
  const normalizedImages =
    images.length > 0 ? images : singleImage ? [singleImage] : [];

  const finalImages =
    normalizedImages.length > 0
      ? normalizedImages
      : ['/images/doors/door-1.jpg'];

  return {
    image: finalImages[0],
    images: finalImages.slice(0, 2),
  };
}

function normalizeProduct(source) {
  const title = String(source?.title || '').trim();
  const type = source?.type === 'street' ? 'street' : 'apartment';
  const doorType = normalizeDoorType(source?.doorType, title, type);
  const price = Math.max(0, Math.round(Number(source?.price) || 0));

  const rawDiscountPrice = Number(source?.discountPrice);
  const discountPrice =
    Number.isFinite(rawDiscountPrice) &&
    rawDiscountPrice > 0 &&
    rawDiscountPrice < price
      ? Math.round(rawDiscountPrice)
      : null;

  const sizeStocks = normalizeSizeStocks(source?.sizeStocks);
  const sizes =
    sizeStocks.length > 0
      ? uniqueStrings(sizeStocks.map((item) => item.size))
      : normalizeSizes(source?.sizes);

  const stock =
    sizeStocks.length > 0
      ? sizeStocks.reduce((sum, item) => sum + item.stock, 0)
      : Math.max(0, Math.round(Number(source?.stock) || 0));

  const images = normalizeImages(source);
  const slugFromId = String(source?.id || '').trim();

  return {
    slug: slugFromId || slugify(title) || `product-${Date.now()}`,
    title,
    price,
    discountPrice,
    description: String(source?.description || '').trim(),
    type,
    doorType,
    sizes,
    styles: uniqueStrings(
      Array.isArray(source?.styles)
        ? source.styles.map((item) => String(item).trim()).filter(Boolean)
        : []
    ),
    openings: normalizeOpenings(source?.openings),
    stockTotal: stock,
    isHit: Boolean(source?.isHit),
    image: images.image,
    images: images.images,
    sizeStocks,
    characteristics: normalizeCharacteristics(source?.characteristics),
  };
}

async function main() {
  const raw = await readFile(productsJsonPath, 'utf8');
  const sourceProducts = JSON.parse(raw);

  if (!Array.isArray(sourceProducts)) {
    throw new Error('products.json must contain an array.');
  }

  let importedCount = 0;

  for (const item of sourceProducts) {
    const product = normalizeProduct(item);

    if (!product.title) {
      console.warn(`Пропущено товар без назви: ${JSON.stringify(item)}`);
      continue;
    }

    if (!product.price || product.price <= 0) {
      console.warn(`Пропущено товар "${product.title}" через некоректну ціну.`);
      continue;
    }

    const upsertedRows = await sql`
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
        ${product.slug},
        ${product.title},
        ${product.price},
        ${product.discountPrice},
        ${product.description},
        ${product.type},
        ${product.doorType},
        ${product.sizes},
        ${product.styles},
        ${product.openings},
        ${product.stockTotal},
        ${product.isHit},
        TRUE
      )
      ON CONFLICT (slug)
      DO UPDATE SET
        title = EXCLUDED.title,
        price = EXCLUDED.price,
        discount_price = EXCLUDED.discount_price,
        description = EXCLUDED.description,
        type = EXCLUDED.type,
        door_type = EXCLUDED.door_type,
        sizes = EXCLUDED.sizes,
        styles = EXCLUDED.styles,
        openings = EXCLUDED.openings,
        stock_total = EXCLUDED.stock_total,
        is_hit = EXCLUDED.is_hit,
        is_active = TRUE
      RETURNING id
    `;

    const productId = upsertedRows[0]?.id;

    if (!productId) {
      throw new Error(`Не вдалося зберегти товар: ${product.title}`);
    }

    await sql`DELETE FROM product_images WHERE product_id = ${productId}`;
    await sql`DELETE FROM product_size_stocks WHERE product_id = ${productId}`;
    await sql`DELETE FROM product_characteristics WHERE product_id = ${productId}`;

    for (let index = 0; index < product.images.length; index += 1) {
      await sql`
        INSERT INTO product_images (product_id, image_url, sort_order)
        VALUES (${productId}, ${product.images[index]}, ${index})
      `;
    }

    for (const sizeStock of product.sizeStocks) {
      await sql`
        INSERT INTO product_size_stocks (product_id, size, stock)
        VALUES (${productId}, ${sizeStock.size}, ${sizeStock.stock})
      `;
    }

    for (let index = 0; index < product.characteristics.length; index += 1) {
      const characteristic = product.characteristics[index];

      await sql`
        INSERT INTO product_characteristics (product_id, label, value, sort_order)
        VALUES (
          ${productId},
          ${characteristic.label},
          ${characteristic.value},
          ${index}
        )
      `;
    }

    importedCount += 1;
    console.log(`Імпортовано: ${product.title}`);
  }

  console.log(`Готово. Імпортовано товарів: ${importedCount}`);
}

main().catch((error) => {
  console.error('Помилка імпорту:', error);
  process.exit(1);
});