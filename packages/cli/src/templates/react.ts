export function getReactTemplate(projectName: string): Record<string, string> {
  return {
    'package.json': reactPackageJson(projectName),
    '.gitignore': TEMPLATE_GITIGNORE,
    'tsconfig.json': reactTsconfig(),
    'tsconfig.node.json': reactTsconfigNode(),
    'vite.config.ts': reactViteConfig(),
    'index.html': reactIndexHtml(projectName),
    'src/main.tsx': reactMain(),
    'src/App.tsx': reactApp(),
    'src/style.css': commonStyleCss()
  }
}

import { TEMPLATE_GITIGNORE, TEMPLATE_PACKAGE_MANAGER, TEMPLATE_VERSIONS as V } from '../constants'

function reactPackageJson(name: string): string {
  return JSON.stringify(
    {
      name,
      version: '0.0.1',
      private: true,
      type: 'module',
      packageManager: TEMPLATE_PACKAGE_MANAGER,
      scripts: {
        dev: 'vite',
        build: 'tsc && vite build',
        preview: 'vite preview'
      },
      dependencies: {
        '@expcat/tigercat-react': V.tigercat,
        react: V.react,
        'react-dom': V.reactDom
      },
      devDependencies: {
        '@expcat/tigercat-core': V.tigercat,
        '@tailwindcss/vite': V.tailwindcssVite,
        '@types/react': V.typesReact,
        '@types/react-dom': V.typesReactDom,
        '@vitejs/plugin-react': V.vitejsPluginReact,
        tailwindcss: V.tailwindcss,
        typescript: V.typescript,
        vite: V.vite
      }
    },
    null,
    2
  )
}

function reactTsconfig(): string {
  return JSON.stringify(
    {
      compilerOptions: {
        target: 'ES2022',
        useDefineForClassFields: true,
        lib: ['ES2022', 'DOM', 'DOM.Iterable'],
        module: 'ESNext',
        skipLibCheck: true,
        moduleResolution: 'bundler',
        allowImportingTsExtensions: true,
        resolveJsonModule: true,
        isolatedModules: true,
        noEmit: true,
        jsx: 'react-jsx',
        strict: true,
        noUnusedLocals: true,
        noUnusedParameters: true,
        noFallthroughCasesInSwitch: true,
        forceConsistentCasingInFileNames: true,
        baseUrl: '.',
        paths: {
          '@/*': ['./src/*']
        }
      },
      include: ['src'],
      references: [{ path: './tsconfig.node.json' }]
    },
    null,
    2
  )
}

function reactTsconfigNode(): string {
  return JSON.stringify(
    {
      compilerOptions: {
        composite: true,
        skipLibCheck: true,
        module: 'ESNext',
        moduleResolution: 'bundler',
        allowSyntheticDefaultImports: true
      },
      include: ['vite.config.ts']
    },
    null,
    2
  )
}

function reactViteConfig(): string {
  return `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()]
})
`
}

function reactIndexHtml(name: string): string {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${name}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`
}

function reactMain(): string {
  return `import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './style.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
`
}

function reactApp(): string {
  return `import { useState, useCallback } from 'react'
import { Button, Alert, Switch, ConfigProvider } from '@expcat/tigercat-react'

export default function App() {
  const [colorScheme, setColorScheme] = useState<'light' | 'dark'>('light')
  const [theme, setTheme] = useState('modern')

  const onDark = useCallback((v: boolean) => setColorScheme(v ? 'dark' : 'light'), [])
  const onModern = useCallback((v: boolean) => setTheme(v ? 'modern' : 'default'), [])

  return (
    <ConfigProvider theme={theme} colorScheme={colorScheme}>
      <div className="min-h-screen bg-[var(--tiger-surface)] p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-[var(--tiger-text)]">
            Tigercat + React
          </h1>
          <div className="flex items-center gap-4 text-sm text-[var(--tiger-text-secondary)]">
            <label className="flex items-center gap-2">
              <span>Modern</span>
              <Switch checked={theme === 'modern'} size="sm" onChange={onModern} />
            </label>
            <label className="flex items-center gap-2">
              <span>Dark</span>
              <Switch checked={colorScheme === 'dark'} size="sm" onChange={onDark} />
            </label>
          </div>
        </div>

        <div className="space-y-4">
          <Alert variant="info">
            Welcome to your Tigercat project! Edit src/App.tsx to get started.
            Toggle <code>Modern</code> to switch the theme preset.
          </Alert>

          <div className="flex gap-2">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
          </div>
        </div>
      </div>
    </ConfigProvider>
  )
}
`
}

function commonStyleCss(): string {
  return `@import "tailwindcss";
@plugin "@expcat/tigercat-core/tailwind";
@custom-variant dark (&:where(.dark, .dark *));

/*
 * The tigercat tailwind plugin injects the default preset's --tiger-* tokens
 * for :root and .dark. ConfigProvider theme / colorScheme switches presets
 * at runtime. The rules below keep native controls in sync with .dark.
 */

html {
  color-scheme: light;
}

html.dark {
  color-scheme: dark;
}
`
}
