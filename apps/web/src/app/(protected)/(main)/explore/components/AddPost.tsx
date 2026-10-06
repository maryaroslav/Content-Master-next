'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { useQueryClient } from '@tanstack/react-query';
import { getErrorMessage, usePostsCreate } from '@cm/api-client';
import { useAuth } from '@cm/auth';
import { CreatePostRequestSchema, endpoints } from '@cm/contracts';
import { feedQueryKey, prependPost, type FeedData } from './feedCache';

import userImg from '@images/icons/user.svg';
import uploadIcon from '@images/icons/imagesButton.svg';
import gifIcon from '@images/icons/gifButton.svg';
import emojiIcon from '@images/icons/emojiButton.svg';
import '@/styles/addPost.css';

const MAX_IMAGES = endpoints.posts.create.upload.maxCount;

export default function AddPost() {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [content, setContent] = useState('');
    const [images, setImages] = useState<File[]>([]);
    const [error, setError] = useState<string | null>(null);

    const previews = useMemo(() => images.map((file) => URL.createObjectURL(file)), [images]);
    useEffect(() => () => previews.forEach((url) => URL.revokeObjectURL(url)), [previews]);

    const { mutate: createPost, isPending } = usePostsCreate({
        mutation: {
            onSuccess: (post) => {
                queryClient.setQueryData<FeedData>(feedQueryKey, (data) => prependPost(data, post));
                setContent('');
                setImages([]);
            },
            onError: (err) => setError(getErrorMessage(err)),
        },
    });

    const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selected = Array.from(event.target.files ?? []);
        event.target.value = '';
        if (images.length + selected.length > MAX_IMAGES) {
            setError(`You can attach at most ${MAX_IMAGES} images`);
            return;
        }
        setError(null);
        setImages([...images, ...selected]);
    };

    const handleSubmit = () => {
        if (isPending || !content.trim()) return;
        const parsed = CreatePostRequestSchema.safeParse({
            title: content.trim().split(/\s+/).slice(0, 2).join(' ').slice(0, 100),
            content,
        });
        if (!parsed.success) {
            setError(parsed.error.issues[0]?.message ?? 'Please check the post');
            return;
        }
        setError(null);
        createPost({ data: { ...parsed.data, images } });
    };

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
                            value={content}
                            disabled={isPending}
                            onChange={(event) => setContent(event.target.value)}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter') {
                                    event.preventDefault();
                                    handleSubmit();
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
