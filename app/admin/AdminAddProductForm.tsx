'use client';

import { useState } from 'react';
import styles from './AdminPage.module.css';

const emptyForm = {
  id: '',
  title: '',
  price: '',
  image: '',
  description: '',
  type: 'apartment',
  style: '',
  isHit: false,
  characteristicsText: '',
};

export default function AdminAddProductForm() {
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState('');
  const [errorText, setErrorText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');
    setErrorText('');
    setIsLoading(true);

    const response = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        price: Number(form.price),
      }),
    });

    const data = await response.json();
    setIsLoading(false);

    if (!response.ok) {
      setErrorText(data.message || 'Не вдалося додати товар.');
      return;
    }

    setMessage('Товар успішно додано.');
    setForm(emptyForm);
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.grid}>
        <div className={styles.field}>
          <label>ID товару</label>
          <input
            value={form.id}
            onChange={(e) => setForm({ ...form, id: e.target.value })}
            placeholder="door-c067"
          />
        </div>

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
          <label>Стиль</label>
          <input
            value={form.style}
            onChange={(e) => setForm({ ...form, style: e.target.value })}
            placeholder="Комфорт NEW"
          />
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