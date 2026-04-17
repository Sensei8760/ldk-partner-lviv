import { notFound } from 'next/navigation';
import {
  getAllProductIdsCached,
  getProductByIdCached,
} from '@/lib/products';
import ProductGallery from './ProductGallery';
import ProductActions from './ProductActions';
import styles from './ProductPage.module.css';

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

type ProductSizeDisplayItem = {
  size: '850x2040' | '950x2040' | '1200x2040';
  stock: number | null;
};

export const revalidate = 300;

export async function generateStaticParams() {
  const ids = await getAllProductIdsCached();

  return ids.map((id) => ({
    id,
  }));
}

function getTotalStock(product: {
  stock: number;
  sizeStocks?: Array<{ size: ProductSizeDisplayItem['size']; stock: number }>;
}) {
  if (Array.isArray(product.sizeStocks) && product.sizeStocks.length > 0) {
    return product.sizeStocks.reduce(
      (sum, item) => sum + Math.max(0, Number(item.stock) || 0),
      0
    );
  }

  return Number.isFinite(product.stock) ? Math.max(0, product.stock) : 0;
}

function getDisplaySizeStocks(product: {
  sizes?: ProductSizeDisplayItem['size'][];
  sizeStocks?: Array<{ size: ProductSizeDisplayItem['size']; stock: number }>;
}): ProductSizeDisplayItem[] {
  if (Array.isArray(product.sizeStocks) && product.sizeStocks.length > 0) {
    return product.sizeStocks
      .filter(
        (item) =>
          item.size === '850x2040' ||
          item.size === '950x2040' ||
          item.size === '1200x2040'
      )
      .map((item) => ({
        size: item.size,
        stock: Math.max(0, Number(item.stock) || 0),
      }));
  }

  if (Array.isArray(product.sizes) && product.sizes.length > 0) {
    return product.sizes
      .filter(
        (size) =>
          size === '850x2040' ||
          size === '950x2040' ||
          size === '1200x2040'
      )
      .map((size) => ({
        size,
        stock: null,
      }));
  }

  return [];
}

export default async function ProductPage({ params }: PageProps) {
  const { id } = await params;
  const product = await getProductByIdCached(id);

  if (!product) {
    notFound();
  }

  const totalStock = getTotalStock(product);
  const isOutOfStock = totalStock <= 0;
  const displaySizeStocks = getDisplaySizeStocks(product);

  const hasDiscount =
    product.discountPrice !== null &&
    product.discountPrice !== undefined &&
    product.discountPrice > 0 &&
    product.discountPrice < product.price;

  const displayPrice = hasDiscount ? product.discountPrice : product.price;

  return (
    <main className={styles.productPage}>
      <div className={styles.container}>
        <div className={styles.layout}>
          <div className={styles.imageBlock}>
            <ProductGallery title={product.title} images={product.images} />
          </div>

          <div className={styles.infoBlock}>
            <h1 className={styles.title}>{product.title}</h1>

            <div className={styles.priceBlock}>
              {hasDiscount ? (
                <>
                  <p className={styles.oldPrice}>
                    {product.price} <span>грн</span>
                  </p>

                  <p className={styles.salePrice}>
                    {displayPrice} <span>грн</span>
                  </p>
                </>
              ) : (
                <p className={styles.price}>
                  {product.price} <span>грн</span>
                </p>
              )}
            </div>

            <p className={`${styles.stock} ${isOutOfStock ? styles.stockEmpty : ''}`}>
              {isOutOfStock ? (
                'Немає в наявності'
              ) : (
                <>
                  В наявності: <span>{totalStock}</span>
                </>
              )}
            </p>

            <ProductActions
              productId={product.id}
              sizeStocks={displaySizeStocks}
            />

            {product.description ? (
              <p className={styles.description}>{product.description}</p>
            ) : null}

            <div className={styles.characteristics}>
              <h2 className={styles.characteristicsTitle}>Характеристики</h2>

              {product.characteristics.length > 0 ? (
                <ul className={styles.characteristicsList}>
                  {product.characteristics.map((item) => (
                    <li
                      key={`${item.label}-${item.value}`}
                      className={styles.characteristicItem}
                    >
                      <span className={styles.characteristicLabel}>
                        {item.label}:
                      </span>{' '}
                      <span className={styles.characteristicValue}>
                        {item.value}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={styles.description}>Характеристики ще не додані.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}