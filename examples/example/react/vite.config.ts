import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const workspaceRoot = path.resolve(__dirname, '../../..')
const reactComponentsDir = path.resolve(workspaceRoot, 'packages/react/src/components')
const reactComponentAlias = (component: string) => path.resolve(reactComponentsDir, component)

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
        find: '@expcat/tigercat-react/AnchorLink',
        replacement: reactComponentAlias('Anchor')
      },
      {
        find: '@expcat/tigercat-react/BreadcrumbItem',
        replacement: reactComponentAlias('Breadcrumb')
      },
      {
        find: '@expcat/tigercat-react/DropdownItem',
        replacement: reactComponentAlias('Dropdown')
      },
      {
        find: '@expcat/tigercat-react/DropdownMenu',
        replacement: reactComponentAlias('Dropdown')
      },
      {
        find: '@expcat/tigercat-react/FloatButtonGroup',
        replacement: reactComponentAlias('FloatButton')
      },
      {
        find: '@expcat/tigercat-react/InputGroupAddon',
        replacement: reactComponentAlias('InputGroup')
      },
      {
        find: '@expcat/tigercat-react/MenuItem',
        replacement: reactComponentAlias('Menu')
      },
      {
        find: '@expcat/tigercat-react/MenuItemGroup',
        replacement: reactComponentAlias('Menu')
      },
      {
        find: '@expcat/tigercat-react/PrintPageBreak',
        replacement: reactComponentAlias('PrintLayout')
      },
      {
        find: '@expcat/tigercat-react/StepsItem',
        replacement: reactComponentAlias('Steps')
      },
      {
        find: '@expcat/tigercat-react/SubMenu',
        replacement: reactComponentAlias('Menu')
      },
      {
        find: '@expcat/tigercat-react/TabPane',
        replacement: reactComponentAlias('Tabs')
      },
      {
        find: /^@expcat\/tigercat-react\/(.+)$/,
        replacement: `${reactComponentsDir}/$1`
      },
      {
        find: '@expcat/tigercat-react',
        replacement: path.resolve(workspaceRoot, 'packages/react/src/index.tsx')
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
    port: 5174,
    fs: {
      allow: [path.resolve(__dirname, '..'), workspaceRoot]
    }
  }
}))
