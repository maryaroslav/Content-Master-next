import HeaderMain from '@/components/headers/HeaderMain';
import Chat from './components/Chat';

import '@/styles/chat.css';

export default async function ChatPage({ searchParams }: PageProps<'/chat'>) {
    const { to } = await searchParams;
    const peerId = typeof to === 'string' && /^\d+$/.test(to) ? Number(to) : null;
    return (
        <div className="chat-container">
            <HeaderMain />
            <Chat initialPeerId={peerId} />
        </div>
    );
}
