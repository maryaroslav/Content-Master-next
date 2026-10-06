import GuestOnly from './components/GuestOnly';

export default function GuestLayout({ children }: { children: React.ReactNode }) {
    return <GuestOnly>{children}</GuestOnly>;
}
