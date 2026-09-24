# Tigercat 3.0 迁移（进行中）

每完成一批会改变默认结果的改动，在这里追加一节。终稿在全部任务结束后改写成按组件排列的唯一写法。

## ConfigProvider / 主题

- 组件：`ConfigProvider`、主题入口
- 旧的默认行为：进程级 `ThemeManager` 写 `<html>`；`data-tiger-style="modern"` 和 `@plugin ".../tailwind/modern"` 是第二套视觉层；`lang` 用合并后的 locale（缺省会写成 `en-US`）；先卸掉的根会清掉后一个根的 `dir`。
- 3.0 的唯一行为：每个根一个 scope。最外层仍挂载的 ConfigProvider 写 `data-tiger-theme`、配色、`dir` 和 `lang`。`lang` 只来自本层 locale id。没有 locale id 时不改已有 `lang`。属主记在文档元素上，先卸载的兄弟根不会清掉后一个根的 `dir`。`auto` 不另盖 `.dark`。现代视觉是预设 `theme="modern"`，或 `createTigercatPlugin({ preset: modernTheme })`。
- 已删除：`ThemeManager`、`registerBuiltInThemes`、`@expcat/tigercat-core/tailwind/modern`、`data-tiger-style`、`THEME_CSS_VARS` 的 `textMuted` / `fill` / `bg`、`--tiger-text-muted` / `--tiger-fill` / `--tiger-bg`。

## Locale

- 组件：locale / DatePicker 文案
- 旧的默认行为：日期文案可以从 `@expcat/tigercat-core/datepicker-locales/*` 单独导入。
- 3.0 的唯一行为：日期文案在同一套 locale 的 `datePicker` 上。`getDatePickerLabels(locale)` 读取它。语言包只从 `@expcat/tigercat-core/locales/<id>` 导入。命令式 Message、Notification、LoadingBar 读当前文档属主 ConfigProvider 的 locale，不读进程级栈。
- 已删除：`datepicker-locales` 包入口。

## 方向与动效

- 组件：布局方向、动效
- 旧的默认行为：RTL 用镜像 class 反转物理方向；过渡可以用 `all`；减弱动效在多处各写一份时长。
- 3.0 的唯一行为：方向只跟 `dir` 和逻辑属性（`padding-inline`、`inset-inline`、`margin-inline`）。过渡列出具体属性。`prefers-reduced-motion` 把 `--tiger-motion-duration-*` 写成 `0ms`，并停掉 `.tiger-motion-aware` / `[data-tiger-motion]` 上正在跑的动画。

## 导出

- 组件：`DataExport`、Table CSV
- 旧的默认行为：以 `-` 或 `+` 开头的单元格（含合法负数和电话号码）被加上撇号；危险前缀漏掉 Tab、换行和全角符号；单元格超过 10 万只警告仍继续生成；文件名只去掉部分路径字符。
- 3.0 的唯一行为：有限数字在 CSV 和 xlsx 里都写成数字。文本在去掉前导空白后，若以 `=` `+` `-` `@`、Tab、CR、LF 或全角 `＝＋－＠` 开头才中和；合法负数和电话号码不加撇号。Markdown 用同一条文本规则。单元格个数或单格长度超过上限时抛出 `DataExportLimitError`。文件名去掉路径字符、换行和双向控制符。
- 已删除：`DATA_EXPORT_SOFT_CELL_LIMIT`、`DATA_EXPORT_FORMULA_PREFIX`、`sanitizeDataExportText`。

## 焦点、键盘与剪贴板

- 组件：Modal / Drawer 等焦点范围、`copyTextToClipboard`
- 旧的默认行为：Vue 与 React 各写一份 Tab 陷阱；键盘助手认 `keyCode` / `which` / `Spacebar`；剪贴板失败时插入 textarea 并调用 `execCommand('copy')`，焦点落到 `body`。
- 3.0 的唯一行为：`createFocusScope` 是唯一焦点范围（Tab 循环、离开拉回、Escape 只交给最上层、下层模态 inert、关闭恢复焦点；模态同时锁滚动并在解锁时恢复滚动位置）。toast 用 `data-tiger-toast`，不跟模态一起 inert。键盘只认 `event.key`。复制只走异步 Clipboard API，失败返回 `false`。
- 已删除：`createFocusTrap`、`announceToScreenReader`。

## Live region

- 组件：屏幕阅读公告
- 旧的默认行为：按 `tigercat-live-region-${level}` 共用一个节点；`assertive` 同时是 `role="alert"`；隐藏用 `clip: rect(0,0,0,0)`。
- 3.0 的唯一行为：`manageLiveRegion()` 每次创建调用方自己的区域，`destroy` 只拆自己的并取消未执行的动画帧。`assertive` 只设置 `aria-live="assertive"`。隐藏用 `clip-path: inset(50%)`。

## 虚拟窗口

- 组件：`VirtualTable`、虚拟列表行高
- 旧的默认行为：粘性表头按写死的 40px 从视口里扣；空窗口复用同一对象；非法行高会进入偏移表。
- 3.0 的唯一行为：表头高度来自 DOM 测量。空窗口每次返回新对象。固定、可变、动态行高只接受有限正数。尺寸观察走 `observeSize`，没有 `ResizeObserver` 时返回空卸载函数。

## 富文本

- 组件：`RichTextEditor`、`MarkdownEditor`
- 旧的默认行为：`rel` 写在 `target="_blank"` 前面时不补 `noopener`；粘贴会从 `paste` 和 `beforeinput` 各写一次；工具栏 `icon` 是 HTML 字符串。
- 3.0 的唯一行为：`target="_blank"` 始终写出 `rel="noreferrer noopener"`。粘贴和拖放只走一条消毒后的 DOM 写入。读回再消毒一次。链接用判断时的规范化 URL。工具栏图标是 `{ path }`。
- 已删除：工具栏 `icon` 的 HTML 字符串。

## 二维码

- 组件：`QRCode`
- 旧的默认行为：格式信息的两份拷贝沿对角线对调，扫描器读不出，内部往返仍能对上。
- 3.0 的唯一行为：格式位按规范落在第 8 列和第 8 行右侧。

## 校验

- 组件：表单规则
- 旧的默认行为：`type: 'number'` 的 min/max 比的是字符串长度；纯空白不算空；`id-card` 只看位数；`date` 接受 `Date.parse` 能解析的文本；`url` 拒绝 `http://localhost`；字段路径可以写到 `__proto__`。
- 3.0 的唯一行为：数字规则比数值。纯空白算空。`date` 只接受不溢出的 `YYYY-MM-DD`（以及有效的 `Date`）。`id-card` 校验生日和 MOD 11-2 校验位。`url` 接受 localhost、点分域名和 IPv4。路径段拒绝 `__proto__`、`constructor`、`prototype`。

## 上传

- 组件：`Upload`
- 旧的默认行为：队列不能取消；`dispose` 清空已删集合后仍继续取下一项；`submit` / `retry` 可以和入队并行打出两个请求；`false` 把条目留在 `queued`；`resumable` 不记录已完成分片。
- 3.0 的唯一行为：`runUploadQueue` 接受取消信号。`dispose` 之后不再取下一项。`processFiles`、`submit`、`retry` 共用一把锁，同一文件只有一个在途请求。返回 `false` 标成错误。`resumable` 记住本次会话已完成的分片。分片个数有上限。

## 列表拖拽

- 组件：`Drag` / `useDrag`
- 旧的默认行为：所有列表共用一个模块级 `activeDrag`，后开始的拖拽盖掉前一个，`getState` 读到别人的下标。
- 3.0 的唯一行为：会话挂在各自的 `createListReorderController` 上。`drop` / `endDrag` 只结束自己的会话。两个列表可以同时拖。
- 已删除：`isActiveListDragSameContainer`、`isActiveListDragCrossContainer`。

## 水印

- 组件：`Watermark`
- 旧的默认行为：是否仍盖住宿主只看内联 `position`、`opacity`、`pointer-events`。
- 3.0 的唯一行为：用计算样式看 `display`、`visibility`、`opacity`、尺寸和 `background-image`。`MutationObserver` 只发现改动，不保证水印删不掉。

## 链接协议

- 组件：`Link`、Anchor、Breadcrumb、ScrollSpy、PageHeader、Dropdown、ContextMenu、Menu、NavigationMenu、菜单 schema、组织图头像
- 旧的默认行为：`href`、`path`、`iframeSrc` 和头像地址原样写入。禁用链接仍带着 `href`。`javascript:`、`data:`、`vbscript:` 可以成为可激活地址或 SVG image。
- 3.0 的唯一行为：协议允许列表只在 `link-utils`。允许 `http:`、`https:`、`mailto:`、`tel:`，以及没有协议的站内路径、查询和 `#`。拒绝 `javascript:`、`data:`（含位图）、`vbscript:` 和 `//`。禁用或不通过的地址不输出 `href` / 不渲染 image。`target="_blank"` 带 `noopener` 和 `noreferrer`。schema 的 `path` 只作站内路径，外链走 `href`，`iframeSrc` 进 meta 前过同一道门。
- 已删除：组件上的第二份协议判断。

## Highlight

- 组件：`Highlight`
- 旧的默认行为：`keywords` 可以是 `RegExp`，在渲染和 SSR 里 `exec`。
- 3.0 的唯一行为：公开 API 只收字符串，线性扫描，按字面量匹配。Vue 的 `keywords` prop 类型也不再接受 `RegExp`。传入的 `RegExp` 被忽略，不会执行。

## 框架包出口

- 组件：`@expcat/tigercat-vue`、`@expcat/tigercat-react`、core 类型入口
- 旧的默认行为：框架包用 `export *` 再导出 `@expcat/tigercat-core`。源码里另有 `version` 常量。`types/composite.ts`、`kanban`、`image-viewer` 提供兼容再导出。
- 3.0 的唯一行为：框架包只导出组件、hook 和命令式 API。类型和工具从 `@expcat/tigercat-core` 导入。版本只读各包的 `package.json`。`WorkflowViewer` 与 `WorkflowActionBar` 使用自己的类型模块。组件记录、文档 slug、测试组和包出口只来自 `scripts/lib/public-components.mjs`。
- 已删除：框架包上的 core 星号再导出、源码 `version` 常量、`types/composite.ts`、`types/kanban.ts`、`types/image-viewer.ts`、`utils/kanban-utils.ts`、`utils/image-viewer-utils.ts`、公开类型对 `internal/*-styles` 的再导出。ActivityFeed、CommentThread、NotificationCenter 的样式常量留在 `internal`，由框架组件直接引用，不进入 `@expcat/tigercat-core` 的公开类型。

## CLI 与 MCP

- 组件：`tigercat` CLI、`@expcat/tigercat-mcp`
- 旧的默认行为：CLI 报的版本可以落后于包版本。`doctor` 接受上一主版本。`generate docs` 另写一套文档。MCP 默认向远程拉技能。安装命令不带版本。`create` 覆盖前不列出文件。模板没有 `.gitignore` 和 `packageManager`。
- 3.0 的唯一行为：CLI 与 MCP 的对外版本等于各自 `package.json`。`doctor` 要求 Tigercat 主版本与包主版本相同。文档只由 `pnpm docs:api` 生成。MCP 默认读随包发布的技能快照；显式 https 基址必须与包的版本和文件摘要一致，解码后拒绝 `..`，并且不跟随重定向。`add --install` 安装锁定版本。写盘留在目标项目内。`create` 覆盖前列出将写入的文件。模板写入 `.gitignore` 和 `packageManager`。已有 playground 先按当前模板更新依赖锁，再用参数数组启动 `pnpm exec vite`。
- 已删除：CLI 的正则文档生成。

## 代码高亮

- 组件：`Code`、`CodeEditor`
- 旧的默认行为：`highlightCode` / `highlightLine` 返回 HTML 字符串，组件用 `innerHTML` 注入。
- 3.0 的唯一行为：高亮器返回 `{ text, className? }` token。组件把 `text` 画成文本节点。
- 已删除：`renderCodeHighlightHtml`、`escapeHighlightHtml`、`renderTokenHtml`、`renderTokensHtml`。

## 表单规则与模型

- 组件：`Form`、`FormItem`
- 旧的默认行为：`required` 只画星号；带 trigger 的校验清掉没跑到的错误；项上规则盖掉表单规则；第二次 `validate()` 复用仍在飞的那次；`gt` 等把空串当成 0；Vue 就地改写传入的模型对象。
- 3.0 的唯一行为：`required` 和 `requiredWhen` 是 `{ required: true }`，和表单规则拼成一份。一次触发只更新这次跑过的规则。新的 `validate()` 作废上一次，用 `FormValidationSupersededError` 区分取消和失败。大小比较只接受有限数字。React 在 effect 里写入受控值。Vue 只发 `update:modelValue`，父级自己写回。一项只把值和校验接到第一个控件。
- 已删除：没有保留第二套规则通道。

## 字段值

- 组件：`Input`、`Textarea`、`Radio`、`RadioGroup`
- 旧的默认行为：React 文本一次按键写两次；具名表单项里的单颗 Radio 不写入选项值；缺键、`''`、`null` 会退回控件自己的旧状态。
- 3.0 的唯一行为：一次按键一次提交。单颗 Radio 和 RadioGroup 用同一份选项值。缺键、`''`、`null` 是空。提交前先让仍聚焦的控件失焦，把未提交的数字或标签写进模型。
- 已删除：无。

## 错误、焦点与禁用

- 组件：`FormItem`、`CropUpload`、表单提交
- 旧的默认行为：错误节点一律是 `role="alert"`；关掉说明后文本不在文档里；失败提交聚焦分组根；禁用用 `display: contents` 的 fieldset；裁剪上传的拒绝进不了表单项。
- 3.0 的唯一行为：错误文本一直在文档里。字段校验是 `role="status"`，提交失败是 `role="alert"`。关掉行内说明时仍留屏幕阅读文本。失败提交聚焦第一个可聚焦的 `aria-invalid` 控件。禁用写在控件上。`disabled` 或 `loading` 时提交返回 false，取消按钮仍可点。`setFieldError` 按字段写错误。CropUpload 的类型、大小和确认失败走这条，成功时清空，并仍发出 `error`。
- 已删除：禁用 fieldset。

## Select

- 组件：`Select`
- 旧的默认行为：高亮和焦点各走一路；多选退格清空全部；创建项不留在列表里；小屏用一块不接管焦点的全屏壳；清空单选发出 `undefined`；搜索防抖绑住旧回调。
- 3.0 的唯一行为：高亮和焦点在渲染之后落定。多选是标签，退格删最后一项，清空按钮不进 Tab。单选清空是 `null`，多选清空是 `[]`。`''` 仍是合法选项。创建项留到 `options` 接过去；只有完全相同才不算新建。分组包住自己的选项。小屏列表仍锚在触发器上，未定位的层不可见。搜索防抖读最新回调。
- 已删除：小屏选择层上的完成按钮。

## 日期与时间

- 组件：`DatePicker`、`TimePicker`
- 旧的默认行为：本地化展示的年份（佛历等）被当成公历写回；键入和快捷方式不经过禁用日；区间结束早于开始时原样保存；确定丢掉未完成的开始日；时间的此刻和键入绕过 min/max；半截时间区间进表单变成 `null`；`showSeconds` 为假时模型仍留秒；打开的时间面板在服务端按桌面列输出；Vue 同时发出 `update:modelValue`、`change`、`input`。
- 3.0 的唯一行为：存储和 `name` 是公历日历日（范围 `start|end`）。解析用生成这段文字的同一套历法和数字。点选、键入、快捷方式和确定走同一道边界；结束早于开始会对调。日期区间确定提交当前预览，未完成留在面板里。时间的此刻、键入和确定共用 `minTime`、`maxTime`、`disabledTime`。`showSeconds` 为假时模型是 `HH:mm`。半截时间区间留在元组里。时间面板的桌面列和手机 select 同时在文档里，用 CSS 切换。只读用 `readOnly`。禁用不提交。
- 已删除：`readonly`、`change`、`input`、`open-change`。

## 颜色、Cron 与数字键盘

- 组件：`ColorPicker`、`ColorSwatch`、`CronEditor`、`NumberKeyboard`
- 旧的默认行为：短 hex 在输入过程中就改写并提交；解析失败画成红色并提交原文；拖动每次移动都写表单；色板按原始字符串判选中；非法 Cron 进表单，空表达式画成五个 `*`；数字键盘不接收焦点，外部非法串会继续拼接；Vue 用 `Math.random` 做可访问 id。
- 3.0 的唯一行为：颜色文本在失焦或 Enter 时提交。解析失败不上屏，隐藏域提交空。拖动只更新预览，松手写入。色板按同一套解析判断选中。Cron 的表单值是空或一份合法 5 段表达式，错误走 FormItem。数字键盘打开后焦点在对话框里，当前键可见；进入的值先按模式收干净，收不干净当空。可访问 id 走 `useId`。只读用 `readOnly`。
- 已删除：`readonly`、`change`、`input`、`open-change`。

## 级联、树选与树

- 组件：`Cascader`、`TreeSelect`、`Tree`
- 旧的默认行为：选项键用严格相等；树勾选框和 `checkStrategy` 各说各话；搜索零命中仍画出整棵树；级联在打开期间把浏览路径打回已提交值；`defaultExpandAll` 在每次选择后把折叠冲掉；缺键在级联上留下旧路径，在树选上变成空键；列、返回、展开文案挂在 Select 语言包；树同时暴露 `aria-checked` 和一颗复选框，序号是扁平下标；两棵树的拖拽容器都叫 `tree`。
- 3.0 的唯一行为：键只比一次字符串身份。勾选框表示级联，`checkStrategy` 只决定提交哪些键；`checkStrictly` 时不按策略过滤。半选父节点的下一次点击补全这一支。查询非空且零命中时列表为空。级联只在打开时初始化浏览路径。`defaultExpandAll` 只在树第一次有数据时生效。级联空路径是 `[]`，树选空单选是 `null`、空多选是 `[]`，`''` 不是键。文案在 `locale.cascader` 和 `locale.treeSelect`。树的勾选只说一次，`posinset` / `setsize` 按兄弟。每棵树自己的拖拽容器。懒加载的鼠标和键盘走同一道。浮层高度只留 `listHeight`。只读用 `readOnly`。
- 已删除：Select 语言包上的 `levelLabel`、`backText`、`expandAriaLabel`、`collapseAriaLabel`；TreeSelect 的 `height` 别名；`readonly`、`change`、`input`、`open-change`。

## 自动完成、提及、上传、签名与穿梭

- 组件：`AutoComplete`、`Mentions`、`Upload`、`Signature`、`Transfer`
- 旧的默认行为：自动完成完成时不提交查询，原生字段、展示和高亮各用一份数据；提及插入停在上一次选区；Vue 上传的展示列表和控制器列表不是同一份；解析不了的签名仍按原文提交；穿梭把 `1` 和 `'1'` 当成两行，搜索框 Enter 会提交外层表单，滤掉的勾选仍会被移走；空列表时报合上；`targetKeys` 是 `value` 的别名。
- 3.0 的唯一行为：自动完成关层时提交或还原，原生字段提交已提交的值。提及按当前选区插入，解析和插入共用分隔规则。上传只保留一份列表：`name` 是表单字段，`fileFieldName` 是请求文件字段；失败可重试；`multiple` 为假时拖拽只留第一个。签名的值是空或当前笔画的 SVG，取消手势丢掉当前笔。穿梭按字符串键收成一条，搜索、全选和移动只看当前可见项。打开着的空列表仍报告展开。缺键、`null` 和 `''` 在这些控件里是各自的空。只读用 `readOnly`。Vue 值事件只有 `update:modelValue`（上传是 `update:fileList`）。
- 已删除：`targetKeys`、`defaultTargetKeys`、`readonly`、`change`、`input`、`open-change`。

## Slider

- 组件：`Slider`
- 旧的默认行为：方向在组件里各写一份；区间两个拇指同名；拖动过程中就写入并校验；刻度可以无限密；Vue 同时有 `value` 和 `modelValue`。
- 3.0 的唯一行为：方向读最近的 `dir`，否则读 ConfigProvider。显示值走 `sliderBounds`。区间拇指在字段名之外带上最小和最大。拖动只更新预览，松手写入；键盘立即写入。焦点离开整条滑块再校验。`marks` 为真时最多 21 个刻度，过密只标两端。
- 已删除：Vue 的 `value`、`update:value`、并行的 `change`。

## InputNumber

- 组件：`InputNumber`（原 `Stepper`）
- 旧的默认行为：步进器是单独的公开组件，可访问名固定，失焦按步长改写输入。
- 3.0 的唯一行为：两侧按钮是 `controlsPosition="both"`。`snapToStep` 默认关闭，步长只约束按钮和方向键。值是有限数字或数字字符串，`null` 和 `''` 是空。可访问名来自可见标签或调用方的 `aria-label`。可见输入不带 `name`，需要提交时用隐藏域。
- 已删除：`Stepper`、`StepperProps`、`TigerLocaleStepper`、`./Stepper`。中文别名「步进器」指向 `InputNumber`。

## TagsInput

- 组件：`TagsInput`
- 旧的默认行为：粘贴整段替换待输入；组合输入未结束也会确认；退格高亮读不出来；组件自己画 `errorMessage`。
- 3.0 的唯一行为：粘贴在光标处插入后再按分隔符切开。组合输入未结束时 Enter 不确认。拒绝重复或超限时给一句实时说明。当前高亮标签接到 `aria-activedescendant`，标签是 `list` / `listitem`。错误、抖动和说明只走 FormItem。只读用 `readOnly`。
- 已删除：`errorMessage`、`_shakeTrigger`、`resolveTagsPasteCandidates`。

## 原生提交

- 组件：`Select`、`TagsInput`、`Slider`、`InputNumber`
- 旧的默认行为：禁用字段仍可能留下隐藏域；空选择有时省略、有时残留。
- 3.0 的唯一行为：禁用不提交，只读提交。空选择提交一个 `value=""` 的隐藏域。
- 已删除：无。

## 看板

- 组件：`TaskBoard`
- 旧的默认行为：同列放下比指示线多一格；每张卡片都在 Tab 序里；抓取只重复一句拖拽提示；列 id 从属性字符串回读。
- 3.0 的唯一行为：放下下标和指示线是同一个插入点，末尾是源数组长度。每列一个键盘停靠点，方向键在卡片之间移动。抓取播报源列、目标列和位置，句子走 locale。卡片里的按钮自己处理 Enter / Space。列 id 记在元素上。列移动和卡片移动共用一个在途门闩。
- 已删除：无。

## 工作流条件、动作、发布与字段权限

- 组件：`WorkflowDesigner`、`WorkflowActionBar`、工作流 reducer、`WorkflowDetailShell`
- 旧的默认行为：条件分支按深度优先全部进入；动作不核对当前操作者，空意见可以提交；阻塞项不挡住发布；设计器和运行时各有一套缺省权限；详情壳不合并提交值，可访问名是写死的英文。
- 3.0 的唯一行为：条件是字段、运算符、值，只进入选中的那一条分支。reducer 拒绝不属于当前操作者的动作，并拒绝空的必填意见。变更事件带上 issues，有阻塞项时发布不可用。缺省权限只有 `defaultWorkflowFieldPermission`，更严的一边生效。详情 `submit()` 走 `mergeWorkflowFormValues`。壳的名字走 locale。
- 已删除：`WORKFLOW_DETAIL_SHELL_DEFAULT_ARIA_LABEL`。详情可访问名只来自 locale 或 `ariaLabel`。

## 评论、动态与通知

- 组件：`CommentThread`、`ActivityFeed`、`NotificationCenter`
- 旧的默认行为：评论环整段消失；回复文章嵌在父文章里；动态根自称 feed；通知筛选和行不能用键盘打开。
- 3.0 的唯一行为：环和重复 id 给出可见错误，能挂上的节点留下。评论输入和空态在 feed 外面，文章是 feed 的直接子级。动态根是 region，时间线保持 list。通知筛选是一组有名字的单选，打开一条是按钮，加载时列表 inert。未读变化和新的一条用组件自己的礼貌区域。
- 已删除：无。

## 工具条、向导与 Schema

- 组件：`DataTableWithToolbar`、`FormWizard`、`SchemaForm`
- 旧的默认行为：受控筛选回传旧值，本地查询停在空页；向导在 `submit()` 失败时仍完成；Schema 的必填和只读不进同一套校验；非受控模型只播种一次。
- 3.0 的唯一行为：`onFiltersChange` 带这一次要写的值，本地搜索和标量筛选把页码收到第 1 页。`submit()` 返回 false 时向导留在当前步。父级直接改 `current` 时，步骤事件带 `{ skippedValidation: true }`。Schema 的必填和只读进同一套规则，`disabled` 不跑必填。模型按路径合并，晚到的记录能进还没编辑过的空表。Vue 搜索按钮和让输入框出现的那次监听用同一份判断。
- 已删除：无。

## 发送闩

- 组件：`ChatWindow`、`CommentThread`
- 旧的默认行为：发送闩在下一微任务就放开，或失败后同一句不能重发。
- 3.0 的唯一行为：在途直到这一次发送回调返回的 Promise 结束。结束后允许原样重发。失败后原文留着。聊天和评论各用自己的闩。
- 已删除：无。

## 反馈浮层

- 组件：`Alert`、`Loading`、`Tooltip`、`Popover`、`Popconfirm`、`Modal`、`Drawer`、`Tour`、`Message`、`notification`、`LoadingBar`、`Progress`
- 旧的默认行为：省略 `open` 的警报关掉后还在；全屏加载和模态同一档，区域加载不还焦。悬停层会被点击或 Enter 关掉。对话框确定立刻关闭，整层滚动。确认气泡困住 Tab。`Message` / `notification` 自己 `createRoot` 或 `createApp().mount`。引导在滚动里拖目标，洞可以点穿。顶栏 `error()` 清掉还没结束的 `start`。抽屉 `panelClassName` 和 `className` 写在同一面板上，`bodyPadding` 可以是类名字符串。Popover 宽度有两套写法。离开回调写死 300ms。
- 3.0 的唯一行为：省略 `open` 的警报自己收起，传入 `open` 只发事件。全屏加载盖住视口、高于模态，并占用同一套焦点栈。悬停只跟指针；焦点还在触发器上时指针离开不关。确定可以等 Promise，拒绝不关闭，只有正文滚动。Popover 和 Popconfirm 把焦点留在触发器上，Tab 离开即关；确认的 Promise 在进行中关不掉。`Message` 和 `notification` 只改当前 `ConfigProvider` 里的队列，同一个 `key` 替换。`Message` 默认可关闭，悬停或焦点暂停计时。通知主动作是按钮，整张卡片不再承接点击。引导只在打开和换步时滚动一次，默认洞只是视觉。`error()` 与 `finish()` 共用 `start` 计数。关掉引导后非受控下标回到第一个未跳过的步骤，受控时发出回到该下标。`bodyPadding` 只表示用不用默认内边距，自定义间距用 `bodyClassName`。离开回调等这一层过渡结束。
- 已删除：`Drawer` 的 `panelClassName`。`bodyPadding` 不再接受类名字符串。`getMessagePositionStyle`。`createNotificationStackUpdateScheduler`。

## 虚拟窗口与读对数据

- 组件：`VirtualList`、`InfiniteScroll`、`Table`、`VirtualTable`、`Calendar`、`DatePicker`、`Gantt`、`PieChart`、`ChatWindow`、`ActivityFeed`、`CommentThread`、`NotificationCenter`、`Cascader`、`TreeSelect`、`AutoComplete`、`Mentions`、`Transfer`
- 旧的默认行为：固定行高窗口不含底边那一行；无限滚动可以叠多个在途请求，预加载边不跟书写方向；表的虚拟窗口和滚动口不是同一个盒子；日历、甘特和复合钟点会读本机当前时间；饼图默认扫角可能超过一圈；聊天把实时区域建在会卸载的滚动根上；长列表把全部条目放进 DOM；级联和树选的 `virtual` 不能让当前项进入窗口。
- 3.0 的唯一行为：行窗口、列窗口和动态测高只走 `virtual-list-utils`（结束下标含底边行，测高键是条目 id）。无限滚动默认观察视口，一次一个在途请求，预加载边跟书写方向。表的 `scrollTop` 和视口高度来自内层滚动元素，行高用声明值，整页放得下就不开窗口。日历、甘特和复合钟点只用调用方时钟；没有时区时首屏不输出会随环境变化的钟点。饼图默认正好一圈。导出文本先去掉前导空白再处理公式前缀；图表 SVG 只保留已经允许的地址。聊天贴底锚是最后一条消息 id，长列表默认虚拟窗口，实时区域不在滚动根上。动态、评论、通知超过阈值只挂可见的一段；通知的非当前分组不挂列表。级联和树选两端都实现 `virtual`，窗口跟着当前项。自动完成、提及和穿梭超过一屏走同一窗口，穿梭面板高度固定。
- 已删除：`VirtualTable` 列上的 `sortable` / `filter`。

## 跑马灯

- 组件：`Marquee`
- 旧的默认行为：方向是 `left` / `right`；省略名字时用 locale 变成 `region`；关键帧在挂载后插入 `document.head`。
- 3.0 的唯一行为：方向只用 `start` / `end` / `up` / `down`。没有 `aria-label`、`ariaLabel`、`labels.ariaLabel` 或 `aria-labelledby` 时不是地标。循环和减少动效在样式表的 `marqueeBaseStyles` 里，组件不写 `<style>`。
- 已删除：`MARQUEE_CSS`、`MARQUEE_STYLE_ID`、`injectMarqueeStyles`。

## 瀑布流

- 组件：`Masonry`
- 旧的默认行为：量到高度后按最短列绝对定位，坐标用物理 `left`。`columnClassName` 声明了但不出现在节点上。Vue 的尺寸观察器卸不掉。
- 3.0 的唯一行为：默认 `layout="source"`，用 CSS 多列保持源顺序。`layout="shortest"` 才按最短列定位，并用逻辑起点；容器说明视觉顺序与源顺序不同。宽度还是 0 时不把断点当成 `xs`，也不退回写死的列数。
- 已删除：`columnClassName`、`masonryColumnClasses`、`getMasonryColumnClasses`。

## 样式表

- 组件：`Divider`、`ImageCropper`、`Skeleton`、`Carousel`、`Dropdown`、`Menu`、`Card`、`AspectRatio`、`Watermark`、`Space`、`PrintLayout`
- 旧的默认行为：这些组件在运行时往 `document.head` 插 `<style>`，或全局打印样式盖住整页。
- 3.0 的唯一行为：关键帧、减少动效和组件几何进 Tailwind 插件的 base。打印只打当前这一张纸，`@page` 跟实例一起卸。水印用样式表平铺，宿主尺寸变化不重编码画布，不再用 `MutationObserver` 守水印。
- 已删除：`injectPrintLayoutStyles`、`PRINT_LAYOUT_STYLE_ID`。

## 基础与布局的其余行为

- 组件：`Button`、`SplitButton`、`QRCode`、`Avatar`、`Highlight`、`ImageCompare`、`ImagePreview`、`Carousel`、`AspectRatio`、`Grid`、`Menu`、`Tabs`、`Tree`、`NavigationMenu`
- 旧的默认行为：加载中的按钮还能聚焦；二维码的可访问名字带上编码值，且 SVG 自己也是图片。头像组溢出是图片角色。高亮在 Vue 里另走一套节点路径。图片对比从整张图按下就能拖。轮播圆点是页签，减少动效时仍渲染暂停按钮。宽高比默认裁切内容。栅格把弹性串里的下划线改成空格。垂直菜单每个条目都在 Tab 序里。页签、树和导航把数字 `1` 与字符串 `"1"` 当成同一个键。
- 3.0 的唯一行为：加载中的按钮是原生 `disabled`，并带 `aria-busy`。二维码的图片名字是 locale 状态，不读出编码值，SVG 对辅助技术隐藏。溢出头像是按钮。高亮只走字符串分段。图片对比只从手柄开始拖。轮播圆点是按钮；请求自动播放且系统要求减少动效时不渲染暂停按钮，轨道位移不因书写方向改符号。宽高比默认不裁切。栅格弹性串保持原样。垂直菜单根是 `menu`，同一时刻只有一个 Tab 停靠。页签、树和导航的键按类型区分，`1` 和 `"1"` 是不同项。
- 已删除：无。

## 表、图与编辑器

- 组件：`Table`、`VirtualTable`、`Calendar`、`Timeline`、`Collapse`、`ChartCanvas`、`Gantt`、`LineChart`、`RadarChart`
- 旧的默认行为：卡片树在第一次渲染就跟着 `matchMedia` 换掉表格。固定列用物理 `left` / `right`。没有行内控件时每一行都能 Tab。行拖拽整行可拖。折叠收起仍挂着子树。图表 svg 是 `role="img"`。甘特任务名用英文 `to` 且不带年份。折线的面积填充不跟零基线闭合。雷达缺测会把两侧连成弦。没有身份的虚拟行选择键是下标 `0`。
- 3.0 的唯一行为：服务端和客户端第一次都输出 `<table>`，窄视口卡片只在挂载后切换。固定列用逻辑起点和终点。没有行内控件时数据行共用一个 Tab 停靠。行拖拽只在把手上。收起的折叠面板卸掉子树，焦点回到标题按钮。图表 svg 是 `role="group"`，名字在组上，轴和标记仍可逐条读到。甘特刻度带年份。折线在 `showArea` 时面积回到 `y = 0`。雷达每个指标都有一个顶点。缺身份的行键是 `tiger-row:` 前缀，不与数字 id 相撞。
- 已删除：`exportFormat`、`columnDragHandleClasses`、`DonutChartProps`。

## 应用壳与发布面

- 组件：`Layout`、`AppShell`、`DataTableWithToolbar`、`WorkflowDetailShell`、CLI、MCP
- 旧的默认行为：页级壳没有跳到 `main` 的链接。列表筛选散在工具条里。审批表单和动作条各交一次。`create` 只有空白页。文档按类别收成一份。迁移靠手改导入。
- 3.0 的唯一行为：最外层 `Layout` 有一条跳到页面 `main` 的链接，目标 id 是 `tiger-main`。顶栏 `sticky` 仍是独立开关，不由 `variant` 打开。`AppShell` 把已有的侧栏、顶栏、面包屑、页签和页头拼成一页，页签标题只来自调用方。查询区提交和重置是按钮，收起后留下条件摘要，对象条件只交给父级，本地匹配跳过对象，提交把页码收回第 1 页。详情 `submitAction` 先 `mergeWorkflowFormValues`，再把动作条意见交给 `reduceWorkflowAction`。标题走 locale。`tigercat create --preset shell` 带上可运行的壳。文档站一组件一页。MCP 回答带安装版本；`tigercat_example` 只读示例，不安装。`tigercat migrate` 只改导入说明符和已删除的名字。
- 已删除：无运行时旧名。`migrate` 可改写的名字见 `REMOVED_PUBLIC_NAMES`。

## W9 模块增强

- 组件：主题根、`Inplace`、`CopyButton`、`Gallery`、`WaterfallChart`、`SankeyChart`、`NotificationBell`、`AssigneePicker`，以及各模块在 W0–W8 结构上的增强 props
- 旧的默认行为：主题写在文档根；没有行内编辑组件和复制按钮；预览、选择、表、图停在优化收口后的能力；`add` 写入空标签
- 3.0 的唯一行为：子树可以成为主题根，强调色从 seed 阶梯派生。`Inplace` 切换展示和编辑，编辑态复用已有输入框。`CopyButton` 只调用 `copyTextToClipboard`，失败可见且焦点留在按钮上。`Gallery` 组合缩略图和 `ImagePreview`。表的虚拟化是 `Table` 的策略。图例隐藏会移出比例尺。瀑布和桑基是两张新图。`NotificationBell` 不读命令式提示队列。`AssigneePicker` 只消费调用方目录。`tigercat add` 写入可运行用法。
- 已删除：无。不另做第二套预览、多选、日期、对话框或虚拟表。
