import path from 'node:path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

const workspaceRoot = path.resolve(__dirname, '../../..')
const vueComponentsDir = path.resolve(workspaceRoot, 'packages/vue/src/components')
const vueComponentAlias = (component: string) => path.resolve(vueComponentsDir, component)

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
        find: '@expcat/tigercat-vue/AnchorLink',
        replacement: vueComponentAlias('Anchor')
      },
      {
        find: '@expcat/tigercat-vue/BreadcrumbItem',
        replacement: vueComponentAlias('Breadcrumb')
      },
      {
        find: '@expcat/tigercat-vue/DropdownItem',
        replacement: vueComponentAlias('Dropdown')
      },
      {
        find: '@expcat/tigercat-vue/DropdownMenu',
        replacement: vueComponentAlias('Dropdown')
      },
      {
        find: '@expcat/tigercat-vue/FloatButtonGroup',
        replacement: vueComponentAlias('FloatButton')
      },
      {
        find: '@expcat/tigercat-vue/InputGroupAddon',
        replacement: vueComponentAlias('InputGroup')
      },
      {
        find: '@expcat/tigercat-vue/MenuItem',
        replacement: vueComponentAlias('Menu')
      },
      {
        find: '@expcat/tigercat-vue/MenuItemGroup',
        replacement: vueComponentAlias('Menu')
      },
      {
        find: '@expcat/tigercat-vue/PrintPageBreak',
        replacement: vueComponentAlias('PrintLayout')
      },
      {
        find: '@expcat/tigercat-vue/StepsItem',
        replacement: vueComponentAlias('Steps')
      },
      {
        find: '@expcat/tigercat-vue/SubMenu',
        replacement: vueComponentAlias('Menu')
      },
      {
        find: '@expcat/tigercat-vue/TabPane',
        replacement: vueComponentAlias('Tabs')
      },
      {
        find: /^@expcat\/tigercat-vue\/(.+)$/,
        replacement: `${vueComponentsDir}/$1`
      },
      {
        find: '@expcat/tigercat-vue',
        replacement: path.resolve(workspaceRoot, 'packages/vue/src/index.ts')
      },
      {
        find: '@expcat/tigercat-core/utils/data-export',
        replacement: path.resolve(workspaceRoot, 'packages/core/src/utils/data-export.ts')
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
