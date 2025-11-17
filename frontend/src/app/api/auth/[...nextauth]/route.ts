import NextAuth, { type NextAuthOptions, type User as NextAuthUser } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import axios, { type AxiosError } from 'axios';

declare module 'next-auth' {
    interface Session {
        accessToken?: string;
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        accessToken?: string;
    }
}

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'text' },
                password: { label: 'Password', type: 'password' },
                twoFAToken: { label: '2FA Token', type: 'text' },
                userId: { label: 'UserId', type: 'text' },
            },
            async authorize(
                credentials: Record<'email' | 'password' | 'twoFAToken' | 'userId', string> | undefined,
            ): Promise<NextAuthUser | null> {
                const email = credentials?.email;
                const password = credentials?.password;
                const twoFAToken = credentials?.twoFAToken;
                const userId = credentials?.userId;

                console.log('[NEXTAUTH] JWT_SECRET:', process.env.JWT_SECRET);

                try {
                    if (twoFAToken && userId) {
                        const res = await axios.post('http://localhost:5000/api/auth/2fa/verify-login', {
                            userId,
                            token: twoFAToken
                        });
                        const { token, user } = res.data as { token?: string; user: { id: string | number; email?: string; name?: string;[k: string]: unknown } };

                        const returnedUser: NextAuthUser & { token?: string } = {
                            id: String(user.id),
                            email: typeof user.email === 'string' ? user.email : undefined,
                            name: typeof user.name === 'string' ? user.name : undefined,
                            ...(token ? { token } : {})
                        };

                        return returnedUser;
                    } else {
                        const res = await axios.post('http://localhost:5000/api/auth/login', {
                            email,
                            password
                        });

                        if (res.data?.twofaRequired) {
                            const error = new Error('2FA Required');
                            error.name = 'TwoFA';
                            error.message = JSON.stringify({ twofaRequired: true, userId: res.data.userId });
                            throw error;
                        }

                        const { token, user } = res.data as { token?: string; user: { id: string | number; email?: string; name?: string;[k: string]: unknown } };

                        const returnedUser: NextAuthUser & { token?: string } = {
                            id: String(user.id),
                            email: typeof user.email === 'string' ? user.email : undefined,
                            name: typeof user.name === 'string' ? user.name : undefined,
                            ...(token ? { token } : {})
                        };

                        return returnedUser;
                    }
                } catch (err: unknown) {
                    if (err instanceof Error && err.name === 'TwoFA') throw err;

                    const axiosErr = err as AxiosError | undefined;
                    let message = 'Login failed';

                    if (axiosErr?.response) {
                        const data = axiosErr.response.data as Record<string, unknown> | string | undefined;
                        if (typeof data === 'object' && data !== null && 'message' in data && typeof (data as Record<string, unknown>)['message'] === 'string') {
                            message = (data as Record<string, unknown>)['message'] as string;
                        } else if (typeof data === 'string') {
                            message = data;
                        }
                    } else if (err instanceof Error) {
                        message = err.message;
                    }

                    throw new Error(message);
                }
            }
        })
    ],
    session: {
        strategy: 'jwt'
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                const u = user as unknown as Record<string, unknown>;
                const t = token as Record<string, unknown>;
                if ('id' in u) t['id'] = u['id'];
                if ('email' in u) t['email'] = u['email'];
                if ('token' in u && typeof u['token'] === 'string') t['accessToken'] = u['token'];
            }
            return token;
        },
        async session({ session, token }) {
            const t = token as Record<string, unknown>;
            const su = (session.user ?? {}) as Record<string, unknown>;
            if (t['id'] !== undefined) su['id'] = t['id'];
            if (t['email'] !== undefined) su['email'] = t['email'];
            session.accessToken = typeof t['accessToken'] === 'string' ? t['accessToken'] : undefined;
            return session;
        }
    },
    pages: {
        signIn: '/login'
    },
    secret: process.env.JWT_SECRET,
    debug: true
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
