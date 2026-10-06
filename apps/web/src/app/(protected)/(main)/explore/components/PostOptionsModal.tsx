import { useEffect, useRef, useState } from 'react';

import '@/styles/postOptionsModal.css'

interface PostOptionsModalProps {
    onDelete: () => void;
}

const PostOptionsModal = ({ onDelete }: PostOptionsModalProps) => {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;
        const closeOnOutsideClick = (event: PointerEvent) => {
            if (!ref.current?.contains(event.target as Node)) setOpen(false);
        };
        document.addEventListener('pointerdown', closeOnOutsideClick);
        return () => document.removeEventListener('pointerdown', closeOnOutsideClick);
    }, [open]);

    return (
        <div className="post-options-wrapper" ref={ref}>
            <button
                type="button"
                className="post-options-button"
                aria-label="Post options"
                aria-expanded={open}
                onClick={() => setOpen(!open)}
            >
                <span className="dot" />
                <span className="dot" />
                <span className="dot" />
            </button>

            {open && (
                <div className="post-options-modal">
                    <button type="button" onClick={() => { onDelete(); setOpen(false); }}>Delete post</button>
                </div>
            )}
        </div>
    );
};

export default PostOptionsModal;
