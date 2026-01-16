import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  base: command === 'serve' ? '/' : '/Tigercat/react/',
  plugins: [react()],
  resolve: {
    alias: {
      '@demo-shared': path.resolve(__dirname, '../shared'),
      '@expcat/tigercat-react': path.resolve(
        path.resolve(__dirname, '../../..'),
        'packages/react/src/index.tsx'
      ),
      '@expcat/tigercat-react/': `${path.resolve(
        path.resolve(__dirname, '../../..'),
        'packages/react/src/components'
      )}/`,
      '@expcat/tigercat-core': path.resolve(
        path.resolve(__dirname, '../../..'),
        'packages/core/src/index.ts'
      )
    }
  },
  server: {
    port: 5174,
    fs: {
      allow: [path.resolve(__dirname, '..'), path.resolve(__dirname, '../../..')]
    }
  }
}))
