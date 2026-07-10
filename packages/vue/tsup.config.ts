import { defineConfig } from 'tsup'
import { readdirSync } from 'node:fs'
import { join } from 'node:path'

const componentsDir = join(__dirname, 'src', 'components')
const componentEntries = readdirSync(componentsDir, { withFileTypes: true })
  .filter((entry) => entry.isFile() && entry.name.endsWith('.ts'))
  .map((entry) => `src/components/${entry.name}`)

const composableEntries = [
  'src/composables/useChartInteraction.ts',
  'src/composables/useDrag.ts',
  'src/composables/useFormController.ts'
]

const external = ['vue']

export default defineConfig({
  entry: ['src/index.ts', ...componentEntries, ...composableEntries],
  format: ['esm'],
  dts: {
    compilerOptions: {
      rootDir: '..'
    }
  },
  clean: true,
  splitting: true,
  external
})
