import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./src/__tests__/setup.ts'],
    pool: 'forks',
    fileParallelism: false // run sequentially because of DB
  },
});
