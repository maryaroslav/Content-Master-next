import { defineConfig } from 'orval';

export default defineConfig({
    api: {
        input: { target: '../contracts/dist/openapi.json' },
        output: {
            mode: 'tags-split',
            target: 'src/generated/endpoints.ts',
            schemas: 'src/generated/model',
            client: 'react-query',
            httpClient: 'axios',
            clean: true,
            override: {
                mutator: { path: 'src/http/mutator.ts', name: 'apiRequest' },
                // Global useQuery/useMutation flags would force both hook kinds on every operation;
                // the defaults (GET -> query, others -> mutation) are what we want.
                query: { useInfinite: true, useInfiniteQueryParam: 'cursor' },
            },
        },
    },
});
