'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@cm/auth';

export default function RequireAuth({ children }: { children: React.ReactNode }) {
    const { status } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (status === 'unauthenticated') router.replace('/login');
    }, [status, router]);

    // The session lives in memory and is restored on the client, so the server cannot render these pages for the user.
    if (status !== 'authenticated') return <p>Loading...</p>;

    return children;
}
