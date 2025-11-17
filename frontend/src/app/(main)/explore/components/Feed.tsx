"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import AddPost from './AddPost';
import { useSelector, useDispatch } from 'react-redux';
import { setPosts, deletePost, type Post as ReducerPost } from '@/reducers/postsSlice';
import { fetchWithAuth } from '@/app/lib/apiClient';
import '@/styles/feed.css';
import PostOptionsModal from './PostOptionsModal';

interface User {
  user_id?: number;
}

type RootState = {
  posts?: {
    list?: ReducerPost[];
  };
};

const Feed: React.FC = () => {
  const dispatch = useDispatch();
  const posts = useSelector((state: RootState) => state.posts?.list || []);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const fetchPostsFromServer = async () => {
    try {
      const data: unknown = await fetchWithAuth('http://localhost:5000/api/posts');
      console.log(data);

      // runtime guard: ensure data is an array of objects that contain post_id
      if (!Array.isArray(data)) {
        console.error('Invalid posts response, expected array', data);
        return;
      }

      const postsData = data.filter(
        (item): item is ReducerPost =>
          typeof item === 'object' && item !== null && 'post_id' in item
      );

      dispatch(setPosts(postsData));
    } catch (err) {
      console.error('Error loading posts:', err);
    }
  };

  const isUser = (u: unknown): u is User =>
    typeof u === 'object' && u !== null && 'user_id' in u;

  const fetchCurrentUser = async () => {
    try {
      const user: unknown = await fetchWithAuth('http://localhost:5000/api/user/me');

      if (!isUser(user)) {
        console.error('Invalid user response', user);
        return;
      }

      setCurrentUser(user);
    } catch (err) {
      console.error('Error fetching current user:', err);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
    fetchPostsFromServer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="feed-container">
      <AddPost onPostCreated={fetchPostsFromServer} />
      <div className="feed-posts-container">
        {posts.map((post) => (
          <FeedPost
            key={String(post.post_id)}
            post={post}
            currentUserId={currentUser?.user_id}
          />
        ))}
      </div>
    </div>
  );
};

interface FeedPostProps {
  post: ReducerPost;
  currentUserId?: number | string;
}

const FeedPost: React.FC<FeedPostProps> = ({ post, currentUserId }) => {
  const [expanded, setExpanded] = useState<boolean>(false);
  const [orientation, setOrientation] = useState<'vertical' | 'horizontal' | null>(null);
  const dispatch = useDispatch();

  const handleImageLoad = (result: { naturalWidth: number; naturalHeight: number }) => {
    const { naturalWidth, naturalHeight } = result;
    const orient = naturalHeight > naturalWidth ? 'vertical' : 'horizontal';
    setOrientation(orient);
    if (orient === 'vertical') {
      setExpanded(true);
    }
  };

  const handleDelete = async () => {
    try {
      await fetchWithAuth(`http://localhost:5000/api/posts/${post.post_id}`, {
        method: 'DELETE'
      });

      dispatch(deletePost(post.post_id));
    } catch (err) {
      console.error('Error when deleting a post: ', err);
    }
  };

  const isOwner = String(currentUserId) === String(post.author_id);

  const images = Array.isArray(post.image_url)
    ? post.image_url
    : post.image_url
      ? [post.image_url]
      : [];

  return (
    <div className="feed-posts-user">
      <div className="feed-user-avatar">
        <Image
          src={
            post.author?.profile_picture
              ? `http://localhost:5000/uploads${post.author.profile_picture}`
              : '/img/icons/user.svg'
          }
          alt={post.author?.username || 'user'}
          width={50}
          height={50}
          style={{ borderRadius: '50%' }}
        />
      </div>
      <div className="feed-posts-info">
        <p>{post.title}</p>
        <div className="feed-info" style={{ position: 'relative' }}>
          <p className="feed-info-p p-blue">{post.author?.username}</p>
          <div className="separator"></div>
          <p className="feed-info-p p-grey">
            {post.created_at
              ? new Date(post.created_at).toLocaleString('cs-CZ', {
                hour: '2-digit',
                minute: '2-digit',
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                timeZone: 'Europe/Prague'
              })
              : ''}
          </p>
          {isOwner && (
            <PostOptionsModal
              onDelete={handleDelete}
              onEdit={() => console.log('edit')}
            />
          )}
        </div>
        <div className={`feed-post-title-img ${orientation === 'vertical' ? 'vertical' : 'horizontal'}`}>
          <div style={{ display: 'flex' }}>
            {images.map((img, i) => (
              <div key={i} className={`feed-posts-image ${orientation ?? ''}`}>
                <Image
                  src={img.startsWith('http') ? img : `http://localhost:5000${img}`}
                  alt="post"
                  onLoadingComplete={handleImageLoad}
                  width={500}
                  height={300}
                />
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
};

export default Feed;
