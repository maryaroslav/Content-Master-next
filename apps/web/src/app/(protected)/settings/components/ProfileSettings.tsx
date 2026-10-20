'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { useQueryClient } from '@tanstack/react-query';
import {
    getUsersProfileQueryKey,
    useUsersDeleteAvatar,
    useUsersUpdateMe,
    useUsersUploadAvatar,
    type User,
} from '@cm/api-client';
import { updateUser, useAuth } from '@cm/auth';
import { useTranslations } from 'next-intl';
import { UpdateProfileRequestSchema } from '@cm/contracts';
import { applyServerErrors, useZodForm } from '@cm/forms';
import { useErrorText } from '@/i18n/useErrorText';

import userImg from '@images/icons/user.svg';

type Status = { kind: 'error' | 'success'; message: string } | null;

export default function ProfileSettings() {
    const { user } = useAuth();
    if (!user) return null;
    return <ProfileForm user={user} />;
}

function ProfileForm({ user }: { user: User }) {
    const queryClient = useQueryClient();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const t = useTranslations('settings.profile');
    const errorText = useErrorText();
    const [status, setStatus] = useState<Status>(null);
    const { register, handleSubmit, setError, formState: { errors } } = useZodForm(UpdateProfileRequestSchema, {
        defaultValues: { username: user.username, fullName: user.fullName ?? '', bio: user.bio ?? '' },
    });

    const applyUser = (updated: User, message: string) => {
        void queryClient.invalidateQueries({ queryKey: getUsersProfileQueryKey(user.username) });
        void queryClient.invalidateQueries({ queryKey: getUsersProfileQueryKey(updated.username) });
        updateUser(updated);
        setStatus({ kind: 'success', message });
    };
    const onError = (err: unknown) => setStatus({ kind: 'error', message: errorText.request(err) ?? '' });

    const update = useUsersUpdateMe();
    const uploadAvatar = useUsersUploadAvatar({ mutation: { onSuccess: (u) => applyUser(u, t('avatarUpdated')), onError } });
    const deleteAvatar = useUsersDeleteAvatar({ mutation: { onSuccess: (u) => applyUser(u, t('avatarRemoved')), onError } });
    const pending = update.isPending || uploadAvatar.isPending || deleteAvatar.isPending;

    const handleAvatar = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        event.target.value = '';
        if (!file) return;
        setStatus(null);
        uploadAvatar.mutate({ data: { avatar: file } });
    };

    const onSubmit = handleSubmit(async ({ username, fullName, bio }) => {
        setStatus(null);
        const changes = {
            username: username !== user.username ? username : undefined,
            fullName: (fullName || null) !== user.fullName ? fullName || null : undefined,
            bio: (bio || null) !== user.bio ? bio || null : undefined,
        };
        if (Object.values(changes).every((value) => value === undefined)) {
            setError('root.server', { type: 'NOTHING_TO_UPDATE' });
            return;
        }
        try {
            applyUser(await update.mutateAsync({ data: changes }), t('saved'));
        } catch (err) {
            applyServerErrors(setError, err, ['username', 'fullName', 'bio']);
        }
    });

    const formError = errorText.field(errors.username, 'username')
        ?? errorText.field(errors.fullName, 'fullName')
        ?? errorText.field(errors.bio, 'bio')
        ?? errorText.form(errors.root?.server);

    return (
        <section className="settings-card">
            <h2>{t('title')}</h2>
            <div className="settings-avatar">
                <Image src={user.profilePicture ?? userImg} alt="" width={72} height={72} />
                <input type="file" accept="image/*" ref={fileInputRef} onChange={handleAvatar} style={{ display: 'none' }} />
                <button type="button" disabled={pending} onClick={() => fileInputRef.current?.click()}>{t('uploadPhoto')}</button>
                {user.profilePicture && (
                    <button type="button" className="secondary" disabled={pending} onClick={() => { setStatus(null); deleteAvatar.mutate(); }}>
                        {t('removePhoto')}
                    </button>
                )}
            </div>
            <form className="settings-form" onSubmit={onSubmit} noValidate>
                <div className="settings-field">
                    <label htmlFor="settings-username">{t('username')}</label>
                    <input id="settings-username" autoComplete="username" {...register('username')} />
                </div>
                <div className="settings-field">
                    <label htmlFor="settings-fullname">{t('fullName')}</label>
                    <input id="settings-fullname" autoComplete="name" {...register('fullName')} />
                </div>
                <div className="settings-field">
                    <label htmlFor="settings-bio">{t('bio')}</label>
                    <textarea id="settings-bio" maxLength={1000} {...register('bio')} />
                </div>
                <button type="submit" disabled={pending}>{t('save')}</button>
            </form>
            {formError && <p className="settings-error">{formError}</p>}
            {!formError && status && <p className={`settings-${status.kind}`}>{status.message}</p>}
        </section>
    );
}
