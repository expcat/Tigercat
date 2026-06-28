import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const workspaceRoot = path.resolve(__dirname, '../../..')

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  base: command === 'serve' ? '/' : '/Tigercat/react/',
  plugins: [react(), tailwindcss()],
  build: {
    chunkSizeWarningLimit: 650
  },
  resolve: {
    alias: [
      { find: '@demo-shared', replacement: path.resolve(__dirname, '../shared') },
      {
        find: '@expcat/tigercat-react/FloatButtonGroup',
        replacement: path.resolve(workspaceRoot, 'packages/react/src/components/FloatButton')
      },
      {
        find: '@expcat/tigercat-react/InputGroupAddon',
        replacement: path.resolve(workspaceRoot, 'packages/react/src/components/InputGroup')
      },
      {
        find: '@expcat/tigercat-react/PrintPageBreak',
        replacement: path.resolve(workspaceRoot, 'packages/react/src/components/PrintLayout')
      },
      {
        find: /^@expcat\/tigercat-react\/(.+)$/,
        replacement: `${path.resolve(workspaceRoot, 'packages/react/src/components')}/$1`
      },
      {
        find: '@expcat/tigercat-react',
        replacement: path.resolve(workspaceRoot, 'packages/react/src/index.tsx')
      },
      {
        find: '@expcat/tigercat-core',
        replacement: path.resolve(workspaceRoot, 'packages/core/src/index.ts')
      }
    ]
  },
  server: {
    port: 5174,
    fs: {
      allow: [path.resolve(__dirname, '..'), workspaceRoot]
    }
  }
}))
