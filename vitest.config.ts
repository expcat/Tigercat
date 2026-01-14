import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.{test,spec}.{js,ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'tests/', 'dist/', '**/*.d.ts', '**/*.config.*', '**/__mocks__']
    }
  },
  resolve: {
    alias: {
      '@tigercat/core': resolve(__dirname, './packages/core/src'),
      '@tigercat/vue': resolve(__dirname, './packages/vue/src'),
      '@tigercat/react': resolve(__dirname, './packages/react/src')
    }
  }
})
