
import { useRef, useEffect } from 'react';
import '../../styles/UserModal.css';

interface UserModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function UserModal(props: UserModalProps) {
    const modalRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node | null;
            if (modalRef.current && target && !modalRef.current.contains(target)) {
                props.onClose();
            }
        };

        if (props.isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [props]);

    if (!props.isOpen) return null;

    return (
        <div ref={modalRef} className='dropdown'>
            <ul>
                <li></li>
                <li></li>s
                <li></li>
            </ul>
        </div>
    );
}