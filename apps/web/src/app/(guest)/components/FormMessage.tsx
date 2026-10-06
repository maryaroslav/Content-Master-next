import Image from 'next/image';

import crossImg from '@images/icons/cross.svg';

interface FormMessageProps {
    message: string;
    variant?: 'error' | 'hint';
}

export default function FormMessage({ message, variant = 'error' }: FormMessageProps) {
    return (
        <div className={variant === 'hint' ? 'twofa-message' : 'error-message'}>
            <Image src={crossImg} width={25} height={25} alt="" />
            <p>{message}</p>
        </div>
    );
}
