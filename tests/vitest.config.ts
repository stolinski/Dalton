import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    watch: false,
    testTimeout: 600000,
    hookTimeout: 240000,
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false,
        isolate: true,
        useAtomics: true
      }
    },
    reporters: ['default'],
    env: {
      TZ: 'UTC'
    }
  }
})
