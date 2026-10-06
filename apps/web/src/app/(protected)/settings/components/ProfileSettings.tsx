'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { useQueryClient } from '@tanstack/react-query';
import {
    getErrorMessage,
    getUsersProfileQueryKey,
    useUsersDeleteAvatar,
    useUsersUpdateMe,
    useUsersUploadAvatar,
    type User,
} from '@cm/api-client';
import { updateUser, useAuth } from '@cm/auth';
import { UpdateProfileRequestSchema } from '@cm/contracts';
import { applyServerErrors, useZodForm } from '@cm/forms';

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
    const onError = (err: unknown) => setStatus({ kind: 'error', message: getErrorMessage(err) });

    const update = useUsersUpdateMe();
    const uploadAvatar = useUsersUploadAvatar({ mutation: { onSuccess: (u) => applyUser(u, 'Avatar updated'), onError } });
    const deleteAvatar = useUsersDeleteAvatar({ mutation: { onSuccess: (u) => applyUser(u, 'Avatar removed'), onError } });
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
            setError('root.server', { message: 'Nothing to update' });
            return;
        }
        try {
            applyUser(await update.mutateAsync({ data: changes }), 'Profile saved');
        } catch (err) {
            applyServerErrors(setError, err, ['username', 'fullName', 'bio']);
        }
    });

    const formError = errors.username?.message ?? errors.fullName?.message ?? errors.bio?.message ?? errors.root?.server?.message;

    return (
        <section className="settings-card">
            <h2>Profile</h2>
            <div className="settings-avatar">
                <Image src={user.profilePicture ?? userImg} alt="" width={72} height={72} />
                <input type="file" accept="image/*" ref={fileInputRef} onChange={handleAvatar} style={{ display: 'none' }} />
                <button type="button" disabled={pending} onClick={() => fileInputRef.current?.click()}>Upload photo</button>
                {user.profilePicture && (
                    <button type="button" className="secondary" disabled={pending} onClick={() => { setStatus(null); deleteAvatar.mutate(); }}>
                        Remove
                    </button>
                )}
            </div>
            <form className="settings-form" onSubmit={onSubmit} noValidate>
                <div className="settings-field">
                    <label htmlFor="settings-username">Username</label>
                    <input id="settings-username" autoComplete="username" {...register('username')} />
                </div>
                <div className="settings-field">
                    <label htmlFor="settings-fullname">Full name</label>
                    <input id="settings-fullname" autoComplete="name" {...register('fullName')} />
                </div>
                <div className="settings-field">
                    <label htmlFor="settings-bio">Bio</label>
                    <textarea id="settings-bio" maxLength={1000} {...register('bio')} />
                </div>
                <button type="submit" disabled={pending}>Save</button>
            </form>
            {formError && <p className="settings-error">{formError}</p>}
            {!formError && status && <p className={`settings-${status.kind}`}>{status.message}</p>}
        </section>
    );
}
