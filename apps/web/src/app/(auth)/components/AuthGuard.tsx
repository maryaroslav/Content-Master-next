"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@cm/auth";

const PUBLIC_ROUTES = ["/", "/login", "/register"];
const GUEST_ONLY_ROUTES = ["/login", "/register"];

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const { status } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const isPublic = PUBLIC_ROUTES.includes(pathname);

    useEffect(() => {
        if (status === "unauthenticated" && !isPublic) router.replace("/login");
        if (status === "authenticated" && GUEST_ONLY_ROUTES.includes(pathname)) router.replace("/explore");
    }, [status, isPublic, pathname, router]);

    // The session lives in memory and is restored on the client, so protected pages wait for it here.
    if (!isPublic && status !== "authenticated") return <p>Loading...</p>;

    return <>{children}</>;
}
