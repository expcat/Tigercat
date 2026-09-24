export function getVue3Template(
  projectName: string,
  preset: 'blank' | 'shell' = 'blank'
): Record<string, string> {
  const files: Record<string, string> = {
    'package.json': vue3PackageJson(projectName),
    '.gitignore': TEMPLATE_GITIGNORE,
    'tsconfig.json': vue3Tsconfig(),
    'vite.config.ts': vue3ViteConfig(),
    'index.html': vue3IndexHtml(projectName),
    'src/main.ts': vue3Main(),
    'src/App.vue': preset === 'shell' ? vue3ShellApp() : vue3App(),
    'src/routes.ts': preset === 'shell' ? vue3Routes() : '',
    'src/style.css': commonStyleCss(),
    'src/env.d.ts': vue3EnvDts()
  }
  if (!files['src/routes.ts']) delete files['src/routes.ts']
  return files
}

import { TEMPLATE_GITIGNORE, TEMPLATE_PACKAGE_MANAGER, TEMPLATE_VERSIONS as V } from '../constants'

function vue3PackageJson(name: string): string {
  return JSON.stringify(
    {
      name,
      version: '0.0.1',
      private: true,
      type: 'module',
      packageManager: TEMPLATE_PACKAGE_MANAGER,
      scripts: {
        dev: 'vite',
        build: 'vue-tsc && vite build',
        preview: 'vite preview'
      },
      dependencies: {
        '@expcat/tigercat-vue': V.tigercat,
        vue: V.vue
      },
      devDependencies: {
        '@expcat/tigercat-core': V.tigercat,
        '@tailwindcss/vite': V.tailwindcssVite,
        '@vitejs/plugin-vue': V.vitejsPluginVue,
        '@vue/tsconfig': V.vueTsconfig,
        tailwindcss: V.tailwindcss,
        typescript: V.typescript,
        vite: V.vite,
        'vue-tsc': V.vueTsc
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
        target: 'ES2022',
        module: 'ESNext',
        lib: ['ES2022', 'DOM', 'DOM.Iterable'],
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
import { Button, Alert, Switch, ConfigProvider } from '@expcat/tigercat-vue'

const colorScheme = ref<'light' | 'dark'>('light')
const theme = ref('modern')

function toggleModern(value: boolean) {
  theme.value = value ? 'modern' : 'default'
}

function toggleDark(value: boolean) {
  colorScheme.value = value ? 'dark' : 'light'
}
</script>

<template>
  <ConfigProvider :theme="theme" :color-scheme="colorScheme">
    <div class="min-h-screen bg-[var(--tiger-surface)] p-8">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-[var(--tiger-text)]">
          Tigercat + Vue 3
        </h1>
        <div class="flex items-center gap-4 text-sm text-[var(--tiger-text-secondary)]">
          <label class="flex items-center gap-2">
            <span>Modern</span>
            <Switch :model-value="theme === 'modern'" size="sm" @update:model-value="toggleModern" />
          </label>
          <label class="flex items-center gap-2">
            <span>Dark</span>
            <Switch :model-value="colorScheme === 'dark'" size="sm" @update:model-value="toggleDark" />
          </label>
        </div>
      </div>

      <div class="space-y-4">
        <Alert variant="info">
          Welcome to your Tigercat project! Edit src/App.vue to get started.
          Toggle <code>Modern</code> to switch the theme preset.
        </Alert>

        <div class="flex gap-2">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
        </div>
      </div>
    </div>
  </ConfigProvider>
</template>
`
}

function vue3Routes(): string {
  return `export const shellRoutes = [
  { key: 'home', title: 'Home' },
  { key: 'list', title: 'List' }
] as const
`
}

function vue3ShellApp(): string {
  return `<script setup lang="ts">
import { ref } from 'vue'
import { AppShell, ConfigProvider } from '@expcat/tigercat-vue'
import { shellRoutes } from './routes'

const active = ref<string>(shellRoutes[0].key)
const current = () => shellRoutes.find((route) => route.key === active.value)
</script>

<template>
  <ConfigProvider theme="modern">
    <AppShell
      full-height
      header-sticky
      :title="current()?.title"
      :tabs="shellRoutes.map((route) => ({ key: route.key, title: route.title }))"
      :active-tab="active"
      :breadcrumb="[{ title: current()?.title ?? 'Home' }]"
      @tab-change="active = $event"
    >
      <template #sidebar>
        <nav class="flex flex-col gap-1 p-3">
          <button
            v-for="route in shellRoutes"
            :key="route.key"
            type="button"
            class="rounded px-3 py-2 text-start text-sm"
            @click="active = route.key"
          >
            {{ route.title }}
          </button>
        </nav>
      </template>
      <p class="text-[var(--tiger-text)]">{{ current()?.title }}</p>
    </AppShell>
  </ConfigProvider>
</template>
`
}

function vue3EnvDts(): string {
  return `/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, unknown>
  export default component
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
