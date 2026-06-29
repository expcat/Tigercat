#!/usr/bin/env node

/**
 * generate-api-docs.mjs
 *
 * Scans packages/core/src/types/*.ts and generates compact skill references:
 * - skills/tigercat/references/shared/api-summary.md for type lookup
 * - skills/tigercat/references/component-index.md as the canonical component route map
 * - skills/tigercat/references/shared/props/*.md as compact props references
 * - skills/tigercat/references/examples/*.md as shared Vue/React example routes
 *
 * Usage: node scripts/generate-api-docs.mjs
 */

import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { basename, join } from 'node:path'
import prettier from 'prettier'
import ts from 'typescript'
import {
  CATEGORIES,
  CATEGORY_SLUGS,
  buildPublicComponentEntries,
  formatComponentIndexType,
  getComponentPackageSubpath,
  loadPublicComponentExports,
  propsToPublicComponents
} from './lib/public-components.mjs'

const ROOT_DIR = join(import.meta.dirname, '..')
const TYPES_DIR = join(ROOT_DIR, 'packages', 'core', 'src', 'types')
const SKILL_REFERENCES_DIR = join(ROOT_DIR, 'skills', 'tigercat', 'references')
const SHARED_DIR = join(SKILL_REFERENCES_DIR, 'shared')
const PROPS_DIR = join(SHARED_DIR, 'props')
const EXAMPLES_DIR = join(SKILL_REFERENCES_DIR, 'examples')
const LLM_API_SUMMARY = join(SHARED_DIR, 'api-summary.md')
const COMPONENT_INDEX = join(SKILL_REFERENCES_DIR, 'component-index.md')

const CATEGORY_DESCRIPTIONS = {
  Basic: '基础展示与低级交互组件。',
  Form: '表单输入、选择、校验和上传相关组件。',
  Feedback: '覆盖层、提示、加载、结果和进度反馈组件。',
  Layout: '布局容器、栅格、列表、分割和尺寸控制组件。',
  Navigation: '导航、菜单、分页、步骤、锚点和树形导航组件。',
  Data: '数据展示、表格、时间线、日历和折叠面板组件。',
  Charts: '图表画布、图例、工具提示和可视化组件。',
  Advanced: '编辑器、虚拟化、文件、拖拽、看板和高级工具组件。',
  Composite: '由基础组件组合出的业务型组件。',
  Core: '核心类型、事件、主题、locale、slot 和泛型工具。'
}

const EXAMPLE_NOTES = {
  Basic: 'Vue/React API 基本同名；React 使用 `className`，Vue 使用 `class` 或透传 attrs。',
  Form: 'Vue 优先使用 `v-model`；React 使用 `value`/`checked` 搭配 `onChange`。',
  Feedback: '弹层类组件通常使用 `open`/`update:open` 或 `open`/`onOpenChange`。',
  Layout: '布局组件通常组合使用，先确定容器，再选择 Space/Grid/List 等局部排版组件。',
  Navigation: '受控导航组件优先维护当前项、页码或展开状态，再传给组件。',
  Data: '表格和复杂数据组件先定义列、数据和 key，再处理分页、选择、展开等增强项。',
  Charts: '图表组件共享数据、series、legend、tooltip 和 axes 模式，细节看 chart 类型源。',
  Advanced: '高级组件通常需要受控数据、回调和性能边界，先看 props 再写示例。',
  Composite: '组合组件面向业务场景，优先按现有 props 接口配置，而不是拆开重写内部结构。'
}

const COMPONENT_USAGE_NOTES = {
  Dropdown: {
    uses: ['DropdownMenu', 'DropdownItem'],
    notes:
      '菜单默认渲染到 `document.body`（React portal / Vue Teleport，zIndex 1000），不会被 overflow 容器裁剪或表格固定列遮挡；设置 `portal: false` 可回退到原位渲染。依赖菜单 DOM 层级的选择器可改用 `[data-tiger-dropdown-menu]` 查询。触发器（trigger）上会暴露稳定的 `data-state="open" | "closed"` 属性（与 `aria-expanded` 同步），可用于自定义样式联动或无障碍钩子（此约定对所有浮层触发器统一适用，详见 patterns/common 的“浮层触发器状态属性”）。需要在渲染自定义触发器时拿到开启状态，可用 Vue `#trigger="{ open }"` 作用域插槽 / React `renderTrigger={({ open }) => …}` prop。'
  },
  Icon: {
    notes:
      '内置图标集通过 `name` 属性指定；自定义 SVG 子元素仍享有更高优先级；图标注册表由 `@expcat/tigercat-core` 及其子路径 `@expcat/tigercat-core/icons/registry` 导出。'
  },
  Image: {
    notes:
      '支持 `previewTrigger="hover"` 以展示浮动放大预览层，而非默认的 `click` 全屏预览；悬停预览仅对单张图片生效（在 `ImageGroup` 内部时禁用）。'
  },
  Card: {
    notes:
      '`padding`（`boolean | string`）可用于覆写基于内置 `size` 计算的内边距。设为 `false` 可移除内边距，传入字符串（如 `"p-8"`）可注入自定义 Tailwind 样式类。'
  },
  Drawer: {
    notes: '`bodyPadding`（`boolean | string`）可覆写抽屉主体的默认内边距 `px-6 py-4`。'
  },
  ChatWindow: {
    uses: ['Avatar', 'Textarea/Input', 'Button', 'VirtualList', 'Empty'],
    notes:
      '`virtual` 开启后消息列表走 `VirtualList`；输入区根据 `inputType` 选择 `Textarea` 或 `Input`。'
  },
  ActivityFeed: {
    uses: ['Timeline', 'Avatar', 'Tag', 'Card', 'Text', 'Link', 'Loading'],
    notes: '时间线、头像、状态标签和动作链接由组件内部组合，业务侧优先传 `items` 或 `groups`。'
  },
  CommentThread: {
    uses: ['Avatar', 'Tag', 'Button', 'Textarea', 'Text'],
    notes:
      '评论树、回复框和 action 文案通过自身 props 控制；`items` 可作为扁平数据输入。展开状态受控量为 `expandedKeys`：Vue 使用 `update:expandedKeys` / `v-model:expanded-keys`，React 对应历史回调名 `onExpandedChange`。'
  },
  NotificationCenter: {
    uses: ['Card', 'Tabs/TabPane', 'List', 'Text', 'Button', 'Loading'],
    notes: '传 `groups` 时使用 Tabs 分组；平铺通知列表走 List。'
  },
  TableToolbar: {
    uses: ['Input', 'Select', 'Button', 'Popover', 'Checkbox'],
    notes:
      '这是 `DataTableWithToolbar` 的 toolbar 配置接口，框架实现中不作为独立组件导出。`filters` 默认渲染 Select；需要 Input、DatePicker、年龄段等复合控件时用 `filters[].render(context)`，或在尾部注入 Vue `#filters-extra` / React `toolbar.filtersExtra`。`showColumnSettings` 开启列设置面板（Popover + Checkbox），可用 `columnSettings.lockedColumnKeys` 或列级 `hideable: false` 锁定不可隐藏的列——这是「可见性锁定」，与 Table 的 `columnLockable` / `column.fixed`（横向滚动钉列的「位置锁定」）是两个不同概念。'
  },
  DataTableWithToolbar: {
    uses: ['Table', 'Input', 'Select', 'Button', 'Popover', 'Checkbox'],
    notes:
      '透传 Table props（含 `columnLockable`、列级 `column.fixed` 钉列与 `tableLayout`）：开启 `columnLockable` 后表头出现锁定按钮，锁定列会进入左侧固定区，未锁定列向右排列，可与列级 `column.fixed` 配合实现横向滚动钉列，注意这与 `toolbar.columnSettings.lockedColumnKeys`（列设置面板中不可隐藏的可见性锁定）是两个不同概念。卡片模式同样通过 `responsiveMode="card"` / `responsive-mode="card"`、`cardBreakpoint` 和列级 `hideInCard` / `cardTitle` / `cardPriority` 配置；自定义网格可用列级 `cardGrid` 或表级 `cardLayout`，`cardLayout` 优先于 `cardGrid`，最窄屏默认单列，`sm` 及以上按 `colSpan` 混排；默认卡片可用 `cardSelectionPosition`、`cardPadding`、`divider`、`labelClassName` 和 `valueClassName` 做轻量布局调整。`pagination` 沿用 Table 的 `PaginationConfig`、`ConfigProvider` locale 和 `pagination.locale` 覆盖规则。`toolbar.filters[].render`、Vue `#filters-extra` 和 React `toolbar.filtersExtra` 可在工具栏过滤区放入自定义控件。`toolbar.showColumnSettings` 开启列设置入口，列显隐通过 `hiddenColumnKeys`（受控）/ `defaultHiddenColumnKeys`（非受控）驱动，React 用 `onHiddenColumnKeysChange` 回调，Vue 支持 `v-model:hidden-column-keys`。'
  },
  Table: {
    uses: ['TableColumn', 'Pagination', 'row selection', 'expandable rows'],
    notes:
      '固定列通过 `column.fixed`（`left` / `right`）开启；开启 `columnLockable` 后表头会出现锁定按钮，点击可交互切换该列进入左侧固定区，按钮的 `aria-label` 走 i18n，可用 `lockColumnAriaLabel` / `unlockColumnAriaLabel`（模板支持 `{column}`）自定义。推荐在列定义上用 `fixedClassName` / `fixedHeaderClassName` 自定义 sticky 背景，而不是依赖全局 sticky CSS 覆盖。当存在固定列或开启 `columnLockable` 时，表格会渲染 `<colgroup>` + `<col>` 钉死每列宽度（有声明 `width` 的列用声明值，无声明宽度的列冻结首次实测宽度），使列宽与 `fixed`/锁定状态解耦——切换锁定不会改变任何列宽，sticky 偏移保持准确；代价是这类表格的自适应列在首次测量后宽度被冻结、不再随容器宽度回流（普通表格不受影响）。`tableLayout`（默认 `"auto"`，可设为 `"fixed"`）切换底层 `table-layout`，固定列/钉列场景配合列 `width` 时 `"fixed"` 列宽更稳定。卡片模式默认关闭，需显式设置 `responsiveMode="card"` / `responsive-mode="card"`；窄屏断点由 `cardBreakpoint` 控制，卡片字段由列级 `hideInCard`、`cardTitle`、`cardPriority` 控制，自定义网格用列级 `cardGrid` 或表级 `cardLayout`（优先级更高），最窄屏默认单列，`sm` 及以上按 `colSpan` 混排；默认卡片可用 `cardSelectionPosition`、`cardPadding`、`divider`、`labelClassName`、`valueClassName` 做轻量布局调整，且 `cardFieldGap`（默认 "gap-3"，需传完整 Tailwind gap 类以便 Tailwind JIT 静态识别）可调整字段间的间距。列显隐通过 `hiddenColumnKeys`（受控）/ `defaultHiddenColumnKeys`（非受控）控制，React 用 `onHiddenColumnKeysChange` 回调，Vue 支持 `v-model:hidden-column-keys`；固定列偏移、卡片字段、导出与列拖拽都只作用于可见列（隐藏列上已生效的筛选仍会继续过滤数据）。为保证锁定/固定列在横向滚动时 `position: sticky` 稳定钉住，表格根使用 `border-separate` + `border-spacing-0`，行/表头分隔线落在单元格（`<td>`/`<th>`）而非 `<tr>`/`<thead>`。'
  },
  VirtualTable: {
    uses: ['TableColumn', 'virtual scroll range', 'fixed column offsets'],
    notes:
      '复用 `TableColumn` 类型；固定列同样支持 `fixedClassName` / `fixedHeaderClassName`，用于跟随 striped、selected 和 hover 状态定制 sticky 单元格样式。'
  },
  FormWizard: {
    uses: ['Steps/StepsItem', 'Button', 'ConfigProvider'],
    notes: '按钮文案优先使用显式 props，其次组件 `locale`，再回退到 `ConfigProvider` locale。'
  },
  TaskBoard: {
    uses: ['ConfigProvider', 'task-board drag utilities', 'kanban utilities'],
    notes: '拖拽、WIP、过滤和空状态文案由 core 工具和 locale helpers 共同驱动。'
  },
  Kanban: {
    uses: ['TaskBoard'],
    notes:
      'Kanban 是 `TaskBoard` 的薄封装，默认启用 `showCardCount` 和 `allowAddCard`，类型扩展来自 `kanban.ts`。'
  }
}

const COMPONENT_PROPS_EXTRA = {
  Icon: `
### Built-in icon set

内置图标支持通过 \`name\` 属性直接渲染。所有内置图标均注册在图标注册表中，可以通过 \`@expcat/tigercat-core/icons/registry\` 导出相关 API 和定义。

**内置图标名称列表 (\`IconName\`):**
- \`close\` / \`success\` / \`warning\` / \`error\` / \`info\` / \`check\`
- \`chevron-up\` / \`chevron-down\` / \`chevron-left\` / \`chevron-right\`
- \`arrow-up\` / \`arrow-down\` / \`arrow-left\` / \`arrow-right\`
- \`search\` / \`plus\` / \`minus\` / \`edit\` / \`trash\`
- \`user\` / \`settings\` / \`eye\` / \`eye-off\` / \`calendar\` / \`clock\`
- \`menu\` / \`more-horizontal\` / \`more-vertical\` / \`external-link\`

**图标注册表导出的辅助函数与类型:**
- \`iconRegistry\`: 图标定义全局注册表对象。
- \`iconNames\`: 包含所有内置图标名称的只读数组。
- \`getIconDefinition(name: string)\`: 根据名称获取图标定义的方法。
- \`IconDefinition\`: 图标定义接口类型。
- \`IconName\`: 包含所有内置图标名称的联合类型。
- \`IconRenderMode\`: 图标渲染模式联合类型 (\`'svg' | 'font'\`)。

导入路径示例：
\`\`\`ts
import { iconRegistry, iconNames, getIconDefinition } from '@expcat/tigercat-core/icons/registry'
\`\`\`
`,
  TableToolbar: `
Custom filter context: \`filters[].render({ filter, value, filters, setValue, setFilter })\`. Use \`setValue(value)\` to update the current filter key, or \`setFilter(key, value)\` when one custom control updates another key. \`TableToolbarFilterValue\` accepts \`string | number | Record<string, unknown> | null\`, so range filters can emit \`{ ageRange: { min, max } }\`.

### Per-filter container styling

\`filters[].itemClass\` 和 \`filters[].itemStyle\` 可逐项定制 filter 容器样式。 \`itemClass\` 使用**替换语义**——提供时整体替换默认宽度类，不追加。默认宽度类：

- Select 型 filter：\`w-full sm:w-auto sm:min-w-[120px] sm:max-w-[180px]\`
- 自定义 render 型 filter：\`w-full sm:w-auto\`

如需保留部分默认类，请在 \`itemClass\` 中手动包含。

### Toolbar container and search styling

| Prop | Semantics | Default classes |
| ---- | --------- | --------------- |
| \`className?\` | **追加** | 追加到 \`flex flex-wrap items-center gap-3 p-4\` 之后 |
| \`style?\` | 内联样式 | 作为 CSS 内联样式确定性覆盖间距等 |
| \`searchClassName?\` | **替换** | 替换默认 \`w-full sm:w-auto sm:min-w-[220px] sm:max-w-[320px]\`，结构类 \`flex items-center gap-2\` 保留 |

### Full toolbar replacement

Vue 通过 \`#toolbar\` 作用域插槽，React 通过 \`toolbar.render\`（函数或 ReactNode），完全替换内置工具栏区域（含 \`role="toolbar"\` 容器）。

\`TableToolbarRenderContext\` 字段：\`searchValue\`, \`setSearch\`, \`submitSearch\`, \`filters\`, \`setFilter\`, \`selectedKeys\`, \`selectedCount\`, \`hiddenColumnKeys\`, \`setHiddenColumnKeys\`。

> **a11y 注意**：使用自定义 toolbar 时，内置 \`role="toolbar"\` 容器不再渲染，调用方应自行在自定义 toolbar 根元素上添加 \`role="toolbar"\` 和 \`aria-label\`。
`,
  DataTableWithToolbar: `
卡片自定义（公开 API）：\`renderCard(context)\` / \`cardClassName\`（\`string\` 或 \`(record, index) => string\`）已在 \`DataTableWithToolbar\` 显式声明并转发给内部 Table；Vue 侧另有 \`#card="{ record, index, columns, selected, expanded, toggleExpand, selectRow }"\` 作用域插槽，**插槽优先于 \`renderCard\` prop**。
`,
  Menu: `
### Collapsed mode behavior

当 \`collapsed\` 为 \`true\` 时（仅 vertical 模式），菜单项呈现以下行为：

- **图标居中**：折叠态图标去除 \`mr-2\` 右间距，仅保留 \`flex-shrink-0\`，确保图标在容器内视觉居中。
- **标签 sr-only 保留**：完整标签文本以 \`sr-only\` 元素保留在 DOM 中，对视觉用户不可见但屏幕阅读器可读。折叠菜单项的可访问名称为完整标签（如 \`name: 'alpha'\`），而非首字母。
- **首字母回退**：无图标的菜单项显示首字母（大写），该 span 附带 \`aria-hidden="true"\` 避免可访问名称出现 "A alpha" 的重复拼接。
- **子菜单箭头隐藏**：折叠态下 SubMenu 的展开箭头（ExpandIcon）不渲染。
- **SubMenu 标题**：同样遵循上述图标/标签/首字母/箭头规则。
`
}

const COMPONENT_EXAMPLE_EXTRA = {
  Composite: `
## DataTableWithToolbar Custom Filters

Use \`toolbar.filters[].render(context)\` when the custom control belongs to a filter definition. Use the extra area when app code already owns the control state or needs to append several controls after configured Select filters.

Vue \`filters-extra\` age range:

\`\`\`vue
<script setup lang="ts">
const getAgeRange = (value: unknown) =>
  value && typeof value === 'object' ? (value as { min?: string; max?: string }) : {}
</script>

<DataTableWithToolbar
  :columns="columns"
  :data-source="rows"
  :toolbar="{
    filters: [
      { key: 'status', label: '状态', options: statusOptions }
    ]
  }"
  @filters-change="filters = $event">
  <template #filters-extra="{ filters, setFilter }">
    <div class="flex items-center gap-2">
      <span>年龄段</span>
      <Input
        :model-value="getAgeRange(filters.ageRange).min ?? ''"
        placeholder="最小"
        @update:model-value="(min) =>
          setFilter('ageRange', { ...getAgeRange(filters.ageRange), min })" />
      <span>-</span>
      <Input
        :model-value="getAgeRange(filters.ageRange).max ?? ''"
        placeholder="最大"
        @update:model-value="(max) =>
          setFilter('ageRange', { ...getAgeRange(filters.ageRange), max })" />
    </div>
  </template>
</DataTableWithToolbar>
\`\`\`

React \`filtersExtra\` age range:

\`\`\`tsx
<DataTableWithToolbar
  columns={columns}
  dataSource={rows}
  toolbar={{
    filters: [{ key: 'status', label: '状态', options: statusOptions }],
    filtersExtra: ({ filters, setFilter }) => {
      const ageRange =
        filters.ageRange && typeof filters.ageRange === 'object'
          ? (filters.ageRange as { min?: string; max?: string })
          : {}

      return (
        <div className="flex items-center gap-2">
          <span>年龄段</span>
          <Input
            value={ageRange.min ?? ''}
            placeholder="最小"
            onChange={(event) =>
              setFilter('ageRange', { ...ageRange, min: event.currentTarget.value })
            }
          />
          <span>-</span>
          <Input
            value={ageRange.max ?? ''}
            placeholder="最大"
            onChange={(event) =>
              setFilter('ageRange', { ...ageRange, max: event.currentTarget.value })
            }
          />
        </div>
      )
    }
  }}
  onFiltersChange={setFilters}
/>
\`\`\`

\`filters[].render\` receives \`{ filter, value, filters, setValue, setFilter }\`; call \`setValue({ min, max })\` to emit an object value for the current filter key.
`
}

const COMPONENT_SNIPPETS = {
  Vue: {
    Icon: '<Icon name="search" />',
    ChatWindow: '<ChatWindow :messages="messages" />',
    ActivityFeed: '<ActivityFeed :items="items" />',
    CommentThread: '<CommentThread :nodes="nodes" />',
    NotificationCenter: '<NotificationCenter :items="items" />',
    TableToolbar:
      '<DataTableWithToolbar :columns="columns" :data-source="rows" :toolbar="toolbar" />',
    DataTableWithToolbar:
      '<DataTableWithToolbar :columns="cardColumns" :data-source="rows" responsive-mode="card" card-breakpoint="lg" :card-layout="cardLayout" :toolbar="toolbar" />',
    Table:
      '<Table :columns="cardColumns" :data-source="rows" responsive-mode="card" card-breakpoint="lg" :card-layout="cardLayout" :pagination="false" />',
    FormWizard: '<FormWizard :steps="steps" />',
    TaskBoard: '<TaskBoard :columns="columns" />',
    Kanban: '<Kanban :columns="columns" />',
    VirtualTable:
      '<VirtualTable :data="rows" :columns="fixedColumns" :row-height="40" :height="320" />'
  },
  React: {
    Icon: '<Icon name="search" />',
    ChatWindow: '<ChatWindow messages={messages} />',
    ActivityFeed: '<ActivityFeed items={items} />',
    CommentThread: '<CommentThread nodes={nodes} />',
    NotificationCenter: '<NotificationCenter items={items} />',
    TableToolbar: '<DataTableWithToolbar columns={columns} dataSource={rows} toolbar={toolbar} />',
    DataTableWithToolbar:
      '<DataTableWithToolbar columns={cardColumns} dataSource={rows} responsiveMode="card" cardBreakpoint="lg" cardLayout={cardLayout} toolbar={toolbar} />',
    Table:
      '<Table columns={cardColumns} dataSource={rows} responsiveMode="card" cardBreakpoint="lg" cardLayout={cardLayout} pagination={false} />',
    FormWizard: '<FormWizard steps={steps} />',
    TaskBoard: '<TaskBoard columns={columns} />',
    Kanban: '<Kanban columns={columns} />',
    VirtualTable: '<VirtualTable data={rows} columns={fixedColumns} rowHeight={40} height={320} />'
  }
}

const MAX_PROPS_PER_COMPONENT = 3
const MAX_EVENTS_PER_COMPONENT = 6

let prettierConfigPromise
async function formatMarkdown(content) {
  prettierConfigPromise ??= prettier.resolveConfig(SKILL_REFERENCES_DIR)
  const config = await prettierConfigPromise
  return prettier.format(content, { ...config, parser: 'markdown' })
}

function hasExportModifier(node) {
  return Boolean(node.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword))
}

function getDeclarationName(node) {
  return node.name && ts.isIdentifier(node.name) ? node.name.text : null
}

function getJsDocText(node) {
  const docs = ts.getJSDocCommentsAndTags(node)
  const comments = []

  for (const doc of docs) {
    if (ts.isJSDoc(doc)) {
      if (typeof doc.comment === 'string') comments.push(doc.comment)
      if (doc.tags) {
        for (const tag of doc.tags) {
          if (tag.tagName.text === 'deprecated') comments.push('Deprecated.')
        }
      }
    }
  }

  return comments.join(' ').replace(/\s+/g, ' ').trim()
}

function getJsDocTag(node, tagName) {
  for (const tag of ts.getJSDocTags(node)) {
    if (tag.tagName.text !== tagName) continue
    return typeof tag.comment === 'string' ? tag.comment.trim() : ''
  }
  return ''
}

function cleanTypeText(text) {
  return text
    .replace(/\s+/g, ' ')
    .replace(/\s*=>\s*/g, ' => ')
    .replace(/\s*\|\s*/g, ' | ')
    .replace(/\s*&\s*/g, ' & ')
    .trim()
}

function compactDescription(text) {
  const value = text.replace(/\|/g, '\\|').trim()
  if (value.length <= 90) return value
  return `${value.slice(0, 87).trim()}...`
}

function tableText(text) {
  return String(text).replace(/\|/g, '\\|')
}

function codeText(text) {
  return tableText(String(text).replace(/`/g, '\\`'))
}

function extractMembers(node, sourceFile) {
  if (!node.members) return []

  return node.members
    .filter((member) => ts.isPropertySignature(member) || ts.isMethodSignature(member))
    .map((member) => {
      const name = member.name?.getText(sourceFile) ?? ''
      const optional = Boolean(member.questionToken)
      const rawType = ts.isMethodSignature(member)
        ? member.getText(sourceFile).replace(/^\s*[\w$]+\??\s*/, '')
        : member.type?.getText(sourceFile) || 'unknown'
      return {
        name: `${name}${optional ? '?' : ''}`,
        type: cleanTypeText(rawType),
        defaultValue: getJsDocTag(member, 'default') || '-',
        description: compactDescription(getJsDocText(member) || '-'),
        kind: /^on[A-Z]/.test(name) ? 'event' : ts.isMethodSignature(member) ? 'method' : 'prop'
      }
    })
}

function extractFileInfo(fileName, content) {
  const sourceFile = ts.createSourceFile(fileName, content, ts.ScriptTarget.Latest, true)
  const exports = []
  const propsInterfaces = []
  const interfaceDetails = []

  function visit(node) {
    if (
      (ts.isInterfaceDeclaration(node) ||
        ts.isTypeAliasDeclaration(node) ||
        ts.isEnumDeclaration(node) ||
        ts.isFunctionDeclaration(node)) &&
      hasExportModifier(node)
    ) {
      const name = getDeclarationName(node)
      if (name) exports.push(name)
    }

    if (ts.isVariableStatement(node) && hasExportModifier(node)) {
      for (const declaration of node.declarationList.declarations) {
        if (ts.isIdentifier(declaration.name)) exports.push(declaration.name.text)
      }
    }

    if (
      ts.isInterfaceDeclaration(node) &&
      hasExportModifier(node) &&
      node.name.text.endsWith('Props')
    ) {
      propsInterfaces.push(node.name.text)
      interfaceDetails.push({
        name: node.name.text,
        description: compactDescription(getJsDocText(node) || `${node.name.text} definition`),
        members: extractMembers(node, sourceFile)
      })
    }

    ts.forEachChild(node, visit)
  }

  visit(sourceFile)
  return {
    fileName,
    typeName: basename(fileName).replace(/\.(tsx?|mts|cts)$/, ''),
    exports,
    propsInterfaces,
    interfaceDetails
  }
}

function getCategorizedFiles(fileInfoByName) {
  const categorized = []
  const used = new Set()

  for (const [category, typeFiles] of Object.entries(CATEGORIES)) {
    const files = typeFiles.map((typeFile) => fileInfoByName.get(typeFile)).filter(Boolean)
    files.forEach((fileInfo) => used.add(fileInfo.typeName))
    categorized.push({ category, files })
  }

  const otherFiles = [...fileInfoByName.values()].filter((fileInfo) => !used.has(fileInfo.typeName))
  if (otherFiles.length > 0) categorized.push({ category: 'Other', files: otherFiles })

  return categorized
}

function countExportedTypes(categorizedFiles) {
  return categorizedFiles.reduce(
    (totalTypes, { files }) =>
      totalTypes + files.reduce((fileTotal, fileInfo) => fileTotal + fileInfo.exports.length, 0),
    0
  )
}

function generateLlmApiSummary(categorizedFiles, totalTypes, publicComponentNames) {
  let markdownText = '---\n'
  markdownText += 'name: tigercat-api-summary\n'
  markdownText += 'description: Compact generated API summary for Tigercat core types\n'
  markdownText += '---\n\n'
  markdownText += '<!-- generated by pnpm docs:api -->\n\n'
  markdownText += '# Tigercat API Summary\n\n'
  markdownText += '> 自动生成。用于定位类型文件和 Props 接口；字段细节看分类 props 文档或源码。\n\n'

  for (const { category, files } of categorizedFiles) {
    markdownText += `## ${category}\n\n`
    markdownText += '| Type File | Props Interfaces | Components | Exports |\n'
    markdownText += '| --------- | ---------------- | ---------- | ------- |\n'
    for (const fileInfo of files) {
      const components = propsToPublicComponents(fileInfo.propsInterfaces, publicComponentNames)
      markdownText += `| ${fileInfo.fileName} | ${fileInfo.propsInterfaces.join(', ') || '-'} | ${components.join(', ') || '-'} | ${fileInfo.exports.length} |\n`
    }
    markdownText += '\n'
  }

  markdownText += `Total exported types: ${totalTypes}.\n`
  return markdownText
}

function generateComponentIndex(componentRows) {
  let markdownText = '---\n'
  markdownText += 'name: tigercat-component-index\n'
  markdownText +=
    'description: Canonical Tigercat component route map for props, examples, and type source files\n'
  markdownText += '---\n\n'
  markdownText += '<!-- generated by pnpm docs:api -->\n\n'
  markdownText += '# Component Index\n\n'
  markdownText +=
    '每个公开组件只在这里路由一次。定位组件后按以下规则打开文档（`{cat}` = Category 列小写，`{Component}` = 组件名）：\n\n'
  markdownText += '- Props：在 `shared/props/{cat}.md` 内找 `## {Component}` 段。\n'
  markdownText += '- Examples：在 `examples/{cat}.md` 内找 `## {Component}` 段或同名片段。\n'
  markdownText +=
    '- 类型源码：`packages/core/src/types/` + Type 列；个别跨包组件（如 ConfigProvider）以各框架包内同名文件为准，详见其 props 段。\n\n'
  markdownText +=
    '- Test group：组件批次优先运行 `pnpm test:group:{group}`；需要限定框架时使用 `pnpm test:group -- --group {group} --framework react|vue`。\n\n'
  markdownText +=
    '- Package subpath：React/Vue 组件按需使用均优先走 PascalCase 显式入口，例如 `@expcat/tigercat-react/Button` 或 `@expcat/tigercat-vue/Button`；根入口 named exports 仅作为小应用便利入口与非组件 API 入口。\n\n'
  markdownText += '| Component | Category | Test Group | Type | Package Subpath |\n'
  markdownText += '| --------- | -------- | ---------- | ---- | --------------- |\n'

  for (const row of componentRows) {
    const typeFile = formatComponentIndexType(row.typeSource)
    const testGroup = CATEGORY_SLUGS[row.category] || row.category.toLowerCase()
    markdownText += `| ${row.component} | ${row.category} | \`${testGroup}\` | ${typeFile} | ${getComponentPackageSubpath(row.component)} |\n`
  }

  return markdownText
}

function getComponentUsageText(component) {
  const usage = COMPONENT_USAGE_NOTES[component]
  if (!usage) return ''

  let markdownText = ''
  if (usage.uses?.length) {
    markdownText += `Uses: ${usage.uses.map((item) => `\`${codeText(item)}\``).join(', ')}.\n\n`
  }
  if (usage.notes) {
    markdownText += `Note: ${usage.notes}\n\n`
  }
  return markdownText
}

function generateComponentNotesTable(components) {
  const rows = components
    .map((component) => ({ component, usage: COMPONENT_USAGE_NOTES[component] }))
    .filter((row) => row.usage)

  if (rows.length === 0) return ''

  let markdownText = '## Component Notes\n\n'
  markdownText += '| Component | Uses | Notes |\n'
  markdownText += '| --------- | ---- | ----- |\n'
  for (const row of rows) {
    const uses = row.usage.uses?.map((item) => `\`${codeText(item)}\``).join(', ') || '-'
    markdownText += `| ${row.component} | ${uses} | ${tableText(row.usage.notes || '-')} |\n`
  }
  markdownText += '\n'
  return markdownText
}

function collectInterfaceDetails(fileInfos) {
  const details = new Map()
  for (const fileInfo of fileInfos) {
    for (const detail of fileInfo.interfaceDetails) {
      if (!details.has(detail.name)) details.set(detail.name, detail)
    }
  }
  return details
}

function getComponentDetails(entry, interfaceDetails) {
  return (entry.propsInterfaces || []).map((name) => interfaceDetails.get(name)).filter(Boolean)
}

function mergeMembers(details, kind) {
  const members = []
  const seen = new Set()

  for (const detail of details) {
    for (const member of detail.members.filter((item) => item.kind === kind)) {
      if (seen.has(member.name)) continue
      seen.add(member.name)
      members.push(member)
    }
  }

  return members
}

function getPropsExtra(component) {
  const extras = [COMPONENT_PROPS_EXTRA[component]]
  if (component === 'DataTableWithToolbar') extras.push(COMPONENT_PROPS_EXTRA.TableToolbar)
  return extras.filter(Boolean).join('\n\n')
}

function generatePublicPropsReference(category, componentEntries, interfaceDetails) {
  const slug = CATEGORY_SLUGS[category] || category.toLowerCase()
  let markdownText = '---\n'
  markdownText += `name: tigercat-props-${slug}\n`
  markdownText += `description: Compact generated Tigercat ${category} props reference\n`
  markdownText += '---\n\n'
  markdownText += '<!-- generated by pnpm docs:api -->\n\n'
  markdownText += `# ${category} Props\n\n`
  markdownText += `${CATEGORY_DESCRIPTIONS[category] || 'Tigercat component props.'} 共 ${componentEntries.length} 个组件。字段细节以 \`packages/core/src/types/*.ts\` 为准；跨包组件以本段列出的源码为准。\n\n`

  for (const entry of componentEntries) {
    const component = entry.component
    const details = getComponentDetails(entry, interfaceDetails)
    const propRows = entry.propsRows || mergeMembers(details, 'prop')
    const eventRows = mergeMembers(details, 'event')
    const methodRows = mergeMembers(details, 'method')
    const shownCount = Math.min(propRows.length, MAX_PROPS_PER_COMPONENT)
    const propsMeta =
      propRows.length > shownCount ? ` · ${shownCount}/${propRows.length} props` : ''
    const interfaceNames =
      details.map((detail) => detail.name).join(' / ') || entry.propsInterfaces?.join(' / ') || '-'

    markdownText += `## ${component}\n\n`
    markdownText += `\`${entry.typeSource}\` · \`${interfaceNames}\`${propsMeta}\n\n`
    markdownText += getComponentUsageText(component)

    if (propRows.length > 0) {
      const visiblePropRows = propRows.slice(0, MAX_PROPS_PER_COMPONENT)
      markdownText += '| Prop | Type | Default | Notes |\n'
      markdownText += '| ---- | ---- | ------- | ----- |\n'
      for (const member of visiblePropRows) {
        markdownText += `| \`${codeText(member.name)}\` | \`${codeText(member.type)}\` | \`${codeText(member.defaultValue)}\` | ${tableText(member.description)} |\n`
      }
      markdownText += '\n'
    }

    if (entry.passThroughNote) markdownText += `${entry.passThroughNote}\n\n`

    if (eventRows.length > 0) {
      markdownText += 'Events/callback props: '
      markdownText += eventRows
        .slice(0, MAX_EVENTS_PER_COMPONENT)
        .map((member) => `\`${member.name}\``)
        .join(', ')
      if (eventRows.length > MAX_EVENTS_PER_COMPONENT) markdownText += ', ...'
      markdownText += '.\n\n'
    }

    if (methodRows.length > 0) {
      markdownText += 'Method signatures: '
      markdownText += methodRows.map((member) => `\`${member.name}\``).join(', ')
      markdownText += '.\n\n'
    }

    const propsExtra = getPropsExtra(component)
    if (propsExtra) markdownText += `${propsExtra.trim()}\n\n`
  }

  return markdownText
}

function getVueSnippet(component, category) {
  if (COMPONENT_SNIPPETS.Vue[component]) return COMPONENT_SNIPPETS.Vue[component]
  if (
    category === 'Form' &&
    ['Input', 'Select', 'Checkbox', 'Radio', 'Switch', 'Textarea'].includes(component)
  ) {
    return `<${component} v-model=\"value\" />`
  }
  if (component === 'Form')
    return '<Form :model=\"form\"><FormItem name=\"name\"><Input v-model=\"form.name\" /></FormItem></Form>'
  if (component === 'Table')
    return '<Table :columns=\"columns\" :data-source=\"rows\" row-key=\"id\" />'
  if (category === 'Charts') return `<${component} :data=\"data\" />`
  return `<${component} />`
}

function getReactSnippet(component, category) {
  if (COMPONENT_SNIPPETS.React[component]) return COMPONENT_SNIPPETS.React[component]
  if (
    category === 'Form' &&
    ['Input', 'Select', 'Checkbox', 'Radio', 'Switch', 'Textarea'].includes(component)
  ) {
    return `<${component} value={value} onChange={setValue} />`
  }
  if (component === 'Form')
    return '<Form model={form}><FormItem name=\"name\"><Input value={form.name} onChange={onNameChange} /></FormItem></Form>'
  if (component === 'Table') return '<Table columns={columns} dataSource={rows} rowKey=\"id\" />'
  if (category === 'Charts') return `<${component} data={data} />`
  return `<${component} />`
}

function generateExamples(category, componentEntries) {
  const slug = CATEGORY_SLUGS[category] || category.toLowerCase()
  const components = componentEntries.map((entry) => entry.component)
  let markdownText = '---\n'
  markdownText += `name: tigercat-examples-${slug}\n`
  markdownText += `description: Compact Tigercat ${category} Vue and React usage routes\n`
  markdownText += '---\n\n'
  markdownText += '<!-- generated by pnpm docs:api -->\n\n'
  markdownText += `# ${category} Examples\n\n`
  markdownText += `${EXAMPLE_NOTES[category] || 'Use the props reference for exact field names.'}\n\n`
  markdownText += generateComponentNotesTable(components)

  const snippetRows = components
    .map((component) => ({
      component,
      vue: getVueSnippet(component, category),
      react: getReactSnippet(component, category)
    }))
    .filter((row) => row.vue !== `<${row.component} />` || row.react !== `<${row.component} />`)
  const trivialComponents = components.filter(
    (component) => !snippetRows.some((row) => row.component === component)
  )

  if (snippetRows.length > 0) {
    markdownText += '只列出绑定/配置非平凡的组件；其余为标准 `<Component />`。\n\n'
    markdownText += '| Component | Vue | React |\n'
    markdownText += '| --------- | --- | ----- |\n'
    for (const row of snippetRows) {
      markdownText += `| ${row.component} | \`${codeText(row.vue)}\` | \`${codeText(row.react)}\` |\n`
    }
    markdownText += '\n'
  }

  if (trivialComponents.length > 0) {
    markdownText += `标准用法 \`<Component />\`（Vue/React 同名，绑定差异见 \`shared/patterns/common.md\`）：${trivialComponents.join(', ')}.\n\n`
  }

  markdownText +=
    'Imports: prefer PascalCase component subpaths such as `@expcat/tigercat-vue/Button` and `@expcat/tigercat-react/Button`; keep root named exports for convenience-only usage, hooks/composables, `Message` / `notification` command APIs, and shared types.\n'
  if (COMPONENT_EXAMPLE_EXTRA[category]) {
    markdownText += `\n${COMPONENT_EXAMPLE_EXTRA[category].trim()}\n`
  }
  return markdownText
}

function generateFrameworkIndex(framework) {
  const packageName = framework === 'vue' ? '@expcat/tigercat-vue' : '@expcat/tigercat-react'
  const bindingNote =
    framework === 'vue'
      ? 'Vue examples use `v-model`, kebab-case events, and template syntax.'
      : 'React examples use controlled props, camelCase callbacks, and JSX syntax.'

  let markdownText = '---\n'
  markdownText += `name: tigercat-${framework}\n`
  markdownText += `description: Tigercat ${framework === 'vue' ? 'Vue 3' : 'React'} routing page for generated examples\n`
  markdownText += '---\n\n'
  markdownText += `# Tigercat ${framework === 'vue' ? 'Vue 3' : 'React'}\n\n`
  markdownText += `${bindingNote} Install from \`${packageName}\`; import components from PascalCase subpaths for on-demand usage.\n\n`
  markdownText +=
    '查组件用法：先开 [component-index.md](../component-index.md) 定位组件、Category 与 PascalCase Package Subpath，再按其规则打开 `shared/props/{cat}.md` 与 `examples/{cat}.md`。跨框架绑定差异见 [shared/patterns/common.md](../shared/patterns/common.md) 与 [shared/glossary.md](../shared/glossary.md)。\n'
  return markdownText
}

async function main() {
  const typeFiles = (await readdir(TYPES_DIR)).filter(
    (fileName) => fileName.endsWith('.ts') && fileName !== 'index.ts'
  )

  const fileInfoByName = new Map()
  for (const fileName of typeFiles) {
    const content = await readFile(join(TYPES_DIR, fileName), 'utf8')
    const fileInfo = extractFileInfo(fileName, content)
    fileInfoByName.set(fileInfo.typeName, fileInfo)
  }

  const categorizedFiles = getCategorizedFiles(fileInfoByName)
  const totalTypes = countExportedTypes(categorizedFiles)
  const publicExports = loadPublicComponentExports(ROOT_DIR)
  const publicComponentNames = new Set(publicExports.all)
  const componentRows = buildPublicComponentEntries(ROOT_DIR, fileInfoByName, publicExports)
  const frameworkSourceFiles = [
    ...new Set(componentRows.flatMap((entry) => entry.sourceFiles || []))
  ].filter((fileName) => !fileName.startsWith('packages/core/src/types/'))
  const frameworkFileInfos = []
  for (const fileName of frameworkSourceFiles) {
    const content = await readFile(join(ROOT_DIR, fileName), 'utf8')
    frameworkFileInfos.push(extractFileInfo(fileName, content))
  }
  const interfaceDetails = collectInterfaceDetails([
    ...[...fileInfoByName.values()],
    ...frameworkFileInfos
  ])
  const entriesByCategory = new Map()
  for (const entry of componentRows) {
    if (!entriesByCategory.has(entry.category)) {
      entriesByCategory.set(entry.category, [])
    }
    entriesByCategory.get(entry.category).push(entry)
  }

  await mkdir(SHARED_DIR, { recursive: true })
  await mkdir(PROPS_DIR, { recursive: true })
  await mkdir(EXAMPLES_DIR, { recursive: true })
  await rm(PROPS_DIR, { recursive: true, force: true })
  await rm(EXAMPLES_DIR, { recursive: true, force: true })
  await mkdir(PROPS_DIR, { recursive: true })
  await mkdir(EXAMPLES_DIR, { recursive: true })

  await writeFile(
    LLM_API_SUMMARY,
    await formatMarkdown(generateLlmApiSummary(categorizedFiles, totalTypes, publicComponentNames)),
    'utf8'
  )
  await writeFile(
    COMPONENT_INDEX,
    await formatMarkdown(generateComponentIndex(componentRows)),
    'utf8'
  )

  for (const category of Object.keys(CATEGORIES)) {
    if (category === 'Core') continue
    const entries = entriesByCategory.get(category) || []
    if (entries.length === 0) continue
    const slug = CATEGORY_SLUGS[category]
    await writeFile(
      join(PROPS_DIR, `${slug}.md`),
      await formatMarkdown(generatePublicPropsReference(category, entries, interfaceDetails)),
      'utf8'
    )
    await writeFile(
      join(EXAMPLES_DIR, `${slug}.md`),
      await formatMarkdown(generateExamples(category, entries)),
      'utf8'
    )
  }

  await writeFile(
    join(SKILL_REFERENCES_DIR, 'vue', 'index.md'),
    await formatMarkdown(generateFrameworkIndex('vue')),
    'utf8'
  )
  await writeFile(
    join(SKILL_REFERENCES_DIR, 'react', 'index.md'),
    await formatMarkdown(generateFrameworkIndex('react')),
    'utf8'
  )

  console.log(`Skill references generated under: ${SKILL_REFERENCES_DIR}`)
  console.log(`Total exported types: ${totalTypes}`)
  console.log(`Indexed components: ${componentRows.length}`)
}

main().catch((error) => {
  console.error('Failed to generate API docs:', error)
  process.exit(1)
})
