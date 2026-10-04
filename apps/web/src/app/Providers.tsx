"use client";

import type { Session } from "next-auth";
import { Provider } from "react-redux";
import { SessionProvider } from "next-auth/react";
import store from './lib/store';

interface ProvidersProps {
    children: React.ReactNode;
    session?: Session | null;
};

export default function Providers({ children, session }: ProvidersProps) {
    return (
        <SessionProvider session={session}>
            <Provider store={store}>
                {children}
            </Provider>
        </SessionProvider>
    );
}