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
    'input-otp',
    'mask-input',
    'mentions',
    'number-keyboard',
    'tags-input',
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

// 别名经 MCP normalizeName 归一化后按子串匹配任务文本;中文别名须 ≥2 字且避免
// 过泛词(如 选择器/提示/步骤/编辑器),否则会在无关任务里误命中组件。
export const COMPONENT_ROUTE_ALIASES = {
  Grid: ['Row', 'Col'],
  栅格: ['Row', 'Col'],
  按钮: ['Button'],
  按钮组: ['ButtonGroup'],
  浮动按钮: ['FloatButton'],
  悬浮按钮: ['FloatButton'],
  图标: ['Icon'],
  头像: ['Avatar'],
  徽标: ['Badge'],
  徽章: ['Badge'],
  标签: ['Tag'],
  标签页: ['Tabs'],
  选项卡: ['Tabs'],
  输入框: ['Input'],
  数字输入框: ['InputNumber'],
  文本域: ['Textarea'],
  多行输入: ['Textarea'],
  下拉选择: ['Select'],
  下拉框: ['Select'],
  下拉菜单: ['Dropdown'],
  自动完成: ['AutoComplete'],
  自动补全: ['AutoComplete'],
  提及: ['Mentions'],
  单选框: ['Radio'],
  复选框: ['Checkbox'],
  多选框: ['Checkbox'],
  开关: ['Switch'],
  滑块: ['Slider'],
  评分: ['Rate'],
  日期选择: ['DatePicker'],
  时间选择: ['TimePicker'],
  级联选择: ['Cascader'],
  树选择: ['TreeSelect'],
  穿梭框: ['Transfer'],
  上传: ['Upload'],
  裁剪上传: ['CropUpload'],
  表单: ['Form'],
  表单项: ['FormItem'],
  表单向导: ['FormWizard'],
  表格: ['Table'],
  虚拟表格: ['VirtualTable'],
  表格工具栏: ['DataTableWithToolbar'],
  虚拟列表: ['VirtualList'],
  无限滚动: ['InfiniteScroll'],
  分页: ['Pagination'],
  列表: ['List'],
  树形控件: ['Tree'],
  树形: ['Tree'],
  轮播: ['Carousel'],
  走马灯: ['Carousel'],
  折叠面板: ['Collapse'],
  描述列表: ['Descriptions'],
  空状态: ['Empty'],
  骨架屏: ['Skeleton'],
  时间轴: ['Timeline'],
  时间线: ['Timeline'],
  日历: ['Calendar'],
  弹窗: ['Modal'],
  对话框: ['Modal'],
  模态框: ['Modal'],
  抽屉: ['Drawer'],
  气泡确认: ['Popconfirm'],
  气泡卡片: ['Popover'],
  文字提示: ['Tooltip'],
  工具提示: ['Tooltip'],
  警告提示: ['Alert'],
  全局提示: ['Message'],
  消息: ['Message'],
  加载中: ['Loading'],
  进度条: ['Progress'],
  结果页: ['Result'],
  面包屑: ['Breadcrumb'],
  菜单: ['Menu'],
  步骤条: ['Steps'],
  步进器: ['Stepper'],
  分段控制器: ['Segmented'],
  锚点: ['Anchor'],
  回到顶部: ['BackTop'],
  返回顶部: ['BackTop'],
  固钉: ['Affix'],
  滚动监听: ['ScrollSpy'],
  布局: ['Layout'],
  侧边栏: ['Sidebar'],
  容器: ['Container'],
  分割线: ['Divider'],
  分割面板: ['Splitter'],
  间距: ['Space'],
  卡片: ['Card'],
  统计数值: ['Statistic'],
  二维码: ['QRCode'],
  水印: ['Watermark'],
  倒计时: ['Countdown'],
  图片: ['Image'],
  图片预览: ['ImagePreview'],
  图片裁剪: ['ImageCropper'],
  图片标注: ['ImageAnnotation'],
  富文本: ['RichTextEditor'],
  代码编辑器: ['CodeEditor'],
  markdown编辑器: ['MarkdownEditor'],
  cron编辑器: ['CronEditor'],
  颜色选择器: ['ColorPicker'],
  取色器: ['ColorPicker'],
  签名: ['Signature'],
  数字键盘: ['NumberKeyboard'],
  折线图: ['LineChart'],
  柱状图: ['BarChart'],
  饼图: ['PieChart'],
  环形图: ['DonutChart'],
  面积图: ['AreaChart'],
  散点图: ['ScatterChart'],
  雷达图: ['RadarChart'],
  仪表盘: ['GaugeChart'],
  热力图: ['HeatmapChart'],
  漏斗图: ['FunnelChart'],
  旭日图: ['SunburstChart'],
  矩形树图: ['TreeMapChart'],
  甘特图: ['Gantt'],
  组织架构图: ['OrgChart'],
  看板: ['Kanban'],
  任务看板: ['TaskBoard'],
  聊天窗口: ['ChatWindow'],
  评论: ['CommentThread'],
  活动流: ['ActivityFeed'],
  文件管理: ['FileManager'],
  通知中心: ['NotificationCenter'],
  新手引导: ['Tour'],
  漫游式引导: ['Tour'],
  聚光灯: ['Spotlight'],
  全局配置: ['ConfigProvider'],
  打印布局: ['PrintLayout'],
  数据导出: ['DataExport']
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

export function buildTigercatContext7(componentRows, skillFiles = []) {
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
    // 全部 skill markdown 清单：MCP 远程模式无法列目录，靠它构建 allow-list。
    skill_files: skillFiles,
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
