import { auth, signOut } from '@/auth';
import { redirect } from 'next/navigation';
import { sql } from '@/lib/db';
import AdminAddProductForm from './AdminAddProductForm';
import styles from './AdminPage.module.css';

type AuditLogRow = {
  id: number;
  action: 'created' | 'updated' | 'deleted';
  product_slug: string | null;
  product_title: string;
  actor_name: string | null;
  actor_email: string | null;
  actor_role: string | null;
  details: string[] | null;
  created_at: string;
};

function formatActionLabel(action: AuditLogRow['action']) {
  switch (action) {
    case 'created':
      return 'Додавання';
    case 'updated':
      return 'Редагування';
    case 'deleted':
      return 'Видалення';
    default:
      return action;
  }
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('uk-UA', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

export default async function AdminPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login-staff?callbackUrl=/admin');
  }

  const logs = (await sql`
  SELECT
    id,
    action,
    product_slug,
    product_title,
    actor_name,
    actor_email,
    actor_role,
    details,
    created_at
  FROM product_audit_logs
  ORDER BY created_at DESC
  LIMIT 30
`) as AuditLogRow[];

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

        <div className={styles.adminLayout}>
          <aside className={styles.logPanel}>
            <div className={styles.logPanelHeader}>
              <h2 className={styles.sectionTitle}>Журнал дій</h2>
              <p className={styles.logSubtitle}>
                Останні додавання, редагування та видалення
              </p>
            </div>

            {logs.length === 0 ? (
              <div className={styles.stateBox}>
                <h3 className={styles.stateTitle}>Поки що порожньо</h3>
                <p className={styles.stateText}>Дії персоналу ще не записані.</p>
              </div>
            ) : (
              <div className={styles.logList}>
                {logs.map((log) => (
                  <article key={log.id} className={styles.logItem}>
                    <div className={styles.logTop}>
                      <span
                        className={`${styles.logAction} ${
                          log.action === 'created'
                            ? styles.logActionCreate
                            : log.action === 'updated'
                              ? styles.logActionUpdate
                              : styles.logActionDelete
                        }`}
                      >
                        {formatActionLabel(log.action)}
                      </span>

                      <time className={styles.logTime}>
                        {formatDateTime(log.created_at)}
                      </time>
                    </div>

                    <p className={styles.logProductTitle}>{log.product_title}</p>

                    {log.product_slug ? (
                      <p className={styles.logProductSlug}>ID: {log.product_slug}</p>
                    ) : null}

                    <p className={styles.logActor}>
                      {log.actor_name || 'Невідомий користувач'}
                      {log.actor_role ? ` · ${log.actor_role}` : ''}
                    </p>
                    {Array.isArray(log.details) && log.details.length > 0 ? (
  <ul className={styles.logDetailsList}>
    {log.details.map((detail, index) => (
      <li key={`${log.id}-${index}`} className={styles.logDetailsItem}>
        {detail}
      </li>
    ))}
  </ul>
) : null}
                    {log.actor_email ? (
                      <p className={styles.logActorEmail}>{log.actor_email}</p>
                    ) : null}
                  </article>
                ))}
              </div>
            )}
          </aside>

          <div className={styles.mainColumn}>
            <AdminAddProductForm />
          </div>
        </div>
      </div>
    </main>
  );
}