import { z } from 'zod';
import { defineEndpoint } from './endpoint';
import { PaginationQuerySchema } from './common';
import {
    AuthSessionSchema,
    LoginRequestSchema,
    LoginResponseSchema,
    RegisterRequestSchema,
    TwoFactorCodeRequestSchema,
    TwoFactorLoginRequestSchema,
    TwoFactorSetupResponseSchema,
} from './auth';
import {
    ChangeEmailRequestSchema,
    FollowStatusSchema,
    UpdateProfileRequestSchema,
    UserIdParamsSchema,
    UserProfileSchema,
    UserSchema,
    UsernameParamsSchema,
} from './user';
import { CreatePostRequestSchema, PostIdParamsSchema, PostPageSchema, PostSchema } from './post';
import {
    CommunityIdParamsSchema,
    CommunityListQuerySchema,
    CommunitySchema,
    CommunitySummarySchema,
    CreateCommunityRequestSchema,
    MembershipStatusSchema,
} from './community';
import { EventSummarySchema } from './event';
import { AttachmentResponseSchema, ChatMessagePageSchema, ConversationSchema } from './chat';
import { SearchQuerySchema, SearchResponseSchema } from './search';

export const authEndpoints = {
    register: defineEndpoint({
        method: 'post', path: '/auth/register', tag: 'auth', auth: false, summary: 'Create an account',
        body: RegisterRequestSchema, response: { status: 201, schema: UserSchema }, errors: [409],
    }),
    login: defineEndpoint({
        method: 'post', path: '/auth/login', tag: 'auth', auth: false,
        summary: 'Log in; users with 2FA get a challenge instead of a session',
        body: LoginRequestSchema, response: { status: 200, schema: LoginResponseSchema },
    }),
    twoFactorLogin: defineEndpoint({
        method: 'post', path: '/auth/2fa/login', tag: 'auth', auth: false, summary: 'Finish a 2FA login',
        body: TwoFactorLoginRequestSchema, response: { status: 200, schema: AuthSessionSchema },
    }),
    refresh: defineEndpoint({
        method: 'post', path: '/auth/refresh', tag: 'auth', auth: false,
        summary: 'Exchange the refresh cookie for a new session',
        response: { status: 200, schema: AuthSessionSchema },
    }),
    logout: defineEndpoint({
        method: 'post', path: '/auth/logout', tag: 'auth', auth: false, summary: 'End the session',
        response: { status: 204 },
    }),
    twoFactorSetup: defineEndpoint({
        method: 'post', path: '/auth/2fa/setup', tag: 'auth', auth: true, summary: 'Start the 2FA setup',
        response: { status: 200, schema: TwoFactorSetupResponseSchema }, errors: [404, 409],
    }),
    twoFactorEnable: defineEndpoint({
        method: 'post', path: '/auth/2fa/enable', tag: 'auth', auth: true, summary: 'Confirm the 2FA setup',
        body: TwoFactorCodeRequestSchema, response: { status: 200, schema: UserSchema },
    }),
    twoFactorDisable: defineEndpoint({
        method: 'post', path: '/auth/2fa/disable', tag: 'auth', auth: true, summary: 'Turn 2FA off',
        body: TwoFactorCodeRequestSchema, response: { status: 200, schema: UserSchema },
    }),
};

export const userEndpoints = {
    me: defineEndpoint({
        method: 'get', path: '/users/me', tag: 'users', auth: true, summary: 'The current user',
        response: { status: 200, schema: UserSchema },
    }),
    updateMe: defineEndpoint({
        method: 'patch', path: '/users/me', tag: 'users', auth: true, summary: 'Edit the profile',
        body: UpdateProfileRequestSchema, response: { status: 200, schema: UserSchema }, errors: [409],
    }),
    changeEmail: defineEndpoint({
        method: 'put', path: '/users/me/email', tag: 'users', auth: true, summary: 'Change the login email',
        body: ChangeEmailRequestSchema, response: { status: 200, schema: UserSchema }, errors: [403, 409],
    }),
    uploadAvatar: defineEndpoint({
        method: 'put', path: '/users/me/avatar', tag: 'users', auth: true, summary: 'Upload or replace the avatar',
        upload: { field: 'avatar', maxCount: 1 }, response: { status: 200, schema: UserSchema },
    }),
    deleteAvatar: defineEndpoint({
        method: 'delete', path: '/users/me/avatar', tag: 'users', auth: true, summary: 'Remove the avatar',
        response: { status: 200, schema: UserSchema },
    }),
    myCommunities: defineEndpoint({
        method: 'get', path: '/users/me/communities', tag: 'users', auth: true, summary: 'Communities the user belongs to',
        response: { status: 200, schema: z.array(CommunitySummarySchema) },
    }),
    myEvents: defineEndpoint({
        method: 'get', path: '/users/me/events', tag: 'users', auth: true, summary: 'Events the user takes part in',
        response: { status: 200, schema: z.array(EventSummarySchema) },
    }),
    profile: defineEndpoint({
        method: 'get', path: '/users/by-username/:username', tag: 'users', auth: true, summary: 'Another user\'s profile',
        params: UsernameParamsSchema, response: { status: 200, schema: UserProfileSchema }, errors: [404],
    }),
    follow: defineEndpoint({
        method: 'put', path: '/users/:userId/follow', tag: 'users', auth: true, summary: 'Follow a user',
        params: UserIdParamsSchema, response: { status: 200, schema: FollowStatusSchema }, errors: [404],
    }),
    unfollow: defineEndpoint({
        method: 'delete', path: '/users/:userId/follow', tag: 'users', auth: true, summary: 'Unfollow a user',
        params: UserIdParamsSchema, response: { status: 200, schema: FollowStatusSchema },
    }),
};

export const postEndpoints = {
    list: defineEndpoint({
        method: 'get', path: '/posts', tag: 'posts', auth: true, summary: 'The feed, newest first',
        query: PaginationQuerySchema, response: { status: 200, schema: PostPageSchema },
    }),
    create: defineEndpoint({
        method: 'post', path: '/posts', tag: 'posts', auth: true, summary: 'Publish a post with up to 5 images',
        body: CreatePostRequestSchema, upload: { field: 'images', maxCount: 5, optional: true }, response: { status: 201, schema: PostSchema },
    }),
    delete: defineEndpoint({
        method: 'delete', path: '/posts/:postId', tag: 'posts', auth: true, summary: 'Delete an own post',
        params: PostIdParamsSchema, response: { status: 204 }, errors: [403, 404],
    }),
};

export const searchEndpoints = {
    search: defineEndpoint({
        method: 'get', path: '/search', tag: 'search', auth: true, summary: 'Find users and communities',
        query: SearchQuerySchema, response: { status: 200, schema: SearchResponseSchema },
    }),
};

export const communityEndpoints = {
    listOwned: defineEndpoint({
        method: 'get', path: '/communities', tag: 'communities', auth: true, summary: 'Communities owned by the user',
        query: CommunityListQuerySchema, response: { status: 200, schema: z.array(CommunitySchema) },
    }),
    create: defineEndpoint({
        method: 'post', path: '/communities', tag: 'communities', auth: true, summary: 'Create a community',
        body: CreateCommunityRequestSchema, upload: { field: 'photo', maxCount: 1 }, response: { status: 201, schema: CommunitySchema },
    }),
    join: defineEndpoint({
        method: 'post', path: '/communities/:communityId/membership', tag: 'communities', auth: true, summary: 'Join a community',
        params: CommunityIdParamsSchema, response: { status: 200, schema: MembershipStatusSchema }, errors: [403, 404],
    }),
    leave: defineEndpoint({
        method: 'delete', path: '/communities/:communityId/membership', tag: 'communities', auth: true, summary: 'Leave a community',
        params: CommunityIdParamsSchema, response: { status: 200, schema: MembershipStatusSchema }, errors: [404],
    }),
};

export const chatEndpoints = {
    conversations: defineEndpoint({
        method: 'get', path: '/chat/conversations', tag: 'chat', auth: true, summary: 'Followed users, latest conversation first',
        response: { status: 200, schema: z.array(ConversationSchema) },
    }),
    messages: defineEndpoint({
        method: 'get', path: '/chat/conversations/:userId/messages', tag: 'chat', auth: true,
        summary: 'Message history, newest page first',
        params: UserIdParamsSchema, query: PaginationQuerySchema, response: { status: 200, schema: ChatMessagePageSchema },
    }),
    uploadAttachment: defineEndpoint({
        method: 'post', path: '/chat/attachments', tag: 'chat', auth: true, summary: 'Upload an image for a message',
        upload: { field: 'image', maxCount: 1 }, response: { status: 201, schema: AttachmentResponseSchema },
    }),
};

export const endpoints = {
    auth: authEndpoints,
    users: userEndpoints,
    posts: postEndpoints,
    search: searchEndpoints,
    communities: communityEndpoints,
    chat: chatEndpoints,
};
