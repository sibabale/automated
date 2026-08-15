import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
    plugins: [react()],
    test: {
        environment: 'jsdom',
        include: [
            'app/**/*.{test,spec}.{ts,tsx}',
            'components/**/*.{test,spec}.{ts,tsx}',
            'data/**/*.{test,spec}.{ts,tsx}',
            'redux/**/*.{test,spec}.{ts,tsx}',
            'test/**/*.{test,spec}.{ts,tsx}',
        ],
        setupFiles: './test/setup.ts',
    },
});
