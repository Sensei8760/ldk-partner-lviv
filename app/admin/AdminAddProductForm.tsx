'use client';

import { useEffect, useMemo, useState } from 'react';
import Toast from '@/components/ui/Toast';
import ConfirmModal from '@/components/ui/ConfirmModal';
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

type Product = {
  id: string;
  title: string;
  price: number;
  image: string;
  description: string;
  type: 'street' | 'apartment';
  styles: string[];
  stock: number;
  isHit: boolean;
  characteristics: { label: string; value: string }[];
};

const emptyForm = {
  id: '',
  title: '',
  price: '',
  image: '',
  description: '',
  type: 'apartment',
  styles: [] as string[],
  stock: '',
  isHit: false,
  characteristicsText: '',
};

const INITIAL_VISIBLE_COUNT = 5;
const LOAD_MORE_STEP = 10;

function characteristicsToText(
  characteristics: { label: string; value: string }[]
) {
  return characteristics.map((item) => `${item.label}: ${item.value}`).join('\n');
}

export default function AdminAddProductForm() {
  const [form, setForm] = useState(emptyForm);
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

  function handleToggleStyle(style: string) {
    setForm((prev) => ({
      ...prev,
      styles: prev.styles.includes(style)
        ? prev.styles.filter((item) => item !== style)
        : [...prev.styles, style],
    }));
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
  }

  function handleEdit(product: Product) {
    setEditingId(product.id);

    setForm({
      id: product.id,
      title: product.title,
      price: String(product.price),
      image: product.image,
      description: product.description,
      type: product.type,
      styles: product.styles,
      stock: String(product.stock),
      isHit: product.isHit,
      characteristicsText: characteristicsToText(product.characteristics),
    });

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
    setIsLoading(true);

    const payload = {
      id: form.id,
      title: form.title,
      price: Number(form.price),
      image: form.image,
      description: form.description,
      type: form.type,
      styles: form.styles,
      stock: Number(form.stock),
      isHit: form.isHit,
      characteristicsText: form.characteristicsText,
    };

    const response = await fetch('/api/products', {
      method: editingId ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    setIsLoading(false);

    if (!response.ok) {
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
        <form className={styles.form} onSubmit={handleSubmit}>
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

          <div className={styles.grid}>
            <div className={styles.field}>
              <label>Назва</label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder='Міжкімнатні двері "Doors" Smart - модель - C067'
              />
            </div>

            <div className={styles.field}>
              <label>Ціна</label>
              <input
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="3064"
              />
            </div>

            <div className={styles.field}>
              <label>Шлях до картинки</label>
              <input
                value={form.image}
                onChange={(e) => setForm({ ...form, image: e.target.value })}
                placeholder="/images/doors/door-2.jpg"
              />
            </div>

            <div className={styles.field}>
              <label>Тип</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                <option value="apartment">Квартира</option>
                <option value="street">Вулиця</option>
              </select>
            </div>

            <div className={styles.field}>
              <label>Кількість в наявності</label>
              <input
                type="number"
                min="0"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                placeholder="1"
              />
            </div>
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
          </div>

          <div className={styles.field}>
            <label>Опис</label>
            <textarea
              rows={5}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Короткий опис товару..."
            />
          </div>

          <div className={styles.field}>
            <label>Характеристики</label>
            <textarea
              rows={8}
              value={form.characteristicsText}
              onChange={(e) =>
                setForm({ ...form, characteristicsText: e.target.value })
              }
              placeholder={`Тип: Квартира
Модель: C067
Матеріал: МДФ
Колір: Сірий дуб`}
            />
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