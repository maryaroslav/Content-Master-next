
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { getSession } from "next-auth/react";
import user from '@images/icons/user.svg';
import uploadIcon from '@images/icons/imagesButton.svg';
import gifIcon from '@images/icons/gifButton.svg';
import emojiIcon from '@images/icons/emojiButton.svg';
// import defaultImage from '@images/icons/13.svg'
import '@/styles/addPost.css';

interface AddPostProps {
    onPostCreated?: () => void;
}

interface UserData {
    profile_picture?: string;
}

const AddPost: React.FC<AddPostProps> = ({ onPostCreated }) => {
    const [postContent, setPostContent] = useState<string>('');
    const [images, setImages] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [userData, setUserData] = useState<UserData | null>(null);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files ? Array.from(e.target.files) : [];
        const combined = [...images, ...files];

        if (combined.length > 5) {
            alert('You can select a maximum of 5 images');
            return;
        }

        setImages(combined);
        setPreviews((prev) => [...prev, ...files.map((file) => URL.createObjectURL(file))]);
    };

    const handleSubmit = async () => {
        if (!postContent.trim()) return;

        const formData = new FormData();
        formData.append('title', postContent.trim().split(' ').slice(0, 2).join(' '));
        formData.append('content', postContent);
        images.forEach((img) => {
            formData.append('images', img);
        });

        try {
            const session = await getSession();
            const token = (session as unknown as { accessToken?: string } | null)?.accessToken;

            const res = await fetch('http://localhost:5000/api/posts', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData
            });

            if (!res.ok) throw new Error('Error creating a post');
            setPostContent('');
            setImages([]);
            setPreviews([]);
            onPostCreated?.();
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err);
            console.error('[create post error]', message);
        }
    };

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const session = await getSession();
                const token = (session as unknown as { accessToken?: string } | null)?.accessToken;

                const res = await fetch('http://localhost:5000/api/user/me', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                if (!res.ok) throw new Error('Failed to load user');
                const data = await res.json();
                setUserData(data);
            } catch (err: unknown) {
                console.error('[fetch user error]', err instanceof Error ? err.message : err);
            }
        };

        fetchUser();
    }, []);


    return (
        <div className="addpost-container">

            <div className="addpost-input-wrapper">
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div className="addpost-user-img">
                        {userData?.profile_picture ? (
                            <Image
                                src={`http://localhost:5000/uploads${userData.profile_picture}`}
                                alt="user-avatar"
                                width={40}
                                height={40}
                                style={{ borderRadius: '50%' }}
                            />
                        ) : (
                            <Image
                                src={user}
                                alt="default-avatar"
                                width={40}
                                height={40}
                            />
                        )}
                    </div>
                    <div className="addpost-input">
                        <input
                            type="text"
                            placeholder='Share your thoughts or a post'
                            value={postContent}
                            onChange={(e) => setPostContent(e.target.value)}
                            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
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
                                    onChange={handleImageUpload}
                                    style={{ display: 'none' }}
                                />
                            </label>
                            <button>
                                <Image src={gifIcon} alt="Upload GIF" />
                            </button>
                            <button>
                                <Image src={emojiIcon} alt="Choose Emoji" />
                            </button>
                        </div>
                    </div>
                </div>
                {previews.length > 0 && (
                    <div className="addpost-previews">
                        {previews.map((src, i) => (
                            <div key={i} className="preview-item">
                                <img src={src} alt={`preview-${i}`} />
                                <button
                                    onClick={() => {
                                        const newImages = [...images];
                                        const newPreviews = [...previews];
                                        newImages.splice(i, 1);
                                        newPreviews.splice(i, 1);
                                        setImages(newImages);
                                        setPreviews(newPreviews);
                                    }}
                                >&times;</button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default AddPost;