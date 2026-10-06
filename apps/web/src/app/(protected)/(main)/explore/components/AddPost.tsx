'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { useQueryClient } from '@tanstack/react-query';
import { usePostsCreate } from '@cm/api-client';
import { useAuth } from '@cm/auth';
import { CreatePostRequestSchema, endpoints } from '@cm/contracts';
import { applyServerErrors, useZodForm } from '@cm/forms';
import { feedQueryKey, prependPost, type FeedData } from './feedCache';

import userImg from '@images/icons/user.svg';
import uploadIcon from '@images/icons/imagesButton.svg';
import gifIcon from '@images/icons/gifButton.svg';
import emojiIcon from '@images/icons/emojiButton.svg';
import '@/styles/addPost.css';

const MAX_IMAGES = endpoints.posts.create.upload.maxCount;
const PostFormSchema = CreatePostRequestSchema.pick({ content: true });

export default function AddPost() {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [images, setImages] = useState<File[]>([]);
    const [imageError, setImageError] = useState<string | null>(null);
    const { register, handleSubmit, setError, reset, formState: { errors } } = useZodForm(PostFormSchema, {
        defaultValues: { content: '' },
    });

    const previews = useMemo(() => images.map((file) => URL.createObjectURL(file)), [images]);
    useEffect(() => () => previews.forEach((url) => URL.revokeObjectURL(url)), [previews]);

    const { mutateAsync: createPost, isPending } = usePostsCreate();

    const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selected = Array.from(event.target.files ?? []);
        event.target.value = '';
        if (images.length + selected.length > MAX_IMAGES) {
            setImageError(`You can attach at most ${MAX_IMAGES} images`);
            return;
        }
        setImageError(null);
        setImages([...images, ...selected]);
    };

    const onSubmit = handleSubmit(async ({ content }) => {
        if (!content) return;
        try {
            const title = content.split(/\s+/).slice(0, 2).join(' ').slice(0, 100);
            const post = await createPost({ data: { title, content, images } });
            queryClient.setQueryData<FeedData>(feedQueryKey, (data) => prependPost(data, post));
            reset();
            setImages([]);
        } catch (err) {
            applyServerErrors(setError, err, ['content']);
        }
    });

    const error = imageError ?? errors.content?.message ?? errors.root?.server?.message;

    return (
        <div className="addpost-container">
            <div className="addpost-input-wrapper">
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div className="addpost-user-img">
                        <Image
                            src={user?.profilePicture ?? userImg}
                            alt=""
                            width={40}
                            height={40}
                            style={{ borderRadius: '50%' }}
                        />
                    </div>
                    <div className="addpost-input">
                        <input
                            type="text"
                            placeholder="Share your thoughts or a post"
                            disabled={isPending}
                            {...register('content')}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter') {
                                    event.preventDefault();
                                    void onSubmit();
                                }
                            }}
                        />
                        <div className="addpost-buttons">
                            <label style={{ cursor: 'pointer' }}>
                                <Image src={uploadIcon} alt="Upload Photo" />
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleImageSelect}
                                    style={{ display: 'none' }}
                                />
                            </label>
                            <button type="button">
                                <Image src={gifIcon} alt="Upload GIF" />
                            </button>
                            <button type="button">
                                <Image src={emojiIcon} alt="Choose Emoji" />
                            </button>
                        </div>
                    </div>
                </div>
                {error && <p className="addpost-error">{error}</p>}
                {previews.length > 0 && (
                    <div className="addpost-previews">
                        {previews.map((src, i) => (
                            <div key={src} className="preview-item">
                                {/* eslint-disable-next-line @next/next/no-img-element -- blob: previews gain nothing from next/image */}
                                <img src={src} alt={`preview-${i}`} />
                                <button
                                    type="button"
                                    onClick={() => setImages(images.filter((_, index) => index !== i))}
                                >&times;</button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
