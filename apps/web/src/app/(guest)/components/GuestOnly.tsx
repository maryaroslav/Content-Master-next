'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@cm/auth';

export default function GuestOnly({ children }: { children: React.ReactNode }) {
    const { status } = useAuth();
    const router = useRouter();

    // Also the way out of the forms: a successful login or registration turns the status to authenticated.
    useEffect(() => {
        if (status === 'authenticated') router.replace('/explore');
    }, [status, router]);

    if (status === 'authenticated') return null;

    return children;
}
