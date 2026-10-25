import Image, { type StaticImageData } from 'next/image';
import { AuthLayout } from '@cm/ui';

interface AuthPageProps {
    title: string;
    image: StaticImageData;
    children: React.ReactNode;
}

export default function AuthPage({ title, image, children }: AuthPageProps) {
    return (
        <AuthLayout title={title} art={<Image src={image} alt="" priority sizes="58vw" />}>
            {children}
        </AuthLayout>
    );
}
