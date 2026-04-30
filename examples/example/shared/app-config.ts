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
      { key: 'button', path: '/button', label: { 'zh-CN': 'Button 按钮', 'en-US': 'Button' } },
      { key: 'icon', path: '/icon', label: { 'zh-CN': 'Icon 图标', 'en-US': 'Icon' } },
      { key: 'link', path: '/link', label: { 'zh-CN': 'Link 链接', 'en-US': 'Link' } },
      { key: 'text', path: '/text', label: { 'zh-CN': 'Text 文本', 'en-US': 'Text' } },
      { key: 'code', path: '/code', label: { 'zh-CN': 'Code 代码', 'en-US': 'Code' } },
      { key: 'image', path: '/image', label: { 'zh-CN': 'Image 图片', 'en-US': 'Image' } },
      {
        key: 'image-cropper',
        path: '/image-cropper',
        label: { 'zh-CN': 'ImageCropper 裁剪', 'en-US': 'ImageCropper' }
      },
      {
        key: 'image-viewer',
        path: '/image-viewer',
        label: { 'zh-CN': 'ImageViewer 查看器', 'en-US': 'ImageViewer' }
      },
      { key: 'avatar', path: '/avatar', label: { 'zh-CN': 'Avatar 头像', 'en-US': 'Avatar' } },
      { key: 'badge', path: '/badge', label: { 'zh-CN': 'Badge 徽标', 'en-US': 'Badge' } },
      { key: 'tag', path: '/tag', label: { 'zh-CN': 'Tag 标签', 'en-US': 'Tag' } },
      { key: 'empty', path: '/empty', label: { 'zh-CN': 'Empty 空状态', 'en-US': 'Empty' } },
      { key: 'result', path: '/result', label: { 'zh-CN': 'Result 结果页', 'en-US': 'Result' } },
      { key: 'qrcode', path: '/qrcode', label: { 'zh-CN': 'QRCode 二维码', 'en-US': 'QRCode' } },
      {
        key: 'statistic',
        path: '/statistic',
        label: { 'zh-CN': 'Statistic 统计', 'en-US': 'Statistic' }
      },
      { key: 'rate', path: '/rate', label: { 'zh-CN': 'Rate 评分', 'en-US': 'Rate' } },
      {
        key: 'segmented',
        path: '/segmented',
        label: { 'zh-CN': 'Segmented 分段', 'en-US': 'Segmented' }
      },
      {
        key: 'watermark',
        path: '/watermark',
        label: { 'zh-CN': 'Watermark 水印', 'en-US': 'Watermark' }
      }
    ]
  },
  {
    key: 'form',
    label: { 'zh-CN': '表单组件', 'en-US': 'Forms' },
    items: [
      { key: 'input', path: '/input', label: { 'zh-CN': 'Input 输入框', 'en-US': 'Input' } },
      {
        key: 'input-group',
        path: '/input-group',
        label: { 'zh-CN': 'InputGroup 输入框组', 'en-US': 'InputGroup' }
      },
      {
        key: 'textarea',
        path: '/textarea',
        label: { 'zh-CN': 'Textarea 文本域', 'en-US': 'Textarea' }
      },
      {
        key: 'checkbox',
        path: '/checkbox',
        label: { 'zh-CN': 'Checkbox 复选框', 'en-US': 'Checkbox' }
      },
      { key: 'radio', path: '/radio', label: { 'zh-CN': 'Radio 单选框', 'en-US': 'Radio' } },
      { key: 'switch', path: '/switch', label: { 'zh-CN': 'Switch 开关', 'en-US': 'Switch' } },
      { key: 'slider', path: '/slider', label: { 'zh-CN': 'Slider 滑块', 'en-US': 'Slider' } },
      {
        key: 'stepper',
        path: '/stepper',
        label: { 'zh-CN': 'Stepper 步进器', 'en-US': 'Stepper' }
      },
      { key: 'select', path: '/select', label: { 'zh-CN': 'Select 选择器', 'en-US': 'Select' } },
      {
        key: 'auto-complete',
        path: '/auto-complete',
        label: { 'zh-CN': 'AutoComplete 自动补全', 'en-US': 'AutoComplete' }
      },
      {
        key: 'cascader',
        path: '/cascader',
        label: { 'zh-CN': 'Cascader 级联选择', 'en-US': 'Cascader' }
      },
      {
        key: 'tree-select',
        path: '/tree-select',
        label: { 'zh-CN': 'TreeSelect 树选择', 'en-US': 'TreeSelect' }
      },
      {
        key: 'color-picker',
        path: '/color-picker',
        label: { 'zh-CN': 'ColorPicker 颜色选择', 'en-US': 'ColorPicker' }
      },
      {
        key: 'mentions',
        path: '/mentions',
        label: { 'zh-CN': 'Mentions 提及', 'en-US': 'Mentions' }
      },
      {
        key: 'transfer',
        path: '/transfer',
        label: { 'zh-CN': 'Transfer 穿梭框', 'en-US': 'Transfer' }
      },
      {
        key: 'datepicker',
        path: '/datepicker',
        label: { 'zh-CN': 'DatePicker 日期', 'en-US': 'DatePicker' }
      },
      {
        key: 'timepicker',
        path: '/timepicker',
        label: { 'zh-CN': 'TimePicker 时间', 'en-US': 'TimePicker' }
      },
      { key: 'upload', path: '/upload', label: { 'zh-CN': 'Upload 上传', 'en-US': 'Upload' } },
      { key: 'form', path: '/form', label: { 'zh-CN': 'Form 表单', 'en-US': 'Form' } }
    ]
  },
  {
    key: 'layout',
    label: { 'zh-CN': '布局组件', 'en-US': 'Layout' },
    items: [
      { key: 'layout', path: '/layout', label: { 'zh-CN': 'Layout 布局', 'en-US': 'Layout' } },
      { key: 'grid', path: '/grid', label: { 'zh-CN': 'Grid 栅格', 'en-US': 'Grid' } },
      { key: 'space', path: '/space', label: { 'zh-CN': 'Space 间距', 'en-US': 'Space' } },
      {
        key: 'divider',
        path: '/divider',
        label: { 'zh-CN': 'Divider 分割线', 'en-US': 'Divider' }
      },
      { key: 'card', path: '/card', label: { 'zh-CN': 'Card 卡片', 'en-US': 'Card' } },
      {
        key: 'descriptions',
        path: '/descriptions',
        label: { 'zh-CN': 'Descriptions 描述列表', 'en-US': 'Descriptions' }
      },
      { key: 'list', path: '/list', label: { 'zh-CN': 'List 列表', 'en-US': 'List' } },
      {
        key: 'skeleton',
        path: '/skeleton',
        label: { 'zh-CN': 'Skeleton 骨架屏', 'en-US': 'Skeleton' }
      },
      {
        key: 'print-layout',
        path: '/print-layout',
        label: { 'zh-CN': 'PrintLayout 打印', 'en-US': 'PrintLayout' }
      }
    ]
  },
  {
    key: 'data',
    label: { 'zh-CN': '数据展示', 'en-US': 'Data Display' },
    items: [
      { key: 'table', path: '/table', label: { 'zh-CN': 'Table 表格', 'en-US': 'Table' } },
      {
        key: 'virtual-table',
        path: '/virtual-table',
        label: { 'zh-CN': 'VirtualTable 虚拟表格', 'en-US': 'VirtualTable' }
      },
      {
        key: 'timeline',
        path: '/timeline',
        label: { 'zh-CN': 'Timeline 时间线', 'en-US': 'Timeline' }
      },
      {
        key: 'progress',
        path: '/progress',
        label: { 'zh-CN': 'Progress 进度条', 'en-US': 'Progress' }
      },
      { key: 'tree', path: '/tree', label: { 'zh-CN': 'Tree 树形控件', 'en-US': 'Tree' } },
      {
        key: 'collapse',
        path: '/collapse',
        label: { 'zh-CN': 'Collapse 折叠面板', 'en-US': 'Collapse' }
      },
      {
        key: 'carousel',
        path: '/carousel',
        label: { 'zh-CN': 'Carousel 走马灯', 'en-US': 'Carousel' }
      },
      {
        key: 'calendar',
        path: '/calendar',
        label: { 'zh-CN': 'Calendar 日历', 'en-US': 'Calendar' }
      }
    ]
  },
  {
    key: 'navigation',
    label: { 'zh-CN': '导航', 'en-US': 'Navigation' },
    items: [
      { key: 'menu', path: '/menu', label: { 'zh-CN': 'Menu 菜单', 'en-US': 'Menu' } },
      {
        key: 'breadcrumb',
        path: '/breadcrumb',
        label: { 'zh-CN': 'Breadcrumb 面包屑', 'en-US': 'Breadcrumb' }
      },
      {
        key: 'dropdown',
        path: '/dropdown',
        label: { 'zh-CN': 'Dropdown 下拉菜单', 'en-US': 'Dropdown' }
      },
      { key: 'tabs', path: '/tabs', label: { 'zh-CN': 'Tabs 标签页', 'en-US': 'Tabs' } },
      { key: 'steps', path: '/steps', label: { 'zh-CN': 'Steps 步骤条', 'en-US': 'Steps' } },
      {
        key: 'pagination',
        path: '/pagination',
        label: { 'zh-CN': 'Pagination 分页', 'en-US': 'Pagination' }
      },
      { key: 'anchor', path: '/anchor', label: { 'zh-CN': 'Anchor 锚点', 'en-US': 'Anchor' } },
      {
        key: 'backtop',
        path: '/backtop',
        label: { 'zh-CN': 'BackTop 回到顶部', 'en-US': 'BackTop' }
      },
      { key: 'affix', path: '/affix', label: { 'zh-CN': 'Affix 固钉', 'en-US': 'Affix' } },
      { key: 'tour', path: '/tour', label: { 'zh-CN': 'Tour 漫游式引导', 'en-US': 'Tour' } },
      {
        key: 'float-button',
        path: '/float-button',
        label: { 'zh-CN': 'FloatButton 浮动按钮', 'en-US': 'FloatButton' }
      }
    ]
  },
  {
    key: 'feedback',
    label: { 'zh-CN': '反馈', 'en-US': 'Feedback' },
    items: [
      { key: 'alert', path: '/alert', label: { 'zh-CN': 'Alert 警告', 'en-US': 'Alert' } },
      { key: 'message', path: '/message', label: { 'zh-CN': 'Message 消息', 'en-US': 'Message' } },
      { key: 'modal', path: '/modal', label: { 'zh-CN': 'Modal 对话框', 'en-US': 'Modal' } },
      {
        key: 'popconfirm',
        path: '/popconfirm',
        label: { 'zh-CN': 'Popconfirm 气泡确认', 'en-US': 'Popconfirm' }
      },
      {
        key: 'popover',
        path: '/popover',
        label: { 'zh-CN': 'Popover 气泡卡片', 'en-US': 'Popover' }
      },
      {
        key: 'tooltip',
        path: '/tooltip',
        label: { 'zh-CN': 'Tooltip 文字提示', 'en-US': 'Tooltip' }
      },
      {
        key: 'notification',
        path: '/notification',
        label: { 'zh-CN': 'Notification 通知', 'en-US': 'Notification' }
      },
      { key: 'drawer', path: '/drawer', label: { 'zh-CN': 'Drawer 抽屉', 'en-US': 'Drawer' } },
      { key: 'loading', path: '/loading', label: { 'zh-CN': 'Loading 加载', 'en-US': 'Loading' } }
    ]
  },
  {
    key: 'charts',
    label: { 'zh-CN': '图表', 'en-US': 'Charts' },
    items: [
      {
        key: 'bar-chart',
        path: '/bar-chart',
        label: { 'zh-CN': 'BarChart 柱状图', 'en-US': 'BarChart' }
      },
      {
        key: 'line-chart',
        path: '/line-chart',
        label: { 'zh-CN': 'LineChart 折线图', 'en-US': 'LineChart' }
      },
      {
        key: 'area-chart',
        path: '/area-chart',
        label: { 'zh-CN': 'AreaChart 面积图', 'en-US': 'AreaChart' }
      },
      {
        key: 'pie-chart',
        path: '/pie-chart',
        label: { 'zh-CN': 'PieChart 饼图', 'en-US': 'PieChart' }
      },
      {
        key: 'donut-chart',
        path: '/donut-chart',
        label: { 'zh-CN': 'DonutChart 环形图', 'en-US': 'DonutChart' }
      },
      {
        key: 'scatter-chart',
        path: '/scatter-chart',
        label: { 'zh-CN': 'ScatterChart 散点图', 'en-US': 'ScatterChart' }
      },
      {
        key: 'radar-chart',
        path: '/radar-chart',
        label: { 'zh-CN': 'RadarChart 雷达图', 'en-US': 'RadarChart' }
      },
      {
        key: 'funnel-chart',
        path: '/funnel-chart',
        label: { 'zh-CN': 'FunnelChart 漏斗图', 'en-US': 'FunnelChart' }
      },
      {
        key: 'gauge-chart',
        path: '/gauge-chart',
        label: { 'zh-CN': 'GaugeChart 仪表盘', 'en-US': 'GaugeChart' }
      },
      {
        key: 'heatmap-chart',
        path: '/heatmap-chart',
        label: { 'zh-CN': 'HeatmapChart 热力图', 'en-US': 'HeatmapChart' }
      },
      {
        key: 'treemap-chart',
        path: '/treemap-chart',
        label: { 'zh-CN': 'TreeMapChart 矩形树图', 'en-US': 'TreeMapChart' }
      },
      {
        key: 'sunburst-chart',
        path: '/sunburst-chart',
        label: { 'zh-CN': 'SunburstChart 旭日图', 'en-US': 'SunburstChart' }
      }
    ]
  },
  {
    key: 'advanced',
    label: { 'zh-CN': '高级交互', 'en-US': 'Advanced' },
    items: [
      {
        key: 'splitter',
        path: '/splitter',
        label: { 'zh-CN': 'Splitter 分割面板', 'en-US': 'Splitter' }
      },
      {
        key: 'resizable',
        path: '/resizable',
        label: { 'zh-CN': 'Resizable 可调整', 'en-US': 'Resizable' }
      },
      {
        key: 'virtual-list',
        path: '/virtual-list',
        label: { 'zh-CN': 'VirtualList 虚拟列表', 'en-US': 'VirtualList' }
      },
      {
        key: 'infinite-scroll',
        path: '/infinite-scroll',
        label: { 'zh-CN': 'InfiniteScroll 无限滚动', 'en-US': 'InfiniteScroll' }
      },
      {
        key: 'code-editor',
        path: '/code-editor',
        label: { 'zh-CN': 'CodeEditor 代码编辑器', 'en-US': 'CodeEditor' }
      },
      {
        key: 'rich-text-editor',
        path: '/rich-text-editor',
        label: { 'zh-CN': 'RichTextEditor 富文本', 'en-US': 'RichTextEditor' }
      },
      { key: 'kanban', path: '/kanban', label: { 'zh-CN': 'Kanban 看板', 'en-US': 'Kanban' } },
      {
        key: 'file-manager',
        path: '/file-manager',
        label: { 'zh-CN': 'FileManager 文件管理', 'en-US': 'FileManager' }
      }
    ]
  },
  {
    key: 'composite',
    label: { 'zh-CN': '组合组件', 'en-US': 'Composite' },
    items: [
      {
        key: 'data-table-with-toolbar',
        path: '/data-table-with-toolbar',
        label: { 'zh-CN': 'DataTableWithToolbar', 'en-US': 'DataTableWithToolbar' }
      },
      {
        key: 'form-wizard',
        path: '/form-wizard',
        label: { 'zh-CN': 'FormWizard 表单向导', 'en-US': 'FormWizard' }
      },
      {
        key: 'chat-window',
        path: '/chat-window',
        label: { 'zh-CN': 'ChatWindow 聊天窗口', 'en-US': 'ChatWindow' }
      },
      {
        key: 'comment-thread',
        path: '/comment-thread',
        label: { 'zh-CN': 'CommentThread 评论', 'en-US': 'CommentThread' }
      },
      {
        key: 'activity-feed',
        path: '/activity-feed',
        label: { 'zh-CN': 'ActivityFeed 动态', 'en-US': 'ActivityFeed' }
      },
      {
        key: 'notification-center',
        path: '/notification-center',
        label: { 'zh-CN': 'NotificationCenter', 'en-US': 'NotificationCenter' }
      },
      {
        key: 'crop-upload',
        path: '/crop-upload',
        label: { 'zh-CN': 'CropUpload 裁剪上传', 'en-US': 'CropUpload' }
      },
      {
        key: 'task-board',
        path: '/task-board',
        label: { 'zh-CN': 'TaskBoard 任务看板', 'en-US': 'TaskBoard' }
      }
    ]
  },
  {
    key: 'hooks',
    label: { 'zh-CN': 'Hooks 组合式函数', 'en-US': 'Hooks' },
    items: [
      {
        key: 'use-drag',
        path: '/use-drag',
        label: { 'zh-CN': 'useDrag 拖拽', 'en-US': 'useDrag' }
      },
      {
        key: 'use-controlled-state',
        path: '/use-controlled-state',
        label: {
          'zh-CN': 'useControlledState 受控/非受控 (React)',
          'en-US': 'useControlledState (React)'
        }
      },
      {
        key: 'use-chart-interaction',
        path: '/use-chart-interaction',
        label: { 'zh-CN': 'useChartInteraction 图表交互', 'en-US': 'useChartInteraction' }
      }
    ]
  }
]
