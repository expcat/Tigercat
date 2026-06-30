export const CLI_NAME = 'tigercat'
export const CLI_VERSION = '2.0.0-preview.2'

export const TEMPLATES = ['vue3', 'react'] as const
export type TemplateName = (typeof TEMPLATES)[number]

/**
 * Centralized dependency versions for CLI-generated project templates.
 *
 * Keep these aligned with the workspace catalog in pnpm-workspace.yaml.
 * When bumping versions in the catalog, update them here as well.
 */
export const TEMPLATE_VERSIONS = {
  // Tigercat packages (use caret on latest major)
  tigercat: '^2.0.0-preview.2',

  // Frameworks
  vue: '^3.5.38',
  react: '^19.2.7',
  reactDom: '^19.2.7',

  // Build toolchain
  typescript: '^6.0.3',
  vite: '^8.1.0',
  tailwindcss: '^4.3.1',
  tailwindcssVite: '^4.3.1',

  // Vite plugins
  vitejsPluginVue: '^6.0.7',
  vitejsPluginReact: '^6.0.3',

  // Type definitions
  typesReact: '^19.2.17',
  typesReactDom: '^19.2.3',

  // Vue-specific
  vueTsconfig: '^0.9.1',
  vueTsc: '^3.3.5'
} as const

export const COMPONENT_CATEGORIES = {
  basic: [
    'Alert',
    'Avatar',
    'AvatarGroup',
    'Badge',
    'Button',
    'ButtonGroup',
    'Code',
    'Divider',
    'Icon',
    'Link',
    'Tag',
    'Text'
  ],
  form: [
    'Checkbox',
    'DatePicker',
    'Form',
    'Input',
    'InputNumber',
    'Radio',
    'Select',
    'Slider',
    'Switch',
    'Textarea',
    'TimePicker',
    'Upload'
  ],
  feedback: [
    'Drawer',
    'Loading',
    'Message',
    'Modal',
    'Notification',
    'Popconfirm',
    'Popover',
    'Progress',
    'Tooltip'
  ],
  layout: ['Card', 'Container', 'Descriptions', 'Grid', 'Layout', 'List', 'Skeleton', 'Space'],
  navigation: ['Breadcrumb', 'Dropdown', 'Menu', 'Pagination', 'Steps', 'Tabs', 'Tree'],
  data: ['Table', 'Timeline'],
  charts: [
    'AreaChart',
    'BarChart',
    'DonutChart',
    'LineChart',
    'PieChart',
    'RadarChart',
    'ScatterChart'
  ]
} as const

export const ALL_COMPONENTS = Object.values(COMPONENT_CATEGORIES).flat()
