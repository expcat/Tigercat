import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import {
  playgroundRuntimePlugin,
  type PlaygroundRuntimeEntry
} from '../shared/playground/vite-runtime-plugin'

const workspaceRoot = path.resolve(__dirname, '../../..')
const reactComponentsDir = path.resolve(workspaceRoot, 'packages/react/src/components')
const reactComponentAlias = (component: string) => path.resolve(reactComponentsDir, component)
const sharedPlaygroundDir = path.resolve(__dirname, '../shared/playground')
const runtimeEntry = (file: string, devUrl: string): PlaygroundRuntimeEntry => ({ file, devUrl })
const runtimeEntries = {
  framework: runtimeEntry(
    path.resolve(__dirname, 'src/playground/runtime-react.ts'),
    '/src/playground/runtime-react.ts'
  ),
  renderer: runtimeEntry(
    path.resolve(__dirname, 'src/playground/runtime-renderer.ts'),
    '/src/playground/runtime-renderer.ts'
  ),
  jsxRuntime: runtimeEntry(
    path.resolve(__dirname, 'src/playground/runtime-jsx.ts'),
    '/src/playground/runtime-jsx.ts'
  ),
  tigercat: runtimeEntry(
    path.resolve(__dirname, 'src/playground/runtime-tigercat.ts'),
    '/src/playground/runtime-tigercat.ts'
  ),
  core: runtimeEntry(
    path.resolve(__dirname, 'src/playground/runtime-core.ts'),
    '/src/playground/runtime-core.ts'
  ),
  context: runtimeEntry(
    path.resolve(__dirname, 'src/playground/runtime-context.ts'),
    '/src/playground/runtime-context.ts'
  ),
  shared: runtimeEntry(
    path.resolve(sharedPlaygroundDir, 'runtime-shared.ts'),
    `/@fs/${path.resolve(sharedPlaygroundDir, 'runtime-shared.ts').replace(/^\//, '')}`
  ),
  tailwind: runtimeEntry(
    path.resolve(sharedPlaygroundDir, 'runtime-tailwind.ts'),
    `/@fs/${path.resolve(sharedPlaygroundDir, 'runtime-tailwind.ts').replace(/^\//, '')}`
  )
}

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  base: command === 'serve' ? '/' : '/Tigercat/react/',
  plugins: [playgroundRuntimePlugin(runtimeEntries), react(), tailwindcss()],
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
    cors: true,
    fs: {
      allow: [path.resolve(__dirname, '..'), workspaceRoot]
    }
  }
}))
