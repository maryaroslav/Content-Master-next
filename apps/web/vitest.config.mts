import { fileURLToPath } from 'node:url';
import babel from '@rolldown/plugin-babel';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

const src = fileURLToPath(new URL('./src', import.meta.url));

export default defineConfig({
    // The app is built with the React Compiler, so the tests run the compiled components too.
    plugins: [react(), babel({ presets: [reactCompilerPreset()] })],
    resolve: {
        alias: { '@images': `${src}/images`, '@': src },
    },
    test: {
        environment: 'jsdom',
        include: ['test/**/*.test.{ts,tsx}'],
        setupFiles: ['test/setup.ts'],
    },
});
