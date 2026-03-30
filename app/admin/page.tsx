import { auth, signOut } from '@/auth';
import { redirect } from 'next/navigation';
import AdminAddProductForm from './AdminAddProductForm';
import styles from './AdminPage.module.css';

export default async function AdminPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login-staff?callbackUrl=/admin');
  }

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <div className={styles.top}>
          <div>
            <h1 className={styles.title}>Панель персоналу</h1>
            <p className={styles.subtitle}>
              Увійшов: {session.user.name} ({session.user.role})
            </p>
          </div>

          <form
            action={async () => {
              'use server';
              await signOut({ redirectTo: '/' });
            }}
          >
            <button className={styles.logoutButton} type="submit">
              Вийти
            </button>
          </form>
        </div>

        <AdminAddProductForm />
      </div>
    </main>
  );
}