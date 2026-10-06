import Image, { type StaticImageData } from 'next/image';

import '@/styles/authForm.css';

interface AuthLayoutProps {
    image: StaticImageData;
    imageAlt: string;
    children: React.ReactNode;
}

export default function AuthLayout({ image, imageAlt, children }: AuthLayoutProps) {
    return (
        <div className="container-auth">
            <div className="form-container">{children}</div>
            <div className="image">
                <Image src={image} alt={imageAlt} />
            </div>
        </div>
    );
}
