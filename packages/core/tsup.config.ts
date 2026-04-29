import { defineConfig } from 'tsup'

const localeIds = ['en-US', 'zh-CN', 'zh-TW', 'ja-JP', 'ko-KR', 'th-TH', 'vi-VN', 'id-ID']

const localeEntries = Object.fromEntries(
  localeIds.map((id) => [`locales/${id}`, `src/utils/i18n/locales/${id}.ts`])
)

const iconGroups = ['common', 'picker', 'status', 'table']

const iconEntries = Object.fromEntries(
  iconGroups.map((g) => [`icons/${g}`, `src/utils/icons/${g}.ts`])
)

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    ...localeEntries,
    ...iconEntries
  },
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  sourcemap: false,
  splitting: false,
  treeshake: true
})
