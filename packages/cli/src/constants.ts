export const CLI_NAME = 'tigercat'
export const CLI_VERSION = '0.9.0'

export const TEMPLATES = ['vue3', 'react'] as const
export type TemplateName = (typeof TEMPLATES)[number]

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
