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
  Data: ['calendar', 'collapse', 'countdown', 'table', 'timeline'],
  Charts: ['chart', 'gantt', 'org-chart'],
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
  Composite: ['composite'],
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
      'packages/react/src/components/Message.tsx and packages/vue/src/components/Message.ts',
    sourceFiles: [
      'packages/react/src/components/Message.tsx',
      'packages/vue/src/components/Message.ts'
    ],
    propsInterfaces: ['MessageContainerProps', 'VueMessageContainerProps']
  },
  NotificationContainer: {
    category: 'Feedback',
    typeSource:
      'packages/react/src/components/Notification.tsx and packages/vue/src/components/Notification.ts',
    sourceFiles: [
      'packages/react/src/components/Notification.tsx',
      'packages/vue/src/components/Notification.ts'
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

export function formatComponentIndexType(typeSource) {
  return typeSource
    .replace(/^packages\/core\/src\/types\//, '')
    .replace(/packages\/[^/]+\/src\/components\//g, '')
    .replace(/ and /g, ', ')
}

export function getDocTarget(componentName) {
  return DOC_SECTION_ALIASES.get(componentName) || componentName
}
