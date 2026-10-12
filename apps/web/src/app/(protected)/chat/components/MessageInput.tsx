'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useChatUploadAttachment } from '@cm/api-client';
import { useErrorText } from '@/i18n/useErrorText';
import type { ChatSender } from '@/chat/useChatSender';

import clipSVG from '@images/icons/clip.svg';

interface MessageInputProps {
    connected: boolean;
    sender: ChatSender;
}

export default function MessageInput({ connected, sender }: MessageInputProps) {
    const t = useTranslations('chat');
    const errorText = useErrorText();
    const [text, setText] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [sending, setSending] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const upload = useChatUploadAttachment({
        mutation: {
            onSuccess: ({ id }) => void sendImage(id),
            onError: (err) => setError(errorText.request(err) ?? null),
        },
    });

    useLayoutEffect(() => {
        const textarea = textareaRef.current;
        if (!textarea) return;
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
    }, [text]);

    const sendImage = async (attachmentId: number) => {
        setSending(true);
        const result = await sender.sendAttachment(attachmentId);
        setSending(false);
        if (!result.ok) setError(errorText.form({ type: result.error.code, message: result.error.message }) ?? null);
    };

    const sendText = () => {
        if (!connected || !text.trim()) return;
        sender.sendText(text);
        setText('');
    };

    const handleFile = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        event.target.value = '';
        if (!file) return;
        setError(null);
        upload.mutate({ data: { image: file } });
    };

    return (
        <div className="chat-input-container">
            {error && <p className="chat-error">{error}</p>}
            <div className="chat-input-block">
                <input type="file" accept="image/*" style={{ display: 'none' }} ref={fileInputRef} onChange={handleFile} />
                <button
                    type="button"
                    className="chat-attach"
                    aria-label={t('attach')}
                    disabled={!connected || sending || upload.isPending}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <Image src={clipSVG} alt="" width={25} height={25} />
                </button>
                <textarea
                    ref={textareaRef}
                    value={text}
                    onChange={(event) => setText(event.target.value)}
                    onKeyDown={(event) => {
                        if (event.key === 'Enter' && !event.shiftKey) {
                            event.preventDefault();
                            sendText();
                        }
                    }}
                    placeholder={connected ? t('placeholder') : t('connecting')}
                    className="chat-input textarea-auto"
                    rows={1}
                />
            </div>
        </div>
    );
}
