'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
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

type Product = {
  id: string;
  title: string;
  price: number;
  image: string;
  images?: string[];
  description: string;
  type: 'street' | 'apartment';
  styles: string[];
  stock: number;
  isHit: boolean;
  characteristics: { label: string; value: string }[];
};

type CharacteristicField = {
  label: string;
  value: string;
};

type FormState = {
  id: string;
  title: string;
  price: string;
  imageFront: string;
  imageBack: string;
  description: string;
  type: 'street' | 'apartment';
  styles: string[];
  stock: string;
  isHit: boolean;
  characteristics: CharacteristicField[];
};

type FormErrors = Partial<{
  title: string;
  price: string;
  imageFront: string;
  imageBack: string;
  images: string;
  type: string;
  styles: string;
  stock: string;
  description: string;
  characteristics: string;
  general: string;
}>;

const emptyCharacteristics: CharacteristicField[] = characteristicLabels.map((label) => ({
  label,
  value: '',
}));

const emptyForm: FormState = {
  id: '',
  title: '',
  price: '',
  imageFront: '',
  imageBack: '',
  description: '',
  type: 'apartment',
  styles: [],
  stock: '',
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

function isValidImagePath(value: string) {
  if (!value) return false;

  const normalized = value.trim();

  const isLocalPath = /^\/[\w\-./%]+$/i.test(normalized);
  const isRemoteUrl = /^https?:\/\/[^\s/$.?#].[^\s]*$/i.test(normalized);

  return isLocalPath || isRemoteUrl;
}

function validateForm(form: FormState): FormErrors {
  const errors: FormErrors = {};

  const title = form.title.trim();
  const price = Number(form.price);
  const stock = Number(form.stock);
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
    errors.price = 'Вкажіть ціну.';
  } else if (!Number.isFinite(price)) {
    errors.price = 'Ціна повинна бути числом.';
  } else if (price <= 0) {
    errors.price = 'Ціна повинна бути більшою за 0.';
  } else if (price > 9999999) {
    errors.price = 'Ціна занадто велика.';
  }

  if (!imageFront) {
    errors.imageFront = 'Перше фото є обов’язковим.';
  } else if (!isValidImagePath(imageFront)) {
    errors.imageFront = 'Некоректний шлях або URL першого фото.';
  }

  if (imageBack && !isValidImagePath(imageBack)) {
    errors.imageBack = 'Некоректний шлях або URL другого фото.';
  }

  if (form.stock === '') {
    errors.stock = 'Вкажіть кількість в наявності.';
  } else if (!Number.isFinite(stock)) {
    errors.stock = 'Кількість повинна бути числом.';
  } else if (!Number.isInteger(stock)) {
    errors.stock = 'Кількість повинна бути цілим числом.';
  } else if (stock < 0) {
    errors.stock = 'Кількість не може бути меншою за 0.';
  } else if (stock > 9999) {
    errors.stock = 'Кількість занадто велика.';
  }

  const invalidStyles = form.styles.filter((style) => !styleOptions.includes(style));
  if (invalidStyles.length > 0) {
    errors.styles = 'Обрано некоректний стиль.';
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
  const [editingId, setEditingId] = useState<string | null>(null);

  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [showToast, setShowToast] = useState(false);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);

  function triggerToast(message: string, type: 'success' | 'error' = 'success') {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);

    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  }

  async function loadProducts() {
    try {
      setIsLoadingProducts(true);

      const response = await fetch('/api/products', {
        method: 'GET',
        cache: 'no-store',
      });

      const data = await response.json();
      const loadedProducts = Array.isArray(data.products) ? data.products : [];

      setProducts(loadedProducts);
    } finally {
      setIsLoadingProducts(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    setVisibleCount(INITIAL_VISIBLE_COUNT);
  }, [searchQuery]);

  function clearFieldError(field: keyof FormErrors) {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      return { ...prev, [field]: undefined };
    });
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

    setEditingId(product.id);

    setForm({
      id: product.id || '',
      title: product.title || '',
      price: String(product.price ?? ''),
      imageFront: productImages[0] || '',
      imageBack: productImages[1] || '',
      description: product.description || '',
      type: product.type === 'street' ? 'street' : 'apartment',
      styles: Array.isArray(product.styles) ? product.styles : [],
      stock: String(product.stock ?? ''),
      isHit: Boolean(product.isHit),
      characteristics: mapCharacteristicsToFields(
        Array.isArray(product.characteristics) ? product.characteristics : []
      ),
    });

    setErrors({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

    const response = await fetch('/api/products', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: productToDelete.id }),
    });

    const data = await response.json();
    setIsDeleting(false);

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
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validateForm(form);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      triggerToast('Перевірте правильність заповнення форми.', 'error');
      return;
    }

    setIsLoading(true);

    const payload = {
      id: form.id.trim(),
      title: form.title.trim(),
      price: Number(form.price),
      images: [form.imageFront.trim(), form.imageBack.trim()].filter(Boolean),
      imageFront: form.imageFront.trim(),
      imageBack: form.imageBack.trim(),
      description: form.description.trim(),
      type: form.type,
      styles: form.styles,
      stock: Number(form.stock),
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
              <label>Ціна</label>
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
              <label>Тип</label>
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

            <div className={styles.field}>
              <label>Кількість в наявності</label>
              <input
                type="number"
                min="0"
                step="1"
                value={form.stock}
                onChange={(e) => {
                  setForm({ ...form, stock: e.target.value });
                  clearFieldError('stock');
                }}
                placeholder="1"
              />
              {errors.stock ? <p className={styles.fieldError}>{errors.stock}</p> : null}
            </div>
          </div>

          {errors.images ? <p className={styles.fieldError}>{errors.images}</p> : null}

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
              />
            </div>
          </div>

          {isLoadingProducts ? (
            <p>Завантаження товарів...</p>
          ) : filteredProducts.length === 0 ? (
            <p>Товарів не знайдено.</p>
          ) : (
            <>
              <div className={styles.productsList}>
                {visibleProducts.map((product) => (
                  <div key={product.id} className={styles.productRow}>
                    <div className={styles.productInfo}>
                      <p className={styles.productTitle}>{product.title}</p>
                      <p className={styles.productMeta}>
                        ID: {product.id} · {product.price} грн · В наявності: {product.stock}
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