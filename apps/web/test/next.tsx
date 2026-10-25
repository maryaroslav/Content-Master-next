import { vi } from 'vitest';

export const router = {
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
};

export const navigation = {
    useRouter: () => router,
    usePathname: () => '/',
    useSearchParams: () => new URLSearchParams(),
};

type ImageProps = { src: string | { src: string }; alt: string; width?: number; height?: number; className?: string };

export function Image({ src, alt, width, height, className }: ImageProps) {
    // eslint-disable-next-line @next/next/no-img-element -- next/image needs the Next runtime
    return <img src={typeof src === 'string' ? src : src.src} alt={alt} width={width} height={height} className={className} />;
}

export function Link({ href, children, ...rest }: { href: string; children: React.ReactNode } & React.AnchorHTMLAttributes<HTMLAnchorElement>) {
    return <a href={href} {...rest}>{children}</a>;
}
