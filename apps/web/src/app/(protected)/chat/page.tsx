import AppHeader from '@/components/shell/AppHeader';
import Chat from './components/Chat';

import '@/styles/chat.css';

export default async function ChatPage({ searchParams }: PageProps<'/chat'>) {
    const { to } = await searchParams;
    const peerId = typeof to === 'string' && /^\d+$/.test(to) ? Number(to) : null;
    return (
        <div className="chat-container">
            <AppHeader />
            <Chat initialPeerId={peerId} />
        </div>
    );
}
