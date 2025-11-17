"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

interface AuthGuardProps {
    children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
    const { status } = useSession();
    const router = useRouter();
    const pathname = usePathname();

    const publicRoutes = ["/", "/register", "/login"];

    useEffect(() => {
        if (status === "unauthenticated" && !publicRoutes.includes(pathname)) {
            router.push('/login');
        }
    }, [status, pathname, router, publicRoutes]);

    if (status === 'loading') return <p>Loading...</p>

    return <>{children}</>;
}