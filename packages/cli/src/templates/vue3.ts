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
        '@expcat/tigercat-vue': '^1.0.0',
        vue: '^3.5.26'
      },
      devDependencies: {
        '@expcat/tigercat-core': '^1.0.0',
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
import { ref } from 'vue'
import { Button, Alert, Switch } from '@expcat/tigercat-vue'

const dark = ref(false)
const modern = ref(true)

function syncRoot() {
  const root = document.documentElement
  root.classList.toggle('dark', dark.value)
  if (modern.value) {
    root.setAttribute('data-tiger-style', 'modern')
  } else {
    root.removeAttribute('data-tiger-style')
  }
}

syncRoot()

function toggleDark(v: boolean) {
  dark.value = v
  syncRoot()
}

function toggleModern(v: boolean) {
  modern.value = v
  syncRoot()
}
</script>

<template>
  <div class="min-h-screen bg-[var(--tiger-surface,#ffffff)] p-8">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-[var(--tiger-text,#111827)]">
        Tigercat + Vue 3
      </h1>
      <div class="flex items-center gap-4 text-sm text-[var(--tiger-text-muted,#6b7280)]">
        <label class="flex items-center gap-2">
          <span>Modern</span>
          <Switch :checked="modern" size="sm" @update:checked="toggleModern" />
        </label>
        <label class="flex items-center gap-2">
          <span>Dark</span>
          <Switch :checked="dark" size="sm" @update:checked="toggleDark" />
        </label>
      </div>
    </div>

    <div class="space-y-4">
      <Alert variant="info">
        Welcome to your Tigercat project! Edit src/App.vue to get started.
        Toggle <code>Modern</code> to preview the opt-in modern visual style
        (radius / shadow / motion tokens).
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
