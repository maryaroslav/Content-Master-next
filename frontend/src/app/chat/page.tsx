"use client";

import { useEffect, useRef, useState } from "react";
import { getSession } from "next-auth/react";
import Image from "next/image";
import { io, Socket } from "socket.io-client";
import { useSearchParams } from "next/navigation";

import { fetchWithAuth } from "../lib/apiClient";
import useFollowedUsers, { FollowedUser } from '@/components/userListContainer';
import HeaderMain from "@/components/headers/HeaderMain";

import userImg from '@images/icons/user.svg';
import clipSVG from '@images/icons/clip.svg';

import '@/styles/chat.css';

interface Message {
    created_at: string;
    from_user_id: number;
    to_user_id: number;
    content?: string | null;
    message?: string | null;
    type?: string | null;
    media_url?: string | null;
    FromUser?: {
        username?: string;
        profile_picture?: string | null;
    } | null;
}

const getTokenFromSession = (session: unknown): string | undefined => {
    if (!session || typeof session !== "object") return undefined;
    const s = session as Record<string, unknown>;
    const v1 = s.accessToken ?? s.access_token;
    if (typeof v1 === "string") return v1;
    const user = s.user as Record<string, unknown> | undefined;
    if (user) {
        const v2 = user.accessToken ?? user.access_token;
        if (typeof v2 === "string") return v2;
    }
    return undefined;
};

const decodeJwtPayload = (token: string): Record<string, unknown> | null => {
    try {
        const parts = token.split(".");
        if (parts.length < 2) return null;
        const payload = JSON.parse(atob(parts[1]));
        return typeof payload === "object" && payload !== null ? (payload as Record<string, unknown>) : null;
    } catch {
        return null;
    }
};

export default function ChatPage() {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [chat, setChat] = useState<Message[]>([]);
    const [message, setMessage] = useState<string>('');
    const [currentUserId, setCurrentUserId] = useState<number | null>(null);
    const [currentUserProfile, setCurrentUserProfile] = useState<{ username?: string; profile_picture?: string | null } | null>(null);
    const [unreadMap, setUnreadMap] = useState<Record<number, boolean>>({});
    const followed = useFollowedUsers(chat);
    const chatMessagesRef = useRef<HTMLDivElement | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const toUserIdRef = useRef<number | null>(null);
    const searchParams = useSearchParams();
    const urlToUserId = searchParams?.get('to') ?? null;

    const initialToUserId = (() => {
        const n = urlToUserId ? Number(urlToUserId) : NaN;
        return !Number.isNaN(n) ? n : null;
    })();

    const [toUserId, setToUserId] = useState<number | null>(initialToUserId);

    useEffect(() => {
        toUserIdRef.current = toUserId;
    }, [toUserId]);

    useEffect(() => {
        if (!toUserId) return;

        const loadHistory = async (): Promise<void> => {
            try {
                const session = await getSession();
                const token = getTokenFromSession(session);
                if (!token) return;

                const res = await fetch(`http://localhost:5000/api/chat/message/${toUserId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                if (!res.ok) {
                    console.error('[history] failed to fetch messages', res.status);
                    return;
                }
                const messages = (await res.json()) as unknown;
                if (!Array.isArray(messages)) return;

                setChat(prev => {
                    const newIds = new Set(prev.map(m => `${m.created_at}-${m.from_user_id}`));
                    const merged = [...prev];
                    for (const raw of messages) {
                        const m = raw as Message;
                        const key = `${m.created_at}-${m.from_user_id}`;
                        if (!newIds.has(key)) {
                            merged.push(m);
                        }
                    }
                    return merged;
                });
            } catch (err) {
                console.error('Error loading history: ', err);
            }
        };

        void loadHistory();
    }, [toUserId]);

    useEffect(() => {
        let mounted = true;
        let newSocket: Socket | null = null;

        const setupSocket = async (): Promise<void> => {
            try {
                const session = await getSession();
                const token = getTokenFromSession(session);
                if (!token) return;

                newSocket = io('http://localhost:5000', {
                    auth: {
                        token: `Bearer ${token}`
                    }
                });

                const payload = decodeJwtPayload(token);
                const userId = payload && typeof payload.user_id === 'number' ? payload.user_id : undefined;
                if (typeof userId === 'number') setCurrentUserId(userId);

                const profileRaw = await fetchWithAuth('http://localhost:5000/api/user/me', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }) as unknown;
                if (mounted && profileRaw && typeof profileRaw === 'object') {
                    const p = profileRaw as { username?: string; profile_picture?: string | null };
                    setCurrentUserProfile(p);
                }

                newSocket.on('private_message', (data: Message) => {
                    console.log('[socket] received:', data);

                    if (!userId) return;

                    //   const isCurrentChat =
                    //     (data.from_user_id === toUserIdRef.current && data.to_user_id === userId) ||
                    //     (data.from_user_id === userId && data.to_user_id === toUserIdRef.current);

                    setChat((prev) => {
                        const exists = prev.some(m =>
                            new Date(m.created_at).getTime() === new Date(data.created_at).getTime() &&
                            m.from_user_id === data.from_user_id
                        );
                        if (exists) return prev;

                        const normalized: Message = {
                            ...data,
                            content: data.content ?? data.message ?? ''
                        };

                        return [...prev, normalized];
                    });

                    if (
                        toUserIdRef.current !== data.from_user_id &&
                        data.from_user_id !== currentUserId
                    ) {
                        setUnreadMap((prev) => ({
                            ...prev,
                            [data.from_user_id]: true
                        }));
                    }
                });

                newSocket.on('connect_error', (err: Error & { message?: string }) => {
                    console.error('Connection error', err?.message ?? err);
                });

                setSocket(newSocket);
            } catch (err) {
                console.error('Socket setup error:', err);
            }
        };

        void setupSocket();

        return () => {
            mounted = false;
            if (newSocket) {
                newSocket.disconnect();
                newSocket = null;
            }
        };
    }, [currentUserId]);

    useEffect(() => {
        const textarea = document.querySelector<HTMLTextAreaElement>('.textarea-auto');
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = `${textarea.scrollHeight}px`;
        }
    }, [message]);

    useEffect(() => {
        if (chatMessagesRef.current) {
            chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
        }
    }, [chat]);

    const selectToUser = (id: number | null): void => {
        setToUserId(id);
        if (id !== null) {
            setUnreadMap(prev => {
                const updated = { ...prev };
                delete updated[id];
                return updated;
            });
        }
    };

    useEffect(() => {
        toUserIdRef.current = toUserId;
    }, [toUserId]);

    const sendMessage = (): void => {
        if (!socket || !toUserId || !message.trim()) return;
        socket.emit('private_message', {
            toUserId: Number(toUserId),
            message: String(message),
            type: 'text'
        });
        setMessage('');
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);

        const session = await getSession();
        const token = getTokenFromSession(session);
        if (!token) return;

        const res = await fetch('http://localhost:5000/api/chat/upload', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`
            },
            body: formData
        });

        if (!res.ok) {
            console.error('[upload] Failed to upload image');
            return;
        }

        const data = await res.json() as { url?: string };
        if (!data?.url) {
            console.error('[upload] No image URL returned');
            return;
        }

        console.log('[upload] image URL:', data.url);

        if (socket && data.url && toUserId) {
            socket.emit('private_message', {
                toUserId: Number(toUserId),
                message: '',
                media_url: data.url,
                type: 'image'
            });
        }
    };

    const companion = followed.find((user: FollowedUser) => user.user_id === toUserId) ?? null;
    const companionName = companion?.username ?? `User ${toUserId}`;

    return (
        <div className="chat-container">
            <HeaderMain />
            <div className="chat-body">
                <div className="chat-sidebar">
                    <ul style={{ listStyle: 'none', padding: 0 }} className="chat-user-list">
                        {followed.map(user => (
                            <li
                                key={user.user_id}
                                className={`chat-user-item ${user.user_id === toUserId ? 'active' : ''}`}
                                onClick={() => selectToUser(user.user_id)}
                            >
                                <Image
                                    src={
                                        user.profile_picture
                                            ? `http://localhost:5000/uploads/${user.profile_picture}`
                                            : userImg
                                    }
                                    alt={user.username}
                                    width={32}
                                    height={32}
                                />
                                {user.username}
                                {unreadMap[user.user_id] && (
                                    <span
                                        style={{
                                            marginLeft: 'auto',
                                            width: 8,
                                            height: 8,
                                            backgroundColor: '#0095ff73',
                                            borderRadius: '50%'
                                        }}
                                    />
                                )}
                            </li>
                        ))}
                    </ul>
                </div>

                <div style={{ flex: 1 }} className="chat-main">
                    {toUserId && (
                        <div className="chat-header">
                            <Image
                                src={
                                    companion?.profile_picture
                                        ? `http://localhost:5000/uploads/${companion.profile_picture}`
                                        : userImg
                                }
                                alt={companionName}
                                width={35}
                                height={35}
                                style={{ borderRadius: '50%' }}
                            />
                            <h3>
                                {toUserId
                                    ? `${companionName}`
                                    : 'Choose companion'}
                            </h3>
                        </div>
                    )}

                    <div className="chat-messages" ref={chatMessagesRef}>
                        {!toUserId ? (
                            <div className="chat-placeholder">Select a chat to start messaging</div>
                        ) : (
                            chat
                                .filter(msg =>
                                    (msg.from_user_id === toUserId && msg.to_user_id === currentUserId) ||
                                    (msg.from_user_id === currentUserId && msg.to_user_id === toUserId)
                                )
                                .map((msg, i) => {
                                    const isCurrentUser = msg.from_user_id === currentUserId;
                                    const username = isCurrentUser
                                        ? currentUserProfile?.username || 'Вы'
                                        : msg.FromUser?.username || `User ${msg.from_user_id}`;
                                    const avatarUrl = isCurrentUser
                                        ? (currentUserProfile?.profile_picture
                                            ? `http://localhost:5000/uploads/${currentUserProfile.profile_picture}`
                                            : userImg)
                                        : (msg.FromUser?.profile_picture
                                            ? `http://localhost:5000/uploads/${msg.FromUser.profile_picture}`
                                            : userImg);

                                    return (
                                        <div key={i} className={`chat-message ${isCurrentUser ? 'chat-message-self' : 'chat-message-other'}`} style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                                            <div className="chat-message-content">
                                                <div className="chat-message-author" style={{ display: 'flex', alignItems: 'center' }}>
                                                    <Image
                                                        src={typeof avatarUrl === 'string' ? avatarUrl : userImg}
                                                        alt={username}
                                                        width={32}
                                                        height={32}
                                                        style={{ borderRadius: '50%', marginRight: 8 }}
                                                    />
                                                    <div className="message-container">
                                                        {msg.type === 'image' && msg.media_url ? (
                                                            <Image
                                                                src={`http://localhost:5000${msg.media_url}`}
                                                                alt="photo"
                                                                width={200}
                                                                height={200}
                                                                style={{ borderRadius: 8 }}
                                                            />
                                                        ) : (
                                                            <span>{msg.content}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                        )}
                    </div>

                    {toUserId && (
                        <div className="chat-input-container">
                            <div style={{ marginTop: 10 }} className="chat-input-block">
                                <input
                                    type="file"
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                    ref={fileInputRef}
                                    onChange={handleImageUpload}
                                />
                                <Image
                                    src={clipSVG}
                                    alt="clip"
                                    width={25}
                                    height={25}
                                    onClick={() => fileInputRef.current?.click()}
                                />
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            sendMessage();
                                        }
                                    }}
                                    placeholder="Write a message..."
                                    className="chat-input textarea-auto"
                                    rows={1}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}