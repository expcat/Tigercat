import path from 'node:path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  base: command === 'serve' ? '/' : '/Tigercat/vue/',
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: {
      '@demo-shared': path.resolve(__dirname, '../shared'),
      '@expcat/tigercat-vue': path.resolve(
        path.resolve(__dirname, '../../..'),
        'packages/vue/src/index.ts'
      ),
      '@expcat/tigercat-vue/': `${path.resolve(
        path.resolve(__dirname, '../../..'),
        'packages/vue/src/components'
      )}/`,
      '@expcat/tigercat-core': path.resolve(
        path.resolve(__dirname, '../../..'),
        'packages/core/src/index.ts'
      )
    }
  },
  server: {
    port: 5173,
    fs: {
      allow: [path.resolve(__dirname, '..'), path.resolve(__dirname, '../../..')]
    }
  }
}))
