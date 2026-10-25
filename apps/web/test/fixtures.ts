import type { ChatMessage, Post, User, UserProfile } from '@cm/api-client';

export const me: User = {
    id: 1,
    username: 'alice',
    email: 'alice@example.com',
    fullName: 'Alice Novak',
    bio: null,
    profilePicture: null,
    role: 'user',
    twoFactorEnabled: false,
    createdAt: '2026-10-01T08:00:00.000Z',
};

export const bobProfile: UserProfile = {
    id: 2,
    username: 'bob',
    fullName: 'Bob Dvorak',
    bio: null,
    profilePicture: null,
    followersCount: 4,
    isFollowing: false,
};

export const post = (id: number, content: string): Post => ({
    id,
    title: null,
    content,
    images: [],
    authorId: me.id,
    createdAt: '2026-10-10T10:00:00.000Z',
    updatedAt: '2026-10-10T10:00:00.000Z',
    author: { id: me.id, username: me.username, profilePicture: null },
});

export const message = (id: number, fromUserId: number, toUserId: number, content: string, createdAt = '2026-10-12T10:00:00.000Z'): ChatMessage => ({
    id,
    fromUserId,
    toUserId,
    content,
    attachments: [],
    type: 'text',
    createdAt,
});
