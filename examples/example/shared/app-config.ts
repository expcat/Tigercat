export type DemoLang = 'zh-CN' | 'en-US'

export interface DemoNavItem {
  key: string
  path: string
  label: Record<DemoLang, string>
}

export interface DemoNavGroup {
  key: string
  label: Record<DemoLang, string>
  items: DemoNavItem[]
}

export const DEMO_APP_TITLE: Record<DemoLang, string> = {
  'zh-CN': 'Tigercat 示例',
  'en-US': 'Tigercat Examples'
}

export const DEMO_LANG_OPTIONS: Array<{ label: string; value: DemoLang }> = [
  { label: '中文', value: 'zh-CN' },
  { label: 'English', value: 'en-US' }
]

export const DEMO_NAV_GROUPS: DemoNavGroup[] = [
  {
    key: 'basic',
    label: { 'zh-CN': '基础组件', 'en-US': 'Basics' },
    items: [
      {
        key: 'button',
        path: '/button',
        label: { 'zh-CN': 'Button', 'en-US': 'Button' }
      },
      {
        key: 'icon',
        path: '/icon',
        label: { 'zh-CN': 'Icon', 'en-US': 'Icon' }
      },
      {
        key: 'link',
        path: '/link',
        label: { 'zh-CN': 'Link', 'en-US': 'Link' }
      },
      {
        key: 'text',
        path: '/text',
        label: { 'zh-CN': 'Text', 'en-US': 'Text' }
      },
      {
        key: 'code',
        path: '/code',
        label: { 'zh-CN': 'Code', 'en-US': 'Code' }
      }
    ]
  },
  {
    key: 'form',
    label: { 'zh-CN': '表单组件', 'en-US': 'Forms' },
    items: [
      {
        key: 'input',
        path: '/input',
        label: { 'zh-CN': 'Input', 'en-US': 'Input' }
      },
      {
        key: 'textarea',
        path: '/textarea',
        label: { 'zh-CN': 'Textarea', 'en-US': 'Textarea' }
      },
      {
        key: 'checkbox',
        path: '/checkbox',
        label: { 'zh-CN': 'Checkbox', 'en-US': 'Checkbox' }
      },
      {
        key: 'radio',
        path: '/radio',
        label: { 'zh-CN': 'Radio', 'en-US': 'Radio' }
      },
      {
        key: 'switch',
        path: '/switch',
        label: { 'zh-CN': 'Switch', 'en-US': 'Switch' }
      },
      {
        key: 'slider',
        path: '/slider',
        label: { 'zh-CN': 'Slider', 'en-US': 'Slider' }
      },
      {
        key: 'select',
        path: '/select',
        label: { 'zh-CN': 'Select', 'en-US': 'Select' }
      },
      {
        key: 'form',
        path: '/form',
        label: { 'zh-CN': 'Form', 'en-US': 'Form' }
      },
      {
        key: 'datepicker',
        path: '/datepicker',
        label: { 'zh-CN': 'DatePicker', 'en-US': 'DatePicker' }
      },
      {
        key: 'timepicker',
        path: '/timepicker',
        label: { 'zh-CN': 'TimePicker', 'en-US': 'TimePicker' }
      },
      {
        key: 'upload',
        path: '/upload',
        label: { 'zh-CN': 'Upload', 'en-US': 'Upload' }
      }
    ]
  },
  {
    key: 'layout',
    label: { 'zh-CN': '布局组件', 'en-US': 'Layout' },
    items: [
      {
        key: 'layout',
        path: '/layout',
        label: { 'zh-CN': 'Layout', 'en-US': 'Layout' }
      },
      {
        key: 'grid',
        path: '/grid',
        label: { 'zh-CN': 'Grid', 'en-US': 'Grid' }
      },
      {
        key: 'space',
        path: '/space',
        label: { 'zh-CN': 'Space', 'en-US': 'Space' }
      },
      {
        key: 'divider',
        path: '/divider',
        label: { 'zh-CN': 'Divider', 'en-US': 'Divider' }
      }
    ]
  },
  {
    key: 'data',
    label: { 'zh-CN': '数据展示', 'en-US': 'Data Display' },
    items: [
      {
        key: 'table',
        path: '/table',
        label: { 'zh-CN': 'Table', 'en-US': 'Table' }
      },
      { key: 'tag', path: '/tag', label: { 'zh-CN': 'Tag', 'en-US': 'Tag' } },
      {
        key: 'badge',
        path: '/badge',
        label: { 'zh-CN': 'Badge', 'en-US': 'Badge' }
      },
      {
        key: 'card',
        path: '/card',
        label: { 'zh-CN': 'Card', 'en-US': 'Card' }
      },
      {
        key: 'avatar',
        path: '/avatar',
        label: { 'zh-CN': 'Avatar', 'en-US': 'Avatar' }
      },
      {
        key: 'list',
        path: '/list',
        label: { 'zh-CN': 'List', 'en-US': 'List' }
      },
      {
        key: 'descriptions',
        path: '/descriptions',
        label: { 'zh-CN': 'Descriptions', 'en-US': 'Descriptions' }
      },
      {
        key: 'timeline',
        path: '/timeline',
        label: { 'zh-CN': 'Timeline', 'en-US': 'Timeline' }
      },
      {
        key: 'progress',
        path: '/progress',
        label: { 'zh-CN': 'Progress', 'en-US': 'Progress' }
      },
      {
        key: 'bar-chart',
        path: '/bar-chart',
        label: { 'zh-CN': 'BarChart', 'en-US': 'BarChart' }
      },
      {
        key: 'scatter-chart',
        path: '/scatter-chart',
        label: { 'zh-CN': 'ScatterChart', 'en-US': 'ScatterChart' }
      },
      {
        key: 'skeleton',
        path: '/skeleton',
        label: { 'zh-CN': 'Skeleton', 'en-US': 'Skeleton' }
      },
      {
        key: 'tree',
        path: '/tree',
        label: { 'zh-CN': 'Tree', 'en-US': 'Tree' }
      }
    ]
  },
  {
    key: 'navigation',
    label: { 'zh-CN': '导航', 'en-US': 'Navigation' },
    items: [
      {
        key: 'menu',
        path: '/menu',
        label: { 'zh-CN': 'Menu', 'en-US': 'Menu' }
      },
      {
        key: 'breadcrumb',
        path: '/breadcrumb',
        label: { 'zh-CN': 'Breadcrumb', 'en-US': 'Breadcrumb' }
      },
      {
        key: 'dropdown',
        path: '/dropdown',
        label: { 'zh-CN': 'Dropdown', 'en-US': 'Dropdown' }
      },
      {
        key: 'tabs',
        path: '/tabs',
        label: { 'zh-CN': 'Tabs', 'en-US': 'Tabs' }
      },
      {
        key: 'steps',
        path: '/steps',
        label: { 'zh-CN': 'Steps', 'en-US': 'Steps' }
      },
      {
        key: 'pagination',
        path: '/pagination',
        label: { 'zh-CN': 'Pagination', 'en-US': 'Pagination' }
      }
    ]
  },
  {
    key: 'feedback',
    label: { 'zh-CN': '反馈', 'en-US': 'Feedback' },
    items: [
      {
        key: 'alert',
        path: '/alert',
        label: { 'zh-CN': 'Alert', 'en-US': 'Alert' }
      },
      {
        key: 'message',
        path: '/message',
        label: { 'zh-CN': 'Message', 'en-US': 'Message' }
      },
      {
        key: 'modal',
        path: '/modal',
        label: { 'zh-CN': 'Modal', 'en-US': 'Modal' }
      },
      {
        key: 'popconfirm',
        path: '/popconfirm',
        label: { 'zh-CN': 'Popconfirm', 'en-US': 'Popconfirm' }
      },
      {
        key: 'popover',
        path: '/popover',
        label: { 'zh-CN': 'Popover', 'en-US': 'Popover' }
      },
      {
        key: 'tooltip',
        path: '/tooltip',
        label: { 'zh-CN': 'Tooltip', 'en-US': 'Tooltip' }
      },
      {
        key: 'notification',
        path: '/notification',
        label: { 'zh-CN': 'Notification', 'en-US': 'Notification' }
      },
      {
        key: 'drawer',
        path: '/drawer',
        label: { 'zh-CN': 'Drawer', 'en-US': 'Drawer' }
      },
      {
        key: 'loading',
        path: '/loading',
        label: { 'zh-CN': 'Loading', 'en-US': 'Loading' }
      }
    ]
  }
]
