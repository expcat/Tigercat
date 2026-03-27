export function getVue3Template(projectName: string): Record<string, string> {
  return {
    'package.json': vue3PackageJson(projectName),
    'tsconfig.json': vue3Tsconfig(),
    'vite.config.ts': vue3ViteConfig(),
    'index.html': vue3IndexHtml(projectName),
    'src/main.ts': vue3Main(),
    'src/App.vue': vue3App(),
    'src/style.css': commonStyleCss(),
    'src/env.d.ts': vue3EnvDts()
  }
}

function vue3PackageJson(name: string): string {
  return JSON.stringify(
    {
      name,
      version: '0.0.1',
      private: true,
      type: 'module',
      scripts: {
        dev: 'vite',
        build: 'vue-tsc && vite build',
        preview: 'vite preview'
      },
      dependencies: {
        '@expcat/tigercat-vue': '^0.9.0',
        vue: '^3.5.26'
      },
      devDependencies: {
        '@tailwindcss/vite': '^4.1.18',
        '@vitejs/plugin-vue': '^6.0.3',
        '@vue/tsconfig': '^0.7.0',
        tailwindcss: '^4.1.18',
        typescript: '^5.9.3',
        vite: '^7.3.0',
        'vue-tsc': '^2.2.0'
      }
    },
    null,
    2
  )
}

function vue3Tsconfig(): string {
  return JSON.stringify(
    {
      extends: '@vue/tsconfig/tsconfig.dom.json',
      compilerOptions: {
        target: 'ES2020',
        module: 'ESNext',
        lib: ['ES2020', 'DOM', 'DOM.Iterable'],
        skipLibCheck: true,
        moduleResolution: 'bundler',
        resolveJsonModule: true,
        isolatedModules: true,
        jsx: 'preserve',
        strict: true,
        noUnusedLocals: true,
        noUnusedParameters: true,
        noFallthroughCasesInSwitch: true,
        baseUrl: '.',
        paths: {
          '@/*': ['./src/*']
        }
      },
      include: ['src/**/*.ts', 'src/**/*.d.ts', 'src/**/*.tsx', 'src/**/*.vue'],
      exclude: ['node_modules']
    },
    null,
    2
  )
}

function vue3ViteConfig(): string {
  return `import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [vue(), tailwindcss()]
})
`
}

function vue3IndexHtml(name: string): string {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${name}</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
`
}

function vue3Main(): string {
  return `import { createApp } from 'vue'
import App from './App.vue'
import './style.css'

createApp(App).mount('#app')
`
}

function vue3App(): string {
  return `<script setup lang="ts">
import { Button, Alert } from '@expcat/tigercat-vue'
</script>

<template>
  <div class="min-h-screen bg-[var(--tiger-surface,#ffffff)] p-8">
    <h1 class="text-2xl font-bold text-[var(--tiger-text,#111827)] mb-6">
      Tigercat + Vue 3
    </h1>

    <div class="space-y-4">
      <Alert variant="info">
        Welcome to your Tigercat project! Edit src/App.vue to get started.
      </Alert>

      <div class="flex gap-2">
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
      </div>
    </div>
  </div>
</template>
`
}

function vue3EnvDts(): string {
  return `/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}
`
}

function commonStyleCss(): string {
  return `@import "tailwindcss";

:root {
  --tiger-primary: #2563eb;
  --tiger-primary-hover: #1d4ed8;
  --tiger-surface: #ffffff;
  --tiger-surface-muted: #f9fafb;
  --tiger-text: #111827;
  --tiger-text-muted: #6b7280;
  --tiger-border: #e5e7eb;
}

@media (prefers-color-scheme: dark) {
  :root {
    --tiger-primary: #3b82f6;
    --tiger-primary-hover: #2563eb;
    --tiger-surface: #111827;
    --tiger-surface-muted: #1f2937;
    --tiger-text: #f9fafb;
    --tiger-text-muted: #9ca3af;
    --tiger-border: #374151;
  }

  html {
    color-scheme: dark;
  }
}
`
}
