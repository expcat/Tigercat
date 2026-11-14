#!/usr/bin/env node

/**
 * Vue 手写 Props 接口与运行时 props 的键必须一致。
 *
 * 不并进 API 基线：基线只快照已经导出的类型，运行时新增字段而接口没写时快照不变，
 * `api:baseline:check` 仍然通过。这里用 TypeScript 解析运行时 props 对象和导出接口
 * （含 extends），少一个字段或接口多一个运行时没有的字段都失败，不能靠重写快照消除。
 *
 * 范围是 S13 这批组件。仓库里还有同类缺口（图表 bind、内部 _shakeTrigger 等），
 * 不在这 23 条里，扩到全库会把别的任务卷进来。
 */

import { unlinkSync, writeFileSync } from 'fs'
import { join } from 'path'
import ts from 'typescript'

const ROOT = join(import.meta.dirname, '..')
const VUE_DIR = join(ROOT, 'packages', 'vue')
const FIXTURE_PATH = join(VUE_DIR, 'src', 'props-parity-fixture.ts')

const ENFORCED = [
  'Breadcrumb',
  'Card',
  'ContextMenu',
  'DataExport',
  'Drawer',
  'FloatButton',
  'Form',
  'FormItem',
  'Kbd',
  'Modal',
  'Pagination',
  'Popover',
  'Select',
  'Sidebar',
  'Slider',
  'Space',
  'Splitter',
  'Steps',
  'StepsItem',
  'Tabs',
  'Tooltip',
  'Tree',
  'TreeSelect'
]

const FIXTURE = `import type { PopoverProps as CorePopoverProps } from '../../core/src/types/popover'
// Core 类型从源码导入：types:check 跑在 pnpm build 之前，包入口的 dist 还没有这次新增的字段。
import { Kbd, type VueKbdProps } from './components/Kbd'
import type { VueCardProps } from './components/Card'
import type { VueSidebarProps } from './components/Sidebar'
import type { VueSpaceProps } from './components/Space'
import type { VueSplitterProps } from './components/Splitter'
import type { VueFormProps } from './components/Form'
import type { VueFormItemProps } from './components/FormItem'
import type { VueSelectProps } from './components/Select'
import type { VueSliderProps } from './components/Slider'
import type { TreeSelectProps, VueTreeSelectProps } from './components/TreeSelect'
import type { VueBreadcrumbProps } from './components/Breadcrumb'
import type { ContextMenuProps, VueContextMenuProps } from './components/ContextMenu'
import type { FloatButtonProps, VueFloatButtonProps } from './components/FloatButton'
import type { VuePaginationProps } from './components/Pagination'
import type { StepsItemProps, StepsProps } from './components/Steps'
import type { TabsProps } from './components/Tabs'
import type { TreeProps } from './components/Tree'
import type { DrawerProps } from './components/Drawer'
import type { ModalProps } from './components/Modal'
import type { PopoverProps, VuePopoverProps } from './components/Popover'
import type { TooltipProps } from './components/Tooltip'
import type { VueDataExportProps } from './components/DataExport'

const keys = ['Ctrl', 'K'] as const
const kbdProps: VueKbdProps = { keys }
const kbdRuntime: InstanceType<typeof Kbd>['$props'] = { keys }
const card: VueCardProps = { titleLevel: 4 }
const sidebar: VueSidebarProps = { collapsible: true }
const spaceSplit: VueSpaceProps = { split: true }
const spaceClass: VueSpaceProps = { className: 'caller' }
const spaceStyle: VueSpaceProps = { style: { gap: '4px' } }
const splitter: VueSplitterProps = { collapsible: true }
const form: VueFormProps = { showErrorSummary: true }
const formItem: VueFormItemProps = { disabled: true }
const select: VueSelectProps = {
  maxCount: 2,
  readOnly: true,
  optionFields: { label: 'name' }
}
const slider: VueSliderProps = {
  readOnly: true,
  pushApart: true,
  showRange: true,
  formatTooltip: (value: number) => String(value)
}
const treeSelect: VueTreeSelectProps = { listHeight: 80 }
const treeSelectAlias: TreeSelectProps = { listHeight: 80 }
type VueTreeSelectHasHeight = 'height' extends keyof VueTreeSelectProps ? true : false
type TreeSelectHasHeight = 'height' extends keyof TreeSelectProps ? true : false
const vueTreeSelectHasHeight: VueTreeSelectHasHeight = false
const treeSelectHasHeight: TreeSelectHasHeight = false
const breadcrumb: VueBreadcrumbProps = { locale: {}, labels: {} }
const contextMenu: VueContextMenuProps = { items: [] }
const contextMenuAlias: ContextMenuProps = { items: [] }
const floatButton: VueFloatButtonProps = { href: '/docs', badge: 1 }
const floatButtonAlias: FloatButtonProps = { href: '/docs', badge: 'new' }
const pagination: VuePaginationProps = {
  ellipsisJump: true,
  itemRender: (page: number) => String(page)
}
const steps: StepsProps = { progressDot: true, locale: {}, labels: {} }
const stepsItem: StepsItemProps = { title: 'A', stepIndex: 0, isLast: false }
const tabs: TabsProps = { locale: {}, labels: {} }
const tree: TreeProps = { expandOnClick: true }
const drawer: DrawerProps = { resizable: true }
const modal: ModalProps = { showCancel: false }
const popover: VuePopoverProps = {
  ariaLabel: 'More',
  showDelay: 100,
  hideDelay: 100,
  closeOnScroll: true
}
const popoverAlias: PopoverProps = { closeOnScroll: true }
const tooltip: TooltipProps = { showDelay: 50, hideDelay: 50 }
const dataExport: VueDataExportProps = {
  columns: [],
  dataSource: [],
  customExport: () => undefined
}
const corePopover: CorePopoverProps = { closeOnScroll: true }

void {
  kbdProps,
  kbdRuntime,
  card,
  sidebar,
  spaceSplit,
  spaceClass,
  spaceStyle,
  splitter,
  form,
  formItem,
  select,
  slider,
  treeSelect,
  treeSelectAlias,
  vueTreeSelectHasHeight,
  treeSelectHasHeight,
  breadcrumb,
  contextMenu,
  contextMenuAlias,
  floatButton,
  floatButtonAlias,
  pagination,
  steps,
  stepsItem,
  tabs,
  tree,
  drawer,
  modal,
  popover,
  popoverAlias,
  tooltip,
  dataExport,
  corePopover
}
`

function propName(name) {
  if (!name) return null
  if (ts.isIdentifier(name) || ts.isStringLiteral(name)) return name.text
  return null
}

function typeKeys(type) {
  const names = []
  for (const symbol of type.getProperties()) {
    const name = symbol.getName()
    if (!/^[A-Za-z_$][\w$]*$/.test(name)) continue
    names.push(name)
  }
  return names
}

function exportedPropsType(checker, sourceFile, componentName) {
  const wanted = new Set([`Vue${componentName}Props`, `${componentName}Props`])
  let found = null
  function visit(node) {
    if (found) return
    const isExport = node.modifiers?.some(
      (modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword
    )
    if (
      isExport &&
      ts.isInterfaceDeclaration(node) &&
      wanted.has(node.name.text) &&
      node.name.text.startsWith('Vue')
    ) {
      found = checker.getTypeAtLocation(node.name)
      return
    }
    if (
      isExport &&
      ts.isTypeAliasDeclaration(node) &&
      wanted.has(node.name.text) &&
      node.name.text.startsWith('Vue')
    ) {
      found = checker.getTypeFromTypeNode(node.type)
    }
    ts.forEachChild(node, visit)
  }
  visit(sourceFile)
  return found
}

function runtimePropsType(checker, sourceFile, componentName) {
  let found = null
  function visit(node) {
    if (found) return
    if (ts.isCallExpression(node)) {
      const called = ts.isIdentifier(node.expression)
        ? node.expression.text
        : ts.isPropertyAccessExpression(node.expression)
          ? node.expression.name.text
          : ''
      const parent = node.parent
      if (
        called === 'defineComponent' &&
        ts.isVariableDeclaration(parent) &&
        ts.isIdentifier(parent.name) &&
        parent.name.text === componentName
      ) {
        const arg = node.arguments[0]
        if (arg && ts.isObjectLiteralExpression(arg)) {
          for (const property of arg.properties) {
            const name = ts.isPropertyAssignment(property)
              ? propName(property.name)
              : ts.isShorthandPropertyAssignment(property)
                ? property.name.text
                : null
            if (name !== 'props') continue
            const initializer = ts.isPropertyAssignment(property)
              ? property.initializer
              : property.name
            found = checker.getTypeAtLocation(initializer)
          }
        }
      }
    }
    ts.forEachChild(node, visit)
  }
  visit(sourceFile)
  return found
}

function formatDiagnostics(diagnostics) {
  return ts.formatDiagnosticsWithColorAndContext(diagnostics, {
    getCanonicalFileName: (fileName) => fileName,
    getCurrentDirectory: () => ROOT,
    getNewLine: () => '\n'
  })
}

const configPath = join(VUE_DIR, 'tsconfig.json')
const config = ts.readConfigFile(configPath, ts.sys.readFile)
const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, VUE_DIR)

writeFileSync(FIXTURE_PATH, FIXTURE)
let exitCode = 0
try {
  const program = ts.createProgram({
    rootNames: [...parsed.fileNames, FIXTURE_PATH],
    options: parsed.options
  })
  const checker = program.getTypeChecker()
  const issues = []
  const seen = new Set()

  for (const sourceFile of program.getSourceFiles()) {
    if (!sourceFile.fileName.includes(`${join('packages', 'vue', 'src', 'components')}`)) continue
    for (const componentName of ENFORCED) {
      const runtime = runtimePropsType(checker, sourceFile, componentName)
      if (!runtime) continue
      seen.add(componentName)
      const declared = exportedPropsType(checker, sourceFile, componentName)
      if (!declared) {
        issues.push(`${componentName}: exported Vue${componentName}Props not found`)
        continue
      }
      const runtimeKeys = new Set(typeKeys(runtime))
      const declaredKeys = new Set(typeKeys(declared))
      const missing = [...runtimeKeys].filter((key) => !declaredKeys.has(key)).sort()
      const extra = [...declaredKeys].filter((key) => !runtimeKeys.has(key)).sort()
      if (missing.length > 0) {
        issues.push(`${componentName} Vue${componentName}Props missing: ${missing.join(', ')}`)
      }
      if (extra.length > 0) {
        issues.push(`${componentName} Vue${componentName}Props extra: ${extra.join(', ')}`)
      }
    }
  }

  for (const componentName of ENFORCED) {
    if (!seen.has(componentName)) issues.push(`${componentName}: runtime props not found`)
  }

  const fixture = program.getSourceFile(FIXTURE_PATH)
  const diagnostics = fixture
    ? [
        ...program.getSyntacticDiagnostics(fixture),
        ...program.getSemanticDiagnostics(fixture)
      ].filter((diagnostic) => diagnostic.file?.fileName === FIXTURE_PATH)
    : [{ messageText: 'props parity fixture was not loaded' }]

  if (issues.length > 0) {
    console.error(`Vue props parity failed (${issues.length}):`)
    for (const issue of issues) console.error(`  ${issue}`)
    exitCode = 1
  }
  if (diagnostics.length > 0) {
    console.error('Vue props acceptance types failed:')
    console.error(formatDiagnostics(diagnostics))
    exitCode = 1
  }
  if (exitCode === 0) {
    console.log(`Vue props parity matched ${ENFORCED.length} components.`)
  }
} finally {
  unlinkSync(FIXTURE_PATH)
}

process.exit(exitCode)
