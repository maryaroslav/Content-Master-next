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
    const [username, setUsername] = useState(user.username);
    const [fullName, setFullName] = useState(user.fullName ?? '');
    const [bio, setBio] = useState(user.bio ?? '');
    const [status, setStatus] = useState<Status>(null);

    const applyUser = (updated: User, message: string) => {
        void queryClient.invalidateQueries({ queryKey: getUsersProfileQueryKey(user.username) });
        void queryClient.invalidateQueries({ queryKey: getUsersProfileQueryKey(updated.username) });
        updateUser(updated);
        setStatus({ kind: 'success', message });
    };
    const onError = (err: unknown) => setStatus({ kind: 'error', message: getErrorMessage(err) });

    const update = useUsersUpdateMe({ mutation: { onSuccess: (u) => applyUser(u, 'Profile saved'), onError } });
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

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const changes = {
            username: username.trim() !== user.username ? username : undefined,
            fullName: fullName.trim() !== (user.fullName ?? '') ? fullName.trim() || null : undefined,
            bio: bio.trim() !== (user.bio ?? '') ? bio.trim() || null : undefined,
        };
        const parsed = UpdateProfileRequestSchema.safeParse(changes);
        if (!parsed.success) {
            setStatus({ kind: 'error', message: parsed.error.issues[0]?.message ?? 'Please check the form' });
            return;
        }
        setStatus(null);
        update.mutate({ data: parsed.data });
    };

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
            <form className="settings-form" onSubmit={handleSubmit} noValidate>
                <div className="settings-field">
                    <label htmlFor="settings-username">Username</label>
                    <input id="settings-username" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" />
                </div>
                <div className="settings-field">
                    <label htmlFor="settings-fullname">Full name</label>
                    <input id="settings-fullname" value={fullName} onChange={(e) => setFullName(e.target.value)} autoComplete="name" />
                </div>
                <div className="settings-field">
                    <label htmlFor="settings-bio">Bio</label>
                    <textarea id="settings-bio" value={bio} onChange={(e) => setBio(e.target.value)} maxLength={1000} />
                </div>
                <button type="submit" disabled={pending}>Save</button>
            </form>
            {status && <p className={`settings-${status.kind}`}>{status.message}</p>}
        </section>
    );
}
