'use client';

import { useState } from 'react';
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

const emptyForm = {
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

export default function AdminAddProductForm() {
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState('');
  const [errorText, setErrorText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  function handleToggleStyle(style: string) {
    setForm((prev) => ({
      ...prev,
      styles: prev.styles.includes(style)
        ? prev.styles.filter((item) => item !== style)
        : [...prev.styles, style],
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');
    setErrorText('');
    setIsLoading(true);

    const response = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: form.title,
        price: Number(form.price),
        image: form.image,
        description: form.description,
        type: form.type,
        styles: form.styles,
        stock: Number(form.stock),
        isHit: form.isHit,
        characteristicsText: form.characteristicsText,
      }),
    });

    const data = await response.json();
    setIsLoading(false);

    if (!response.ok) {
      setErrorText(data.message || 'Не вдалося додати товар.');
      return;
    }

    setMessage(`Товар успішно додано. ID: ${data.product.id}`);
    setForm(emptyForm);
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
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

      {message ? <p className={styles.success}>{message}</p> : null}
      {errorText ? <p className={styles.error}>{errorText}</p> : null}

      <button className={styles.submitButton} type="submit" disabled={isLoading}>
        {isLoading ? 'Збереження...' : 'Додати товар'}
      </button>
    </form>
  );
}