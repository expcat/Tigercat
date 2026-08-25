# Tigercat Pages 视觉 + 源码审查（v2.1.0）

> 目的：对照 [GitHub Pages 在线示例](https://expcat.github.io/Tigercat/) 的视觉效果与仓库源码/示例，记录可复现问题与优化线索，供后续专项修复参照。\n>
> 范围：v2.1.0（tag `v2.1.0` / commit `14e7fea7` 附近 main）。\n>
> 方法：按组件组拆独立 grok 会话；每组对照 Pages（Vue/React、亮色/暗色）+ `packages/{core,vue,react}` + demos/tests；本文件只汇总事实与优先级，不替代 issue。\n>
> 状态：全部波次完成。

## 0. 执行约定

| 项 | 约定 |
| --- | --- |
| Pages | https://expcat.github.io/Tigercat/ （及 vue/react 路由） |
| 本地对照 | `examples/example/{vue3,react}` 与 `packages/*` |
| 会话策略 | **每组一个新的 grok 会话**（勿 `--continue` 串成超大上下文） |
| 模型 | grok-4.6 |
| 严重级别 | P0 阻断/错乱 · P1 明显缺陷 · P2 体验/一致性 · P3 建议 |
| 条目格式 | 组件 · 端（React/Vue/双端） · 现象 · 复现路径（Pages URL 或路由） · 源码位置 · 建议 |

## 1. 任务波次（粒度）

| Wave | 组 | 主要组件/范围 | 会话状态 |
| --- | --- | --- | --- |
| W1 | Basic (display) | Alert Avatar Badge Button ButtonGroup Code Divider Empty Highlight Icon Kbd Link Marquee Rate Result Segmented SplitButton Statistic Tag Text Watermark | done |
| W2 | Basic (media) | Image ImageCompare QRCode（及示例中 ImageCropper 等媒体相关页） | done |
| W3 | Form primitives | Input InputNumber InputGroup Textarea Checkbox Radio Switch Slider Stepper InputOTP TagsInput MaskInput NumberKeyboard Signature ColorSwatch | partial（源码+Pages Slider 已核实；Pages 暗色未全爬，暗色项以 token/源码为主） |
| W4 | Form composite | Select AutoComplete Cascader TreeSelect DatePicker TimePicker ColorPicker CronEditor Mentions Transfer Upload Form | done |
| W5 | Feedback | Drawer Loading LoadingBar Message Modal Notification Popconfirm Popover Progress Tooltip Tour | done |
| W6 | Layout | AspectRatio Card Carousel Container Descriptions Grid Layout Masonry List Resizable ScrollArea Skeleton Space Splitter | done |
| W7 | Navigation | Affix Anchor BackTop Breadcrumb Dropdown ContextMenu NavigationMenu PageHeader FloatButton Menu Pagination ScrollSpy Spotlight Steps Tabs Tree | done |
| W8 | Data | Calendar Collapse Countdown DataExport Table Timeline | done |
| W9 | Charts | Chart 系列 Gantt OrgChart | done |
| W10 | Advanced | CodeEditor Drag FileManager ImageAnnotation ImageViewer InfiniteScroll Kanban MarkdownEditor PrintLayout RichTextEditor VirtualList VirtualTable | done |
| W11 | Composite | ActivityFeed Chat CommentThread FormWizard NotificationCenter TableToolbar TaskBoard 等 | done |
| W12 | 汇总 | 去重、跨组主题、优先级排序、优化 backlog | done |

## 2. 每组检查清单（固定）

1. Pages 亮色 / 暗色：布局溢出、对比度、主题 token、错位/裁剪。
2. React vs Vue：示例行为与视觉是否对称。
3. 交互：焦点、键盘、弹层关闭、滚动锁定、受控/非受控。
4. 源码：双端 API 对称、明显逻辑 bug、a11y 角色/标签、示例与实现不一致。
5. 回归风险：v2.1.0 新组件/虚拟化优先多看一眼。

## 3. 发现汇总

> **W12 去重说明**：下列为各波次原文汇总，**不删明细**。同一根因已收成跨组主题并重排优先级，见 [§5](#5-后续优化-backlog)。
>
> §3 原文计数：P0 **0** · P1 **49** · P2 **112** · P3 **77**。去重后：P0 **0** · P1 **40** · P2 **约 105** · P3 **约 74**。
>
> 跨组主题索引：T1 主题 token/暗色白底 · T2 受控绑定/v-model 脱绑 · T3 a11y · T4 示例/文档/死 API · T5 sandbox/Pages 站点级。

### P0

（暂无）

### P1

- **ButtonGroup** · 双端 · 亮/暗 · 相邻按钮未缝合成组：组根误用 `[&:first-child]` 自选择器，子按钮仍各自圆角。Pages `/button`「按钮组与尺寸继承」可见三颗独立胶囊。源码：`packages/core/src/utils/button-utils.ts:56-63` + `group-utils.ts:72-78`。建议：对齐 InputGroup 的 `[&>*:…]`，必要时 `!` 覆盖 Button 半径。
- **Rate** · 双端 · 亮/暗 · 半星被横向压扁而非左半裁剪。Pages `/rate`「只读」`4.5` 的第 5 颗星明显变窄。源码：`Rate.tsx:147-159` / `Rate.ts:149-171`。建议：裁剪层内保持满星宽度（如 `w-[200%]`）。
- **Avatar** · 双端 · 亮/暗 · `text="TC"` 经 `getInitials` 只显示 **T**。Pages `/avatar`「代表外观」与示例源码不一致。源码：`avatar-utils.ts` `getInitials`；Vue/React Avatar。建议：无空格且 ≤2 字原样显示，或拆 `name`/`text`。
- **Segmented** · 双端 · 暗 · 轨道回落到浅色 `#f3f4f6`，选中指示器走已主题化的 `--tiger-surface`（暗），整体白底 + 深色滑块，像亮色控件贴在暗页上。Pages `/segmented` 切暗色。源码：`segmented-utils.ts:26-49`。建议：`--tiger-segmented-*` 写入 theme，或 fallback 到 `surface-muted` / `surface-raised`。见 §5 T1。
- **Kbd**（及 Tag `default`） · 双端 · 暗 · 背景锁浅色 fallback，文字走 `--tiger-text`（暗色为浅字）→ 按键变成空白白块，标签几乎不可读。Pages `/kbd` 暗色。源码：`defaultTagThemeColors.default` + `kbd-utils.ts` `getKbdVariantClasses`。建议：bg/text 成对走已注册 semantic token。见 §5 T1。
- **Empty** · 双端 · 亮/暗 · 「预设一览」2 列网格第 5 张（`preset="error"`）被 demo 预览固定高度裁切，无滚动。Pages `/empty`。建议：示例容器 `min-h`/`overflow-auto` 或改栅格。
- **Result** · 双端（Vue 确认；React 同结构） · 亮/暗 · 「状态一览」末行 403/500 卡片被 demo 容器裁半。Pages `/result`。建议：同 Empty，放开预览区高度。
- **QRCode** · 双端 · 亮/暗 · 公开组件是哈希伪矩阵，不能扫；`level` 为死 API。Pages `/qrcode`「尺寸与纠错级别」L/M/Q/H 四枚图案逐模块相同。源码：`qrcode-utils.ts` `generateQRMatrix`；React `QRCode.tsx` `_level` 未传入。建议：接入真正 QR 库，或从公开 API/示例拿掉 level 并标明装饰用途。
- **ImagePreview** · 双端 · 亮/暗 · `maskClosable` 点遮罩关不掉：独立 mask 子节点吃掉点击，`e.target === e.currentTarget` 对 wrapper 永不成立。Pages `/image` ImageGroup / ImagePreview 点暗区仍开着。源码：`ImagePreview.ts` / `ImagePreview.tsx` `handleMaskClick` + `imagePreviewMaskClasses`。建议：点 mask 即关，或把 backdrop 当 dialog 根（对齐 ImageViewer）。
- **ImageViewer** · 双端 · 亮 · 工具条/左右导航走已注册 `--tiger-surface`（亮色为白）+ `text-white` → 白底白字。Pages `/image-viewer` 打开后两侧白圆、照片上一条白胶囊，图标看不见。源码：`image-viewer-utils.ts` `imageViewerToolbarClasses` / `imageViewerNavBtnClasses`。建议：对齐 ImagePreview 的 `--tiger-image-toolbar-bg, rgba(0,0,0,0.6)`。
- **ImagePreview / ImageViewer** · 双端 · Pages sandbox · 预览 `fixed inset-0` 困在 demo iframe（ImageViewer 示例约 180px 高）；ImagePreview 图还是 `max-w-none` 无 `max-h`，组图/独立预览被裁成横条。源码：`imagePreviewImgClasses` vs `imageViewerImgClasses`；示例 `image/04-05` `image-viewer/01` viewport。建议：预览图 `max-h-[90vh] max-w-[90vw]`；示例 viewport 加高或预览时撑开 iframe。见 W4 DatePicker、W5/W7 overlay、W11 CropUpload；§5 T5。

- **Slider** · Vue · 亮/暗 · 示例用 `v-model`，组件只发 `update:value`（需 `v-model:value`）→ 滑块停在 min，旁路文案仍是本地 ref。Pages `/slider` 滑块在 0、文案仍写 40。源码：`Slider.ts:129-178`；示例 `slider/01-04`。建议：兼发 `update:modelValue` 或改示例为 `v-model:value`。见 W4 Transfer；§5 T2。
- **主题 token / 暗色** · 双端 · 暗 · Form 大量用未注册 `--tiger-text-muted` / `--tiger-fill`，以及 `text-red-900`/`green-900`/`yellow-900`、`text-gray-500`；暗 `--tiger-surface` 上状态字近不可见。Signature 默认 `penColor='#111827'` 暗垫上墨迹消失。源码：`THEME_CSS_VARS`；`input-styles.ts:30-34`；`input-otp-utils.ts:172-177`；Signature Vue41/React57。建议：补注册或改用已有 secondary/muted；状态色走 `--tiger-error` 等；笔色默认跟 `--tiger-text`。见 W1 Segmented/Kbd、W5 Loading、W6 Skeleton/Layout、W7 Tree、W9 OrgChart、W10 `--tiger-bg`、W4/W7/W8/W9/W11 muted；§5 T1。
- **InputGroup compact** · 双端 · 亮/暗 · compact 选择器只打直接子节点；Input/Textarea 根是无边框 wrapper，内层控件仍独立圆角，`-ml-px` / `[&>*:focus]:z-10` 也打不中内层（应为 `:focus-within`）。InputNumber 根即边框盒所以正常。Pages `/input-group` 示例 01。源码：`input-group-utils.ts:17-18`。建议：边框/圆角放到 Input 根，或 compact 下改写子控件类。
- **Input** · Vue · 亮/暗 · `clearable`+`showPassword` 两个按钮同用 `absolute … right-0`，叠在同一像素；React 二选一（clear 优先）。源码：`Input.ts:291-320` vs `Input.tsx:192-218`。建议：只渲染一个，或错开 `right` 偏移并加足 `pr-*`。
- **Input** · 双端 · 亮/暗 · `errorMessage` 用 `absolute inset-y-0 right-0` 画在字段内，长文案挤掉值区，且替换 clear/password/suffix；非 live region。源码：`getInputErrorClasses`；Vue283-291 / React185-190。建议：错误文案放到字段下方并用 `aria-live`/`aria-describedby`。
- **MaskInput** · 双端 · 亮/暗 · 类型写「提交 raw」，带 `name` 的 `<input value={maskedValue}>` 实际提交掩码；无 hidden raw（OTP/Tags 有）。源码：`MaskInput.tsx:205-211` / Vue 同构。建议：`name` 时 hidden 提交 raw，可见框只展示掩码。
- **Signature** · 双端 · 亮/暗 · `pointermove`/`pointerup` 只挂在 canvas，拖出垫面不结束笔画，`activeStroke` 卡住；无 `setPointerCapture`。源码：Vue246 / React239。建议：pointerdown 时 `setPointerCapture`，或 document 级 up/cancel。
- **InputNumber** · 双端 · 亮/暗 · Vue `inheritAttrs:false` 只合 `class`；React 无 `...rest` → `aria-label`/`data-*` 到不了 `role="spinbutton"`。源码：Vue309-316；React 接口。建议：attrs 落到 spinbutton。
- **Radio** · Vue · 亮/暗 · `actualDisabled` 用 `props.disabled !== undefined`；Boolean prop 省略仍是 `false`（已定义）→ 永不继承 group `disabled`，radio 仍可聚焦。React 正确。源码：`Radio.ts:122-125`。建议：对齐 Checkbox `props.disabled || group.disabled`。
- **Switch / Stepper / ColorSwatch** · Switch·Stepper 双端；ColorSwatch 仅 Vue · 亮/暗 · 无内部状态：点击只 emit，父不回写则 UI 不动。示例绑了 `v-model`/state 所以 demo 正常；裸用失效。源码：Switch/Stepper 恒读 props；Vue ColorSwatch 无 `defaultValue`。建议：补非受控内部态，或文档标明 controlled-only。见 W10 FileManager/Kanban、W11 Comment 01；§5 T2。

- **ColorPicker** · 双端 · 亮/暗 · 示例 01 初值 `rgba(37, 99, 235, 0.8)` + `show-alpha` + `format="rgb"`，触发色块是黑的：`hexToRgb` 把 rgba 当 hex `parseInt` → NaN。`showAlpha` 滑条只改本地 `alpha`、不 emit；hue/预设/输入一律 emit hex，`format` 只改面板预览。Pages `/color-picker`「代表配置」Vue/React 都是黑块。源码：`color-picker-utils.ts` `hexToRgb`/`parseColorInput`；Vue `ColorPicker.ts:52-121`；React 同构。建议：`parseColorInput` 解析 rgba/hsla 并回写带 alpha 的字符串；初值走解析而非 `hexToRgb`。
- **Transfer** · Vue · 亮/暗 · 示例 01 `v-model:target-keys`，组件只 `emit('update:modelValue')`、无内部 target 态 → 勾选项点 `>` 面板不动。Pages `/transfer` 勾「设计」后仍是「已选团队 (1) / 前端」。React 同例 `targetKeys`+`onChange={setTargetKeys}` 可移到 (2)。源码：`Transfer.ts:119,146-147,199-221`；示例 `transfer/01/App.vue`。建议：兼发 `update:targetKeys`，或示例改 `v-model`。
- **AutoComplete** · 双端 · 亮/暗 · `label !== value` 时选中后输入框被 `watch(modelValue)`/`useEffect(value)` 写成 raw value。示例 02 `{ label: '北京 Beijing', value: 'beijing' }` 选完显示 `beijing`。源码：Vue `AutoComplete.ts:143-150,206-216`；React `AutoComplete.tsx:127-133`。建议：受控回写解析 option.label。
- **Form** · React · 亮/暗 · 默认 trigger 含 `change`；FormItem 在子 `onChange` 之后立刻 `validateField`，Form 读的是上一拍 `model`。`updateValue` 在 context 里从未被 FormItem 调用。必填错误会在第一字后仍在。Vue 靠响应式 model 无此问题。源码：`FormItem.tsx:237-241`；`Form.tsx:221-222`。建议：FormItem 走 `updateValue` 再校验，或校验读 event 新值。
- **Upload** · React · 亮/暗 · 受控 `fileList` 时 `notify()` 不回写父级；`customRequest` 的后续 `onProgress`/`onSuccess` 改的是同一对象，可能不再绘成功态。Vue `setFileList` 始终 `emit('update:file-list')`。示例 04 正是 `fileList`+`onChange`+`customRequest`。源码：React `Upload.tsx` `useControlledState` / `notify`。建议：受控进度也 `onChange(file, nextList)` 新数组。

- **Loading** · 双端 · 暗 · 全屏默认 `background: 'rgba(255, 255, 255, 0.9)'`：Pages `/loading`「全屏加载」点「模拟页面加载」后，180px sandbox 被一块半透明白布盖住；区域加载示例自己叠的 `bg-white/85` 同样是浅色垫。源码：Vue `Loading.ts:62-65,156-158`；React `Loading.tsx:32,75`。建议：默认走 `--tiger-surface` 半透明或注册 `--tiger-loading-mask`。见 §5 T1。

- **Splitter** · 双端 · 亮/暗 · 示例把 `sizes={[30,70]}` / `[40,60]` / `[25,75]` 当「初始比例」，实现按 **像素** 写入 pane `width/height`。Pages `/splitter` 左栏实测 30×198、字竖排；垂直例上栏 40px；嵌套侧栏 25px。`min={100}` 只在拖拽时 clamp、初始化不生效；向右拖一次变成 `[0,100]`。demo.json 写「初始比例」。源码：`splitter.ts` `sizes` 注释为 px；Vue `Splitter.ts:72-83`；React `Splitter.tsx:70-74`；示例 `splitter/01-03`。建议：示例改真实 px 或 `'30%'`（core 已有 `parsePaneSize` 未接线），初始化也 apply min。
- **Skeleton** · 双端 · 暗 · `--tiger-skeleton-bg,#e5e7eb` 未进 `THEME_CSS_VARS`（token 产物是 `--tiger-component-skeleton-*`，组件没用）。Pages `/skeleton` 暗色是三条浅灰白杠贴在深页上。源码：`skeleton-utils.ts:8-16`。建议：走 `surface-muted` 或注册并写入 theme。见 §5 T1。
- **Layout / Container 示例** · 双端 · 暗 · layout/01 Container 锁 `bg-white`，layout/02 Content 锁 `!bg-white`：暗页 `--tiger-text` 为浅字 → 白底白字，文案「响应式居中的 Container 内容」看不见。layout/03 Content 走未注册 `--tiger-layout-content-bg,#f9fafb`，实测 `rgb(249,250,251)` + 白字「工作区」。源码：`layout-utils.ts:43-44`；示例 `layout/01-03`。建议：示例改 token 背景；Content fallback 改 `surface-muted`。见 §5 T1。

- **Tree** · 双端 · 暗 · 根 `bg-white`，节点字继承 `--tiger-text`（暗色浅字）→ 白底白字，只剩勾选框。Pages `/tree` 切 Dark，「基础树」是一张空白白卡。源码：`tree-utils.ts` `treeBaseClasses` / `treeNodeHoverClasses`。建议：走 `--tiger-surface` / `--tiger-text` / `--tiger-border`。见 §5 T1。
- **Affix `offsetBottom`** · 双端 · 亮/暗 · 底钉写成 `bottom: offset px`（视口），不是 `target` 容器底。Pages `/affix`「固定到底部」首屏已是「已固定到底部」，实测 `fixed; bottom:8px; y=152`（200px iframe）。源码：`affix-utils.ts:44-56`；示例 `affix/02`。建议：`bottom: innerHeight - containerRect.bottom + offset`，或改 sticky。
- **Pagination `pageSize`** · React · 亮/暗 · 示例 01 受控 `pageSize` 只绑 `onChange`；尺寸变化只走 `onPageSizeChange` → `<select>` 改完弹回 20。Pages `/pagination`「受控分页」Vue `v-model:pageSize` 可改到 10，React 实测 `before=20 after=20`。源码：`Pagination.tsx:196-200`；示例 `pagination/01/App.tsx`。建议：示例补 `onPageSizeChange`。
- **DropdownItem `close-on-click`** · Vue · 亮/暗 · 示例 02 写在 Item 上，prop 只存在于 Dropdown；点「保持展开」仍关。React 同例改成 `disabled`。源码：`Dropdown.ts` Item props；`examples/.../dropdown/02/App.vue`。建议：实现 item 级 closeOnClick，或示例改绑父级。
- **Anchor / ScrollSpy 当前项** · 双端 · 亮/暗 · IO 取「仍在顶部 40% 带里的第一个 href」，`bounds` 未接线。Pages `/anchor`「审计/发布」点「发布」后仍是审计加粗；`/scroll-spy` 点末项 `aria-current` 仍停在第一项。源码：`anchor-utils.ts` `computeActive` / `rootMargin: -60%`。建议：按 offset 线取最后相交，click 后锁到滚动结束。
- **FloatButton** · 双端 · 亮/暗 · 无默认图标（空蓝圆/方）；Group 恒 Teleport + `fixed right-6 bottom-6`，示例 `relative h-56` 装不住。Pages `/float-button` 空框里一颗空心圆，下一例方钮 `fixed` 贴 iframe 角。源码：`float-button-utils.ts:39-40`；Vue `FloatButton.ts:231` / React `createPortal`。建议：默认 plus 图标；Group 接 placement/offset，可关 portal。

- **Calendar `mode="year"`** · 双端 · 亮/暗 · 年视图只有 12 个月份芯片，点击只改高亮并 `panel-change`，**不** `onChange` / `v-model`；`disabledDate` 只接线日网格，月份全可点。Pages `/calendar`「年视图与禁用日期」周末禁用为 0，点 Mar 只变成 `aria-selected=Mar`。源码：Vue `Calendar.ts` `selectMonth`；React 同构。建议：点月份 emit 该月 1 日或切回 month 模式，并按 `disabledDate` 禁月份；示例 02 改成能看见禁日的月视图。
- **Table 默认分页被 `current:1` 锁死** · 双端 · 亮/暗 · 默认 `pagination` 对象带 `current`/`pageSize`，实现把有 `current` 当受控 → Next 只发事件、行仍停在第 1 页。Pages `/table`「分页与行选择」绑了 `page`/`onPageChange` 所以 demo 正常（Vue/React 都能 成员 1–5 → 6–10）。裸 `<Table>` 或只传 `dataSource` 会坏。源码：Vue `Table/props.ts` 默认值 + `state.ts` `currentPage`；React `Table.tsx` 默认 + `isCurrentPageControlled`。建议：默认改 `defaultCurrent`/`defaultPageSize`，或无调用方 `current` 时走内部态。
- **Table `virtual` / `autoVirtual` 滚动盒** · React · 亮/暗 · `autoVirtual` 默认 true、阈值 1000：生效时 `height:400px; overflow:auto` 打在**外层 wrapper**，导出钮和 Pagination 一起被卷走。Vue 只包 `<table>`。Pages `/table` 行数不够触发。源码：React `Table.tsx` `wrapperStyle`；Vue `Table.ts` 内层 scroller。建议：对齐 Vue，滚动只包表体。

- **OrgChart `direction="horizontal"` 宽高对调** · 双端 · 亮/暗 · `flipLayoutNode` 把 `width/height` 一起交换，默认 160×72 变成 **72×160 竖条**。Pages `/org-chart`「组合展示」CEO 卡里 `Chief Executive Officer` 溢出；姓名贴在 72px 宽盒里。源码：`org-chart-utils.ts` `flipLayoutNode`；示例 `org-chart/01` `direction="horizontal"`。建议：只交换 x/y，保留 `nodeWidth`×`nodeHeight`。
- **OrgChart 暗色白底浅字** · 双端 · 暗 · 节点 `fill-[var(--tiger-bg,#ffffff)]`（未注册），label 走已主题化的 `--tiger-text`（暗色 `#f9fafb`）→ 白卡片浅字几乎看不见；title 走 `--tiger-text-muted,#6b7280`。Pages `/org-chart` 切 Dark，白卡 + 浅名 + 灰职称溢出。源码：`org-chart-utils.ts` `orgChartNodeRectClasses` / `orgChartNodeLabelClasses`。建议：fill 改 `--tiger-surface`，字改 `--tiger-text` / `--tiger-text-secondary`。见 §5 T1。
- **Scatter `animated` + 非 circle** · 双端 · 亮/暗 · 入场 CSS `transform:scale()` 覆盖 SVG `transform="translate(cx,cy)"`，菱形全部堆在绘图区左上。Pages `/scatter-chart`「组合展示」只见 y=70 处一颗大菱形；悬停 tooltip 仍是 `D: (55, 75)`。源码：`ScatterChart.ts(x)` path + `SCATTER_ENTRANCE_KEYFRAMES`；`getScatterPointPath` 注释要求 translate。建议：动画用 `transform-box:fill-box` 并 `translate(cx,cy) scale(...)`，或只给 `<circle>` 做 CSS 缩放。
- **Sunburst `showLabels` 死 API** · 双端 · 亮/暗 · 类型/示例写弧上标签，实现只画 `<path>`，React 还把 prop 写成 `_showLabels`。Pages `/sunburst-chart` `show-labels` 环上无字，只靠底栏「亚洲/欧洲/美洲」图例，子层中国/日本看不见名字。源码：Vue `SunburstChart.ts`；React `SunburstChart.tsx:37`。建议：按 `midAngle` 画 label，或从公开 API/示例拿掉 `showLabels`。

- **W10 Advanced 暗色白底浅字** · 双端 · 暗 · FileManager / MarkdownEditor / RichTextEditor 容器走未注册 `--tiger-bg,#ffffff`，字走已主题化 `--tiger-text`（暗色 `#f9fafb`）；PrintLayout 锁 `bg-white`；ImageAnnotation 未选工具钮 `bg-[var(--tiger-bg,#ffffff)]` + 浅字。Pages `/file-manager` `/markdown-editor` `/rich-text-editor` `/print-layout` `/image-annotation` 切 Dark：白卡/白编辑面/白纸/白胶囊，文案几乎看不见。源码：`file-manager-utils.ts` `fileManagerContainerClasses`；`markdown-editor-utils.ts` / `rich-text-editor-utils.ts` container；`print-layout-utils.ts` `printLayoutBaseClasses`；`image-annotation-utils.ts` `getImageAnnotationToolButtonClasses`。建议：chrome 改 `--tiger-surface`；Print 纸面强制深色墨；工具钮 bg/text 成对走 token。见 W7 Tree、W9 OrgChart；§5 T1。
- **VirtualList 示例斑马暗色不可读** · 双端 · 暗 · 偶数行示例写死 `bg-gray-50`，字继承 `--tiger-text` 浅色 → 白条上浅字。Pages `/virtual-list` 切 Dark，「第 1/3/5 行」看不见，「第 2/4 行」正常。源码：`examples/.../virtual-list/01`。建议：斑马走 `surface-muted`，或组件提供 striped。
- **FileManager 选择无内部态** · 双端 · 亮/暗 · `selectedKeys` 默认 `[]`，点击只 `emit('update:selectedKeys')` / `onSelectedKeysChange`，无 inner。示例 01 未绑 → 点 docs/README `aria-selected` 仍 `false`。源码：Vue `FileManager.ts:160-164`；React `FileManager.tsx:96-104`；示例 `file-manager/01`。建议：补非受控态，或示例绑 `v-model:selectedKeys`（02 已绑）。
- **Kanban `allowAddCard` 不插入卡片** · 双端 · 亮/暗 · 默认露出「+ Add task」，点击只 `emit('card-add')` / `onCardAdd?.()`，不改 columns。示例开了 `allow-add-card` 但没 handler。Pages `/kanban` 点完仍是 3 张卡。源码：Vue `TaskBoard.ts:516`；React `TaskBoard.tsx:357`；示例 `kanban/01`。建议：无 handler 时插入默认卡，或示例补 `@card-add`。

- **ChatWindow Vue `onUpdated` 每次输入都滚到底** · Vue · 亮/暗 · `scrollToBottom` 挂在 `onUpdated`，受控 `v-model` 每键重绘就把 `role="log"` 拉回底部。React 只跟 `messages.length`。Pages `/chat-window` 01 发送可用（`W11 ping` 出现）；02 虚拟 120 条时向上翻历史再打字会跳回底。源码：Vue `ChatWindow.ts:206-226` vs React `ChatWindow.tsx:179-189`。建议：去掉 `onUpdated`，只 watch `messages.length`（用户已离开底部时跳过）。
- **TaskBoard `filterText` 下落点用可见卡下标写回全量列** · 双端 · 亮/暗 · 渲染走 `filterColumns` 后的 DOM，`getDropIndex` 得到过滤后的 index，`moveCard` 却作用在未过滤 `columns`。Pages `/task-board` 02「列拖拽与自定义卡片」过滤「发布」后拖剩余卡，会落到隐藏兄弟的槽位。源码：Vue `TaskBoard.ts:166-193`；React `TaskBoard.tsx:460-503`；`task-board-utils.ts` `getDropIndex` / `moveCard`。建议：把过滤下标映射回源列，或隐藏用 CSS 而不是从 DOM 拿掉。`/task-board` 01 新增任务已核实（待办 2→3，「新任务」出现）；Kanban Add 无效见 W10，本组不重开。

### P2

- **Rate** · 双端 · 星间移动时 `mouseleave` 清掉 hover。源码：每颗星上的 leave。建议：leave 挂 `role="slider"` 根。
- **Segmented** · 双端 · `SegmentedOption.icon` 死 API（类型有、两端只渲染 label）。
- **Watermark** · 双端 · 默认墨色 `rgba(0,0,0,0.15)` 硬编码；Pages 示例内层 `bg-gray-50 dark:bg-gray-800` 在暗色下仍是浅底（沙箱 `dark:` 未生效或未重建）。源码：`watermark-utils.ts:24-28` + 示例 `watermark/01`。
- **Alert** · 双端 · 暗 · `--tiger-alert-*` 未进 `THEME_CSS_VARS`，暗页上仍是浅色粉彩卡片。Pages `/alert` 暗色。
- **Alert** · 双端 · `showCountdown` 条 `absolute`，根无 `relative`，可能贴到错误祖先。源码：`alert-utils.ts` `alertBaseClasses` / `alertCountdownContainerClasses`。Pages `/alert`「横幅与自动关闭倒计时」。
- **Alert** · Vue · `duration`/`showCountdown` 仅 `onMounted` 调度。`Alert.ts:191-207`。
- **Badge** · 双端 · 非 standalone 仅 `-top-1/-right-1`，角标大部分压在宿主上、无 `z-index`。Pages `/badge`「包裹与定位」。
- **Avatar** · 双端 · `onError` 后 `src` 变更不复位，永久停在 fallback。
- **AvatarGroup** · 双端 · 暗 · `+N` / 默认底走未注册 `--tiger-avatar-bg` → `#e5e7eb`，暗色里像一枚浅色灯。Pages `/avatar` AvatarGroup。
- **Code** · 双端 · 默认「复制/已复制」不走 locale；Pages 沙箱 `sandbox` 无 `allow-same-origin`，clipboard 常失败且无失败态。
- **QRCode** · 双端 · expired「Refresh」是 `span`（无 role/tabindex），键盘进不去；Pages `/qrcode`「配色与状态」未绑 `@refresh`/`onRefresh`，点击无效果。无下载 API。
- **QRCode** · 双端 · 过期/加载遮罩 `bg-white/80`，loading 文案 `text-gray-500` 硬编码，不跟 token。
- **Image** · Vue · `lazy` 时 `watch(src)` 直接 return，已进入视口后改 `src` 不换图。React observer deps 含 `src` 会重绑。`Image.ts:154-162` vs `Image.tsx:115-128`。
- **Image** · 双端 · `fallbackSrc` 自己也失败时 `error && fallbackSrc` 仍走 `<img>`，看不到错误占位。
- **ImageViewer** · 双端 · 不 Teleport、不锁 `body` overflow（ImagePreview 两者都做）；翻页 `% length` 循环，ImagePreview 到头 `disabled`。
- **ImageCropper** · 双端 · Pages 示例只展示框选，无确认/预览/`getCropResult()`；`outputType` 示例看不出 JPEG vs PNG 差异。

- **Input** · 双端 · 错误态仍用 Tailwind `text-red-900` 而非 `--tiger-error`；clear/password `tabIndex={-1}` 键盘不可达；Vue 无 `defaultValue`（React 有）。
- **InputNumber** · 双端 · `readonly` 时步进钮仍显可点（`handleStep` 空操作）；状态边框 `border-red-500` 非 token；不读 FormItem status。
- **InputGroupAddon** · 双端 · Vue `type` vs React `addonType` 公开 API 不一致且渲染未读；组外 Addon `compact ?? true`。
- **Textarea** · 双端 · 无 `status`/`errorMessage`/FormItem；字数 `text-gray-500`；Vue 无 `defaultValue`；React `...props` 可盖掉内部 `onChange`。
- **Checkbox / CheckboxGroup** · 双端 · indeterminate 只设 DOM `.indeterminate`，无 `aria-checked="mixed"`；Group 普通 `div` 无 `role="group"`；Vue `modelValue`/`defaultValue` vs React `checked`/`defaultChecked`。
- **Radio** · 双端 · Vue `modelValue` vs React `checked`；group `name` 用 `Date.now()+Math.random()` SSR 不安全；无 roving tabindex（每个 radio 可 Tab）。
- **Slider** · 双端 · 无 pointer capture（轻于 Signature）；marks `top-full` 紧布局易裁；`range`+标量只一枚拇指；Vue 把 `aria-label` 也抄到外层 div。
- **Stepper** · 双端 · 输入非 spinbutton、无方向键；Vue 用原生 `change`(blur) 导致输入中被 `modelValue` 冲掉（React 按键更新）；`--tiger-fill` 未注册；硬编码 `aria-label="Stepper"`。
- **InputOTP** · Vue · FormItem：`status !== 'default'` 时显式 `default` 仍继承错误（React `??` 显式 default 胜出）；错误格 `text-red-900`。
- **TagsInput** · 双端 · `id` 在容器、字段为 `${id}-input`（与类型「id 在 input」不符，`htmlFor` 会聚焦 div）；Vue FormItem 同 OTP；hidden 拼接固定 `,` 不顾 `delimiters`。
- **MaskInput** · 双端 · 同 Input 的字段内错误文案；Vue FormItem `default` quirk；不继承 InputGroup size。
- **NumberKeyboard** · 双端 · 键面 `--tiger-fill` 未注册；纯点击无物理键盘/roving；phone 布局有隐藏 Empty 键占位。
- **Signature** · 双端 · Vue `modelValue` 仅 `''` 清空、不能灌入 data URL；React 无 value；Backspace/Delete 焦点在垫上会整板清空；JPEG/WebP 无 `backgroundColor` 透明变黑。
- **ColorSwatch** · 双端 · 选中角标 `bg-white/90`；按钮 `aria-disabled` 无原生 `disabled`；组标题 `'Primary'`/`'Accent'` 未 i18n；跨组 ArrowDown 按扁平 index。

- **DatePicker / TimePicker / Cascader** · 双端 · Pages sandbox · 日历/时间列/级联列高于 demo iframe（`minHeight` 120 + 壳 `overflow-hidden`）；绝对定位弹层不撑 `scrollHeight`。Pages `/datepicker` 点开后触发器有焦点、日历看不见。Select 三项短列表能看见。建议：预览类 demo 加高 viewport，或打开时通知父页撑 iframe。
- **Cascader** · 双端 · `layout: 'fullscreen-sm'` 无 Select 那种 `md:hidden` Done；窄屏面板盖住触发器，点外关不掉，只能选叶子。源码：Cascader overlay vs `selectDoneActionClasses`。
- **Cascader / TreeSelect** · 双端 · 键盘只能开关，不能选值；非虚拟列表无 Arrow/Enter。清空钮嵌在 trigger `<button>` 里（Select 已改成兄弟按钮）。源码：`getPickerTriggerKeyAction`；Cascader/TreeSelect 触发器。
- **ColorPicker** · 双端 · 无饱和度/明度画布，只能拧 hue + 打字；`--tiger-text-muted` 标签。
- **DatePicker** · 双端 · `parseDate` 对 `YYYY-MM-DD` 走 `new Date(string)`（UTC 午夜），西时区会少一天。示例 03 `min-date="new Date('2026-01-01')"`。源码：`date-utils.ts:12-18`。
- **Mentions** · Vue · `handleInput` 用**旧** `filteredOptions.length` 决定是否更新 query；滤空后回删可能不再打开。React 用 `options.length` 并始终 `setQuery`。源码：`Mentions.ts:69-78`。
- **Upload** · 双端 · `drag` 忽略默认 slot（示例 02 中文文案看不见，走 locale「Click to upload…」）；`file.progress` 有值不画条；硬编码 `bg-white`/`border-gray-300`。
- **FormItem** · 双端 · `errorDisplayMode` `block`/`popup` 用 `bg-red-50`/`bg-red-600` 非 token；Form 的 `inlineMessage` 未被 FormItem 读取。Vue `required` Boolean 省略即 `false`，`!== undefined` 使规则里的 `required` 撑不出星号（同 W3 Radio）。
- **AutoComplete / TreeSelect** · 双端 · 暗 · 选中行 fallback 未注册 `--tiger-outline-bg-active,#dbeafe`，暗表面上是浅蓝色条。Select/Cascader 已走 `--tiger-outline-bg-hover`。
- **W4 muted token** · 双端 · 暗 · 占位/空态/Cron 字段底继续打未注册 `--tiger-text-muted` / `--tiger-fill`（W3 已记跨切）。下拉面板本身走 `--tiger-surface`，Select 暗色触发器可读。见 W7/W8/W9/W11 muted；§5 T1。

- **Message** · 双端 · 暗 · info/success/warning/error 锁未注册 `--tiger-message-*-bg` 浅色 fallback（success 实测 `rgb(240,253,244)` / `#166534`）。Pages `/message` 暗色「保存成功」是浅薄荷条，像亮色 toast 贴在暗页上（对比尚可，6.8:1）。loading 反而走 surface。建议：bg 跟 `--tiger-surface`，字跟 status/`--tiger-text`；或把 message token 写入 theme。
- **W5 overlay sandbox** · 双端 · Pages · demo iframe 默认 180px + 壳 `overflow-hidden`；Modal/Drawer/Tour/Loading 全屏/LoadingBar/Message/Notification 都 `fixed` 相对 iframe。Modal 实测对话框 190px 高被裁 10px+；LoadingBar 贴在卡片顶而不是站点顶。同源 W2/W4 sandbox。建议：弹层类 demo 加高 viewport，或打开时撑 iframe。见 W7 overlay、W11 CropUpload；§5 T5。
- **Loading 区域遮罩** · 双端 · 暗 · 示例 02 用 `bg-white/85 dark:bg-gray-950/85` 自组叠层；sandbox 里 `dark:` 未生效，暗页上仍是浅灰白垫。Pages `/loading`「区域加载」。
- **Message / Notification** · 双端 · 无 hover 暂停、无 `maxCount`；`setTimeout` 一到就关。连点会无限堆。源码：Vue/React `Message.ts(x)` / `Notification.ts(x)` `add*`。
- **MessageContainer / NotificationContainer** · Vue 声明式容器无条件 `Teleport to body`；React 不 portal、只靠 `fixed`。示例 05 在 Vue 会飞出预览盒。Vue `TransitionGroup name="message|notification"` 仓库无对应 CSS。
- **Progress** · 双端 · `stripedAnimation` 用 `animate-[progress-stripes_…]`，仓库无 `@keyframes progress-stripes`（静态高光可见、不流动）。示例 02 标题「仪表盘」实际是满圆 `type="circle"`，类型无 dashboard。
- **Tour** · 双端 · 有 target 时 spotlight `pointer-events:none`，点遮罩关不掉（无 target 的 fallback mask 才 `onClick: close`）；定位按写死 320×160。Vue 最后一步只 `finish`+`update:open`，React 还调 `onClose`。dialog 无 `aria-labelledby`。Esc 在 Pages 可关。
- **Modal / Drawer** · Vue · `watch(open)` 无 `immediate`：挂载即 `open=true` 不聚焦、不记 restore。React `useEffect` 会跑。Pages 示例都是点开，所以 demo 正常。
- **Popconfirm** · 双端 · `okText`/`cancelText`/`title` 默认中文硬编码，不走 locale（Modal 默认脚会走）。Lang=English 时仍是「取消/删除」。
- **Tooltip / Popover(hover)** · 双端 · 无 delay；内容 Teleport 后 trigger `mouseleave` 立即关，指针到不了浮层。click 型 Popover Pages 正常，Esc 可关。
- **Modal** · 双端 · `mask={false}` 时点击仍绑在居中容器上，空白处照关（Drawer 点的是 mask 节点，无 mask 不关）；根上 `hidden={!open}` 同帧切掉，进出场 transition 播不出来。

- **Splitter gutter** · 双端 · 暗 · `bg-gray-200` / 把手 `bg-gray-400` 硬编码；暗页 gutter 实测仍是浅灰 `oklch(0.928…)`。源码：`splitter-utils.ts:18-32`。
- **Layout `min-h-screen`** · 双端 · Pages · 根永远 `flex-col min-h-screen`。`/layout`「基础布局」iframe 被撑到 `maxHeight` 720，中间一块巨大白/浅 Content。嵌套 Layout 也会要整屏高。源码：`layout-utils.ts:10`。
- **Descriptions vertical** · 双端 · `layout="vertical"` 不走 `groupItemsIntoRows`，忽略 `column`/`span`；`bordered` 时每项仍是一行 `th+td`（左右排，不是上标签下内容）。示例 02 写了 `column={2}` `span: 2`。源码：Vue `Descriptions.ts:241-296`；React 同构。
- **Carousel infinite wrap** · 双端 · `infinite` 只绕 index；scroll 轨道 `translateX(-n*100%)`，最后一张到第一张会整条倒带。Pages `/carousel`「编程控制」是 scroll。fade 例无此问题。源码：`carousel-utils.ts:246-248`。
- **Skeleton `wave` / Vue 示例 `animated`** · 双端 · `animation="wave"` 只是 `animate-pulse` + 静态 200% 渐变，没有 `background-position` 关键帧。Vue `skeleton/01` 写不存在的 `animated`（默认 pulse）；React 同例 `animation="wave"`（看起来仍是 pulse）。
- **Splitter 受控 sizes / `gutterSize`** · 双端 · `sizes` 文档写 initial，实现每次 props 变化（React 含 `children`）都覆盖拖拽结果；`gutterSize` 只进均分算术，视觉宽度锁 `var(--tiger-splitter-gutter,4px)` 且从未赋值。
- **Vue Space `inheritAttrs`** · Vue · 默认 inherit 又手动 `...attrs`，原生 listener 会触发两次。Container/Card 已 `inheritAttrs: false`。
- **List 分页拖拽** · 双端 · `draggable` 用渲染下标 splice 全量 `dataSource`；翻页后拖第 0 项会动到整表第 0 项。Pages 无拖拽例。
- **Layout 无 sider 行** · 双端 · Sidebar+Content 作 Layout 直接子节点会纵向堆。Pages `/layout`「折叠侧栏」自己包了 `flex flex-1` 所以 demo 正常。源码：`layoutRootClasses`。

- **Menu `theme="light"`** · 双端 · 暗 · 默认把 `--tiger-surface` 写成 `#ffffff`，不跟 `html.dark`。Pages `/menu` 01/03 暗色仍是白菜单；02 显式 `theme="dark"` 才跟。源码：`menu-utils.ts:31-38`。
- **Pagination 文案** · 双端 · Lang=English 时「共 240 条」+ `Go to` / `20 / page` 中英混排；`showTotal` 无 locale 时走硬编码 `共 ${total} 条`。源码：`defaultTotalText`；`Pagination.tsx:258-264`。
- **W7 overlay sandbox** · 双端 · Pages · Spotlight `fixed inset-0`、Dropdown/ContextMenu/NavMenu 弹层在约 180px iframe + `overflow-hidden`；`ResizeObserver` 不读 `fixed`。Pages `/spotlight` 点开后困在卡片里。同源 W2/W4/W5。见 §5 T5。
- **BackTop** · 双端 · 隐藏态 `opacity-0 pointer-events-none` 仍在 Tab 序，Enter 会滚；默认 `aria-label="Back to top"`。Pages 路由是 `/backtop`（`/back-top` 空页）。源码：`back-top-utils.ts:137-142`。
- **ContextMenu** · 双端 · 触发面无 tabindex，示例虚线盒键盘打不开；`ContextMenuSub` 把 click `preventDefault`，触屏开不了「分享到」。源码：Vue `ContextMenu.ts:381-384`。
- **NavigationMenu mega** · 双端 · 面板 `role="group"` 无 `menu` 祖先却有 `menuitem`；`min-w-[28rem]!` 在窄 iframe 易裁。源码：`navigation-menu-utils.ts:226-231`。
- **W7 muted token** · 双端 · 暗 · Breadcrumb/PageHeader/Tabs/Anchor/ScrollSpy 继续打未注册 `--tiger-text-muted`（W3 跨切）。见 §5 T1。
- **Anchor / ScrollSpy 示例** · 双端 · 暗 · `bg-blue-50`/`bg-green-50` 叠浅字；`bounds` 死 API；AnchorLink 无 `aria-current`；`anchor-01` 默认 `window` + auto iframe 不滚动。
- **FloatButton Vue `aria-label`** · Vue · 模板 `aria-label` 被后写的 `tooltip` 盖掉。示例 01 `aria-label="打开操作组" tooltip="操作"` 运行时是「操作」。React `{...props}` 在后，原生 aria 胜出。
- **Menu 弹出子菜单键盘** · 双端 · 水平/折叠 popup 打开后不 `focusFirstChildItem`，方向键走兄弟项。`popupPortal` 默认 false，易被 overflow 裁。
- **Tabs overflow / centered** · 双端 · 无 `overflow-x-auto`；`type="line"` 的 `centered` 被 1fr 网格抵消。
- **Tree `showIcon` / 展开初始化** · 双端 · `showIcon` 文档写展开图标，实现只控 `node.icon`；Vue `watch(treeData)` 会重置展开，React `defaultExpandAll` 只在 mount。
- **Steps 可点范围 / Vue `v-for`** · 双端/Vue · `clickable` 只有 title `<button>`，圆点点不了；Vue 不 flatten Fragment，`v-for` 时所有步 `stepIndex=0`（Pages 示例是静态子节点，demo 正常）。
- **Spotlight `disableTeleport`** · React 无（Vue 有）；空结果时 `aria-controls` 仍指向未渲染 listbox。

- **W8 muted token** · 双端 · 暗 · Calendar 星期/翻页、Countdown 标题/suffix、Table 表头、Timeline 时间标签继续打未注册 `--tiger-text-muted,#6b7280`（W3 跨切）。Pages `/calendar` 暗色 weekday 实测 `rgb(107,114,128)`；`/table` 表头同色，单元格已走 `--tiger-text` `rgb(249,250,251)`。建议：alias 到 `--tiger-text-secondary`。见 §5 T1。
- **Table 筛选/排序/锁定硬编码灰** · 双端 · 暗 · 筛选 `<input>`/`<select>` `border-gray-300`；未激活排序 `text-gray-400`；锁定钮 `text-gray-400 hover:text-gray-700`。Pages `/table`「排序与筛选」暗色输入框浅灰边。源码：Vue/React `Table/render-header`；`getSortIconClasses`。
- **Table 示例状态芯片** · 双端 · 暗 · 示例 03 `bg-green-50 text-green-700` / `bg-gray-100`，暗页仍是浅薄荷/浅灰胶囊。Pages `/table`「自定义单元格」。建议：示例改 token 或 Tag。
- **Collapse 折叠内容仍在 a11y 树 / extra 点击会切换** · 双端 · 亮/暗 · 关闭只靠 `max-height:0`，无 `inert`/`aria-hidden`/`aria-controls`；`extra` 在 `role="button"` 头里，点「已更新」也会折。Pages `/collapse` 01 手风琴可切、03 点 extra 会关。源码：Vue/React `CollapsePanel`。建议：折叠 `inert`+`aria-hidden`；extra `stopPropagation`。
- **Timeline alternate `position:left` 在右侧** · 双端 · 亮/暗 · 偶数项 `flex-row-reverse`，内容盒靠右（Pages `/timeline` 01 首项 `contentX=814`、轴 `headX=474`）。`left` 名与视觉相反；内容无 `w-1/2`，不是对半分栏。源码：`timeline-utils.ts` `getTimelineItemClasses`。建议：两列 50% + 轴居中，`left` 放左边。
- **Calendar 年视图全屏月份被拉宽；键盘 `parseDate` UTC** · 双端 · 亮/暗 · `fullscreen` 年视图月份钮随 `w-full` 被拉到约 127–292px 宽条。方向键用 `parseDate('yyyy-MM-dd')` → `new Date(string)` UTC 午夜，西时区会错日（W4 DatePicker 同源）。源码：`calendar-utils.ts` `getCalendarContainerClasses`；`date-utils.ts` `parseDate`；Vue/React `moveDayFocus`。
- **Calendar 受控视图不跟 value** · 双端 · `viewMonth` 只在 mount 初始化；点上月灰色日会改 `v-model` 但格子停在本月。源码：Vue `Calendar.ts:61-62`；React `useState` 同。
- **Table `dataKey` 排序/筛选读错字段** · 双端 · 单元格/导出用 `dataKey || key`，`sortData`/`filterTableData` 只用 `column.key`。Pages 示例 key 与字段同名所以看不出。源码：`table-utils.ts` `sortData`/`filterTableData`。
- **Table 排序表头不可键盘** · 双端 · `aria-sort` 在 `<th onClick>` 上，无 button/tabIndex。Pages `/table` 02 鼠标点「姓名/年龄」可用（desc 王强→李娜→张伟；年龄 28/32/41）。
- **Table `exportable` 假 Excel vs DataExport 真 xlsx** · 双端 · Table excel 是 HTML `.xls`；DataExport 是 OOXML zip。Pages `/data-export` 下拉 Export Excel / Markdown，点完文案「最近导出：xlsx」。源码：`table-export-utils.ts` vs `data-export-utils.ts`。
- **Countdown 已过期目标不停 timer** · 双端 · `value` 已过仍 `setInterval`，不 `finish`、每秒 `change(remaining:0)`。Pages `/countdown` 未来时刻走得动（10s 例 `00:00:07→06`；26h 例 `1 天 01:59:ss`）。源码：Vue `setupTimer`/`tick`；React `useEffect` interval。
- **Table 筛选控件不绑定 `filters`** · 双端 · header input/select 只写 onInput，受控 `filters` 回显空白。源码：Vue/React `render-header`。

- **Gantt 不能拖拽；暗色斑马浅底** · 双端 · 亮/暗 · 条只有 click/hover/select，拖完 `x` 不变。Pages `/gantt` 拖「需求调研」条位置不动。暗色偶数行 `fill-[var(--tiger-fill,#f9fafb)]`、轴文 `--tiger-text-muted,#6b7280`（W3 跨切）。源码：Vue/React `Gantt.ts(x)`；`gantt-utils.ts` 64–73。建议：要拖就接线日期；行底改 `surface-muted`，轴改 `text-secondary`。
- **图例点击是选中不是开关系列** · 双端 · `handleLegendClick` → `handleClick` 高亮一项、其余半透明，不能隐藏系列。`aria-pressed` 像开关。Pages `/bar-chart` 点 Mon 后其余 opacity 0.5，再点不会从数据里拿掉。源码：`useChartInteraction`；`ChartLegend`。
- **Radar 分割区亮色盘** · 双端 · 暗 · `RADAR_SPLIT_AREA_COLORS` `rgba(0,0,0,0.02/0.05)` + 挖洞 `--tiger-bg,#ffffff`。Pages `/radar-chart` 暗色五边形里是一块浅薄荷/白盘。源码：`chart/color.ts`；Vue/React `RadarChart` splitArea。
- **`showTooltip` 默认 true 但默认 `hoverable=false`** · 双端 · 不设 hoverable 就从不挂/从不打开 tooltip。Pages `/bar-chart` 02、`/heatmap-chart` 02 文案写提示，悬停无框；01 有 `hoverable` 才出现 `Mon: 120`。源码：各图 `showTooltip && hoverable`。
- **Funnel `direction` / Heatmap `colors` / Gauge `colors` 死 API** · 双端 · 类型有 `direction: 'horizontal'`，`computeFunnelSegments` 只做纵向；React 写成 `_direction`。Heatmap/Gauge 的 `colors` 未读。Pages 示例没用 horizontal。源码：`funnel-chart-utils.ts`；`FunnelChart.tsx:37`。
- **TreeMap 丢掉父节点** · 双端 · `flattenData` 只留叶子，「前端/后端」不占格。Pages `/treemap-chart` 是 Vue/React/运维/Node/Go 五块，没有「前端」。源码：`treemap-chart-utils.ts` 32–47。
- **`responsive` 只拉 SVG 不重算尺度** · 双端 · ChartCanvas 观察父级改 `width/height/viewBox`，Bar/Line 仍用 **prop** 算 scale。Pages `/bar-chart` 01 `responsive`，iframe 内 SVG 实测约 926×688，柱子仍按 420×240 画在左上，预览被撑出大块空白。源码：`ChartCanvas`；`BarChart` innerRect 用 props。
- **Heatmap 浅格数字 / canvas `var()`** · 双端 · 格内 `fill-[var(--tiger-text)]`，低值浅黄格上近白字；canvas 模式 `fillStyle='var(--tiger-text)'` 画不出来。示例 01 走 SVG。`tooltipFormatter` Vue 声明了不传入。源码：`HeatmapChart.ts` 97–101, 168；`heatmap-chart-utils.ts` hex 插值。
- **W9 muted / 未注册 token** · 双端 · 暗 · Gantt 轴、OrgChart 职称继续打 `--tiger-text-muted`；tooltip 用未注册 `--tiger-bg-elevated/#1f2937`（碰巧深底浅字，Pages 亮色 `Mon: 120` 可读）。W3 跨切。见 §5 T1。

- **PrintLayout 屏上页眉页脚是 `hidden print:block`** · 双端 · 亮/暗 · 示例 `show-header`/`show-footer`，计算样式 `display:none`。亮色能看见「第一页 / Page Break / 第二页」；暗色只剩分页虚线（字是浅的）。源码：`printLayoutHeaderClasses` / `printLayoutFooterClasses`。建议：屏幕预览用可见页眉，或示例标明仅打印。
- **RichText 默认工具栏英文长标签换行；Link 走 `window.prompt`** · 双端 · Pages `/rich-text-editor` 16 个英文钮，`Clear` 掉到第二行。`codeBlock`/`link`/`image` 用 `execCommand` + `'Enter URL:'`。源码：`defaultToolbar`；`rich-text-engine.ts` `promptForRichTextUrl`。
- **CodeEditor 高亮层不跟 textarea 滚；`theme` 不跟页面** · 双端 · textarea 与 highlight 各自 `overflow-auto`，无 `onScroll` 同步。`theme` 是 light/dark 硬编码灰底，不读 `--tiger-surface`。示例 01 锁 `theme="dark"` 所以暗页碰巧可读。源码：`code-editor-utils.ts`；Vue/React `CodeEditor`。
- **FileManager 嵌套 `update:files` 只交当前层** · 双端 · `handleDrop` 把 `processedItems`（当前目录）整树替换发出。根目录还好，进子文件夹会丢掉上层。示例默认 `draggable=false`。源码：Vue `FileManager.ts:126-141`；React 同构。
- **VirtualTable 无 checkbox 列，选中 5% 几乎看不见** · 双端 · `rowSelection` 靠点行 toggle，不画勾选列；`virtualTableRowSelectedClasses` 是 `primary/5`。Pages `/virtual-table` 01 `defaultSelectedRowKeys:[2]`，第 2 行看不出选中。滚动虚拟化正常（滚到「用户 41」）。源码：Vue `VirtualTable.ts:250-254`；`virtual-table-utils.ts`。
- **ImageAnnotation 画布依赖外链图尺寸** · 双端 · 示例 `picsum.photos`；图没加载时 overlay 宽高 0，矩形小于 `minSize` 不提交。暗色工具钮见本组 P1。源码：`ImageAnnotation.ts` `displayWidth`；`shouldCommitImageAnnotationBox`。
- **InfiniteScroll 横向 sentinel 0×0** · 双端 · sentinel 写死 `height:0`，横向没有宽度。竖向 Pages 滚到底能从 10 条加载到 30 并出现「没有更多数据了」。源码：Vue `InfiniteScroll.ts:118-124`。

- **W11 muted token** · 双端 · 暗 · Chat 名/时间/「已送达」、Comment 操作/职称、Activity 时间、Notification 时间/已读摘要、TaskBoard 空列/「新增任务」继续打未注册 `--tiger-text-muted,#6b7280`（W3 跨切）。Pages 暗色容器已走 `--tiger-surface`，灰字仍可读，不像 W10 `--tiger-bg` 白底浅字。建议：alias 到 `--tiger-text-secondary`。见 §5 T1。
- **Chat / Comment / Activity / Notification 默认文案不走 locale** · 双端 · Chat `发送`/`暂无消息`/`已送达`、Comment `点赞`/`▾ 收起回复`/`▸ 展开 n 条回复`、Activity `暂无动态`、Notification `通知中心`/`全部标记已读` 硬编码中文。FormWizard / TaskBoard / CropUpload 已走 locale——Pages Lang=English 时 CropUpload 是 `Select image`，Chat 仍是「发送」。源码：`chat-window-utils.ts` `defaultChatMessageStatusInfo`；Vue/React ChatWindow/CommentThread/ActivityFeed/NotificationCenter 默认 props。建议：补 locale 块或至少让 expand/status 走 `labels`。
- **FormWizard `skipCondition` 点步骤不跳过** · 双端 · Next/Prev 走 `findNextUnskippedStep`；`handleStepChange` 只拦 `disabled`。`clickable` + 示例 02 取消「配置团队」后仍能点到「团队」。默认 `clickable=false`，Pages 01/02 点「继续」跳步正常。源码：Vue `FormWizard.ts:271-277`；React `FormWizard.tsx:169-178`。
- **NotificationCenter `manageReadState` 在 `items` 引用变化时清 overrides** · 双端 · 父级 `items.map` / 内联新数组后未读点回来。示例 01 用内部态、02 父级持有 `read`，Pages 点「标记已读」会变成「标记未读」。源码：Vue `NotificationCenter.ts:208-213`；React `NotificationCenter.tsx:125-127`。
- **CommentThread 示例 01 点赞不回写** · 双端 · 组件只 `emit('like')` / `onLike`，不改 `nodes`。Pages `/comment-thread` 01「点赞 3」点完仍是 3（回复框能打开）；02 绑了 handler，可到「已赞 9」。同源 W10 FileManager 01。建议：01 补 `@like`，或内部 liked 态。
- **ChatWindow 虚拟行高 88 装不下带时间的气泡** · 双端 · 示例 02 `virtual` + `show-time` + `virtual-item-height=88`，头像/名/泡/状态/时间叠起来会与下一行重叠。源码：示例 `chat-window/02`；组件默认 `virtualItemHeight=88`。
- **DataTableWithToolbar 工具条 `dark:bg-gray-800/*`** · 双端 · 已有 `--tiger-surface-muted` 再叠硬编码 gray。Pages `/data-table-with-toolbar` 暗色搜索「李娜」行过滤正常（3→1）。源码：Vue `DataTableWithToolbar.ts` toolbar 容器；React `386-387`。
- **Vue TaskBoard `onCardAdd` 只决定按钮显隐** · Vue · 点击只 `emit('card-add')`，不调 `props.onCardAdd`。React 调 `onCardAdd?.()`。Pages `/task-board` 01 用的是 `@card-add`，所以 demo 正常。源码：Vue `TaskBoard.ts:502-516` vs React `357`。
- **CropUpload 触发器 `dark:bg-neutral-900`** · 双端 · 绕开 surface token；Pages 暗色虚线盒仍可读。裁剪 Modal `fixed` 困在 sandbox，交叉引用 W5 overlay。源码：`image-utils.ts` `cropUploadTriggerClasses`。
- **TaskBoard 泳道 `collapsed` / 加卡忽略 WIP** · 双端 · 泳道头 `cursor-pointer` 无 toggle；`allowAddCard` 不走 `enforceWipLimit`（拖拽才 enforce）。Pages `/task-board` 01 进行中 WIP 1/2，待办加卡不拦。源码：`kanbanSwimlaneHeaderClasses`；Vue/React 加卡 handler。

### P3

- **Rate** · Vue · 无 `className` prop（仅 `attrs.class`）。
- **Rate** · 双端 · 半星命中仅 LTR；根无 `focus-visible` 环。
- **Watermark** · 双端 · overlay 被删且 data-URL 不变时可能不重建节点。
- **Alert** · 双端 · 自动关闭 `close` 载荷不一致（Vue 假 MouseEvent / React 无参）；关闭钮默认英文 `Close alert`。
- **Statistic** · React · 无 DOM/`aria-*` 透传（Vue 有 attrs）。
- **Icon** · 双端 · 内置 stroke 1.5 vs 自定义默认 2。
- **AvatarGroup** · Vue · slot flatten 未跳过 Comment/文本，极端 `max`/`+N` 偏差。
- **ButtonGroup** · 双端 · `role="group"` 无默认无障碍名，示例也未给 `aria-label`。
- **Tag** · 双端 · 每个 Tag `role="status"`，列表里会变成一串 live region。
- **ImageGroup** · 双端 · `role="group"` 无默认名；Pages 示例也未给 `aria-label`。
- **Image / ImagePreview / ImageViewer** · 双端 · 点击预览 `aria-label="Preview …"`、预览图 `alt="Preview image N"` / `Image N` 不走 locale。
- **ImageCompare** · 双端 · 默认 `aria-label` 英文 `Image comparison`，无 locale 块。
- **ImageCropper** · 双端 · 棋盘格 class `tiger-image-cropper-checkerboard` 的 CSS 只写在 `examples/example/*/src/index.css`，包内无对应样式。
- **QRCode** · 双端 · 矩阵贴边、无 quiet zone；即便换成真 QR 也偏难扫。
- **Demo harness（Image / ImageCropper）** · Vue · 亮/暗 · 部分 demo 块首屏与切主题后会停在「正在准备独立示例…/compiling」空卡片数秒（站点级，W1 已记过同类）。Pages `/image` `/image-cropper`。

- **Checkbox** · 双端 · 在 Group 内单项不发 `change`/`onChange`（只更 group）；未选也用 primary 边框偏抢眼。
- **Switch** · Vue · `{...attrs, onClick}` 覆盖消费者 `onClick`/`onKeydown`（React 有 compose）。
- **Radio** · Vue · `onKeydown` 覆盖 attrs，不转发消费者 handler（React 有 compose）。
- **Input / MaskInput** · 双端 · clear/password 文案硬编码英文；无 `aria-required`；error 时 shake 含首屏。
- **Slider** · 双端 · 无纵向；无 `aria-valuetext`；Vue 无 `inheritAttrs:false`。
- **Stepper** · Vue · 未声明 `className`（测试却期望）；`type="text"` 无 `inputMode`。
- **InputOTP / TagsInput** · 双端 · 错误无 `aria-live`；OTP 无 count describedby。
- **ColorSwatch** · Vue · 无 `className` prop（靠 attrs.class）；无 `defaultValue`。
- **NumberKeyboard** · 双端 · Confirm 不改 value（仅事件）；空值再 delete 仍发事件。

- **Select / TreeSelect** · 双端 · 搜索框（及 Select 移动端 Done）放在 `role="listbox"` 内；Cascader 搜索在 listbox 外。
- **Select / Cascader / TreeSelect** · 双端 · 默认 placeholder 英文（`Select an option` / `Please select`）；示例自己传了中文。
- **ColorPicker** · 双端 · `Pick color` / `Hue` / `Alpha` 硬编码英文；触发器是 `div role="button"`；面板无 `role="dialog"`。
- **DatePicker** · 双端 · `role="grid"` 无 row、gridcell 平铺；触发 input 无 `aria-haspopup`/`aria-expanded`。
- **CronEditor** · 双端 · 只认 5 段；6 段表达式级报错。死代码 `modeOptions[].label` 英文未用（实际走 locale）。
- **Transfer** · 双端 · `description` 可搜不渲染；搜索 placeholder fallback `'Search...'`。
- **Mentions** · 双端 · 无 `aria-activedescendant`；单 `prefix`，不能同时 `@`+`#`。
- **ColorPicker / CronEditor** · Vue · 无 `className` prop（靠 `attrs.class`）；React 有。

- **Loading** · React · 无 `disableTeleport`（Vue 有）；全屏一律 portal 到 body。
- **Message.loading** · 双端 · 调用方传入的 `duration` 被写成 `0`。
- **Message / Notification** · 双端 · 容器 + 条目双重 `aria-live`；LoadingBar trickle 每 200ms 刷 `aria-live`。
- **Tooltip** · 双端 · `whitespace-nowrap` + `max-w-[300px]`，长文会溢出；暗色 bg 与 `--tiger-surface` 同为 `#111827`，靠阴影还能认出来（Pages 暗色「保存当前草稿」仍可读）。
- **Tour / Popconfirm 示例** · 双端 · 暗 · `bg-gray-100` / `text-gray-500`（Tour「结果区域」暗页上是浅灰胶囊）。
- **Vue Tooltip / Popover** · `inheritAttrs:false` 丢 `attrs.style`（Popconfirm 有 merge）。
- **overlay scroll lock** · 双端 · 只设 `overflow:hidden`，无滚动条 gutter 补偿。
- **Modal 默认脚** · 双端 · Pages Lang=English 时 Cancel 走 locale、示例 `ok-text="知道了"` 仍中文。

- **Container 无独立路由** · 双端 · Pages `/container` 空页（h1 空）；demo 挂在 `/layout` 第一块「Container 容器」。`app-config` / `router` 无 `container`。
- **Card `coverAlt`** · 双端 · 默认英文 `'Card cover image'`，不走 locale。
- **Carousel 点指示** · 双端 · `role="tablist"` 但按钮无 `role="tab"` / 方向键；axe 套件关掉了 `aria-required-children`。
- **SplitterPaneConfig** · 双端 · `collapsible` / `collapsed` / `defaultSize` 导出了，没有 Pane 子组件、实现不读。
- **Resizable 手柄** · 双端 · `opacity-0` + 4px 无底色，靠悬停才摸得到；`aria-label="Resize ${pos}"` 英文。Pages 拖 `bottom-right` 可用（300×150 → 354×184）。
- **Grid 断点名** · 双端 · Col 用 `'2xl'`，List/Descriptions/Masonry 用 `'xxl'`。`span: { xxl: 8 }` 无效。
- **Vue Space / Container** · 无 `className` prop（靠 `attrs.class`）；React 有。

- **`/back-top` 无页** · 双端 · 用户路径表写 `back-top`；`app-config` 实际是 `/backtop`。`/back-top` 空页（h1 空）。
- **Dropdown / Breadcrumb / PageHeader 英文 aria** · 双端 · Breadcrumb `aria-label="Breadcrumb"` / 折叠 `Show collapsed breadcrumb items`；PageHeader 返回 `'Back'`；Dropdown 默认 `trigger="hover"` 无键盘打开。
- **DropdownItem.icon / ContextMenuSub.itemKey** · 类型有、两端不渲染或不读。
- **PageHeader 标题是 `div`** · 双端 · 不是 heading。
- **Pagination** · 双端 · 页码钮无方向键 roving；simple 指示不走 `labels.pageIndicatorText`。
- **Tree search 在 `role="tree"` 内** · 双端 · 示例没用 `searchable`；checkbox 未 `tabIndex=-1`。

- **Timeline `pending` 文档 / 缺 `items`** · 双端 · core `TimelineProps` 写 pending 是「pending 态连线」，实现追加「Loading...」`<li>` + `aria-busy`；`items` 不在 core 类型，生成 props 表也没有。
- **Collapse `panelKey` 严格相等 / accordion 不收敛初值** · 双端 · `1` ≠ `"1"`；`accordion` + 多 key 的 `defaultActiveKey` 可同时开到第一次点击。
- **Table `groupBy` 文案 / advanced 列筛** · Vue 组头 `` `${groupBy}: ${key} (n)` ``，React 只有 `${key} (n)`；`filterMode="advanced"` 时列上筛选控件仍显示。
- **Calendar 翻页钮无 focus-visible** · 双端 · `calendarNavButtonClasses` 只有 hover。
- **Timeline pending `border-white`** · 双端 · 暗色脉冲点白圈（Pages `/timeline` 03 实测 `border: rgb(255,255,255)`）。
- **Table Pages 后三块 iframe** · 双端 · 标题有「固定列/加载空态/可展开」，本波滚动等待后仍常停在 5 个 iframe（站点 compiling，W1 已记）。

- **Sunburst 可聚焦不能激活** · 双端 · `selectable` 时弧 `role="button"` + `tabIndex=0`，无 `onKeyDown`。Heatmap/TreeMap 选中无键盘。源码：`SunburstChart.ts(x)`；`HeatmapChart` / `TreeMapChart`。
- **ChartCanvas 默认无 `role="img"`** · 双端 · 只有 Gantt/OrgChart 补了 `aria-label`；Gauge 整卡 `tabIndex` 只为 tooltip。`ChartCanvas.ts(x)`。
- **Vue ChartTooltip SSR `window`** · Vue · `watch(..., { immediate: true })` 读 `window.innerWidth`；React 有 `isBrowser()`。`ChartTooltip.ts:49-54`。
- **Gantt/OrgChart 默认 `aria-label` 英文** · 双端 · `'Gantt chart'` / `'Organization chart'`，不走 locale。
- **Donut 调色板 7–9 槽复用 token 1–3** · 双端 · 主题写入 `--tiger-chart-1` 后第 7 色与第 1 色相同。`DonutChart.ts(x)` `DONUT_PALETTE`。
- **Vue Donut `slice-click` 参数对调** · Vue · Pie 发 `(index, datum)`，Donut 处理函数写成 `(datum, index)` 再原样 emit。Pages 示例未绑事件。`DonutChart.ts:247-291`。

- **FileManager `aria-label="File path"`** · 双端 · 面包屑英文硬编码；Root/Search... 走 locale（Lang=English 时一致）。
- **RTE / Markdown 工具栏按钮字** · 双端 · `defaultToolbar` label 英文 Bold/Italic；Markdown 用 B/I/S/Quote。locale 只覆盖 toolbar `aria-label` 和 Edit/Split/Preview。
- **RTE `Enter URL:` prompt** · 双端 · 不走 locale；sandbox 里 `window.prompt` 体验差。
- **CodeEditor `aria-label="Code editor"`** · 双端 · 不走 locale。
- **useDrag 无键盘排序** · 双端 · 只有 HTML5 `draggable`；`aria-grabbed` / `aria-dropeffect`。Pages 列表能渲染，自动化 DnD 需 CDP interception，未当成失败。

- **DataTableWithToolbar 示例状态单元格是 raw `active`/`paused`** · 双端 · 筛选项 label 是「在岗/暂停」，表体仍写 `paused`。Pages `/data-table-with-toolbar` 01。示例 `data-table-with-toolbar/01`。
- **NotificationCenter 已读筛芯片** · 双端 · `<button>` 无 `type`/`aria-pressed`。Pages 三个芯片视觉切换正常。
- **DataTableWithToolbar `tableClassName`** · React 有、Vue 无（extra attrs 铺到 Table）。
- **CropUpload `getCropResult()` 为 null** · 双端 · 确认钮空操作、Modal 不关、无 error。
- **TaskBoard 键盘拖** · 双端 · Enter/Space 抓起，没有方向键落到目标列；`dragHintText` 比实现宽。
- **Vue `VueFormWizardProps` 漏 `bordered`/`autoSave`** · 运行时有 props，导出接口没有。
- **DataTable 05 自定义工具条 `bg-blue-50`** · 双端 · 示例自写 `dark:bg-blue-950/30`，sandbox `dark:` 常不生效（W1）。源码：`data-table-with-toolbar/05`。

## 4. 按组明细

### W1 Basic (display)

> Pages 实机：Chromium headless 打开 `https://expcat.github.io/Tigercat/{vue,react}/#/<path>`，亮色 + 切 `html.dark`，1440×900，部分 390 宽。对照 `packages/{core,vue,react}` 与 `examples/example/{vue3,react}`（tag `v2.1.0` / `14e7fea7`）。键盘/焦点在 sandbox iframe 内未逐项点测，交互以源码与角色属性为主。Vue/React 示例视觉基本对称。

#### P1

1. **ButtonGroup** · 双端 · 亮/暗
   - 现象：水平组「上一页 / 当前页 / 下一页」与垂直组「上移 / 置顶 / 下移」都是彼此独立的圆角胶囊，没有共享直边、也没有 `-ml-px` 叠缝。`SplitButton` 看起来是连体，是因为它自己写了 `!rounded-r-none` / `!rounded-l-none -ml-px`，不依赖 ButtonGroup。
   - 复现：https://expcat.github.io/Tigercat/vue/#/button 与 react 同源路径 → 锚点「按钮组与尺寸继承」（`examples/.../button/03`）。
   - 源码：`packages/core/src/utils/button-utils.ts:56-63`（`[&:first-child]` 等挂在组根上）；`group-utils.ts:72-78` 把 item 类拼到 group。对照 `input-group-utils.ts` 的 `[&>*:…]`。
   - 建议：改成 InputGroup 子选择器，并给焦点 `z-10`；若被 Button 的 `rounded-[var(--tiger-radius-md)]` 盖掉，用 `!` 或把 attached 类 merge 进子 Button。

2. **Rate** · 双端 · 亮/暗
   - 现象：半星层 `width:50%` + `overflow-hidden`，内部 SVG `w-full h-full`，在半宽盒里被压成窄星，而不是裁出左半星。Pages「只读」`4.5` 第 5 颗明显变瘦。
   - 复现：https://expcat.github.io/Tigercat/vue/#/rate （及 react）→「自定义字符、清除与只读」只读行。
   - 源码：`packages/react/src/components/Rate.tsx:147-159`；`packages/vue/src/components/Rate.ts:149-171`。
   - 建议：裁剪层内星保持满尺寸（固定宽或 `w-[200%]` + `h-full`）。

3. **Avatar** · 双端 · 亮/暗
   - 现象：示例写 `text="TC"`（方块 logo），实现一律 `getInitials`：单段 ASCII 只取首字母 → 页面显示 **T**。
   - 复现：https://expcat.github.io/Tigercat/vue/#/avatar （及 react）→「代表外观」。源：`examples/.../avatar/01`。
   - 源码：`packages/core/src/utils/avatar-utils.ts` `getInitials`；Vue `Avatar.ts` / React `Avatar.tsx` 的 `displayText`。
   - 建议：无空白且长度 ≤2 时原样渲染；或把 prop 分成 `name`（抽 initials）与 `text`（原样）。补测试 `text="TC"` → 可见 `TC`。

4. **Segmented** · 双端 · 暗
   - 现象：暗色下整条轨道是浅灰白底，选中滑块是深色 `--tiger-surface`，未选项深字浅底、选项浅字深底。控件像一张亮色分段器贴在暗页上。
   - 复现：https://expcat.github.io/Tigercat/vue/#/segmented （及 react）切暗色。
   - 源码：`packages/core/src/utils/segmented-utils.ts` `getSegmentedContainerClasses`（`--tiger-segmented-bg` → `--tiger-fill` → `#f3f4f6`）、`getSegmentedIndicatorClasses`（`--tiger-segmented-active-bg` → `--tiger-surface`）。`--tiger-segmented-*` / `--tiger-fill` 均不在 `THEME_CSS_VARS`。
   - 建议：把 segmented token 写入 theme，或轨道 fallback `surface-muted`、指示器 `surface-raised`。

5. **Kbd**（Tag `default` 同源） · 双端 · 暗
   - 现象：Pages `/kbd` 暗色下按键是空白白色圆角块，键名看不见。根因：Kbd `default` 复用 Tag default——bg 锁 `#f3f4f6`，text 走会随暗色变浅的 `--tiger-text`。
   - 复现：https://expcat.github.io/Tigercat/vue/#/kbd （及 react）切暗色，看「行内单键」「组合键」。
   - 源码：`packages/core/src/theme-runtime/colors.ts` `defaultTagThemeColors.default`；`packages/core/src/utils/kbd-utils.ts` `getKbdVariantClasses`。
   - 建议：default Tag/Kbd 的 bg 与 text 成对使用已注册 token（如 `surface-muted` + `text`），或补暗色 `--tiger-tag-*`。

6. **Empty** · 双端 · 亮/暗
   - 现象：「预设一览」2 列网格第 5 张预设卡被 demo 预览固定高度裁切，无滚动（1024/1400 同现）。
   - 复现：https://expcat.github.io/Tigercat/vue/#/empty （及 react 同结构）
   - 建议：预览壳 `overflow-auto` / 按内容增高。

7. **Result** · Vue 确认 · 亮/暗
   - 现象：「状态一览」末行 403/500 被 demo 容器裁半。
   - 复现：https://expcat.github.io/Tigercat/vue/#/result
   - 建议：同 Empty。

#### P2

8. **Rate** · 双端 · 星间移动会闪：`onMouseLeave` 绑在每颗星上，离开一颗即 `hoverValue=0`。建议 leave 只挂根容器。`Rate.tsx:172` / `Rate.ts:185`。
7. **Segmented** · 双端 · `options[].icon?: string` 类型存在，Vue/React 只渲染 `opt.label`。`packages/core/src/types/segmented.ts:14`。渲染 icon 或从公开类型删除。
8. **Watermark** · 双端 · 亮/暗
   - 默认 `watermarkFontDefaults.color = 'rgba(0,0,0,0.15)'`，暗底几乎看不见；Pages 示例改了蓝色但仍铺在浅色 `bg-gray-50` 画布上，暗色站点下这块画布仍是浅的。
   - 复现：https://expcat.github.io/Tigercat/vue/#/watermark （及 react）切暗色。
   - 源码：`watermark-utils.ts:24-28`；`examples/.../watermark/01`。
   - 建议：颜色走 CSS 变量；示例内层改 token 背景；确认 playground 沙箱对 `html.dark` 会重建并启用 `dark:`。
9. **Alert** · 双端 · 暗 · `--tiger-alert-*` 未接入 ThemeManager，暗页上警告/成功条仍是浅黄/浅绿卡片（内部对比尚可，但不跟主题）。Pages `/alert`。`defaultAlertThemeColors`。
10. **Alert** · 双端 · 倒计时条 `absolute bottom-0`，`alertBaseClasses` 无 `relative`，条会定位到最近 positioned 祖先。Pages `/alert` 示例 04 `duration` + `showCountdown`。建议根加 `relative overflow-hidden`。
11. **Alert** · Vue · `duration`/`showCountdown` 只在 `onMounted` 设 timer；React effect 还把 `onClose` 放进 deps，内联回调会重置倒计时。`Alert.ts:191-207` / React `Alert.tsx`。建议逻辑下沉 core。
12. **Badge** · 双端 · `badgePositionClasses` 仅 `-top-1` 等 4px，数字角标大部分压在按钮上（Pages `/badge`「包裹与定位」的「消息」+ `5`）。无 `z-index`。建议 `translate(50%,-50%)` + `z-10`。
13. **Avatar** · 双端 · `imageError` 不随 `src` 复位；playground 把坏图改成好图仍走文字。Vue `Avatar.ts` / React `Avatar.tsx`。
14. **AvatarGroup** · 双端 · 暗 · overflow `+1` 使用 `--tiger-avatar-bg,#e5e7eb`（未注册），暗色叠在照片上对比刺眼。Pages `/avatar` AvatarGroup。
15. **Code** · 双端 · 默认文案中文「复制/已复制」；Pages iframe `sandbox="allow-scripts allow-forms"` 无 same-origin，clipboard 常失败且按钮保持原样。`Code` 默认 props + `getSandboxAttribute`。

#### P3

16. **Rate** · Vue · 缺 `className` prop。半星 hit-test 仅 `clientX - left`（RTL 反了）。根无 focus ring。
17. **Watermark** · 双端 · MutationObserver 只 `render()` canvas；若 overlay 节点被摘掉且 data-URL 不变，可能不重建 overlay。
18. **Alert** · 双端 · 自动关闭 Vue `emit('close', new MouseEvent('click'))`、React `onClose()` 无参；`closeAriaLabel` 默认 `'Close alert'`，不走 locale。
19. **Statistic** · React · 不透传 `...rest`/`aria-*`（Vue `inheritAttrs` + spread）。`Statistic.tsx:17-71` vs `Statistic.ts:80-89`。
20. **Icon** · 双端 · 内置 glyph `stroke-width: 1.5`，自定义 SVG 默认 `iconSvgDefaultStrokeWidth = 2`。
21. **AvatarGroup** · Vue · `slots.default` 一层 flatten，Comment/文本会计入 `max`。对照 SplitButton 的 `flattenVNodes`。React `Children.toArray` 无此问题。
22. **ButtonGroup** · 双端 · 测试 a11y 用例专门加了 `aria-label`，Pages 示例没有；不像 AvatarGroup 有默认名。
23. **Tag** · 双端 · 每个实例 `role="status"`，可关闭列表会变成多个 live region。

#### 本波次无明显问题

Marquee（循环、反向、纵向、pause/reduced-motion 注入看起来健全）、SplitButton（连体靠自身 `!rounded-*`，暗亮正常）、Divider、Highlight、Link（primary）、Statistic（视觉）、Text（非 muted）、Icon（除 stroke 不一致）、Button 单颗（loading / 点击计数对称）。Badge 计数/`max`/`9+` 与 `NEW` 文本徽章双端一致。React 与 Vue 示例页结构、文案、暗色行为对称。

未发现页面级横向溢出（1440 与 390 抽样）。W1 无 P0。另：示例站 Lang 显示 English 但文案仍中文（P2 站点级）；demo runner 首屏常闪 loading/idle（P2 站点级）；纵向 Marquee 顶底裁切无淡出（P3）；Divider 实线/渐变在亮色极淡（P3）。

#### Pages 视觉摘记

| 页 | 亮色 | 暗色 |
| --- | --- | --- |
| `/button` 按钮组 | 独立胶囊，P1 | 同左 |
| `/rate` 只读 4.5 | 半星压扁，P1 | 同左 |
| `/avatar` 代表外观 | 显示 T 而非 TC，P1 | 同左 |
| `/segmented` | 正常 | 白轨 + 深滑块，P1 |
| `/kbd` | 正常 | 空白白块，P1 |
| `/alert` | 正常 | 浅色粉彩卡片，P2 |
| `/tag` primary | 正常 | 浅底芯片，尚可读 |
| `/watermark` | 水印可见 | 示例画布仍浅底，P2 |
| `/badge` 包裹 | 角标贴在按钮角上，P2 | 同左 |
| `/code` `/statistic` | 正常 | 跟主题 |
| `/empty` 预设一览 | 第 5 卡被固定高度裁切，P1 | 同左 |
| `/result` 状态一览 | 403/500 行被裁切，P1 | 同左 |

### W2 Basic (media)

> Pages 实机：Chromium + Playwright 打开 `https://expcat.github.io/Tigercat/{vue,react}/#/<path>`，亮色 + `html.dark`（sandbox MutationObserver 会重建），1440×900，390 宽抽样。对照 `packages/{core,vue,react}` 与 `examples/example/{vue3,react}`。交互点进 iframe（`srcdoc` + sandbox，需用 Playwright frame，不能 `contentDocument`）。Vue/React 示例结构、文案、暗色行为对称。ImageCropper / ImageViewer 属 W10，本组按 Pages 导航顺带看。

#### P1

1. **QRCode** · 双端 · 亮/暗
   - 现象：组件画出带三个定位块的点阵，但不是可扫描 QR。`level` 写入类型/示例（L/M/Q/H），实现完全忽略——Pages 上四枚 96px 码模块布局相同。源码注释写明「simplified … display purposes / hash-based pseudo QR」。无下载。
   - 复现：https://expcat.github.io/Tigercat/vue/#/qrcode （及 react）→「尺寸与纠错级别」`level=L|M|Q|H`；「代表配置」`level="H"`。Playwright 对四枚 `svg[role=img]` 模块串哈希均为 `5696` / 181 个 rect。
   - 源码：`packages/core/src/utils/qrcode-utils.ts` `generateQRMatrix(value, size=21)` 不接收 level；`packages/react/src/components/QRCode.tsx` `level: _level = 'M'`；Vue `QRCode.ts` prop 存在但 `generateQRMatrix(props.value)`。示例 `examples/.../qrcode/01-02` 与 `demo.json` 声称「四档纠错能力」。
   - 建议：换成标准 QR 编码器并让 level 改变 ECC；或从公开 props/文档/示例删除 `level`，标明装饰用。需要下载就暴露 canvas/svg + `download`。

2. **ImagePreview** · 双端 · 亮/暗
   - 现象：`maskClosable`（默认 true）点暗色遮罩关不掉，只能点关闭钮。wrapper 上 `e.target === e.currentTarget`，但 `fixed inset-0` 的 mask 是第一个子节点，点击落在 mask 上。
   - 复现：https://expcat.github.io/Tigercat/vue/#/image （及 react）→ ImageGroup 点缩略图，或 ImagePreview「打开图片预览」后点图片两侧暗区。Playwright：`maskStillOpen` / `standaloneMask` 仍为 1。
   - 源码：Vue `ImagePreview.ts` `handleMaskClick` + 子节点 mask；React `ImagePreview.tsx` 同结构。对照 ImageViewer 把 backdrop 当 dialog 根，点空白可关。
   - 建议：监听 mask 的 click，或去掉独立 mask、把背景铺在 dialog 根上。

3. **ImageViewer** · 双端 · 亮（暗色对比尚可）
   - 现象：工具条和左右圆形导航背景是 `--tiger-surface`（亮色主题为白），按钮 `text-white` → 白底白图标。Pages 上两侧是空白圆，照片中下部一条白胶囊，放大/旋转/计数都看不见。关闭钮在暗遮罩上仍可见。
   - 复现：https://expcat.github.io/Tigercat/vue/#/image-viewer （及 react）点「查看图片」。计算样式 `toolbarBg: rgb(255,255,255)`，Prev/Next `bg: rgb(255,255,255)` + `color: rgb(255,255,255)`。
   - 源码：`packages/core/src/utils/image-viewer-utils.ts` `imageViewerToolbarClasses` / `imageViewerNavBtnClasses` / `imageViewerCounterClasses`。ImagePreview 用未注册 `--tiger-image-toolbar-bg, rgba(0,0,0,0.6)`，所以预览条是深色半透明、白图标可读。
   - 建议：工具条/导航/计数不要绑 `--tiger-surface`；与 ImagePreview 共用深色半透明 token。

4. **ImagePreview / ImageViewer** · 双端 · Pages sandbox
   - 现象：预览 `fixed inset-0` 相对 iframe，不是整页。ImageGroup / ImagePreview 示例 iframe 约 180px 高且外层 `overflow-hidden`，600×400 / 800×600 图被裁成一条；ImagePreview 还 `max-w-none` 无 `max-h`。ImageViewer 示例同样 180px，打开后只见一条遮罩+残图+白工具条。`fixed` 不撑高 sandbox ResizeObserver。
   - 复现：https://expcat.github.io/Tigercat/vue/#/image ImageGroup / ImagePreview；https://expcat.github.io/Tigercat/vue/#/image-viewer 「受控图片查看器」（react 同）。
   - 源码：`imagePreviewImgClasses`（`max-w-none`）vs `imageViewerImgClasses`（`max-h-[90vh] max-w-[90vw]`）；`examples/.../image/{04,05}/demo.json`、`image-viewer/01/demo.json` `minHeight: 120|180`。
   - 建议：Preview 图也做视口约束；示例把预览类 demo 的 viewport 加高，或打开时通知父页撑 iframe / 允许顶层预览。

#### P2

5. **QRCode** · 双端 · expired 刷新是 `span.cursor-pointer`，无 `button`/`role`/`tabindex`。Pages「配色与状态」未接 `@refresh`/`onRefresh`，点 Refresh 无变化。无 `download` 方法或按钮（检查清单里的下载能力缺失）。
6. **QRCode** · 双端 · `qrcodeOverlayClasses` 锁 `bg-white/80`；loading 文案 class `text-sm text-gray-500`。`--tiger-qrcode-*` 未进 `THEME_CSS_VARS`。
7. **Image** · Vue · lazy：`watch(src)` 在 `props.lazy` 时直接 return；IntersectionObserver 只在 `onMounted` 绑一次。已进入视口后再改 `src` 不更新。React `useEffect(..., [lazy, src])` 会重观察。`packages/vue/src/components/Image.ts:154-162`。
8. **Image** · 双端 · `handleError` 在 `fallbackSrc` 存在且已切到 fallback 后再失败时，`error=true` 但渲染条件是 `error && !fallbackSrc` 才走错误槽，页面停在裂图。
9. **ImageViewer** · 双端 · 不 Teleport 到 `body`、不设 `document.body.style.overflow`（ImagePreview 有 Teleport + 滚动锁）。左右键 `% length` 循环；ImagePreview 用 `hasPrev/hasNext` 禁用。img `alt="Image N"` 硬编码。
10. **ImageCropper** · 双端 · 框选/手柄在 Pages 可用（1:1 约束可见），但示例没有调用 `getCropResult()` 的按钮，用户无法看到裁剪输出；`image-cropper/02` 写 JPEG/`quality` 却无结果对照。暗色画布 `#0f172a` 本身可读。

#### P3

11. **ImageGroup** · 双端 · `role="group"` 无默认 `aria-label`；Pages 组图示例也没补。
12. **Image** · 双端 · 点击预览根 `aria-label={\`Preview ${alt || 'image'}\`}` 不走 locale（Lang=English 时与中文示例混排）。
13. **ImagePreview** · 双端 · 预览 `<img alt="Preview image N">` 不走 `getImageViewerLabels`。
14. **ImageCompare** · 双端 · `DEFAULT_IMAGE_COMPARE_ARIA_LABEL = 'Image comparison'`，无 i18n；示例 03 自己传了中文 `aria-label`。
15. **ImageCropper** · 双端 · `tiger-image-cropper-checkerboard` 定义在 `examples/example/{vue3,react}/src/index.css`，组件包不带棋盘格。
16. **QRCode** · 双端 · 21×21 贴边无 quiet zone。

#### 本波次无明显问题

Image 基础/cover、失败回退（picsum fallback 成功）、组图缩略图双端一致，亮/暗照片本身对比正常。ImageCompare 横向/纵向滑杆、键盘 Home/End、受控 `v-model:position` / `onChange` 可用，clip-path 与手柄对齐，暗亮正常。QRCode size / 自定义配色 / expired·loading 叠层能画出来（只是码本身无效）。ImageCropper 手柄与 1:1 框在 Pages 看得到。无页面级横向溢出（1440 / 390）。W2 无 P0。Vue 与 React 视觉与缺陷对称。

站点级（已在 W1 记过、本组同样出现）：Lang 显示 English 但页面标题仍中文；QR/预览 aria 跟 ConfigProvider 英文走、demo.json 中文。不单列。

#### Pages 视觉摘记

| 页 | 亮色 | 暗色 |
| --- | --- | --- |
| `/image` 基础/回退 | 正常 | 正常 |
| `/image` ImageGroup 预览 | 预览裁成横条，点遮罩不关，P1 | 同左 |
| `/image` ImagePreview | 同组图，P1 | 同左 |
| `/image-compare` | 滑杆/纵向/受控正常 | 同左 |
| `/qrcode` 纠错级别 | L/M/Q/H 一模一样，P1 | 默认码仍白底（可扫性需要，刺眼） |
| `/qrcode` expired/loading | 叠层可见；Refresh 点了没反应，P2 | overlay 仍白半透明 |
| `/image-cropper` | 裁剪框可见，无输出按钮，P2 | 深色画布正常 |
| `/image-viewer` | 白底白字工具条 + iframe 裁切，P1 | 工具条深底，对比好转；仍困在 180px iframe |

### W3 Form primitives

> 证据：对照 `packages/{core,vue,react}` 表单原语 + theme helpers、`examples/example/{vue3,react}`、单元/e2e；Pages 已核实 Vue Slider `v-model` 脱绑（滑块 0 / 文案 40）。**Pages 暗色未做全页爬取**——暗色结论主要来自未注册 CSS 变量与硬编码色（`text-red-900`、`#111827` 笔色等）。无 P0。会话状态记为 **partial**。

#### P1

1. **Slider** · Vue · 亮/暗
   - 现象：组件只 `emit('update:value')`（注释写 `v-model:value`），示例一律 `<Slider v-model="value" />`。Vue3 默认 `v-model` ↔ `modelValue`，`value` 从未写入 → 拇指停在 `min`，旁边段落仍显示本地 ref。
   - 复现：https://expcat.github.io/Tigercat/vue/#/slider → 示例 01；Playwright：滑块视觉 0，文案 40。React 示例 `value`+`onChange` 正常。
   - 源码：`packages/vue/src/components/Slider.ts:129-178`；`examples/example/vue3/src/examples/slider/01-04/App.vue`。测试用 `onUpdate:value`，抓不到示例断裂。
   - 建议：兼发 `update:modelValue`，或全体示例改为 `v-model:value`。

2. **主题 token / 暗色** · 双端 · 暗（源码为主）
   - 现象：`THEME_CSS_VARS` 无 `--tiger-text-muted` / `--tiger-fill`，placeholder/字数/Stepper/NumberKeyboard 等 fallback 浅色；Input/OTP 状态用 `text-red-900`/`green-900`/`yellow-900`，暗表面近不可读；affix/Textarea 计数 `text-gray-500`；Signature 默认笔色 `#111827` 叠在暗 `--tiger-surface` 上消失。
   - 复现：源码路径如下；Pages 暗色建议补爬 `/input` `/input-otp` `/signature` `/stepper`。
   - 源码：`theme-runtime/index.ts` `THEME_CSS_VARS`；`input-styles.ts:30-34,83,98`；`input-otp-utils.ts:172-177`；`tags-input-utils.ts:116-121`；`input-number-utils.ts:29-38`；Textarea Vue300/React110；Signature Vue41/React57。
   - 建议：注册 muted/fill 或改用 `text-secondary`/`surface-muted`；状态走 `--tiger-error` 等；笔色默认 `var(--tiger-text)`。

3. **InputGroup compact** · 双端 · 亮/暗
   - 现象：compact 类只选直接子代圆角/`-ml-px`/`:focus`；Input/Textarea 根无边框，内层仍 `rounded-[var(--tiger-radius-md)]`，焦点环也打不中（应为 `:focus-within`）。InputNumber 根即边框盒，compact 正常。
   - 复现：Pages `/input-group` 示例 01（Input+Button compact）。
   - 源码：`packages/core/src/utils/input-group-utils.ts:17-18`。
   - 建议：边框圆角上提到 Input 根，或 compact 时向下覆写控件类；`:focus` → `:focus-within`。

4. **Input** · Vue · 亮/暗 · clear + password 重叠
   - 现象：两钮同 `absolute inset-y-0 right-0`；Vue 两个都 push，React 只留一个（clear 优先）。`hasSuffix` 只加一档 `pr-*`。
   - 源码：`packages/vue/src/components/Input.ts:291-320` vs `Input.tsx:192-218`。
   - 建议：互斥或错开位置并加足右内边距。

5. **Input** · 双端 · 亮/暗 · 错误文案挤进字段
   - 现象：`getInputErrorClasses` 为字段内绝对定位；长错误盖住值，并替换 clear/password/suffix；非 live region。
   - 源码：`input-styles.ts` error 类；Vue283-291 / React185-190。
   - 建议：错误区放到控件下方 + `aria-live` / 稳定 `aria-describedby`。

6. **MaskInput** · 双端 · `name` 提交掩码
   - 现象：类型写提交 raw；可见 input 的 `value`/`name` 是 `maskedValue`，无 hidden raw（对比 OTP/Tags）。
   - 源码：`MaskInput.tsx:205-211`；Vue 同构。
   - 建议：有 `name` 时 hidden 提交 raw。

7. **Signature** · 双端 · 指针离开垫面笔画卡住
   - 现象：`pointerup` 仅 canvas；拖出边界不 `finishStroke`；无 `setPointerCapture`。
   - 源码：Vue `Signature.ts:235-248`；React `Signature.tsx:228-241`。
   - 建议：pointerdown `setPointerCapture` + `lostpointercapture` / document up。

8. **InputNumber** · 双端 · attrs / a11y 丢弃
   - 现象：Vue 只合并 `class`；React 无 rest → `aria-*`/`data-*` 到不了 spinbutton。
   - 源码：Vue `InputNumber.ts:309-316`。
   - 建议：透传到 `role="spinbutton"` 的 input。

9. **Radio** · Vue · group `disabled` 不禁用 input
   - 现象：`props.disabled !== undefined` 对 Boolean 省略恒为 true → 不读 group；选项仍可 Tab；group `onChange` 会 bail，表现像「点了不选中但仍可聚焦」。
   - 源码：`packages/vue/src/components/Radio.ts:122-125`。测试只断言 onChange 未调用。
   - 建议：`props.disabled || groupContext?.disabled`（对齐 Checkbox）。

10. **Switch / Stepper / ColorSwatch(Vue)** · 非受控失效
    - 现象：两端 Switch/Stepper、Vue ColorSwatch 无内部态；无父回写则 UI 不动。Pages 示例有绑定故看起来正常。
    - 源码：Switch/Stepper 直读 props；Vue ColorSwatch 无 `defaultValue`（React 有 inner）。
    - 建议：补非受控，或文档/类型标明 controlled-only。

#### P2

11. **Input** · 双端 · 状态色非 token；clear/password `tabIndex={-1}`；Vue 无 `defaultValue`。
12. **InputNumber** · 双端 · readonly 步进钮仍显可点；`border-red-500`；不接 FormItem。
13. **InputGroupAddon** · 双端 · `type` vs `addonType` 且未使用；组外 compact 默认 true。
14. **Textarea** · 双端 · 无 status/error/FormItem；计数 `text-gray-500`；React props 可覆盖内部 onChange。
15. **Checkbox** · 双端 · 无 `aria-checked="mixed"`；Group 无 `role="group"`；双端受控 prop 名不一致。
16. **Radio** · 双端 · SSR 不安全的自动 `name`；全体可 Tab（无 roving）；API 命名不对称。
17. **Slider** · 双端 · 无 capture；marks 易裁；`range`+标量单拇指；Vue aria 抄到外层。
18. **Stepper** · 双端/Vue · 非 spinbutton、无方向键；Vue 输入中被 model 冲掉；未注册 fill token；硬编码 aria。
19. **InputOTP** · Vue · FormItem `status!=='default'` 规则与 Input/`??` 三套不一致；错误格 `text-red-900`。
20. **TagsInput** · 双端 · 容器 `id` vs 字段 `${id}-input`；FormItem 同 OTP；hidden 固定逗号拼接。
21. **MaskInput** · 双端 · 字段内错误；FormItem quirk；无 InputGroup size 继承。
22. **NumberKeyboard** · 双端 · `--tiger-fill` 未注册；无键盘绑/roving；Empty 键占位。
23. **Signature** · 双端 · 半受控 API（Vue 只认 `''`；React 无 value）；Backspace 整板清空；无底色导出发黑。
24. **ColorSwatch** · 双端 · `bg-white/90` 角标；`aria-disabled` 非 native disabled；跨组方向键按扁平 index。

#### P3

25. **Checkbox** · Group 内单项不发 change；未选 primary 边框偏抢。
26. **Switch / Radio** · Vue · attrs 上的 onClick/onKeydown 被覆盖（React 有 compose）。
27. **Input / MaskInput** · clear/password 英文硬编码；无 `aria-required`；error shake 含首屏。
28. **Slider** · 无纵向 / 无 `aria-valuetext`。
29. **Stepper** · Vue 无 `className` prop；`type="text"` 无 `inputMode`。
30. **OTP / TagsInput** · 错误无 aria-live。
31. **ColorSwatch** · Vue 无 className/defaultValue。
32. **NumberKeyboard** · confirm 不改 value；空 delete 仍发事件。

#### 本波次无明显问题

InputOTP / TagsInput 主路径（输入、粘贴、退格两段删、max、双端 e2e）行为对称且测试扎实。NumberKeyboard 双端 API（`key-press`/`onKeyPress`）基本对齐。RadioGroup `role="radiogroup"` + 方向键切换可用（除 Vue disabled 继承）。Slider 键盘（Arrow/Page/Home/End）与 token 化轨道在受控写法下正常。W3 无 P0。

受控/非受控与 FormItem 继承在组件间分裂（Input `hasOwnProperty` vs OTP/Tags/Mask `!=='default'` vs 其余不读 FormItem）记入跨切，不单开 P0。

#### Pages 视觉摘记

| 页 | 亮色 | 暗色 |
| --- | --- | --- |
| `/slider`（Vue） | 滑块停 min、文案仍为本地值，P1（已 Pages 核实） | 未全爬；逻辑同左 |
| `/input` clear+password | Vue 双钮重叠（源码），P1 | 状态字 `*-900` 风险，P1 |
| `/input-group` compact | Input/Textarea 圆角不缝合，P1 | 同左 |
| `/mask-input` | `name` 提交掩码（源码），P1 | 同 Input 暗色风险 |
| `/signature` | 拖出垫面笔画可卡（源码），P1 | 默认笔色近不可见，P1 |
| `/input-number` | attrs 丢失（源码），P1 | 状态边框硬编码，P2 |
| `/radio` group disabled | Vue 选项仍可聚焦（源码），P1 | 同左 |
| `/switch` `/stepper` `/color-swatch` | 示例有 v-model 看起来正常；裸用无态，P1 | Stepper fill token 浅底，P2 |
| `/input-otp` `/tags-input` | 主路径正常 | OTP 错误格 `*-900`，P2 |
| `/number-keyboard` `/textarea` `/checkbox` | 主路径可用 | muted/gray 计数与填色，P2 |


### W4 Form composite

> Pages 实机：Chromium + puppeteer-core 打开 `https://expcat.github.io/Tigercat/{vue,react}/#/<path>`，1440×900。亮色爬了本组 12 路由；暗色用页头 Dark 开关核实 Select / ColorPicker / Upload（`--tiger-surface` 触发器/面板可读）。`html.classList` 强切暗色会重建 sandbox，Cron/Form 出现过空白 iframe（站点级，W1 已记）。对照 `packages/{core,vue,react}` 与 `examples/example/{vue3,react}`。交互点进 sandbox iframe。无 P0。Vue/React 示例结构对称，Transfer 绑定与 ColorPicker 黑块两端同现（Transfer 仅 Vue 示例脱绑）。

#### P1

1. **ColorPicker** · 双端 · 亮/暗
   - 现象：Pages「代表配置」色块是纯黑，不是 `rgba(37, 99, 235, 0.8)`。`hexToRgb` 把非 hex 当 hex `parseInt` → `{r:0,g:0,b:0}`；`showAlpha` 只改本地 `alpha` 不 emit；hue/预设/输入一律 emit hex，`format` 只改面板预览文案。
   - 复现：https://expcat.github.io/Tigercat/vue/#/color-picker 与 react →「代表配置」。Vue/React 截图均为黑块；「格式与尺寸」hex/rgb/hsl 色块都是同一蓝（模型仍是 hex）。
   - 源码：`packages/core/src/utils/color-picker-utils.ts` `hexToRgb` / `parseColorInput`（只认 hex 与 `rgb()`）；Vue `ColorPicker.ts:52-121`；React `ColorPicker.tsx:54-107`。示例 `color-picker/01`。
   - 建议：初值走 `parseColorInput`（含 rgba/hsla/alpha）；emit 跟 `format`；alpha 滑条写入 v-model。

2. **Transfer** · Vue · 亮/暗
   - 现象：示例 01 `v-model:target-keys`，组件只发 `update:modelValue`，`resolvedTargetKeys` 纯读 props、无内部态。勾「设计」点 `>` 后仍是「已选团队 (1) / 前端」。React 同操作变为「已选 (2) / 设计+前端」。
   - 复现：https://expcat.github.io/Tigercat/vue/#/transfer 「基本用法」；react 对照。
   - 源码：`packages/vue/src/components/Transfer.ts:119,146-147,199-221`；`examples/example/vue3/src/examples/transfer/01/App.vue`。示例 02 用 `v-model` 正常。
   - 建议：兼发 `update:targetKeys`，或示例改 `v-model`（同类 W3 Slider）。

3. **AutoComplete** · 双端 · 亮/暗
   - 现象：`handleSelect` 先把输入设成 `option.label`，随后 `watch(modelValue)` / `useEffect(value)` 用 `String(value)` 覆盖。`label !== value` 时输入框显示 raw key。
   - 复现：https://expcat.github.io/Tigercat/vue/#/auto-complete 「自定义选项」（`北京 Beijing` / `beijing`）。
   - 源码：Vue `AutoComplete.ts:143-150,206-216`；React `AutoComplete.tsx:127-133`。
   - 建议：回写显示解析匹配 option 的 label。

4. **Form** · React · 亮/暗
   - 现象：默认 trigger 含 `change`。FormItem 在子 `onChange` 之后立刻 `validateField`，Form 读的是上一拍 `model`。context 上的 `updateValue` 从未被 FormItem 调用。必填错误会在第一字后仍在。Vue 用响应式 model，无此问题。
   - 复现：源码路径；Pages `/form` 需在 React「内置校验」逐键输入观察。
   - 源码：`packages/react/src/components/FormItem.tsx:237-241`；`Form.tsx:221-222`。
   - 建议：先 `updateValue` 再校验，或校验读 event 目标值。

5. **Upload** · React · 亮/暗
   - 现象：受控 `fileList` 时 `notify()` 不回写父级；`customRequest` 后续 progress/success 变异同一对象，可能不再绘成功态。Vue `setFileList` 始终 `emit('update:file-list')`。示例 04 正是该模式。
   - 复现：https://expcat.github.io/Tigercat/react/#/upload 「自定义上传」。
   - 源码：React `Upload.tsx` `useControlledState` / `notify`。
   - 建议：受控进度也 `onChange(file, nextList)` 新数组。

#### P2

6. **DatePicker / TimePicker / Cascader** · 双端 · Pages sandbox · 日历/时间列/级联列高于 iframe（demo `minHeight` 120 + 壳 `overflow-hidden`）；绝对定位弹层不撑 `ResizeObserver`。Pages `/datepicker` 点开后触发器有焦点、日历看不见。Select 三项短列表能看见（`/select`「搜索」）。建议加高 viewport 或打开时撑 iframe。
7. **Cascader** · 双端 · `layout: 'fullscreen-sm'` 无 Select 的移动端 Done；窄屏面板盖住触发器，只能选叶子退出。
8. **Cascader / TreeSelect** · 双端 · 键盘只能开关；清空钮嵌在 trigger `<button>` 内（Select 已改成兄弟钮）。
9. **ColorPicker** · 双端 · 无 SV 画布，只能拧 hue + 打字。
10. **DatePicker** · 双端 · `parseDate('YYYY-MM-DD')` 走 UTC 午夜，西时区少一天。示例 03 min/max。
11. **Mentions** · Vue · 用旧 `filteredOptions.length` 决定是否更新 query；滤空后回删可能不再打开。
12. **Upload** · 双端 · `drag` 忽略默认 slot；`progress` 不画条；`bg-white`/`border-gray-300`。Pages `/upload` 拖拽区英文「Click to upload…」（Lang=English 时与 locale 一致，slot 文案仍被丢掉）。
13. **FormItem** · 双端 · block/popup 错误用 `bg-red-50`/`bg-red-600`；`inlineMessage` 未读。Vue `required` Boolean 省略即 `false`，规则里的 required 撑不出星号。
14. **AutoComplete / TreeSelect** · 双端 · 暗 · 选中行 `--tiger-outline-bg-active,#dbeafe` 未注册。
15. **W4 muted token** · 双端 · 暗 · 占位/空态/Cron 字段底打未注册 `--tiger-text-muted` / `--tiger-fill`（W3 跨切）。面板走 `--tiger-surface`，Select 暗色触发器可读。

#### P3

16. **Select / TreeSelect** · 双端 · 搜索框（及 Select 移动端 Done）在 `role="listbox"` 内。
17. **Select / Cascader / TreeSelect** · 双端 · 默认 placeholder 英文；示例传了中文。
18. **ColorPicker** · 双端 · `Pick color`/`Hue`/`Alpha` 英文；`div role="button"`；面板无 dialog。
19. **DatePicker** · 双端 · grid 无 row；触发 input 无 combobox aria。
20. **CronEditor** · 双端 · 只认 5 段；死代码英文 `modeOptions[].label`。
21. **Transfer** · 双端 · `description` 可搜不渲染；placeholder fallback `Search...`。
22. **Mentions** · 双端 · 无 `aria-activedescendant`；单 prefix。
23. **ColorPicker / CronEditor** · Vue · 无 `className` prop。

#### 本波次无明显问题

Select 主路径（打开、选中、清空、多选+搜索）Pages 可用；暗色触发器跟 `--tiger-surface`。TimePicker 展示 `09:30:00` / 范围 `09:00 - 18:00` 正常。CronEditor 5 段+预设可编辑（Lang=English 时字段文案英文，与 locale 一致）。Form 基础预览、必填星号、提交按钮结构正常；校验走 `<form onSubmit>`。Upload 按钮与拖拽区可见。Mentions 输入框与 `#`/`@` 示例能渲染。无页面级横向溢出。无 P0。

站点级（W1 已记）：Lang 显示 English、页面标题仍中文；强切 `html.dark` 可能把 sandbox 切成空白卡（用页头 Dark 开关则 Select/Upload 重建正常）。偶发 React sandbox `Failed to fetch dynamically imported module`（compile-error），刷新后不一定再现，不单开组件 P1。

#### Pages 视觉摘记

| 页 | 亮色 | 暗色 |
| --- | --- | --- |
| `/select` | 短列表下拉可见；清空/多选正常 | Dark 开关后触发器跟主题，可读 |
| `/auto-complete` | 输入框可见；label/value 漂移见 P1 | 同左（逻辑） |
| `/cascader` `/tree-select` | 触发器可见；高面板有裁切风险 | 面板走 surface |
| `/datepicker` | 点开后日历常看不见（iframe），P2 | 未全页点开；token 同 W3 muted |
| `/timepicker` | 展示值正常；高面板同 DatePicker | 同左 |
| `/color-picker` | 「代表配置」黑块，P1；hex/rgb/hsl 色块相同 | 黑块仍在；蓝预设正常 |
| `/cron-editor` | 5 段编辑器完整 | 强切 html.dark 出现过空 iframe；token fill 浅底风险 |
| `/mentions` | 文本框正常 | 面板走 surface |
| `/transfer` | Vue 01 勾了移不动，P1；React 可移 | 同左 |
| `/upload` | 按钮/拖拽区可见；slot 文案被 locale 替换 | 跟主题；按钮偏亮底 |
| `/form` | 预览 JSON、星号、提交结构正常 | 强切 html.dark 出现过空 iframe |



### W5 Feedback

> Pages 实机：Chromium + playwright-core 打开 `https://expcat.github.io/Tigercat/{vue,react}/#/<path>`，1440×900。亮色 + 页头 **Dark** 开关（`[role=switch]` 末项；强切 `html.dark` 会重建 sandbox）。11 条路由双端都爬了。交互点进 `srcdoc` iframe（`sandbox="allow-scripts allow-forms"`，约 180px 高）。对照 `packages/{core,vue,react}` 与 `examples/example/{vue3,react}`。无 P0。Vue/React 示例结构、文案、缺陷对称。

#### P1

1. **Loading** · 双端 · 暗
   - 现象：全屏默认 `background: 'rgba(255, 255, 255, 0.9)'`。Pages「全屏加载」点「模拟页面加载」后，sandbox 被一块半透明白布盖住（计算样式 `rgba(255,255,255,0.9)`）；文案走 primary 蓝，但整卡像亮色垫贴在暗页上。区域加载示例自己叠 `bg-white/85`，暗色同样是浅灰白垫。
   - 复现：https://expcat.github.io/Tigercat/vue/#/loading （及 react）切 Dark →「全屏加载」「区域加载」。
   - 源码：Vue `Loading.ts:62-65,156-158`；React `Loading.tsx:32,75`；类型默认也写死该白值。示例 `loading/02` `bg-white/85 dark:bg-gray-950/85`（sandbox `dark:` 未生效）。
   - 建议：默认改 `--tiger-surface` 半透明或注册 `--tiger-loading-mask`；区域示例改 token 背景。

#### P2

2. **Message** · 双端 · 暗
   - 现象：success/info/warning/error 用未注册 `--tiger-message-*-bg` + 浅色 fallback。Pages 暗色点「显示消息」toast 实测 `bg rgb(240,253,244)` / `color rgb(22,101,52)`（对比 6.8:1，可读但像亮色条）。loading 类型反而走 `--tiger-surface-muted`。
   - 复现：https://expcat.github.io/Tigercat/vue/#/message （及 react）切 Dark。
   - 源码：`packages/core/src/utils/message-utils.ts` `defaultMessageThemeColors`；`THEME_CSS_VARS` 无 message token。
   - 建议：bg 跟 surface，字跟已注册 status/`--tiger-text`；或写入明暗两套 `--tiger-message-*`。

3. **Modal / Drawer / Tour / LoadingBar / Message / Notification** · 双端 · Pages sandbox
   - 现象：弹层 `fixed` 相对 iframe，viewport 约 180px。Modal 对话框实测 448×190、相对 iframe `y=16`，底部被裁；Drawer 384×180 撑满卡片右侧；LoadingBar `fixed top-0` 贴在卡片顶不是站点顶；Tour/Message/Notification 也能开，但出不了 iframe。`ResizeObserver` 只看 in-flow `scrollHeight`，`fixed` 不撑高。
   - 复现：`/modal` `/drawer` `/tour` `/loading-bar` `/message` `/notification`。同源 W2 ImagePreview、W4 DatePicker。
   - 源码：`examples/.../DemoBlock` `minHeight: 120` + 壳 `overflow-hidden`；组件 `renderVueBodyTeleport` / `renderBodyPortal`。
   - 建议：弹层类 demo 加高 viewport，或打开时按 overlay 高度撑 iframe。

4. **Message / Notification** · 双端
   - 现象：无 hover 暂停、无 `maxCount`；`setTimeout` 到期即关，连点无限堆。测试覆盖 duration，不覆盖暂停/封顶。
   - 源码：Vue/React `Message.ts(x)` / `Notification.ts(x)` `add*`。
   - 建议：hover/focus 清计时；超出 maxCount 关最旧一条。

5. **MessageContainer / NotificationContainer** · Vue vs React
   - 现象：Vue 声明式容器无条件 `Teleport to: 'body'`，示例 05 飞出预览盒；React 不 portal，只靠 `fixed`。Vue `TransitionGroup name="message|notification"` 仓库无对应 CSS。
   - 源码：Vue `MessageContainer.ts:111-131`、`NotificationContainer.ts`；React 同名组件。
   - 建议：声明式容器不要 Teleport（imperative host 再挂 body）；补 CSS 或去掉空 `name`。

6. **Progress** · 双端
   - 现象：`striped` + `striped-animation` Pages 能看到静态高光，不流动（无 `@keyframes progress-stripes`）。示例 02 标题「仪表盘」是满圆 `type="circle"`，公开类型只有 `line | circle`。
   - 复现：https://expcat.github.io/Tigercat/vue/#/progress 「线性进度」「仪表盘」。暗色绿条/绿环跟 token，可读。
   - 源码：`progress-utils.ts:30-33`；`packages/core/src/types/progress.ts`。
   - 建议：inject keyframes（对齐 Loading）；示例改称「圆形进度」，或补 dashboard 缺口弧。

7. **Tour** · 双端
   - 现象：有 target 时 spotlight `pointer-events:none`，点暗区关不掉（无 target 的 fallback mask 才 `onClick: close`）。定位按写死 320×160。Vue 最后一步只 `finish` + `update:open`，React 还调 `onClose`（测试按此分叉写死）。dialog 无 `aria-labelledby`。Pages 点「开始引导」弹出 320×130 卡，Esc 可关，body `overflow:hidden`。
   - 复现：https://expcat.github.io/Tigercat/vue/#/tour （及 react）。
   - 源码：`tour-utils.ts:13-18,97-102,187-199`；Vue `Tour.ts:186-207`；React `Tour.tsx:133-169`。
   - 建议：mask 可点关（挖洞或 clip-path）；测量 popover 再定位；finish 路径对齐 close；title 挂 `aria-labelledby`。

8. **Modal / Drawer** · Vue
   - 现象：`watch(open)` 无 `{ immediate: true }`。挂载即 `open=true` 不聚焦关闭钮、不记 restore。React `useEffect([open])` 会跑。Pages 都是点击打开，demo 正常。
   - 源码：`Modal.ts:356-377`；`Drawer.ts:347-364`。对照 Vue Tour `{ immediate: true }`。
   - 建议：补 immediate，初始 `false` 跳过 restore。

9. **Popconfirm** · 双端
   - 现象：默认 `title`/`okText`/`cancelText` 中文硬编码，不读 locale（Modal 默认脚会走）。Pages Lang=English 打开后仍是「删除这条记录？ / 取消 / 删除」。click 打开 280×132，暗色走 `--tiger-surface`。
   - 源码：Vue `Popconfirm.ts:65-78`；React `Popconfirm.tsx:70-71`。
   - 建议：对齐 Modal `resolveLocaleText`。

10. **Tooltip / Popover(hover)** · 双端
    - 现象：无 delay；内容 Teleport 后 trigger `mouseleave` 立即关。Pages Tooltip `placement="top"` 在 180px iframe 内被 flip 到按钮下方，暗亮都可读（白字 / `#111827` 底 + 阴影）。click 型 Popover 宽 240 生效，Esc 可关。
    - 源码：`floating-popup-utils.ts` hover 只绑 trigger；Vue `use-floating-popup.ts:160-165`。
    - 建议：hide delay；trigger+floating 当同一 hover 组。

11. **Modal** · 双端
    - 现象：`mask={false}` 时 click 仍在居中容器上，点空白照关（Drawer 只绑 mask 节点）。根 `hidden={!open}` 同帧切掉，mask/panel transition 播不出来（Drawer 有 `deferDestroyOnClose`）。
    - 源码：React `Modal.tsx:376-377,359-364`；Vue 同构。
    - 建议：空白关闭跟 `mask && maskClosable`；延迟 `hidden` `ANIMATION_DURATION_MS`。

#### P3

12. **Loading** · React · 无 `disableTeleport`（Vue 有）。
13. **Message.loading** · 双端 · 调用方 `duration` 被覆盖成 `0`。
14. **Message / Notification / LoadingBar** · 双端 · 容器+条目双重 live region；LoadingBar trickle 每 200ms `aria-live`。
15. **Tooltip** · 双端 · `whitespace-nowrap` + `max-w-[300px]`；暗色底与 surface 同 hex，靠阴影可辨。
16. **Tour / Popconfirm 示例** · 双端 · 暗 · `bg-gray-100`（Tour「结果区域」浅灰胶囊）、`text-gray-500`。
17. **Vue Tooltip / Popover** · 丢 `attrs.style`（Popconfirm 有 merge）。
18. **overlay scroll lock** · 只设 `body.overflow=hidden`，无 gutter。
19. **Modal 默认脚** · Pages Lang=English 时实测 footer「Cancel」+ 示例 `ok-text="知道了"` 中英混排。

#### 本波次无明显问题

Drawer 主路径（打开、标题、内部 Select 走 overlay host、暗色 surface `#111827`、滚动锁 `overflow:hidden`）双端可用。Modal 同样 `role="dialog"` + `aria-modal` + 主题表面；遮罩/Esc 单测覆盖，Pages 沙箱点测受 iframe 焦点限制。Notification 暗色走 `--tiger-surface`，绿描边+浅字可读，比 Message 跟主题。LoadingBar trickle/primary/error API 对称，暗色条 `rgb(96,165,250)`。Progress 线/圆暗亮对比正常。Tooltip hover 出层、Popconfirm/Popover click 开层。无页面级横向溢出。无 P0。

站点级（W1 已记）：Lang=English、标题仍中文；demo 偶发 compiling 空卡；`dark:` 工具类在 sandbox 常不生效。

测试：Modal/Drawer mask+Esc、Tour Esc/滚动锁、Message duration、Popconfirm Esc 有覆盖。未测 pauseOnHover/maxCount（无 API）、Modal 组件层滚动锁、Tour 有 target 时点遮罩。

#### Pages 视觉摘记

| 页 | 亮色 | 暗色 |
| --- | --- | --- |
| `/drawer` | 右抽屉 384×180 撑满卡片；内部 Select 可见 | surface 深底，对比正常 |
| `/loading` | 内联 dots 正常 | 区域浅白垫 + 全屏白遮罩，P1 |
| `/loading-bar` | 2px 蓝条在 iframe 顶 | 条变浅蓝 `rgb(96,165,250)`；仍困在卡片 |
| `/message` | 薄荷条「保存成功」 | 同色浅条贴暗页，P2 |
| `/modal` | 可开；190px 对话框略裁，P2 sandbox | 深表面可读；footer Cancel/知道了混排，P3 |
| `/notification` | 白卡 + 绿边 | 深表面可读 |
| `/popconfirm` | 280 宽确认卡 | 跟 surface；按钮仍中文 |
| `/popover` | 240 宽，Esc 可关 | 深表面 |
| `/progress` | 64% 绿条+条纹高光；圆「健康」 | 跟 token，可读；条纹不流动，P2 |
| `/tooltip` | 暗底白字，被 flip 到按钮下 | 同左，仍可读 |
| `/tour` | 320 宽引导卡，Esc 关 | raised 表面；示例「结果区域」浅灰胶囊，P3 |

### W6 Layout

> Pages 实机：Chromium + playwright-core 打开 `https://expcat.github.io/Tigercat/{vue,react}/#/<path>`，1440×900。亮色 + 页头 **Dark** 开关（`[role=switch]` 末项）。14 条路径双端都爬了；`/container` 无路由（空页）。交互点进 `srcdoc` iframe：Carousel 箭头、Splitter 拖 gutter、Resizable 角点、ScrollArea `scrollTop`、Skeleton 切换。对照 `packages/{core,vue,react}` 与 `examples/example/{vue3,react}`。无 P0。Vue/React 示例结构对称（Skeleton 01 的 `animated` vs `wave` 除外）。

#### P1

1. **Splitter** · 双端 · 亮/暗
   - 现象：`sizes` 类型/实现是像素，示例写成 30/70、40/60、25/75 并在 demo.json 称「初始比例」。Pages 水平分割左栏 30×198，文案竖排成「左 / 侧 / 面 / 板 / ( / 最 / 小 / 10」；右栏 70px；其余大片空白。垂直分割上栏 40px / 下栏 60px。嵌套侧栏 25px。`min={100}` 初始化不 clamp；暗色下把 gutter 往右拖，左栏从 30 变成 **0**、右栏 100。
   - 复现：https://expcat.github.io/Tigercat/vue/#/splitter （及 react）→「水平分割」「垂直分割」「嵌套分割」。
   - 源码：`packages/core/src/types/splitter.ts:52-54`；Vue `Splitter.ts:72-83,99`；React `Splitter.tsx:70-74`；`resizePanes` 只在拖拽用 min。示例 `examples/.../splitter/01-03`。core `parsePaneSize` / `calculateInitialSizes` 已支持 `%`，两端没接。
   - 建议：示例改 `[240, 560]` 或 `['30%','70%']` 并接线百分比；mount 时把 sizes clamp 到 min/max；不要把未满足 min 的数组直接写成 style。

2. **Skeleton** · 双端 · 暗
   - 现象：暗页上骨架是浅灰白横条（`#e5e7eb` 量级），像亮色占位贴在深表面上。`--tiger-skeleton-bg` / `--tiger-skeleton-bg-alt` 未注册；tokens 产物是 `--tiger-component-skeleton-*`，组件没用。
   - 复现：https://expcat.github.io/Tigercat/vue/#/skeleton （及 react）切 Dark →「静态骨架」「加载切换」。
   - 源码：`packages/core/src/utils/skeleton-utils.ts:8-16`；`THEME_CSS_VARS` 无 skeleton。
   - 建议：bg 改 `--tiger-surface-muted`，或把 skeleton token 写入 theme 并在 utils 里读同一套名字。

3. **Layout / Container** · 双端 · 暗
   - 现象：三块 layout demo 暗色都对比崩。①「Container 容器」示例 `bg-white`，字走站点浅色 `--tiger-text` → 白底白字，框里像一条空白。②「基础布局」Content `!bg-white`，同样白底白字；iframe 还因根 `min-h-screen` 被撑到 720 高。③「折叠侧栏」Content 不覆盖背景，走未注册 `--tiger-layout-content-bg,#f9fafb`，实测 `rgb(249,250,251)` + 白字「工作区」。Sidebar 本身跟 `--tiger-surface` `#111827`，对比正常。
   - 复现：https://expcat.github.io/Tigercat/vue/#/layout （及 react）切 Dark。
   - 源码：`layout-utils.ts:43-44` `layoutContentClasses`；示例 `layout/01` `bg-white`、`layout/02` `!bg-white`、`layout/03` 只 `!p-4`。
   - 建议：Content fallback `surface-muted`；示例背景改 token / 去掉 `bg-white`。

#### P2

4. **Splitter gutter** · 双端 · 暗 · `bg-gray-200` / 把手 `bg-gray-400`。Pages 暗色 gutter 仍是浅灰细线。建议 `--tiger-border` / `surface-muted`。
5. **Layout `min-h-screen`** · 双端 · 每个 Layout 都要整屏高；Pages「基础布局」sandbox 顶到 `maxHeight: 720`。嵌套/卡片里的 Layout 也会被撑开。建议内层去掉 `min-h-screen`，或检测父级高度。
6. **Descriptions `layout="vertical"`** · 双端 · 不分组、不读 `column`/`span`；bordered 每项一行左右 `th+td`。Pages `/descriptions`「垂直自定义」写了 `column={2}` `span: 2`。源码 Vue `Descriptions.ts:241-296`。
7. **Carousel infinite wrap** · 双端 · scroll 从最后一张到第 0 张会 `translateX` 倒带整轨。Pages `/carousel`「编程控制」可看到（「代表配置」是 fade，箭头/自动播正常：点 Next 后 Slide 1→2）。
8. **Skeleton `wave` + 示例不对称** · 双端 · wave ≈ pulse；Vue `skeleton/01` `animated` 不是 prop（attrs 落到根上），React 写 `animation="wave"`。
9. **Splitter 受控 / `gutterSize`** · 双端 · `sizes` 每次同步会冲掉拖拽；React effect deps 含 `children`。`gutterSize` 不改可见宽度。
10. **Vue Space** · 未 `inheritAttrs: false` 又 spread attrs，listener 双触发。
11. **List `draggable` + 分页** · 双端 · 用当前页 index 改全量数组。Pages 列表例没有 drag。
12. **Layout 无横向 sider** · 根恒 `flex-col`。Pages「折叠侧栏」外包 `div.flex` 所以 192px 侧栏 + 工作区并排；配方/App 外壳若直接 Sidebar+Content 会上下堆。

#### P3

13. **`/container` 无页** · 公开组件，导航和路由都没有；只作为 `/layout` 第一例。
14. **Card `coverAlt`** 默认英文；transparent 在 Pages 实测 `bg: rgba(0,0,0,0)` 可用（无 twMerge，但当前 CSS 顺序让 `bg-transparent` 胜出）。
15. **Carousel** `tablist` 无 `role="tab"`；箭头 aria 走 locale（Lang=English 时 Previous/Next slide）。
16. **SplitterPaneConfig** collapsible/collapsed/defaultSize 死类型。
17. **Resizable** 手柄默认看不见；无受控 width。Pages 拖角可用。`lockAspectRatio` 只跟 width，竖边手柄几乎无效。
18. **Grid `'2xl'` vs 他处 `'xxl'`**。`flex` 要 `span={0}` 才去掉宽度类；Pages「对齐与 Flex」实测 108px + 818px，flex-basis 碰巧赢了。
19. **Vue Space / Container** 无 `className` prop。

#### 本波次无明显问题

AspectRatio 16/9 与 4/3 比例盒正确。Card 五种变体（含 transparent 透明）、封面/横向、尺寸 padding 双端一致。Carousel fade 自动播 + 箭头 + 点指示 Pages 可用。Grid 基础 `span=8` 三列、响应式 md 两列在 1440 下约 447+447。Masonry 三列卡片能排。List 基本/自定义/外部分页/网格/空态结构正常。ScrollArea 纵向可滚（`scrollHeight` 887 / `clientHeight` 200），自定义 thumb 暗色走 `--tiger-border` `rgb(55,65,81)`；shadow 在未读边可见。Space 间距/换行可见。Resizable 拖拽改尺寸并回写「354 × 184」。无页面级横向溢出。无 P0。

站点级（W1 已记）：Lang=English、标题仍中文；sandbox `dark:` 常不生效（ScrollArea `dark:border-gray-700` 暗色仍浅边；Masonry 示例 `dark:bg-blue-950` 可能仍浅蓝）。不单列新 P1。

测试：Splitter 单测用 `sizes={[400,400]}` 抓不到 30/70 示例；Skeleton 声明了 animation 表却没用；Card transparent 只断言 class 含 `bg-transparent`。Carousel 箭头/change 有覆盖，不覆盖 wrap transform。

#### Pages 视觉摘记

| 页 | 亮色 | 暗色 |
| --- | --- | --- |
| `/aspect-ratio` | 16/9、4/3 比例正常 | 同左 |
| `/card` | 变体/封面正常；transparent 透明 | surface 跟主题；示例 `text-gray-600` 偏淡 |
| `/carousel` | fade 自动播+箭头可用；scroll 例三页 | 同左；点白、箭头半透明黑 |
| `/container` | **无此路由**，空页 | 同左 |
| `/descriptions` | 横向表可见 | 跟 surface；vertical 不按 2 列排，P2 |
| `/grid` | col-8 三列；flex 例 108+818 碰巧对 | 同左 |
| `/layout` | Container 白底；基础布局 iframe 720 高 | Container/Content 白底白字，P1；03 工作区 `#f9fafb`+白字，P1 |
| `/masonry` | 三列瀑布可见 | 示例 `dark:` 可能不生效 |
| `/list` | 列表/分页/网格正常 | 跟 surface |
| `/resizable` | 拖角 300×150→354×184 | 同左；手柄仍隐 |
| `/scroll-area` | 可滚、thumb 可见 | thumb 深灰可读；边框仍浅 |
| `/skeleton` | 三段段落条正常 | 浅灰白杠，P1 |
| `/space` | 间距/换行正常 | 同左 |
| `/splitter` | 30px 左栏竖排字，P1 | 左栏更看不清；gutter 浅灰，P1/P2 |

### W7 Navigation

> Pages 实机：Chromium + puppeteer-core 打开 `https://expcat.github.io/Tigercat/{vue,react}/#/<path>`，1440×900。亮色 + 页头 **Dark** 开关（`[role=switch]` 末项；站点会把偏好写进 localStorage）。16 条用户路径双端都爬了；**`/back-top` 无路由**（空页），真实路由是 `/backtop`。交互点进 `srcdoc` iframe（部分 frame evaluate 3.5s 超时）。对照 `packages/{core,vue,react}` 与 `examples/example/{vue3,react}`。无 P0。Vue/React 示例结构大体对称（Pagination 01 的 `onPageSizeChange`、Dropdown 02 的 `close-on-click` 除外）。

#### P1

1. **Tree** · 双端 · 暗
   - 现象：树根 `bg-white`，节点文字继承暗页 `--tiger-text`（浅字）→ 白底白字。Pages 暗色「基础树」是一张空白白卡，只剩勾选框/半选方块。
   - 复现：https://expcat.github.io/Tigercat/vue/#/tree （及 react）切 Dark →「基础树」。实测 `treeBg: rgb(255,255,255)` + `treeColor/bodyColor: rgb(255,255,255)`。
   - 源码：`packages/core/src/utils/tree-utils.ts:188-267` `treeBaseClasses` / `treeNodeHoverClasses` / `treeEmptyStateClasses` / `treeLineClasses`（`hover:bg-gray-50`、`border-gray-300`、`text-gray-500`）。
   - 建议：bg/text/border/hover 走 `--tiger-surface` / `--tiger-text` / `--tiger-border` / `--tiger-surface-muted`。

2. **Affix `offsetBottom`** · 双端 · 亮/暗
   - 现象：底钉 style 是 `position:fixed; bottom: ${offset}px`（视口/iframe 底），顶钉才用 `containerRect.top + offset`。自定义 `target` 时钉到 iframe 底而不是滚动容器底。示例 02 内容 `mt-auto` 在 `h-40` 里，首屏 sentinel 已出容器 → 一上来就是「已固定到底部」。
   - 复现：https://expcat.github.io/Tigercat/vue/#/affix （及 react）→「固定到底部」。实测 `fixed; bottom:8px; y=152`（iframe 高 200）。对照「容器滚动固定」滚过 8px 后会变成「已固定」（顶钉可用）。
   - 源码：`packages/core/src/utils/affix-utils.ts:44-56`；示例 `examples/.../affix/02`。
   - 建议：非 window target 用 `bottom: innerHeight - containerRect.bottom + offset`（或改 sticky）；sentinel 放到内容底；示例初始把目标放进视口。

3. **Pagination `pageSize`** · React · 亮/暗
   - 现象：尺寸变化故意不发 `onChange`，只发 `onPageSizeChange`。React 示例 01 受控 `pageSize` 却只绑 `onChange` → `<select>` 改完被受控值打回 20。Vue 同例 `v-model:pageSize` 正常。
   - 复现：https://expcat.github.io/Tigercat/react/#/pagination 「受控分页」。Playwright：`size before=20 after=20`；Vue 对照 `20→10`。
   - 源码：`packages/react/src/components/Pagination.tsx:196-200`；测试 `Pagination.spec.tsx` 明确「size change never also onChange」；示例 `examples/example/react/src/examples/pagination/01/App.tsx`。
   - 建议：示例补 `onPageSizeChange={(page, size) => { setCurrent(page); setPageSize(size) }}`。

4. **DropdownItem `close-on-click`** · Vue · 亮/暗
   - 现象：示例 02「保持展开」写 `:close-on-click="false"` 在 **Item** 上，该 prop 只存在于 **Dropdown**（`inheritAttrs:false` 落到 button 属性）。点了仍关。React 同例用 `disabled`，两端 demo 不对称。
   - 复现：https://expcat.github.io/Tigercat/vue/#/dropdown 「受控开关」。点开后再点「保持展开」，文案仍「受控状态：已关闭」。
   - 源码：Vue `Dropdown.ts` Item props（无 `closeOnClick`）；`examples/example/vue3/src/examples/dropdown/02/App.vue`。
   - 建议：实现 item 级 closeOnClick，或示例改绑父级并对齐 React。

5. **Anchor / ScrollSpy 当前项** · 双端 · 亮/暗
   - 现象：`createAnchorObserver` 的 active 是「仍在顶部 40% 带（`rootMargin: -60%`）里文档序第一个 href」。末段经常赢不了；点末项后 IO 又把高亮打回第一项。`bounds` 公开但未接线。ScrollSpy 复用同一套 IO。
   - 复现：https://expcat.github.io/Tigercat/vue/#/anchor 「容器滚动」点「发布」后「审计」仍 font-weight 500；https://expcat.github.io/Tigercat/vue/#/scroll-spy 点末项 `aria-current` 仍是第一项。
   - 源码：`packages/core/src/utils/anchor-utils.ts:284-323`；Vue/React Anchor + ScrollSpy。
   - 建议：按 offset 线取最后相交；click 后忽略 scroll 源直到滚动结束；`bounds` 接上或删掉。

6. **FloatButton** · 双端 · 亮/暗
   - 现象：示例不传 children，没有默认图标，Pages 上是空蓝圆/空蓝方。Group 恒 `Teleport`/`createPortal` 到 body + `fixed right-6 bottom-6`；示例外包 `relative h-56` + `position:absolute` 只是碰巧贴在 iframe 角。
   - 复现：https://expcat.github.io/Tigercat/vue/#/float-button （及 react）「悬浮按钮组」「独立悬浮」。
   - 源码：`float-button-utils.ts:12-40`；Vue `FloatButton.ts:148-151,231`；React `FloatButton.tsx:151`。
   - 建议：默认 plus/ellipsis 图标；Group 接 `placement`/`offset`/`portal`（对齐独立 FloatButton / BackTop）。

#### P2

7. **Menu `theme="light"`** · 双端 · 暗 · 默认把 `--tiger-surface/#ffffff` 等写进 class，不跟页面暗色。Pages `/menu` 01/03 暗色仍白底菜单；02 `theme="dark"` 才是 `#111827`。`menu-utils.ts:31-38`。
8. **Pagination 文案** · 双端 · Lang=English 时「共 240 条」+ `Go to` / `20 / page` 中英混排。`showTotal` 无 locale 块时走 `defaultTotalText` = `共 ${total} 条`，不读 `getPaginationLabels()`。Pages `/pagination` 暗色按钮本身跟 `--tiger-surface` `#111827`，可读。
9. **W7 overlay sandbox** · 双端 · Pages · Spotlight `fixed inset-0`、Dropdown/ContextMenu/NavMenu 绝对定位弹层，demo iframe 约 180px + 壳 `overflow-hidden`。同源 W2/W4/W5。
10. **BackTop** · 双端 · 隐藏钮 `opacity-0 pointer-events-none` 仍可 Tab/Enter；默认英文 `Back to top`。`position:auto` 首帧当 window → `fixed`。真实路由 `/backtop`。
11. **ContextMenu** · 双端 · 触发 `div` 无 tabindex，示例虚线盒 Shift+F10 进不去；Sub 把 click 吞掉，触屏开不了「分享到」。右键本身 Pages 可开（实测 `menus>=1`）。
12. **NavigationMenu mega** · 双端 · 面板 `role="group"` 无 `menu` 祖先却有 `menuitem`；`min-w-[28rem]!` 窄 iframe 易裁。点「产品」后 `role=menu` 计数为 0。
13. **W7 muted token** · 双端 · 暗 · Breadcrumb/PageHeader/Tabs 未选项/Anchor/ScrollSpy 打未注册 `--tiger-text-muted,#6b7280`（W3 跨切）。
14. **Anchor / ScrollSpy 示例** · 双端 · 暗 · `bg-blue-50`/`bg-green-50` 叠浅字；`anchor-03` href 无对应 `id`；`anchor-01` `getContainer=window` + auto iframe 不滚动；Link 无 `aria-current`（ScrollSpy 有 `location`）。
15. **FloatButton Vue `aria-label`** · Vue · 后写 `ariaLabel ?? tooltip` 盖掉模板 `aria-label`。示例 01 运行时是 tooltip「操作」。React 原生 aria 胜出。
16. **Menu 弹出子菜单键盘 / `popupPortal`** · 双端 · 水平/折叠 popup 不 focus 首项；`popupPortal` 默认 false。inline 示例键盘展开可用。
17. **Tabs overflow / centered** · 双端 · 无横向滚动；`type="line"` 的 `centered` 被 `repeat(n,1fr)` 抵消。Pages 2–3 项看不出。
18. **Tree `showIcon` / 展开初始化** · 双端 · 文档写展开图标，实现只控 `node.icon`；Vue `watch(treeData)` 重置展开；React `defaultExpandAll` 只在 mount（懒加载例看不出）。
19. **Steps** · 双端/Vue · `clickable` 只有 title `<button>`；Vue 不 flatten `v-for` Fragment（Pages 静态子节点正常，`nCurrent=1`）。
20. **Spotlight `disableTeleport`** · React 无；空结果 `aria-controls` 仍指向未渲染 listbox。默认 title `"Spotlight"`。

#### P3

21. **`/back-top` 空页** · `app-config` 路径 `/backtop`（同类 W6 `/container`）。
22. **英文 aria** · Breadcrumb / 折叠 ellipsis / PageHeader `'Back'` / Dropdown 默认 hover 无键盘。
23. **死 API** · `DropdownItem.icon`；`ContextMenuSub.itemKey`（仅 Vue 声明）。
24. **PageHeader 标题 `div`** · 不是 heading。
25. **Pagination** · 页码无方向键；simple 指示不走 `labels.pageIndicatorText`。
26. **Tree search 在 `role="tree"` 内** · 示例未开 `searchable`；checkbox 未 `tabIndex=-1`。
27. **Dropdown / ContextMenu** · `aria-expanded` 在非交互 wrapper 上（测试关掉了 `aria-allowed-attr`）。

#### 本波次无明显问题

Breadcrumb 分隔符/maxItems 折叠（`…` 可点开）、PageHeader 返回+标题+actions、Tabs 主路径 `tablist/tab` 与 card/pills/line 结构、Steps 静态三项 + `aria-current="step"`、Menu inline 搜索/选中/禁用、Pagination 翻页钮/当前页 `aria-current`（暗色走 surface，可读）、ContextMenu 右键能开、ScrollSpy `aria-current="location"` 初始第一项、Affix 顶钉 + 自定义 target（示例 01 滚动后「已固定」）、BackTop `/backtop` 容器 sticky 与 window fixed 能挂上。无页面级横向溢出。无 P0。

站点级（W1 已记）：Lang=English、标题仍中文；部分 iframe evaluate 超时/compiling；`dark:` 工具类在 sandbox 常不生效。不单列新 P1。

测试：Pagination size 变化「不发 onChange」有覆盖，抓不到示例漏绑 `onPageSizeChange`。Affix 单测偏 offsetTop。Anchor/ScrollSpy 不覆盖「末段赢不了」。Tree 未断言暗色 `bg-white`。

#### Pages 视觉摘记

| 页 | 亮色 | 暗色 |
| --- | --- | --- |
| `/affix` | 01 滚动后「已固定」；02 首屏已钉 iframe 底，P1 | 同左 |
| `/anchor` | 03 无目标 id；02 点末项高亮不切，P1 | 区块 `bg-blue-50` 叠浅字，P2 |
| `/back-top` | **无此路由**，空页 | 同左 |
| `/backtop` | 隐藏钮 opacity 0 仍在 DOM | 同左 |
| `/breadcrumb` | 分隔/折叠可见 | muted 灰字，P2 token |
| `/dropdown` | 点击可开；Vue「保持展开」仍关，P1 | 面板走 surface |
| `/context-menu` | 右键可开 | 示例 `bg-gray-50` 浅岛 |
| `/navigation-menu` | 触发器可见；mega 非 `role=menu` | 同左 |
| `/page-header` | 返回+标题+按钮正常 | subtitle muted |
| `/float-button` | 空蓝圆/空蓝方，P1 | 空心圆变浅蓝 `rgb(96,165,250)` |
| `/menu` | inline 搜索/选中正常 | 01/03 白菜单岛，P2；02 深色 theme 正常 |
| `/pagination` | 当前页蓝底；Vue 改 size 可用 | 按钮跟 surface，可读；React size 弹回，P1；「共 N 条」+ Go to 混排，P2 |
| `/scroll-spy` | 初始第一项高亮 | 点末项不切，P1；蓝/绿 50 底，P2 |
| `/spotlight` | 触发钮可见；面板困 180px，P2 | 同左 |
| `/steps` | 三项 + 上/下一步可见 | 同左 |
| `/tabs` | 概览/动态可点 | 跟 surface；card 顶圆角 |
| `/tree` | 勾选/展开可见 | **白底白字空白卡**，P1 |

### W8 Data

> Pages 实机：puppeteer-core + Google Chrome 打开 `https://expcat.github.io/Tigercat/{vue,react}/#/<path>`，亮色 + `html.dark`（`tigercat-example-dark`），1440×900，390 宽抽样。对照 `packages/{core,vue,react}` 与 `examples/example/{vue3,react}`。iframe 为 srcdoc sandbox，交互进 frame。Vue/React 示例结构、文案、暗色行为基本对称。`/table` 标题 8 块，本波稳定等到 5 个 iframe（01–05）；06–08 未编译进 frame，固定列/加载/展开以源码为主。

#### P1

1. **Calendar `mode="year"`** · 双端 · 亮/暗
   - 现象：年视图是 12 个月份芯片，不是日网格。点击只改 `aria-selected` 并 `panel-change`，不写 `v-model`/`value`。`disabledDate` 只在日按钮上调用，月份全部 `disabled=false`。示例标题「年视图与禁用日期」，周末禁日完全看不见。
   - 复现：https://expcat.github.io/Tigercat/vue/#/calendar （及 react）→ 第二块。实测 12 个月、`disabled=0`；点 Mar 后选中 Mar，无日期回显。`fullscreen` 下月份钮可被拉到约 292px 宽。
   - 源码：Vue `packages/vue/src/components/Calendar.ts` `selectMonth`（只 `viewMonth` + `panel-change`）；React `Calendar.tsx` 同构。`disabledDate` 仅日网格。示例 `examples/.../calendar/02` + `demo.json`。
   - 建议：点月份 emit 该月 1 日或切到 month 模式；月份也走 `disabledDate`（该月所有日都禁则禁）；示例 02 用月视图演示周末禁用。

2. **Table 默认分页被 `current:1` 锁死** · 双端 · 亮/暗
   - 现象：默认 `pagination` 含 `current: 1`、`pageSize: 10`。Vue `currentPage` 优先读 `pagination.current`；React `isCurrentPageControlled = current !== undefined`。Next 只更新内部 ref 并 emit，显示仍停在第 1 页。测试用 `defaultCurrent`/`defaultPageSize` 或 `pagination={false}`，抓不到默认对象。
   - 复现：源码路径如下。Pages `/table`「分页与行选择」`:pagination="{ ...page }"` + `@page-change` / `onPageChange={setPage}`，实测 成员 1–5 → 6–10、`Page 2 of 3`，勾选可用。
   - 源码：Vue `packages/vue/src/components/Table/props.ts` 默认值 + `Table/state.ts` `currentPage`/`handlePageChange`；React `Table.tsx:69-76` + `Table/state.ts` `isCurrentPageControlled`。
   - 建议：默认改 `defaultCurrent`/`defaultPageSize`（不要写 `current`）；补测试：15 行、不传 pagination，点 Next 行要变。

3. **Table `virtual` / `autoVirtual` 滚动盒** · React · 亮/暗
   - 现象：`autoVirtual` 默认 true、阈值 1000。一旦启用，React 把 `height:400px; overflow:auto` 打在外层 wrapper，导出钮、卡片列表、Pagination 都进同一滚动盒。Vue 只包内层 `<table>`。Pages `/table` 最多 12 行，触发不到。
   - 源码：React `packages/react/src/components/Table.tsx` `wrapperStyle`（`effectiveVirtual`）；Vue `packages/vue/src/components/Table.ts` 内层 scroller。`getTableVirtualRecommendation`。
   - 建议：对齐 Vue；`getTableWrapperClasses` 不要用未生效的 raw `virtual`。

#### P2

4. **W8 muted token** · 双端 · 暗 · Calendar 星期/‹›、Countdown 标题/suffix、Table 表头、Timeline 标签打未注册 `--tiger-text-muted,#6b7280`。Pages `/calendar` `/table` 暗色 weekday/th 实测 `rgb(107,114,128)`；单元格 `--tiger-text` 可读。Collapse 本身走 `--tiger-surface` / `--tiger-surface-muted`，暗色正常（header `rgb(31,41,55)` + 白字）。
5. **Table 筛选/排序/锁定硬编码灰** · 双端 · 暗 · `border-gray-300`、`text-gray-400`、锁定 `hover:text-gray-700`。Pages `/table` 02 暗色筛选框浅灰边 `oklch(0.872…)`。`getSortIconClasses`；Vue/React `render-header`。
6. **Table 示例 03 状态芯片** · 双端 · 暗 · `bg-green-50 text-green-700` / `bg-gray-100`。Pages 暗色「启用」仍浅薄荷底。示例 `table/03`。
7. **Collapse 折叠内容仍在 a11y 树 / extra 点击会切换** · 双端 · 关闭只 `max-height:0`，region 的 `innerText` 仍含关闭面板正文；无 `aria-controls`。`extra` 在 header `role="button"` 内。Pages `/collapse` 01 手风琴可从「如何安装？」切到「暗色主题」；03 点「已更新」会关。`CollapsePanel` Vue/React。
8. **Timeline alternate `position:left` 在右侧** · 双端 · 偶数项 `flex-row-reverse`，内容靠右。Pages `/timeline` 01：首项 `contentX=814`、轴 `headX=474`、`liW=926`。内容无半宽，不是对栏。`timeline-utils.ts` 45–48。03 pending 例 iframe 180 vs 内容 216，末项「处理中…」被裁。
9. **Calendar 年视图全屏拉宽；键盘 `parseDate` UTC** · 双端 · `fullscreen` 年视图月份钮被 `w-full`+三列网格拉成宽条。`moveDayFocus` 用 `parseDate('yyyy-MM-dd')` → `new Date(string)` UTC（W4 DatePicker 同源）。西时区方向键会错日；Pages 跑在 UTC 看不出。
10. **Calendar 受控视图不跟 value** · 双端 · `viewYear`/`viewMonth` 只初始化一次；点上月灰色日会改选中、格子不翻月。`Calendar.ts:61-100` / `Calendar.tsx:47-94`。Pages 月视图点本月 5 日、`选中日期：8/5/2026`、‹› 翻到 September 正常。
11. **Table `dataKey` 排序/筛选读错字段** · 双端 · 渲染/导出 `dataKey || key`，`sortData`/`filterTableData` 用 `column.key`。Pages 示例 key 即字段名，看不出。`table-utils.ts`。
12. **Table 排序表头不可键盘** · 双端 · `<th aria-sort onClick>`，无 button。鼠标：Vue/React 点年龄 `28→32→41` / desc `41→32→28`；点姓名 desc `王强,李娜,张伟`。
13. **Table `exportable` 假 Excel vs DataExport 真 xlsx** · 双端 · Table excel = HTML `.xls`；DataExport = OOXML zip。Pages `/data-export` 下拉 Export Excel / Markdown，点 Excel 后「最近导出：xlsx」（Lang=English 时按钮英文、旁路中文）。沙箱下载不一定落地，回调有。
14. **Countdown 已过期目标不停 timer** · 双端 · 挂载时 `remaining<=0` 把 `finished` 置真，interval 仍跑、不 `finish`。Pages 未来时刻正常走秒。Vue `Countdown.ts` `setupTimer`/`tick`；React 同。
15. **Table 筛选控件不绑定 `filters`** · 双端 · input/select 无 `value`。未受控输入仍能滤；受控回显空。`render-header`。

#### P3

16. **Timeline `pending` 文档 / 缺 `items`** · core 注释写「pending 连线」，实现追加 Loading 项 + `aria-busy`；`items` 不在 `TimelineProps`，生成 props 表没有数据源。
17. **Collapse `panelKey` 严格相等 / accordion 初值** · `includes` 不 coerce；accordion 不把初始多 key 收成一个。
18. **Table `groupBy` 文案 / advanced 列筛** · Vue `` `col: key (n)` `` vs React `key (n)`；advanced 规则生效时列上筛控件仍在。
19. **Calendar 翻页无 focus-visible** · 只有 hover。
20. **Timeline pending `border-white`** · Pages 03 暗色脉冲点 `border: rgb(255,255,255)`。
21. **Table Pages 06–08 iframe** · 标题有固定列/加载/展开，本波滚动 50s 仍常停 5 个 iframe（站点 compiling）。

#### 本波次无明显问题

Calendar 月视图选日 + 翻月（Vue/React 对称，暗色选中走 primary `rgb(96,165,250)` + 白字）。Collapse 手风琴/嵌套独立态/自定义 header。Countdown `D 天 HH:mm:ss` 与 10s `@finish` 路径（未来时刻）。DataExport 多格式下拉、xlsx/md 回调。Table 受控分页/勾选、未受控排序/年龄排序、卡片模式在 iframe 约 958px（小于 lg）下按设计出卡片。Timeline reverse + pending 文案、彩色点。无页面级横向溢出。无 P0。

站点级（W1 已记）：Lang=English、标题仍中文；DataExport 按钮「Export」+ 旁路「最近导出」；Pagination「Total 12 items」+ 中文行；部分 table iframe compiling。不单列新 P1。

测试：Calendar year 只断言 `panel-change`、不断言 `onChange`/`disabledDate`。Table 分页单测用 `defaultCurrent` 或 `pagination={false}`，抓不到默认 `current:1`。排序有覆盖。Countdown 过期目标不覆盖「不 finish 还在 tick」。

#### Pages 视觉摘记

| 页 | 亮色 | 暗色 |
| --- | --- | --- |
| `/calendar` 月视图 | 选日/翻月正常 | surface 跟主题；weekday muted 灰，P2 token |
| `/calendar` 年视图 | 12 个月份宽条，点月不改日期，禁日 0，P1 | 同左；选中浅蓝底白字 |
| `/collapse` | 手风琴/嵌套/extra 可点 | surface/muted 正常；折叠正文仍在 DOM，P2 |
| `/countdown` | `1 天 HH:mm:ss` / 10s 走秒 | 数字跟 `--tiger-text`；标题 muted |
| `/data-export` | 下拉 Excel/Markdown，回调 xlsx | 按钮 surface + 浅字，可读 |
| `/table` 01–03 | 斑马/排序/芯片可见 | 表头 muted；芯片浅底，P2 |
| `/table` 04 | 分页 1→2、勾选可用（受控） | 同左；默认 API 仍 P1 |
| `/table` 05 | iframe 宽约 958px，低于 lg 出卡片 | 同左 |
| `/table` 06–08 | 标题在，iframe 常 compiling | — |
| `/timeline` 01 alternate | 左右交错，但 left 在右，P2 | 标签 muted |
| `/timeline` 03 pending | reverse + 处理中；180px 裁末项 | 脉冲点白边，P3 |

### W9 Charts

> Pages 实机：puppeteer-core + Google Chrome 打开 `https://expcat.github.io/Tigercat/{vue,react}/#/<path>`，1440×900。亮色等 iframe SVG；暗色靠后续路由 `localStorage tigercat-example-dark` 冷启动（`html.dark`）。对照 `packages/{core,vue,react}` 与 `examples/example/{vue3,react}`。交互进 srcdoc sandbox frame：悬停 tooltip、点图例、拖 Gantt、点 OrgChart 节点。路由：`/bar-chart` `/line-chart` `/area-chart` `/pie-chart` `/donut-chart` `/scatter-chart` `/radar-chart` `/funnel-chart` `/gauge-chart` `/heatmap-chart` `/treemap-chart` `/sunburst-chart` `/org-chart` `/gantt`，以及 Advanced 里的 `/use-chart-interaction`。无独立 `/chart`。无 P0。

#### P1

1. **OrgChart `direction="horizontal"` 宽高对调** · 双端 · 亮/暗
   - 现象：横向本应是 160×72 横卡。`flipLayoutNode` 把 `width: node.height`、`height: node.width`，卡片变成 **72×160 竖条**。`Ada Chen` 挤在窄盒里，`Chief Executive Officer` 画出卡片。点选可用（选中 opacity=1，其余 0.35）。
   - 复现：https://expcat.github.io/Tigercat/vue/#/org-chart （及 react）→「组合展示」。实测 `rect` `w=72 h=160`。
   - 源码：`packages/core/src/utils/org-chart-utils.ts` `flipLayoutNode` / `computeOrgChartLayout`。示例 `examples/.../org-chart/01`。单测只断言 x/y，不断言宽高。
   - 建议：横向只交换坐标，节点盒保持 `nodeWidth`×`nodeHeight`；补测试 `direction=horizontal` 时 `width===160 && height===72`。

2. **OrgChart 暗色白底浅字** · 双端 · 暗
   - 现象：节点 fill 走未注册 `--tiger-bg` → `#ffffff`。姓名 `fill-[var(--tiger-text)]` 暗色是 `#f9fafb`，白卡上几乎看不见；职称走 `--tiger-text-muted,#6b7280` 还能认，但和溢出叠在一起。Pages 暗色是一排白竖卡贴在深页上。
   - 复现：同上路径切 Dark。实测 fill `rgb(255,255,255)`，label fill `rgb(249,250,251)`。
   - 源码：`org-chart-utils.ts` `orgChartNodeRectClasses` / `orgChartNodeLabelClasses` / `orgChartNodeTitleClasses`。`--tiger-bg` 不在 `THEME_CSS_VARS`。
   - 建议：卡片 `--tiger-surface`，字 `--tiger-text` / `--tiger-text-secondary`。

3. **Scatter `animated` + diamond/square/triangle** · 双端 · 亮/暗
   - 现象：点路径用 SVG `transform="translate(cx,cy)"`，入场 CSS `@keyframes` 写 `transform:scale(0→1)`。CSS transform 盖掉 SVG translate，四点堆在绘图区左上。Pages 01 只见 y 轴「70」旁一颗大菱形；悬停 tooltip `D: (55, 75)`（命中堆在原点的 D）。`getBoundingClientRect` 四枚都在 iframe 约 (32,30) 一带，属性 `translate` 仍是 67/169/270/372。
   - 复现：https://expcat.github.io/Tigercat/vue/#/scatter-chart （及 react）→「组合展示」`point-style="diamond"` + `animated`。示例 02 无 `animated` 的 circle/square/triangle 位置正常。
   - 源码：Vue `ScatterChart.ts` path + `SCATTER_ENTRANCE_KEYFRAMES`；React 同构。`chart/path.ts` `getScatterPointPath`。
   - 建议：动画写成 `translate(cx,cy) scale(...)`，或 `transform-box: fill-box; transform-origin: center`；`<circle>` 用 `cx/cy` 所以没这问题。

4. **Sunburst `showLabels` 死 API** · 双端 · 亮/暗
   - 现象：默认 true、示例写了 `show-labels`，渲染只有弧 `<path>`，没有任何 `svg text`。子层（中国/日本/印度）只能靠猜。图例只有三根（亚洲/欧洲/美洲）。React 参数名 `_showLabels`。
   - 复现：https://expcat.github.io/Tigercat/vue/#/sunburst-chart （及 react）。实测 `sunburstTexts=[]`。
   - 源码：Vue `SunburstChart.ts` 只 map path；React `SunburstChart.tsx:37`。`tooltipFormatter` 同样传入 `undefined`。
   - 建议：按 `arc.midAngle` 画标签，或删除 prop/示例。

#### P2

5. **Gantt 无拖拽；暗色斑马浅底** · 双端 · 条只支持 click/hover/select。Pages 拖完 `x` 仍 `161.67`。无 zoom。暗色行 `--tiger-fill,#f9fafb` 浅灰条，轴 `1月` fill `rgb(107,114,128)`。`gantt-utils.ts`；Vue/React `Gantt`。要排期再接线；token 改 `surface-muted` / `text-secondary`。
6. **图例是选中不是开关** · 双端 · Pages `/bar-chart` 01 tooltip `Mon: 120` 可用；点图例 Mon 后其余 `opacity=0.5`，不能隐藏系列。`aria-pressed` 像 toggle。`useChartInteraction.handleLegendClick`。
7. **Radar 暗色浅分割盘** · 双端 · Pages `/radar-chart` 五边形内部浅薄荷/白。`RADAR_SPLIT_AREA_COLORS` + `--tiger-bg,#ffffff` 挖洞。
8. **`showTooltip` 离不开 `hoverable`** · 双端 · 默认 tooltip true、hoverable false。Pages `/bar-chart` 02、`/heatmap-chart` 02 文案写提示，悬停无框。
9. **Funnel `direction` 等死 API** · 双端 · horizontal 几何不存在；Heatmap/Gauge `colors` 未读。Pages 没用 horizontal。
10. **TreeMap 只画叶子** · 双端 · Pages `/treemap-chart` Vue/React/运维/Node/Go，没有「前端/后端」。`flattenData`。
11. **`responsive` 撑 iframe 不重算柱** · 双端 · Pages `/bar-chart` 01 SVG 约 926×688，柱仍按 420×240。ChartCanvas 改 viewBox，series 仍读 props。
12. **Heatmap 浅格数字 / `tooltipFormatter` 未接线** · 双端 · 格字 `--tiger-text`；Vue formatter 声明了传 `undefined`。canvas `fillStyle='var(--tiger-text)'` 无效。示例 01 SVG + 浅黄格。
13. **W9 muted token** · 双端 · 暗 · Gantt 轴、Org 职称 `--tiger-text-muted`（W3 跨切）。笛卡尔轴已走 `--tiger-text-secondary`，Line/Area/Heatmap 暗色刻度 `rgb(209,213,219)` 可读。Tooltip 未注册 `--tiger-bg-elevated` 碰巧永远深底浅字。

#### P3

14. **Sunburst 焦点无 Enter** · 双端 · `tabIndex` 无 keydown。Heatmap/TreeMap 无键盘。
15. **ChartCanvas 无默认 img 角色** · 双端 · Gantt/Org 自己补了。Gauge 整卡 `tabIndex` 只为 tooltip。
16. **Vue ChartTooltip 立即读 `window`** · Vue · `immediate` watch。React 有 `isBrowser()`。
17. **Gantt/Org 默认英文 aria** · `'Gantt chart'` / `'Organization chart'`。
18. **Donut 7–9 色复用 chart-1..3 token** · 主题下第 7 片与第 1 片同色。
19. **Vue Donut `slice-click` 参数对调** · Pie emit `(index, datum)`，Donut handler `(datum, index)`。Pages 未绑。

#### 本波次无明显问题

Line/Area 折线、空心点、图例在暗色可读（`--tiger-text-secondary`）。Pie 外侧标签 + 引导线。Donut 中心「1014 / 访问量」跟 token。Gauge 82% 指针。Funnel 纵向标签。Heatmap 5×3 色阶可见。TreeMap 叶子色块。Gantt 月份/周刻度、依赖线、受控选择（点条可选，只是不能拖）。OrgChart 纵向示例 02（`node-width=180`）卡片尺寸正确。`/use-chart-interaction` 能画。无页面级横向溢出。无 P0。Vue/React 视觉与缺陷对称（Sunburst `_showLabels`、Funnel `_direction` 仅 React 命名更明显）。

站点级（W1 已记）：Lang=English、标题仍中文。不单列。无缩放/刷选 UI（core 有 `applyChartBrush` 未接线）。

测试：OrgChart horizontal 不断言宽高。Scatter 入场动画不覆盖 path+CSS transform。Sunburst 不断言弧上文字。Gantt 无拖拽用例。Bar `responsive` 不断言 scale 随容器变。

#### Pages 视觉摘记

| 页 | 亮色 | 暗色 |
| --- | --- | --- |
| `/bar-chart` 01 | tooltip `Mon: 120` 可用；`responsive` 把 SVG 撑很高，P2 | 轴 `text-secondary` 可读 |
| `/bar-chart` 02 | 无 hoverable，提示出不来，P2 | 同左 |
| `/line-chart` `/area-chart` | 线/面积/空心点正常 | 轴浅灰字可读 |
| `/pie-chart` | 外标签+引导线 | 同左 |
| `/donut-chart` | 中心 1014 对齐 | 中心跟 `--tiger-text` |
| `/scatter-chart` 01 | 菱形堆左上，P1 | 同左 |
| `/scatter-chart` 02 | circle/square/triangle 位置正常 | — |
| `/radar-chart` | 双系列可读 | 内盘浅色，P2 |
| `/funnel-chart` | 纵向漏斗+图例 | 标签 secondary |
| `/gauge-chart` | 82% 指针 | 跟主题 |
| `/heatmap-chart` | 色阶/数字可见 | 浅格对比弱，P2 |
| `/treemap-chart` | 五块叶子 | 白字着色块可读；无父节点，P2 |
| `/sunburst-chart` | 环无字，P1 | 同左 |
| `/org-chart` 01 横向 | 72×160 竖卡+职称溢出，P1 | 白卡浅字，P1 |
| `/org-chart` 02 纵向 | 180×72 正常，点选可用 | 仍白底（`--tiger-bg`） |
| `/gantt` | 条/依赖/选中可用，拖不动，P2 | 浅斑马+muted 轴 |
| `/use-chart-interaction` | 能画 | 轴可读 |

### W10 Advanced

> Pages 实机：puppeteer-core + Google Chrome 打开 `https://expcat.github.io/Tigercat/{vue,react}/#/<path>`，1440×900。亮色；暗色用 `localStorage tigercat-example-dark` 后 reload（`html.dark`）。iframe 等到 footer 不是 `compiling` 且 frame 有正文。对照 `packages/{core,vue,react}` 与 `examples/example/{vue3,react}`。交互进 srcdoc：FileManager 单击、Kanban「+ Add task」、RTE/Markdown Bold、InfiniteScroll 滚到底、VirtualList/VirtualTable 滚、ImageViewer 打开、CodeEditor 输入。路由：`/code-editor` `/use-drag` `/file-manager` `/image-annotation` `/image-viewer` `/infinite-scroll` `/kanban` `/markdown-editor` `/print-layout` `/rich-text-editor` `/virtual-list` `/virtual-table`。无独立 `/drag`，实为 `/use-drag`。无 P0。Vue/React 视觉与缺陷对称。

#### P1

1. **FileManager / MarkdownEditor / RichTextEditor / PrintLayout / ImageAnnotation 暗色白底浅字** · 双端 · 暗
   - 现象：chrome 用未注册 `--tiger-bg,#ffffff`（或 PrintLayout 锁 `bg-white`），正文走已主题化 `--tiger-text`（暗色 `#f9fafb`）。Pages 暗色是白文件管理器/白编辑面/白纸，文件夹名、Release notes、Hello Tigercat、「第一页」都近不可见。ImageAnnotation 未选工具钮白底浅字（Select/Ellipse/Polygon/Freehand 空白胶囊；Rectangle 选中蓝底白字可读）。FileManager 实测容器 `bg: rgb(255,255,255)` + `color: rgb(255,255,255)`。
   - 复现：https://expcat.github.io/Tigercat/vue/#/file-manager （及 react）切 Dark；`/markdown-editor` `/rich-text-editor` `/print-layout` `/image-annotation` 同。
   - 源码：`file-manager-utils.ts` `fileManagerContainerClasses` / `fileManagerToolbarClasses`（`--tiger-bg-secondary` 同样未注册）；`markdown-editor-utils.ts` `markdownEditorContainerBase`；`rich-text-editor-utils.ts` `richTextContainerBase`；`print-layout-utils.ts` `printLayoutBaseClasses`；`image-annotation-utils.ts` `getImageAnnotationToolButtonClasses`。`--tiger-bg` 不在 `THEME_CSS_VARS`（同 W7 Tree / W9 OrgChart）。
   - 建议：容器/工具条改 `--tiger-surface` / `--tiger-surface-muted`；Print 纸面保留白底但强制深色墨（如 `#111827`）；工具钮 bg/text 成对走 token。

2. **VirtualList 示例斑马暗色不可读** · 双端 · 暗
   - 现象：偶数行 `bg-gray-50`（实测 `oklch(0.985…)` 近白），字继承 `--tiger-text` 浅色。Pages `/virtual-list` 暗色「第 1/3/5 行」看不见，奇行正常。组件本身 `virtualListContainerClasses` 已 fallback `--tiger-surface`。
   - 复现：https://expcat.github.io/Tigercat/vue/#/virtual-list （及 react）切 Dark。
   - 源码：`examples/example/{vue3,react}/src/examples/virtual-list/01`。
   - 建议：斑马改 `surface-muted`，或组件提供 striped token。

3. **FileManager 选择无内部态** · 双端 · 亮/暗
   - 现象：`selectedKeys` 默认空数组，点击只 emit，不写 inner。示例 01 开了 `multiple` 但没绑 keys。Pages 点 docs/README 后 `aria-selected` 仍 `false`，无高亮。示例 02 绑了 `selectedKeys`，按设计能工作。
   - 复现：https://expcat.github.io/Tigercat/vue/#/file-manager 「列表与导航」（react 同）。单击实测 `afterClick.selected=false`。
   - 源码：Vue `FileManager.ts:160-164`；React `FileManager.tsx:96-104`；示例 `file-manager/01`。
   - 建议：非受控内部 `selectedKeys`（对齐 02），或 01 补 `v-model:selectedKeys`。

4. **Kanban「+ Add task」不增卡片** · 双端 · 亮/暗
   - 现象：Kanban 默认 `allowAddCard=true`，列脚「+ Add task」可见。点击只 `emit('card-add')`（React 还要调用方 `onCardAdd`），不改 `columns`。示例开了 `allow-add-card` / `allowAddCard` 且没 handler。Pages 点完仍是 设计界面/补充文档/实现看板 三张。
   - 复现：https://expcat.github.io/Tigercat/vue/#/kanban （及 react）。Vue `kanbanAfterAdd` 长度仍 3；React 同。
   - 源码：Vue `TaskBoard.ts:501-526`；React `TaskBoard.tsx:349-367`；示例 `kanban/01`。测试只断言 emit，不断言卡片数。
   - 建议：无 handler 时插入默认卡并 `update:columns`，或示例补 `@card-add` / `onCardAdd`。

#### P2

5. **PrintLayout 屏上页眉页脚隐藏** · 双端 · `printLayoutHeaderClasses` / `Footer` 是 `hidden print:block`。示例写了 `show-header`/`header-text="季度报告"`，计算样式 `display:none`。亮色正文可读；暗色浅字叠白纸（P1）。建议屏幕预览可见，或文档写清仅打印。
6. **RichText 工具栏换行 + `prompt`** · 双端 · 默认 16 个英文 label，Pages `/rich-text-editor` `Clear` 掉到第二行。Bold 实测可用（输入 XYZ 后 `aria-pressed=true`，html 仍是 `<p>Hello <strong>Tigercat</strong>!XYZ</p>`——未选中文本时按下只改 activeFormats）。Link/Image 走 `window.prompt('Enter URL:')`。
7. **Markdown 工具栏插入可用** · 双端 · Pages 点 B 后源码变成 `ABC**strong text**`，预览有 `<strong>`。暗色白底见 P1。模式钮 Edit/Split/Preview 走 locale。
8. **CodeEditor `theme` 与滚动层** · 双端 · 示例 01 锁 `theme="dark"`，亮/暗页都是深色编辑器，高亮可读（`function` 紫 / 字符串绿）。textarea 与 highlight 各 `overflow-auto`，源码无 scroll 同步；短示例滚不动。建议 theme 默认真跟随页面，滚动共用一个 scroller。
9. **FileManager 拖拽重排只交当前层** · 双端 · `emit('update:files', processedItems)`。根目录 demo 不开启 `draggable`。进子目录再拖会丢掉上层 tree。
10. **VirtualTable 选择不可见** · 双端 · 无 checkbox 列，点行才 toggle；选中类 `primary/5`。Pages 01 `defaultSelectedRowKeys:[2]` 第 2 行看不出。滚动正常：滚到「用户 41」。暗色表头/条纹走 table token，对比可读（本组少数暗色正常的面）。
11. **ImageAnnotation 外链图** · 双端 · `picsum.photos` 未加载时舞台是空白 `--tiger-bg-muted` 块，矩形提交被 `minSize` 挡住。工具钮暗色见 P1。polygon 要点击后 Enter 才提交。
12. **InfiniteScroll 横向 sentinel** · 双端 · 竖向 Pages 滚到底 10→30 并出「没有更多数据了」，暗色条目可读。sentinel 写死 `height:0`，横向例可能不提前触发。

#### P3

13. **FileManager** · 双端 · 面包屑 `aria-label="File path"` 英文硬编码。
14. **RTE / Markdown 按钮文案** · 双端 · 不走 locale（只 toolbar aria 和 Markdown 模式钮走）。
15. **CodeEditor `aria-label="Code editor"`** · 双端 · 不走 locale。
16. **useDrag 无键盘** · 双端 · HTML5 `draggable` + `aria-grabbed`。Pages `/use-drag` 四张卡片渲染正常。自动化 `dragAndDrop` 需 CDP interception，未当成功能失败。
17. **ImageViewer** · 双端 · 本组确认 W2 已记：亮色工具条/导航 `--tiger-surface` 白底 + `text-white`；`fixed` 困在约 180px iframe。关闭钮在暗遮罩上仍可见。不重复开 P1。暗色工具条对比好转，仍困在 iframe。

#### 本波次无明显问题

InfiniteScroll 竖向加载与结束文案双端可用，暗色条目对比正常。VirtualList 滚动窗口正确（滚到第 91 行）。VirtualTable 固定列 + 条纹 + 暗色 token 可读，虚拟滚动能出「用户 41」。Kanban 暗色列/卡走 `--tiger-surface-muted` / `--tiger-surface`，对比正常（Add task 除外）。CodeEditor 语法高亮在 `theme="dark"` 下可读。RTE 亮色 Bold `aria-pressed` 会变。Markdown 亮色分栏预览标题「Release notes」可读。useDrag 列表结构对称。无页面级横向溢出。无 P0。Vue/React 缺陷对称。

站点级（W1 已记）：Lang=English、标题仍中文；Kanban 列名中文 + 「Add task」/「No tasks」英文混排，跟 locale 一致，不单列。ImageViewer 白底白字已在 W2。

#### Pages 视觉摘记

| 页 | 亮色 | 暗色 |
| --- | --- | --- |
| `/code-editor` | 01 深色主题高亮可读 | 01 仍深色可读；02 只读是浅色岛 |
| `/use-drag` | 四张卡片正常 | 跟 surface |
| `/file-manager` | 列表/搜索可读；点了不高亮，P1 | 白底浅字，P1 |
| `/image-annotation` | 工具条英文；图未加载则空白舞台，P2 | 白工具钮浅字，P1 |
| `/image-viewer` | 打开后白底白图标 + 180px iframe（W2） | 工具条深底好转；仍困 iframe |
| `/infinite-scroll` | 滚到底 30 条 + 结束文案 | 条目可读 |
| `/kanban` | 列/卡/WIP 1/2 正常；Add task 无效，P1 | 列卡跟 token，可读；Add 仍无效 |
| `/markdown-editor` | 分栏预览 + Bold 插入可用 | 白编辑面浅字，P1 |
| `/print-layout` | 第一页/分页线可读；页眉屏上隐藏，P2 | 白纸浅字，只见 Page Break，P1 |
| `/rich-text-editor` | Hello **Tigercat**；工具条换行，P2 | 白编辑面浅字，P1 |
| `/virtual-list` | 斑马可读；滚动到 91+ | 偶行白条浅字，P1 |
| `/virtual-table` | 固定列/条纹；选中看不出，P2 | 表体 token 可读 |

### W11 Composite

> Pages 实机：playwright-core + Google Chrome 打开 `https://expcat.github.io/Tigercat/{vue,react}/#/<path>`，1440×900。亮色；暗色 `localStorage tigercat-example-dark` + `html.dark` 后 reload。iframe 等到正文。对照 `packages/{core,vue,react}` 与 `examples/example/{vue3,react}`。交互进 srcdoc：Chat 发送、FormWizard 继续/提交、表格搜索「李娜」、TaskBoard「新增任务」、Notification 标记已读、Comment 点赞/回复。路由：`/activity-feed` `/chat-window` `/comment-thread` `/form-wizard` `/notification-center` `/data-table-with-toolbar` `/task-board` `/crop-upload`（Pages 组合导航 8 条，含 CropUpload）。Kanban 在 Advanced，Add task 无效只交叉引用 W10。无 P0。Vue/React 视觉与主路径对称（React 自动化偶发首帧超时，截图结构一致）。

#### P1

1. **ChatWindow Vue `onUpdated` 把输入也当成「新消息」滚到底** · Vue · 亮/暗
   - 现象：`scrollToBottom` 同时挂 `onMounted` / `onUpdated` / `watch(messages.length)`。受控 `v-model` 每键都会 `onUpdated`，正在翻历史时列表被拽回底部。React 只依赖 `messages.length`。
   - 复现：https://expcat.github.io/Tigercat/vue/#/chat-window 「虚拟消息与输入模式」（120 条）滚到上面再打字。01 发送路径正常：输入 `W11 ping` → 右侧蓝泡 +「已送达」。
   - 源码：Vue `ChatWindow.ts:206-226`；React `ChatWindow.tsx:179-189`。
   - 建议：删 `onUpdated`；用户 `scrollTop` 离开底部时不要强制跟随。

2. **TaskBoard 过滤后的 DOM 下标写回全量 `columns`** · 双端 · 亮/暗
   - 现象：`visibleColumns = filterColumns(...)` 决定画哪些卡；`getDropIndex` 读可见卡的 `DOMRect`；`applyCardMove` / `moveCard` 用的是未过滤数组。过滤后拖到「最后」会插进隐藏卡的位置。
   - 复现：https://expcat.github.io/Tigercat/vue/#/task-board （及 react）→「列拖拽与自定义卡片」，过滤「发布」再拖剩余卡。01「新增任务」已核实：待办 2→3 出现「新任务」，进行中 WIP `1/2`；**不是** W10 `/kanban` Add 无效。
   - 源码：Vue `TaskBoard.ts:166-193`；React `TaskBoard.tsx:460-503`；`task-board-utils.ts` `getDropIndex` / `moveCard`。
   - 建议：过滤下标映射回源列 index，或过滤只做 CSS hide。

#### P2

3. **W11 muted token** · 双端 · 暗 · Chat「客服 / 已送达 / 时间」、Comment 点赞/职称、Activity `09:30`、Notification 时间、TaskBoard「+ 新增任务」走 `--tiger-text-muted,#6b7280`（W3 跨切）。Pages 暗色 chrome 已是 `--tiger-surface` / `surface-muted`，灰字可读，没有 W10 那种白底浅字。建议 alias 到 `text-secondary`。
4. **Chat / Comment / Activity / Notification 默认中文不跟 ConfigProvider** · 双端 · FormWizard / TaskBoard / CropUpload 走 locale：Pages Lang=English 时 CropUpload 触发器是 `Select image`，Chat 发送钮仍是「发送」，Comment 仍是「▾ 收起回复 / ▸ 展开 4 条回复」。`defaultChatMessageStatusInfo` 的「已送达」也无法 i18n。源码：`chat-window-utils.ts:13-16`；CommentThread Vue `533` / React `350`。
5. **FormWizard `skipCondition` 只对 Next/Prev 生效** · 双端 · `handleStepChange` 不读 skip。Pages 01 填 Alice → 继续 → 提交，「提交完成」双端都出现；02 默认不可点步骤，点继续会跳过未勾选的「团队」。`clickable` 时能点进被 skip 的步。源码：Vue `FormWizard.ts:271-277`；React `169-178`。
6. **NotificationCenter `manageReadState` 随 `items` 引用清空** · 双端 · Vue watch `items`、React `useEffect([items])` `new Map()`。Pages 01 内部态点完变成「标记未读」；02 父级 `read` 同步。内联新数组会丢本地已读。源码：Vue `208-213`；React `125-127`。
7. **CommentThread 01 点赞无内部态** · 双端 · 只 emit。Pages 01「点赞 3」点完仍 3，回复框会打开；02 绑了 `@like`，可到「已赞 9」+「点赞：Ada」。建议 01 对齐 02，或组件自己 toggle `liked`。
8. **ChatWindow 虚拟行 88px** · 双端 · 示例 02 `virtual` + `show-time`，气泡+状态+时间高于 `virtualItemHeight`。源码：`chat-window/02`；默认 88。
9. **DataTableWithToolbar 工具条硬编码 `dark:bg-gray-800`** · 双端 · 叠在 `surface-muted` 上。Pages 01 搜索「李娜」3 行→1 行（Vue 实测；React 同结构）。单元格仍显示 raw `paused`（P3）。
10. **Vue TaskBoard `onCardAdd` 不调用** · Vue · 显隐看 prop，点击只 emit。React 调 callback。Pages 01 `@card-add` 所以正常。
11. **CropUpload 触发器 `dark:bg-neutral-900`** · 双端 · Pages 暗色虚线盒可读。打开后的裁剪 Modal 是 `fixed`，困在 sandbox（W5）。ImageCropper 无输出按钮见 W2。
12. **泳道 collapsed 不可点；加卡不 enforce WIP** · 双端 · 头 `cursor-pointer` 无 toggle；`enforceWipLimit` 只拦 drop。Pages 01 进行中 1/2 仍能点「新增任务」。

#### P3

13. **表格示例状态列** · 筛选项中文、单元格 `active`/`paused`。
14. **Notification 全部/未读/已读芯片** · 无 `aria-pressed`。
15. **`tableClassName` 仅 React** · Vue 靠 attrs。
16. **CropUpload 确认得到 `null`** · Modal 不关。
17. **TaskBoard 键盘** · 无方向键落列。
18. **`VueFormWizardProps` 漏 `bordered`/`autoSave`**。
19. **表格 05 自定义工具条 `bg-blue-50`** · sandbox `dark:`（W1）。

#### 本波次无明显问题

ActivityFeed 分组/平铺/状态 Tag +「查看详情」亮暗可读（容器 `--tiger-surface`，不是 `--tiger-bg`）。Chat 01 发送、Enter、清空输入双端可用，对方泡 surface、自己泡 primary。Comment 02 点赞/展开/回复框。FormWizard 01 下一步/返回/提交。Notification 分组 Tab、已读筛选、标记已读。DataTable 01 搜索+状态筛；02 `filters-extra` 最低积分。TaskBoard 01 加卡 + WIP 徽章。CropUpload 触发器/自定义槽。无页面级横向溢出。无 P0。Vue/React 缺陷对称。

站点级（W1 已记）：Lang=English、中文标题；Avatar `维护者`→「维护」（W1 `getInitials`）；表格 Search 钮走 locale「Search」。Kanban Add 见 W10，不单列。CropUpload 弹层困 iframe 见 W5。

测试：Chat 不断言「输入不滚列表」。TaskBoard 过滤+drop 无对应用例。Comment 01 不断言点赞数变化。FormWizard skip 只测 Next。

#### Pages 视觉摘记

| 页 | 亮色 | 暗色 |
| --- | --- | --- |
| `/activity-feed` | 今天/成功 Tag/查看详情可读 | surface 卡可读；时间 muted |
| `/chat-window` 01 | 发送 `W11 ping` 可用 | 对方深底浅字可读；自己浅蓝泡 |
| `/chat-window` 02 | 虚拟 120 条；行高 88 偏紧，P2 | 同左；Vue 输入会拽回底部，P1 |
| `/comment-thread` 01 | 嵌套/回复框；点赞 3 不变，P2 | 可读 |
| `/comment-thread` 02 | 已赞 9 + 展开 4 条回复 | 同左；expand 中文，P2 |
| `/form-wizard` 01 | Alice → 提交完成 | 步骤条/按钮跟 token |
| `/form-wizard` 02 | beforeNext / skip 走 Next | 同左 |
| `/notification-center` | 分组/标记已读 | surface 卡可读；muted 时间 |
| `/data-table-with-toolbar` 01 | 李娜过滤 3→1 | 表体 token 可读 |
| `/task-board` 01 | 新增任务有效；WIP 1/2 | 列/卡 surface 可读 |
| `/task-board` 02 | 过滤+自定义卡 | 过滤下落点，P1 |
| `/crop-upload` | Select image / 上传头像 | 虚线触发器可读；Modal 见 W5 |

## 5. 后续优化 backlog

W12 从 §3/§4 提炼。原波次明细仍在 §4，此处只合并根因、排序、给 Coder 可执行队列。

### 5.0 计数摘要

| 级别 | §3 原文（未去重） | 去重后 | 去重规则 |
| --- | ---: | ---: | --- |
| P0 | 0 | **0** | 无阻断项 |
| P1 | 49 | **40** | 10 条暗色白底/未注册 token 收成 T1 一条工作包（仍按组件拆修，见 5.2.2A）；其余组件逻辑互不合并 |
| P2 | 112 | **约 105** | 去掉跨波重复记账：W4/W7/W8/W9/W11 muted（已在 W3 T1）、W5/W7 overlay sandbox（已在 W2/W4 T5） |
| P3 | 77 | **约 74** | 站点 compiling/空卡 3 条并入 W1 站点级（Demo harness、Table 后三 iframe、DataTable 05 `dark:`） |

未去重合计 238 条；去重后约 219 条可跟踪项。P0 应无，已确认。

### 5.1 跨组主题

同一根因跨波次只在这里展开。修复时先做主题一次修，再扫下列组件，避免逐个打补丁。

#### T1 主题 token / 暗色白底

根因两类常叠在一起：

1. **未注册变量**走浅色 fallback：`--tiger-text-muted` / `--tiger-fill` / `--tiger-bg` / `--tiger-skeleton-bg` / `--tiger-segmented-*` / `--tiger-alert-*` / `--tiger-message-*-bg` / `--tiger-avatar-bg` / `--tiger-layout-content-bg` / `--tiger-bg-elevated` / `--tiger-outline-bg-active`。token 产物里部分是 `--tiger-component-*`，组件没用。
2. **硬编码浅底**：`bg-white`、`bg-gray-50`、`bg-white/80`、`rgba(255,255,255,0.9)`、`text-red-900`/`green-900`/`gray-500`、Menu 把 `--tiger-surface` 写成 `#ffffff`。暗色 `--tiger-text` 已是浅字 → 白底浅字。

见 W1 Segmented/Kbd/Tag/Alert/AvatarGroup/Watermark；W2 QRCode 遮罩、ImageViewer 工具条 `text-white`+`--tiger-surface`；W3 表单 muted/fill/`*-900`、Signature `penColor='#111827'`；W4 muted、`--tiger-outline-bg-active`、Upload `bg-white`；W5 Loading 白遮罩、Message 浅色 token、区域加载 `bg-white/85`；W6 Skeleton、Layout/Container 示例、Splitter gutter `bg-gray-200`；W7 Tree `bg-white`、Menu `theme="light"`、Breadcrumb/Tabs muted；W8 Table 灰边/芯片、Calendar/Countdown/Timeline muted；W9 OrgChart `--tiger-bg`、Radar 挖洞白盘、Gantt 斑马 `--tiger-fill`；W10 FileManager/Markdown/RTE/Print/Annotation `--tiger-bg`/`bg-white`、VirtualList 示例 `bg-gray-50`；W11 muted（容器已 `--tiger-surface`，灰字仍可读）、DataTable 工具条 `dark:bg-gray-800`、CropUpload `dark:bg-neutral-900`。

一次修建议：

- `THEME_CSS_VARS`：`--tiger-text-muted` alias 到 `--tiger-text-secondary`；`--tiger-fill` → `surface-muted`；`--tiger-bg` → `surface`。
- chrome 禁止裸 `bg-white`；Print 纸面可保持白纸但强制深色墨。
- 状态色走 `--tiger-error` / `success` / `warning`，不要 `text-red-900`。
- ImageViewer 工具条/导航对齐 ImagePreview 的 `--tiger-image-toolbar-bg, rgba(0,0,0,0.6)`。
- 示例斑马/芯片改 token 或 Tag，不要 `bg-gray-50` / `bg-green-50`。

#### T2 受控绑定 / v-model 脱绑

根因三类：

1. **Vue emit 名与示例 v-model 不一致**：组件发 `update:value` / `update:modelValue`，示例写 `v-model` 或 `v-model:target-keys`。
2. **无非受控内部态**：点击只 emit，父不绑则 UI 不动；示例绑了所以 demo 看起来正常。
3. **默认值被当成受控**：默认对象带 `current`，实现「有 current 即受控」。

见 W3 Slider（`update:value` vs `v-model`）、Switch/Stepper/ColorSwatch 无内部态；W4 Transfer（`update:modelValue` vs `v-model:target-keys`）、AutoComplete 回写 raw value、React Form 校验旧值、React Upload 受控不 `onChange` 新数组；W7 Pagination 示例漏 `onPageSizeChange`；W8 Table 默认 `pagination.current:1` 锁死裸表；W10 FileManager `selectedKeys` 无 inner、Kanban `card-add` 不改 columns；W11 Comment 01 点赞不回写、NotificationCenter `items` 引用变化清 overrides。W11 TaskBoard 01 `@card-add` 可用，**不是** W10 `/kanban` Add 无效。

一次修建议：Vue 兼发 `update:modelValue` 与具名 update；补 `defaultValue`/inner；默认分页改 `defaultCurrent`/`defaultPageSize`；示例 01 至少绑一条受控或非受控路径。

#### T3 a11y

分散在各波，无单一 P0。P1 级：InputNumber `aria-*` 到不了 spinbutton（见 W3）；Input `errorMessage` 非 live region（见 W3）。

其余见 W1 ButtonGroup/ImageGroup 无名 `role="group"`、Tag 滥 `role="status"`；W2 QRCode Refresh 无角色、预览 aria 不走 locale；W3 Checkbox 无 `aria-checked="mixed"`、Radio 无 roving、Stepper 非 spinbutton、clear `tabIndex=-1`；W4 Cascader/TreeSelect 键盘不能选值、DatePicker grid 无 row；W5 Tour 无 `aria-labelledby`、Message 双重 live、BackTop 隐藏仍可 Tab（W7）；W8 Collapse 折叠仍在 a11y 树、Table 排序 `th` 不可键盘；W9 ChartCanvas 默认无 `role="img"`、Sunburst 可聚焦不能激活；W10 FileManager/CodeEditor 英文 aria、useDrag 无键盘；W11 通知筛芯片无 `aria-pressed`、TaskBoard 键盘拖无方向键。

#### T4 示例 / 文档 / 死 API

类型或 demo.json 写了、实现不读或示例绑错层。见 W1 Segmented `icon`、Empty/Result 预览裁切；W2 QRCode `level`、ImageCropper 无输出钮；W4 ColorPicker `format`/`showAlpha` 不回写、Cascader 无 Done；W6 Splitter 示例把 px 当「初始比例」、Skeleton Vue `animated` 不存在、`/container` 无路由；W7 DropdownItem `close-on-click` 写在 Item 上、`/back-top` 空页实为 `/backtop`、Tree `showIcon` 文档不符、`bounds` 死 API；W8 Calendar 年视图示例看不到禁日、Table 假 Excel vs DataExport 真 xlsx；W9 Sunburst `showLabels`、Funnel `direction`、Heatmap/Gauge `colors`；W10 Print 页眉仅 `print:block`、Kanban/FileManager 01 未绑事件；W11 FormWizard `skipCondition` 不拦点步骤、Comment 01 无 `@like`。站点 Lang=English 标题仍中文（W1 起）。

#### T5 sandbox / Pages 站点级

根因：demo iframe 默认约 180px + 壳 `overflow-hidden`；`fixed`/`absolute` 相对 iframe；`ResizeObserver` 不读 `fixed`；`sandbox` 无 `allow-same-origin`（clipboard 失败）；srcdoc 里 `dark:` 常不生效；强切 `html.dark` 会重建成 compiling 空卡。

见 W1 Empty/Result 固定高度裁切、Code clipboard、Lang 中英、demo 闪 loading；W2 ImagePreview/ImageViewer `fixed inset-0` 困死、图无 `max-h`；W4 DatePicker/TimePicker/Cascader 弹层高于 iframe；W5 Modal/Drawer/Tour/Loading 全屏/LoadingBar/Message/Notification；W6 Layout `min-h-screen` 撑到 720；W7 Spotlight/Dropdown/ContextMenu/NavMenu；W11 CropUpload 裁剪 Modal。路由空页：`/container`、`/back-top`。

一次修建议：弹层/预览类 demo 加高 viewport，或打开时 postMessage 撑 iframe；预览图 `max-h-[90vh] max-w-[90vw]`；sandbox 重建同步 `html.dark`；clipboard 需 `allow-same-origin` 或失败态；补 `/container` 挂载或重定向、`/back-top` → `/backtop`。

### 5.2 Coder 修复队列

按 P0 → 去重后全部 P1 → 值得先修的 P2。每行：组件 · 端 · 建议一句话。源码与复现仍以 §4 对应波次为准。

#### 5.2.1 P0

无。

#### 5.2.2 P1（去重后 40）

##### A. #1 T1 暗色白底 / 未注册 token（1 个工作包，10 处落地）

先改 core token，再扫组件，避免只改一处 fallback。下列 A1–A9 已从独立 P1 并入本包；A10 与下方 #19 是同一条（工具条对比），扫 T1 时一起改。

| # | 组件 | 端 | 见 | 建议 |
| --- | --- | --- | --- | --- |
| A0 | `THEME_CSS_VARS` | core | W3 | 注册 `--tiger-text-muted`→`text-secondary`，`--tiger-fill`→`surface-muted`，`--tiger-bg`→`surface` |
| A1 | Segmented | 双端 | W1 | 轨道 fallback `surface-muted`，指示器 `surface-raised`（现在浅轨+深滑块） |
| A2 | Kbd / Tag `default` | 双端 | W1 | bg/text 成对走已注册 semantic，不要浅底+`--tiger-text` |
| A3 | Loading 全屏遮罩 | 双端 | W5 | 默认 `rgba(255,255,255,0.9)` 改 `--tiger-surface` 半透明或 `--tiger-loading-mask` |
| A4 | Skeleton | 双端 | W6 | 走 `surface-muted`，或把 `--tiger-component-skeleton-*` 接到组件 |
| A5 | Layout / Container | 双端 | W6 | 示例去掉 `bg-white`/`!bg-white`；Content fallback 改 `surface-muted` 而非 `#f9fafb` |
| A6 | Tree | 双端 | W7 | 根 `bg-white` 改 `--tiger-surface` |
| A7 | OrgChart 节点填色 | 双端 | W9 | `--tiger-bg,#ffffff` 改 `--tiger-surface`，职称走 `text-secondary` |
| A8 | FileManager / Markdown / RTE / Print / ImageAnnotation | 双端 | W10 | 容器 `--tiger-bg`/`bg-white` 改 surface；Print 纸面深色墨；工具钮 bg/text 成对 |
| A9 | VirtualList 示例斑马 | 双端 | W10 | `bg-gray-50` 改 `surface-muted`（或组件提供 striped） |
| A10 | ImageViewer 工具条/导航 | 双端 | W2 | 同 #19：`--tiger-surface`+`text-white` 改对齐 ImagePreview 半透明黑底 |

##### B. #2–#11 T2 受控绑定（10）

| # | 组件 | 端 | 见 | 建议 |
| --- | --- | --- | --- | --- |
| 2 | Slider | Vue | W3 | 兼发 `update:modelValue`，或示例改 `v-model:value`（Pages 滑块 0 / 文案 40） |
| 3 | Switch / Stepper / ColorSwatch | Switch·Stepper 双端；ColorSwatch Vue | W3 | 补非受控内部态或文档标明 controlled-only |
| 4 | Transfer | Vue | W4 | 兼发 `update:targetKeys`，或示例改 `v-model`（同类 Slider） |
| 5 | AutoComplete | 双端 | W4 | 受控回写 `option.label`，不要把 raw `value` 写进输入框 |
| 6 | Form | React | W4 | FormItem 走 `updateValue` 再 `validateField`，或校验读 event 新值 |
| 7 | Upload | React | W4 | 受控 `fileList` 时进度/`onSuccess` 也 `onChange` 新数组 |
| 8 | Pagination `pageSize` | React | W7 | 示例 01 补 `onPageSizeChange`（Vue `v-model:pageSize` 已可用） |
| 9 | Table 默认分页 | 双端 | W8 | 默认改 `defaultCurrent`/`defaultPageSize`，有 `current` 才当受控 |
| 10 | FileManager 选择 | 双端 | W10 | 补非受控 `selectedKeys`，或示例 01 绑 `v-model:selectedKeys` |
| 11 | Kanban `allowAddCard` | 双端 | W10 | 无 handler 时插入默认卡，或示例补 `@card-add`（不要和 W11 TaskBoard 01 混） |

##### C. #12–#40 其余 P1 — 组件逻辑（29）

| # | 组件 | 端 | 见 | 建议 |
| --- | --- | --- | --- | --- |
| 12 | ButtonGroup | 双端 | W1 | 组选择器改 `[&>*:first-child]`，对齐 InputGroup，必要时 `!` 盖 Button 半径 |
| 13 | Rate 半星 | 双端 | W1 | 裁剪层内保持满星宽（如 `w-[200%]`），不要把 SVG 压扁 |
| 14 | Avatar `getInitials` | 双端 | W1 | 无空格且 ≤2 字原样显示（`text="TC"` → `TC`），或拆 `name`/`text` |
| 15 | Empty 预设一览 | 双端 | W1 | 预览壳 `min-h`/`overflow-auto` 或改栅格，第 5 张不要被裁（T5 同源） |
| 16 | Result 状态一览 | 双端 | W1 | 同 Empty，放开 403/500 行高度 |
| 17 | QRCode | 双端 | W2 | 接入真 QR 库，或拿掉 `level` 并标明装饰用途 |
| 18 | ImagePreview `maskClosable` | 双端 | W2 | 点 mask 节点即关，或把 backdrop 当 dialog 根（对齐 ImageViewer） |
| 19 | ImageViewer 工具条/导航 | 双端 | W2 | `--tiger-surface`+`text-white` 改对齐 ImagePreview 半透明黑底（T1 扫表见 A10） |
| 20 | ImagePreview / ImageViewer iframe | 双端 | W2 | 预览图 `max-h-[90vh] max-w-[90vw]`；viewport 加高或打开时撑 iframe（T5） |
| 21 | InputGroup compact | 双端 | W3 | 边框/圆角放到 Input 根，或 compact 用 `:focus-within` 打内层 |
| 22 | Input 双钮重叠 | Vue | W3 | `clearable`+`showPassword` 只渲染一个，或错开 `right` 并加 `pr-*` |
| 23 | Input `errorMessage` | 双端 | W3 | 错误文案放到字段下，接 `aria-live`/`aria-describedby` |
| 24 | MaskInput 提交值 | 双端 | W3 | 有 `name` 时 hidden 提交 raw，可见框只展示掩码 |
| 25 | Signature 笔画 | 双端 | W3 | `pointerdown` 时 `setPointerCapture`，或 document 级 up/cancel |
| 26 | InputNumber attrs | 双端 | W3 | `aria-label`/`data-*` 落到 `role="spinbutton"` |
| 27 | Radio group `disabled` | Vue | W3 | 对齐 Checkbox：`disabled` 为 true 或继承 group，不要用 `!== undefined` |
| 28 | ColorPicker 初值/alpha | 双端 | W4 | `parseColorInput` 认 rgba/hsla；`showAlpha` 要 emit；不要 `hexToRgb` 吃 rgba |
| 29 | Splitter `sizes` | 双端 | W6 | 示例改真实 px 或接 `parsePaneSize` 的 `'30%'`；初始化也 apply `min` |
| 30 | Affix `offsetBottom` | 双端 | W7 | 相对 `target` 容器底计算，或改 sticky |
| 31 | DropdownItem `close-on-click` | Vue | W7 | 实现 item 级 closeOnClick，或示例改绑父级 |
| 32 | Anchor / ScrollSpy 当前项 | 双端 | W7 | 按 offset 线取最后相交，click 后锁到滚动结束 |
| 33 | FloatButton | 双端 | W7 | 默认 plus 图标；Group 接 placement/offset，可关 portal |
| 34 | Calendar `mode="year"` | 双端 | W8 | 点月份 emit 该月 1 日或切回 month；`disabledDate` 禁月份 |
| 35 | Table `virtual` 滚动盒 | React | W8 | 对齐 Vue：`overflow` 只包表体，不要把导出/Pagination 卷走 |
| 36 | OrgChart `direction="horizontal"` | 双端 | W9 | `flipLayoutNode` 只交换 x/y，保留 `nodeWidth`×`nodeHeight` |
| 37 | Scatter `animated` 非 circle | 双端 | W9 | 动画用 `translate(cx,cy) scale(...)` 或只给 `<circle>` 做 CSS 缩放 |
| 38 | Sunburst `showLabels` | 双端 | W9 | 按 `midAngle` 画 label，或从公开 API/示例拿掉 |
| 39 | ChatWindow `onUpdated` | Vue | W11 | 去掉 `onUpdated` 滚底，只 watch `messages.length`（已离开底部则跳过） |
| 40 | TaskBoard 过滤下落点 | 双端 | W11 | 过滤下标映射回源列，或隐藏用 CSS 不从 DOM 拿掉 |

去重后 P1 **40** = T1 工作包 1 + T2 绑定 10 + 其余逻辑 29。A 表是 T1 落地清单（并入的 9 条不再单独占号）。

#### 5.2.3 值得先修的 P2（约 20）

先做能解锁整页或一次修一片的。其余 P2 仍见 §3。

| # | 组件 | 端 | 见 | 建议 |
| --- | --- | --- | --- | --- |
| P2-1 | Pages sandbox viewport | 站点 | W2/W4/W5/W7/W11 T5 | 弹层/预览 demo 加高或打开时撑 iframe（DatePicker/Modal/Tour/Spotlight/CropUpload） |
| P2-2 | Message / Alert token | 双端 | W1/W5 T1 | `--tiger-message-*` / `--tiger-alert-*` 写入 theme，或 bg 跟 surface |
| P2-3 | Menu `theme="light"` | 双端 | W7 T1 | 默认跟随 `html.dark`，不要把 surface 写成 `#ffffff` |
| P2-4 | Collapse 折叠 a11y | 双端 | W8 T3 | 折叠 `inert`+`aria-hidden`；`extra` `stopPropagation` |
| P2-5 | `parseDate` UTC | 双端 | W4/W8 | `YYYY-MM-DD` 按本地日历日解析，不要 `new Date(string)` |
| P2-6 | Cascader / TreeSelect 键盘 | 双端 | W4 T3 | 非虚拟列表 Arrow/Enter 选值；清空钮改成 trigger 兄弟（对齐 Select） |
| P2-7 | Tour 遮罩关闭 | 双端 | W5 | 有 target 时点遮罩也可关；Vue 最后一步对齐 React 调 `onClose` |
| P2-8 | Table 排序键盘 + `dataKey` | 双端 | W8 T3 | 表头用 button；`sortData`/`filterTableData` 读 `dataKey` 否则 `key` |
| P2-9 | Gantt 拖拽 | 双端 | W9 | 要拖就接线日期；行底 `surface-muted`（T1） |
| P2-10 | Chart `showTooltip` / `hoverable` | 双端 | W9 | 默认能出 tooltip，不要 `showTooltip && hoverable` |
| P2-11 | Chart `responsive` 尺度 | 双端 | W9 | 观察父级后重算 scale，不要只拉 SVG |
| P2-12 | Chat / Comment / Activity / Notification 文案 | 双端 | W11 T4 | 默认中文改走 locale（FormWizard/TaskBoard 已走） |
| P2-13 | FormWizard `skipCondition` | 双端 | W11 | `handleStepChange` 与 Next 一样走 `findNextUnskippedStep` |
| P2-14 | Pagination 中英混排 | 双端 | W7 T4 | `共 N 条` 走 locale；`showTotal` 默认不要硬编码中文 |
| P2-15 | Code clipboard | 双端 | W1 T5 | sandbox `allow-same-origin` 或失败态；文案走 locale |
| P2-16 | Upload `drag` slot | 双端 | W4 | 尊重默认 slot；去掉硬编码 `bg-white`/`border-gray-300` |
| P2-17 | Splitter gutter | 双端 | W6 T1 | `bg-gray-200` 改 token；`gutterSize` 接到视觉宽度 |
| P2-18 | Radar 分割盘 | 双端 | W9 T1 | 不要 `--tiger-bg,#ffffff` 挖洞；splitArea 跟暗色 |
| P2-19 | CommentThread 01 点赞 | 双端 | W11 T2 | 示例补 `@like`，或内部 liked 态（同源 FileManager 01） |
| P2-20 | Tooltip / Popover hover | 双端 | W5 | 加 delay；指针能移入浮层再关 |

其余 P2（约 85 条去重后）按波次在 §4，不进本轮必做。建议第二轮：Input 错误态 token、Stepper spinbutton、Image lazy Vue、Carousel infinite 倒带、Descriptions vertical、List 分页拖拽、Timeline alternate left、VirtualTable 选中 5%、NotificationCenter `manageReadState`。

#### 5.2.4 P3

约 74 条建议级（英文 aria/locale、死 API 清理、SSR `window`、路由别名、Vue 漏 `className`）。不阻塞修复队列。优先顺手：`/back-top`→`/backtop`、`/container` 挂载或重定向、Grid `'2xl'` vs `'xxl'`。全文见 §3 P3。

### 5.3 建议修复顺序（给排期）

1. **core token 一次修（T1 A0）** — 注册 muted/fill/bg，立刻减轻 W3–W11 一片灰字/浅底。
2. **白底浅字落地（T1 A1–A10）** — Tree/OrgChart/W10 编辑器/Layout/Segmented/Kbd/Loading/ImageViewer，Pages 暗色观感。
3. **Vue v-model 脱绑（T2 #5/#7）** — Slider、Transfer，Pages 上完全不能用。
4. **无内部态 + 默认受控（T2 其余）** — Table 分页、FileManager、Kanban、Switch 族。
5. **看得见的逻辑 P1** — ButtonGroup、Rate、Avatar、QRCode、ColorPicker 黑块、Splitter 30px、Calendar 年视图、OrgChart 横向、Scatter 菱形、Chat 滚底、TaskBoard 过滤拖拽。
6. **T5 sandbox** — 不加高 iframe，弹层类 P2 在 Pages 上无法验收。
7. **§5.2.3 P2 清单** — Message token、Menu 暗色、parseDate、Chart tooltip、locale。

## 6. 变更记录

| 日期 | 说明 |
| --- | --- |
| 2026-08-24 | 规划落盘；准备按波次独立 grok 会话执行 |
| 2026-08-24 | W1 审查完成（grok Pages+源码）；并入独立 browserUse 补记 Empty/Result 裁切等 → **7×P1 / 10×P2+ / 8×P3+**，无 P0 |
| 2026-08-24 | W2 审查完成（grok Pages+源码）；QRCode 伪码/level 死 API、ImagePreview 遮罩不关、ImageViewer 亮色白底白字、预览困在 sandbox iframe → **4×P1 / 6×P2 / 6×P3**，无 P0 |
| 2026-08-24 | W3 Form primitives 审查完成（源码为主；Pages 核实 Vue Slider `v-model`）；暗色未全爬故波次 **partial**。最高优：Slider v-model、token/暗色、InputGroup compact、Input 双钮/字段内错误、MaskInput 提交掩码、Signature pointer、InputNumber attrs、Vue Radio disabled、Switch/Stepper/ColorSwatch 非受控 → **10×P1 / 14×P2 / 8×P3**，无 P0 |
| 2026-08-24 | W4 Form composite 审查完成（Pages 亮色全组 + Dark 开关核实 Select/ColorPicker/Upload；源码双端）。最高优：ColorPicker rgba 黑块/alpha/format、Vue Transfer `v-model:target-keys`、AutoComplete label 被 value 覆盖、React Form change 校验旧值、React Upload 受控进度不重绘 → **5×P1 / 10×P2 / 8×P3**，无 P0。可开 W5 |
| 2026-08-24 | W5 Feedback 审查完成（Pages Vue/React 亮+Dark 全 11 路由 + iframe 内打开弹层；源码双端）。最高优：Loading 全屏默认白遮罩。其余：Message 浅色 token、sandbox 180px 困弹层、toast 无暂停/封顶、Vue Container Teleport、Progress 条纹 keyframes/仪表盘名、Tour 遮罩与 finish/close 分叉、Vue Modal/Drawer 初始焦点、Popconfirm 不走 locale → **1×P1 / 11×P2 / 8×P3**，无 P0。可开 W6 |
| 2026-08-24 | W6 Layout 审查完成（Pages Vue/React 亮+Dark 全 14 路径；`/container` 无路由。iframe 内点了 Carousel/Splitter/Resizable/ScrollArea/Skeleton）。最高优：Splitter `sizes` 当 px 把「比例」例画成 30px 竖条；Skeleton 暗色浅灰 token；Layout/Container 暗色白底白字 + Content `#f9fafb`。其余：gutter 硬编码灰、Layout `min-h-screen` 撑 iframe、Descriptions vertical 忽略 column、Carousel 循环倒带、Skeleton wave/示例 animated、Splitter 受控 sizes/`gutterSize` → **3×P1 / 9×P2 / 7×P3**，无 P0。可开 W7 |
| 2026-08-24 | W7 Navigation 审查完成（Pages Vue/React 亮+Dark 16 路径；`/back-top` 无路由、实为 `/backtop`。iframe 内点了 Affix 滚动、Anchor/ScrollSpy 末项、Pagination size、Dropdown 保持展开、Tree 暗色、FloatButton）。最高优：Tree 暗色白底白字；Affix `offsetBottom` 钉视口底；React Pagination size 弹回；Vue DropdownItem `close-on-click` 死绑定；Anchor/ScrollSpy 当前项取「带内第一个」；FloatButton 空图标+Group 强制 portal。其余：Menu 默认 light 覆盖暗色、分页中英混排、overlay 180px sandbox、BackTop 隐藏仍可 Tab、ContextMenu 键盘/子菜单 click、NavMenu mega 角色 → **6×P1 / 14×P2 / 7×P3**，无 P0。可开 W8 |
| 2026-08-24 | W8 Data 审查完成（Pages Vue/React 亮+Dark：`/calendar` `/collapse` `/countdown` `/data-export` `/table` `/timeline`；iframe 内点了选日/年视图月份、手风琴、排序/分页/勾选、导出下拉）。最高优：年视图不选日且 `disabledDate` 死；Table 默认 `current:1` 把分页锁死（受控 demo 正常）；React `virtual`/`autoVirtual` 把分页卷进 400px 盒。其余：muted token、筛选灰边、Collapse 折叠仍可读、Timeline alternate left 在右、`dataKey` 排序、假 Excel vs 真 xlsx → **3×P1 / 12×P2 / 6×P3**，无 P0。可开 W9 |
| 2026-08-24 | W9 Charts 审查完成（Pages Vue/React 亮+Dark 15 路由含 `/use-chart-interaction`；iframe 内悬停 tooltip、点图例、拖 Gantt、点 Org 节点）。最高优：OrgChart 横向宽高对调 + 暗色白底浅字；Scatter `animated` 菱形堆左上；Sunburst `showLabels` 死 API。其余：Gantt 无拖拽、图例只选中不隐藏、Radar 浅分割盘、`showTooltip` 需 `hoverable`、Funnel `direction` 死、TreeMap 只画叶子、`responsive` 撑 SVG → **4×P1 / 9×P2 / 6×P3**，无 P0。可开 W10 |
| 2026-08-24 | W10 Advanced 审查完成（Pages Vue 亮+Dark 12 路由；React 暗色核 FileManager/Markdown/RTE/Print/Annotation/VirtualList，亮色核 Kanban/CodeEditor；iframe 内点选、工具条、滚动、打开 ImageViewer）。最高优：暗色 `--tiger-bg`/`bg-white` 白底浅字（FileManager/编辑器/Print/标注钮）；VirtualList 示例 `bg-gray-50` 斑马；FileManager 01 选择无态；Kanban Add task 不增卡。ImageViewer 亮色白底白字只确认 W2、不重复开条。其余：Print 页眉 print-only、RTE 工具条换行、CodeEditor 双层滚动、VirtualTable 选中 5%、picsum 画布 → **4×P1 / 8×P2 / 5×P3**，无 P0。可开 W11 |
| 2026-08-24 | W11 Composite 审查完成（Pages Vue/React 亮+Dark 8 条组合路由含 CropUpload；iframe 内发送、向导提交、表格搜索、看板加卡、通知已读、评论点赞）。最高优：Vue Chat 输入触发 `onUpdated` 滚到底；TaskBoard 过滤下落点用可见下标。Kanban Add 只交叉引用 W10。暗色走 `--tiger-surface`，没有 W10 白底浅字。其余：muted/locale 硬编码中文、skipCondition 不拦点步骤、manageReadState 清 overrides、Comment 01 点赞无态、虚拟行高 88 → **2×P1 / 10×P2 / 7×P3**，无 P0。可开 W12 |
| 2026-08-24 | W12 汇总完成（只改本 Review 文档）。去重跨组主题写入 §5：T1 token/暗色白底、T2 受控绑定、T3 a11y、T4 示例/文档、T5 sandbox。P0=0；P1 去重后 **40**（§3 原文 49，10 条暗色白底收成 T1）；P2/P3 约 **105 / 74**。状态改为全部波次完成。不改产品代码、不 commit。 |
