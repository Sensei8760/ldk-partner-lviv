import 'next-auth';
import '@auth/core/jwt';

declare module 'next-auth' {
  interface User {
    role?: string;
    username?: string;
  }

  interface Session {
    user: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string;
      username?: string;
    };
  }
}

declare module '@auth/core/jwt' {
  interface JWT {
    role?: string;
    username?: string;
  }
}