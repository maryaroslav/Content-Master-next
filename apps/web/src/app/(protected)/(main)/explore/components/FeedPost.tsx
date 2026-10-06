'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { Post } from '@cm/api-client';
import { useAuth } from '@cm/auth';
import PostOptionsModal from './PostOptionsModal';

import userImg from '@images/icons/user.svg';

interface FeedPostProps {
    post: Post;
    onDelete: () => void;
    deleteError?: string;
}

export default function FeedPost({ post, onDelete, deleteError }: FeedPostProps) {
    const { user } = useAuth();
    const [expanded, setExpanded] = useState(false);
    const [orientation, setOrientation] = useState<'vertical' | 'horizontal' | null>(null);

    const handleImageLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
        const { naturalWidth, naturalHeight } = event.currentTarget;
        const orient = naturalHeight > naturalWidth ? 'vertical' : 'horizontal';
        setOrientation(orient);
        if (orient === 'vertical') setExpanded(true);
    };

    return (
        <div className="feed-posts-user">
            <div className="feed-user-avatar">
                <Image
                    src={post.author.profilePicture ?? userImg}
                    alt={post.author.username}
                    width={50}
                    height={50}
                    style={{ borderRadius: '50%' }}
                />
            </div>
            <div className="feed-posts-info">
                <p>{post.title}</p>
                <div className="feed-info" style={{ position: 'relative' }}>
                    <p className="feed-info-p p-blue">{post.author.username}</p>
                    <div className="separator"></div>
                    <p className="feed-info-p p-grey">
                        {new Date(post.createdAt).toLocaleString('cs-CZ', {
                            hour: '2-digit',
                            minute: '2-digit',
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            timeZone: 'Europe/Prague',
                        })}
                    </p>
                    {user?.id === post.authorId && (
                        <PostOptionsModal onDelete={onDelete} />
                    )}
                </div>
                {deleteError && <p className="feed-error">{deleteError}</p>}
                <div className={`feed-post-title-img ${orientation === 'vertical' ? 'vertical' : 'horizontal'}`}>
                    <div style={{ display: 'flex' }}>
                        {post.images.map((src) => (
                            <div key={src} className={`feed-posts-image ${orientation ?? ''}`}>
                                <Image src={src} alt="post" onLoad={handleImageLoad} width={500} height={300} />
                            </div>
                        ))}
                    </div>
                    <div className={`feed-posts-title ${expanded ? 'expanded' : ''}`}>
                        <p>{post.content}</p>
                    </div>
                    {orientation === 'horizontal' && (
                        <span className="view-more" onClick={() => setExpanded(!expanded)}>
                            {expanded ? 'View Less' : '... View More'}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
