import babel from '@rolldown/plugin-babel';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import pkg from './package.json' with { type: 'json' };

const external = [...Object.keys(pkg.peerDependencies), 'react/jsx-runtime', 'react/compiler-runtime'];

export default defineConfig({
    // Components are compiled with the React Compiler here, since the app does not compile what it imports from dist.
    plugins: [react(), babel({ presets: [reactCompilerPreset()] })],
    build: {
        lib: {
            entry: 'src/index.ts',
            formats: ['es'],
            fileName: 'index',
        },
        rolldownOptions: {
            external: (id) => external.some((name) => id === name || id.startsWith(`${name}/`)),
            // Bundling drops per-file directives; MUI's theme and components only run on the client.
            output: { banner: "'use client';" },
        },
        sourcemap: true,
    },
});
