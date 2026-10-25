import { NextResponse, type NextRequest } from 'next/server';
import { serverEnv } from '@cm/env';

export function proxy(request: NextRequest) {
    const { pathname, search } = request.nextUrl;
    return NextResponse.rewrite(new URL(`${pathname}${search}`, serverEnv().API_ORIGIN));
}

export const config = {
    matcher: ['/api/v1/:path*', '/uploads/:path*'],
};
