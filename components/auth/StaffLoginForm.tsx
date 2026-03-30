'use client';

import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import styles from './StaffLoginForm.module.css';

type Props = {
  compact?: boolean;
  onSuccess?: () => void;
};

export default function StaffLoginForm({ compact = false, onSuccess }: Props) {
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorText, setErrorText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorText('');
    setIsLoading(true);

    const result = await signIn('credentials', {
      username,
      password,
      redirect: false,
      callbackUrl: '/admin',
    });

    setIsLoading(false);

    if (!result) {
      setErrorText('Не вдалося виконати вхід.');
      return;
    }

    if (result.error) {
      setErrorText('Невірний логін або пароль.');
      return;
    }

    onSuccess?.();
    router.push('/admin');
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`${styles.form} ${compact ? styles.formCompact : ''}`}
    >
      <input
        className={styles.input}
        type="text"
        placeholder="Логін"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        autoComplete="username"
      />

      <input
        className={styles.input}
        type="password"
        placeholder="Пароль"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete="current-password"
      />

      {errorText ? <p className={styles.error}>{errorText}</p> : null}

      <button className={styles.button} type="submit" disabled={isLoading}>
        {isLoading ? 'Вхід...' : 'Увійти'}
      </button>
    </form>
  );
}