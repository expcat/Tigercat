import { readFileSync } from 'node:fs'
import { join } from 'node:path'

export const CATEGORIES = {
  Basic: [
    'alert',
    'avatar',
    'badge',
    'button',
    'code',
    'divider',
    'empty',
    'icon',
    'image',
    'link',
    'qrcode',
    'rate',
    'result',
    'segmented',
    'statistic',
    'tag',
    'text',
    'watermark'
  ],
  Form: [
    'auto-complete',
    'cascader',
    'checkbox',
    'color-picker',
    'color-swatch',
    'cron-editor',
    'datepicker',
    'form',
    'input',
    'input-group',
    'input-number',
    'mentions',
    'number-keyboard',
    'radio',
    'select',
    'signature',
    'slider',
    'stepper',
    'switch',
    'textarea',
    'timepicker',
    'transfer',
    'tree-select',
    'upload'
  ],
  Feedback: [
    'drawer',
    'loading',
    'message',
    'modal',
    'notification',
    'popconfirm',
    'popover',
    'progress',
    'tooltip',
    'tour'
  ],
  Layout: [
    'card',
    'carousel',
    'container',
    'descriptions',
    'grid',
    'layout',
    'list',
    'resizable',
    'skeleton',
    'space',
    'splitter'
  ],
  Navigation: [
    'affix',
    'anchor',
    'back-top',
    'breadcrumb',
    'dropdown',
    'float-button',
    'menu',
    'pagination',
    'scroll-spy',
    'spotlight',
    'steps',
    'tabs',
    'tree'
  ],
  Data: ['calendar', 'collapse', 'countdown', 'data-export', 'table', 'timeline'],
  Charts: [
    'chart',
    'chart-core',
    'chart-cartesian',
    'chart-radial',
    'chart-visualization',
    'gantt',
    'org-chart'
  ],
  Advanced: [
    'code-editor',
    'drag',
    'file-manager',
    'image-annotation',
    'image-viewer',
    'infinite-scroll',
    'kanban',
    'markdown-editor',
    'print-layout',
    'rich-text-editor',
    'virtual-list',
    'virtual-table'
  ],
  Composite: [
    'activity-feed',
    'chat',
    'comment-thread',
    'composite',
    'form-wizard',
    'notification-center',
    'table-toolbar',
    'task-board'
  ],
  Core: ['base', 'events', 'floating-popup', 'generics', 'locale', 'slots', 'theme']
}

export const CATEGORY_SLUGS = Object.fromEntries(
  Object.keys(CATEGORIES).map((category) => [category, category.toLowerCase()])
)

const CATEGORY_BY_TYPE_NAME = new Map(
  Object.entries(CATEGORIES).flatMap(([category, typeNames]) =>
    typeNames.map((typeName) => [typeName, category])
  )
)

const COMPONENT_ALIASES = {
  AutoComplete: 'AutoComplete',
  QRCode: 'QRCode',
  DataTableWithToolbar: 'DataTableWithToolbar',
  ChartCanvas: 'ChartCanvas',
  ChartAxis: 'ChartAxis',
  ChartGrid: 'ChartGrid',
  ChartSeries: 'ChartSeries',
  ChartLegend: 'ChartLegend',
  ChartTooltip: 'ChartTooltip'
}

const NON_COMPONENT_TYPE_NAMES = new Set([
  'BaseChart',
  'ChartInteraction',
  'ChartWithAxes',
  'FormCondition',
  'FormRule',
  'FormError',
  'GenericComponent',
  'GenericProps',
  'TigerLocale'
])

export const FRAMEWORK_COMPONENTS = {
  ConfigProvider: {
    category: 'Basic',
    typeSource:
      'packages/react/src/components/ConfigProvider.tsx and packages/vue/src/components/ConfigProvider.ts',
    propsRows: [
      {
        name: 'locale?',
        type: 'TigerLocaleInput',
        defaultValue: '-',
        description: 'Locale configuration'
      },
      { name: 'theme?', type: 'string', defaultValue: '-', description: 'Theme name' },
      {
        name: 'colorScheme?',
        type: 'ColorScheme',
        defaultValue: '-',
        description: 'Theme color scheme'
      }
    ]
  },
  MessageContainer: {
    category: 'Feedback',
    typeSource:
      'packages/react/src/components/MessageContainer.tsx and packages/vue/src/components/MessageContainer.ts',
    sourceFiles: [
      'packages/react/src/components/MessageContainer.tsx',
      'packages/vue/src/components/MessageContainer.ts'
    ],
    propsInterfaces: ['MessageContainerProps', 'VueMessageContainerProps']
  },
  NotificationContainer: {
    category: 'Feedback',
    typeSource:
      'packages/react/src/components/NotificationContainer.tsx and packages/vue/src/components/NotificationContainer.ts',
    sourceFiles: [
      'packages/react/src/components/NotificationContainer.tsx',
      'packages/vue/src/components/NotificationContainer.ts'
    ],
    propsInterfaces: ['NotificationContainerProps', 'VueNotificationContainerProps']
  },
  PrintPageBreak: {
    category: 'Advanced',
    typeSource:
      'packages/react/src/components/PrintLayout.tsx and packages/vue/src/components/PrintLayout.ts',
    sourceFiles: [
      'packages/react/src/components/PrintLayout.tsx',
      'packages/vue/src/components/PrintLayout.ts'
    ],
    propsInterfaces: ['PrintPageBreakProps'],
    passThroughNote:
      'Vue PrintPageBreak accepts attrs/pass-through only; React PrintPageBreakProps extends div attributes.'
  },
  StepsItem: {
    category: 'Navigation',
    typeSource: 'packages/react/src/components/Steps.tsx and packages/vue/src/components/Steps.ts',
    sourceFiles: [
      'packages/react/src/components/Steps.tsx',
      'packages/vue/src/components/Steps.ts'
    ],
    propsInterfaces: ['StepsItemProps', 'VueStepsItemProps']
  }
}

export const PUBLIC_PROPS_TYPE_EXCEPTIONS = new Map([
  ['vue:PrintPageBreak', 'Vue PrintPageBreak is an attrs/pass-through component.']
])

const DOC_SECTION_ALIASES = new Map([
  ['Header', 'Layout'],
  ['Sidebar', 'Layout'],
  ['Content', 'Layout'],
  ['Footer', 'Layout'],
  ['Row', 'Grid'],
  ['Col', 'Grid'],
  ['CollapsePanel', 'Collapse'],
  ['MenuItem', 'Menu'],
  ['SubMenu', 'Menu'],
  ['MenuItemGroup', 'Menu'],
  ['TabPane', 'Tabs'],
  ['BreadcrumbItem', 'Breadcrumb'],
  ['StepsItem', 'Steps'],
  ['DropdownMenu', 'Dropdown'],
  ['DropdownItem', 'Dropdown'],
  ['FloatButtonGroup', 'FloatButton'],
  ['InputGroupAddon', 'InputGroup'],
  ['PrintPageBreak', 'PrintLayout']
])

export const COMPONENT_ROUTE_ALIASES = {
  Grid: ['Row', 'Col']
}

export const TIGERCAT_TOPIC_ROUTES = {
  setup: {
    title: 'Setup and installation',
    references: ['skills/tigercat/references/getting-started.md'],
    keywords: ['setup', 'install', 'gettingstarted', 'start', 'quickstart', '安装', '开始']
  },
  cli: {
    title: 'CLI and scaffolding',
    references: ['skills/tigercat/references/cli.md'],
    keywords: ['cli', 'command', 'scaffold', 'generate', '命令', '脚手架']
  },
  theme: {
    title: 'Theme and dark mode',
    references: ['skills/tigercat/references/theme.md'],
    keywords: ['theme', 'dark', 'mode', 'color', '主题', '暗色', '颜色']
  },
  i18n: {
    title: 'Locale and i18n',
    references: ['skills/tigercat/references/i18n.md'],
    keywords: ['i18n', 'locale', 'language', 'translation', '国际化', '语言', '文案']
  },
  ssr: {
    title: 'SSR integration',
    references: ['skills/tigercat/references/ssr.md'],
    keywords: ['ssr', 'serverrender', 'nuxt', 'next', 'hydration', '服务端']
  },
  accessibility: {
    title: 'Accessibility and keyboard support',
    references: ['skills/tigercat/references/accessibility.md'],
    keywords: ['a11y', 'accessibility', 'aria', 'keyboard', '无障碍', '键盘']
  },
  performance: {
    title: 'Performance and bundle size',
    references: ['skills/tigercat/references/performance.md'],
    keywords: ['performance', 'perf', 'bundle', 'size', 'lazy', '性能', '体积']
  },
  release: {
    title: 'Maintainer release workflow',
    references: ['skills/tigercat/references/release.md'],
    keywords: ['release', 'publish', 'rc', 'version', '发布', '版本']
  },
  tokens: {
    title: 'Design tokens',
    references: ['skills/tigercat/references/tokens.md'],
    keywords: ['token', 'tokens', 'design', 'figma', '变量']
  },
  app: {
    title: 'Application shell and routing',
    references: ['skills/tigercat/references/recipes/building-apps.md'],
    keywords: ['app', 'shell', 'routing', 'route', 'layout', '应用', '路由', '布局']
  },
  commandApis: {
    title: 'Root command APIs',
    references: [
      'skills/tigercat/SKILL.md',
      'skills/tigercat/references/shared/props/feedback.md',
      'skills/tigercat/references/examples/feedback.md',
      'skills/tigercat/references/shared/patterns/common.md'
    ],
    keywords: ['notification', 'message', 'toast', 'imperative', 'commandapi', '通知', '消息']
  }
}

const PACKAGE_EXPORT_TARGET_ALIASES = new Map([
  ['AnchorLink', 'Anchor'],
  ['BreadcrumbItem', 'Breadcrumb'],
  ['DropdownItem', 'Dropdown'],
  ['DropdownMenu', 'Dropdown'],
  ['FloatButtonGroup', 'FloatButton'],
  ['InputGroupAddon', 'InputGroup'],
  ['MenuItem', 'Menu'],
  ['MenuItemGroup', 'Menu'],
  ['PrintPageBreak', 'PrintLayout'],
  ['StepsItem', 'Steps'],
  ['SubMenu', 'Menu'],
  ['TabPane', 'Tabs']
])

export const REQUIRED_CORE_PACKAGE_EXPORTS = [
  '.',
  './tailwind',
  './tailwind/modern',
  './tokens.css',
  './figma-variables.json'
]

export const FRAMEWORK_ROOT_PACKAGE_EXPORT = {
  types: './dist/index.d.mts',
  import: './dist/index.mjs',
  default: './dist/index.mjs'
}

export function kebabToPascal(value) {
  return value
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('')
}

export function pascalToKebab(value) {
  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .toLowerCase()
}

export function normalizeComponentName(name) {
  return COMPONENT_ALIASES[name] || name
}

export function propsInterfaceToComponentName(propsInterface) {
  const name = normalizeComponentName(
    propsInterface
      .replace(/^Vue/, '')
      .replace(/^React/, '')
      .replace(/Props$/, '')
      .replace(/ConfigProvider$/, 'ConfigProvider')
  )

  if (!/^[A-Z]/.test(name)) return null
  if (NON_COMPONENT_TYPE_NAMES.has(name)) return null
  if (/^(Base|Generic|Use|Tiger|React|Vue)$/.test(name)) return null
  return name
}

export function propsToPublicComponents(propsInterfaces, publicComponentNames) {
  return propsInterfaces
    .map(propsInterfaceToComponentName)
    .filter(Boolean)
    .filter((name) => publicComponentNames.has(name))
}

export function getCategoryForTypeName(typeName) {
  return CATEGORY_BY_TYPE_NAME.get(typeName) || 'Other'
}

export function collectPublicComponentExports(indexContent) {
  const componentExports = new Set()
  const exportRegex = /export\s+\{([^}]+)\}\s+from\s+['"]\.\/components\//g
  let match

  while ((match = exportRegex.exec(indexContent)) !== null) {
    const specifiers = match[1].split(',').map((specifier) => specifier.trim())
    for (const specifier of specifiers) {
      const name = specifier.split(/\s+as\s+/)[0].trim()
      if (/^[A-Z]/.test(name) && !/Context$/.test(name)) componentExports.add(name)
    }
  }

  return [...componentExports].sort((a, b) => a.localeCompare(b))
}

export function getComponentPackageSubpath(component) {
  return `./${component}`
}

export function getComponentPackageTarget(component) {
  return PACKAGE_EXPORT_TARGET_ALIASES.get(component) || component
}

export function getComponentPackageExport(component) {
  const target = getComponentPackageTarget(component)

  return {
    types: `./dist/components/${target}.d.mts`,
    import: `./dist/components/${target}.mjs`,
    default: `./dist/components/${target}.mjs`
  }
}

export function buildFrameworkPackageExports(components) {
  const exports = {
    '.': FRAMEWORK_ROOT_PACKAGE_EXPORT
  }

  for (const component of [...components].sort((a, b) => a.localeCompare(b))) {
    exports[getComponentPackageSubpath(component)] = getComponentPackageExport(component)
  }

  return exports
}

export function buildFrameworkPackageSubpathFacts(components) {
  return [...components]
    .sort((a, b) => a.localeCompare(b))
    .map((component) => ({
      component,
      subpath: getComponentPackageSubpath(component),
      target: getComponentPackageTarget(component)
    }))
}

export function loadPublicComponentExports(root) {
  const vue = collectPublicComponentExports(
    readFileSync(join(root, 'packages', 'vue', 'src', 'index.ts'), 'utf-8')
  )
  const react = collectPublicComponentExports(
    readFileSync(join(root, 'packages', 'react', 'src', 'index.tsx'), 'utf-8')
  )

  return {
    vue,
    react,
    all: [...new Set([...vue, ...react])].sort((a, b) => a.localeCompare(b))
  }
}

export function buildPublicComponentEntries(root, fileInfoByName, publicExports) {
  const publicComponentNames = new Set(publicExports.all)
  const entriesByComponent = new Map()

  for (const fileInfo of fileInfoByName.values()) {
    const category = getCategoryForTypeName(fileInfo.typeName)
    if (category === 'Core' || category === 'Other') continue

    for (const propsInterface of fileInfo.propsInterfaces) {
      const component = propsInterfaceToComponentName(propsInterface)
      if (!component || !publicComponentNames.has(component) || entriesByComponent.has(component)) {
        continue
      }

      entriesByComponent.set(component, {
        component,
        category,
        packageSubpath: getComponentPackageSubpath(component),
        packageTarget: getComponentPackageTarget(component),
        props: `shared/props/${CATEGORY_SLUGS[category]}.md#${pascalToKebab(component)}`,
        examples: `examples/${CATEGORY_SLUGS[category]}.md#${pascalToKebab(component)}`,
        typeSource: `packages/core/src/types/${fileInfo.fileName}`,
        propsInterfaces: [propsInterface],
        sourceFiles: [`packages/core/src/types/${fileInfo.fileName}`]
      })
    }
  }

  for (const component of publicExports.all) {
    const frameworkInfo = FRAMEWORK_COMPONENTS[component]
    if (!frameworkInfo) continue

    const category = frameworkInfo.category
    entriesByComponent.set(component, {
      component,
      category,
      packageSubpath: getComponentPackageSubpath(component),
      packageTarget: getComponentPackageTarget(component),
      props: `shared/props/${CATEGORY_SLUGS[category]}.md#${pascalToKebab(component)}`,
      examples: `examples/${CATEGORY_SLUGS[category]}.md#${pascalToKebab(component)}`,
      ...frameworkInfo
    })
  }

  for (const component of publicExports.all) {
    if (entriesByComponent.has(component)) continue

    entriesByComponent.set(component, {
      component,
      category: 'Other',
      packageSubpath: getComponentPackageSubpath(component),
      packageTarget: getComponentPackageTarget(component),
      props: `shared/props/other.md#${pascalToKebab(component)}`,
      examples: `examples/other.md#${pascalToKebab(component)}`,
      typeSource: 'unknown',
      propsInterfaces: []
    })
  }

  return [...entriesByComponent.values()].sort(
    (a, b) => a.category.localeCompare(b.category) || a.component.localeCompare(b.component)
  )
}

export function buildTigercatContext7(componentRows) {
  const components = {}
  const componentIndex = {}

  for (const row of componentRows) {
    const slug = CATEGORY_SLUGS[row.category] || row.category.toLowerCase()
    const references = {
      componentIndex: 'skills/tigercat/references/component-index.md',
      props: `skills/tigercat/references/shared/props/${slug}.md`,
      examples: `skills/tigercat/references/examples/${slug}.md`,
      react: 'skills/tigercat/references/react/index.md',
      vue: 'skills/tigercat/references/vue/index.md'
    }

    components[row.component] = {
      name: row.component,
      aliases: Object.entries(COMPONENT_ROUTE_ALIASES)
        .filter(([, targets]) => targets.includes(row.component))
        .map(([alias]) => alias),
      category: row.category,
      slug,
      testGroup: slug,
      packageSubpath: getComponentPackageSubpath(row.component),
      packageTarget: getComponentPackageTarget(row.component),
      typeSource: row.typeSource,
      sourceFiles: row.sourceFiles || [],
      propsInterfaces: row.propsInterfaces || [],
      frameworks: ['react', 'vue'],
      references
    }

    componentIndex[slug] ??= {
      props: references.props,
      vue: references.vue,
      react: references.react,
      components: [],
      examples: references.examples
    }
    componentIndex[slug].components.push(row.component)
  }

  for (const entry of Object.values(componentIndex)) {
    entry.components.sort((a, b) => a.localeCompare(b))
  }

  return {
    url: 'https://context7.com/expcat/tigercat',
    public_key: 'pk_FJkrJukw2qS9fFqa8Lt4m',
    generated_by: 'pnpm docs:api',
    component_count: Object.keys(components).length,
    reference_paths: {
      skill_index: 'skills/tigercat/SKILL.md',
      component_index: 'skills/tigercat/references/component-index.md',
      api_summary: 'skills/tigercat/references/shared/api-summary.md',
      glossary: 'skills/tigercat/references/shared/glossary.md',
      patterns: 'skills/tigercat/references/shared/patterns/common.md',
      shared_props: 'skills/tigercat/references/shared/props',
      examples: 'skills/tigercat/references/examples',
      react: 'skills/tigercat/references/react/index.md',
      vue: 'skills/tigercat/references/vue/index.md'
    },
    aliases: COMPONENT_ROUTE_ALIASES,
    command_apis: {
      notification: {
        name: 'notification',
        title: 'Imperative notification API',
        topic: 'commandApis',
        references: TIGERCAT_TOPIC_ROUTES.commandApis.references
      },
      Message: {
        name: 'Message',
        title: 'Imperative message API',
        topic: 'commandApis',
        references: TIGERCAT_TOPIC_ROUTES.commandApis.references
      }
    },
    topics: TIGERCAT_TOPIC_ROUTES,
    component_index: componentIndex,
    components
  }
}

export function formatComponentIndexType(typeSource) {
  return typeSource
    .replace(/^packages\/core\/src\/types\//, '')
    .replace(/packages\/[^/]+\/src\/components\//g, '')
    .replace(/ and /g, ', ')
}

export function getDocTarget(componentName) {
  return DOC_SECTION_ALIASES.get(componentName) || componentName
}
