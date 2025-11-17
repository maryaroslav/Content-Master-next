import { getSession } from "next-auth/react";

export async function fetchWithAuth<T = unknown>(url: string, options: RequestInit = {}): Promise<T> {
    const session = await getSession();
    const token = (session as { accessToken?: string } | null)?.accessToken;

    const headers = new Headers(options.headers as HeadersInit | undefined);
    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    }

    const res = await fetch(url, {
        ...options,
        headers,
    });

    console.log('Request sent to:', url);
    console.log('Request headers:', Object.fromEntries(headers.entries()));

    if (!res.ok) {
        let errorBody: unknown;
        try {
            errorBody = await res.json();
        } catch {
            errorBody = await res.text().catch(() => ({}));
        }
        console.error('API Error:', errorBody);

        let message = res.statusText || 'Api error';
        if (typeof errorBody === 'object' && errorBody !== null) {
            const eb = errorBody as Record<string, unknown>;
            const maybeMessage = eb['message'];
            if (typeof maybeMessage === 'string') {
                message = maybeMessage;
            }
        }

        throw new Error(message);
    }

    const contentType = res.headers.get('content-type') ?? '';
    if (contentType.includes('application/json')) {
        return (await res.json()) as T;
    }

    const text = await res.text();
    return text as unknown as T;
}