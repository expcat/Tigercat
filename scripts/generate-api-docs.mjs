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

import { existsSync } from 'node:fs'
import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { basename, join, relative, sep } from 'node:path'
import prettier from 'prettier'
import ts from 'typescript'
import {
  buildRequiredPropSnippet,
  collectPublicHookExports,
  getVisiblePropRows,
  mergeHeritageMembers,
  resolveUsageSnippet,
  shouldUseFrameworkRuntimeProps,
  uniqueMembers
} from './lib/docs-api.mjs'
import {
  CATEGORIES,
  CATEGORY_SLUGS,
  buildTigercatContext7,
  buildPublicComponentEntries,
  formatComponentIndexType,
  getComponentPackageSubpath,
  loadPublicComponentExports,
  pascalToKebab
} from './lib/public-components.mjs'
import { collectFiles } from './utils/files.mjs'

const ROOT_DIR = join(import.meta.dirname, '..')
const TYPES_DIR = join(ROOT_DIR, 'packages', 'core', 'src', 'types')
const SKILL_DIR = join(ROOT_DIR, 'skills', 'tigercat')
const SKILL_REFERENCES_DIR = join(ROOT_DIR, 'skills', 'tigercat', 'references')
const SHARED_DIR = join(SKILL_REFERENCES_DIR, 'shared')
const PROPS_DIR = join(SHARED_DIR, 'props')
const EXAMPLES_DIR = join(SKILL_REFERENCES_DIR, 'examples')
const LLM_API_SUMMARY = join(SHARED_DIR, 'api-summary.md')
const COMPONENT_INDEX = join(SKILL_REFERENCES_DIR, 'component-index.md')
const CONTEXT7_JSON = join(ROOT_DIR, 'context7.json')

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
  DataExport: {
    uses: ['Dropdown', 'DropdownMenu', 'DropdownItem'],
    notes:
      "将 columns + dataSource 导出为真正的 .xlsx（零依赖、STORED zip）、CSV（UTF-8 BOM + CRLF）或 GFM Markdown。序列化在点击时才 `import('@expcat/tigercat-core/utils/data-export')`。默认 `formats` 是 xlsx+markdown 下拉（不含 csv）；单个值才是一颗按钮。列复用 `TableColumn`（`title` 与 `dataKey || key`，不跑 `render`）；操作列和无字段的 `render` 列默认跳过，隐藏列传 `hiddenColumnKeys`。`fileName` 已有后缀不会再拼。locale `triggerAriaLabel` 目前未接到触发器。"
  },
  Dropdown: {
    uses: ['DropdownMenu', 'DropdownItem'],
    notes:
      '默认 `trigger="click"`。`aria-haspopup` / `aria-expanded` / `aria-controls` 打在焦点那颗 button 上：文本触发器自渲 `<button type="button">`，`asChild` 或唯一原生 `button`/`a` 子节点则合并到该节点。菜单沿 overlay 目标链挂载（最近 overlay-host → ConfigProvider 根 → `document.body`）。`data-state="open" | "closed"` 与 `aria-expanded` 同步。Vue `#trigger="{ open }"` / React `renderTrigger={({ open }) => …}`。SplitButton 与 DataExport 走 `asChild`。'
  },
  Button: {
    notes:
      '`htmlType` 与原生 `type` 是同一属性（`htmlType ?? type ?? "button"`，冲突时 htmlType 胜出）。`size` 未设时：组 size → `md`。无可见文字的 icon-only 按钮按 size 为正方形且 padding 为 0，图标居中；必须 `aria-label`。loading 可聚焦并设 `aria-busy`，不设原生 disabled。'
  },
  SplitButton: {
    uses: ['Button', 'Dropdown', 'DropdownMenu', 'DropdownItem'],
    notes:
      '主按钮吃 `htmlType` / `type`（htmlType 胜出），chevron 固定 `type="button"`。不要把 SplitButton 塞进 ButtonGroup。'
  },
  Breadcrumb: {
    notes:
      '`maxItems` 溢出是本地 expand（无 v-model）；省略号 `aria-expanded` 跟随该状态。最后一项默认 current，除非 `current={false}`。`href` 走 `link-utils`，危险协议不输出地址。'
  },
  Anchor: {
    notes: '`href` 走 `link-utils`。`javascript:`、`data:`、`vbscript:` 不输出地址。'
  },
  Menu: {
    notes:
      '项上的 `href` 和 schema 的 `path` / `href` / `iframeSrc` 走 `link-utils`。`path` 只作站内路径。危险协议和禁用项不输出 `href`。'
  },
  PageHeader: {
    notes: '返回地址走 `Link`，因此同样只接受 `link-utils` 的协议。危险地址不输出 `href`。'
  },
  ScrollSpy: {
    notes: '项上的 `href` 走 `link-utils`。危险协议和禁用项不输出地址。'
  },
  NavigationMenu: {
    notes: '链接走 `link-utils`。`target="_blank"` 带上 `noopener` 和 `noreferrer`。危险协议和禁用项不输出 `href`。'
  },
  ContextMenu: {
    notes: '项上的 `href` 走 `link-utils`。危险协议和禁用项不输出地址。'
  },
  Modal: {
    notes:
      '`open` 当帧出 dialog。打开时焦点进对话框或 `initialFocus`，先读标题。确定可返回 Promise 或 `preventDefault`：进行中不可再点，拒绝则不关闭。层本身不滚动，只有正文滚动。拖拽时过渡时长为 0。离开回调等这一层过渡结束；减少动效或没有过渡时立刻发。默认关场会播过渡再 hidden/卸；`destroyOnClose` 等到关场结束。`mask={false}` 点得透。`closable={false}` 只藏 X，Esc 仍关，除非 `keyboard={false}`。无标题仍有 locale dialog 名。关闭名走 `locale.modal`。嵌套 Modal 进外层 overlay-host，Esc 先关里层。'
  },
  Drawer: {
    notes:
      '与 Modal 同一套在场、焦点栈和关场。打开时焦点进对话框或 `initialFocus`。`placement` 含 `start`/`end`，先换成物理边再决定滑动方向；`fullscreenOnMobile` 铺满后，关闭滑动跟铺满后的边。swipe 只在标题栏或对应轴滚到头时成立。面板类名只有 `className`。`bodyPadding={false}` 去掉默认内边距，自定义间距用 `bodyClassName`。离开回调等这一层过渡结束。关闭名走 `locale.drawer`。嵌套 Drawer 进外层 overlay-host，Esc 先关里层。'
  },
  Tour: {
    notes:
      '`current` 是 `steps` 的原始下标。关掉后非受控下标回到第一个未跳过的步骤；受控时发出回到该下标。同一次打开只加载一次 `loadSteps`，失败有可见状态，不先闪 `steps`。只在打开和换步时把目标滚进视口一次。默认洞只是视觉，点击落在遮罩上，目标保持 inert；`interact` 才把该目标排除在 inert 之外。换步时焦点回到气泡。`start` / `end` 按书写方向，left / right 是物理边。`closable={false}` 只藏 X。无标题仍有 locale dialog 名。文案只读 `locale.tour`。'
  },
  ChartCanvas: {
    notes:
      '`responsive` 观察画布自己的宿主，不是 legend 壳。默认 padding 盖住 ChartAxis 标签。有 `title` / `aria-label` 时 svg 是 `role="img"`。render props / 作用域槽给出 `innerRect`。'
  },
  ChartLegend: {
    notes:
      '必填 `items`。`orientation` 只排行/列；图四周的位置是高阶图的 shell。`aria-pressed` 只表示选中。默认名走 `locale.chart.legendAriaLabel`。'
  },
  ChartTooltip: {
    notes:
      '`open` 为 false 时不挂节点。走 overlay-host 链，z 是 overlay 层。跟随指针的例子见 useChartInteraction。'
  },
  ButtonGroup: {
    notes:
      '直子必须是 Button，组和 Button 之间不能插节点。需要 `aria-label` 或 `aria-labelledby`。子 `size` 覆盖组 size。SplitButton 不要塞进组。'
  },
  InputGroup: {
    notes:
      '直子必须是 Input / Textarea / InputNumber / InputGroupAddon / Button 的 chrome 根。无 `aria-label` / `aria-labelledby` 时不加 `role="group"`。compact 接缝打在 `data-tiger-chrome`。'
  },
  InputNumber: {
    notes:
      'React `onChange` 收到 `number | null`。值可以是有限数字或数字字符串，`null` 和 `\'\'` 是空。`controlsPosition="both"` 是两侧按钮；`snapToStep` 默认关闭，步长只约束按钮和方向键。`controlsPosition="right"` 是阅读方向的尾侧。聚焦时显示裸数字，失焦再套 formatter。可访问名来自标签或 `aria-label`。'
  },
  Slider: {
    notes:
      'Vue 只认 `modelValue` / `update:modelValue`。方向读最近的 `dir`，否则读 ConfigProvider。拖动松手才写入表单，键盘立即写入。`marks` 过密时只标两端。'
  },
  TagsInput: {
    notes:
      '只读用 `readOnly`。粘贴在光标处插入后再按分隔符切开。错误只走 FormItem。拒绝重复或超限时给一句实时说明。'
  },
  Signature: {
    notes:
      "受控值是空，或当前笔画导出的 SVG。解析不了的字符串当空，不提交原文。单点在画布、受控值和 `toDataURL()` 里是同一笔。Escape 和 `pointercancel` 丢掉当前笔。一次落笔写一次。只读用 `readOnly`：可聚焦、可提交、不能画。`disabled` 才离开 Tab 序。读 FormItem；id/aria 在画板 widget 上。"
  },
  Form: {
    notes:
      '值对象是 Vue `modelValue`（`v-model`）/ React `value`。父级要把 `update:modelValue` 写回自己的模型。`required` 会参与校验。一次 `validate()` 作废仍在飞的上一次。失败提交聚焦第一个可聚焦的无效控件。Wizard 步下标走 `onStepChange`。Form `size` 是 `sm|md|lg`。'
  },
  FormItem: {
    notes:
      "具名 FormItem 只把值和校验接到第一个控件。`required` 合并成一条规则。错误文本一直在文档里：字段校验是 `role=\"status\"`，提交失败是 `role=\"alert\"`。省略公开 value/`checked`/`fileList` 时从模型取值（boolean/list/tuple 不会把 `''` 当成字符串）。单颗 Radio 写入自己的选项值。"
  },
  Input: {
    notes:
      'React `onChange` 是字符串/数字值，不是 DOM 事件。Vue 是 `update:modelValue`。Vue 非受控可用 `defaultValue`（有 `modelValue` / FormItem 值时忽略）。React 的 `readonly` 与 `readOnly` 是同一标志（冲突用 `readonly`）。'
  },
  Textarea: {
    notes:
      'React `onChange` 是字符串值，不是 DOM 事件。Vue 是 `update:modelValue`。Vue 非受控可用 `defaultValue`。与 Input 同一套 status / showCount / autoResize / readonly。'
  },
  Mentions: {
    notes:
      '插入读文本框当前值和选区。解析和插入共用同一套分隔符。搜索事件带上前缀。组合输入期间不插入。清除文案是 `common.clearText`。只读用 `readOnly`，不能从列表插入。不要把 `prefix` 当成 Input 的前缀槽。'
  },
  RadioGroup: {
    notes:
      '可传 `options[{ label, value, disabled }]`；有 children / 默认插槽时忽略 options。具名 FormItem 里的单颗 Radio 写入该选项的 `value`。'
  },
  CheckboxGroup: {
    notes: '可传 `options[{ label, value, disabled }]`；有 children / 默认插槽时忽略 options。'
  },
  DatePicker: {
    notes:
      '存储和 `name` 是公历日历日（`YYYY-MM-DD`，范围 `start|end`）。展示可以本地化，解析用生成这段文字的同一套历法和数字。点选、键入、快捷方式和确定走同一道禁用边界；结束早于开始会对调。区间第一次点选只预览，确定提交完整区间，未完成留在面板里。空是 `null`。只读用 `readOnly`。Vue 值事件只有 `update:modelValue`，打开只有 `update:open`。'
  },
  NumberKeyboard: {
    notes:
      '配一个显示用 Input。传 `open`/`defaultOpen` 时经 overlay-host 挂底栏；都不传则是常显 PIN 垫。打开后焦点在对话框里，当前键可见。进入的值先按模式收成合法串，收不干净当空。`phone` 默认 11 位，`id-card` 默认 18 位末位 X（无校验码）。Confirm 文案走 `common.okText`。只读用 `readOnly`，只读键不可激活。'
  },
  Select: {
    notes:
      "单选未选是 `null`（`undefined` 表示非受控），多选未选是 `[]`。`''` 是合法选项值。Clear 发出 `null` 或 `[]`。创建项留在列表里，直到 `options` 接过去；完全相同才不算新建。小屏列表仍锚在触发器上。搜索防抖读最新回调。打开的 combobox 才有 `aria-controls`。overlay 列表高是 `listHeight`（默认 256）。列、返回和展开文案不在 Select 语言包。"
  },
  AutoComplete: {
    notes:
      "关层（完成、点外面、受控关闭）提交或还原。原生 `name` 提交已提交的值，展示用提交时的标签。缺键、`null` 和 `''` 是未提交。空查询不命中 `value` 或 `label` 为 `''` 的选项。没有可选项时 Enter 提交查询。组合输入期间把键交给输入法。打开着的空列表 `aria-expanded` 仍是真。只读用 `readOnly`。"
  },
  Cascader: {
    notes:
      "空路径是 `[]`。缺键、`null` 和 `''` 都是 `[]`。对不上的段保留原始键。浏览路径只在打开时初始化。懒加载的鼠标、Enter 和方向键走同一道。列、返回、展开文案在 `locale.cascader`，不在 `select`。只读用 `readOnly`。"
  },
  TreeSelect: {
    notes:
      "选中的是节点 `key`。空单选是 `null`，空多选是 `[]`。`''` 不是键，`0` 是合法键。勾选框表示级联，`checkStrategy` 只决定提交哪些键；`checkStrictly` 时不按策略过滤。搜索零命中是空列表。`defaultExpandAll` 只在树第一次有数据时生效。浮层高度只留 `listHeight`。文案在 `locale.treeSelect`。只读用 `readOnly`。"
  },
  TimePicker: {
    notes:
      '值是 24h `HH:mm`；`showSeconds` 为真才留秒。此刻、键入和确定共用 `minTime` / `maxTime` / `disabledTime`。结束早于开始会对调。半截区间留在元组里，空单值是 `null`。桌面列和手机 select 同时在文档里，用 CSS 切换。`name` 提交同一套字符串。只读用 `readOnly`。`locale` 只收官方对象。'
  },
  ColorPicker: {
    notes:
      '文本在失焦或 Enter 时才按最终格式提交。解析失败留在草稿里并标成错误，不上屏，隐藏域提交空。饱和度、色相和透明度在拖动中只更新预览，松手再写入。触发按钮带 `aria-expanded`。只读用 `readOnly`。'
  },
  ColorSwatch: {
    notes:
      '选中比较走和取色器同一套解析。`#fff` 与 `#ffffff`、hex 与 `rgb()` 可以是同一支。解析不了的字符串不涂成颜色。只读用 `readOnly`。'
  },
  CronEditor: {
    notes:
      '提交给表单的值是空，或一份通过 5 段规则的表达式。非法文本留在草稿里，错误走 FormItem，输入过程用 `polite`。空值的字段显示空，不画成五个 `*`。只读用 `readOnly`：可以聚焦和提交，不能改值。'
  },
  Upload: {
    notes:
      '界面、进度、`submit` 和表单写入用同一份列表。`name` 是表单字段，`fileFieldName` 是请求里的文件字段。成功时写回可用地址；没有地址不把 uid 当结果。`multiple` 为假时拖拽也只留第一个。失败行用同一把在途锁重试。只读用 `readOnly`。'
  },
  Transfer: {
    notes:
      '目标只留 `value`，初始值只留 `defaultValue`。数据源按字符串键收成一条，`1` 和 `\'1\'` 是同一行。搜索、全选和移动只处理当前可见项。搜索框的 Enter 不提交外层表单。滤掉的已选项单独成条，可以一次清掉。只读用 `readOnly`。Vue 值事件只有 `update:modelValue`。'
  },
  Icon: {
    notes:
      '内置图标集通过 `name` 属性指定；自定义 SVG 子元素仍享有更高优先级；图标注册表由 `@expcat/tigercat-core` 及其子路径 `@expcat/tigercat-core/icons/registry` 导出。未传 `color` 时继承 CSS `color`（含 `style.color`）；显式 `color` 胜出。`mode: "fill"` 为 `fill="currentColor"` + `stroke="none"`。'
  },
  Link: {
    notes:
      '地址只接受 `link-utils` 的协议（`http:`、`https:`、`mailto:`、`tel:` 和无协议的站内路径）。`javascript:`、`data:`、`vbscript:` 和禁用都不输出 `href`。`target="_blank"` 始终把 `noopener noreferrer` 并入 `rel`。`underline` 默认在静止态显示，不是 hover 才出现。'
  },
  Text: {
    notes:
      '`tag` 只允许 TextTag 白名单（p/span/div/h1–h6/label/strong/em/small），非法回退 `p`。`align` 只用 `start` / `center` / `end` / `justify`。`label` 需自备 `htmlFor`。'
  },
  Code: {
    notes: '`code` 必填。`copyable` 默认 true。复制文案走 ConfigProvider locale / `labels`。'
  },
  Kbd: {
    notes:
      '由 `keys` 生成的组合键把 `aria-label` 设成 `Ctrl + K` 这种可读名。`variant` 的 default 是 Kbd 自己的底/边/字色，不是可点 Tag。'
  },
  Highlight: {
    notes:
      '`keywords` 只收字符串，按字面量线性扫描，不执行正则。`global={false}` 是每个 keyword 的首次匹配，不是整段只亮一次。children/slot 里的元素节点会保留，匹配的文本包在 `mark` 里。'
  },
  Marquee: {
    notes:
      '`repeat=1` 或 `< 2`（含 0）静态一份。纵向不设高时视口吃第一份内容。clone 再挂一份子树，inert 且不可聚焦。无 ariaLabel / aria-label / aria-labelledby 时不是 landmark。pauseOnHover 只管指针；焦点暂停是 pauseOnFocus（默认开）。受控 paused 停动画。短内容不够铺满时加大 repeat。方向只用 `start` / `end` / `up` / `down`。'
  },
  Carousel: {
    notes:
      '子节点才是 slides。`infinite` 在 scroll 下走首尾 clone，不会整段倒带。无名不是 landmark。非当前页 `inert`。开 autoplay 时有可聚焦暂停；`autoplaySpeed<=0` 和 reduced-motion 都不自动播。'
  },
  Collapse: {
    notes:
      '`onChange` / `v-model:activeKey` 永远是数组，空是 `[]`。accordion 多键只留最后一项。`1` 与 `"1"` 同一面板。header 是真 button；extra 是兄弟，不进可访问名。'
  },
  CollapsePanel: {
    notes: '必须写 `panelKey`，且必须包在 Collapse 里。disabled 留在 Tab 序并 `aria-disabled`。'
  },
  Timeline: {
    notes:
      '需要 `items`。`pending` 在（反转后的）列表末尾再插一项。pending 文案走 `locale.timeline.pendingText`。审批配方 playground 在 `workflow-timeline` / `workflow-viewer` / `workflow-detail-shell`；本页 01–03 才是时间线骨架。'
  },
  WorkflowTimeline: {
    uses: ['Timeline', 'Button', 'Tag', 'WorkflowActionBar'],
    notes:
      '把 `WorkflowTimelineStep[]` 经 `workflowStepsToTimelineItems` 映射到现有 Timeline，不另起一套时间线。会签人用 `actors` 列在项内，不要把人做成 children。`actions` / `buttonPolicy` 是展示用操作条（同意/拒绝/转交/加签/退回/撤回/评论/退回修改），无 BPM 引擎。默认在当前步骤为 `active` 且有动作时显示操作条。退回 picker 与加签选人槽可转发到 ActionBar。'
  },
  WorkflowActionBar: {
    uses: ['Button', 'Popconfirm', 'Textarea', 'Dropdown', 'Radio'],
    notes:
      '完整审批按钮条。默认视觉序同意→拒绝→转交→退回→加签→撤回→评论。`placement: more` 进溢出菜单（Esc / 方向键 / 焦点返回）。`commentRequired` 空意见会拦住 `onAction`（相对 2.4.2 有意升级）。`return` 需 `returnTargets` 或 `renderReturnPicker` / `#returnPicker`，否则禁用；`addsign`/`transfer` 需 `renderAssigneePicker` / `#assigneePicker`。加签确认层可选 before/after。无组织树、无 BPM 引擎。`items={[]}` / 空数组回落到 `buttonPolicy`；要覆盖策略请传非空 `items`。'
  },
  WorkflowViewer: {
    uses: ['Tag'],
    notes:
      '只读审批拓扑，复用 `WorkflowTimelineStep`。顺序节点同一列；两个及以上 `children` 横向分岔再汇合。`loopTo` 指向另一节点 key 时在右侧画退回环，未知 key 与自环忽略。会签人用 `actors` 或 `tasks` 列在卡内，不要做成横向子卡。当前节点色点/「进行中」+ 路径图例；加签临时节点、退回目标、未走支可视化。无第二套时间线，无 BPM 引擎。'
  },
  WorkflowDesigner: {
    notes:
      '简单 JSON 树流程编辑器，复用 `WorkflowTimelineStep`，不是 BPMN / Flowable / Camunda。摘要卡沿中轴排列，最多约 16rem 宽；两个及以上子节点横向分岔再汇合。摘要按钮可聚焦，Enter 打开检查器。上移/下移/复制/添加子步骤/删除只在选中节点的 Inspector，不重复铺在每张卡上。Inspector 标签用方向键移动。`onChange` 带上 `issues`。有阻塞项时发布按钮不可用，横幅是同一句话。节点间 `+` 打开调色板插入。`schema` 驱动字段权限矩阵，缺省权限与运行时是同一个更严默认。`path` 可选，只编辑该节点的 children 并回写整树。可从 `@expcat/tigercat-core/workflow-designer` tree-shake helpers。空画布文案是 locale `emptyHint`，没有 `emptyText` prop。中轴与分岔几何由 Tailwind plugin 注入。'
  },
  AppShell: {
    uses: ['Layout', 'Sidebar', 'Header', 'Content', 'Breadcrumb', 'Tabs', 'PageHeader'],
    notes:
      '一页应用壳。侧栏、菜单、面包屑、页签和页头仍是原来的组件。主内容是 Layout 的那一个 `main`，跳转链接也是布局层那一条。`tabs` 只记住调用方给出的标题，不读路由表。折叠用 Sidebar 自己的 `collapsible`。`headerSticky` 只传给 Header，不和表面绑在一起。'
  },
  WorkflowDetailShell: {
    uses: ['SchemaForm', 'Tabs', 'WorkflowTimeline', 'WorkflowViewer', 'WorkflowActionBar'],
    notes:
      '可选详情布局配方，不是第二套 Timeline / 表单设计器。槽：header / form / tabs（Timeline|Viewer）/ action（sticky ActionBar）。没有 header 时标题走 locale `workflowDetailShell.title`。可访问名走 `workflowDetailShell.ariaLabel`。`submit()` 与 `submitAction()` 都走 `mergeWorkflowFormValues`。`submitAction(action)` 再把意见交给 `reduceWorkflowAction`，同一次调用。隐藏和只读保留 `originalValues`。'
  },
  Countdown: {
    notes:
      '`now` 只用于首屏/SSR；不传时服务端是 `00:00:00`，mount 后再算。`HH` 无 `D` 时是总小时。`ariaLabel` 打在根上，timer 名仍是时间。'
  },
  Progress: {
    notes:
      '默认名是 locale「进度」，不含当前值。自定义 `text`/`format` 进 `aria-valuetext`。`status="paused"` 会停条纹动画。条纹和过渡在样式表里，减少动效时停。'
  },
  Splitter: {
    notes:
      '子节点才是 pane。传入 `sizes` 按值受控（新数组同一组值不会清拖拽）；百分比跟容器走。拖动 gutter 经 `update:sizes` / `onSizesChange` 回写，并保持各 pane 的单位（百分比仍是百分比，像素仍是像素），比例继续跟容器走。`resize` 事件里的 sizes 是像素。水平几何读 `dir`。gutter 是带名字的 `separator`。'
  },
  Resizable: {
    notes:
      '`left`/`top` 手柄移动被抓的那条边。`lockAspectRatio` 按手柄选主轴。角手柄不进 Tab。`width`/`height` 传入即受控。'
  },
  Image: {
    notes:
      '默认 `preview=true` 时宿主是可聚焦 `<button>`，读屏名走 `locale.image.previewAriaLabel`。`previewTrigger="hover"` 仍可用 focus / 点击打开；组内由 ImageGroup 统一全屏预览。`onLoad` / `srcSet` 落在内层 `<img>`。'
  },
  ImageGroup: {
    notes:
      '只收集子 Image 的 URL 与 alt。组 `preview={false}` 时子图不再是按钮。重复 src 按实例登记。'
  },
  ImagePreview: {
    notes:
      '`images` 必填（`string | { src, alt? }`）。未传 `open` 视为关（Alert 相反：省略 `open` 是展示）。缩放用 `minScale`/`maxScale`。到头 disable；空列表关闭。'
  },
  Alert: {
    notes:
      '省略 `open` 时展示，关闭按钮和到时由组件自己收起，焦点从关闭按钮移到后面下一个可聚焦元素。传入 `open` 时只发事件。父级重渲染不重置剩余时间。`error` 保持 `role="alert"`。首屏之后新插入的 success / info / warning 用组件自己的 `role="status"`；静态条文不加实时区域。与 ImagePreview「省略即关」相反。'
  },
  Tooltip: {
    notes:
      '悬停只跟指针。点击、Enter、Space 不会把悬停层关掉。焦点还在触发器上时，指针离开也保持打开。`disabled` 立刻关闭。内容只接受纯文本，可聚焦后代在开发期报错；要交互用 Popover。显示延迟默认 100ms。'
  },
  Popover: {
    notes:
      '打开时焦点留在触发器，Tab 离开即关闭。有标题时标题是名字，正文是描述。`width` 是有限正数像素，或一整条 CSS 长度；解析失败保持默认最大宽度。'
  },
  Popconfirm: {
    notes:
      '打开时焦点留在触发器，Tab 离开即关闭。确认返回的 Promise 在进行中时，Escape、点外面和再点触发器都关不掉；拒绝则留下。Vue 读返回值，不只看 `preventDefault`。'
  },
  Loading: {
    notes:
      '每次 `spinning` 变为真都重新等 `delay`，中途转回假就取消。`fullscreen` 盖住视口，和有没有子节点分开，层高于模态，并占住焦点栈。区域遮罩把 `aria-busy` 放在被挡住的区域上，结束时若焦点没被移走就还回去。'
  },
  LoadingBar: {
    notes:
      '`error` 和 `finish` 共用 `start` 计数。还有未结束的 `start` 时保持加载，全部结束再进入成功或失败然后隐藏。开始、失败、结束各说一次，百分比留在 `progressbar` 上。'
  },
  Message: {
    notes:
      '命令式调用只改当前 ConfigProvider 里的队列。默认可关闭。指针或焦点在条目上时暂停计时。`loading` 不自动关。负时长和 `NaN` 不自动关。同一个 `key` 替换那一条。'
  },
  Masonry: {
    notes:
      '默认 `layout="source"` 用 CSS 多列保持源顺序。`layout="shortest"` 按最短列定位，容器说明视觉顺序与源顺序不同。'
  },
  PrintLayout: {
    notes:
      '`ref.print()` 把 `window.print()` 限制在这一份布局再恢复；直接 `window.print()` 会打整页。`PrintPageBreak` 声明 `className` / `locale`，不是纯透传。'
  },
  CropUpload: {
    notes:
      'FormItem 写入的是裁切后的 `File`，不是媒体 id。需要上传后的 id 时由宿主替换（Users 页模式）。'
  },
  Pagination: {
    notes:
      '`size` 是 `sm|md|lg`（与 Form/Button 相同）。Table 内置分页默认开并跟随 Table `size`；List 默认关。'
  },
  Tree: {
    notes:
      '`checkStrictly` 默认 false（父子级联）。勾选只在 `treeitem` 上用 `aria-checked`，勾选标记不另做一颗复选框。`posinset` / `setsize` 按同一父节点下的兄弟。搜索零命中是空列表。每棵树有自己的拖拽容器。`height` 是页面窗口，不是 overlay `listHeight`。'
  },
  PieChart: {
    notes: '`innerRadiusRatio` 做环形（0.6 为甜甜圈）。`centerValue`/`centerLabel` 写在洞里。'
  },
  OrgChart: {
    notes:
      '`avatar` 在写成 SVG image 之前走 `link-utils` 同一协议门。`javascript:`、`data:`、`vbscript:` 不渲染 image。'
  },
  ImageCompare: {
    notes:
      '受控 `position` / `v-model:position`。滑块名走 `locale.imageCompare`。不传宽高且 after 无内容时高度为 0。'
  },
  ImageCropper: {
    notes:
      '`src` 必填。产出 `getCropResult()`。坏图错误态。比例、旋转和翻转在裁剪区上方的工具条里，比例是一组可切换按钮。未选手动比例时 `aspectRatio` 重算选区。'
  },
  Avatar: {
    notes:
      '`text` 既是破图回退也是缺 `alt` 时的名字。未传 `bgColor` 且有 `text` 时 `generateAvatarColor` 同名同色。`#`/`rgb()`/`var()` 走 style。组未传的 size/shape 跟组。'
  },
  AvatarGroup: {
    notes:
      '`max` 是可见 Avatar 数，overflow 额外；`max={0}` 只出 +N。只计 Avatar 子节点。未传 `aria-label` 时组名来自 locale，可覆盖。'
  },
  Badge: {
    notes:
      '无 content 的 number/text 不渲染。`type="text"` 不被 `max` 封顶。叠放必须 `standalone={false}`，计数写进宿主名字。默认不是 live region。`right`/`left` 跟阅读方向。'
  },
  Empty: {
    notes:
      '`preset` 只换默认文案和内置插图（`simple` 无图，`error` / `no-results` 各自有标）。自定义 `image` / 插槽不被 `showImage={false}` 丢掉。无 ConfigProvider 时默认英文。默认插图是装饰，`aria-hidden`。'
  },
  Result: {
    notes:
      '默认不是 live region。有 `title` 时用 heading（默认 h2）。HTTP 状态画数字，不自动补 “Not Found”。无 title 时只有装饰图标或 HTTP 数字。需要播报时自己写 `role` / `aria-live`。'
  },
  QRCode: {
    notes:
      '`value` 必填，编码为可扫描 QR（byte mode，ECC M）。过期 Refresh 仅在绑定 `onRefresh` / `@refresh` 时是 button。默认色走 `--tiger-text` / `--tiger-surface`。'
  },
  Statistic: {
    notes:
      '`title` 是指标名，不是 HTML tooltip。分组走 `Intl.NumberFormat` + ConfigProvider locale。`animated` 在 mount 之后播；`prefers-reduced-motion` 直接终值。SSR 始终终值。'
  },
  Rate: {
    notes:
      '`readOnly` 与 `readonly` 是同一标志（冲突用 `readonly`）。可聚焦、不改值；`disabled` 才出 Tab。半星与方向键跟阅读方向。`valueText` 只替换 `{value}`。需要组名时传 `aria-label`。`size` 是 `sm|md|lg`（`RateSize` = `ComponentSize`）。'
  },
  Segmented: {
    notes:
      '选项是 `button role="radio"`。必须给组 `aria-label` / `aria-labelledby`。空 `options` 不是完整控件。`icon` 渲染为装饰 SVG。指示条走逻辑边。'
  },
  Watermark: {
    notes:
      '`gapX`/`gapY` 是透明间距。默认墨水是 `--tiger-text` 的 15% 混合；画布绘制前解析成真实颜色，解析失败时用 `rgba(0,0,0,0.15)`，不会铺成不透明黑。图片水印按同样的 15% alpha 绘制。主题色变化会重绘。`image` 失败回退 `content`。打印带 print-color-adjust。直子 overlay 被卸或覆盖样式被剥才重挂，自身绘制不重挂。'
  },
  Layout: {
    notes:
      '默认列方向、没有 `min-h-screen`。直子有 Sidebar（或 `hasSider` / `direction="horizontal"`）时改横排。嵌套内层 `flex-1 min-h-0`，`fullHeight` 只作用在最外层。最外层有一条跳到 `#tiger-main` 的链接，目标是那一个 `main`。'
  },
  Header: {
    notes:
      '未传 `height` 时默认 `h-16`，不写 inline height。`sticky` 是独立开关，`translucent` / `blur` 只改表面。`fullHeight` 壳里忽略 `sticky`。'
  },
  Sidebar: {
    notes:
      '`collapsedWidth="0px"` 时 `inert` + `aria-hidden`，里面的控件离开 Tab。边框是 `border-inline-end`。未传 `width` 时默认宽走 class。未传名时 landmark 走 locale。内层未传 `collapsed` 的 Menu 跟随侧栏。'
  },
  Content: {
    notes:
      '默认 `<main>`，一页只留一个。嵌套/预览用 `as="div"`。作为 Layout 直子时自己滚动（`flex-1 min-h-0 overflow-auto`）。React `ref` 是滚动根。'
  },
  Footer: {
    notes: '未传 `height` 不写 inline height。预览/嵌套用 `as="div"`，避免多个 `contentinfo`。'
  },
  Container: {
    notes:
      '`maxWidth={false}` 没有 max-width；`"full"` 是 `max-width: 100%`；命名尺寸读 `--tiger-breakpoint-*`。Vue 声明 `className`，不会盖掉基类。'
  },
  Row: {
    notes:
      '数字 `gutter` 只开横缝，双轴传 `[h, v]`。缝是 CSS gap，不是负 margin。`wrap={false}` 不折行。'
  },
  Col: {
    notes:
      '传入 `flex` 即走 flex 项，不必 `span={0}`。`span={0}` 是该断点隐藏。`order` 只改视觉，不改 Tab / 读屏顺序。offset 走逻辑边。'
  },
  Tag: {
    notes:
      '默认不是 live region。`closable` 只发 close；组件不自己藏，父级卸载或 `visible={false}`。关闭名走 locale。`pill` 全圆角。'
  },
  Space: {
    notes: '`wrap` 只在窄容器里折行。Vue 声明 `className`，不会盖掉基类。'
  },
  Divider: {
    notes:
      '竖线 `self-stretch`，不要外挂高度。`color`/`thickness` 对 gradient 也生效。子节点是居中标签。'
  },
  AspectRatio: {
    notes: '根默认裁切；直系 `img`/`video`/`iframe` 铺满。不必再写 `overflow-hidden`。'
  },
  Skeleton: {
    notes:
      '`wave` 是扫光，不是 pulse。未传宽高用 class 默认值。装饰默认 `aria-hidden`；有名字时是 `status`。加载态也可由父级 `aria-busy` 负责。'
  },
  Card: {
    notes:
      '`hoverable` 只抬起。`onClick`/`href` 才是控件；有 actions 时根不再当按钮。有封面时 padding 在内容列。`coverAlt` 默认空（装饰）。原生 `title=` 是 HTML tooltip，不是视觉标题；视觉标题走 `#header` / `header`。'
  },
  ChatWindow: {
    uses: ['Avatar', 'Textarea/Input', 'Button', 'VirtualList', 'Empty'],
    notes:
      '`messages` 全受控，`onSend` 不 push。不绑发送时发送钮禁用。贴底才跟最新；`virtual` 时 VirtualList 是唯一 scroller，行高动态量。时间 `0` 合法。Vue `v-model` 只走 `update:modelValue`。'
  },
  ActivityFeed: {
    uses: ['Timeline', 'Avatar', 'Tag', 'Card', 'Text', 'Link', 'Loading'],
    notes:
      '`groups` 一旦传入（含 `[]`）不再回落 `items`。根是 `region`，时间线仍是 `list`，空态和加载态不自称 feed。已有条目时加载保留列表并写出加载说明。新的一条用组件自己的礼貌区域。`content` 只在标题和描述都空时当正文。默认显示时间时，首屏等客户端时区稳定后再写钟点。Vue 状态点走 `#dot`，React 走 `renderDot`。无 `href` 的动作是 Button。与命令式 toast 无关。'
  },
  CommentThread: {
    uses: ['Avatar', 'Tag', 'Button', 'Textarea', 'Text'],
    notes:
      '`nodes` 一旦传入（含 `[]`）不再回落 `items`。输入框和空态在 feed 外面，文章是 feed 的直接子级，回复文章不嵌在父文章里。序号按整棵可见树，收起不改已经公告的位置。环和重复 id 给出可见错误，能挂上的节点留下。达到 `maxDepth` 不再提供回复。发送闩等到 `onReply` 的 Promise。`onReply` 不写树；点赞 overlay 在 `nodes` 换引用后丢弃。Load more 本地剩余按 `maxReplies` 揭一层。展开：Vue `v-model:expanded-keys`，React `onExpandedChange`。'
  },
  NotificationCenter: {
    uses: ['Card', 'Tabs/TabPane', 'List', 'Text', 'Button', 'Loading'],
    notes:
      '只有 `groups` 或 `groupBy` 才开 Tabs；光 `items` 走 List。`groups=[]` 不回落。筛选是有名字的单选，方向键移动，当前项才在 Tab 序里。打开一条是按钮。加载时列表 `inert`。未读变化和新的一条用组件自己的礼貌区域。全部已读只交出这一次未读的条目。这是收件箱面板，不是命令式 `notification` toast。内层 Tabs `swipeable={false}`。'
  },
  List: {
    notes:
      "分页默认关（与 Table 默认开、`pageSize` 10 相反）。传入 `pagination` 才渲染 Pagination：页数大于 3 时自动展示可点击页码与跳页输入框，3 页及以内为上一页/下一页加页码指示的简洁模式，可用 `pagination.simple` / `pagination.showQuickJumper` 显式覆盖。服务端分页用 `pagination.remote: true`（与 Table `pagination.remote`、工具栏 `toolbar.searchMode: 'remote'` 是三套独立开关）：此时 `dataSource` 即当前页数据，组件跳过内部切片原样渲染，总页数与总数文案由 `pagination.total` 计算，`current`/`pageSize` 变为受控属性，业务侧监听 `page-change`（React `onPageChange`）后按新页码重新请求。虚拟窗高是 `virtualHeight`，不是 TreeSelect overlay `height` / Select `listHeight`。"
  },
  TableToolbar: {
    uses: ['Input', 'Select', 'Button', 'Popover', 'Checkbox'],
    notes:
      '这是 `DataTableWithToolbar` 的 toolbar 配置接口，框架实现中不作为独立组件导出。`filters` 默认渲染 Select；需要 Input、DatePicker、年龄段等复合控件时用 `filters[].render(context)`，或在尾部注入 Vue `#filters-extra` / React `toolbar.filtersExtra`。`showColumnSettings` 开启列设置面板（Popover + Checkbox），可用 `columnSettings.lockedColumnKeys` 或列级 `hideable: false` 锁定不可隐藏的列——这是「可见性锁定」，与 Table 的 `columnLockable` / `column.fixed`（横向滚动钉列的「位置锁定」）是两个不同概念。'
  },
  DataTableWithToolbar: {
    uses: ['Table', 'Input', 'Select', 'Button', 'Popover', 'Checkbox'],
    notes:
      "搜索/筛选默认 `toolbar.searchMode: 'local'` 写进当前 `dataSource`（筛选项 `key` 对列 key）；`remote` 才只发 `toolbar.onSearch*` / `onFiltersChange`（Vue 还有 `@search-change` / `@search` / `@filters-change`）。`onFiltersChange` 带这一次要写的值。本地搜索和标量筛选把页码收到第 1 页，沿用表的分页回写。Vue 里让搜索框出现的那次监听也能点亮搜索按钮。批量订内层勾选。`pagination` 与 Table 同一默认（开、pageSize 10），`onPageChange` 是 `{ current, pageSize }`；改 pageSize 只发 `onPageSizeChange`。`id` / `style` / `data-*` / `aria-*` 在外壳，`tableClassName` 才是内层表。`query` 是可折叠查询，提交和重置是按钮，收起后留下摘要。对象条件只交给父级。`toolbar.filters` 不是 Table 列 `filters`。"
  },
  Table: {
    uses: ['TableColumn', 'Pagination', 'row selection', 'expandable rows'],
    notes:
      '`column.fixed` 钉列；`columnLockable` 是表头锁定钮（与 `hideable` 可见性不同）。有固定列时 `<colgroup>` 钉宽。卡片模式要显式 `responsiveMode="card"`。`hiddenColumnKeys` 受控。默认开分页（`pageSize` 10）；List 分页默认关。`pagination.remote: true` 不做本地筛排切（与工具栏 `toolbar.searchMode: \'remote\'` 不是同一个 remote）。内置导出只出 CSV。'
  },
  VirtualTable: {
    uses: ['TableColumn', 'virtual scroll range', 'fixed column offsets'],
    notes:
      '行窗口与 VirtualList/Table 同一份 `calculateVirtualRange`。复用 `TableColumn` 的 `key`/`title`/`width`/`dataKey`/`fixed`/`render`/`align`（不读 sortable/filter）。列虚拟化要数字 `width` 且无固定列，否则 `devWarn` 后全量渲。选择是点行，没有 checkbox 列；`rowKey` 默认 `id`。'
  },
  FormWizard: {
    uses: ['Steps/StepsItem', 'Button', 'Form', 'ConfigProvider'],
    notes:
      '包在 Form 里时，当前步 `fields` 会交给 `validateFields`，没写 `fields` 就校验当前步挂上的项。Finish 再 `validate` + `submit`。`submit()` 返回 false 时不发 `finish`，也不跑 `autoSave`。父级直接改 `current` 时，`step-change` 的第三参 `{ skippedValidation: true }`。`beforeNext` 返回字符串会显示在内容区 `role="alert"`。`isLast` 是后面没有未跳过步，不是数组尾巴。`clickable` 只能回已走过的步。Vue 用 `v-model:current`。`onChange` 是步下标。`size` 是 Steps 的 `small|default`，不是 Form 的 `sm|md|lg`。'
  },
  SchemaForm: {
    uses: ['Form', 'FormItem', 'Input', 'Select', 'Button'],
    notes:
      '用 JSON schema 渲 Form / FormItem，不是表单设计器。字段 `name` 支持点路径；`groups` 可嵌套。FormItem 收到的规则是补过 `required` 的那一份。`disabled` 不跑必填。未知 `type` 留空，等 `renderField`。模型按路径合并，后写只盖同路径；`source` / `defaultValue` / `schema` 变化时，没编辑过的非受控字段跟新种子走。`mapIn` / `mapOut` / `valuePath` 做值映射；submit 的 `mapped` 是映射后的对象。转发 Form 的 `controller` / `undoable` / `maxHistorySize` / `fieldDependencies` / `onValidate`。radio 走 RadioGroup `options`。工作流节点字段权限用 `applyWorkflowFieldPermissions` 派生 schema（initiate / approve / readonly）；隐藏字段不进校验。权限函数不从 `@expcat/tigercat-core/schema-form` 导出。Vue `v-model` / `modelValue`，React `value` + `onChange`。可选 `source` 跑 `mapIn`。'
  },
  TaskBoard: {
    uses: ['ConfigProvider', 'task-board drag utilities'],
    notes:
      '放下下标和指示线是同一个插入点，末尾是源数组长度。每列一个键盘停靠点，方向键在卡片之间移动。抓取时播报源列、目标列和位置，句子走 locale。卡片里的按钮自己处理 Enter / Space。列 id 记在元素上。过滤 / hiddenColumns 只改显示。WIP 和计数用源卡数。列拖按 id 映回源下标。无 onCardAdd 时 allowAddCard 插入 locale 标题。Vue `@card-add` 与 `:on-card-add` 都会进回调。`swimlanes` 是列内按 `swimlaneField` 分组。'
  }
}

const COMPONENT_PROPS_EXTRA = {
  Icon: `
Priority: SVG children > \`icon\` > \`name\`. Built-in \`name\` values live in \`iconNames\`; registry helpers are \`@expcat/tigercat-core/icons/registry\`. Extended icons are tree-shakeable \`*Icon\` constants, not global names.
`,
  TableToolbar: `
\`filters[].render({ filter, value, filters, setValue, setFilter })\` owns custom controls. \`itemClass\` replaces default width classes. Vue \`#toolbar\` / React \`toolbar.render\` replace the whole bar — add \`role="toolbar"\` yourself.
`,
  DataTableWithToolbar: `
\`renderCard\` / \`cardClassName\` forward to Table. Vue \`#card\` wins over \`renderCard\`.
`,
  NotificationContainer: `
Imperative \`notification\` renders inside the current ConfigProvider. Primary \`onClick\` is one button (\`actionLabel\`, default locale view text), not a click on the card. \`actions\` are separate buttons and do not fire that primary handler. Use \`closeOnClick\` or the callback \`close()\` to dismiss. The same \`key\` replaces the toast. Pointer or focus pauses the timer.
`,
  Menu: `
\`collapsed\` only applies to vertical/inline (horizontal \`devWarn\`s). Labels stay \`sr-only\`; text-only items show a first-letter glyph. \`popupPortal\` defaults true. Backend trees: \`MenuSchemaNode\` + \`filterMenuByPermission\` / \`menuSchemaToMenuItems\` / \`schemaToRouteRecords\` (schema-only fields stay off \`MenuItem\`; no \`addRoute\`).
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
    },
    onFiltersChange: setFilters
  }}
/>
\`\`\`

\`filters[].render\` receives \`{ filter, value, filters, setValue, setFilter }\`; call \`setValue({ min, max })\` to emit an object value for the current filter key.
`
}

const COMPONENT_SNIPPETS = {
  Vue: {
    Button: '<Button html-type="submit">Save</Button>',
    ButtonGroup:
      '<ButtonGroup aria-label="Pages" size="sm"><Button>Prev</Button><Button>Next</Button></ButtonGroup>',
    Icon: '<Icon name="search" />',
    Link: '<Link href="/docs" target="_blank" rel="nofollow">Docs</Link>',
    Text: '<Text tag="h1" align="start">Title</Text>',
    Code: '<Code code="const n = 1" />',
    Kbd: "<Kbd :keys=\"['Ctrl', 'K']\" />",
    Highlight: '<Highlight keywords="Vue">Learn Vue</Highlight>',
    Marquee: '<Marquee aria-label="News"><span>Item</span></Marquee>',
    ImageCompare:
      '<ImageCompare :before-src="beforeSrc" :after-src="afterSrc" :width="480" :height="280" />',
    ImageCropper: '<ImageCropper :src="src" />',
    Avatar: '<Avatar text="Jane" />',
    AvatarGroup:
      '<AvatarGroup :max="3"><Avatar text="A" /><Avatar text="B" /><Avatar text="C" /></AvatarGroup>',
    Badge: '<Badge :content="5" />',
    Tag: '<Tag closable>标签</Tag>',
    ChatWindow: '<ChatWindow :messages="messages" @send="onSend" />',
    ActivityFeed: '<ActivityFeed :items="items" />',
    CommentThread: '<CommentThread :nodes="nodes" @reply="onReply" />',
    NotificationCenter: '<NotificationCenter :items="items" />',
    DataExport: '<DataExport :columns="columns" :data-source="rows" file-name="users" />',
    TableToolbar:
      '<DataTableWithToolbar :columns="columns" :data-source="rows" :toolbar="toolbar" />',
    DataTableWithToolbar:
      '<DataTableWithToolbar :columns="cardColumns" :data-source="rows" responsive-mode="card" card-breakpoint="lg" :card-layout="cardLayout" :toolbar="toolbar" />',
    Table: '<Table :columns="columns" :data-source="rows" row-key="id" :pagination="false" />',
    FormWizard: '<FormWizard :steps="steps" :before-next="beforeNext" @finish="onFinish" />',
    SchemaForm: '<SchemaForm :schema="schema" :model="model" @submit="onSubmit" />',
    WorkflowDetailShell:
      '<WorkflowDetailShell><template #form /><template #tabs /><template #action /></WorkflowDetailShell>',
    TaskBoard: '<TaskBoard :columns="columns" />',
    VirtualTable:
      '<VirtualTable :data-source="rows" :columns="fixedColumns" :virtual-item-height="40" :virtual-height="320" />',
    AreaChart: '<AreaChart :data="data" />',
    BarChart: '<BarChart :data="data" />',
    ChartAxis: '<ChartAxis :scale="xScale" orientation="bottom" label="Month" />',
    ChartCanvas: '<ChartCanvas title="Sales" :width="320" :height="200"><slot /></ChartCanvas>',
    ChartGrid: '<ChartGrid :x-scale="xScale" :y-scale="yScale" show="both" line-style="dashed" />',
    ChartLegend: '<ChartLegend :items="items" />',
    ChartSeries: '<ChartSeries :data="data" type="bar"><slot /></ChartSeries>',
    FunnelChart: '<FunnelChart :data="data" />',
    Gantt: '<Gantt :data="tasks" />',
    GaugeChart: '<GaugeChart :value="72" />',
    HeatmapChart: '<HeatmapChart :data="data" :x-labels="xLabels" :y-labels="yLabels" />',
    LineChart: '<LineChart :data="data" />',
    OrgChart: '<OrgChart :data="nodes" />',
    PieChart: '<PieChart :data="data" />',
    RadarChart: '<RadarChart :data="data" />',
    ScatterChart: '<ScatterChart :data="data" />',
    SunburstChart: '<SunburstChart :data="data" />',
    TreeMapChart: '<TreeMapChart :data="data" />',
    Layout:
      '<Layout><Header>Title</Header><Layout><Sidebar /><Content as="div">Body</Content></Layout></Layout>',
    Header: '<Header>Title</Header>',
    Sidebar: '<Sidebar :collapsed="collapsed">Nav</Sidebar>',
    Content: '<Content as="div">Body</Content>',
    Footer: '<Footer>©</Footer>',
    Container: '<Container max-width="lg">Body</Container>',
    Row: '<Row :gutter="16"><Col :span="12">A</Col><Col :span="12">B</Col></Row>',
    Col: '<Col :span="12">A</Col>'
  },
  React: {
    Button: '<Button htmlType="submit">Save</Button>',
    ButtonGroup:
      '<ButtonGroup aria-label="Pages" size="sm"><Button>Prev</Button><Button>Next</Button></ButtonGroup>',
    Icon: '<Icon name="search" />',
    Link: '<Link href="/docs" target="_blank" rel="nofollow">Docs</Link>',
    Text: '<Text tag="h1" align="start">Title</Text>',
    Code: '<Code code="const n = 1" />',
    Kbd: "<Kbd keys={['Ctrl', 'K']} />",
    Highlight: '<Highlight keywords="Vue">Learn Vue</Highlight>',
    Marquee: '<Marquee aria-label="News"><span>Item</span></Marquee>',
    ImageCompare:
      '<ImageCompare beforeSrc={beforeSrc} afterSrc={afterSrc} width={480} height={280} />',
    ImageCropper: '<ImageCropper src={src} />',
    Avatar: '<Avatar text="Jane" />',
    AvatarGroup:
      '<AvatarGroup max={3}><Avatar text="A" /><Avatar text="B" /><Avatar text="C" /></AvatarGroup>',
    Badge: '<Badge content={5} />',
    Tag: '<Tag closable>标签</Tag>',
    ChatWindow: '<ChatWindow messages={messages} onSend={onSend} />',
    ActivityFeed: '<ActivityFeed items={items} />',
    CommentThread: '<CommentThread nodes={nodes} onReply={onReply} />',
    NotificationCenter: '<NotificationCenter items={items} />',
    DataExport: '<DataExport columns={columns} dataSource={rows} fileName="users" />',
    TableToolbar: '<DataTableWithToolbar columns={columns} dataSource={rows} toolbar={toolbar} />',
    DataTableWithToolbar:
      '<DataTableWithToolbar columns={cardColumns} dataSource={rows} responsiveMode="card" cardBreakpoint="lg" cardLayout={cardLayout} toolbar={toolbar} />',
    Table: '<Table columns={columns} dataSource={rows} rowKey="id" pagination={false} />',
    FormWizard: '<FormWizard steps={steps} beforeNext={beforeNext} onFinish={onFinish} />',
    SchemaForm: '<SchemaForm schema={schema} model={model} onSubmit={onSubmit} />',
    WorkflowDetailShell: '<WorkflowDetailShell form={form} tabs={tabs} action={actions} />',
    TaskBoard: '<TaskBoard columns={columns} />',
    VirtualTable:
      '<VirtualTable dataSource={rows} columns={fixedColumns} virtualItemHeight={40} virtualHeight={320} />',
    AreaChart: '<AreaChart data={data} />',
    BarChart: '<BarChart data={data} />',
    ChartAxis: '<ChartAxis scale={xScale} orientation="bottom" label="Month" />',
    ChartCanvas: '<ChartCanvas title="Sales" width={320} height={200}>{plot}</ChartCanvas>',
    ChartGrid: '<ChartGrid xScale={xScale} yScale={yScale} show="both" lineStyle="dashed" />',
    ChartLegend: '<ChartLegend items={items} />',
    ChartSeries: '<ChartSeries data={data} type="bar">{marks}</ChartSeries>',
    FunnelChart: '<FunnelChart data={data} />',
    Gantt: '<Gantt data={tasks} />',
    GaugeChart: '<GaugeChart value={72} />',
    HeatmapChart: '<HeatmapChart data={data} xLabels={xLabels} yLabels={yLabels} />',
    LineChart: '<LineChart data={data} />',
    OrgChart: '<OrgChart data={nodes} />',
    PieChart: '<PieChart data={data} />',
    RadarChart: '<RadarChart data={data} />',
    ScatterChart: '<ScatterChart data={data} />',
    SunburstChart: '<SunburstChart data={data} />',
    TreeMapChart: '<TreeMapChart data={data} />',
    Layout:
      '<Layout><Header>Title</Header><Layout><Sidebar /><Content as="div">Body</Content></Layout></Layout>',
    Header: '<Header>Title</Header>',
    Sidebar: '<Sidebar collapsed={collapsed}>Nav</Sidebar>',
    Content: '<Content as="div">Body</Content>',
    Footer: '<Footer>©</Footer>',
    Container: '<Container maxWidth="lg">Body</Container>',
    Row: '<Row gutter={16}><Col span={12}>A</Col><Col span={12}>B</Col></Row>',
    Col: '<Col span={12}>A</Col>'
  }
}

const MAX_EVENTS_PER_COMPONENT = 6

let prettierConfigPromise
async function formatWithPrettier(content, parser) {
  prettierConfigPromise ??= prettier.resolveConfig(SKILL_REFERENCES_DIR)
  const config = await prettierConfigPromise
  return prettier.format(content, { ...config, parser })
}

function formatMarkdown(content) {
  return formatWithPrettier(content, 'markdown')
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

function collectHeritageIdentifiers(node, names) {
  if (ts.isIdentifier(node)) {
    names.push(node.text)
    return
  }

  if (ts.isExpressionWithTypeArguments(node)) {
    collectHeritageIdentifiers(node.expression, names)
    node.typeArguments?.forEach((argument) => collectHeritageIdentifiers(argument, names))
    return
  }

  if (ts.isTypeReferenceNode(node)) {
    collectHeritageIdentifiers(node.typeName, names)
    node.typeArguments?.forEach((argument) => collectHeritageIdentifiers(argument, names))
    return
  }

  if (ts.isIntersectionTypeNode(node) || ts.isUnionTypeNode(node)) {
    node.types.forEach((part) => collectHeritageIdentifiers(part, names))
    return
  }

  if (ts.isQualifiedName(node)) {
    collectHeritageIdentifiers(node.right, names)
    return
  }

  ts.forEachChild(node, (child) => collectHeritageIdentifiers(child, names))
}

function getHeritageTypeNames(node) {
  const names = []
  for (const clause of node.heritageClauses || []) {
    if (clause.token !== ts.SyntaxKind.ExtendsKeyword) continue
    for (const typeNode of clause.types) collectHeritageIdentifiers(typeNode, names)
  }
  return names
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

function extractFileInfo(fileName, content, sourcePath = fileName) {
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
        members: extractMembers(node, sourceFile),
        heritage: getHeritageTypeNames(node),
        sourcePath
      })
    }

    ts.forEachChild(node, visit)
  }

  visit(sourceFile)
  return {
    fileName,
    sourcePath,
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

function generatePublicHooksSection(publicHooks) {
  if (publicHooks.length === 0) return ''

  const items = publicHooks.map((hook) => `\`${hook.name}\` (${hook.packages.join(', ')})`)
  let markdownText = '## Public hooks\n\n'
  markdownText += `${items.join('; ')}. \`undefined\` is uncontrolled; \`null\` is a legal empty value. See each hook's types for options.\n\n`
  return markdownText
}

function generateLlmApiSummary(categorizedFiles, publicHooks = []) {
  let markdownText = '---\n'
  markdownText += 'name: api-summary\n'
  markdownText += 'description: Type index\n'
  markdownText += '---\n\n'
  markdownText += '<!-- generated by pnpm docs:api -->\n\n'
  markdownText += generatePublicHooksSection(publicHooks)

  for (const { category, files } of categorizedFiles) {
    markdownText += `## ${category}\n\n`
    markdownText += '| Type File | Props Interfaces |\n'
    markdownText += '| --------- | ---------------- |\n'
    for (const fileInfo of files) {
      if (!fileInfo.propsInterfaces.length) continue
      markdownText += `| ${fileInfo.fileName} | ${fileInfo.propsInterfaces.join(', ')} |\n`
    }
    markdownText += '\n'
  }

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
    '- Package subpath：React/Vue 组件按需使用均优先走 PascalCase 显式入口，例如 `@expcat/tigercat-react/Button` 或 `@expcat/tigercat-vue/Button`；根入口 named exports 仅作为小应用便利入口与非组件 API 入口。\n'
  markdownText +=
    '- Command APIs（`Message` / `notification` / `LoadingBar`）：见 [command-apis.md](command-apis.md)；`notification` 不是公开组件。\n\n'
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

function collectInterfaceDetails(fileInfos) {
  const details = new Map()
  for (const fileInfo of fileInfos) {
    for (const detail of fileInfo.interfaceDetails) {
      const list = details.get(detail.name) || []
      list.push(detail)
      details.set(detail.name, list)
    }
  }
  return details
}

function isCoreTypePath(sourcePath) {
  return String(sourcePath).includes('packages/core/src/types/')
}

function isFrameworkComponentPath(sourcePath, component) {
  const path = String(sourcePath).replaceAll('\\', '/')
  return (
    path.endsWith(`/components/${component}.tsx`) || path.endsWith(`/components/${component}.ts`)
  )
}

function pickCoreDetail(interfaceDetails, name) {
  const list = interfaceDetails.get(name) || []
  return list.find((detail) => isCoreTypePath(detail.sourcePath)) || list[0]
}

function pickFrameworkDetail(interfaceDetails, name, component) {
  const list = interfaceDetails.get(name) || []
  return (
    list.find((detail) => isFrameworkComponentPath(detail.sourcePath, component)) ||
    list.find((detail) => !isCoreTypePath(detail.sourcePath))
  )
}

function coreDetailsByName(interfaceDetails) {
  const coreByName = new Map()
  for (const name of interfaceDetails.keys()) {
    const detail = pickCoreDetail(interfaceDetails, name)
    if (detail) coreByName.set(name, detail)
  }
  return coreByName
}

function getComponentDetails(entry, interfaceDetails) {
  return (entry.propsInterfaces || [])
    .map((name) => pickCoreDetail(interfaceDetails, name))
    .filter(Boolean)
}

function mergeMembers(details, kind) {
  const members = []
  const seen = new Set()

  for (const detail of details) {
    for (const member of (detail.members || []).filter((item) => item.kind === kind)) {
      if (seen.has(member.name)) continue
      seen.add(member.name)
      members.push(member)
    }
  }

  return members
}

function getResolvedComponentRows(entry, interfaceDetails, coreByName) {
  const component = entry.component
  const coreName = entry.propsInterfaces?.[0]
  const vueName = `Vue${component}Props`
  const reactName = `${component}Props`
  const frameworkReact = pickFrameworkDetail(interfaceDetails, reactName, component)
  const frameworkVue = pickFrameworkDetail(interfaceDetails, vueName, component)
  const frameworkRuntime = frameworkReact || frameworkVue
  const useFrameworkRuntime = shouldUseFrameworkRuntimeProps(
    coreName,
    coreByName,
    frameworkRuntime?.heritage
  )

  if (useFrameworkRuntime && frameworkRuntime) {
    const runtimeDetails = [frameworkReact, frameworkVue].filter(Boolean)
    const sourcePaths = [
      ...new Set(runtimeDetails.map((detail) => detail.sourcePath).filter(Boolean))
    ]
    return {
      details: runtimeDetails,
      typeSource: sourcePaths.join(' and '),
      propRows: uniqueMembers(runtimeDetails.map((detail) => detail.members || [])).filter(
        (member) => member.kind === 'prop'
      ),
      eventRows: uniqueMembers(runtimeDetails.map((detail) => detail.members || [])).filter(
        (member) => member.kind === 'event'
      ),
      methodRows: uniqueMembers(runtimeDetails.map((detail) => detail.members || [])).filter(
        (member) => member.kind === 'method'
      )
    }
  }

  const coreDetails = getComponentDetails(entry, interfaceDetails)
  const mergedCore = uniqueMembers(
    coreDetails.map((detail) => mergeHeritageMembers(detail.name, coreByName))
  )
  const frameworkOwn = uniqueMembers(
    [frameworkReact, frameworkVue]
      .filter(Boolean)
      .map((detail) => (detail.members || []).filter((member) => member.kind === 'prop'))
  )
  const members = uniqueMembers([mergedCore, frameworkOwn])

  return {
    details: coreDetails,
    propRows: members.filter((member) => member.kind === 'prop'),
    eventRows: members.filter((member) => member.kind === 'event'),
    methodRows: members.filter((member) => member.kind === 'method')
  }
}

function getPropsExtra(component) {
  const extras = [COMPONENT_PROPS_EXTRA[component]]
  if (component === 'DataTableWithToolbar') extras.push(COMPONENT_PROPS_EXTRA.TableToolbar)
  return extras.filter(Boolean).join('\n\n')
}

function generatePublicPropsReference(category, componentEntries, interfaceDetails) {
  const slug = CATEGORY_SLUGS[category] || category.toLowerCase()
  const coreByName = coreDetailsByName(interfaceDetails)
  let markdownText = '---\n'
  markdownText += `name: tigercat-props-${slug}\n`
  markdownText += `description: Compact generated Tigercat ${category} props reference\n`
  markdownText += '---\n\n'
  markdownText += '<!-- generated by pnpm docs:api -->\n\n'
  markdownText += `# ${category} Props\n\n`
  markdownText += `${CATEGORY_DESCRIPTIONS[category] || 'Tigercat component props.'} 共 ${componentEntries.length} 个组件。字段细节以 \`packages/core/src/types/*.ts\` 为准；跨包组件以本段列出的源码为准。\n\n`

  for (const entry of componentEntries) {
    const component = entry.component
    const resolved = entry.propsRows
      ? {
          details: getComponentDetails(entry, interfaceDetails),
          typeSource: entry.typeSource,
          propRows: entry.propsRows,
          eventRows: mergeMembers(getComponentDetails(entry, interfaceDetails), 'event'),
          methodRows: mergeMembers(getComponentDetails(entry, interfaceDetails), 'method')
        }
      : getResolvedComponentRows(entry, interfaceDetails, coreByName)
    const { details, propRows, eventRows, methodRows } = resolved
    const typeSource = resolved.typeSource || entry.typeSource
    const visiblePropRows = getVisiblePropRows(component, propRows)
    const shownCount = visiblePropRows.length
    const propsMeta =
      propRows.length > shownCount ? ` · ${shownCount}/${propRows.length} props` : ''
    const interfaceNames =
      details.map((detail) => detail.name).join(' / ') || entry.propsInterfaces?.join(' / ') || '-'

    markdownText += `## ${component}\n\n`
    markdownText += `\`${typeSource}\` · \`${interfaceNames}\`${propsMeta}\n\n`
    markdownText += getComponentUsageText(component)

    if (propRows.length > 0) {
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

function getRequiredPropNames(entry, interfaceDetails, coreByName) {
  if (!entry) return []
  const propRows = entry.propsRows
    ? entry.propsRows
    : getResolvedComponentRows(entry, interfaceDetails, coreByName).propRows
  return propRows
    .filter((member) => !String(member.name).endsWith('?'))
    .map((member) => member.name)
}

function getVueSnippet(component, category, requiredNames) {
  const resolved = resolveUsageSnippet(
    component,
    'Vue',
    requiredNames,
    COMPONENT_SNIPPETS.Vue[component]
  )
  if (resolved) return resolved
  if (
    category === 'Form' &&
    ['Input', 'Select', 'Checkbox', 'Radio', 'Switch', 'Textarea'].includes(component)
  ) {
    return `<${component} v-model=\"value\" />`
  }
  if (component === 'Form')
    return '<Form v-model="form"><FormItem name="name" label="Name"><Input /></FormItem></Form>'
  if (component === 'Table')
    return '<Table :columns=\"columns\" :data-source=\"rows\" row-key=\"id\" />'
  const requiredSnippet = buildRequiredPropSnippet(component, requiredNames, 'Vue')
  if (requiredSnippet) return requiredSnippet
  if (category === 'Charts') return `<${component} :data=\"data\" />`
  return `<${component} />`
}

function getReactSnippet(component, category, requiredNames) {
  const resolved = resolveUsageSnippet(
    component,
    'React',
    requiredNames,
    COMPONENT_SNIPPETS.React[component]
  )
  if (resolved) return resolved
  if (
    category === 'Form' &&
    ['Input', 'Select', 'Checkbox', 'Radio', 'Switch', 'Textarea'].includes(component)
  ) {
    return `<${component} value={value} onChange={setValue} />`
  }
  if (component === 'Form')
    return '<Form value={form} onChange={setForm}><FormItem name="name" label="Name"><Input /></FormItem></Form>'
  if (component === 'Table') return '<Table columns={columns} dataSource={rows} rowKey=\"id\" />'
  const requiredSnippet = buildRequiredPropSnippet(component, requiredNames, 'React')
  if (requiredSnippet) return requiredSnippet
  if (category === 'Charts') return `<${component} data={data} />`
  return `<${component} />`
}

function generateExamples(category, componentEntries, interfaceDetails) {
  const slug = CATEGORY_SLUGS[category] || category.toLowerCase()
  const coreByName = coreDetailsByName(interfaceDetails)
  const components = componentEntries.map((entry) => entry.component)
  const entriesByComponent = new Map(componentEntries.map((entry) => [entry.component, entry]))
  let markdownText = '---\n'
  markdownText += `name: tigercat-examples-${slug}\n`
  markdownText += `description: Compact Tigercat ${category} Vue and React usage routes\n`
  markdownText += '---\n\n'
  markdownText += '<!-- generated by pnpm docs:api -->\n\n'
  markdownText += `# ${category} Examples\n\n`
  markdownText += `${EXAMPLE_NOTES[category] || 'Use the props reference for exact field names.'}\n\n`
  markdownText +=
    '每个组件一节，供 MCP `tigercat_component` 按 `## {Component}` 抽取。绑定差异见 `shared/patterns/common.md`。\n\n'

  for (const component of components) {
    const requiredNames = getRequiredPropNames(
      entriesByComponent.get(component),
      interfaceDetails,
      coreByName
    )
    const vue = getVueSnippet(component, category, requiredNames)
    const react = getReactSnippet(component, category, requiredNames)
    markdownText += `## ${component}\n\n`
    markdownText += `Runnable modules: \`examples/example/vue3/src/examples/${pascalToKebab(component)}/\` and \`examples/example/react/src/examples/${pascalToKebab(component)}/\`.\n\n`
    markdownText += getComponentUsageText(component)
    markdownText += `Vue: \`${codeText(vue)}\`\n\n`
    markdownText += `React: \`${codeText(react)}\`\n\n`
  }

  markdownText +=
    'Imports: use PascalCase subpaths such as `@expcat/tigercat-vue/Button` and `@expcat/tigercat-react/Button`. Hooks and `notification` use the same subpath rule. Shared types and helpers come from `@expcat/tigercat-core`.\n'
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
    '查组件用法：先开 [component-index.md](../component-index.md) 定位组件、Category 与 PascalCase Package Subpath，再按其规则打开 `shared/props/{cat}.md` 与 `examples/{cat}.md`。跨框架绑定差异见 [shared/patterns/common.md](../shared/patterns/common.md) 与 [shared/glossary.md](../shared/glossary.md)。命令式 API 见 [command-apis.md](../command-apis.md)。\n'
  return markdownText
}

async function main() {
  const typeFiles = (await readdir(TYPES_DIR)).filter(
    (fileName) => fileName.endsWith('.ts') && fileName !== 'index.ts'
  )

  const fileInfoByName = new Map()
  for (const fileName of typeFiles) {
    const sourcePath = `packages/core/src/types/${fileName}`
    const content = await readFile(join(TYPES_DIR, fileName), 'utf8')
    const fileInfo = extractFileInfo(fileName, content, sourcePath)
    fileInfoByName.set(fileInfo.typeName, fileInfo)
  }

  const categorizedFiles = getCategorizedFiles(fileInfoByName)
  const totalTypes = countExportedTypes(categorizedFiles)
  const publicExports = loadPublicComponentExports(ROOT_DIR)
  const publicComponentNames = new Set(publicExports.all)
  const componentRows = buildPublicComponentEntries(ROOT_DIR, fileInfoByName, publicExports)
  const frameworkSourceFiles = new Set(
    componentRows
      .flatMap((entry) => entry.sourceFiles || [])
      .filter((fileName) => !fileName.startsWith('packages/core/src/types/'))
  )
  for (const row of componentRows) {
    const react = `packages/react/src/components/${row.component}.tsx`
    const vue = `packages/vue/src/components/${row.component}.ts`
    if (existsSync(join(ROOT_DIR, react))) frameworkSourceFiles.add(react)
    if (existsSync(join(ROOT_DIR, vue))) frameworkSourceFiles.add(vue)
  }
  const frameworkFileInfos = []
  for (const fileName of frameworkSourceFiles) {
    const content = await readFile(join(ROOT_DIR, fileName), 'utf8')
    frameworkFileInfos.push(extractFileInfo(fileName, content, fileName))
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

  const reactHooks = collectPublicHookExports(
    await readFile(join(ROOT_DIR, 'packages', 'react', 'src', 'index.tsx'), 'utf8')
  )
  const vueHooks = collectPublicHookExports(
    await readFile(join(ROOT_DIR, 'packages', 'vue', 'src', 'index.ts'), 'utf8')
  )
  const publicHooks = [...new Set([...reactHooks, ...vueHooks])]
    .sort((a, b) => a.localeCompare(b))
    .map((name) => ({
      name,
      packages: [
        ...(reactHooks.includes(name) ? ['react'] : []),
        ...(vueHooks.includes(name) ? ['vue'] : [])
      ]
    }))

  await writeFile(
    LLM_API_SUMMARY,
    await formatMarkdown(generateLlmApiSummary(categorizedFiles, publicHooks)),
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
    const propsMarkdown = await formatMarkdown(
      generatePublicPropsReference(category, entries, interfaceDetails)
    )
    const examplesMarkdown = await formatMarkdown(
      generateExamples(category, entries, interfaceDetails)
    )
    const propsOverBudget = true
    const examplesOverBudget = true

    const propsColliding = propsOverBudget
      ? entries.filter((entry) => pascalToKebab(entry.component) === slug)
      : []
    if (!propsOverBudget) {
      await writeFile(join(PROPS_DIR, `${slug}.md`), propsMarkdown, 'utf8')
    } else {
      const indexLinks = entries.map((entry) => {
        const componentSlug = pascalToKebab(entry.component)
        const target = componentSlug === slug ? `#${componentSlug}` : `./${componentSlug}.md`
        return `- [${entry.component}](${target})`
      })
      const embeddedSource = propsColliding.length
        ? generatePublicPropsReference(category, propsColliding, interfaceDetails)
        : ''
      const sectionStart = embeddedSource.search(/^## /m)
      const embedded = sectionStart >= 0 ? embeddedSource.slice(sectionStart) : ''
      const index = [
        '---',
        `name: tigercat-props-${slug}`,
        `description: ${category} props split by component`,
        '---',
        '',
        '<!-- generated by pnpm docs:api -->',
        '',
        `# ${category} Props`,
        '',
        'One component per page. This index only links to those pages.',
        '',
        ...indexLinks,
        '',
        embedded
      ].join('\n')
      await writeFile(join(PROPS_DIR, `${slug}.md`), await formatMarkdown(index), 'utf8')
    }
    const examplesColliding = examplesOverBudget
      ? entries.filter((entry) => pascalToKebab(entry.component) === slug)
      : []
    if (!examplesOverBudget) {
      await writeFile(join(EXAMPLES_DIR, `${slug}.md`), examplesMarkdown, 'utf8')
    } else {
      const indexLinks = entries.map((entry) => {
        const componentSlug = pascalToKebab(entry.component)
        const target = componentSlug === slug ? `#${componentSlug}` : `./${componentSlug}.md`
        return `- [${entry.component}](${target})`
      })
      const embeddedSource = examplesColliding.length
        ? generateExamples(category, examplesColliding, interfaceDetails)
        : ''
      const sectionStart = embeddedSource.search(/^## /m)
      const embedded = sectionStart >= 0 ? embeddedSource.slice(sectionStart) : ''
      const index = [
        '---',
        `name: tigercat-examples-${slug}`,
        `description: ${category} examples split by component`,
        '---',
        '',
        '<!-- generated by pnpm docs:api -->',
        '',
        `# ${category} Examples`,
        '',
        'One component per page. This index only links to those pages.',
        '',
        ...indexLinks,
        '',
        embedded
      ].join('\n')
      await writeFile(join(EXAMPLES_DIR, `${slug}.md`), await formatMarkdown(index), 'utf8')
    }

    for (const entry of entries) {
      if (propsOverBudget) {
        const file = `${pascalToKebab(entry.component)}.md`
        if (pascalToKebab(entry.component) !== slug) {
          await writeFile(
            join(PROPS_DIR, file),
            await formatMarkdown(
              generatePublicPropsReference(category, [entry], interfaceDetails)
            ),
            'utf8'
          )
        }
        entry.docProps = `skills/tigercat/references/shared/props/${file}`
      } else {
        entry.docProps = `skills/tigercat/references/shared/props/${slug}.md`
      }

      if (examplesOverBudget) {
        const file = `${pascalToKebab(entry.component)}.md`
        if (pascalToKebab(entry.component) !== slug) {
          await writeFile(
            join(EXAMPLES_DIR, file),
            await formatMarkdown(generateExamples(category, [entry], interfaceDetails)),
            'utf8'
          )
        }
        entry.docExamples = `skills/tigercat/references/examples/${file}`
      } else {
        entry.docExamples = `skills/tigercat/references/examples/${slug}.md`
      }
    }
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

  // context7.json 最后写出：skill_files 清单必须在所有 markdown 落盘之后收集。
  // 走 prettier 而非 JSON.stringify 缩进，否则产物与 `pnpm format:check` 互相打架。
  await writeFile(
    CONTEXT7_JSON,
    await formatWithPrettier(
      JSON.stringify(buildTigercatContext7(componentRows, collectSkillFiles())),
      'json'
    ),
    'utf8'
  )

  await stampPublishFace(componentRows.length)

  console.log(`Skill references generated under: ${SKILL_REFERENCES_DIR}`)
  console.log(`Total exported types: ${totalTypes}`)
  console.log(`Indexed components: ${componentRows.length}`)
}

// skill markdown 清单（仓库相对 POSIX 路径，码位序）。排除维护者专用的
// ROADMAP.md：它不属于 MCP allow-list，纳入会反向扩大可读范围。
async function stampPublishFace(componentCount) {
  const version = JSON.parse(await readFile(join(ROOT_DIR, 'package.json'), 'utf8')).version
  const home = join(ROOT_DIR, 'examples/index.html')
  const mcp = join(ROOT_DIR, 'examples/mcp/index.html')
  const homeHtml = await readFile(home, 'utf8')
  const mcpHtml = await readFile(mcp, 'utf8')
  await writeFile(
    home,
    homeHtml.replace(/class="version-badge">v[^<]*/, `class="version-badge">v${version}`),
    'utf8'
  )
  await writeFile(
    mcp,
    mcpHtml.replace(/\d+\+? 组件索引/, `${componentCount} 组件索引`),
    'utf8'
  )
}

function collectSkillFiles() {
  return collectFiles(SKILL_DIR, ['.md'])
    .map((file) => relative(ROOT_DIR, file).split(sep).join('/'))
    .filter((path) => path !== 'skills/tigercat/ROADMAP.md')
    .sort()
}

main().catch((error) => {
  console.error('Failed to generate API docs:', error)
  process.exit(1)
})
