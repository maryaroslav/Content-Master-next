import { useState, useRef, useEffect } from 'react';

import '@/styles/postOptionsModal.css'

const PostOptionsModal = ({ onDelete, onEdit }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef();

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (ref.current && !ref.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="post-options-wrapper" ref={ref}>
            <button
                className="post-options-button"
                onClick={() => setOpen(!open)}
            >
                <span className="dot" />
                <span className="dot" />
                <span className="dot" />
            </button>

            {open && (
                <div className="post-options-modal">
                    <button onClick={() => { onDelete(); setOpen(false); }}>Delete post</button>
                    <hr />
                    <button onClick={() => { onEdit(); setOpen(false); }}>Edit</button>
                </div>
            )}
        </div>
    );
};

export default PostOptionsModal;