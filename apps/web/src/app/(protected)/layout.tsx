import ChatRealtime from '@/chat/ChatRealtime';
import RequireAuth from './components/RequireAuth';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
    return (
        <RequireAuth>
            <ChatRealtime />
            {children}
        </RequireAuth>
    );
}
