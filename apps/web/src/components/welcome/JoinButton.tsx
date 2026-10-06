'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@cm/auth';
import { ship } from './illustrations';

export default function JoinButton() {
    const { status } = useAuth();
    return (
        <div className="info-button">
            <Link href={status === 'authenticated' ? '/explore' : '/login'}>
                Join Content Master Community <Image src={ship} alt="" />
            </Link>
        </div>
    );
}
