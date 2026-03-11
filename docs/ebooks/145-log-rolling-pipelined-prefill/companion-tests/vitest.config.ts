import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

const aeonSrc = resolve(__dirname, '../../../../open-source/aeon/src');

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts'],
    testTimeout: 30000,
  },
  resolve: {
    alias: {
      '@aeon/flow': resolve(aeonSrc, 'flow/index.ts'),
      '@aeon/compression': resolve(aeonSrc, 'compression/index.ts'),
    },
  },
});
