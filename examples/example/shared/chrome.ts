import type { DemoLang } from './app-config'

export interface DemoChromeCopy {
  language: string
  theme: string
  dark: string
  home: string
  openMenu: string
  expandSidebar: string
  collapseSidebar: string
  closeMenu: string
  settings: string
  editSource: string
  hideSource: string
  run: string
  compiling: string
  reset: string
  copyFile: string
  files: string
  preparing: string
  compileFailed: string
  runtimeFailed: string
  dirty: string
  console: string
  previewTitle: string
  navSearch: string
  homeTitle: string
  homeLead: string
  homeFramework: string
  homeFrameworkLead: string
  homeInstall: string
  homeCss: string
  homeCssLead: string
  homeUsage: string
  homeTheme: string
  homeStart: string
}

export const DEMO_CHROME: Record<DemoLang, DemoChromeCopy> = {
  'zh-CN': {
    language: '语言：',
    theme: '主题：',
    dark: '暗色：',
    home: '首页',
    openMenu: '打开菜单',
    expandSidebar: '展开侧边栏',
    collapseSidebar: '收起侧边栏',
    closeMenu: '关闭菜单',
    settings: '设置',
    editSource: '编辑源码',
    hideSource: '收起源码',
    run: '运行',
    compiling: '编译中…',
    reset: '重置',
    copyFile: '复制当前文件',
    files: '示例文件',
    preparing: '正在准备独立示例…',
    compileFailed: '示例编译失败',
    runtimeFailed: '示例运行失败',
    dirty: '已修改 · 尚未运行',
    console: '控制台',
    previewTitle: '示例预览',
    navSearch: '搜索组件',
    homeTitle: '如何在项目中使用 Tigercat',
    homeLead: '按照下面的步骤安装并使用组件库。',
    homeFramework: '当前框架',
    homeFrameworkLead: '与 ConfigProvider 深度集成。',
    homeInstall: '1. 安装',
    homeCss: '2. 配置 Tailwind v4 CSS',
    homeCssLead: '在项目的 CSS 入口中加载 Tailwind、Tigercat 插件与组件扫描路径：',
    homeUsage: '3. 组件使用',
    homeTheme: '4. 主题（可选）',
    homeStart: '开始使用'
  },
  'en-US': {
    language: 'Language:',
    theme: 'Theme:',
    dark: 'Dark:',
    home: 'Home',
    openMenu: 'Open menu',
    expandSidebar: 'Expand sidebar',
    collapseSidebar: 'Collapse sidebar',
    closeMenu: 'Close menu',
    settings: 'Settings',
    editSource: 'Edit source',
    hideSource: 'Hide source',
    run: 'Run',
    compiling: 'Compiling…',
    reset: 'Reset',
    copyFile: 'Copy file',
    files: 'Example files',
    preparing: 'Preparing isolated example…',
    compileFailed: 'Example failed to compile',
    runtimeFailed: 'Example failed to run',
    dirty: 'Edited · not run yet',
    console: 'Console',
    previewTitle: 'example preview',
    navSearch: 'Search components',
    homeTitle: 'Using Tigercat in your project',
    homeLead: 'Install the library and wrap your app in ConfigProvider.',
    homeFramework: 'Current framework',
    homeFrameworkLead: 'Deep integration with ConfigProvider.',
    homeInstall: '1. Install',
    homeCss: '2. Tailwind v4 CSS',
    homeCssLead: 'Load Tailwind, the Tigercat plugin, and package scan paths in your CSS entry:',
    homeUsage: '3. Usage',
    homeTheme: '4. Theme (optional)',
    homeStart: 'Get started'
  }
}

export function demoChrome(lang: DemoLang): DemoChromeCopy {
  return DEMO_CHROME[lang]
}

export function demoModuleTitle(meta: { id: string; title: string }, lang: DemoLang): string {
  return lang === 'en-US' ? meta.id : meta.title
}
