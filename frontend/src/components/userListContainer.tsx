import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/app/lib/apiClient";

export interface FollowedUser {
    user_id: number;
    username: string;
    profile_picture?: string | null;
    last_message_time?: string | null;
}

const isFollowedUser = (obj: unknown): obj is FollowedUser => {
    if (typeof obj !== "object" || obj === null) return false;
    const o = obj as Record<string, unknown>;
    return (
        typeof o.user_id === "number" &&
        typeof o.username === "string" &&
        (o.profile_picture === undefined || typeof o.profile_picture === "string" || o.profile_picture === null) &&
        (o.last_message_time === undefined || typeof o.last_message_time === "string" || o.last_message_time === null)
    );
};

const useFollowedUsers = (chat: unknown[] = []): FollowedUser[] => {
    const [users, setUsers] = useState<FollowedUser[]>([]);

    useEffect(() => {
        let mounted = true;

        const loadFollowedUser = async (): Promise<void> => {
            try {
                const raw = (await fetchWithAuth("http://localhost:5000/api/chat/following")) as unknown;
                if (!mounted) return;

                if (Array.isArray(raw)) {
                    const data = raw.filter(isFollowedUser);
                    setUsers(data);
                } else {
                    setUsers([]);
                }
            } catch (err: unknown) {
                console.error("Error loading follow: ", err);
                if (mounted) setUsers([]);
            }
        };

        void loadFollowedUser();

        return () => {
            mounted = false;
        };
    }, [chat]);

    return users;
};

export default useFollowedUsers;