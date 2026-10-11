'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useAuth } from '@cm/auth';
import { ship } from './illustrations';

export default function JoinButton() {
    const { status } = useAuth();
    const t = useTranslations('welcome');
    return (
        <div className="info-button">
            <Link href={status === 'authenticated' ? '/explore' : '/login'}>
                {t('join')} <Image src={ship} alt="" />
            </Link>
        </div>
    );
}
