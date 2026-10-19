import { NextResponse, type NextRequest } from 'next/server';
import { serverEnv } from '@cm/env';

// Unlike next.config rewrites, which are fixed at build time, this reads API_ORIGIN per request,
// so one build serves any environment.
export function proxy(request: NextRequest) {
    const { pathname, search } = request.nextUrl;
    return NextResponse.rewrite(new URL(`${pathname}${search}`, serverEnv().API_ORIGIN));
}

export const config = {
    matcher: ['/api/v1/:path*', '/uploads/:path*'],
};
