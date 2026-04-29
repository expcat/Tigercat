export function getReactTemplate(projectName: string): Record<string, string> {
  return {
    'package.json': reactPackageJson(projectName),
    'tsconfig.json': reactTsconfig(),
    'tsconfig.node.json': reactTsconfigNode(),
    'vite.config.ts': reactViteConfig(),
    'index.html': reactIndexHtml(projectName),
    'src/main.tsx': reactMain(),
    'src/App.tsx': reactApp(),
    'src/style.css': commonStyleCss()
  }
}

function reactPackageJson(name: string): string {
  return JSON.stringify(
    {
      name,
      version: '0.0.1',
      private: true,
      type: 'module',
      scripts: {
        dev: 'vite',
        build: 'tsc && vite build',
        preview: 'vite preview'
      },
      dependencies: {
        '@expcat/tigercat-react': '^1.0.0',
        react: '^19.2.3',
        'react-dom': '^19.2.3'
      },
      devDependencies: {
        '@expcat/tigercat-core': '^1.0.0',
        '@tailwindcss/vite': '^4.1.18',
        '@types/react': '^19.2.7',
        '@types/react-dom': '^19.2.2',
        '@vitejs/plugin-react': '^4.3.4',
        tailwindcss: '^4.1.18',
        typescript: '^5.9.3',
        vite: '^7.3.0'
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
        target: 'ES2020',
        useDefineForClassFields: true,
        lib: ['ES2020', 'DOM', 'DOM.Iterable'],
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
  return `import { useState, useCallback, useEffect } from 'react'
import { Button, Alert, Switch } from '@expcat/tigercat-react'

export default function App() {
  const [dark, setDark] = useState(false)
  const [modern, setModern] = useState(true)

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', dark)
    if (modern) {
      root.setAttribute('data-tiger-style', 'modern')
    } else {
      root.removeAttribute('data-tiger-style')
    }
  }, [dark, modern])

  const onDark = useCallback((v: boolean) => setDark(v), [])
  const onModern = useCallback((v: boolean) => setModern(v), [])

  return (
    <div className="min-h-screen bg-[var(--tiger-surface,#ffffff)] p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[var(--tiger-text,#111827)]">
          Tigercat + React
        </h1>
        <div className="flex items-center gap-4 text-sm text-[var(--tiger-text-muted,#6b7280)]">
          <label className="flex items-center gap-2">
            <span>Modern</span>
            <Switch checked={modern} size="sm" onChange={onModern} />
          </label>
          <label className="flex items-center gap-2">
            <span>Dark</span>
            <Switch checked={dark} size="sm" onChange={onDark} />
          </label>
        </div>
      </div>

      <div className="space-y-4">
        <Alert variant="info">
          Welcome to your Tigercat project! Edit src/App.tsx to get started.
          Toggle <code>Modern</code> to preview the opt-in modern visual style
          (radius / shadow / motion tokens).
        </Alert>

        <div className="flex gap-2">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
        </div>
      </div>
    </div>
  )
}
`
}

function commonStyleCss(): string {
  return `@import "tailwindcss";
@plugin "@expcat/tigercat-core/tailwind/modern";

/*
 * The tigercat tailwind plugin injects every --tiger-* design token for
 * both light (:root) and dark (.dark) modes, plus the opt-in modern
 * overrides activated by data-tiger-style="modern". The demo App toggles
 * dark mode via .dark on <html> and prefers-color-scheme via the rule
 * below. Swap the @plugin line for a tailwind.config.ts calling
 * createTigercatPlugin({ preset }) to use a custom preset.
 */

html {
  color-scheme: light dark;
}
`
}
