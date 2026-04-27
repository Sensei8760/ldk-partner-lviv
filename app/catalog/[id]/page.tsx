import { notFound } from 'next/navigation';
import {
  getAllProductIdsCached,
  getProductByIdCached,
} from '@/lib/products';
import ProductGallery from './ProductGallery';
import ProductActions from './ProductActions';
import styles from './ProductPage.module.css';
import FavoriteButton from '@/components/ui/FavoriteButton';

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

type ProductSizeDisplayItem = {
  size: '850x2040' | '950x2040' | '1200x2040';
  leftStock: number;
  rightStock: number;
  stock: number;
};

const ALL_SIZES: ProductSizeDisplayItem['size'][] = [
  '850x2040',
  '950x2040',
  '1200x2040',
];

export const revalidate = 300;

export async function generateStaticParams() {
  const ids = await getAllProductIdsCached();

  return ids.map((id) => ({
    id,
  }));
}

function formatPrice(value: number) {
  return new Intl.NumberFormat('uk-UA').format(value);
}

function getTotalStock(product: {
  stock: number;
  sizeStocks?: Array<{
    size: ProductSizeDisplayItem['size'];
    leftStock?: number;
    rightStock?: number;
    stock: number;
  }>;
}) {
  if (Array.isArray(product.sizeStocks) && product.sizeStocks.length > 0) {
    return product.sizeStocks.reduce((sum, item) => {
      const leftStock = Math.max(0, Number(item.leftStock) || 0);
      const rightStock = Math.max(0, Number(item.rightStock) || 0);
      const total =
        leftStock > 0 || rightStock > 0
          ? leftStock + rightStock
          : Math.max(0, Number(item.stock) || 0);

      return sum + total;
    }, 0);
  }

  return Number.isFinite(product.stock) ? Math.max(0, product.stock) : 0;
}

function getDisplaySizeStocks(product: {
  sizeStocks?: Array<{
    size: ProductSizeDisplayItem['size'];
    leftStock?: number;
    rightStock?: number;
    stock: number;
  }>;
}): ProductSizeDisplayItem[] {
  return ALL_SIZES.map((size) => {
    const found = Array.isArray(product.sizeStocks)
      ? product.sizeStocks.find((item) => item.size === size)
      : null;

    const leftStock = Math.max(0, Number(found?.leftStock) || 0);
    const rightStock = Math.max(0, Number(found?.rightStock) || 0);
    const fallbackStock = Math.max(0, Number(found?.stock) || 0);
    const stock =
      leftStock > 0 || rightStock > 0 ? leftStock + rightStock : fallbackStock;

    return {
      size,
      leftStock,
      rightStock,
      stock,
    };
  });
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

  const displayPrice =
  product.discountPrice !== null &&
  product.discountPrice !== undefined &&
  product.discountPrice > 0 &&
  product.discountPrice < product.price
    ? product.discountPrice
    : product.price;

const hasDiscount = displayPrice !== product.price;

  return (
    <main className={styles.productPage}>
      <div className={styles.container}>
        <div className={styles.layout}>
          <div className={styles.imageBlock}>
            <ProductGallery title={product.title} images={product.images} />
          </div>

          <div className={styles.infoBlock}>
            <h1 className={styles.title}>{product.title}</h1>

            <div className={styles.productTopRow}>
  <div className={styles.priceInfo}>
    <div className={styles.priceBlock}>
      {hasDiscount ? (
        <>
          <p className={styles.salePrice}>
            {formatPrice(displayPrice)} <span>грн</span>
          </p>

          <p className={styles.oldPrice}>
            {formatPrice(product.price)} <span>грн</span>
          </p>
        </>
      ) : (
        <p className={styles.price}>
          {formatPrice(product.price)} <span>грн</span>
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
  </div>

  <div className={styles.actions}>
    <FavoriteButton productId={product.id} size="md" showText />
  </div>
</div>

<ProductActions sizeStocks={displaySizeStocks} />

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