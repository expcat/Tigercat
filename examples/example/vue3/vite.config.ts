import path from 'node:path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

const workspaceRoot = path.resolve(__dirname, '../../..')

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  base: command === 'serve' ? '/' : '/Tigercat/vue/',
  plugins: [vue(), tailwindcss()],
  build: {
    chunkSizeWarningLimit: 650
  },
  resolve: {
    alias: [
      { find: '@demo-shared', replacement: path.resolve(__dirname, '../shared') },
      {
        find: '@expcat/tigercat-vue/FloatButtonGroup',
        replacement: path.resolve(workspaceRoot, 'packages/vue/src/components/FloatButton')
      },
      {
        find: '@expcat/tigercat-vue/InputGroupAddon',
        replacement: path.resolve(workspaceRoot, 'packages/vue/src/components/InputGroup')
      },
      {
        find: '@expcat/tigercat-vue/PrintPageBreak',
        replacement: path.resolve(workspaceRoot, 'packages/vue/src/components/PrintLayout')
      },
      {
        find: /^@expcat\/tigercat-vue\/(.+)$/,
        replacement: `${path.resolve(workspaceRoot, 'packages/vue/src/components')}/$1`
      },
      {
        find: '@expcat/tigercat-vue',
        replacement: path.resolve(workspaceRoot, 'packages/vue/src/index.ts')
      },
      {
        find: '@expcat/tigercat-core',
        replacement: path.resolve(workspaceRoot, 'packages/core/src/index.ts')
      }
    ]
  },
  server: {
    port: 5173,
    fs: {
      allow: [path.resolve(__dirname, '..'), workspaceRoot]
    }
  }
}))
