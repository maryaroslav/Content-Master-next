import { publicEnv, renderPublicEnvScript } from '@cm/env';

// Evaluated on every request, so the same build picks up each environment's variables.
export const dynamic = 'force-dynamic';

export function GET() {
    return new Response(renderPublicEnvScript(publicEnv()), {
        headers: {
            'Content-Type': 'application/javascript; charset=utf-8',
            'Cache-Control': 'no-store',
        },
    });
}
