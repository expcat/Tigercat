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
    benchmark: {
      include: ['benchmarks/**/*.bench.{js,ts}']
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'tests/', 'dist/', '**/*.d.ts', '**/*.config.*', '**/__mocks__'],
      // Conservative floors set ~5pts below the measured baseline
      // (lines 90.3 / statements 88.5 / functions 89.8 / branches 81.9) so normal
      // drift stays green while regressions (deleted tests, large untested additions) trip the gate.
      thresholds: {
        lines: 85,
        statements: 83,
        functions: 84,
        branches: 76
      }
    }
  },
  resolve: {
    alias: {
      '@expcat/tigercat-core/locales': resolve(__dirname, './packages/core/src/utils/i18n/locales'),
      '@expcat/tigercat-core/datepicker-locales': resolve(
        __dirname,
        './packages/core/src/utils/i18n/datepicker-locales'
      ),
      '@expcat/tigercat-core': resolve(__dirname, './packages/core/src'),
      '@expcat/tigercat-vue': resolve(__dirname, './packages/vue/src'),
      '@expcat/tigercat-react': resolve(__dirname, './packages/react/src'),
      '@expcat/tigercat-cli': resolve(__dirname, './packages/cli/src'),
      '@expcat/tigercat-mcp': resolve(__dirname, './packages/mcp/src')
    }
  }
})
