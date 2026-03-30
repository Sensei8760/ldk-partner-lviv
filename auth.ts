import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

type StaffRole = 'staff' | 'admin';

type StaffUser = {
  id: string;
  username: string;
  password: string;
  name: string;
  role: StaffRole;
};

function getStaffUsers(): StaffUser[] {
  return [
    {
      id: '1',
      username: process.env.STAFF_1_USERNAME || '',
      password: process.env.STAFF_1_PASSWORD || '',
      name: process.env.STAFF_1_NAME || 'Менеджер 1',
      role: (process.env.STAFF_1_ROLE as StaffRole) || 'staff',
    },
    {
      id: '2',
      username: process.env.STAFF_2_USERNAME || '',
      password: process.env.STAFF_2_PASSWORD || '',
      name: process.env.STAFF_2_NAME || 'Менеджер 2',
      role: (process.env.STAFF_2_ROLE as StaffRole) || 'staff',
    },
    {
      id: '3',
      username: process.env.STAFF_3_USERNAME || '',
      password: process.env.STAFF_3_PASSWORD || '',
      name: process.env.STAFF_3_NAME || 'Адміністратор',
      role: (process.env.STAFF_3_ROLE as StaffRole) || 'admin',
    },
  ].filter((user) => user.username && user.password);
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login-staff',
  },
  providers: [
    Credentials({
      credentials: {
        username: { label: 'Логін', type: 'text' },
        password: { label: 'Пароль', type: 'password' },
      },
      authorize: async (credentials) => {
        const username = String(credentials?.username || '').trim();
        const password = String(credentials?.password || '');

        const user = getStaffUsers().find(
          (item) => item.username === username && item.password === password
        );

        if (!user) return null;

        return {
          id: user.id,
          name: user.name,
          email: `${user.username}@staff.local`,
          role: user.role,
          username: user.username,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role;
        token.username = (user as { username?: string }).username;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.role = typeof token.role === 'string' ? token.role : undefined;
        session.user.username =
          typeof token.username === 'string' ? token.username : undefined;
      }

      return session;
    },

    authorized({ auth, request }) {
      const pathname = request.nextUrl.pathname;

      const isAdminRoute = pathname.startsWith('/admin');
      const isProductsApiRoute = pathname.startsWith('/api/products');

      if (isAdminRoute) {
        return !!auth?.user;
      }

      if (isProductsApiRoute) {
        if (request.method === 'POST') {
          return !!auth?.user;
        }

        return true;
      }

      return true;
    },
  },
});