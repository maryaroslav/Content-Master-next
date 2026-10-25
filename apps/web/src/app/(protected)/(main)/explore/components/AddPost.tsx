'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { usePostsCreate } from '@cm/api-client';
import { useAuth } from '@cm/auth';
import { CreatePostRequestSchema, endpoints } from '@cm/contracts';
import { parseServerErrors } from '@cm/forms';
import { PostComposer, UserAvatar } from '@cm/ui';
import { feedQueryKey, prependPost, type FeedData } from './feedCache';
import { useErrorText } from '@/i18n/useErrorText';

const MAX_IMAGES = endpoints.posts.create.upload.maxCount;
const PostFormSchema = CreatePostRequestSchema.pick({ content: true });

export default function AddPost() {
    const { user } = useAuth();
    const t = useTranslations('feed');
    const errorText = useErrorText();
    const queryClient = useQueryClient();
    const [error, setError] = useState<string>();
    const { mutateAsync: createPost, isPending } = usePostsCreate();

    const submit = async ({ text, images }: { text: string; images: File[] }) => {
        setError(undefined);
        const parsed = PostFormSchema.safeParse({ content: text });
        if (!parsed.success) {
            const issue = parsed.error.issues[0]!;
            setError(errorText.field({ type: issue.code, message: issue.message }, 'content'));
            return false;
        }
        const content = parsed.data.content ?? '';
        const title = content.split(/\s+/).slice(0, 2).join(' ').slice(0, 100);
        try {
            const post = await createPost({ data: { title, content, images } });
            queryClient.setQueryData<FeedData>(feedQueryKey, (data) => prependPost(data, post));
            return true;
        } catch (err) {
            const { fields, code, message } = parseServerErrors(err);
            setError(fields.content ?? errorText.form({ type: code, message }));
            return false;
        }
    };

    return (
        <PostComposer
            avatar={user ? <UserAvatar name={user.username} src={user.profilePicture} decorative /> : undefined}
            maxImages={MAX_IMAGES}
            submitting={isPending}
            error={error}
            onSubmit={submit}
            labels={{
                text: t('text'),
                placeholder: t('placeholder'),
                addImages: t('uploadPhoto'),
                removeImage: t('removeImage'),
                submit: t('submit'),
                tooManyImages: t('maxImages', { max: MAX_IMAGES }),
            }}
        />
    );
}
