import StaffLoginForm from '@/components/auth/StaffLoginForm';
import styles from './LoginStaffPage.module.css';

export default function LoginStaffPage() {
  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Вхід для персоналу</h1>
        <StaffLoginForm />
      </div>
    </main>
  );
}