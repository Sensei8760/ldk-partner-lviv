'use client';

import Image from 'next/image';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Toast from '@/components/ui/Toast';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { FALLBACK_PRODUCT_IMAGE } from '@/utils/productImages';
import styles from './AdminPage.module.css';

const styleOptions = [
  'ПОРТАЛА',
  'ДПМ+МК',
  'Комфорт NEW',
  'Елегант NEW',
  'Концепт',
  'Модерн',
  'ЛЮКС',
  'ТРІО ЛАЙТ',
  'ТРІО',
  'ТРІО ТЕРМО',
  'ТРІО MOTTURA',
  'Квадро',
  'Стріт',
  'Стріт ТЕРМО',
  'PROF GUARD',
  'Протипожежні + Економ + Епік',
  'РОЗПРОДАЖ',
  'РОЗПРОДАЖ Преміум NEW',
];

const doorTypeOptions = [
  { id: 'interior', label: 'Міжкімнатні' },
  { id: 'entrance', label: 'Вхідні' },
] as const;

const openingOptions = [
  { id: 'left', label: 'Ліве' },
  { id: 'right', label: 'Праве' },
] as const;

const sizeOptions = [
  { id: '850x2040', label: '850х2040 мм' },
  { id: '950x2040', label: '950х2040 мм' },
  { id: '1200x2040', label: '1200х2040 мм' },
] as const;

const characteristicLabels = [
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
] as const;

type ProductDoorType = (typeof doorTypeOptions)[number]['id'];
type ProductOpening = (typeof openingOptions)[number]['id'];
type ProductSize = (typeof sizeOptions)[number]['id'];

type ProductSizeStock = {
  size: ProductSize;
  stock: number;
};

type Product = {
  id: string;
  title: string;
  price: number;
  discountPrice: number | null;
  image: string;
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
  characteristics: { label: string; value: string }[];
};

type CharacteristicField = {
  label: string;
  value: string;
};

type SizeStockField = {
  size: ProductSize;
  enabled: boolean;
  stock: string;
};

type FormState = {
  id: string;
  title: string;
  price: string;
  discountPrice: string;
  imageFront: string;
  imageBack: string;
  description: string;
  type: 'street' | 'apartment';
  doorType: ProductDoorType;
  styles: string[];
  openings: ProductOpening[];
  sizeStocks: SizeStockField[];
  isHit: boolean;
  characteristics: CharacteristicField[];
};

type FormErrors = Partial<{
  title: string;
  price: string;
  discountPrice: string;
  imageFront: string;
  imageBack: string;
  images: string;
  type: string;
  doorType: string;
  styles: string;
  openings: string;
  sizeStocks: string;
  description: string;
  characteristics: string;
  general: string;
}>;

const emptyCharacteristics: CharacteristicField[] = characteristicLabels.map((label) => ({
  label,
  value: '',
}));

const emptySizeStocks: SizeStockField[] = sizeOptions.map((item) => ({
  size: item.id,
  enabled: false,
  stock: '',
}));

const emptyForm: FormState = {
  id: '',
  title: '',
  price: '',
  discountPrice: '',
  imageFront: '',
  imageBack: '',
  description: '',
  type: 'apartment',
  doorType: 'interior',
  styles: [],
  openings: [],
  sizeStocks: emptySizeStocks,
  isHit: false,
  characteristics: emptyCharacteristics,
};

const INITIAL_VISIBLE_COUNT = 5;
const LOAD_MORE_STEP = 10;

function mapCharacteristicsToFields(
  characteristics: { label: string; value: string }[]
): CharacteristicField[] {
  return characteristicLabels.map((label) => {
    const found = characteristics.find((item) => item.label === label);

    return {
      label,
      value: found?.value || '',
    };
  });
}

function mapSizeStocksToFields(
  sizeStocks: { size: ProductSize; stock: number }[]
): SizeStockField[] {
  return sizeOptions.map((item) => {
    const found = sizeStocks.find((sizeStock) => sizeStock.size === item.id);

    return {
      size: item.id,
      enabled: Boolean(found),
      stock: found ? String(found.stock) : '',
    };
  });
}

function isValidImagePath(value: string) {
  if (!value) return false;

  const normalized = value.trim();

  const isLocalPath = /^\/[\w\-./%]+$/i.test(normalized);
  const isRemoteUrl = /^https?:\/\/[^\s/$.?#].[^\s]*$/i.test(normalized);

  return isLocalPath || isRemoteUrl;
}

function getNormalizedSizeStocks(sizeStocks: SizeStockField[]): ProductSizeStock[] {
  return sizeStocks
    .filter((item) => item.enabled)
    .map((item) => ({
      size: item.size,
      stock: Number(item.stock),
    }))
    .filter(
      (item) =>
        Number.isFinite(item.stock) &&
        Number.isInteger(item.stock) &&
        item.stock >= 0
    );
}

function getTotalStock(sizeStocks: SizeStockField[]) {
  return getNormalizedSizeStocks(sizeStocks).reduce((sum, item) => sum + item.stock, 0);
}

function validateForm(form: FormState): FormErrors {
  const errors: FormErrors = {};

  const title = form.title.trim();
  const price = Number(form.price);
  const discountPrice =
    form.discountPrice.trim() === '' ? null : Number(form.discountPrice);
  const imageFront = form.imageFront.trim();
  const imageBack = form.imageBack.trim();
  const description = form.description.trim();

  if (!title) {
    errors.title = 'Вкажіть назву товару.';
  } else if (title.length < 5) {
    errors.title = 'Назва має містити щонайменше 5 символів.';
  } else if (title.length > 120) {
    errors.title = 'Назва не повинна перевищувати 120 символів.';
  }

  if (form.price === '') {
    errors.price = 'Вкажіть основну ціну.';
  } else if (!Number.isFinite(price)) {
    errors.price = 'Основна ціна повинна бути числом.';
  } else if (price <= 0) {
    errors.price = 'Основна ціна повинна бути більшою за 0.';
  } else if (price > 9999999) {
    errors.price = 'Основна ціна занадто велика.';
  }

  if (form.discountPrice.trim() !== '') {
    if (!Number.isFinite(discountPrice)) {
      errors.discountPrice = 'Ціна зі знижкою повинна бути числом.';
    } else if ((discountPrice ?? 0) <= 0) {
      errors.discountPrice = 'Ціна зі знижкою повинна бути більшою за 0.';
    } else if (Number.isFinite(price) && (discountPrice ?? 0) >= price) {
      errors.discountPrice = 'Ціна зі знижкою повинна бути меншою за основну ціну.';
    }
  }

  if (!imageFront) {
    errors.imageFront = 'Перше фото є обов’язковим.';
  } else if (!isValidImagePath(imageFront)) {
    errors.imageFront = 'Некоректний шлях або URL першого фото.';
  }

  if (imageBack && !isValidImagePath(imageBack)) {
    errors.imageBack = 'Некоректний шлях або URL другого фото.';
  }

  if (!doorTypeOptions.some((item) => item.id === form.doorType)) {
    errors.doorType = 'Оберіть тип дверей.';
  }

  const invalidStyles = form.styles.filter((style) => !styleOptions.includes(style));
  if (invalidStyles.length > 0) {
    errors.styles = 'Обрано некоректний стиль.';
  }

  const invalidOpenings = form.openings.filter(
    (opening) => !openingOptions.some((item) => item.id === opening)
  );
  if (invalidOpenings.length > 0) {
    errors.openings = 'Обрано некоректне відкривання.';
  }

  const enabledSizeStocks = form.sizeStocks.filter((item) => item.enabled);

  if (enabledSizeStocks.length === 0) {
    errors.sizeStocks = 'Оберіть хоча б один розмір.';
  } else {
    const hasInvalidStock = enabledSizeStocks.some((item) => {
      if (item.stock.trim() === '') return true;

      const value = Number(item.stock);

      return (
        !Number.isFinite(value) ||
        !Number.isInteger(value) ||
        value < 0 ||
        value > 9999
      );
    });

    if (hasInvalidStock) {
      errors.sizeStocks =
        'Для кожного вибраного розміру вкажіть коректну цілу кількість від 0 до 9999.';
    }
  }

  if (description.length > 1000) {
    errors.description = 'Опис не повинен перевищувати 1000 символів.';
  }

  const invalidCharacteristics = form.characteristics.filter(
    (item) =>
      !characteristicLabels.includes(item.label as (typeof characteristicLabels)[number]) ||
      item.value.trim().length > 200
  );

  if (invalidCharacteristics.length > 0) {
    errors.characteristics =
      'Характеристики містять некоректні або занадто довгі значення.';
  }

  return errors;
}

function ProductImagePreview({
  src,
  alt,
}: {
  src: string;
  alt: string;
}) {
  const normalizedSrc = src.trim();
  const fallbackSrc = normalizedSrc || FALLBACK_PRODUCT_IMAGE;
  const [hasError, setHasError] = useState(false);

  const displaySrc = hasError ? FALLBACK_PRODUCT_IMAGE : fallbackSrc;

  return (
    <div className={styles.imagePreviewBox}>
      <div className={styles.imagePreviewFrame}>
        <Image
          key={fallbackSrc}
          src={displaySrc}
          alt={alt}
          fill
          className={styles.imagePreview}
          sizes="160px"
          onError={() => {
            if (displaySrc !== FALLBACK_PRODUCT_IMAGE) {
              setHasError(true);
            }
          }}
        />
      </div>
    </div>
  );
}

export default function AdminAddProductForm() {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [productsLoadError, setProductsLoadError] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [showToast, setShowToast] = useState(false);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);

  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const totalStock = useMemo(() => getTotalStock(form.sizeStocks), [form.sizeStocks]);

  const triggerToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);

    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }

    toastTimeoutRef.current = setTimeout(() => {
      setShowToast(false);
    }, 3000);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  const loadProducts = useCallback(
    async (showErrorToast = false) => {
      try {
        setIsLoadingProducts(true);
        setProductsLoadError('');

        const response = await fetch('/api/products', {
          method: 'GET',
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error('Не вдалося завантажити товари.');
        }

        const data = await response.json();
        const loadedProducts = Array.isArray(data.products) ? data.products : [];

        setProducts(loadedProducts);
      } catch {
        setProducts([]);
        setProductsLoadError('Не вдалося завантажити список товарів. Спробуйте ще раз.');

        if (showErrorToast) {
          triggerToast('Не вдалося завантажити список товарів.', 'error');
        }
      } finally {
        setIsLoadingProducts(false);
      }
    },
    [triggerToast]
  );

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    setVisibleCount(INITIAL_VISIBLE_COUNT);
  }, [searchQuery]);

  function clearFieldError(field: keyof FormErrors) {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      return { ...prev, [field]: undefined };
    });
  }

  function handleSelectDoorType(doorType: ProductDoorType) {
    setForm((prev) => ({
      ...prev,
      doorType,
    }));
    clearFieldError('doorType');
  }

  function handleToggleStyle(style: string) {
    setForm((prev) => {
      const nextStyles = prev.styles.includes(style)
        ? prev.styles.filter((item) => item !== style)
        : [...prev.styles, style];

      return {
        ...prev,
        styles: nextStyles,
      };
    });

    clearFieldError('styles');
  }

  function handleToggleOpening(opening: ProductOpening) {
    setForm((prev) => {
      const nextOpenings = prev.openings.includes(opening)
        ? prev.openings.filter((item) => item !== opening)
        : [...prev.openings, opening];

      return {
        ...prev,
        openings: nextOpenings,
      };
    });

    clearFieldError('openings');
  }

  function handleToggleSize(size: ProductSize) {
    setForm((prev) => ({
      ...prev,
      sizeStocks: prev.sizeStocks.map((item) =>
        item.size === size
          ? {
              ...item,
              enabled: !item.enabled,
              stock: item.enabled ? '' : item.stock,
            }
          : item
      ),
    }));

    clearFieldError('sizeStocks');
  }

  function handleSizeStockChange(size: ProductSize, value: string) {
    setForm((prev) => ({
      ...prev,
      sizeStocks: prev.sizeStocks.map((item) =>
        item.size === size
          ? {
              ...item,
              stock: value.replace(/[^\d]/g, ''),
            }
          : item
      ),
    }));

    clearFieldError('sizeStocks');
  }

  function handleCharacteristicChange(label: string, value: string) {
    setForm((prev) => ({
      ...prev,
      characteristics: prev.characteristics.map((item) =>
        item.label === label ? { ...item, value } : item
      ),
    }));

    clearFieldError('characteristics');
  }

  function resetForm() {
    setForm({
      ...emptyForm,
      sizeStocks: sizeOptions.map((item) => ({
        size: item.id,
        enabled: false,
        stock: '',
      })),
      characteristics: characteristicLabels.map((label) => ({
        label,
        value: '',
      })),
    });
    setErrors({});
    setEditingId(null);
  }

  function handleEdit(product: Product) {
    const productImages =
      Array.isArray(product.images) && product.images.length > 0
        ? product.images
        : product.image
          ? [product.image]
          : [];

    const normalizedSizeStocks =
      Array.isArray(product.sizeStocks) && product.sizeStocks.length > 0
        ? product.sizeStocks
        : Array.isArray(product.sizes)
          ? product.sizes.map((size) => ({
              size,
              stock: product.stock ?? 0,
            }))
          : [];

    setEditingId(product.id);

    setForm({
      id: product.id || '',
      title: product.title || '',
      price: String(product.price ?? ''),
      discountPrice:
        product.discountPrice !== null && product.discountPrice !== undefined
          ? String(product.discountPrice)
          : '',
      imageFront: productImages[0] || '',
      imageBack: productImages[1] || '',
      description: product.description || '',
      type: product.type === 'street' ? 'street' : 'apartment',
      doorType: product.doorType === 'entrance' ? 'entrance' : 'interior',
      styles: Array.isArray(product.styles) ? product.styles : [],
      openings: Array.isArray(product.openings) ? product.openings : [],
      sizeStocks: mapSizeStocksToFields(normalizedSizeStocks),
      isHit: Boolean(product.isHit),
      characteristics: mapCharacteristicsToFields(
        Array.isArray(product.characteristics) ? product.characteristics : []
      ),
    });

    setErrors({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
    triggerToast('Режим редагування увімкнено.', 'success');
  }

  function openDeleteModal(product: Product) {
    setProductToDelete(product);
    setDeleteModalOpen(true);
  }

  function closeDeleteModal() {
    if (isDeleting) return;
    setDeleteModalOpen(false);
    setProductToDelete(null);
  }

  async function handleDeleteConfirm() {
    if (!productToDelete) return;

    setIsDeleting(true);

    try {
      const response = await fetch('/api/products', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: productToDelete.id }),
      });

      const data = await response.json();

      if (!response.ok) {
        triggerToast(data.message || 'Не вдалося видалити товар.', 'error');
        return;
      }

      if (editingId === productToDelete.id) {
        resetForm();
      }

      setDeleteModalOpen(false);
      setProductToDelete(null);

      await loadProducts();
      triggerToast('Товар успішно видалено.', 'success');
    } catch {
      triggerToast('Сталася помилка під час видалення товару.', 'error');
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validateForm(form);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      triggerToast('Не всі обов’язкові поля заповнені або містять помилки.', 'error');
      return;
    }

    setIsLoading(true);

    const normalizedSizeStocks = getNormalizedSizeStocks(form.sizeStocks);

    const payload = {
      id: form.id.trim(),
      title: form.title.trim(),
      price: Number(form.price),
      discountPrice:
        form.discountPrice.trim() === '' ? null : Number(form.discountPrice),
      images: [form.imageFront.trim(), form.imageBack.trim()].filter(Boolean),
      imageFront: form.imageFront.trim(),
      imageBack: form.imageBack.trim(),
      description: form.description.trim(),
      type: form.type,
      doorType: form.doorType,
      styles: form.styles,
      openings: form.openings,
      sizes: normalizedSizeStocks.map((item) => item.size),
      sizeStocks: normalizedSizeStocks,
      stock: normalizedSizeStocks.reduce((sum, item) => sum + item.stock, 0),
      isHit: form.isHit,
      characteristics: form.characteristics
        .map((item) => ({
          label: item.label,
          value: item.value.trim(),
        }))
        .filter((item) => item.value),
    };

    try {
      const response = await fetch('/api/products', {
        method: editingId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data?.errors && typeof data.errors === 'object') {
          setErrors(data.errors);
        }

        triggerToast(data.message || 'Не вдалося зберегти товар.', 'error');
        return;
      }

      const wasEditing = Boolean(editingId);

      resetForm();
      await loadProducts();

      triggerToast(
        wasEditing ? 'Товар успішно оновлено.' : 'Товар успішно додано.',
        'success'
      );
    } catch {
      triggerToast('Сталася помилка під час збереження товару.', 'error');
    } finally {
      setIsLoading(false);
    }
  }

  const filteredProducts = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    if (!normalizedQuery) return products;

    return products.filter((product) =>
      product.title.toLowerCase().includes(normalizedQuery)
    );
  }, [products, searchQuery]);

  const visibleProducts = filteredProducts.slice(0, visibleCount);
  const hasMoreProducts = visibleProducts.length < filteredProducts.length;

  function handleShowMore() {
    setVisibleCount((prev) => prev + LOAD_MORE_STEP);
  }

  return (
    <>
      <Toast show={showToast} message={toastMessage} type={toastType} />

      <ConfirmModal
        open={deleteModalOpen}
        title="Підтвердження видалення"
        message={
          productToDelete
            ? `Точно видалити товар "${productToDelete.title}"?`
            : 'Точно видалити цей товар?'
        }
        confirmText="Видалити"
        cancelText="Скасувати"
        onConfirm={handleDeleteConfirm}
        onCancel={closeDeleteModal}
        isLoading={isDeleting}
      />

      <div className={styles.adminContent}>
        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.formHeader}>
            <h2 className={styles.sectionTitle}>
              {editingId ? 'Редагування товару' : 'Додавання товару'}
            </h2>

            {editingId ? (
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={resetForm}
              >
                Скасувати редагування
              </button>
            ) : null}
          </div>

          {errors.general ? (
            <p className={styles.fieldError}>{errors.general}</p>
          ) : null}

          <div className={styles.grid}>
            <div className={styles.field}>
              <label>Назва</label>
              <input
                value={form.title}
                onChange={(e) => {
                  setForm({ ...form, title: e.target.value });
                  clearFieldError('title');
                }}
                placeholder='Міжкімнатні двері "Doors" Smart - модель - C067'
              />
              {errors.title ? <p className={styles.fieldError}>{errors.title}</p> : null}
            </div>

            <div className={styles.field}>
              <label>Основна ціна</label>
              <input
                type="number"
                min="1"
                value={form.price}
                onChange={(e) => {
                  setForm({ ...form, price: e.target.value });
                  clearFieldError('price');
                }}
                placeholder="3064"
              />
              {errors.price ? <p className={styles.fieldError}>{errors.price}</p> : null}
            </div>

            <div className={styles.field}>
              <label>Ціна зі знижкою</label>
              <input
                type="number"
                min="1"
                value={form.discountPrice}
                onChange={(e) => {
                  setForm({ ...form, discountPrice: e.target.value });
                  clearFieldError('discountPrice');
                }}
                placeholder="Необов'язково"
              />
              {errors.discountPrice ? (
                <p className={styles.fieldError}>{errors.discountPrice}</p>
              ) : null}
            </div>

            <div className={styles.field}>
              <label>Фото 1 (одна сторона)</label>
              <input
                value={form.imageFront}
                onChange={(e) => {
                  setForm({ ...form, imageFront: e.target.value });
                  clearFieldError('imageFront');
                  clearFieldError('images');
                }}
                placeholder="/images/doors/door-front.jpg"
              />
              {errors.imageFront ? (
                <p className={styles.fieldError}>{errors.imageFront}</p>
              ) : null}

              <ProductImagePreview
                key={`front-${form.imageFront}`}
                src={form.imageFront}
                alt={form.title ? `${form.title} - фото 1` : 'Фото 1'}
              />
            </div>

            <div className={styles.field}>
              <label>Фото 2 (друга сторона)</label>
              <input
                value={form.imageBack}
                onChange={(e) => {
                  setForm({ ...form, imageBack: e.target.value });
                  clearFieldError('imageBack');
                }}
                placeholder="/images/doors/door-back.jpg"
              />
              {errors.imageBack ? (
                <p className={styles.fieldError}>{errors.imageBack}</p>
              ) : null}

              <ProductImagePreview
                key={`back-${form.imageBack}`}
                src={form.imageBack}
                alt={form.title ? `${form.title} - фото 2` : 'Фото 2'}
              />
            </div>

            <div className={styles.field}>
              <label>Тип дверей</label>
              <div className={styles.stylesGrid}>
                {doorTypeOptions.map((item) => (
                  <label key={item.id} className={styles.styleOption}>
                    <input
                      type="checkbox"
                      checked={form.doorType === item.id}
                      onChange={() => handleSelectDoorType(item.id)}
                    />
                    <span>{item.label}</span>
                  </label>
                ))}
              </div>
              {errors.doorType ? <p className={styles.fieldError}>{errors.doorType}</p> : null}
            </div>

            <div className={styles.field}>
              <label>Місце встановлення</label>
              <select
                value={form.type}
                onChange={(e) => {
                  setForm({
                    ...form,
                    type: e.target.value as 'street' | 'apartment',
                  });
                  clearFieldError('type');
                }}
              >
                <option value="apartment">Квартира</option>
                <option value="street">Вулиця</option>
              </select>
              {errors.type ? <p className={styles.fieldError}>{errors.type}</p> : null}
            </div>
          </div>

          {errors.images ? <p className={styles.fieldError}>{errors.images}</p> : null}

          <div className={styles.field}>
            <label>Відкривання дверей</label>
            <div className={styles.stylesGrid}>
              {openingOptions.map((opening) => (
                <label key={opening.id} className={styles.styleOption}>
                  <input
                    type="checkbox"
                    checked={form.openings.includes(opening.id)}
                    onChange={() => handleToggleOpening(opening.id)}
                  />
                  <span>{opening.label}</span>
                </label>
              ))}
            </div>
            {errors.openings ? <p className={styles.fieldError}>{errors.openings}</p> : null}
          </div>

          <div className={styles.field}>
            <label>Розміри та кількість</label>
            <div className={styles.characteristicsGrid}>
              {form.sizeStocks.map((item) => {
                const sizeLabel =
                  sizeOptions.find((option) => option.id === item.size)?.label || item.size;

                return (
                  <div key={item.size} className={styles.characteristicField}>
                    <label className={styles.styleOption}>
                      <input
                        type="checkbox"
                        checked={item.enabled}
                        onChange={() => handleToggleSize(item.size)}
                      />
                      <span>{sizeLabel}</span>
                    </label>

                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={item.stock}
                      onChange={(e) => handleSizeStockChange(item.size, e.target.value)}
                      placeholder="Кількість"
                      disabled={!item.enabled}
                    />
                  </div>
                );
              })}
            </div>

            <p className={styles.stateText}>Загальна кількість в наявності: {totalStock}</p>

            {errors.sizeStocks ? (
              <p className={styles.fieldError}>{errors.sizeStocks}</p>
            ) : null}
          </div>

          <div className={styles.field}>
            <label>Стилі</label>
            <div className={styles.stylesGrid}>
              {styleOptions.map((style) => (
                <label key={style} className={styles.styleOption}>
                  <input
                    type="checkbox"
                    checked={form.styles.includes(style)}
                    onChange={() => handleToggleStyle(style)}
                  />
                  <span>{style}</span>
                </label>
              ))}
            </div>
            {errors.styles ? <p className={styles.fieldError}>{errors.styles}</p> : null}
          </div>

          <div className={styles.field}>
            <label>Опис</label>
            <textarea
              rows={5}
              value={form.description}
              onChange={(e) => {
                setForm({ ...form, description: e.target.value });
                clearFieldError('description');
              }}
              placeholder="Короткий опис товару..."
            />
            {errors.description ? (
              <p className={styles.fieldError}>{errors.description}</p>
            ) : null}
          </div>

          <div className={styles.field}>
            <label>Характеристики</label>
            <div className={styles.characteristicsGrid}>
              {form.characteristics.map((item) => (
                <div key={item.label} className={styles.characteristicField}>
                  <label>{item.label}</label>
                  <input
                    type="text"
                    value={item.value}
                    onChange={(e) =>
                      handleCharacteristicChange(item.label, e.target.value)
                    }
                    placeholder={`Вкажіть значення для "${item.label}"`}
                  />
                </div>
              ))}
            </div>
            {errors.characteristics ? (
              <p className={styles.fieldError}>{errors.characteristics}</p>
            ) : null}
          </div>

          <label className={styles.hitRow}>
            <input
              type="checkbox"
              checked={form.isHit}
              onChange={(e) => setForm({ ...form, isHit: e.target.checked })}
            />
            <span>Позначити як ХІТ</span>
          </label>

          <button className={styles.submitButton} type="submit" disabled={isLoading}>
            {isLoading
              ? 'Збереження...'
              : editingId
                ? 'Оновити товар'
                : 'Додати товар'}
          </button>
        </form>

        <div className={styles.productsManager}>
          <div className={styles.productsManagerHeader}>
            <h2 className={styles.sectionTitle}>Існуючі товари</h2>

            <div className={styles.searchBox}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Пошук по назві..."
                className={styles.searchInput}
                disabled={Boolean(productsLoadError)}
              />
            </div>
          </div>

          {isLoadingProducts ? (
            <p>Завантаження товарів...</p>
          ) : productsLoadError ? (
            <div className={styles.stateBox}>
              <h3 className={styles.stateTitle}>Не вдалося завантажити товари</h3>
              <p className={styles.stateText}>{productsLoadError}</p>
              <button
                type="button"
                className={styles.retryButton}
                onClick={() => loadProducts(true)}
              >
                Спробувати ще раз
              </button>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className={styles.stateBox}>
              <h3 className={styles.stateTitle}>Товарів не знайдено</h3>
              <p className={styles.stateText}>
                {searchQuery.trim()
                  ? 'Спробуйте змінити пошуковий запит.'
                  : 'Поки що в каталозі немає доданих товарів.'}
              </p>
            </div>
          ) : (
            <>
              <div className={styles.productsList}>
                {visibleProducts.map((product) => (
                  <div key={product.id} className={styles.productRow}>
                    <div className={styles.productInfo}>
                      <p className={styles.productTitle}>{product.title}</p>
                      <p className={styles.productMeta}>
                        ID: {product.id} ·{' '}
                        {product.discountPrice !== null &&
                        product.discountPrice < product.price
                          ? `${product.discountPrice} грн (замість ${product.price} грн)`
                          : `${product.price} грн`}{' '}
                        · В наявності: {product.stock}
                      </p>
                    </div>

                    <div className={styles.productActions}>
                      <button
                        type="button"
                        className={styles.editButton}
                        onClick={() => handleEdit(product)}
                      >
                        Редагувати
                      </button>

                      <button
                        type="button"
                        className={styles.deleteButton}
                        onClick={() => openDeleteModal(product)}
                      >
                        Видалити
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {hasMoreProducts ? (
                <button
                  type="button"
                  className={styles.showMoreProductsButton}
                  onClick={handleShowMore}
                >
                  Показати ще
                </button>
              ) : null}
            </>
          )}
        </div>
      </div>
    </>
  );
}