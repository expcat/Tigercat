import { existsSync } from 'node:fs'
import path from 'node:path'

import {
  CATEGORIES,
  CATEGORY_SLUGS,
  loadPublicComponentExports,
  pascalToKebab
} from './public-components.mjs'
import { collectFiles } from '../utils/files.mjs'

export const TEST_GROUPS = Object.freeze([
  'basic',
  'form',
  'feedback',
  'layout',
  'navigation',
  'data',
  'charts',
  'advanced',
  'composite',
  'core'
])

const FRAMEWORKS = new Set(['react', 'vue'])

const FRAMEWORK_EXTRAS = {
  basic: ['ButtonSpinnerLazy', 'ImagePreview.ssr'],
  form: ['custom-text', 'useFormController'],
  feedback: ['Notification', 'overlay-positioning'],
  layout: ['Grid', 'LayoutSections'],
  data: ['TableState'],
  charts: ['ChartSubComponents', 'useChartInteraction'],
  advanced: ['DragEnhancements', 'useDrag'],
  composite: ['useControlledState']
}

const COMPONENT_GROUP_OVERRIDES = new Map(
  Object.entries({
    basic: [
      'AvatarGroup',
      'ButtonGroup',
      'ConfigProvider',
      'CropUpload',
      'ImageCropper',
      'ImageGroup',
      'ImagePreview'
    ],
    form: ['CheckboxGroup', 'FormItem', 'InputGroupAddon', 'RadioGroup'],
    layout: ['Col', 'Content', 'Footer', 'Header', 'Row', 'Sidebar'],
    navigation: [
      'AnchorLink',
      'BreadcrumbItem',
      'DropdownItem',
      'DropdownMenu',
      'FloatButtonGroup',
      'MenuItem',
      'MenuItemGroup',
      'StepsItem',
      'SubMenu',
      'TabPane'
    ],
    data: ['CollapsePanel'],
    charts: [
      'AreaChart',
      'BarChart',
      'ChartAxis',
      'ChartCanvas',
      'ChartGrid',
      'ChartLegend',
      'ChartSeries',
      'ChartSubComponents',
      'ChartTooltip',
      'DonutChart',
      'FunnelChart',
      'GaugeChart',
      'HeatmapChart',
      'LineChart',
      'PieChart',
      'RadarChart',
      'ScatterChart',
      'SunburstChart',
      'TreeMapChart'
    ],
    composite: [
      'ActivityFeed',
      'ChatWindow',
      'CommentThread',
      'DataTableWithToolbar',
      'FormWizard',
      'NotificationCenter',
      'TaskBoard'
    ]
  }).flatMap(([group, components]) => components.map((component) => [component, group]))
)

const CORE_EXTRAS = {
  basic: [
    'a11y-aa-regression.spec.tsx',
    'a11y-interactive-regression.spec.tsx',
    'a11y-utils.spec.ts',
    'class-names.spec.ts',
    'coerce-class-value.spec.ts',
    'composite-a11y-roles.spec.tsx',
    'design-tokens.spec.ts',
    'dev-warn.spec.ts',
    'modern-style-components.spec.tsx',
    'modern-theme.spec.ts',
    'modern-theme-interaction.spec.ts',
    'reduced-motion.spec.ts',
    'theme-contrast.spec.ts',
    'themes-manager.spec.ts'
  ],
  form: [
    'custom-text-labels.spec.ts',
    'date-utils.spec.ts',
    'datepicker-i18n.spec.ts',
    'define-locale.spec.ts',
    'form-dependency-utils.spec.ts',
    'form-history-utils.spec.ts',
    'form-item-styles.spec.ts',
    'form-validation.spec.ts',
    'form-wizard-utils.spec.ts',
    'i18n-locales.spec.ts',
    'picker-utils.spec.ts'
  ],
  feedback: [
    'anchored-overlay.spec.ts',
    'floating.spec.ts',
    'focus-utils.spec.ts',
    'imperative-api.spec.ts',
    'imperative-side-effects.spec.ts',
    'overlay-scroll-lock.spec.ts',
    'overlay-utils.spec.ts',
    'reduced-motion.spec.ts',
    'viewport-utils.spec.ts'
  ],
  layout: ['grid.spec.ts', 'responsive.spec.ts'],
  navigation: ['examples-lazy-routes.spec.ts', 'floating.spec.ts', 'focus-utils.spec.ts'],
  data: [
    'pagination-utils.spec.ts',
    'table-export-utils.spec.ts',
    'table-filter-utils.spec.ts',
    'table-group-utils.spec.ts',
    'table-resize-utils.spec.ts',
    'table-utils.spec.ts',
    'virtual-table-utils.spec.ts'
  ],
  charts: ['chart-interaction.spec.ts', 'chart-interaction-utils.spec.ts'],
  advanced: [
    'code-highlighter.spec.ts',
    'crop-upload-utils.spec.ts',
    'gesture-utils.spec.ts',
    'rich-text-engine.spec.ts',
    'virtual-list-strategies.spec.ts'
  ],
  composite: [
    'composite-a11y-roles.spec.tsx',
    'task-board-drag.spec.ts',
    'task-board-utils.spec.ts'
  ]
}

export const GROUP_FILTER_ALIASES = {
  form: {
    primitives: [
      'checkbox',
      'color-swatch',
      'input',
      'input-number',
      'radio',
      'segmented',
      'slider',
      'stepper',
      'switch',
      'textarea'
    ],
    composite: [
      'auto-complete',
      'cascader',
      'color-picker',
      'date-picker',
      'datepicker',
      'form',
      'input-group',
      'select',
      'time-picker',
      'timepicker',
      'transfer',
      'tree-select',
      'upload'
    ]
  }
}

function normalizeGroupName(group) {
  const normalized = String(group || '')
    .trim()
    .toLowerCase()
  if (!TEST_GROUPS.includes(normalized)) {
    throw new Error(`Unknown test group "${group}". Expected one of: ${TEST_GROUPS.join(', ')}`)
  }
  return normalized
}

function normalizeFramework(framework) {
  const normalized = String(framework || 'all')
    .trim()
    .toLowerCase()
  if (normalized === 'all') return ['react', 'vue']
  if (!FRAMEWORKS.has(normalized)) {
    throw new Error('Unknown framework "' + framework + '". Expected react, vue, or all.')
  }
  return [normalized]
}

function getCategorySlugByTypeName() {
  const entries = []
  for (const [category, typeNames] of Object.entries(CATEGORIES)) {
    const slug = CATEGORY_SLUGS[category]
    for (const typeName of typeNames) {
      entries.push([typeName, slug])
    }
  }
  return new Map(entries)
}

function buildComponentGroups(rootDir) {
  const publicExports = loadPublicComponentExports(rootDir)
  const groupByTypeName = getCategorySlugByTypeName()
  const groups = Object.fromEntries(TEST_GROUPS.map((group) => [group, new Set()]))

  for (const component of publicExports.all) {
    const group =
      COMPONENT_GROUP_OVERRIDES.get(component) ||
      groupByTypeName.get(pascalToKebab(component)) ||
      groupByTypeName.get(pascalToKebab(component).replace(/-/g, '')) ||
      'core'
    groups[group].add(component)
  }

  return groups
}

function getCoreKeywords(group, components) {
  const category = Object.entries(CATEGORY_SLUGS).find(([, slug]) => slug === group)?.[0]
  const typeNames = category ? CATEGORIES[category] || [] : []
  const componentSlugs = [...components].flatMap((component) => {
    const slug = pascalToKebab(component)
    return [slug, slug.replace(/-/g, '')]
  })

  return new Set([...typeNames, ...componentSlugs])
}

function coreSpecMatches(filePath, keywords, extras) {
  const basename = path.basename(filePath)
  if (extras.has(basename)) return true

  const stem = basename.replace(/\.spec\.(ts|tsx)$/, '')
  for (const keyword of keywords) {
    if (
      stem === keyword ||
      stem.startsWith(`${keyword}-`) ||
      stem.endsWith(`-${keyword}`) ||
      stem.includes(`-${keyword}-`)
    ) {
      return true
    }
  }
  return false
}

function applyFilter(paths, group, filter) {
  const normalized = String(filter || '')
    .trim()
    .toLowerCase()
  if (!normalized) return paths

  const aliasKeywords = GROUP_FILTER_ALIASES[group]?.[normalized]
  const keywords = aliasKeywords || [normalized]

  return paths.filter((filePath) => {
    const searchable = filePath.toLowerCase()
    return keywords.some((keyword) => searchable.includes(keyword.toLowerCase()))
  })
}

export function getComponentTestGroupFiles({
  rootDir = process.cwd(),
  group,
  framework = 'all',
  filter
}) {
  const normalizedGroup = normalizeGroupName(group)
  const frameworks = normalizeFramework(framework)

  const componentGroups = buildComponentGroups(rootDir)
  const components = componentGroups[normalizedGroup] || new Set()
  const allFiles = []

  if (normalizedGroup === 'core') {
    allFiles.push(...collectFiles(path.join(rootDir, 'tests', 'core'), ['.spec.ts', '.spec.tsx']))
  } else {
    const coreFiles = collectFiles(path.join(rootDir, 'tests', 'core'), ['.spec.ts', '.spec.tsx'])
    const keywords = getCoreKeywords(normalizedGroup, components)
    const extras = new Set(CORE_EXTRAS[normalizedGroup] || [])
    allFiles.push(...coreFiles.filter((filePath) => coreSpecMatches(filePath, keywords, extras)))

    for (const currentFramework of frameworks) {
      for (const component of components) {
        const extension = currentFramework === 'react' ? 'tsx' : 'ts'
        const filePath = path.join(
          rootDir,
          'tests',
          currentFramework,
          `${component}.spec.${extension}`
        )
        if (existsSync(filePath)) allFiles.push(filePath)
      }

      for (const extra of FRAMEWORK_EXTRAS[normalizedGroup] || []) {
        const extension = currentFramework === 'react' ? 'tsx' : 'ts'
        const filePath = path.join(rootDir, 'tests', currentFramework, `${extra}.spec.${extension}`)
        if (existsSync(filePath)) allFiles.push(filePath)
      }
    }
  }

  const unique = [...new Set(allFiles.map((filePath) => path.relative(rootDir, filePath)))]
    .sort((a, b) => a.localeCompare(b))
    .map((filePath) => filePath.split(path.sep).join('/'))

  return applyFilter(unique, normalizedGroup, filter)
}

export function assertComponentTestGroupFiles(options) {
  const files = getComponentTestGroupFiles(options)
  if (files.length === 0) {
    const filterText = options.filter ? ` with filter "${options.filter}"` : ''
    throw new Error(`No test files found for group "${options.group}"${filterText}.`)
  }
  return files
}

export function getUnassignedFrameworkTestFiles({ rootDir = process.cwd() } = {}) {
  const assigned = new Set(
    TEST_GROUPS.filter((group) => group !== 'core').flatMap((group) =>
      getComponentTestGroupFiles({ rootDir, group })
    )
  )
  const frameworkFiles = ['react', 'vue'].flatMap((framework) =>
    collectFiles(path.join(rootDir, 'tests', framework), ['.spec.ts', '.spec.tsx']).map(
      (filePath) => path.relative(rootDir, filePath).split(path.sep).join('/')
    )
  )

  return frameworkFiles
    .filter((filePath) => !assigned.has(filePath))
    .sort((a, b) => a.localeCompare(b))
}
