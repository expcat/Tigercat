import { defineConfig } from 'tsup'

const localeIds = [
  'en-US',
  'zh-CN',
  'zh-TW',
  'ja-JP',
  'ko-KR',
  'th-TH',
  'vi-VN',
  'id-ID',
  'es-ES',
  'fr-FR',
  'de-DE',
  'pt-BR',
  'ar-SA'
]

const localeEntries = Object.fromEntries(
  localeIds.map((id) => [`locales/${id}`, `src/utils/i18n/locales/${id}.ts`])
)

const datePickerLocaleEntries = Object.fromEntries(
  localeIds.map((id) => [`datepicker-locales/${id}`, `src/utils/i18n/datepicker-locales/${id}.ts`])
)

const iconGroups = ['common', 'picker', 'status', 'table', 'registry']

const iconEntries = Object.fromEntries(
  iconGroups.map((g) => [`icons/${g}`, `src/utils/icons/${g}.ts`])
)

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    tailwind: 'src/tailwind-entry.ts',
    'tailwind/modern': 'src/tailwind-entry-modern.ts',
    'utils/table-export': 'src/utils/table-export.ts',
    ...localeEntries,
    ...datePickerLocaleEntries,
    ...iconEntries
  },
  format: ['esm'],
  dts: true,
  clean: true,
  sourcemap: false,
  splitting: false
})
