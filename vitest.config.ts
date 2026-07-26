import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

import {
  buildFrameworkPackageSubpathFacts,
  loadPublicComponentExports
} from './scripts/lib/public-components.mjs'

const publicComponents = loadPublicComponentExports(__dirname)

// Per-component subpath aliases so a spec can import `@expcat/tigercat-vue/Button`
// instead of the root barrel, which re-evaluates all 152 components in every
// file. Generated from the same facts `pnpm exports:check` syncs into each
// package's `exports` map, so a spec can only reach a genuinely published
// subpath. Vite matches string aliases by prefix and takes the first hit, so
// these must be spread ahead of the root-package aliases below.
function buildSubpathAliases(framework: 'vue' | 'react') {
  return Object.fromEntries(
    buildFrameworkPackageSubpathFacts(publicComponents[framework]).map(({ subpath, target }) => [
      `@expcat/tigercat-${framework}/${subpath.replace(/^\.\//, '')}`,
      resolve(__dirname, `./packages/${framework}/src/components/${target}`)
    ])
  )
}

const testAliases = {
  '@expcat/tigercat-core/locales': resolve(__dirname, './packages/core/src/utils/i18n/locales'),
  '@expcat/tigercat-core/datepicker-locales': resolve(
    __dirname,
    './packages/core/src/utils/i18n/datepicker-locales'
  ),
  ...buildSubpathAliases('vue'),
  ...buildSubpathAliases('react'),
  '@expcat/tigercat-core': resolve(__dirname, './packages/core/src'),
  '@expcat/tigercat-vue': resolve(__dirname, './packages/vue/src'),
  '@expcat/tigercat-react': resolve(__dirname, './packages/react/src'),
  '@expcat/tigercat-cli': resolve(__dirname, './packages/cli/src'),
  '@expcat/tigercat-mcp': resolve(__dirname, './packages/mcp/src')
}

// Specs that must run in the `forks` pool, i.e. their own process.
// - cli.spec.ts calls `process.chdir()`, which worker threads do not support.
// - The imperative-API specs mount process-global Message/Notification
//   containers and drive real timers, so they are sensitive to the event-loop
//   contention a shared worker thread brings. Measured 2026-07-26: under
//   `threads` the React root-entry mount blew its 1s `waitFor` in ~1 of 5
//   `pnpm test:core` runs. Isolating the process fixes the cause instead of
//   widening the timeout.
const FORK_ONLY_SPECS = [
  'tests/core/cli.spec.ts',
  'tests/core/imperative-side-effects.spec.ts',
  'tests/react/Notification.spec.tsx',
  'tests/vue/Message.spec.ts',
  'tests/vue/Notification.spec.ts'
]

// The same imperative-API specs are kept out of the coverage run and executed
// on their own by `pnpm test:special`. Declared here rather than as CLI
// `--exclude` flags because `projects` does not inherit CLI include/exclude.
const COVERAGE_EXCLUDED_SPECS = FORK_ONLY_SPECS.slice(1)

const isCoverageRun = process.argv.includes('--coverage')
// The unit project never runs fork-only specs. The fork-only project drops the
// coverage-excluded ones when coverage is on, so `pnpm test:coverage` sees the
// same 393 files it did before the pool split.
const forkOnlyInclude = isCoverageRun
  ? FORK_ONLY_SPECS.filter((spec) => !COVERAGE_EXCLUDED_SPECS.includes(spec))
  : FORK_ONLY_SPECS

const sharedTestOptions = {
  globals: true,
  environment: 'happy-dom' as const,
  setupFiles: ['./tests/setup.ts']
}

export default defineConfig({
  plugins: [vue()],
  test: {
    ...sharedTestOptions,
    include: ['tests/**/*.{test,spec}.{js,ts,tsx}'],
    // `threads` reuses worker threads instead of forking a process per file,
    // which cuts the framework start-up overhead that dominates this suite
    // (measured 2026-07-26: 72.6s -> 52.5s wall on the full run). File-level
    // isolation is kept, so specs still may not depend on execution order.
    projects: [
      {
        plugins: [vue()],
        test: {
          ...sharedTestOptions,
          name: 'unit',
          pool: 'threads',
          include: ['tests/**/*.{test,spec}.{js,ts,tsx}'],
          exclude: FORK_ONLY_SPECS
        },
        resolve: { alias: testAliases }
      },
      {
        plugins: [vue()],
        test: {
          ...sharedTestOptions,
          name: 'fork-only',
          pool: 'forks',
          include: forkOnlyInclude
        },
        resolve: { alias: testAliases }
      }
    ],
    benchmark: {
      include: ['benchmarks/**/*.bench.{js,ts}']
    },
    coverage: {
      provider: 'v8',
      reporter: ['text'],
      exclude: ['node_modules/', 'tests/', 'dist/', '**/*.d.ts', '**/*.config.*', '**/__mocks__'],
      // Conservative floors set ~5pts below the measured baseline
      // (lines 90.3 / statements 88.5 / functions 89.8 / branches 81.9) so normal
      // drift stays green while regressions (deleted tests, large untested additions) trip the gate.
      thresholds: {
        lines: 85,
        statements: 83,
        functions: 84,
        branches: 76
      }
    }
  },
  resolve: { alias: testAliases }
})
