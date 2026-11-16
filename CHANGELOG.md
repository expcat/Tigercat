# Changelog

本文档记录 Tigercat UI 组件库的所有版本变更。

## v3.0.1（未发布）

- **ConfigProvider RTL 属性说明（文档 / MCP，C001-F004）**：i18n 方向解析说明改为 explicit dir prop，与公开属性一致。
- **Badge 默认零值与位置说明（Demo / 文档 / MCP，C007-F04）**：两端 Demo 和生成笔记写明 standalone 默认显示 0，位置只用 top-start、top-end、bottom-start、bottom-end。
- **Demo 外壳焦点留白（Demo，C013-V01）**：两端「编辑源码」按钮加入 16px 上下滚动边距，为自然 Tab 聚焦及 4px 焦点环留出空间；happy-dom 与几何核对通过，IAB 受子代理限制，窄屏真实复验待补。
- **Rate 示例行名称（Demo，C026-V01）**：两端 Demo02/03 的 slider 名称带上 sm、md、lg、count、自定义、只读、禁用描述。
- **Rate 只读导航按键（React / Vue，C026-V04）**：只读 Home、End 与方向键取消默认滚动，值仍为 4.5，焦点保持；双端回归先红后绿。

- **Figma 行高变量（Core，X02-F005）**：生成器将四个行高变量名映射为 `--tiger-primitive-font-lh-*`，167 个 Figma 变量均对应 tokens.css 的声明。
- **Card 键盘点击事件（React / Vue，C034-F07）**：根节点 Enter / Space 激活走原生 click，onClick 收到符合点击契约的事件，不再收到 keydown。
- **AutoComplete 空值注释（Core，C052-F04）**：AutoCompleteOption.value 注释与 Props 统一，空串表示未提交。
- **ColorSwatch 初选说明（Demo，C057-F07）**：两端 01 示例说明改为初选警告色，与 `#f59e0b` 初值一致。

- **组件文档索引（文档·生成器，X04-F01）**：生成索引和 Vue/React 框架索引改为打开 `shared/props/{kebab}.md` 与 `examples/{kebab}.md`。Form、Layout 仍指向内嵌标题的分类页。command-apis 改为指向 message、loading-bar、notification-container 三份拆页。
- **预发布 latest 修复（工具链，X06-F01）**：publish-on-tag 不再写死 `STABLE=2.9.4`，改用五个包 version 里最后一个不含预发布号的版本。当前是 3.0.0。
- **发布前核对标签（工具链，X06-F02）**：changeset publish 之前读取五个包的 version，与标签去掉 `v` 之后不一致就失败退出。
- **Vitest 子路径别名（测试，X06-F03）**：补上 React `useFullscreen` 和两端 `notification`（NotificationRoot）别名，具体别名排在根包别名之前。
- **README 版本（文档，X07-F01）**：根 README 与 Vue、React 包 README 改为当前版本 3.0.0，安装、CLI、MCP 命令去掉 `@next`。
- **Carousel 迁移说明（文档，X07-F02）**：3.0 迁移指南改为水平轨道位移随 `dir` 改符号，RTL 为正，与 `getScrollTransform` 一致。
- **3.0 preview.1–6 标题（文档，X07-F03）**：CHANGELOG 补上 3.0.0-preview.1 到 preview.6 的独立标题。preview.3–6 取已发布 changeset；preview.1 与 preview.2 没有对应 changeset，不新编组件变更。

- **通知铃未读播报（React / Vue，C177-F01）**：未读数从 1 改成 3 后 live 文案是 3 unread，全部已读后是 0 unread，zh-CN 是「1 条未读」。
- **通知铃打开焦点（React / Vue，C177-F02）**：全部已读时点开铃铛，焦点落在本实例面板内可聚焦的控件，而不是禁用的 Mark all as read。
- **通知铃条目类型（Core / 文档 / MCP，C177-F03）**：NotificationBellItem 删除。items 改为 NotificationItem[]，并增加 onItemReadChange；Vue 事件名仍是 item-read-change。生成 Props 写出该事件。
- **通知中心空分组（React / Vue，C178-F01）**：传入 groups=[] 时角标、全部已读和列表只看分组内条目；此时计数为 0、全部已读禁用。loading 走居中 Loading，没有遮罩和 inert。
- **通知中心单条已读播报（React / Vue，C178-F02）**：不传 manageReadState 时，点 Mark as read 两端都播报已读；再标回未读后礼貌区是 Marked 1 as unread，不再停在 Marked 1 as read。
- **时间线停放后加签（Core / React / Vue，C183-F01）**：pendingAfterAddsign 写出加签人和意见，例如专家、稍后补签；空对象不显示。真实临时加签节点仍显示位置词 After。
- **加签多人提交（React / Vue，C184-F01）**：加签保持 multiple，先点 Lin 再点 Expert 后确认，assignees 含两人。转交仍是单选。

- **表单向导步变化（文档 / Demo，C176-F01）**：生成说明改为 Vue 听 step-change、React 听 onStepChange；vue 02 用 step-change 清掉「流程已完成」。
- **表单向导禁用步（Core / React / Vue，C176-F03）**：disabled 只禁止进入，描述仍是 Later；Next 只跨过 skipCondition。
- **表单向导外部切步（React / Vue，C176-F04）**：父级把 current 从 0 改成 1 时重拍快照，model 已从 a 改成 b 也不弹离开框。
- **表单向导完成校验（React / Vue，C176-F05）**：确认步没有字段时，Finish 整表校验失败会把 Email is required 写进 role=alert。
- **任务板泳道折叠（React / Vue，C180-F01）**：有 onSwimlaneCollapse 时事件照发，本地折叠仍写入，aria-expanded 变 false，泳道卡片离开 DOM。
- **流程详情空槽（React / Vue，C182-F01）**：注释、空白和空串不算内容，不渲染 form/tabs/action，header 回退 Approval；数字 0 仍显示。

- **查询条与 SchemaForm 接线（Core / React / Vue / Demo / 文档 / MCP，C175-F01、C175-F02、C175-F03、C175-F05、C175-F06、C179-F01、C179-F02）**：查询区重置按钮走 table locale，zh-CN 为「重置」。React 受控 name 重置后输入框、onReset 和行集仍是 Ann。Vue 后传入或替换的 query.api.getQueryValues 仍是 function。两端 data-table-with-toolbar/02 关闭不筛表的搜索框。生成的 Custom Filters 示例让 Input onChange 直接收值。input 的 maxLength 与 prefix 传到控件；DatePicker 没有的 picker、showTime 移出允许列表，未知参数按键各自警告。生成示例和优先列表改用 Vue modelValue、React value。

- **聊天窗与评论串（Core / React / Vue / Demo / 文档 / MCP，C173-F01、C173-F02、C173-F03、C174-F01、C174-F02、C174-F03、C174-F04、C174-F05）**：不传 virtual 时满 40 条自动开窗，传 false 仍是普通 log；类型注释和生成 Props 默认写 auto (>=40)。Vue 关掉自动滚动后，挂载一帧 scrollTop 为 0。React 虚拟模式下同一条正文从 hello 改成 hello world，礼貌区跟着更新。replyPlaceholder 为「写下回复」时，两端行内回复框 aria-label 也是「写下回复」。Vue 的 onReply 同步抛错后根草稿仍是 top。两端 02 从根输入框发送 top 后列表出现 top。只传 onMore 就显示 More actions。nodes 里两个 id 为 a 时 alert 为 Duplicate comment id a，且只有一篇 article。

- **受理人选择器键盘、过滤与文档回写（Core / React / Vue / 文档 / MCP，C172-F01、C172-F02、C172-F03、C172-F04、C172-F05、C172-F06）**：搜索框方向键把活动项从 Ada 移到 Bea，名称不再与列表相同。点击 Cy 后 Enter 作用在 Cy，不会把 Bea 加进已选。三人名单搜索 zzz 显示 No results found，zh-CN 为「暂无结果」；options 为空仍是 The directory is empty /「目录为空」。选中 Cy 和 Bea 后搜索 Design 仍显示 2 selected。30 人按 End 时列表含 overflow-auto 和最大高度，最后一人滚进容器。生成 Props 与示例写明 Vue v-model:selected-ids 和 React onChange。

- **动态流开窗与应用壳页签（Core / React / Vue / 文档 / MCP，C170-F02、C170-F03、C170-F04、C171-F01、C171-F02）**：开窗后自定义分组头仍显示 CUSTOM-HEADER。groupByDate 按调用方时区归组，UTC 下 2024-05-02T20:00:00.000Z 归到 2024-05-02，section 含 Evening。loadError 显示本地化说明和重试，zh-CN 为「无法加载更多动态。」和「重试」，点一次再请求 1 次。AppShell 正文只在选中的 tabpanel 内。breadcrumbExtra 与 tabsExtra 和数组一起渲染，空数组只留自定义节点。

- **富文本链接、纯文本与图片（Core / React / Vue，C167-F02、C167-F03、C167-F04、C167-F05、C167-F06、C167-F07）**：zh-CN 链接表单占位为「输入链接地址」，打开后聚焦输入框。plain 模式受控回写 Hello world 后编辑区不再残留 strong。只有图片时 isContentEmpty 为 false 且不显示占位，空段落仍算空。粘贴被拒图片的 live 公告走 locale，zh-CN 为「图片未粘贴。」。Vue 先调用调用方的 keydown 与 blur，再跑内部热键，paste 与 click 仍到达。HTML 转 markdown 时，alt 写在 src 前或后都留在方括号里。

- **打印纸面墨色与虚拟表窗口（Core / React / Vue / 文档 / MCP，C165-F01、C165-F02、C169-F02、C169-F03、C169-F04）**：页眉、页脚和分页符标签改用纸面墨色 #111827，暗色主题不再把它们改成次级浅色。横向纸张的 bind 预览按纸高和 20mm 边距计页，landscape 且 contentHeightMm 为 250 时至少两页，预览节点带 print:hidden。VirtualTable 的 overscan 传入纵向窗口。virtualItemHeight 的运行时、类型注释和生成 Props 默认对齐为 40。React 与 Vue 一样，未传 pagination 时关闭，传入 pageSize 5 时两端都渲染 5 行并显示分页导航。

- **无限滚动文案与 Markdown 窗格（Core / React / Vue / Demo，C163-F01、C163-F02、C163-F03、C164-F01、C164-F02、C164-F03）**：错误和重试走 infiniteScroll locale，传入文案优先。container 滚动根可被 Tab 聚焦并带焦点样式，默认视口根不加 tabindex。两端 Demo 01 写明第一页 12 条、容器根、内容不满时不自动连拉。Vue 窄屏 split 可在编辑和预览之间切换，目录按钮聚焦编辑器自身，组合输入期间不执行格式热键。

- **文件列表高度与标注键盘（React / Vue，C161-F01、C161-F02、C162-F01、C162-F02）**：FileManager 回退高度改为 min-height，空根不再写内联 height: 20rem，Vue 的高度类可以换掉这层下限；bind 打开按名称交回 FileItem。ImageAnnotation 从 listbox 按方向键先聚焦当前项或第一项，形状上的方向键不再冒泡。bind 移出公开 props，私有推动按钮删除。

- **编辑器缓存与列表拖拽（Core / React / Vue，C159-F01、C160-F01、C160-F02、C160-F03）**：高亮缓存区分同名高亮器的函数引用；Drag 默认项支持聚焦与键盘拿起、移动、放下，同列表和跨列表悬停播报保留正确项号；React 根保留原生属性、样式和点击。

- **图表标签、画布参数与头像示例（React / Vue / Demo，C151-F01、C154-F01、C154-F02、C158-F01、C158-F02）**：桑基节点和瀑布柱使用布局 label 作为可访问名称；两图透传 padding/desc，保留默认 16/24；OrgChart 02 示例改用 HTTPS 头像。

- **图表数值与播报（Core / React / Vue，C146-F02、C149-F02、C149-F03、C150-F01、C153-F02）**：漏斗比例跳过非正值阶段；热力图 SVG 与 canvas 均保留完整数值表；折线系列面积与透明度覆盖图表默认并同步零基线；雷达图一次激活只触发一次系列回调。

- **Gantt 日期范围与 Gauge 数值（Core / React / Vue / Demo / 文档 / MCP，C147-F02、C147-F03、C147-F05、C148-F01、C148-F02）**：Gantt 的日期式 maxDate 包含当天，外壳与画布共用 responsive（默认 false），双端 02 示例支持拖拽回写。Gauge 文字与 ARIA 使用夹取值；反向弧与分段修正方向，整圈拆段并拒绝超 360°。

- **图表键盘焦点（React / Vue，C147-F01、C149-F01、C150-F03、C152-F01、C155-F02、C155-F03、C156-F02）**：方向键同步任务、格子、点与弧的 roving tabindex；关闭提示或已有选中时仍可导航，热力图 canvas 名称跟随当前格；饼图与非圆形散点从整张 SVG 查询焦点目标。

- **图表图例隐藏与动画（Core / React / Vue，C138-F01、C139-F01、C139-F02、C146-F01）**：隐藏图形不再响应指针或进入点焦点与最近邻扫描，层级图同时屏蔽隐藏根的后代；BarChart 按每根柱显示和切换图例；共享图表动画规则接入 Tailwind 插件，并修正无效 easing 引用。

- **图表基础层（React / Vue / 文档 / MCP，C141-F01、C141-F02、C141-F03、C144-F01、C145-F01、C145-F02）**：Vue ChartCanvas 接受字符串 style，两端保留调用方 ARIA 引用，显式 aria-label 优先于 title；生成说明对齐固定 role=group。ChartSeries 不再用空 paint 清掉调用方 fill/stroke。Vue ChartTooltip 仅在有 dismiss 监听时拦截 Escape，两端 SSR 首次坐标均保留 x/y，挂载后再定位。

- **Timeline pending 播报（React / Vue，C137-F01）**：元素 pendingContent 不再被 String() 成 [object Object]。Vue 使用 pending 槽时，live region 不再播报被槽替换的 Loading...。

- **Table 排序面板与 grid 焦点（React / Vue，C136-F01、C136-F02）**：传入 sorts（含空数组）不再把 W9 面板挂进文档，多列排序改由表头完成。开启 grid 后 ArrowRight 把焦点移到下一格；到边界时不拦截按键。

- **DataExport 默认三项与 customExport 载荷（Core / React / Vue / Demo / 文档 / MCP，C135-F01、C135-F02）**：笔记与两端 Demo 写默认 xlsx、csv、markdown，多格式菜单含 Export CSV，触发器名走 triggerAriaLabel。隐藏 secret 时 customExport 收不到 secret 和 render-only 列，name 为 X:Ada。

- **Countdown timer 可访问名（React / Vue，C134-F01）**：无 title、interval 为 0、ariaLabel 为「付款倒计时」时，timer 可访问名是 00:00:05，根节点仍用 ariaLabel。React 未传 ariaLabel 时保留调用方的 aria-label。

- **CollapsePanel 收起态 aria-controls（Vue，C133-F01）**：默认收起的标题按钮不再写 aria-controls；展开后等于 region 的 id。关闭仍即卸载。

- **Calendar 生成示例（文档 / MCP，C131-F01）**：Vue 示例改为 `<Calendar v-model="date" />`。组件只声明 modelValue，照示例挂载可以选中日期。

- **Splitter 比例延续与折叠恢复（Core / React / Vue，C051-F01、C051-F02）**：容器 804、gutter 4、sizes=[200,600] 经 ArrowRight 后移除 sizes 仍为 210/590。sizes=['30%','70%'] 不回写时，ArrowRight 后容器增至 1604 约为 500/1100。sizes=['30%'] 且 collapsible 时，第二 pane 折叠再展开恢复为 560px。

- **Space 分隔符与 verticalSize 说明（Core / React / Vue / 文档 / MCP，C050-F01、C050-F03）**：split 先展开 Fragment 并去掉注释。Vue v-for 三项出 2 个分隔符，v-if=false 只剩 B 时无前导分隔符；React 三项 Fragment、Fragment(A,B)+C 同样各出 2 个分隔符，空 Fragment 后的 B 没有前导分隔符，数字 0 仍保留。verticalSize 注释改为数值 size 输出 gap:40px 简写，该属性只覆盖行间距。

- **Skeleton 预设、行数与加载后宿主（Core / React / Vue / 文档 / MCP，C049-F01、C049-F02、C049-F03）**：只传 preset=avatar 时两端输出 rounded-full w-10 h-10，显式 variant 优先，preset 不再进入 DOM。rows 使用 resolveSkeletonRows，rows=8 渲染 6 条，rows=2.5 且 paragraph 渲染 2 条且末行 60%，Infinity 回退为 1 条。loading 从 true 改为 false 后根保留 id、class、padding、aria-describedby、data 与点击，并撤下骨架的 aria-hidden 与 status。

- **Sidebar 零宽隔离与展开 tabindex（React / Vue，C048-F01、C048-F03）**：React 零宽折叠时最后写入 inert、aria-hidden=true、tabindex=-1，调用方冲突值不能覆盖；展开态继续透传。Vue 只在 fullyHidden 时强制 tabindex=-1，展开且传入 0 时 SSR 保留 tabindex=0。

- **ScrollArea 焦点、ARIA、RTL 与原生条（Core / React / Vue / Demo，C047-F01–F06）**：溢出且 scrollbar 为 hidden 或 nativeBars 时，两端 viewport 保留 tabindex、region 与名称，gutter 只在自定义条出现时留白。aria-describedby 与 aria-busy 转到 viewport，显式名称仍可覆盖。Vue 静态字符串 tabindex=-1 在溢出时保持 -1。RTL 负值模型在 scrollLeft 从 -1 到 0 时进度停在起点，正反换算使用同一模型。默认 auto 且已测量并溢出时隐藏原生条，nativeBars 不隐藏。两端 Demo02 改为 axis 为 both。

- **Resizable 手柄焦点、上限与名称（Core / React / Vue / 文档 / MCP，C045-F01、C045-F02、C045-F03、C045-F04）**：生成笔记与 MCP 写明未禁用的边手柄和角手柄都进入 Tab。未传最大值时 `aria-valuemax` 取当前值，不再落到隐式 100。仅 style 为 320×180 时，right 为 320、bottom 为 180。根节点 `aria-labelledby` 不再清空手柄的 locale 名称。

- **Masonry 间距分配与示例（Core / Demo，C044-F01、C044-F02、C044-F03）**：最短列按含列内间距的占用高度选列。heights=[100,1,1,1]、columns=2、gap=100 时第 4 项进入第 1 列，列高为 [201,102]。两端 masonry/01、03 显式传入 shortest。masonry/02 去掉 672px 上限，改用预览里可达的 md：宽屏 4 列、24px，sm 为 16px，窄屏仍是 1 列、8px。

- **List 悬停与页大小（Demo，C043-F04、C043-F05）**：两端 list/01 显式传入 hoverable，行带悬停底色。两端 list/03 保存并回传 pageSize，选择新页大小后列表条数与选择器保持该值。

- **Layout 横排属性（文档 / MCP，C042-F01）**：生成笔记与优先字段改为公开的 `mode`。Layout 文档与 MCP 写 `mode=horizontal`，不再出现 `direction=horizontal`。

- **Header 示例说明（Demo，C041-F01）**：两端 layout/01 改为写 blur 半透明顶栏，不再写未启用的 sticky 盖住滚动内容。

- **Descriptions 属性、标题与组合语义（React / Vue，C039-F01、C039-F02、C039-F04、C039-F05）**：children/default slot 保留根属性与样式；Vue title slot 关联 table/dl 名称；空数据仍显示标题，有数据时保留 caption；DescriptionsItem 使用 dl 容纳 dt/dd。

- **Content 跳转目标 id（React / Vue，C038-F01）**：双端 Content 与 Layout 共用 Core id 解析，首尾空格会修剪，纯空格回退为 tiger-main；跳转链接 href 与实际 main.id 保持一致。

- **Col flex 隐藏语义（Core / React / Vue，C036-F01）**：flex 只跳过 span 宽度，保留 span=0 及响应式断点的隐藏变量；flex 样式读取同一 display 变量，非零断点恢复显示。

- **Carousel 圆点说明与 Vue 状态同步（Demo / 测试 / Vue，C035-F01、C035-F02、C035-F03）**：两端 Demo01 和 React 测试标题改述导航按钮与 aria-current。Vue 释放初始受控索引后保留当前页，每次 render 读取新 slot 内容，页数改变时同步窗口顺序与位移。

- **Card 标题、内部控件与条件内容（React / Vue / 文档 / MCP，C034-F01、C034-F02、C034-F03、C034-F05、C034-F06）**：文档区分 title 可见标题与 htmlTitle 原生提示；独立链接保留标题级别，Vue header 链接有名称。库内 Input 独立交互，卡片键盘激活限根节点；空 actions / cover 不留壳，数字 0 保留；Vue 横向封面链接保留内容列和 padding。

- **AspectRatio 示例说明与选中态（Demo，C033-F01、C033-F02）**：两端 Demo01 写明显式 fit=cover 才铺满并裁切媒体；Vue Demo03 的蓝色选中类与灰色未选中类互斥，亮暗主题均保留可辨的选中态。

- **Watermark 回退、内容更新与异步状态（Core / React / Vue / 文档 / MCP，C032-F01、C032-F02、C032-F03、C032-F04、C032-F05）**：图片失败时绘制已提供的文字；React 区分字符串与数组内容，Vue 跟踪响应式数组原地修改。图块和错误状态只由当前请求提交。文档撤下覆盖层自动重挂承诺。

- **Tag 关闭回调与名称边界（Core / React / Vue / 文档 / MCP，C031-F01、C031-F02）**：两端关闭时通知一次 `onOpenChange(false)`（Vue 为 `open-change`），保留 close，由父级回写 open 或卸载。Core 注释与生成笔记明确子组件内部文字不进入默认关闭名，此时须显式传 `closeAriaLabel`。

- **Statistic SSR、精度与零节点（Core / React / Vue，C030-F01、C030-F02、C030-F03）**：两端动画初值使用目标值，SSR 与首次客户端渲染一致，挂载后启动动画。Core 按科学计数法的尾数与指数推断小数位。React 保留 title / prefix / suffix 的数字 0，空值与 false 仍省略。

- **SplitButton Fragment 与首次键盘焦点（Core / React / Vue，C029-F01、C029-F04）**：React 递归分类 Fragment 中的菜单，保留独立 trigger，主按钮内不再嵌入菜单项。双端 Dropdown 的键盘落项使用共享焦点标识补齐首帧焦点环，指针交互或失焦后清除，指针打开不添加标识。

- **Segmented 方向、暗色底板与窄屏标签（Core / React / Vue，C028-F01、C028-V01、C028-V02）**：两端键盘优先使用 Provider 显式方向，否则读取最近 DOM `dir`。暗色选中底板混入前景色以区分轨道；lg 在窄屏缩小水平内边距，图标后的「日」字完整显示，桌面内边距保留。

- **Result 条件空标题（Vue，C027-F02）**：按本次 title slot 的实际内容决定标题，空 slot 回退到 title prop；没有标题时不生成空 heading，HTTP 数字保留可访问文本，条件切换时同步更新。

- **Rate 只读说明、原生事件、悬停预览与空星对比（Core / React / Vue / Demo / 文档，C026-F01、C026-F02、C026-F03、C026-V02、C026-V03）**：生成笔记与 MCP 只承诺 `readOnly`。两端根节点先调用调用方的按键和 mouseleave，已取消的 ArrowRight 不改分。悬停后切到 readOnly 或 disabled 时结束预览，离开和解锁后只显示真实分。启用空星改用 `--tiger-text-secondary`，禁用仍用 `--tiger-text-disabled`。Demo03 心形改为随颜色变化的文本 ♥。

- **QRCode 图像名称、对比与页尾章节（Core / React / Vue，C025-F01、C025-F02、C025-F04、C025-F05）**：expired 且有刷新时，图像角色只包住二维码，刷新按钮与之并列，两端 a11y 不再报 nested-interactive。显式 aria-label 保留，expired 仍在名称后带状态；locale 与 aria-labelledby 仍可用。--tiger-text 与 --tiger-surface 同为白色时对比诊断为 1:1 并预警。滚动容器到底时，章节导航高亮最后一节。

- **Marquee 复制段与焦点暂停（Core / React / Vue / Demo，C024-F01、C024-F02、C024-F03）**：两端 Demo02 改为 direction 用 end，并写明受控时由外部 Pause/Play 控制、焦点不触发暂停。子层只更新自己的 state 或 ref 时，原内容与复制段都变成新文本。未受控实例在关闭 pauseOnFocus 期间焦点离开后，再打开仍继续滚动。

- **Link 禁用示例说明（Demo，C023-F01）**：两端 link/01 改为写明 disabled 时移除 href 并不可聚焦，不再写禁用仍保留 href。

- **Kbd 组合名称与空末键（React / Vue / 文档，C022-F01、C022-F02）**：两端组合键留在原生 kbd 的可见文本里，不再设置根 aria-label，内层键名也不再 aria-hidden。keys 为 Ctrl 与 K 时，启用 aria-prohibited-attr 后无违规；Ctrl 后再接末键 S 时露出的文本含 S。空数组、空 Fragment 和只含注释的 slot 不再留下尾随分隔符。

- **Inplace 根属性、编辑热键与焦点（React / Vue / Demo，C021-F01、C021-F02、C021-F03、C021-K01）**：React 把 id、className、style、title、data-* 和 aria-* 留在外层 span。两端忽略输入法组合中，以及子节点已经取消的 Enter 和 Escape。进入编辑后聚焦编辑区内第一个可聚焦元素，没有则聚焦编辑容器；提交或 Escape 后焦点回到展示按钮。两端示例说明改为 Escape 退出编辑并保留当前输入。

- **ImagePreview 循环说明、手势与缩放范围（文档 / Vue / React，C020-F01、C020-F02、C020-F03）**：生成笔记改为多图首尾循环，Props、Examples 与 MCP 不再写到头禁用。Vue 打开期间按图片数量、缩放范围和滑动开关重建手势会话，1 张变 2 张后可以滑动换图，关掉 touchSwipeable 后不再滑动换图。两端打开、切图和 Reset 把比例夹进 minScale 与 maxScale，范围不含 1 时不再发出 scale 1。

- **ImageGroup 受控索引（React / Vue，C019-F01）**：传入 currentIndex 时，切图只发出下一张索引请求，灯箱停在父层那一张。ImageGroup 固定 currentIndex=0 时画面仍是第 1 张。未传 currentIndex 的预览仍自行切图，并在首尾循环。

- **ImageCropper 比例、放大与导出（Core / React / Vue / Demo，C018-F01、C018-F02、C018-F03、C018-F04、C018-K01、C018-V01）**：React 在 `aspectPreset` 变化时同步选中按钮和几何比例。容器放大时先记下新的显示尺寸，再约束选区。锁定比例后，图片仍能放下的最小边会被重新满足；角手柄只收到水平键时按宽度等比缩放。旋转或翻转导出按图片自然尺寸画进预览框，内容对齐变换后的显示选区。两端 04 改为按显示选区裁剪，不再写旋转交换宽高。

- **ImageCompare 拖动中禁用（React / Vue，C017-F01）**：手柄拖动中切到 `disabled` 时结束当前会话。之后的 pointermove 不改变位置，也不发出 change 或 update:position。

- **Image 失败预览与示例（React / Vue / Demo，C016-F001、C016-F002、C016-F003）**：独立图片最终失败且没有可用回退时，激活宿主不发出预览已打开，后续 src 更新也不会自行打开。image/03 的 alt 改为「示例图片」。image/06 主图改为本地失效地址，失败后使用回退图。

- **Highlight 保树示例与关键词说明（Demo / 文档 / MCP，C015-F01、C015-F02）**：两端 03 改用原生链接，第三段保留链接并把匹配文字包在 mark 里。生成笔记写明 Vue 不展开组件 VNode。页面介绍改为字符串关键词匹配。

- **Empty showImage 说明（Core / 文档 / MCP，C013-F01）**：类型注释与生成笔记写明 `showImage=false` 时自定义 image 节点/插槽也不渲染，Props、Examples 与 MCP 同步，行为不变。

- **Divider 空白标签与示例预览焦点（Vue / Demo，C012-F001、C012-V01）**：Vue 在交给共享分类前展开 Fragment 并去掉注释与空白文本，条件隐藏或空白 slot 输出整条装饰线且 `aria-hidden="true"`。两端示例预览 iframe 在键盘聚焦时显示内缩轮廓。

- **CropUpload 名称与 id（React / Vue，C011-F001、C011-F002、C011-F003）**：两端文件输入引用触发按钮的名称，保留调用方显式 `aria-label`；Vue 优先使用显式 `id`，文件输入沿用 `-input` 后缀。

- **CopyButton 按钮属性与异步焦点（React / Vue，C010-F001、C010-F002）**：Vue 的原生按钮属性传给真实 button，class/style 继续用于外层布局；两端复制完成后保留用户已移走的焦点。

- **Badge 无障碍与 locale（React / Vue，C007-F01、C007-F02、C007-F03）**：两端保留字符串 `aria-hidden="false"`，overlay 计数按组件合并后的 locale 格式化；React 的 dot 在 locale 名称为空时仍按共享内容决议渲染并保留显式名称。

- **AvatarGroup 折叠与组名（React / Vue，C006-F001、C006-F003）**：React 计数前展开 Fragment，max=1 时保留 A 并折叠 B 为 +1；两端原生 aria-label 为 undefined 时保留 locale 默认组名，显式名称仍可覆盖。

- **Avatar 名称、示例配色与组叠放（Core / React / Vue / Demo，C005-F001、C005-F002、C005-F003）**：外部标签接到实际图片，图片与回退保持显式名称优先；TC 示例使用主题前景色适配明暗主题；溢出按钮重叠缩至 4px，避免遮住「陈晨」字形。

- **Button 默认加载描边（Core / Vue，C004-F002）**：共享 SVG descriptor 在 Vue 渲染前转换现有描边属性，默认 loading 圆环输出 stroke-width="4"，与 React 一致。

- **Text 复制回调类型与标签示例（React / Demo，C003-F001、C003-F002）**：React 顶层 onCopy 排除原生剪贴板事件类型，回调接收复制文本；Vue 标签改用 for，两端示例补上对应输入目标。

- **Icon 字符串样式与注册说明（Vue / Core / Demo / MCP，C002-F001、C002-F003）**：Vue 保留字符串 style 的颜色与宽高，显式 color 只覆盖颜色；类型注释、生成文档与两端示例改用 createIconRegistry 的 register / registerMany，并通过 ConfigProvider.iconRegistry 接线。

- **ConfigProvider 生命周期、主题撤销与加载状态（Core / React / Demo，C001-F001、C001-F002、C001-F003、C001-F005）**：React StrictMode 重放后保留同一自建图标表，卸载时清空；撤销根 theme 后恢复文档基线主题或 default；嵌套 `localeLoading` 纳入父层状态。两端 Demo 明确控件只作用于示例子树，iframe 的 html 由沙箱外层管理。

- **Tour 目标点击推进（React / 文档生成器，C130-F01）**：`advanceOnTarget` 目标保持在 inert 之外，点击后进入下一步，与 Vue 一致；生成笔记同步说明它与 `interact` 都豁免。

- **Tooltip 焦点说明（文档 / MCP，C129-F02）**：生成笔记与迁移文档写明，`trigger="hover"` 的焦点进入立即打开，默认 100ms 的显示延迟只作用于指针。

- **Progress 百分比语言（React，C128-F01）**：默认百分比文字遵循 ConfigProvider 的 locale；fr-FR 的 50% 显示为 `50\u00A0%`，与 Vue 一致。

- **Popconfirm 键盘确认（React / Vue，C126-F01）**：打开并完成定位后聚焦确定按钮，Enter 确认；Shift+Tab 与 Tab 可在取消、确定之间移动，不再因焦点留在触发器而提前关闭。

- **NotificationContainer 操作节点（Vue，C125-F01）**：主按钮或 `actions` 与 `actionNode` 同时存在时，自定义节点渲染在同一操作区的按钮之后，与 React 一致。

- **Modal 确认等待与层级（React / Vue，C124-F01、C124-F02）**：React 命令式确认等待 `onOk` 的 Promise，兑现后才关闭；返回 false 或拒绝时保持打开。Vue 自定义 `zIndex` 在打开期间更新，并在离场过渡中保留。

- **MessageContainer outlet 实例（Vue，C122-F01）**：容器使用稳定的实例 id，切换 position 时更新原条目；同位实例卸载一个时保留另一个。

- **LoadingBar 粘色说明（Demo / MCP，C121-F01）**：两端示例 03 与 command-apis 写明，省略选项的 `start()` 沿用上次 color，直到 hide 或 clear。

- **Loading dots 与 bars 动画（Core，C119-F01）**：主题插件纳入 `loadingAnimationBaseStyles`。`variant` 为 dots 或 bars 时，产物 CSS 含 `tiger-bounce-dot` 与 `tiger-scale-bar` 的 keyframes，对应节点按这两个类名播放。

- **Drawer 全屏关闭轴与 Vue after-enter（Core / Vue / React，C118-F01、C118-F02）**：窄于 md 的全屏抽屉，跟手距离、位移和松手阈值改走 `getDrawerSwipeCloseDirection`。LTR 向右、RTL 向左，left / top / bottom 沿这个方向拖过阈值会关闭。Vue 在 `destroyOnClose` 下首次打开和销毁后重开时，等面板进入文档且这一层过渡结束后才发出 `after-enter`。

- **Alert 实时区域、倒计时暂停与 action 顺序（Core / Vue / React，C117-F01、C117-F02、C117-F03）**：非 error 的实时区域改看当前 document 是否已经首次绘制，不再用模块级微任务，进程内也不再常驻。首屏和每次服务端请求里的静态 info / success / warning 不带 `role="status"` 与 `aria-live`；绘制之后新插入的才带。`duration` 期间指针或焦点进入 Alert 会暂停，离开后按剩余时间继续，到点仍关闭，`closable` 仍独立。两端顺序统一为 title、description、action、默认内容，action 容器使用同一套 description class。

- **Tree 键盘、名称与选择（Core / Vue / React，C116-F01、C116-F02、C116-F03）**：React 一次字母只推进一次 typeahead，先停在首个匹配项，连续前缀再命中对应节点。未传 `ariaLabel` 时，`role=tree` 使用原生 `aria-label`。未写 `selectionMode` 时，`selectable={false}` 不可选，`multiple` 为多选；显式 `selectionMode` 仍优先。

- **TabPane label slot（Vue，C115-F01）**：标签实例带上子节点的 label slot。`label=概览` 且 `#label` 为「自定义」时，可见标题和读屏名称都是「自定义」。

- **Tabs 懒渲染默认值与类型化 key（Vue / React，C114-F01、C114-F02）**：React 省略 `lazy` 时与 Core、Vue 一样挂载未访问面板，只有显式 `lazy` 才推迟挂载。数字 `1` 与字符串 `"1"` 的 DOM id、React 列表 key 和溢出文案不再相撞，关闭当前项后焦点落到对应的下一项。

- **Spotlight 热键、搜索框关闭与图标（Core / Vue / React / Demo，C111-F01、C111-F02、C111-F03、C111-F04）**：Vue 在 `hotkey` 变化时认领或释放全局热键，挂载后再打开可以响应 Meta/Ctrl+K，关掉后不再响应。已打开面板的搜索框上，带命令修饰键的切换热键可以关闭面板；其他可编辑目标和裸字母仍留给输入。示例 01 传入 `hotkey`，02 用 `defaultOpen` 演示 ⌘ ,。已注册图标名渲染为 svg，未注册字符串仍显示为文本。

- **ScrollSpy 受控禁用键（React，C110-F01）**：传入 `activeKey` 时显示该键，禁用或不存在也不再静默改成第一项，且不触发 `onActiveKeyChange`。未传 `activeKey` 时仍按 `defaultActiveKey` 或第一项可用项初始化。

- **Pagination 受控夹取、快速跳页、禁用与方向（Vue / React，C109-F01、C109-F02、C109-F03、C109-F04）**：Vue 在受控 current 为有限数字且与夹取值不同时发出一次 `update:current` 与 `change`，父级接受夹取值后不再重发。React 传入 `quickJumperValidation` 时复用空闲校验调度，不传时仍在提交时才夹取。双端 `disabled` 同时禁用省略号跳页按钮和输入。React 按合并后的 locale 在 `nav` 上写 `dir`。

- **NavigationMenuTrigger 顶栏 typeahead（React，C107-F01）**：Trigger 聚焦后键入字母前缀时，复用已有 menubar typeahead，焦点跳到匹配顶栏项并写上 tab stop，与 Vue 一致。

- **NavigationMenuList current 指示器（Vue / React，C106-F01、C106-F02）**：React current 指示器补上与 Vue 相同的绝对定位、h-0.5 高度和主色。双端在视口或列表几何变化后重测 current 项，指示器起点和宽度继续对齐。

- **NavigationMenuLink 根禁用（Vue / React，C105-F01）**：面板已经打开后再把根设为 `disabled` 时，双端面板内 Link 去掉 href、带 `aria-disabled`，点击不再执行调用方回调。

- **NavigationMenuItem 根禁用与生成示例（Vue / React / 文档生成器，C104-F01、C104-F02）**：双端根 `disabled` 且 `defaultValue` 或受控 `value` 命中某 Item 时，Content 保持关闭。Item 生成示例补上 Content 与 Link，重跑 `pnpm docs:api` 后 Examples 与 MCP 片段构成有效组合。

- **NavigationMenu menubar 子角色（React，C102-F03）**：启用 portal 时，关闭的面板继续挂载在 portal 中，不再把 mega 面板的原生链接带回 menubar；现有打开面板的 axe 用例通过。

- **SubMenu 标题命名与 RTL 弹层（Vue，C101-F01、C101-F02）**：按钮与子列表共用调用方或生成的标题 id，保持 `aria-labelledby` 引用有效。嵌套弹层向现有定位 helper 传入实际方向，RTL 请求 `left-start`，与 React 一致。

- **MenuItemGroup 嵌套缩进（Vue，C100-F01）**：inline 模式下向嵌套分组继续传播当前层级与折叠状态，Inner 标题和 Leaf 保留 24px 缩进，与 React 一致。

- **MenuItem 事件、缩进与字符定位（Vue / React，C099-F01、C099-F02、C099-F03、C099-F04）**：双端原生 click / keydown 与内部选择、导航组合，保留调用方 `preventDefault()` 取消约定；Vue SubMenu 同步修复事件覆盖。React 自定义 style 保留 inline 层级缩进，冲突时内部起始 padding 优先。双端 typeahead 复用当前层可用项枚举，跳过隐藏子菜单，并同步唯一 tab stop。

- **Menu 内容优先级（Vue / Core / MCP，C098-F03）**：双端统一为 `items` 非 `null` / `undefined` 时优先（包括空数组），不渲染默认 slot / children。Vue 对齐既有 React 行为，Props 与 MCP 同步写明混用规则。

- **FullscreenButton 目标同步与说明（Vue / React / MCP，C097-F01、C097-F02、C097-F03）**：双端全屏期间切换 target 后重新同步 pressed 状态与标签，下一次点击进入新目标。Demo 说明 SSR 首屏不禁用、挂载后检查浏览器支持；生成 Props 与 MCP 按 Core `FullscreenProps` 解析并公开 `onChange` / `onError`。

- **FloatButtonGroup 关闭焦点与鼠标事件（Vue / React，C096-F02、C096-F03）**：双端从面板内按 Escape 或默认动作关闭后回焦触发器，`closeOnAction=false` 保留动作焦点。Vue 根节点在 click / hover 模式下保留调用方 mouseenter / mouseleave，并继续执行内部 hover 开合。

- **FloatButton 链接与默认偏移（React / Core / MCP，C095-F01、C095-F03、C095-F04）**：React 链接接入公开 `onClick`，click 事件与 ref 类型覆盖 button / anchor，禁用时仍退化为 disabled button。FloatButton 与 Group 的生成 Props 和 MCP 默认 offset 校正为 `{ x: 24, y: 76 }`，说明避让 BackTop，运行值不变。

- **DropdownItem radio 点击（Vue，C093-F02）**：点击与 Space 使用相同的类型分支；已选 radio 继续发出 `check(true)` 并保持 `aria-checked=true`，checkbox 仍取反。

- **Dropdown schema 与 focus 打开（Vue / React，C092-F01、C092-F02、C092-F03、C092-F04）**：Vue schema 叶项遵守父级 `closeOnClick`，子菜单继承禁用与关闭策略，向根菜单转发选择 / 勾选通知；普通项默认整体关闭，checkbox / radio 保持打开。双端 hover 触发器获焦即打开，关闭后回焦不会重新打开。

- **ContextMenu 打开焦点与 schema 菜单（Core / Vue / React，C088-F02、C088-F03、C088-F04、C088-F06）**：双端外部受控 `open` 打开后聚焦首个可用菜单项。React ContextMenu / Dropdown 的 `items` 遵守 `closeOnClick=false`，菜单 id 与触发器 `aria-controls` 对应；共享方向键导航按 DOM 顺序包含 checkbox / radio，保留层级、隐藏和禁用筛选。

- **Breadcrumb 折叠菜单键盘（Vue / React，C086-F02）**：打开后聚焦首项，复用既有菜单方向键导航；Escape 关闭并回焦省略号，Tab 离开时关闭菜单。Enter / Space 激活原项并关闭菜单，触发器支持上下键打开首项或末项。

- **AnchorLink 原生 rel 与规范化 href（Vue / React，C084-F01、C084-F02）**：双端保留调用方 rel，`_blank` 继续由现有 helper 补齐 `noopener noreferrer`；Breadcrumb 可见项与折叠项同步修复同一遗漏。Vue 注册、动态更新和注销统一使用规范化 href，首尾带空白的锚点也能被父级观察。

- **Anchor 水平墨水方向与重新显示（Vue / React，C083-F01、C083-F02）**：双端向现有定位 helper 传入 nav 的实际文本方向，RTL 链接贴右缘时墨水起点为 0px。React 切换 `showInkInFixed` 重新显示墨水后恢复活动链接的位置与宽度。

- **Affix 实时布局与重绑通知（Core，C082-F01、C082-F02）**：共享控制器从内容的当前流布局重测宽高，观察时跳过 `display: contents` 外壳。双端固定后父宽 200→400、内容高 40→80 时，固定宽度和占位同步更新；偏移量重绑导致解除固定时补发一次 `change(false)`，后续观察不重复通知。Anchor、AnchorLink 同验通过。

- **Upload 筛选、结果与生命周期（Core / React，C081-F01、C081-F02、C081-F03、C081-F04、C081-F06）**：单选后只在已接受集合内应用 limit，接受与拒绝互斥。分片与整文件共用成功结算，保留分片响应中的可用 URL 和响应；原生表单只提交成功文件的合法 URL，空结果仍提交空隐藏域。React 本地图片首次加入即显示缩略图与预览按钮；卸载后待决 `beforeUpload` 不再写回列表或触发 change。

- **TreeSelect 懒加载去重（Core / Vue / React，C080-F02）**：共享节点 gate 拒绝加载中的节点，Vue 同步维护在途状态并在请求结束或失效时清理。双端挂起 Promise 下连续点击同一行只调用一次 `loadData`，完成后仍显示子节点；Tree 复用同一规则，Cascader 回归通过。

- **Transfer 标题、ARIA 文案与选中计数（Vue / React，C079-F01、C079-F02、C079-F03）**：双端保留 `labels` 中的标题，仅由有值的专用 prop 覆盖，并继续按实例 locale、ConfigProvider 和英语逐字段回退。F02 采用方向 A，保留公开模板，将 `selectAllAriaLabel` 接到全选 checkbox、`itemsAriaLabel` 接到列表 group，均以当前标题替换 `{title}`；标题计数复用 Core 字符串键分区去重，`[1, '1']` 只计一项。

- **Textarea 数值初值、稳定节点与示例名称（Vue / React / Demo，C077-F01、C077-F02、C077-F03、C077-F04）**：Vue 初始化与后续更新复用同一 FormItem 文本解析，数值初值 123 在 SSR 首屏显示为 123。双端始终保留稳定 host，错误文案与计数出现或消失时保留 textarea 节点、值与焦点，错误描述继续合并；双端 Demo 03 初值改为 14/12，六个 Demo 均补上持久可访问名称。

- **TagsInput 实例 ID、活动项关联与排序（Vue / React / Demo，C076-F01、C076-F02、C076-F04、C076-F05）**：React 无显式 id 时使用稳定实例前缀，标签、活跃项和拒绝提示不再跨实例重号；双端输入通过 `aria-owns` 拥有标签列表，Backspace 高亮保持有效关联。React 复用 Core `moveTag` 提交拖拽后的新数组，与 Vue 对齐，并同步排序文档；双端 Demo 02 与 03 前两个输入补上持久可访问名称。

- **Switch 取消点击后恢复切换（Vue，C075-F01）**：每次点击按当前事件重置取消标记，首次 `onClick` 取消后，第二次正常点击会发出 `true` 并同步原生 checked 与 `aria-checked`；连续取消仍保持原值，不再吞掉后续正常切换。

- **Slider 提示格式、范围标签与 mark 提交（Vue / React，C074-F01、C074-F02、C074-F03）**：React 可见气泡与 `aria-valuetext` 共用 `formatTooltip` 结果；Vue 无显式 id 的 Slider 为每个实例生成稳定 ID，范围 thumb 与后缀标签引用保持唯一且有效。双端自定义 mark 在提交前复用现有步进与边界归一化，`min=0 max=100 step=10 marks={105:'outside'}` 点击后只提交 100。

- **Signature 独立非法值提示（Vue，C073-F01）**：无 FormItem 且 `modelValue="not-a-signature"` 时输出 `role="status"`、`aria-live="polite"` 的非法值提示，复用现有文案并在外部值恢复合法后移除；FormItem 内继续统一承载错误，不重复显示提示。

- **Select 空值类型与只读语义（Core / Vue / React，C072-F01、C072-F03）**：React 单选的 `value`、`defaultValue` 与 `onChange` 接受运行时已有的 `null` 空值，保留 `undefined` 的非受控语义。双端普通与可搜索 combobox 在只读时输出 `aria-readonly=true`，仍可聚焦、打开与搜索，选择值保持不变。

- **RadioGroup 必填语义（Vue / React，C071-F01）**：双端从 FormItem 继承 required，在 `role="radiogroup"` 容器输出 `aria-required=true`；调用方显式传入的 `aria-required`（含 false）仍优先。

- **NumberKeyboard 长度、值状态与必填语义（Core / Vue / React，C069-F01、C069-F02、C069-F03、C069-F04、C069-F05）**：金额补零小数点先检查完整候选值长度，`maxLength=1` 时不生成 `0.`。双端由当前原始值派生合法提交值与错误，Vue 切换模式后重新校验，纠正非法默认值再清空时不再恢复历史错误。React 原生 `onKeyDown` 与内部处理组合，保留 `preventDefault()` 取消约定。NumberKeyboard、Transfer、Upload 移除容器或触发按钮上不支持的 `aria-required`，必填校验、值、标签与错误关联继续由 FormItem 承担。

- **Mentions 长度上限、初次高度与编辑语义（Vue / React，C068-F02、C068-F03、C068-F04）**：双端选择候选时检查插入后的完整值，超出 `maxLength` 则拒绝整条提及，保留原文且不发选择回调；Vue `autoResize` 首次挂载后即复用共享 helper 计算高度。textarea 保留原生 textbox 语义，以 `aria-controls`、`aria-activedescendant` 关联建议列表，移除不合法的 combobox 角色、`aria-expanded` 与 axe 规则豁免。

- **MaskInput 原生表单值规范化（Vue / React，C067-F01）**：双端 hidden 复用现有格式化结果中的 canonical raw；`mask="##"`、`name="canonical"`、外部 raw 为 `a12x3` 且未编辑时，可见输入、hidden 与 FormData 均为 `12`。受控值、默认值与 FormItem 路径一致，不改写外部值，受控拒收仍恢复已接受的显示值。

- **InputNumber 必填状态、SSR 与回调文档（Vue / React / 文档生成器，C065-F01、C065-F02、C065-F03）**：双端从 FormItem 继承 `aria-required`，显式 ARIA 仍优先。React 显示缓冲直接从已解析的初始值生成，SSR 的 `value=0` 可见输入与 ARIA、hidden 一致，保留聚焦与失焦缓冲规则。生成文档与 MCP 修正 React `onChange` 为 `number | string | null`。

- **InputGroup 按钮尺寸与组成文档（Vue / React / 文档生成器，C063-F01、C063-F02）**：Button 省略 `size` 时继承 InputGroup 的 sm/lg，显式 `size` 与 ButtonGroup 尺寸仍优先。生成说明允许直子为 chrome 根或包含 chrome 的稳定 host，带计数的 Input 不再被错误排除；同验 MaskInput、Mentions、Textarea 文档。

- **Input 只读示例（Vue，C062-F01）**：input/05 改用已声明的 `readOnly` prop 对应的 `read-only` 模板写法。只读框现在原生 `readOnly=true`，可聚焦且输入后保持「只读」，与 Demo 说明一致。

- **FormItem 注册与帮助文本（Vue / React，C061-F01、C061-F02、C061-F03、C061-F04）**：切换 Form controller 时，字段规则、条件与 disabled 注册从旧引擎完整迁移到新引擎，Vue 动态改名同步清理旧字段 disabled。无字段绑定的原生 checkbox/radio 保留显式 checked；extra 通过稳定 id 关联控件，并与错误及消费者的 `aria-describedby` 合并。

- **Form 外部 controller 生命周期（Core / Vue / React，C060-F01、C060-F02、C060-F03）**：共享引擎仅在 debounce 延时变化时重建校验调度，React 重渲染不再取消待执行校验。Vue 挂载时同步 Form 选项，切换 controller 时取消旧订阅、同步快照并订阅新引擎，后续值与错误更新跟随当前 controller。

- **InputGroup 尺寸与面板失焦（Vue / React，C059-F01、C059-F02）**：DatePicker、Mentions、TimePicker、TreeSelect 省略 `size` 时先继承 InputGroup 的 sm/lg，再回退 md；显式 `size` 仍优先。React DatePicker 与 TimePicker 由根节点处理面板离开事件，从 Today / Now 按钮移到外部控件时只通知一次 blur。

- **CronEditor 数字起点步长与只读选择器（Core / Vue / React，C058-F01、C058-F02）**：数字起点的步长（如 `5/2 * * * *`）从起点到字段上限展开，使校验、摘要和下次运行一致；Vue 只读预设与字段模式选择后还原当前显示，表达式与隐藏表单值不变且不触发更新或校验回调。

- **ColorSwatch 选项与列数归一（Core / Vue / React，C057-F04、C057-F05、C057-F06）**：不可解析的颜色选项统一禁用，点击不再触发回调或改写隐藏表单值；保留无 `#` 十六进制的颜色等价语义，并补上有效 CSS 前缀；`columns` 小数截整、低于 1 用 1、非有限值回退 6，双端布局与垂直导航使用相同列数。

- **ColorSwatch 键盘与单选语义（Core / Vue / React，C057-F01、C057-F02、C057-F03）**：双端在选中项禁用或焦点项被移除后，仍为可用色块保留唯一 Tab 入口；垂直导航遇到本组同列禁用项且无后续候选时，继续跨组寻找可用项；多个等价颜色只由首个匹配项输出选中状态。

- **颜色解析与只读无障碍（Core / Vue / React，C056-F02、C056-F03、C056-F05）**：CSS 无单位 alpha 按 0–1 钳制，`rgba(255, 0, 0, 2)` 与 `rgb(255 0 0 / 2)` 解析为不透明红，百分数仍按百分比处理。共享解析拒绝畸形小数与非有限数值，ColorPicker 保留错误草稿且隐藏域为空，ColorSwatch 复用同一解析。双端 ColorPicker 按钮及 CronEditor、NumberKeyboard 的 group/dialog 移除不支持的 `aria-readonly`，只读时仍可打开、聚焦且不改值。

- **组错误承载项更新（Vue / React，C055-F01）**：CheckboxGroup 与归并的 RadioGroup 按实际渲染的可用子项维护错误 owner，卸载、换值或禁用时释放候选，children / slot 不再受被忽略的 options 干扰。移除 a 后 b 接续 `aria-invalid` 与错误描述，首项禁用时首次错误聚焦落到 b；RadioGroup 只在选中项仍可用时优先使用它。

- **Checkbox 缺值与组级错误（Vue / React，C054-F04、C054-F05）**：Vue Checkbox 未传 `value` 时保留缺值状态，`CheckboxGroup defaultValue=[false]` 不再误选中缺值项，显式 `value=false` 仍选中。双端 Checkbox 与 Radio 消费组级错误状态，`CheckboxGroup` / `RadioGroup status="error"` 无需 FormItem 即可呈现子项错误样式，并由既有 owner 输出 `aria-invalid`；子项显式 status 仍优先。

- **Checkbox 无障碍属性与组内关联（Vue / React，C054-F01、C054-F02、C054-F03）**：React 保留调用方 `aria-required="false"` 的 DOM 与 SSR 语义，必填 FormItem 仍覆盖为 true。双端组内 Checkbox 各自保留 `aria-describedby` 帮助引用，共享错误描述仍只交给 owner；具名 FormItem 下的组内 input 使用稳定的独立默认 id，不再重复继承字段 id。

- **Cascader 空态、原生属性与输入法键盘（Vue / React，C053-F04、C053-F05、C053-F06）**：Cascader 与 TreeSelect 空列表或搜索无结果时不再输出悬空的 `aria-controls`，组合输入期间的 Enter 不提交选项也不关闭面板。React Cascader 的 `title`、`data-*` 等原生属性透传到根节点，`aria-details` 与 `tabIndex` 保留在实际 combobox 上，打开搜索后仍然生效。

- **Cascader 叶子提交与键盘活动项（Vue / React，C053-F01、C053-F02、C053-F03）**：双端 `isLeaf: true` 即使保留 children，点击或 Enter 也会提交该项并关闭面板。Vue 在初始打开时定位已有路径，展开新列后可直接 Enter 提交首项。Cascader 收窄搜索、Mentions 缩减候选和 TreeSelect 过滤节点后，活动项同步到有效结果，ARIA 不再引用已移除项，Enter 提交当前可见项。

- **AutoComplete 只读提交与受控空值（Vue / React，C052-F01、C052-F02、C052-F03）**：双端失焦与关层的提交入口遵守只读状态，`readOnly` 配 `defaultSearchValue='draft'` 聚焦再失焦后，hidden 保持空且不发值变更。Vue 的受控 `modelValue=''` 不再回退到 `defaultValue` 显示标签，可见 input 与 hidden 均为空；两端 01–03 Demo 说明选择、Enter 或失焦/关层会按规则提交或还原。

- **DatePicker 文案兜底（Core，X02-F006）**：`getDatePickerLabels()` 无参时返回完整英语文案，部分 locale 的缺项也回退英语。合并 locale 与 overrides 时跳过 `undefined`，`getDatePickerLabels(zhCN, { today: undefined })` 仍返回「今天」。

- **FeedbackHost 提交生命周期（React，X01-F022）**：活动作用域只在 layout effect 中登记，并在清理时移除。Suspense 中 host 已执行但随后因挂起未提交再卸载时，不再残留活动 scope，通知不会进入无渲染者的队列；正常挂载后子节点 effect 发出的通知仍能显示。

- **Tree 已加载键累计（React，X01-F018）**：加载完成时从已完成的本地缓存合并受控 `loadedKeys`，不再只保留本次节点。先后完成 A、B 后，第二次 `onLoadedKeysChange` 包含 `a` 与 `b`；两个加载在同一批完成时，受控回写同样保留两个键。

- **菜单 items 字符定位（React，X01-F017）**：Dropdown 与 ContextMenu 的 typeahead 从已渲染菜单项读取匹配文本和禁用状态，与焦点目标共用 DOM 索引。items 为 Alpha、separator、Zulu 时，聚焦 Alpha 输入 z 后焦点移到 Zulu，不再停在 Alpha。

- **TreeSelect 禁用节点键盘（React，X01-F014）**：最终提交时检查节点的 disabled 状态。defaultOpen 且首节点禁用时，聚焦后按 Enter 不触发 onChange，显示值保持不变；方向键处理不变。

- **Select Tab 关闭焦点（React，X01-F013）**：Tab 先完成原生焦点移动再关闭面板，关闭流程不再异步回焦 combobox。普通与 searchable Select 按 Tab 后，下拉关闭且等帧后焦点仍在后续 After 控件；Escape 关闭和选择后回焦保留。

- **工作流实例快照（Core / Vue / React，X01-F012）**：成功 action 返回实例时深拷贝 `formValues`，复用表单值快照的克隆工具。成功 comment 后把新实例 `details.amount` 改为 999，旧实例仍保留 100；WorkflowDetailShell 与 WorkflowTimeline 宿主不再共享这部分嵌套数据。

- **Table 排序分页事件（Vue，X01-F011）**：非受控分页从第 2 页排序复位到第 1 页时，按复位前的页码判断并发出一次 `page-change`，事件携带复位后的页码和每页条数，与 React 一致。

- **Table 重复引用行（Core / Vue / React，X01-F010）**：共享索引解析为每次出现的记录保留各自源位置，分组继续携带该索引。同一无 id 对象出现在 `dataSource` 两处且启用本地处理时，源索引为 `[0,1]`，双端回退行 key 和行点击回调不再共用第 0 行。

- **Upload 同步请求错误（Core / Vue / React，X01-F009）**：`customRequest` 同步抛错时复用请求错误结算，文件进入 `error` 并触发一次 `onError`。失败后点击重试可再次发起请求并成功，不再停在 `uploading`。

- **Upload 异步移除（Core / Vue / React，X01-F008）**：异步 `onRemove` 确认通过后，基于当前列表移除目标文件。移除 A 等待确认期间加入 B，确认后保留 `[b.txt]`，不再用等待前的快照清空列表。

- **Table 空值高级筛选（Core / Vue / React，X01-F007）**：布尔组合前跳过空值规则及缺少边界的 `between`，已有 `name = Alice` 再添加空值 OR 条件仍只保留 Alice；`isEmpty` 与既有 AND/OR 优先级保持不变。

- **Toast 自动编号（Core / Vue / React，X01-F006）**：共享队列自动分配 ID 时跳过已占用值，先添加 `key: 1` 再添加无 key 的消息或通知会保留两条；显式相同 key 继续更新原条目。

- **图表系列 key（Core / Vue / React，X01-F005）**：共享去重工具同时保留最终分配的 key，生成后缀遇到已占用值时继续递增；系列名 `['x', 'x', 'x-2']` 得到三个不同 key，双端 LineChart、AreaChart、RadarChart 的渐变、节点和点查询身份不再冲突。

- **Calendar 年视图键盘（Core / Vue / React，X01-F004）**：上下键按三列月网格移动一行，January 按 ArrowDown 到 April，April 按 ArrowUp 回到 January；禁用月不再压缩月份步长。

- **Example 沙箱隔离（Vue / React，X05-F01）**：DemoBlock 不再授予 `allow-same-origin`；运行时模块及依赖和样式由父页取回后内联到 iframe，保留脚本、表单和既有权限。双端初始预览、编辑运行与重置正常，示例访问 `parent.document` 被浏览器拒绝。

- **ActivityFeed 自动开窗键盘入口（Vue / React，C170-F01）**：满 40 行后的虚拟窗口恢复 `list` 语义并使用本地化名称进入 Tab 顺序，连续 ArrowDown 可滚到第 45 条，再用 Tab 聚焦其动作。共用开窗机制的 CommentThread 同步保留 `feed` 语义，NotificationCenter 同步补齐窗口名称与键盘入口；生成说明写明开窗阈值和方向键路径。

- **VirtualTable 方向键越窗（Vue / React，C169-F01）**：方向键走到已渲染窗口末行时不再卡住——滚动容器对齐目标行、窗口重渲染后聚焦该行，连续 ArrowDown 可越过窗口末行继续往下走，ArrowUp 同理往回走。

- **VirtualList 方向键锚点（Core / Vue / React，C168-F01）**：带可访问名称的列表在用户滚动后按方向键，不再用滚动不更新的隐藏索引跳回列表前部；基准索引在活动项离开视口时从当前滚动位置重算，活动项仍在视口内时保持连续递进。

- **RichTextEditor 字符串 style（Vue，C167-F01）**：根容器改用共享的 style 合并工具，模板或渲染函数传入字符串 style（如 `margin-top: 13px`）不再抛错并正常落到根节点；对象 style 的合并结果不变。

- **NavigationMenu viewport 面板与数值键（Core / Vue / React，C102-F01、C102-F02）**：共享 viewport 下的普通面板现在带上 `aria-controls` 指向的 id、`role=menu`、ref 与键盘 / 焦点 / 悬停处理，Enter / ArrowDown 打开后焦点进入首项，面板内方向键、Escape 和焦点离开与普通面板一致。item value 写入 DOM 时改用带类型前缀的 id（数值为 `n:1`、字符串为 `s:1`）并在读取时解码，纯数值 value 的菜单仍有唯一 `tabindex=0` 入口，`current` 在 `1` 与 `"1"` 并存时只选中类型匹配的项。

- **Menu 键盘入口与树语义（Core / Vue / React，C098-F01、C098-F02）**：items 根的 roving Tab 入口穿透顶层分组并跳过禁用项，组内只剩分组或首项禁用时双端仍恰有一个 enabled 项 `tabindex=0`。子菜单标题在菜单上下文中统一输出 `menuitem`，内容层输出 `role=group`，双端 filled-tree axe 用例（TIGER_A11Y=1）不再有可聚焦元素缺少可见焦点等违规。

- **FloatButtonGroup 自定义触发器（Vue / React，C096-F01）**：非交互自定义触发器现在渲染为可聚焦的 `button type="button"`。React 的 `triggerNode` 为 span，以及 Vue 的 trigger 插槽为文本或数值 `0` 时，Enter / Space 展开动作组。原生 button、链接和组件触发器仍合并到原元素。

- **BreadcrumbItem 动作项（Vue，C087-F01）**：从组件 vnode 读取 click 监听器，无 href、非 current、带 `@click` 的子项现在输出 `button type="button"`，点击回调一次。

- **Breadcrumb 折叠点击（Vue / React，C086-F01）**：折叠菜单保留原 BreadcrumbItem 的点击处理器与 target，并复用链接地址门禁补齐安全 rel。Demo03 点击「一级目录」与可见「首页」一样，在事件到达 body 前取消原生导航。

- **Upload 预览来源（Core，C081-F05）**：白名单改为完整 origin 严格匹配。允许 `https://cdn.example` 的图片，同时拒绝 `https://cdn.example.evil.test/a.png`，不再把 URL 字符串前缀当成允许的来源。

- **TreeSelect 搜索键盘（Core / Vue / React，C080-F01）**：展开后的搜索框保留普通输入、Backspace、Delete 和 Ctrl+A 的原生行为。输入 `Beta` 会更新查询并触发搜索，共享按键意图只把已有树导航键交给树处理。

- **TagsInput 清空按钮（Vue / React，C076-F03）**：有标签且 `clearable=true` 时，清空按钮进入自然 Tab 顺序，Enter / Space 各触发一次清空并把焦点送回输入框。

- **Mentions 键盘（Vue / React，C068-F01）**：提及位置、前缀与查询内容未变化时，keyup 保留当前候选和面板状态。输入 `@` 后完整按松 ArrowDown 停在 Bob、End 停在 Charlie，Escape 后面板保持关闭；继续输入新查询仍能打开候选。

- **List 键盘与加载态（Vue / React，C043-F01、C043-F02、C043-F03）**：虚拟容器保留命名列表语义与 Tab / 方向键入口，每行仅输出一个列表项。`renderItem` 配行点击时可聚焦并用 Enter / Space 激活，内部按钮独立响应。加载内容区设为 inert、内置按钮禁用，保留 aria-busy，加载结束后恢复交互。

- **SplitButton 键盘焦点（Core / Vue，C029-F02、C029-F03）**：Vue Dropdown 等浮层完成定位后再把 ArrowDown / ArrowUp 的焦点送到首项 / 末项。共享锚定浮层在没有 layer 祖先时按 trigger 所在 document 解析 Tab 后继；双端菜单关闭后前进到后继控件，Shift+Tab 返回前一控件，跨 iframe portal 也不再丢到 BODY。

- **链接地址门禁（Core，C023-F02）**：反斜杠按斜杠归一化后再检查地址；`/\outside.example/path`、`\/outside.example/path` 和 `\\outside.example/path` 与 `//` 形式一样被拒绝，不再输出链接地址，也不再被菜单 schema 视为站内路径。

- **图片预览焦点（Core，C014-K01）**：焦点作用域按容器包含关系判断焦点是否在内部，移除跨 document 时错误的 `instanceof Node` 判断。React Gallery 选第二图后按 Enter 打开预览，第一次 Tab 从「关闭预览」前进到「上一张图片」，与 Vue 一致；同一预览修复同时作用于 Image、ImageGroup 与 ImagePreview。

- **颜色方案初始化脚本（Core，X01-F021）**：`colorSchemeInitScript` 先把脚本正文里的 `<` 编成 `\u003c`，再包进 `<script>`。`storageKey` 含 `</script><p id=x01-breakout>` 时，按 HTML 插入后仍只有一个 script，不会多出一个 p。脚本执行时读到的 storageKey 和 attribute 仍是原来的字符串。

- **ContextMenu 子菜单键盘（Vue / React，C088-F01、C088-F07）**：已处理的方向键停在当前子菜单，不再被根菜单再次导航。Demo02 聚焦「分享到」按 ArrowRight，再在「邮件」上按 ArrowDown，焦点到「链接」。Vue items 配 More→Nested 时，聚焦 More 后点击或按 ArrowRight 展开并出现 Nested；RTL 下展开键是 ArrowLeft。悬停展开和禁用项不展开保持原样。

- **菜单 items 子菜单（React，X01-F016）**：Dropdown 与 ContextMenu 的 items 子菜单可用 ArrowRight 或点击展开。聚焦 More 后按 ArrowRight 或点击，expanded 为 true，子菜单出现，并把焦点送进第一项。RTL 下展开键是 ArrowLeft。悬停展开不变，禁用项不会展开。

- **TimePicker（React，X01-F015）**：桌面列的焦点选项可用 Enter 或 Space 写入草稿。初始 10:00，聚焦 10 Hour 按下键到 11 Hour 再 Enter、确定，提交 11:00 并触发 onChange。方向键仍只移动焦点，禁用选项不会被选中。

- **工作流字段权限（Core，X01-F003）**：initiate 下 schema `disabled: true` 的字段保持禁用，不进入可写名单，提交保留 original。源 schema `readOnly: true` 同样不接受客户端覆盖，仍按文本渲染。节点权限把字段标成只读或隐藏的行为不变。

- **浮层触发器（Vue，X01-F002）**：Tooltip、Popover、Popconfirm、Dropdown 与 ContextMenu 合并子按钮时保留 disabled。浮层未禁用时，子按钮的 `disabled: true` 和静态 `disabled` 仍保持禁用；浮层自身禁用时触发器继续禁用。

- **表单 Date 字段（Core，X01-F001）**：表单值相等比较按时间区分 Date。字段已是 1 月 1 日时，`setFieldValue` 写入 2 月 1 日会更新模型，并各触发一次 `onValuesChange` 与订阅。相同时间点的 Date 仍视为未变化，不进入撤销历史。

- **Vue Props 类型（Vue / Core，S13）**：Breadcrumb、Card、ContextMenu、DataExport、Drawer、FloatButton、Form、FormItem、Kbd、Modal、Pagination、Popover、Select、Sidebar、Slider、Space、Splitter、Steps、StepsItem、Tabs、Tooltip、Tree 与 TreeSelect 导出的 `Vue*Props` 与运行时 props 键一致。`VueTreeSelectProps` / `TreeSelectProps` 不再声明 `height`，列表高度用 `listHeight`。Kbd 的 `keys` 接受只读数组。Core `PopoverProps` 增加可选 `closeOnScroll`。这 23 个接口少一个字段或多一个字段时，`pnpm types:check` 失败。

- **动态 class（Vue，S12 / C089-F01）**：ContextMenuItem、ContextMenuMenu、ContextMenuSub、Dropdown、DropdownItem 与 DropdownMenu 每次渲染读取当前 `class` 再合并。同一实例从 attr-before 改为 attr-after 后，DOM 类名为 attr-after。

- **原型键回退（Core / Vue / React，S11）**：Button、Text、Icon、Result、Container、Card、AspectRatio、Avatar 与 AvatarGroup 的运行时映射只认自身的键。`toString`、`constructor`、`__proto__` 走既有未知值回退，不再输出函数文本或抛错；与这些名字相同的图标可以注册为自定义图标。

- **受控显示（Vue / React，S10 / C056-F01）**：ColorPicker 与 CronEditor、Input、InputNumber、InputOTP、MaskInput、Mentions、Radio、RadioGroup、Signature、Switch、Textarea、Transfer、Upload 在受控时，已提交的显示跟随外部值。父级不回写时，色块、输入、hidden 和 checked 回到原值；拖动中的颜色预览、聚焦时未提交的数字文本、未完成的 Cron 字段和 Mentions 查询仍保留草稿。未传 value / modelValue 的非受控用法仍在输入后立即更新。

- **原生事件监听（Vue / React，S09 / C067-F02）**：MaskInput 与 17 个并入组件在内部处理器之后调用调用方的同名原生监听，每个事件回调一次；掩码、IME、菜单、上传和键盘滚动等内部行为及顺序不变。

- **零值内容与尺寸（Core / Vue / React，S08 / C039-F03）**：Descriptions 与 27 个并入组件用存在性判断保留内容槽中的数值 `0`，包括标题、附加内容、前后缀、图标和自定义渲染；React Descriptions 的 `children=0` 优先于 items。FormItem 的标签宽度与 Progress 的轨道高度保留显式 `0`；FileManager 的零列数统一限制为 1，面包屑保留数值 key `0`。

- **原生属性与根样式（Vue / React，S07 / C056-F04）**：ColorPicker 与 37 个并入组件按既定根节点或触发器保留调用方的 style 和原生属性；修复图表、选择器、菜单子组件及链接等分支的透传缺口。ColorPicker 双端 SSR 保留 margin 与 data 属性，React Switch 的 style 作用于外层 label。

- **辅助文案与 Cron（Core / Vue / React，S06 / T01 / X02-F004）**：W9 辅助文案并入标准 TigerLocale，消费者读取 Provider 与组件覆盖后的标签；补齐 13 个语言包的按钮、辅助名称、输入错误及 WorkflowDesigner 重复 key 校验。Cron 摘要按原表达式保留范围、步长和日期 / 星期的 OR 语义，摘要与下次执行时间随语言变化，两端在 320px 下换行显示。

- **主题过渡与辅助媒体（Core / 生成器）**：每个过渡属性分别获得配置的时长与缓动；仅覆盖 easing 时保留预设时长，collapse helper 补齐 max-height 过渡。减少动效、增强对比度与强制色彩的媒体变量覆盖运行时及嵌套主题 scope，应用、切换和释放主题后继续生效。

- **API 文档与 MCP（生成器）**：保留精简 Props 表并在同页补齐其余公开字段，继承展开遵守 Pick / Omit；示例路径读取 Demo 注册与真实组件消费关系；补齐框架回调、Vue emits 与非 Props 父接口事件，修正 API 基线中的泛型继承文本。

## v3.0.0（2026-11-02）

- **3.0 正式版**：五个 `@expcat/tigercat-{core,vue,react,cli,mcp}` 包统一为 `3.0.0`，包含 3.0 预览与候选阶段的组件、主题、表单、浮层、图表和示例改进。从 2.x 升级按 [3.0 迁移指南](docs/MIGRATION-3.0.md) 调整；从 rc.3 升级不变更组件 API。
- **Switch（Core / Vue / React）**：关闭态轨道增加边框并使用更明确的辅色背景，开启态保留主色与透明边框；三种尺寸、禁用和键盘焦点行为不变，React 与 Vue 继续共用 Core 样式。

- **文档与 Skill**：安装说明区分稳定版和预览版，同步 3.0 迁移入口、公开工具名称与 CLI 行为；修复 Skill 入口的 YAML 格式并补齐参考链接，更新 MCP 随包快照。精简 rc.3 验收档案中的过时执行指令，移除失效 benchmark workflow 引用和已发布版本的“未发布”说明。

## v3.0.0-rc.3（2026-10-24）

- **Upload（Core / React）**：React 上传控制器随 layout effect 创建并清理，StrictMode 生命周期重放后使用新的有效控制器，父组件挂载阶段的 ref 提交也正常执行，无需关闭应用的 StrictMode。Core 统一结算自定义请求的取消：条目进入可重试的错误状态，忽略完成后的进度，不再登记同步完成请求的失效 abort 句柄；卸载清理不回写条目。
- **Admin 消费复验（Core / Vue / React）**：FunnelChart 图内只显示首阶段转化率，默认提示与无障碍描述明确标注首阶段、上一阶段比例，使用同一取整口径；删除错误的阶段总和分母，保留自定义 formatter。FileManager 在加载完成、结果数量和语言变化时更新状态播报，修复列表已加载而读屏仍提示“加载中 0 项”的残留。WorkflowActionBar 的操作及“更多”确认气泡首选起端对齐，避免左侧操作把气泡伸进侧栏，继续由共享浮层处理视口碰撞。
- **Tour（Core / Vue / React）**：跟随实际挂载到 ConfigProvider 浮层出口的气泡测量尺寸、绑定观察器并设置焦点，修复首次无目标步骤按零尺寸定位，导致手机上的下一步和关闭按钮移到屏幕外。气泡沿边移入视口，首选与相反方向均放不下时尝试垂直方向，避免覆盖目标；箭头跟随实际方向与偏移，继续指向目标。
- **Example 视觉与交互修复（Vue / React）**：完成外壳、基础、表单、浮层、数据、图表和复杂交互三阶段模型视觉验收；证据由初始矩阵与定向修复复验组成。移动菜单接入已有焦点作用域，修复层级遮挡、窄屏设置、长标题和章节导航；面包屑首页跳转保留部署 base。Playground 只订阅有效主题变化，避免滚动锁重建 iframe；两端主题、语言与明暗继续同步。
- **媒体与布局（Core / Vue / React）**：AspectRatio 兑现已有 `fit`，显式 contain / cover / fill 让内容层与媒体填满比例盒并裁切，默认 / none 保留自然尺寸与可见溢出；同步生成文档和示例。Masonry source 模式补齐纵向间距，packed 模式不重复加距；横向 Card 封面限制窄屏占比，Code 工具栏进入正常文档流，Sidebar 的折叠按钮与侧栏共用纵向容器，恢复 AppShell 主区宽度。
- **浮层、焦点与手势（Core / Vue / React）**：共享移动浮层几何修复 fullscreen / bottom sheet 偏移与宽度，Calendar / DatePicker 在 320px 下收紧边距。跨 document 的元素和焦点判断使用实际 ownerDocument，React 显式跨 document portal target 正确绕过本地 outlet；普通 Modal / Drawer 和 Tour 使用本 document 视口，保留 sandbox 隔离；popup 等焦点落定后判断离开，嵌套浮层保留原触发器。Modal / Drawer 按带方向的位移判断松手，反向上滑不再误关闭。
- **导航与表单**：Menu 横向模式布局作用到内部列表，徽标在展开 / 折叠状态均可见；弹出子菜单只对鼠标指针响应 hover，触控首击正常展开。React Anchor 在事件 / observer 入口去重并回调，消除状态 updater 内触发消费者更新的告警。Vue FloatButton 带徽标时保留链接，Breadcrumb 正确读取折叠项的 Text VNode；Cron 字段数错误只报告 expression issue。双端 OTP、Slider 和菜单示例修复窄屏布局及文案。
- **图表（Core / Vue / React）**：轴标题避让刻度，Heatmap 按标签宽度降低刻度密度，Radar 层级标签放入半径内，横向图例给绘图区保留可收缩空间。BarChart 顶部数值标签使用自动域留白，Funnel 标签采用主题文本与描边；Pie 在未指定外半径时按真实扇区和外标签边界拟合半径与圆心，避免窄屏裁切，两端绑定保持一致。
- **拖放与编辑（Core / Vue / React）**：共享文档拖拽会话跟随 pointer target 的 ownerDocument，列表命中与焦点兼容 iframe，启用拖拽的列表项 / TaskBoard 卡片预先声明 touch-action。TaskBoard touch tracker 仅跟踪位移，取消默认行为留给已有非 passive 监听，消除移动排序的 passive 错误。ImageAnnotation 在可绘制状态提前声明触控行为，Vue MarkdownEditor 切回编辑时恢复当前正文。
- **数据与示例**：FileManager 长文件名约束在网格项内，DataTableWithToolbar 窄屏工具栏换行；Table 示例按完整状态精确筛选，Chat 示例采用真实固定行高，VirtualList 动态行高与 Resizable 刻度接线正确，WorkflowViewer 的内部横滚经真实触摸复验。Avatar 正常 / 恢复图源改为自包含资源；打印、导出和 AppShell 的示例权限通过既有 sandbox 机制显式声明。
- **Admin 升级与发布**：真实应用完成本地包迁移、用法更新及全功能验收，闭合 17 项缺陷，其中 7 项上游问题以原组件根因修复并多轮重新打包消费复验。正式注册表 rc.3 升级后，158 项静态 E2E、本地 22 个关键场景通过；已提交、推送并由既有 Action 发布 [Admin Pages](https://expcat.github.io/Tigercat_Admin/)，实际部署 SHA、线上资源及 20 个选定交互 / 视觉条件已核验。
- **发布与验收**：`v3.0.0-rc.3` 已由既有 tag Actions 发布五包及 Example Pages，五包 `next=3.0.0-rc.3`、`latest=2.9.4`，正式注册表消费 smoke 通过。最终候选通过 9321 项单测、独立 45 项 a11y、50 项 Chromium / mobile E2E，以及五包与四种消费示例 / SSR 门禁；线上关键流程按组合证据接受。两个私有 SPA Example 保持 `1.5.0`；本版不删除或重命名组件 API。验收记录与历史证据限制见 [rc.3 验收档案](docs/RC3-VISUAL-VALIDATION.md)。

## v3.0.0-rc.2（2026-10-22）

- **全仓根因审查**：完成 20 个责任域、175 项采纳修复，保留现有视觉风格并同步双端 API、消费者与迁移说明；该轮 9,363 个单测、50 个 Chromium / mobile E2E、五包 tarball 和四种消费示例 / SSR 验证通过。
- **发布门禁精简**：`quality:release` 改跑完整行为单测与独立 a11y，移除重复导出检查、测试脚本字符串断言和测试源码扫描。Coverage 与全量 size-limit 保留原配置、阈值和诊断入口，改为按需执行；真实 tarball 消费、Button 子路径预算、tree-shaking、静态/API/漂移与示例检查继续阻塞发布。RC 与 Stable 统一先同步版本，提交后在同一 HEAD 重新构建包与 Example 并完成浏览器验证，再从已进入 main 的提交打标签。
- **冗余验证清理**：移除已完成的 R13–R20 迁移规则、与生成器重复的文档 / context7 检查，以及重复的包元数据、导出和模板断言；生成文档漂移统一由 `docs:api:check` 纳入静态入口。发布元数据检查删除 workflow / 文档词句锁定和重复版本展示断言，Example 来源检查删除由类型或编译工具负责的实现形式断言。
- **E2E**：改用每次重新构建的 Vue / React production preview，统一构建基础路径与专用严格端口；删除用例内递归恢复和动态导入重试，保留首个失败。
- **测试与 benchmark**：feedback 分组补登记焦点重绑与 SSR 回归；根入口命令式测试明确等待动态导入，ActivityFeed 改验实际加载回调。删除失效组件模板并改引现有用例，清理不存在 memo 的重复 benchmark，修正 band scale 参数与 Sunburst 叶子数标题。
- **FormWizard（React）**：兑现普通 `children` 的公开契约，支持元素和 `0`，仅在 `null` / `undefined` 时回退到步骤内容，保留函数 `children` 与 `renderStep` 的优先级。
- **示例与编译（Vue / React）**：FunnelChart 纵向示例文案统一使用 `orientation`；Vue WorkflowDetailShell 示例将 SchemaForm 变更回写当前值，提交保留隐藏金额和只读原因；移除 React SankeyChart、WaterfallChart 与图表绑定文件未使用的默认 React 导入，恢复完整 Example 编译。
- **示例与 Playground（Vue / React）**：两端 runtime bridge 显式转发 Modal 子路径的六个命令，修复命令式 Modal 示例加载失败；React Dropdown 共用菜单项示例改用现有 `items` 模型，展示快捷键、勾选和危险项，两端删除未演示的子菜单说明；Space 方向示例文案统一使用 `orientation`。移除 React NotificationBell 与 Table 面板未使用的默认 React 导入。
- **Button / Form 示例（Vue）**：四处重置或提交按钮改用现行 `type` 属性，恢复原生表单重置、提交与校验。
- **ImageCropper 示例（Vue / React）**：JPEG 导出预览随结果替换和示例卸载回收 blob URL，卸载后完成的导出不再创建预览 URL。
- **Modal / FormWizard（Core / Vue / React）**：取消或销毁命令式 Modal 时正常拒绝调用方 Promise，删除重复写入完成状态的私有路径；FormWizard 离开确认使用当前合并语言，动态切换 provider 或组件 locale 后仍正确显示，选择留在当前步骤会返回 `false`。
- **Example**：Vue DemoBlock 在模块内共享现有编译器 client，避免页面切换后遗留实例 Worker，保留并发编译、定期轮换和 OOM 恢复；双端 ConfigProvider 说明与主题文档统一为内层 theme 作用于子树、`document=false` 仅提供 context。Vue 受控状态示例片段与实际 Counter 保持一致，不再用 `??` 吞掉合法空值。
- **共享工具（Core / Vue / React）**：`getUploadLabels` 恢复 en-US 缺键回退；Upload 的排队、重试与单文件提示统一走 locale / labels，补齐 13 个语言包，已显示提示随语言切换更新，三个英文常量删除并提供迁移说明。Markdown 预览支持单列表格及其对齐标记，仍将无管道符的 `---` 识别为横线；Space 删除重复列间距赋值，输出保持不变。
- **文档类型来源与配置清理**：仅由真实公开组件继承触发框架 runtime props 替换，Select 文档恢复 Core `SelectProps` 来源及 `value` 紧凑行，完整解析仍合并框架自有字段；删除已下线组件的 props 优先级、无入口的 TableToolbar 说明与片段，以及未使用的 mixin 收集器。
- **发布检查与 API 基线**：临时 Vue/React Vite 配置移除仓库组件 facts 的导入与顶层求值，四种 tarball 消费示例可独立构建；API 基线只递归星号再导出，具名再导出只记录外部名，清除误收录的内部符号，产品 API 不变。
- **CLI 公开组件清单**：`exports:sync` 从公开组件事实生成随包记录，`exports:check` 检查完整内容；补齐 AppShell、AssigneePicker、NotificationBell、CopyButton、Gallery、Inplace、SankeyChart 与 WaterfallChart，供 `add`、`generate` 与交互列表使用。
- **MCP 技能源与协议**：统一默认随包快照的入口说明；显式远程镜像在解析或缓存前校验实际正文 SHA-256，Pages 与随包清单只包含 `context7.json` 和 `skills/**`。索引初始化失败后可在同一会话重试，tool 返回结构化错误，resource 读取失败走协议错误；route 嵌套与顶层 source 的 `inlined` 标记按响应中的实际正文保持一致，每份正文仍只输出一次。
- **CLI 模板与文档**：生成的 `src/style.css` 通过 `@source` 注册已安装的 `@expcat/tigercat-{vue,react}` 与 `@expcat/tigercat-core` dist，修复 Tailwind v4 不自动扫描 `node_modules` 导致组件 utility 样式缺失的问题；Vue/React 模板共用同一份 CSS 构建函数。根 README 手动安装片段补齐同一 `@source` 契约，并说明相对路径以 `src/style.css` 为准。`playground` 不重写已存在目录的 `src/style.css`，旧 playground 按根 README 在保留自定义 CSS 的情况下补注册即可。
- **CLI 根因修复**：`playground` 的 Vite 启动失败现在以非零码退出，不再静默成功；`doctor` 解析 pnpm 默认与命名 catalog，monorepo skill 快照回退限制在 CLI 所属工作区内，安装态快照经 Node 解析定位（覆盖提升的 node_modules）；`add` 复制随包发布的 portable 示例，无独立示例的组件说明跳过并只打印导入行；`migrate` 改为 token 级声明解析，只改写真实 import/export 声明的说明符与具名绑定（保留别名、type-only 与行内注释），字符串、注释与模板字面量内容不再误伤；删除从未真正生成文档的 `generate docs`；模板 tsconfig 移除多余 `baseUrl`，React 模板补 `src/env.d.ts`，示例 Alert 改用 `type` prop；`generate test` 生成可运行的公共子路径导入骨架，不再断言空 props 渲染。
- **组合组件（Core / Vue / React）**：Vue ActivityFeed / NotificationCenter 第一次新增正常播报且不回放挂载前条目；CommentThread、TaskBoard 与 DataTableWithToolbar 按 Vue 真实 emit 语义识别函数、数组和 Once 监听器，More 不再因自定义 actions 渲染空按钮。双端 AssigneePicker 使用实例级选项 id，并在过滤后保持活动项、ARIA 引用和 Enter / Space 选择一致；TaskBoard 在异步批准期间数据失效或卸载时取消旧移动，保留合法原地更新；DataTableWithToolbar 查询动作复用现有 tableLabels。
- **工作流（Core / Vue / React）**：统一校验任务归属、可操作状态与活动节点，修复长抄送 / 自动通过链被截断的问题。修正退回和前加签的暂停、恢复及签署模式处理，保留已完成任务，避免提前推进或重复恢复；详情提交按当前表单值计算条件分支。动作栏确认层跟随当前动作与候选项，失效时关闭，转交 / 加签未选人时显示本地化提示。设计器新增分支在全树分配唯一 key。
- **FileManager、拖拽与标注（Core / Vue / React）**：FileManager 跟随实际挂载的视口，虚拟网格按行测量并分离滚动区、完整内容与窗口偏移，动态行高、列数和模式变化后的尾部滚动及 Home / End 焦点保持正确。拖拽落下按当前稳定 id 重解位置并保留数字 key 类型，失效会话不再错移替换项。ImageAnnotation 在权限、工具、图片或组件生命周期失效时统一取消草稿、帧和文档会话，正常受控值更新不打断合法笔画。
- **富文本 / 打印 / 拖拽会话（Core / Vue / React）**：默认富文本引擎的图片粘贴在销毁、转为只读 / 禁用或 setValue 真正替换正文后不再迟到写入（恢复可编辑不复活旧粘贴，同值受控回声不取消）。PrintLayout.print() 的打印 iframe 复制消费样式表、constructed stylesheets、文档根匹配状态与根节点继承的 CSS 自定义变量，克隆图片改为 eager 加载并在资源就绪后才打印。Vue RichTextEditor 跟随 FormItem 表单值的后续变化；React RichTextEditor 替换等价引擎时保留当前非受控正文。Vue useDrag 的 containerId 实时跟随响应式 props，挂载后改 id 的跨容器落下正常提交；Core 文档拖拽会话的 user-select 锁按 document 引用计数，重叠会话只在最后一场结束后恢复第一场加锁前的值。
- **数据选择与编辑（Vue / React）**：Table / VirtualTable 的行点击、键盘与工具栏选择统一遵守禁用行设置，保留未加载的已选键。文本与数字编辑支持 Enter 提交、Escape 取消；数字输入在提交事件内使用本次值，Select 选值只提交一次并保留数字类型，打开态 Escape 只关闭下拉框，关闭态 Escape 取消编辑。Vue VirtualTable 从 Table 的事件事实源完整转发事件。
- **虚拟列表与表格（Core / Vue / React）**：列虚拟化保留跳过列的实际宽度，表头、表体、汇总与 colgroup 使用同一窗口，横向滚动可到达末列；VirtualTable 按既有契约在固定列或非数字宽度时回退。Tree 行高或视口变化后重新对齐活动行，保留树内焦点且不抢走外部或主动移除的焦点。删除 VirtualList 从未兑现的 `columns` / `orientation` / `stickyIndexes` 配置及旧分支，迁移见 [MIGRATION.md](docs/MIGRATION.md)。
- **异步事件与数据展示（Vue / React）**：Vue InfiniteScroll、ActivityFeed、CommentThread 与 ChatWindow 统一读取当前监听器返回的 Promise，等待全部监听器完成后再释放请求或清空草稿，失败保留草稿；数组、单次与动态监听器沿用同一适配，双端 ActivityFeed 手动加载也等待 Promise。Collapse 动态切为手风琴时统一裁剪受控和非受控面板，Vue 公开 `headingLevel` 类型；Vue Timeline 可见待办文案与 live 播报共用本地化解析。
- **Feedback 浮层与 SSR（Core / Vue / React）**：React 共享 focus trap 在容器节点被 portal 目标替换后重新绑定当前节点，DatePicker / TimePicker / ColorPicker 初始默认打开不再遗留 inert 与失效的焦点圈，普通重渲染不抢焦点。Vue Modal / Drawer / Tour 的 immediate watch 先判断浏览器全局再读取，关闭态 SSR 不再抛错；Vue Modal / Drawer 打开态 SSR 不再向进程级单例登记层叠计数与 Drawer 层（浏览器行为与样式兜底不变）。删除 LoadingBar 从未生效的公开 `renderBar` 字段（迁移见 [MIGRATION.md](docs/MIGRATION.md)）。
- **表单校验（Core / Vue / React）**：共享引擎在值、结构或清理状态变化后拒绝旧异步结果写回，保留独立字段并发与 trigger 合并；整表校验跳过已登记禁用字段，Vue 的 loading 也复用同一禁用登记。双端 SchemaForm 只读点路径按嵌套值显示且公开规则收集排除只读 overlay，FormWizard 删除最后一步的重复 partial 校验；React Form 在 StrictMode 重放清理后保留 owned engine 与已输入值。
- **懒加载（Core / Vue / React）**：Cascader、TreeSelect 与 Tree 在替换数据源或卸载后使旧请求失效；Cascader / TreeSelect 进入只读或禁用状态时同步失效。Tree 换源清除旧子节点缓存，受控父组件原样回写加载结果时保留缓存（包括 Vue 响应式数组）；React Tree 使用当前回调与状态，多个节点同批完成时保留全部已加载子节点。
- **Select（Vue / React）**：所有用户改值入口统一遵守只读与禁用状态，关闭态 Backspace / Delete 不再修改只读值，禁用标签按钮不可删除；移动端 Done 复用统一关闭逻辑并清除搜索。同步修正选择器空值、Vue Transfer 回调和 `readOnly` 拼写的过期说明。
- **表单基础输入（Core / Vue / React）**：InputNumber 字符串模型与数字路径兑现同一契约——超大整数字符串提交按有限边界夹紧、按 `precision` 定点格式化并对齐 `snapToStep` 网格，`1e-7` 等科学记数法步长真实生效；两端单击、长按与方向键 / PageUp / PageDown / Home / End 全程走同一模型，不再先丢精度转 Number。Slider 兑现 `showRange` / `pushApart` 契约（`showRange=false` 不渲染选区填充；`pushApart=true` 时指针、键盘与刻度提议一致复用 `sliderPushApartRange`），删除从未实现的 `vertical` / `showInput` props 与对应 data 属性（迁移见 [MIGRATION.md](docs/MIGRATION.md)）。React Slider 方向键回调补上 `readOnly` 依赖；两端拖动中变 `readOnly` / `disabled` 时立即释放拖拽会话并清除预览，不再迟到提交；React InputNumber 长按在不可交互后立即停止重复，聚焦不再用旧值覆盖步进显示。React Signature 每笔提交只触发表单 onChange 一次。Vue Upload 成功删除只调用一次 `onRemove` 守卫，移除已无调用方的 `remove` emit 声明（`onRemove` 仍是删除前守卫，返回 `false` 可取消）。
- **导航 a11y 根因修复（Core / Vue / React）**：NavigationMenu mega 面板两端统一为真实 disclosure——Trigger 的 `aria-haspopup` 与实际模式一致，mega 内容不再挂 `role="menu"`，面板链接保留原生 anchor/button 语义与 Tab 顺序，Enter / ArrowDown 初始聚焦落在面板内第一个真实可聚焦节点，Escape 关闭并回 Trigger；Vue 悬停会话在焦点留在面板（含 portal 文档）时不再被指针离开关闭。Vue Menu `multiple` 更名 `openMultiple`；Vue Menu / Dropdown / ContextMenu typeahead 在同一批真实节点上同步 disabled 标志。Vue ContextMenu schema 子菜单改为每层独立展开状态（保留祖先、关闭兄弟；React 原本就按层展开）；两端共享子菜单表面样式常量，disabled 分支悬停不展开、已展开后变 disabled 也不再保持子层可激活。BreadcrumbItem `separator` 覆盖父级分隔符真正生效；React ScrollSpy 容器 key 计算 SSR 安全。
- **Tabs 与示例别名（Core / Vue / React）**：删除 Core `TabsProps` 与 Vue Tabs 从未实现的 `reorderable`；React Tabs 公开 `activation`（默认 `automatic`），Vue 补齐类型导出；Vue 关闭当前页签时按 React 契约先发 `update:activeKey` / `change` 再发 `edit`，焦点落到下一页签，方向键 / Home / End 只遍历可见页签，sr-only 关闭钮不再占据 Tab 停点；React 关闭当前页签回调不再闭包旧 `onChange`，Menu 键盘回调补齐 `itemKey` / `setLayerStop` 依赖。两端示例 Vite 别名改用公开组件事实源生成，Context / Navigation 示例子路径导入不再失败。
- **主题运行时（Core）**：主题变量改为只写作用域样式表，删除并行的 inline 写入路径和与公开契约相悖的 `prefers-color-scheme` 死规则。dark/light 切回 `auto` 与 `dispose` 时按快照只释放本 scope 写入的 class、`data-tiger-color-scheme` 与 `color-scheme`，保留调用前和外部后续的修改。`auto` 下显式 `data-tiger-color-scheme="light"` 优先于 `<html>` 上的 `dark` class，样式表选择器与 `getResolvedColorScheme()` 保持一致。
- **嵌套主题（Core）**：嵌套 scope 的 motion duration 现在派生出 transition shorthand，easing 未设置时继承父级的 `--tiger-motion-ease-standard`。
- **ConfigProvider（Vue / React）**：document ownership 改为响应式，ownership 变化时交接 document handle 与嵌套 scope。接通已公开的 `iconRegistry` 配置（Core 类型与 React Props 此前已存在），Vue ConfigProvider 补齐同名 runtime prop，两端 Icon 实际消费：应用传入的注册表优先于父级，provider 只 dispose 自己创建的注册表。移除无生产读者的 locale scope 接线。
- **forced-colors（Core）**：forced-colors 规则收成单一事实源，tailwind 插件、`tokens.css` 与公开 `forcedColorsCss` 同源生成；插件的完整规则不变，`forcedColorsCss` 与 `tokens.css` 补齐了此前缺失的对比度变量与焦点轮廓。
- **包内容**：`@expcat/tigercat-core` 删除 `tokens.dtcg.json` / `tokens.emitted.css` / `figma.tokens.json` 三个未列入 `exports` 的附带文件，迁移说明见 [MIGRATION.md](docs/MIGRATION.md)。
- **拖拽会话（Core / React）**：跨容器拖拽在切换目标、结束、取消和源容器销毁时同步更新相关列表的状态。React `useDrag` 在 StrictMode 重放 effect 后保持完整的跨容器交互，SSR 与首帧绑定保持不变。
- **useControlledState（React）**：`postState` 每次返回新引用的受控用法不再触发无限重渲染；释放控制时保留最后实际显示的值，包括规范化规则动态变化的场景。
- **i18n（Core）**：懒加载直接返回完整语言包对象时，不再把 datePicker 分区误当整个包而丢掉 common 等其余分区。
- **高亮与 typeahead（Core）**：大小写折叠改变 UTF-16 长度（如 İ 折叠为 i 加组合符）时，Highlight 命中区间正确映射回原文偏移；typeahead 重复字母循环按每个字符的完整折叠串比较。
- **Vue**：`useFullscreen` 在组件卸载时解除 document 全屏事件监听；删除未使用的内部 `coerce-class-value` 文件与 `createFilledIcon` 工具。
- **ImageCropper（Core / Vue / React）**：锁定比例拖动手柄到图片边缘时，选区按锚定点可用空间计算保持比例的最终尺寸，空间不足时可保持原位，不再溢出边界或破坏比例。导出与预览一致：旋转 / 翻转后的导出内容就是选框内看到的画面，90° 旋转不再交换宽高，circular 裁剪按选区内切圆生效；圆形选框描边与遮罩挖孔同步改为内切圆。
- **CropUpload（Vue / React）**：裁剪导出等待期间取消、换图或卸载后，迟到结果不再覆盖新会话状态、误发事件或关闭新裁剪会话。
- **Image（Vue / React）**：React 缓存检查不再把已完成的 fallback 地址写回主图 src；显示备用图时不再绑定主图的 `srcSet` / `sizes` 候选。
- **Segmented（Vue / React）**：选项文字超长时在选项内截断为省略号，图标不再被压缩，相邻选项不再互相重叠。
- **Highlight（Vue）**：默认 slot 的 VNode 子树改为原位克隆并插入高亮，保留嵌套元素与链接结构（与 React 行为一致），不再先拍平成纯文本重建；子组件内容保持不透明、不参与高亮，其前后的原生文本仍正常命中。
- **Image 文档**：`preview` 默认值更正为 `true` 并改写交互描述，`lazy` 说明更正为原生 `loading="lazy"`；Skill references 与 MCP 快照同步。
- **Layout 跳转链接（Vue / React）**：最外层 Layout 的跳转链接只在存在真实 `main` 目标时输出，href 指向实际渲染成 `main` 的那个 Content 的 id（自定义 `id`、Fragment 或静态原生 wrapper 子树、嵌套 Layout 里显式 `as="main"` 的 Content 都算）；React Layout 现在能识别 Fragment 中的 Sidebar 并正确横排。
- **拖拽隔离（Core / Vue / React）**：List 的拖拽容器 id 改为按实例生成，同页多个 List 的同 id 项不再互相串扰；跨容器拖拽时目标列表的同 id 项不再继承 `data-dragging` 标记与位移预览，Drag 自定义渲染拿到的 `isDragging` 与共享绑定一致；指针拖拽的命中测试跳过拖动源自身。
- **Resizable / Splitter（Core / Vue / React）**：边把手命中区恢复真实尺寸（原 `inset-inline-0` / `inset-block-0` 在 Tailwind v4 不存在导致把手 0 尺寸）；预设宽高比按预设自身钳制而不是起点比例（方形起点设 16/9 后拖宽得到 16/9 结果）；RTL 下 origin 偏移不再二次翻转拖动对边。
- **Space / ScrollArea / Masonry / Sidebar / Descriptions（Vue / React）**：Space 命名 `size` 搭配 `verticalSize` 时列间距不再被压成 0；ScrollArea `scrollToMarker` 在有相对定位祖先时定位正确；Vue Masonry 子项动态增删后重新测量分布；React Sidebar 受控 `collapsed` 时 trigger 只发 `onCollapsedChange` 请求、不自行改宽；Vue Descriptions 标题 id 改用 SSR 安全的 `useId`。
- **Row（Vue / React）**：响应式 `gutter` / `align` / `justify` 从一次性读取 `window.innerWidth` 改为静态 CSS 变量级联——输入变量按现有断点 token 经 `@media` 提升，窗口缩放实时生效，SSR 输出不再依赖视口；嵌套 Row 拥有自身默认与断点值，不再继承父 Row 的响应式地图；Vue 的 `align` / `justify` prop 类型修正为接受响应式地图，消除运行时告警。Core `getRowGutterStyleVars` / `getRowAlignJustifyVars` 的返回键改为输入变量名，迁移说明见 [MIGRATION.md](docs/MIGRATION.md)。
- **Carousel（Core / Vue / React）**：滚动窗口改为同一批真实 slide 的循环重排，删除首尾 clone 轨道——跨页保留组件实例（内部状态不丢），DOM/Tab 顺序与可见顺序一致，循环换页沿主轴滑动不倒带，finite 尾部夹紧不留空。`axis="vertical"` 补默认高 16rem（内联样式/工具类可覆盖）与上下方向键、主轴触摸滑动；显式根 `dir` 优先于 ConfigProvider 的 `dir`，RTL 位移方向修正（见 [MIGRATION.md](docs/MIGRATION.md)）。`speed<=0` 或 reduced-motion 时换页立即落地（含动画中途切换），连续导航从渲染位置续跑不跳变。
- **DatePicker / TimePicker（Vue / React）**：只读或禁用时拦截面板与草稿的改值入口，仍可用 Escape 关闭。TimePicker 打开时从当前键入值初始化面板，非法文本则从已提交值初始化；Space / Enter 有草稿时只提交，ArrowDown 提交并打开，确认后不再回退旧值。React 同拍重复提交同一时间范围时只发出一次更新。
- **Countdown（Vue / React）**：按时间戳识别目标与 `now` 的变化，相同时间的 Date 对象替换不再重置计时；更新已过期目标保持归零，更新 `now` 快照不重启计时器。
- **日期解析 / Cron（Core / Vue / React）**：显式 `format` 的日期解析拒绝夹杂非数字的分段，删除失败后回退原生宽松解析的路径。Cron 空白输入返回 `null`，编辑器不再抛异常；React CronEditor 保留其他字段未完成的局部编辑。`nextCronRun` 跳过不匹配的日期和小时，覆盖世纪闰日间隔，返回时间严格晚于起点，并保留夏令时缺时与回拨后的调度语义。
- **图表 Core 根因修复（Core）**：线性刻度按有限安全索引生成，跳过浮点重复值并避开 `toFixed` 精度越界；步长退化或索引无法安全枚举时使用域端点，`[0, 100]` 等普通域与缓存不变。`monotone` / `natural` 曲线在相邻数值 x 差为零或非有限时整条回退直线路径，不再输出 NaN / Infinity，严格变化 x 的样条不变。`layoutSankey` 列分配改为每节点至多处理一次的有限拓扑放松，正常 DAG 最长路径列不变，仍等待循环入边的节点共用无环最深列之后的一个余项列，布局必定终止。Sunburst / TreeMap 先用 `createChartTreeVisit` 一次解析有效子树再做深度、汇总与布局，回边与重复对象保留首次出现，自环与双节点环不再栈溢出或嵌套到几何耗尽。
- **图表组件绘制与命中（Core / Vue / React）**：图例隐藏只影响绘制，对应系列的点、路径与数值标签透明为 0，DOM、键盘导航、域与总量保持不变；Sunburst / TreeMap 图例根项改用 preorder 节点索引映射 active / selected / hidden（修复第二根起选中态错位），祖先隐藏沿树传给后代；React 七处图例 memo 补齐真实依赖，焦点停留图例直接 Space 立即更新。排序 / 过滤 / ordinal 去重后的最近点命中按 `pointIndex` 映射回原始 datum，tooltip 与 point-hover 不再错指；堆叠 Area 的补零只服务几何，交互点 / 键盘 / tooltip 只含原始数据对象。Line / Area 的 `data-plot-hit` 改为无监听的背景层，hover 职责收拢到真实 plot 边界，恢复点与系列的真实 click 及冒泡，空白与填充上的最近点 hover 保留。
- **图表交互与生命周期（Core / Vue / React）**：`observeElementSize` 改为按 border-box 观察（`observeSize` 保持 content-box 语义），双端 ChartTooltip 在内容自增宽或 padding 变化后重新定位，位置数值不变时不写状态，React 移除对每次新建 body 节点的 effect 依赖，关闭或卸载清理观察。Vue Cartesian 与双端 Radar 的帧扫描在卸载时取消。Gantt 拖拽会话在 draggable 关闭、任务禁用 / 移除 / 同 id 替换或日期重写时立即取消并清预览 / 监听 / 指针捕获，不再以旧快照覆盖新数据（Vue 会话改用 shallowRef 保持源任务身份可比），无通知的原地 Date 变异最迟在下一次 pointermove / finish 校验取消；正常拖拽与无关重渲染照常提交。React Gantt 键盘 roving 只遍历可用任务并在落点失效时恢复合法 Tab 入口；React OrgChart 对齐 Vue，每个可交互节点 `tabindex=0`。

## v3.0.0-rc.1（2026-10-05）

- **结构分隔线（Vue / React）**：Layout 头部与侧栏、Menu、PageHeader 和 DataTableWithToolbar 的结构边线改用 30% 的 `--tiger-border`，default / success / warning Tag 描边同样处理；输入框边框保持完整对比度。
- **Menu（Vue / React）**：去掉冗余外框；未选中或禁用项显式使用透明背景，选中项与选中父项的背景不再和默认透明背景竞争。
- **ActivityFeed（Vue / React）**：标题在窄容器内可换行保持可读，移动端时间戳换到标题下方。
- **WorkflowDesigner（Vue / React）**：摘要标题与审批徽章在窄分支卡片内换行；分支改为等高拉伸，分叉 / 汇合间距修正，分支连线在不同高度卡片之间保持连续。
- **WorkflowViewer（Vue / React）**：分叉 / 汇合连接线同样修正；较短的卡片用延伸线接到出口连线；窄屏下溢出的列从滚动区起点即可到达。
- **仓库**：删除已完成的 3.0 波次计划文档（`docs/plan/`），ROADMAP 只登记尚未完成的任务。

## v3.0.0-preview.9（2026-10-04）

- **DatePicker / TimePicker / TreeSelect（Vue / React）**：Escape 关闭最上层选择面板并恢复原触发输入框；TreeSelect 不再把 Escape 当作节点折叠，搜索触发器替换后再恢复焦点。
- **Input（Vue / React）**：错误信息与字数提示出现或消失时保留原生输入框、值与焦点，输入框组继续使用原有布局。
- **ContextMenu（Vue / React）**：浮层保留菜单上下文，选择菜单项先关闭菜单再执行回调，修复打开 Modal 后菜单仍然停留的问题；子菜单同步处理。
- **Anchor（Vue / React）**：尊重调用方 `preventDefault()`，取消组件滚动与 hash 更新；外部页签变化后同步 `getCurrentAnchor` 与 `aria-current`，无需重建链接。
- **图表**：Vue AreaChart / LineChart 的整幅绘图区统一处理点命中。分类轴按 `xTicks` / `ticks` 均匀抽样，多个刻度保留首尾；显式 `xTickValues` / `tickValues` 优先。非整数数量安全取整。
- **窄容器布局（Vue / React）**：折叠 Menu 不溢出带边框侧栏；Pagination 的统计与控件合理换行；NotificationCenter 的标题与时间可换行；CronEditor 按容器宽度重排，长分钟列表说明可换行；WorkflowDesigner 操作表保留可读列宽并在内部横向滚动。
- **发布类型检查**：React 浮层包装通过 props 传入必需的 children，修复构建类型错误。
- **公开类型与维护**：补齐 AppShell、AssigneePicker、NotificationBell、SankeyChart 和 WaterfallChart 缺失的框架 Props 出口。Vue Inplace 发出的事件统一为 `editing-change`，现有 `onEditingChange` 监听不变。清理未使用代码，Vue Carousel 卸载时取消动态减少动画监听，异步分支加载清理不再从 finally 返回。
- **测试与构建脚本**：发布门禁先执行静态与漂移检查，再构建一次包；复用 tarball 的四个示例构建与 SSR 产物检查，消除工作区重复构建和 hydration 重跑。文档/API 基线检查改为只读比较，文档生成只写变更文件。删除测试名和 a11y helper 字符串检查、冗余门禁别名与入口处理死代码；测试扫描覆盖 MCP，并按需加载 axe。Vue/React 的 build/watch 共用入口处理，MCP 构建同步技能快照。API 双端检查复用公开组件事实源，移除空校验；修正 LoadingBar 的体积检查路径。修复浮层测试的零尺寸布局夹具，统一现有格式并让 token emitter 复用仓库格式配置。

## v3.0.0-preview.8（2026-10-03）

3.0 preview 阶段的调整见下列条目；从 2.x 迁移见 [MIGRATION-3.0.md](docs/MIGRATION-3.0.md)。

- **React 浮层生命周期**：OverlayPortal 在提交阶段注册、更新，并在卸载时移除，StrictMode 重放后仍保留打开的层；SSR 与 hydration 继续共用 outlet 内容。共享定位与焦点适配器等待节点实际挂载，关闭、卸载时取消等待，覆盖 Modal、Drawer、菜单与选择器等调用方。
- **WorkflowActionBar（Vue / React）**：更多菜单与确认层使用真实“更多”按钮作为触发器，删除空 span 锚点。取消、Escape 或确认成功后焦点返回按钮。
- **Spotlight（Vue / React）**：聚焦、焦点返回和滚动锁统一交给共享 focus scope；输入节点挂载后自动聚焦，修复 Vue outlet 延迟挂载时漏聚焦。
- **Tabs 文案（Vue / React）**：溢出菜单读取 `locale.tabs.moreTabs`，补齐 13 个内置语言包并支持组件 `labels.moreTabs` 覆盖。删除 `navLabels.moreTabs`，迁移见 [MIGRATION-3.0.md](docs/MIGRATION-3.0.md)。

## v3.0.0-preview.7（2026-10-01）

3.0 preview 阶段的调整见下列条目；从 2.x 迁移见 [MIGRATION-3.0.md](docs/MIGRATION-3.0.md)。

- **基础组件复审（对比 2.9.4）**：恢复 Divider 水平、竖向渐变与 CSS 自定义颜色；Button 支持子组件提供文字，缺少可访问名称时提示而不隐藏按钮；Text 可复制标题保留标签，删除 `resolveCopyableTextTag`。React Tag 关闭钮恢复 Tab 操作。Vue Image 复用原生懒加载，删除重复 observer；Gallery 缩略图保留按钮语义与焦点提示，Vue 根合并 class。CopyButton 复用已有 locale 文案，React 补齐 `label`，Vue 结果 id 按实例生成；补齐 CopyButton 与 Inplace 的框架 Props 导出。Vue ConfigProvider 作废旧语言加载结果。章节滚动保留 hash router 路由，修复 Example 章节导航跳转 404。Skill 与双框架 Example 同步。
- **默认样式（Vue / React）**：补齐 Tag、Collapse、Modal、Drawer 的默认尺寸与遮罩变量，为表格、编辑器、树、工作流和图表的可选主题变量提供语义回退；减轻装饰边线与进度轨道，改善暗色禁用文字和图表块内标签。步骤、分页、胶囊标签与其他实底状态使用配对前景色。按钮组和输入框组的连接选择器改为可被 Tailwind 完整扫描的类名。浮层触发器的重置样式降低优先级，保留内部按钮的颜色与间距。
- **组合组件**：CopyButton、Inplace、AssigneePicker、NotificationBell 与两种图表复用既有按钮、输入框和选项样式；通知铃铛显示图标与未读徽标。SankeyChart 按流量宽度描绘连线，WaterfallChart 的负值使用错误色。React NavigationMenu 在浮层出口保留面板上下文，恢复纵向菜单项与选择后关闭。
- **Example**：Vue / React 补齐八个已有组件的页面入口及 LoadingBar 受控容器示例；修复 ConfigProvider 预览所需导出、Tabs 初始键值和暗色示例背景。窄屏的面包屑与章节导航分行排列，避免重叠。索引生成器复用仓库 Prettier 配置。
- **WorkflowDesigner / WorkflowViewer**：分岔横线按列间距对齐到子节点中轴（列缝不再被百分比吃掉）。设计器横线端点落在子卡顶中心，汇合线与 `+` 同轴。查看器分叉条贴住子卡下落线，汇合条接到各分支竖线并落在下一张卡的顶中心；退回括号的横臂在端点卡片垂直中心，并从卡片右缘伸出。Vue/React 对称。无新 prop。
- **SchemaForm**：分组标题改为整行标题，嵌套内容的左边线画在标题下面。不再用 `legend`：legend 会缩成字段标签的宽度，嵌套组就把「组标题 / 子组标题 / 字段标签」叠进同一列，和输入框并排。每个组一个标题，每个字段一个 label。Vue/React 对称。无新 prop。
- **Button / Icon**：纯图标按钮按 size 收成正方形并清掉文字内边距，图标在按钮里居中。Icon 的尺寸类画在 SVG 上，写在组件上的宽高只约束外层；外层现在把字形居中，并且允许比默认字形更小的盒子把宽和高一起缩进去，不再只挤扁宽度、让多出来的高度从底部溢出。列设置齿轮和同样把 Icon 放进按钮的列表控件走这一套。Vue/React 对称。无新 prop。
- **ImageAnnotation**：选择工具点在标注上会保持选中，删除按钮随之可用；只有点在空白画布上才取消选中。自由绘制按未闭合圆头描边渲染，不再把开路径填充成自交色块。标注层贴在图片框上，并用 `preserveAspectRatio="none"` 把指针换算回 viewBox，舞台滚动时笔迹不再被拉歪。Vue 写出真实的 `stroke-width` / `fill-opacity`。Vue/React 对称。无新 prop。
- **Splitter**：拖动 gutter 回写 `update:sizes` / `onSizesChange` 时保持各 pane 的单位。百分比仍是内容区（容器减去 gutter）的百分比，所以 `v-model:sizes` 之后比例继续跟容器走；像素仍是像素。`resize` 事件里的 sizes 仍是像素。示例水平分割把面板文案绑到这份受控值。Vue/React 对称。无新 prop。
- **Spotlight**：快捷键徽标只出现在对应命令行的行尾。去掉面板底部重复列出同一快捷键的 footer，以及只为它存在的 `spotlightFooterShortcuts` 和 `navLabels.spotlightFooter`。
- **OrgChart**：节点左侧色条改为与卡片圆角同心的内缩条，边框画在色条之上。各节点色条长度和与左边框的间距一致。Vue/React 对称。无新 prop。

## v3.0.0-preview.6（2026-09-27）

- Hotfix for the preview.5 declaration build: narrow polygon and freehand before path data so React dts accepts ImageAnnotation geometry. 来源：[preview-3-0-0-preview-6.md](.changeset/published/preview-3-0-0-preview-6.md)。

## v3.0.0-preview.5（2026-09-27）

- Example visual-QA wave2 N1–N24 (batches A–Q): TreeSelect/overlay, ColorPicker, DatePicker, Tabs, Steps, Spotlight, Tooltip, charts focus, OrgChart, Splitter, ImageAnnotation, icon-only Button, SchemaForm nested groups, approval connectors, timeline axis, CropUpload, Example shell accordion and locale/theme. 来源：[preview-3-0-0-preview-5.md](.changeset/published/preview-3-0-0-preview-5.md)。

## v3.0.0-preview.4（2026-09-26）

- Example visual-QA wave N01–N35 (batches A–J): locale defaults, focus/popup chrome, feedback tokens, overlay dismiss, form controls, timeline axis, steps/tabs/nav, data layout, demo chrome, workflow/inspector design. 来源：[preview-3-0-0-preview-4.md](.changeset/published/preview-3-0-0-preview-4.md)。

## v3.0.0-preview.3（2026-09-26）

- 3.0.0-preview.3: visual QA fix wave — tear down portaled overlays on route change, show the date-range month, place image-preview chrome, paint avatar/badge fills, clip rate half-stars, round the input focus ring, shrink short demo frames, load rocketIcon in the sandbox, put the code language label in a header, paint the dark theme surface, draw watermark tiles at 15% ink, show skeleton bars, give linear progress a track height, scroll ScrollSpy sections inside srcdoc, keep message controls clear of toasts, position React dropdown menus, and keep FloatButton groups in their own viewport. 来源：[preview-3-0-0.md](.changeset/published/preview-3-0-0.md)（文件名不带 preview.3，正文写的是这一版）。

## v3.0.0-preview.2（2026-09-25）

`.changeset/published/` 没有这一版的 changeset，这里不补写组件变更。

## v3.0.0-preview.1（2026-09-24）

`.changeset/published/` 没有这一版的 changeset，这里不补写组件变更。

## v2.9.4

v2.9.4：2.9.3 的包元数据已写出，但 npm tarball 返回 404。本版只把同一产品内容重新发成可安装的包，没有新的 API。

## v2.9.2

v2.9.2：修复发布构建类型错误（React ChatWindow `Input` onChange、InfiniteScroll `orientation` 观察者选项、Popover `aria-label`、SchemaForm 与 HTMLAttributes 交叉）。产品内容与 2.9.0/2.9.1 深检收口一致。

## v2.9.1

v2.9.1：修复 `list-reorder` 使用已更名的 `DragConfig.direction`（应为 `axis`），解除 core `tsc`/发布构建失败。产品内容与 2.9.0 深检收口一致。无新必填 prop。

## v2.9.0

v2.9.0：深检完美重审 breaking（含此前 additive 补齐）。不是 BPMN / Flowable / Camunda。Vue/React 对称。迁移见 [docs/MIGRATION.md](docs/MIGRATION.md#v290)。

- **Form / SchemaForm**：Vue 值对象改为 `modelValue`（`v-model`），删除 `model` / `update:model`。React 改为 `value` + `onChange`，删除 `model`。SchemaForm 非受控种子改为 `defaultValue`（原 `defaultModel`）。
- **Input / Textarea（React）**：`onChange` 改为值（string/number），不再发 DOM 事件。原生事件走 `onInput`。
- **Tabs（React）**：`onChange(activeKey)` 替代 `onActiveKeyChange`。
- **FormWizard**：步变化改为 `onStepChange` / Vue `step-change`，删除 Wizard `onChange`。`finish()` 仅在最后一步生效。
- **Size**：Pagination / Tabs / Steps / FormWizard 统一为 `sm|md|lg`（默认 `md`）。删除 `small|medium|large` 与 Steps `default`。Table 内置分页跟随 Table `size`。
- **公开别名**：删除 `Kanban` / `DonutChart` / `ImageViewer` / `Fullscreen`（`as`）。请用 `TaskBoard`、`PieChart` + `innerRadiusRatio`、`ImagePreview`、`FullscreenButton`。
- **TreeSelect**：`clearable` 默认 true（与 Select/Cascader 相同）；`checkStrictly` 默认 false（与 Tree 级联相同）。
- **List**：`rowKey` 默认 `'id'`（与 Table 相同）。
- **ActionBar**：`items={[]}` 表示没有按钮，不再回落到 `buttonPolicy`。
- **PieChart（Vue）**：有 `slice-click` 监听时与 React 一样可交互。
- **Card**：`title` 是可视标题；原生 tooltip 用 `htmlTitle`。
- **Tree**：删除 `filterValue`；查询只走 `searchValue`。
- **Radio**：`status` 有错误描边与 shake，与 Checkbox/Slider 一致。
- **VirtualTable**：缺少 `id` 时回落到 dataSource 下标，选择仍可用。
- **DataExport**：默认 formats 含 csv；下拉触发器绑定 `triggerAriaLabel`；`customExport` 可替换内置序列化。
- **Popover（React）**：节点内容走 `content`，删除 `contentContent`。
- **SchemaForm**：Vue 根就是 Form（`data-tiger-schema-form` 打在 form 上）；`source` 跑 `mapIn`。Widget 并集含 date/time/cascader/tree-select/slider/upload/color/rate/tags。
- **空值**：DatePicker 空范围是 `null`；Cascader 受控空是 `[]`；ColorPicker / CronEditor 清空是 `null`。
- **direction**：布局/步进/图用 `orientation`，Layout 用 `mode`，ScrollArea/Drag 用 `axis`，ConfigProvider 用 `dir`。Table 排序仍是 `direction: asc|desc`。
- **Locale**：Marquee 读 `ariaLabel`；Designer 删除未绑定的 `emptyText`；Signature 增加 `clearText`。
- **框架映射**：TaskBoard `renderCard` 上下文对象；Vue CollapsePanel `extra` 与 List `header`/`footer` 是 prop（slot 优先）；ConfigProvider 不再把 attrs 沉到 `div.contents`。
- **图表**：全部公开图接受 `locale` / `labels`。
- **ref**：Image / CodeEditor / CropUpload / Tour / Affix / Anchor 的 React ref 与 Vue expose 同一 handle。
- **Masonry**：首屏宽度两侧都是 0，直到 ResizeObserver。
- **Table CSV**：与 DataExport 相同的 skip 规则（render-only、hiddenColumnKeys）。

深检 additive 补齐（同轮）：无新必填 prop。公开别名在 breaking 删除前列仍可 import。

- **文档**：compact Default 列补上运行时默认（Select `multiple` false、List 分页关、Table 分页开、ImagePreview `open` 关等）；PrintPageBreak Vue 不再写成纯透传。`COMPONENT_USAGE_NOTES` 收进审计 traps（FormItem 写而不读、Table/List 分页、Tree vs TreeSelect `checkStrictly`、DatePicker/TimePicker 空范围、size 三套字符串等）。`patterns/common.md` 增加框架差异表。
- **示例**：WorkflowTimeline / Viewer / DetailShell playground 从 `timeline/04`–`06` 迁到 `workflow-timeline` / `workflow-viewer` / `workflow-detail-shell`。Timeline 01–03 仍是骨架时间线。Vue/React 对称。
- **FormItem**：Checkbox / CheckboxGroup / Switch / RadioGroup / Slider / Upload / Transfer 在省略公开 value 时读取 context（boolean/list/tuple 不会把 `''` 当成字符串）。Vue/React 对称。
- **SchemaForm**：Vue action Submit 的 `errors` 与引擎一致（不再硬编码 `[]`）。转发 Form 的 `controller` / `undoable` / `maxHistorySize` / `fieldDependencies` / `onValidate`。
- **RichTextEditor**：React 省略 `value` 时从 FormItem 播种引擎；容器 `style` 与 `height` 合并。
- **Slider**：`status` 接到视觉 / `aria-invalid` / shake。
- **Input / Textarea**：Vue 增加非受控 `defaultValue`（有 `modelValue` 或 FormItem 值时忽略）。
- **Rate / Signature / Mentions**：同时接受 `readonly` 与 `readOnly`；冲突时用 `readonly`。
- **CronEditorSize / RateSize**：类型别名为 `ComponentSize`（导出名保留）。
- **TreeSelect**：`listHeight` 是 overlay `height` 的别名（两者都传时 `listHeight` 胜出）。
- **Mentions**：补齐 Textarea 字段 props（`autoResize` / `maxLength` / `showCount` / `readonly` / `clearable`）。
- **RadioGroup / CheckboxGroup**：可传 `options[]`；有 children / 默认插槽时忽略 options。SchemaForm radio 走同一路径。
- **SplitButton**：React `type` / `htmlType` 打在主按钮上，不再落到 group `div`（`htmlType` 胜出）。
- **Breadcrumb**：overflow 省略号 `aria-expanded` 跟随本地 expand 状态。

## v2.8.5

v2.8.5：Steps / WorkflowDesigner 竖向连接线彻底修复。无新必填 prop。公开别名仍可 import。不是 BPMN / Flowable / Camunda。Vue/React 对称。

- **Steps**：竖/横连接线几何改由 Tailwind plugin 注入（`.tiger-step-tail*` / `.tiger-step-icon-col*`），不再依赖 `inset-inline-start-*` 等易被 JIT 漏扫的 utility。竖线穿过图标列中轴。消费者须加载 `@plugin "@expcat/tigercat-core/tailwind"` 或 `/tailwind/modern`。
- **WorkflowDesigner**：画布脊线改为穿过节点卡片水平中心；节点间 `+` 落在同一中轴。嵌套子树共用中心轨，去掉左侧 `border-s-2` 孤儿轨。几何走 plugin CSS。仍是 simple JSON 树。

## v2.8.4

v2.8.4：与 2.8.2/2.8.3 同内容。2.8.3 在 npm 上 `latest` 已指向该版本，但 core/vue/react tarball 持续 404，故再发一版把 latest 落到可安装包。

## v2.8.3

v2.8.3：与 2.8.2 同内容。2.8.2 在 npm 上 `@expcat/tigercat-{core,vue,react}` tarball 404（changeset 报成功），故再发一版把 latest 落到可安装包。

## v2.8.2

v2.8.2：Line/Area 图 `data-plot-hit` 在 `hoverable` 时触发 `onPointHover` / `point-hover`（tooltip 行为不变）。Vue cartesian 点焦点/键盘去掉 `SVGGraphicsElement` 双断言。无新必填 prop。公开别名仍可 import。不是 BPMN / Flowable / Camunda。不砍工作流 2.5/2.6 能力。Vue/React 对称。

- **Charts**：`useCartesianSeriesPoints` 的 plot-hit 移动在 `hoverable` 时调用 `onPointHover`（Vue 发 `point-hover`）。默认仅 tooltip 的路径不变。
- **Vue**：cartesian 点 `focus`/`keydown` 使用 `SVGElement`（`instanceof`），与 React `KeyboardEvent<SVGElement>` 对齐。
- **测试**：PieChart 补 `innerRadiusRatio` + 中心文案；TaskBoard 补泳道 DOM（Kanban spec 保留）。
- **发布**：已发布 changeset 迁到 `.changeset/published/`，避免误跑 `changeset version` 把 2.7+2.8 叠成 2.9。版本仍用 `scripts/sync-version.mjs`。

## v2.8.1

v2.8.1：React Line/Area 共用 cartesian 点键盘事件类型修正。GitHub Pages 示例 `tsc` 可通过。无运行时行为变化。无新必填 prop。公开别名仍可 import。不是 BPMN / Flowable / Camunda。不砍工作流 2.5/2.6 能力。Vue/React 对称。

- **React**：`useCartesianSeriesPoints` 的 `handlePointKeydown` 使用 `React.KeyboardEvent<SVGElement>`，`ownerSVGElement` 类型正确。Vue 侧本已 `as SVGElement`。

## v2.8.0

v2.8.0：内部内聚。生成文档降格三别名；下载 Blob 单源；看图/看板类型与 utils 折进保留件；Line/Area 笛卡尔尺度与点交互共用。公开别名仍可 import。无新必填 prop。不是 BPMN / Flowable / Camunda。不砍工作流 2.5/2.6 能力。Vue/React 对称。

- **文档**：`docs:api` 不再把 ImageViewer / Kanban / DonutChart 写成一等用法片段。关键词「环形图」「看板」指向 PieChart / TaskBoard。component-index 仍列出公开名。保留件 compact props 补上 `minScale`、`swimlanes`、`innerRadiusRatio`。
- **core**：`downloadBrowserFile` 单源（Table CSV / DataExport / chart export）。`imageViewer*` 手势与类名并入 `image-utils`；`image-viewer-utils.ts` / `types/image-viewer.ts` / `types/kanban.ts` 改为 re-export。`DonutChartProps` / `KanbanProps` 去掉与父接口重复的字段声明。
- **Charts**：LineChart / AreaChart 共用 `resolveCartesianSeriesScales` 与 `useCartesianSeriesPoints`。公开图种 API 不变。Vue AreaChart 的 `onPointClick` 现在会调用（与 Line / React Area 对齐）。
- **别名**：`ImageViewer` / `Kanban` / `DonutChart` 公开名与子路径 **未删**。examples 仍走 `/image-preview` `/task-board` `/pie-chart`（2.7.2 硬切）。
- 行为变化（非 breaking、无新必填 prop）见 [docs/MIGRATION-2.8.md](docs/MIGRATION-2.8.md)。

## v2.7.2

v2.7.2：与 2.7.0/2.7.1 同内容。2.7.1 在 npm 上 core/vue tarball 持续 404，故再发一版把 latest 落到可安装包。

## v2.7.1

v2.7.1：与 2.7.0 同内容。2.7.0 在 npm 上版本被 staged 后 tarball 404（重发遇 E409），故再发一版。

## v2.7.0

v2.7.0：组件瘦身。三组薄别名收进保留件（ImageViewer→ImagePreview、Kanban→TaskBoard、DonutChart→PieChart）；CSV escape 与看板 swimlane helpers 单源。公开别名仍可 import。无新必填 prop。不是 BPMN / Flowable / Camunda。不砍工作流 2.5/2.6 能力。examples 现已不再演示别名路由（见上方未发布条目）。

- **ImageViewer**：实现迁入 `ImagePreview`；`./ImageViewer` 子路径指向 Preview dist。`minZoom`/`maxZoom` 映射不变。新代码与示例用 ImagePreview。Vue/React 对称。
- **Kanban**：实现迁入 `TaskBoard`；`./Kanban` 子路径指向 TaskBoard dist。默认 `showCardCount`/`allowAddCard` 仍为 true。新代码与示例用 TaskBoard。Vue/React 对称。
- **DonutChart**：实现迁入 `PieChart`；`./DonutChart` 子路径指向 PieChart dist。默认 `innerRadiusRatio` 仍 0.6。新代码与示例用 PieChart。Vue/React 对称。
- **core**：Table CSV 与 DataExport CSV 共用 `escapeCsvValue`；`kanban-*` 类名/泳道 helpers 实现并入 `task-board-view`（公开名不变）。
- **WorkflowDetailShell**：header / action 槽改为 `div[data-slot]`（壳已是 `role="region"`，不再嵌套 banner/contentinfo landmark）。粘底布局 class 不变。Vue/React 对称。
- 行为变化（非 breaking、无新必填 prop）见 [docs/MIGRATION-2.7.md](docs/MIGRATION-2.7.md)。

## v2.6.1

v2.6.1：与 2.6.0 同内容。2.6.0 在 npm 上 `@expcat/tigercat-core` 只写出元数据、tarball 404，故再发一版。

## v2.6.0

v2.6.0：审批详情一流粘底 + Designer 纵向流程画布观感。无新必填 prop。不是 BPMN / Flowable / Camunda。

- **WorkflowDetailShell**：根布局 `h-full flex-col`；body `flex-1 min-h-0 overflow-auto`；action `shrink-0 sticky bottom`。宿主给有界高度（`flex-1 min-h-0` / 父级 `h-[32rem]`）即可，**勿再手算 magic rem**。示例 `timeline/06`。单测覆盖「固定壳高内 action 在 body 外」。Vue/React 对称。
- **WorkflowDesigner**：纵向摘要卡流程画布（轨道 + 节点间圆形 `+` 插入点）+ 右侧 Inspector 同屏；未选中时 Inspector 显示 `inspectorEmpty`。减弱 Card `shadow` 列表感。仍是 simple JSON 树，四 Tab / validate API 不变。示例 `workflow-designer/01`。Vue/React 对称。
- **WorkflowActionBar**：主条 `flex-nowrap overflow-x-auto`，窄屏不再折行把次按钮挤出首屏。Vue/React 对称。
- 行为变化（非 breaking、无新必填 prop）见 [docs/MIGRATION-2.6.md](docs/MIGRATION-2.6.md)。
- **size-limit**：本版实测 `Core (full)` 229.9 / `Vue (full)` 433.92 / `React (full)` 476.51 kB gzip，仍低于 v2.5.0 上限（230 / 434 / 477），未调预算。

## v2.5.4

v2.5.4：与 2.5.3 同内容。2.5.3 在 npm 上 `@expcat/tigercat-react` 只写出元数据、tarball 404，故再发一版。

## v2.5.3

v2.5.3：WorkflowActionBar 溢出确认层不再渲染隐藏/不可见 trigger（0×0 disabled 无名按钮）。无新必填 prop。不是 BPMN。

- **WorkflowActionBar**：`placement: more` 的 Popconfirm 仅在确认打开时渲染，关闭时不留下 disabled 幽灵按钮。Vue/React 对称。

## v2.5.2

v2.5.2：与 2.5.1 同内容。2.5.1 在 npm 上只写出元数据、tarball 404（staged 409），故再发一版。

## v2.5.1

v2.5.1：审批/工单扫读小修。Descriptions 标签不拆字；SchemaForm extra 进控件列；Designer 操作按钮 nowrap；Badge primary 实底对比度。无新必填 prop。不是 BPMN。

- **Descriptions**：水平/垂直标签 `whitespace-nowrap`，窄列不再逐字折行。
- **SchemaForm / FormItem**：`extra` 画在控件列（输入框下方），不再与下一字段 label 抢位。FormItem 新增可选 `extra`。
- **WorkflowDesigner**：Inspector 操作按钮 `whitespace-nowrap`，避免「移除」竖排。
- **Badge**：`primary` 使用实底 `--tiger-primary`，独立数字对比度可读。
- **WorkflowActionBar**：同意确认为 `info` 图标 + `top-end`，不再用警告三角。拒绝仍为 error/danger。

## v2.5.0

v2.5.0：工作流一流完整版。Designer Inspector 四 Tab；ActionBar 完整动作（加签 / 退回 / 退回修改）；按人 `tasks`；字段权限 × SchemaForm；可选 `WorkflowDetailShell`。不是 2.4.2 的补丁包。不是 BPMN / Flowable / Camunda。组织 / 字典不进主包。有计划的行为变化见 [docs/MIGRATION-2.5.md](docs/MIGRATION-2.5.md)。无新必填 prop。

- **Core 模型 / `reduceWorkflowAction`**：节点可配 `approverPolicy`（`ApproverSource` 契约，宿主 `resolveApprovers`）、`buttonPolicy`、`fieldPermissions`、`advanced` 策略枚举。运行态可选 `tasks[]`（per-actor：assignee / status / actedAt / comment）；`workflowActorProgress` 以 tasks 为准，缺省回落 `actors` + 节点 status（兼容 2.4.2）。纯函数 `reduceWorkflowAction` 覆盖 approve / reject / transfer / addsign（前/后） / return（选节点） / cancel / comment / request_changes。locale 全量键一次写完。不是 BPM 引擎，不跑组织解析。
- **WorkflowActionBar**：默认视觉序同意→拒绝→转交→退回→加签→撤回→评论；`request_changes` 可选。`placement: more` 进溢出菜单（Esc / 方向键 / 焦点返回）。`commentRequired` **空意见拦住 `onAction`**（相对 2.4.2「只换文案」有意升级）。`return` 需 `returnTargets` 或 `renderReturnPicker` / `#returnPicker`；`addsign` / `transfer` 需 `renderAssigneePicker` / `#assigneePicker`。加签确认层可选 before / after。缺 `buttonPolicy` 仍用 2.4.2 默认集（不含加签/退回）。示例 `timeline/04` `05`。Vue/React 对称。公开 API 增补，无新必填 prop。
- **WorkflowViewer / WorkflowTimeline**：会签每人一行（`tasks` 优先，否则 `actors`）；加签临时节点标记、退回目标高亮、条件未走支弱化。仍同一套 `WorkflowTimelineStep`，不另起 Timeline。示例 `timeline/04` `05`。公开 API 增补，无新必填 prop。
- **WorkflowDesigner**：画布摘要卡 + 右侧 Inspector 四 Tab（审批人 / 操作按钮 / 表单权限 / 高级）；调色板 + 节点间 `+` + 复制/删除；`buttonPolicy` / `fieldPermissions` / `approverPolicy` 可编辑；缺发起/缺结束/空审批人/无分支阻塞提示。仍是 simple JSON 树，不是 BPMN / Flowable / Camunda。示例 `workflow-designer/01` `02`。公开 API 增补，无新必填 prop。
- **字段权限 × SchemaForm / WorkflowDetailShell**：`applyWorkflowFieldPermissions(schema, permissions, mode)`（`initiate` / `approve` / `readonly`）派生 SchemaForm；可选 `WorkflowDetailShell` 布局配方（header / form / tabs / sticky action）。不是表单设计器，不是第二套 Timeline。示例 `schema-form` 与 timeline 联合。公开 API 增补，无新必填 prop。
- **本版明确不做**：嵌入 Flowable / Camunda / Activiti；BPMN 2.0 画布；第二套 Timeline / Menu；租户 / 部门 / 岗位 / 字典作为 Tigercat 组件；把 SchemaForm 做成飞书式表单设计器。加签 / 退回自本版起为正式目标。
- **同步 `.size-limit.json` 预算（v2.5.0 实测）**：`Core (full)` 220→230 kB（实测 229.64）、`Vue (full)` 420→434 kB（实测 433.6）、`React (full)` 462→477 kB（实测 476.18）；locale / ActionBar / Designer / DetailShell 增补带动若干子路径略超，一并按实测上调。

## v2.4.2

v2.4.2：审批详情扫读。Viewer 状态色点/进行中 + 路径图例；会签人用 `actors` 列在卡内；ActionBar 主次序 + 确认 description / 意见框；Designer 摘要卡 + 选中编辑 + 兄弟插入。无新必填 prop。不是 BPMN，不是加签引擎。

- **WorkflowViewer / WorkflowTimeline**：当前节点可扫读（状态色点 +「进行中」，不只 ring）；`highlightPath` 时图例含当前路径 / 未走分支 / 驳回回退点。会签/或签/依次在卡内列 `actors`（countersign 显示 N/M），不要把人做成 `children` 并行卡。`kind=cc` 状态「已抄送」、视觉弱化。同一套 `WorkflowTimelineStep`，不另起 Timeline。示例 `timeline/04` `05`。公开 API 增补（可选 `actors`），无新必填 prop。
- **WorkflowActionBar**：默认视觉序同意→拒绝→转交→撤回→评论；`confirm` 为 title + description（拒绝/撤回 danger）；拒绝可意见框，空意见仍提交；`commentRequired` 只换文案/aria。`onAction(item, payload?)` 第二参可选。示例 `timeline/04` `05`。默认集合不加签/退回选节点。公开 API 增补，无新必填 prop。
- **WorkflowDesigner**：未选中摘要卡（kind 色点、标题、审批人名、signMode Tag）；选中后右侧/下方编辑 title / kind / signMode / actors。兄弟 `+` 调用 `insertWorkflowStepAfterPath`。仍是 simple JSON 树，不是 BPMN / Flowable / Camunda。示例 `workflow-designer/01` `02`。公开 API 增补，无新必填 prop。
- **同步 `.size-limit.json` 预算（v2.4.2 实测）**：`Core (full)` 216→220 kB（实测 219.2）、`Vue (full)` 413→420 kB（实测 418.95）、`React (full)` 455→462 kB（实测 461.26）；locale / Viewer / Designer 增补带动若干子路径略超，一并按实测上调。

## v2.4.0

v2.4.0：WorkflowDesigner 简单 JSON 树流程编辑器；SchemaForm schema 驱动表单。无新必填 prop。Captcha 未做。

- **WorkflowDesigner**：简单 JSON 树流程编辑器，复用 `WorkflowTimelineStep`（不是 BPMN / Flowable / Camunda）。可选 `path` 只编辑该节点的 children 并回写整树。Core helpers 可从 `@expcat/tigercat-core/workflow-designer` tree-shake。Vue `v-model` / React `value`+`onChange`。示例 `workflow-designer/01` `02`。公开 API 增补，无新必填 prop。
- **SchemaForm**：schema 驱动表单，复用 Form / FormItem 校验与条件 DSL。字段定义、布局 groups（可嵌套）、点路径嵌套值、`valuePath` / `mapIn` / `mapOut` 值映射。Core helpers 可从 `@expcat/tigercat-core/schema-form` tree-shake。Vue `model` / `update:model`，React `model` + `onChange`。示例 `schema-form/01` `02`。公开 API 增补；Captcha 未做。无新必填 prop（对已有 Form API）。

## v2.3.2

v2.3.2：中台展示加深。WorkflowViewer 只读审批树 + ActionBar 确认配方；MenuSchema 元数据与 `schemaToRouteRecords`。无新必填 prop。

- **WorkflowViewer**：只读钉钉风审批树，复用 `WorkflowTimelineStep`（含 children 并行/抄送/条件分支 stub），不另起一套时间线。会签/或签/依次为展示字段；当前路径高亮与驳回回退点只读。`WorkflowActionBar` 可选 `confirm` 确认框配方，文案走 `locale.workflowTimeline`。Vue/React 对称。示例 `timeline/05`。公开 API 增补，无新必填 prop。
- **MenuSchema 元数据**：`hideInBreadcrumb` / `flatMenu` / `badge` / `iframeSrc` 留在 schema，不写进 `MenuItem`。纯函数 `schemaToRouteRecords` 产出框架无关路由记录（`name` / `path` / `meta`），不做 `addRoute`。`flatMenu` 在菜单里把子节点提到当前层（父级仍作叶子），路由树则把子记录与父级并列；`hideInMenu` 页面仍会进路由记录。Vue/React 示例 `menu/05`。公开 API 增补，无新必填 prop。
- **同步 `.size-limit.json` 预算（v2.3.2 实测）**：`Core (full)` 214→216 kB（实测 215.31）、`Vue (full)` 411→413 kB（实测 412.4）、`React (full)` 453→455 kB（实测 454.36）；WorkflowViewer / locale / MenuSchema 增补带动若干子路径略超，一并按实测上调。

## v2.3.1

v2.3.1：Admin 审查回流的展示修复。无新必填 prop。

- **WorkflowTimeline 状态 Tag 跟 locale**：`locale.workflowTimeline`（zh-CN「已通过 / 进行中 / 待处理 / 已驳回 / 已撤销」）+ `labels` 覆盖；`workflowStepStatusLabel(status, labels)` 可读 overlay。Vue/React 读 ConfigProvider。公开 API 增补，无新必填 prop。
- **Message 默认 `top` 居中**：容器用 inline `left:50%; transform:translateX(-50%)`，不再依赖宿主是否扫到 `inset-inline-0`。Guest / Shell 不再钉在视口左上。Vue/React。公开行为修复。
- **计数折线全 0 时 Y 轴不再到 -1**：`getNumberExtent` 对非负序列不把域扩到负数；全 0 为 `[0, pad]`。Vue/React 笛卡尔图共用。公开行为修复。
- **Standalone Badge `content={0}` 显示 0**：计数徽章默认 `showZero`；overlay（`standalone={false}`）仍隐藏 0。显式 `showZero` 优先。Vue/React。公开默认值放宽。
- **同步 `.size-limit.json` 预算（v2.3.1 实测）**：`Core (full)` 213→214 kB（实测 213.76）、`Vue (full)` 409→411 kB（实测 410.05）、`React (full)` 451→453 kB（实测 452.15）；locale 增补带动若干子路径略超，一并按实测上调。

## v2.3.0

v2.3.0：中台动态菜单 schema 与审批时间线。MenuSchema 过滤后映射到现有 Menu；WorkflowTimeline / WorkflowActionBar 是展示层，不接 BPM 引擎。Vue/React 对称。

- **MenuSchema helpers**：`MenuSchemaNode` + `filterMenuByPermission` / `menuSchemaToMenuItems`。按权限码过滤、`hideInMenu` 提升子节点、空组修剪；`path` / `permission` 留在 schema，不写进 `MenuItem`。Vue/React 示例 `menu/04` 用 mock 后端 JSON 喂 sidebar Menu。公开 API 增补，无新必填 prop。
- **WorkflowTimeline / WorkflowActionBar**：core 审批步模型（normalize/sort、status、`workflowStepsToTimelineItems`），映射到现有 Timeline，不 fork `TimelineItem`。Vue/React 组件画步骤时间线 + approve/reject/transfer/cancel/comment 动作条。示例 `timeline/04`。公开 API 增补，无新必填 prop。本版不做 Flowable/Camunda 引擎或流程设计器。

## v2.2.0

v2.2.0：收下 Tigercat_Admin 上游开放项。P1 全部落地；列出的 P2 按建议 API 一次做完，去掉双轨 workaround。Schema 表单、人机验证码、图表基元精细联动本版不做，理由见下。

- **同步 `.size-limit.json` 预算（v2.2.0 实测）**：`Core (full)` 211→213 kB（实测 212.37）、`Vue (full)` 405→409 kB（实测 408）、`React (full)` 447→451 kB（实测 450.1）；若干含子路径因官方 icon 名集与 locale 增补略超，一并按实测上调。

- **Calendar `events` / `dateCellRender` / `#dateCell`**：月视图格子可画事件。`events` 按本地 `yyyy-MM-dd` 匹配；不传自定义渲染时画色点。React `dateCellRender(date, extra)` 与 Vue `#dateCell="{ date, events, extra }"` 对称。格子 `aria-label` 含 `{n} events` / `{n} 个日程`。Vue/React。公开 API 增补，无新必填 prop。
- **Text `copyable`**：`true` 或 `{ text?, tooltip?, onCopy? }`。复制钮可键盘操作，成功走内部 tooltip + `aria-live`（复用 `locale.code` 文案）。Vue/React。公开 API 增补，无新必填 prop。
- **滚动祖先自动探测**：Affix / Anchor / BackTop / ScrollSpy 未传 `target` / `getContainer` 时沿 DOM 找最近 overflow 祖先，找不到再回落 `window`。显式选择器 / Element / `null`（window）仍覆盖。core `findNearestOverflowAncestor`。若必须钉 `window`，传 `target={window}` 或 `getContainer={() => window}`。Vue/React。公开行为变化，无新必填 prop。
- **Icon 覆盖面 + 注册表**：官方 `name` 增加 `fullscreen` / `fullscreen-exit` / `ticket` / `bolt` / `zap` / `chart-bar` / `chart` / `database`。`registerIcon` / `registerIcons` 挂应用级名称（内置名不覆盖），子路径 `@expcat/tigercat-core/icons/registry` tree-shake。Vue/React。公开 API 增补。
- **Code 可插拔高亮**：可选 `language` + `highlighter`。默认仍纯文本，不高亮引擎进主包。输出按 TRUSTED HTML 注入。Vue/React。公开 API 增补，无新必填 prop。
- **FullscreenButton / `useFullscreen`**：浏览器全屏，处理 `fullscreenchange`、无权限失败、SSR 空操作；内置 expand/collapse 图标。Vue/React。新组件 + hook。
- **Menu 折叠态搜索**：`collapsed` 时隐藏搜索框且不按残留 query 过滤。`searchable="auto"` 表示仅展开时搜索。Admin 不必再写 `searchable={!collapsed}`。Vue/React。公开 API 放宽 + 行为修复。
- **独立 Drag 组件**：与 `useDrag` 同一套 item props/attrs，落下回写 `items`。不是第二套拖拽系统。Vue/React。新组件。
- **Footer `size="compact"`**：缩小垂直 padding。Layout 示例补「Content 内滚动 + Footer 随内容」和「固定页脚」。
- **AutoComplete 受控示例**：打字只改 `searchValue`，提交才改 `value`。无第二套 `onInput`。
- **编辑器 highlighter 示例**：CodeEditor 传入 `builtinCodeHighlighter` 演示最小适配；自定义引擎仍走现有 `highlighter` / `engine` 插口。
- **本版明确不做**：动态 schema 表单（Admin 不做表单设计器）、人机验证码（Admin 无明示需求）、Chart 基元 axis↔tooltip 共享 scale（高层图已够用）。出现真实下游需求再登记。

## v2.1.4

v2.1.4：ImageCropper 裁剪画布不再被 ResizeObserver 越缩越小；Example 视觉审查修复与本地测试套件收口一并进本版。

- **ImageCropper ResizeObserver 自反馈循环**：根因是观察节点与拟合画布是同一层——加载后把 `displayWidth/Height` 写回被观察根（外加 `border-box` 边框），每次 `clientWidth` 比写回值小 2px，选区跟着 `remapCropRect` 缩小；缩到 0 时 `getCropperDisplaySize` 把空尺寸回退成原图像素，画面弹回再缩。Vue 选区一路缩没；React `minWidth/minHeight` 把选区钉在 20px，原图仍循环。修复：测量宿主只吃父级宽度（`w-full`），拟合尺寸写在内层 stage；高度只在调用方显式约束时参与拟合；坍缩宿主不再回退到 intrinsic size。Vue/React。公开行为修复。无新必填 prop。
- **测试套件收口（仅本地）**：默认 `pnpm test` 跳过逐组件 jest-axe（约占全量测试时间 20%）以及 `a11y-aa-regression` / `a11y-interactive-regression` / `composite-a11y-roles`（只走 `pnpm test:a11y`）；去掉 Tailwind class 字符串、无效 Theme 断言和与 `imperative-api` 重复的 instance-counter；Table/现代主题 spec 不再动态 import 根 barrel；`pnpm e2e` 默认 Chromium 且去掉与单测重复的 TagsInput/OTP/Mask/NavigationMenu 冒烟，`pnpm e2e:full` 才跑全引擎。不把测试接入 GitHub Actions。
- **Example 视觉审查根因修复（TC-M-001–010）**：SplitButton 主按钮与 chevron 同高；ImageCompare 焦点环画在旋钮上；ImageCropper SE 拖到边界不再平移整框、去掉位移 transition；Rate `character` 半星宿主带宽高；Slider tooltip 预留下方空间；Select/Cascader 忽略 Chrome ResizeObserver loop 误报；AutoComplete 打开点击不再立刻关掉列表（overlay 未定位时不命中、outside 延迟绑定）；Cascader 面板按内容撑开；TimePicker 选中项聚焦保持白字主色底；Vue/React Example 默认 iframe 不再加载 `@tailwindcss/browser` Wasm，编译 Worker 在 OOM 后终止并重试。Vue/React。公开视觉/行为修复。无新必填 prop。

## v2.1.3

v2.1.3：把未发布栏的组件根因修复收成正式版，含 NavigationMenu 键盘、ScrollArea playground 溢出、Watermark 防篡改循环和发版门禁。

- **Watermark**：防篡改只看直子 overlay 是否还在覆盖宿主；自身绘制和 remount 不再当成篡改，避免 MutationObserver 循环撑崩 playground。
- **锚点浮层**：Modal/Drawer 根是 `pointer-events-none`，overlay-host 是 `contents`。portaled 层补 `pointer-events-auto`，否则 Select 等点击会穿透到 dialog 内容。
- **ScrollArea**：`className` / attrs.class 打在根上（viewport 用 `viewportClassName`）。根是 column flex + `overflow-hidden`；`height` / `maxHeight` 写在真正 overflow 的 viewport 上，所以只传 `maxHeight` 就会溢出。轨道 / 滑块 / 阴影的几何用 inline 逻辑属性，不依赖 playground 是否生成 `inset-inline-*`。01 示例与文档一样只传 `maxHeight`。e2e 用 `scrollIntoViewIfNeeded` 滚 Layout Content（不是 `window`），后面的 playground 模块才会进 IntersectionObserver。
- **Vue 示例 playground**：CodeEditor 走 `modelValue` / `update:modelValue`，编辑才会标 dirty。
- **NavigationMenu**：Vue 面板只走 vnode `onKeydown`（与 React 对称）。vnode + `addEventListener` 会把一次 ArrowDown 走两步，两项面板从「指南」绕回自身。打开后面板在真正可见后再 `focusFirstMenuItem`（Firefox 在 `visibility:hidden` 上 focus 无效）。`getMenuItems` 把非 `false` 的 `aria-disabled` 都当禁用。
- **SSR 示例（Next 16 / Nuxt 4）**：两站接 Tailwind plugin + `@source` dist。ConfigProvider 在应用根，`<html lang>` 与 `zhCN` 对齐。DatePicker 用 date-only 值；门禁锁产物 HTML、主题 CSS 与 hydrate。不要从 Next Server Component 直接 import 组件。
- **TaskBoard / Kanban**：过滤和 `hiddenColumns` 只改显示；WIP / 计数 / 拖拽下标用源数组。列拖按 `column.id` 映回源。键盘可放进空列；`beforeCardMove` 的 Promise 会等完再清指示器。无回调加卡/加列插入 locale 标题。Vue `onCardAdd` 会真调用。泳道是列内分组，未分组走 locale，收起的卡不进 DOM。Kanban 只改默认值并透传，不再第二份列状态。
- **Feed 组合（ChatWindow / CommentThread / ActivityFeed / NotificationCenter）**：时间格式一份 `formatCompositeTime`（`0` 合法，ISO 才 parse，Invalid Date 空串，接 locale）。`groups` / `nodes` 一旦传入（含 `[]`）不再回落 `items`。Chat 贴底才跟最新，IME Enter 不发，`onSend` 不 push。评论 overlay 在 `nodes` 换引用后丢弃，Load more 按 `maxReplies` 揭剩余。Activity Vue 点走 `#dot`。NC 光 `items` 走 List，已读钮常显，全部已读管所有组。这不是命令式 `notification` toast。
- **DataTableWithToolbar**：搜索/筛选/隐列/页尺寸下沉 core。默认 `searchMode: 'local'` 写进当前表；批量订内层勾选。`onPageChange` 与 Table 同签名；省略 pagination 默认开。`id`/`style` 在外壳。Vue 补 `tableClassName`，props 复用 Table。
- **FormWizard**：导航下沉 core。`isLast` 看未跳过步。`fields` 交给祖先 Form。`beforeNext` 字符串可见。Finish 会提交 Form。Vue 动作图标走 `#icon`。
- **FileManager**：`currentPath` / `searchText` 与 `selectedKeys` 同一套受控探测，不绑回调时双击文件夹会进入。路径是文件夹 key。搜索 `''` 是真清空，只匹配当前层名称。`draggable` 重排当前层源数组并回写整棵 `files` 树。面包屑是 button，listbox 有 locale 名，越界 roving 会夹紧。根节点 `h-full`，高度/style 进 DOM。
- **ImageAnnotation**：绘制走 pointer 会话（含触控和 `pointercancel`）。id 不与已有 `value` 撞。读图有 generation / onerror，失败不再无限转圈。`disabled` 时形状不能选。形状名和画布名走 locale。点空白清选中。
- **编辑器族（CodeEditor / RichTextEditor / MarkdownEditor）**：`sanitizeHtml` 改白名单解析，粘贴写入 DOM 前消毒。CodeEditor 只留一个 scroller，行号与代码对齐；Tab 缩进、`readOnly` 不改值。Vue 三个编辑器都走 `v-model` / `modelValue`。RTE 工具条 `mousedown` 保住选区，engine 的 `mode` / `toolbar` 挂载后仍生效。Markdown 预览放行相对 URL，preview 下隐藏格式工具条。自定义 `highlighter` / `engine` / `renderer` / `icon` 是 TRUSTED。删除 `markdownModeLabels`。
- **径向图（Pie / Donut / Radar / Funnel / Gauge）**：几何下沉 `layoutPieSlices` / `layoutRadar` / `layoutFunnel` / `layoutGauge`。Donut 把决议后的半径交给 Pie（`outside` 标签时 inner 相对缩小后的 outer）。缺 label 走 locale（`sliceName` / `stageName` / `seriesName`），不要 `Stage N` / `Slice N` 写死在 core。扇区/点/段默认 `aria-hidden`，不要每片 `role=img`。`responsive` 接 Canvas 尺寸宿主。Funnel `direction="horizontal"` 真水平。Gauge 角度 0 = 12 点钟顺时针，默认 `-135…135` 底开口；`animated` 可关，reduced-motion 不插值。入场动画走 plugin class。01 只传 `data` / `value`。
- **笛卡尔图（Bar / Line / Area / Scatter）**：几何下沉 `layoutBarRects` / `layoutLineSeries` / `layoutAreaSeries` / `layoutScatterPoints`。四图同一份 `DEFAULT_CHART_PADDING`。`barRadius` 传入即盖过 token；负柱标签在柱底外侧。`showArea` 基线是 `yScale.map(0)`。堆叠面积复用上一层顶边，缺 x 补 0，正负分堆。Scatter 默认不再用 24 裁轴标；`sizeScale` 把 `size` 映成半径；gradient 不丢 `item.color`。点默认 `aria-hidden`，不要每点 `role=img`。画线/入场动画走 plugin class，禁止运行时插 `<style>`。01 只传 `data` 即可看。
- **Chart 原语 / useChartInteraction**：`responsive` 观察画布自己的宿主，不再吃 legend 高度。默认 padding 盖住轴标签（`DEFAULT_CHART_PADDING`）。轴/网格几何下沉 core；Series 按 `type` 设 fill/stroke。`useChartInteraction` 的 click 不再暗绑 `selectable`；取消选中时 click 仍发原始 index、select 发 `null`。图例 `items` 才是组件 API（mixin 改名 `ChartLegendToggleProps`），`aria-pressed` 只表示选中，默认名走 locale。Tooltip 关着不挂节点，走 overlay-host，z 用 overlay 层。导出 `useResponsiveChartSize`。
- **Tour**：导航状态机下沉 core。`loadSteps` 后当帧出 dialog 并挂陷阱；pending / 全 skip / 越界不锁滚动、不吞 Escape。非受控 `current` 关闭后再开回到 0（受控由父级归零，下标是原始 steps 下标）。`closable={false}` 只藏 X；补 `maskClosable` / `keyboard`。量 target 跟当前 step，非法选择器 `devWarn` 后居中；popover 用真实盒 + flip，一律 `position:fixed`。文案只读 `locale.tour`。有/无 title 都有 dialog 名。Vue 导出 `TourProps`，React `forwardRef` 到 dialog。删除 `getTourSpotlightStyle`。
- **Modal / Drawer**：从关上打开当帧出 dialog，陷阱跟挂上的节点，卸载也还焦。默认关场真播过渡（`prefers-reduced-motion` 立刻结束），`after-close` 跟运动 token 走。`mask={false}` 点得透；`keyboard={false}` 才忽略 Esc。sheet/drawer swipe 只在标题栏或滚到头时关。Modal `draggable` 走 pointer 并钳在视口。关闭名走官方 locale（en-US `Close` / `OK` / `Cancel`）。无标题仍有 dialog 名。删 `deferDestroyOnClose`（`destroyOnClose` 自己等关场）。`placement` 含 `start`/`end`。Vue 导出 `ModalProps` / `DrawerProps`。React `forwardRef` 到 dialog。假 `--tiger-modal-mask` / `--tiger-drawer-mask` 改读 component overlay token。
- **Message / notification / LoadingBar**：命令式队列、duration 句柄和 host 生命周期下沉 core。同一同步块连发不再丢；非 browser 不 push。关闭名走 `common.closeMessageAriaLabel` / `closeNotificationAriaLabel`，渲染时读 locale。容器不再套 live，条目 error=`alert` 其余 `status`。LoadingBar 进度条 role 在根上、不 trickle 报 live；`set` / `inc` 补上；`hideNow` 复位选项；trickle 尊重 reduced-motion。Vue 导出 `MessageProps` / `NotificationProps` / `LoadingBarProps`。子路径 `/Message` `/LoadingBar` 走懒加载 Root。
- **Affix / BackTop / Anchor**：滚动根收成一份 `resolveScrollRoot`（选择器 / Element / Window / getter）。非法选择器 `devWarn` 后回退 window，不再抛出 effect。Affix 钉住后跟占位量宽高，父级变宽仍铺满；无 IO 走 scroll/resize。Anchor 默认用 Affix 占位而不是裸 `fixed`，点链接发 `onChange` 并 `replaceState` hash，根是 `nav` + `aria-current`。BackTop 隐身退出 Tab，默认名走 locale，`auto` 吃 `placement`/`offset`。`duration` 不是毫秒（0 = instant，正数 = 浏览器 smooth）。Vue 导出 `AffixProps` / `BackTopProps` / `AnchorProps`。
- **NavigationMenu**：开合 / hover 定时器 / menubar 与面板键盘下沉 core。`1` 与 `'1'` 是同一项。默认点击或 Enter / Space / ArrowDown 才开层面板，焦点不再开层；`openOnHover` 才悬停打开。再点同一 Trigger 会关上。Roving tabindex 跟 `tabStopValue` 走，打开面板不会把停点打回第一项。Tab 出面板落到 nav 后面的控件。Mega 也是 `role="menu"`。`aria-controls` 关上仍在。根 `disabled` 管顶层 Link。不再默认 `aria-label="Main"`。`NavigationMenuList` 进根入口。Vue 导出 `NavigationMenuProps` / `useNavigationMenuContext`。
- **Menu**：选中 / 展开 / 搜索下沉 core。`1` 与 `'1'` 是同一 key。点选永远单选（再点已选项变成 `[]`），`multiple` 只管 submenu。搜索会展开祖先，父标题匹配仍是 SubMenu。搜索框在 `role="menu"` / 列表外面，文案走 `common.searchPlaceholder` / `common.emptyText`。垂直导航是 `<nav>` + 列表（有 `href` 才是链接，`aria-current="page"` 只打在链接上）；horizontal 是 `menubar`。popup 与 inline 共用 `openKeys`，`popupPortal` 默认 `true`。icon 只收节点或已登记 icon 名。Vue 导出 `MenuProps` / `useMenuContext`。
- **Overlay 触发器**：`aria-haspopup` / `aria-expanded` / `aria-controls` 打在焦点节点上（`asChild` 或自渲 `<button type="button">`），不再写在包装 div。Dropdown 默认 `trigger="click"`；hover 合取 click/focus。Tooltip `aria-describedby` 只在打开时写在焦点节点。Popconfirm 打开进焦 Cancel，文案走 locale，OK/Cancel 用 Button。SplitButton 不再套 ButtonGroup，chevron 名走 locale。ContextMenu 触发面进 Tab，点 Sub 能开。Vue 导出对应 `*Props`。
- **Tree**：展开 / 选中 / 勾选 / 过滤 / 懒加载 / 拖拽下沉 core。`1` 与 `'1'` 是同一节点。flatten 一行渲染，虚拟和非虚拟缩进、连线同一套。`filterValue` / `searchValue` 是同一条查询（摘节点，匹配子串走 `<mark>`）；`searchable` 只决定是否画输入框。`loadData` 不得改传入对象，失败清转圈。`checkStrategy` 会走过半选祖先；级联跳过 disabled。`onDrop` 带 `before` / `after` / `inside` 和下一棵不可变树。默认名走 `locale.tree`。搜索框在 `role="tree"` 外面。Vue 主入口导出 `TreeProps`。
- **DataExport**：真 xlsx / CSV / Markdown 一条栈。CSV 带 BOM、CRLF、公式前缀；Date 写 ISO，对象写 JSON；只有 `render` 的操作列默认跳过，隐藏列传 `hiddenColumnKeys`。`fileName` 已有后缀不再拼接。闸、序列化、下载下沉 `runDataExport`；连点只跑一次；失败有 `aria-live`。多格式触发器 `asChild` 把 ARIA 打在同一颗 button 上。空 `formats` 不再卸组件。Vue 导出 `DataExportProps`。
- **VirtualTable**：行窗口与 VirtualList/Table 同一份 `calculateVirtualRange`。可见行钉死 `virtualItemHeight`；spacer 是带 `td` 的垫片。原生 `<table>` 语义，roving tabindex。选择是点行、默认 `rowKey="id"`，没有 checkbox 列。列虚拟化要数字 `width` 且无固定列。React `forwardRef` / Vue `expose({ scrollToIndex })`。删除 React 独有 `renderCell`。
- **Table 状态 / 工具**：排序、筛选、分页、选中、展开、隐列、列锁、编辑、行列拖拽下沉 `resolveTableView`。行键走 `rowKey` / `rowSelection.getRowKey`，缺 id 用 dataSource 下标而不是页内下标；`onCellChange` / `onRowClick` / `render` 同一份。`undefined` 非受控、数组（含 `[]`）受控。筛完会连 `onPageChange` 一起回到第 1 页。remote 默认不本地筛排分组，`total: 0` 是真 0。先分组再分页。单元格一律 `dataKey || key`。内置导出只留 CSV（BOM / CRLF / 公式前缀）；假 `.xls` 删掉，xlsx 走 DataExport。`autoVirtual` 默认关。`editableCells` 改为 `{ [columnKey]: number[] }`。Vue 导出 `TableProps`。
- **VirtualList / InfiniteScroll / 窗口算术**：行窗口只留 `calculateVirtualRange`（exclusive end、两侧对称 overscan、NaN 闸）。Table `getTableVirtualWindow` 与 VirtualList `getFixedVirtualRange` 都转这份。variable/dynamic 的 `endIndex` 是最后一条与视口相交的项；dynamic 在 `itemCount` 增长时保留已测高度。VirtualList 暴露 `scrollToIndex` / `scrollToOffset` / `getScrollElement`，固定项 `overflow: hidden`，滚动根可聚焦并默认 `role="list"`（嵌在 Tree/List 里传 `role="none"`）。InfiniteScroll 的 `loading` 会重建观察者、sentinel 至少 1×1、`end` 跟 sentinel 同一侧；`onLoadMore` 必须同步把 `loading` 置 true。容器必须定高（`height` 或 class）。Vue 导出 `VirtualListProps` / `InfiniteScrollProps`。删除未使用的 `VirtualListItemSize`。
- **Upload**：选文件 / 校验 / 请求 / 中止下沉 core。不传 `action` 且不传 `customRequest` 时列表停在 `ready`，不再假成功。`autoUpload={false}` 必须 `submit()`。进行中 Remove 不会把项写回。FormItem 写入 `UploadFile[]`。`picture` 是带缩略图的文本行。Vue 导出 `UploadProps`，React `UploadRef` 含 `submit` / `abort`。
- **Transfer**：勾选 / 全选 / 移动下沉 core。补非受控 `defaultValue`；右侧按 `targetKeys` 顺序。面板是 checkbox 组（带头上全选），不再是 listbox 套 checkbox。默认渲染并过滤 `description`。读 FormItem。假 `--tiger-transfer-*` 删掉。Vue 导出 `TransferProps`。
- **CropUpload**：object URL + generation，确认钮等 cropper `onReady`。`CropResult.file` 带原名。触发器是 `<label>`；有可见 children 时不再盖英文 `aria-label`。footer 只留 Modal 一层 chrome。
- **Mentions**：省略 `value` 能打字（`undefined` 非受控，`''` 是空正文）。过滤/插入/开合下沉 core；插入用 textarea 当前值。读 FormItem；textarea 是 combobox；弹层 overlay-host + `fullscreen-sm`。默认过滤匹配 label 和 value。删除假 `--tiger-mentions-*`。
- **MaskInput**：chrome 与 Input 同层（clear 在内、error 在下，可同时有）。`/g` token 不跳字。`disabled` 时 hidden 不提交。读 FormItem；React `forwardRef`。Clear 走 `locale.input`。
- **InputOTP**：一个 Tab 停；方向键读 `dir`。多字只在第一格/autofill 时整段覆盖。读 FormItem；id/aria 在当前格。`pattern` 改 `inputMode`。
- **TagsInput**：一个 Tab 停（关闭钮 `tabIndex=-1`）。重复/满员留下 pending。粘贴先带上正在打的字。读 FormItem；id 在 textbox。`name` 每个 tag 一个 hidden。
- **Signature**：笔迹会话下沉 core（pointerId、一次 finish）。受控值是 SVG data URL 或 `''`，能回灌；光栅从离屏逻辑尺寸导出，不再吃显示 canvas 的 DPR。空签不发空白图。读 FormItem；画板是可聚焦 widget；Undo + locale；假 `--tiger-signature-*` 删掉。React `forwardRef` / Vue `expose({ focus, clear, undo, toDataURL, toSVG, isEmpty })`。
- **NumberKeyboard**：`applyNumberKeyboardKey` 一份。Confirm 的颜色单独解析，不再和普通键对打。假 `--tiger-number-keyboard-*` 删掉。组是一个 Tab 停，方向键和物理数字走同一份 apply。`open` 经 overlay-host 挂底栏。empty 是 spacer。读 FormItem。`phone`/`id-card` 写进 JSDoc。Confirm 走 `common.okText`。
- **ColorPicker / ColorSwatch**：HSV 在拖动期间当事实源，面板有 SV 平面和光谱色相轨；所有操作按 `format` emit（hex+alpha 用 8 位）。未选是 `undefined`，Clear 是 `''`。补 `defaultValue` / `open` / `placement`。预设复用 ColorSwatch。读 FormItem；trigger 是 native button；弹层 dialog + trap + `fullscreen-sm` + Done。假 `--tiger-colorpicker-*` / `--tiger-colorswatch-*` 删掉。方向键读 `dir` 并环绕。勾按亮度选 on-color。
- **CronEditor**：方言是 5 段数字 unix（0/7 周日，不认名字和 Quartz）。空值是 `''` 不是每分钟。段数不对时不把原文改写成 `* * * * *`。Custom 模式是状态。数字不每键 clamp。读 FormItem；出错写 `aria-invalid`。假 `--tiger-croneditor-*` / `--tiger-danger` 删掉。
- **TimePicker**：open / 草稿 / range 两步 / Now 下沉 core。列点不立刻 `onChange`，OK 才提交；空值是 `null`。`minTime="09:30"` 能选 09 再选 30。12 小时制小时列含 12；`parseTime` 认 `02:30 PM` / locale dayPeriod。locale 只收官方对象，13 套包带 `timePicker.period`。读 FormItem；打开不当 blur。弹层 dialog + trap + DatePicker 同一套 sheet 遮罩。按断点只挂桌面 listbox 或小屏原生 select。chrome 复用 Input。React `forwardRef` / Vue `expose({ focus, open, close })`。
- **Cascader**：open / 选中 path / 搜索 / 列焦点下沉 core。非受控 `defaultValue`，未选是 `undefined`。读 FormItem；combobox 在焦点节点上。列导航读 `dir`。`listHeight` 管每一列。小屏全屏有 Done。空态走 `empty.noResults`。React `forwardRef` / Vue `expose({ focus, open, close })`。
- **TreeSelect**：open / 选中 / 搜索 / expandedKeys 下沉 core，flatten 复用 `tree-utils`。下拉是 tree。键盘走 `getTreeKeyboardAction`（含 `dir`）。读 FormItem。多选 checkbox + `checkStrictly` / `checkStrategy`。空态走 `empty.noResults`。React `forwardRef` / Vue `expose({ focus, open, close })`。
- **AutoComplete**：`value` 只表示已提交值，输入框走 `searchValue`；打字不再每键 `onChange`。未选是 `undefined`，`''` 是合法值。补 `defaultValue` / `open` / `defaultOpen` / `onOpenChange`（Vue `v-model:open`）。失焦离开 input+listbox 关层。`allowFreeInput={false}` 只在点选、Enter 高亮或 blur 匹配成功时提交。读 FormItem；id/aria/`name` 在 combobox input。弹层复用 Select overlay（`fullscreen-sm`、host 链、`listHeight`）。空态走 `empty.noResults`。React `forwardRef` 到 input；Vue `expose({ focus, open, close, input })`。
- **Select**：open / 选中 / 搜索 / activeIndex 下沉 core。非受控 `defaultValue`，`open` 真受控。`''` 是合法值，未选是 `undefined` / `[]`。读 FormItem；combobox 语义在焦点节点上，选项走 `aria-activedescendant`。搜索即时、`onSearchChange` 才 debounce。虚拟列表把组头和选项放进同一窗口。`listHeight` 管面板。文案走 `locale.select`。React `forwardRef` / Vue `expose({ focus, open, close })`。
- **Input 族（Input / InputGroup / Textarea / InputNumber）**：React 把 ref 转到原生控件，Vue expose `focus`/`input`。`readOnly` 与 `readonly` 同一属性。clear 与密码钮并排，文案走 `locale.input`，点完还焦。error/count 不再把组接缝打到 `w-full` 空壳；组内 `flex-1 min-w-0`。InputGroup compact 复用 chrome 选择器（`data-tiger-chrome`），单直子保留四角；无名不加 `role="group"`；删除未实现的 `type`/`addonType`。Textarea 有 `status`/`errorMessage`、读 FormItem，autoResize 按 border-box 算高。InputNumber 步进用十进制整数加减；聚焦时保持裸数字；读 FormItem；步进钮 locale + Home/End；逻辑 padding。
- **Splitter**：`sizes` 按值受控（同一组百分数/像素的新数组不会把拖拽弹回）；未传或拿掉 `sizes` 停在最后比例。百分比和均分跟容器走（ResizeObserver）。水平指针和方向键读 `dir`，gutter 跟着指针。键盘也发 `resize-end`。gutter 是带 `aria-valuenow` 和 locale 名的 window splitter；命中区 24px。pane 数以摊平后的子节点为准。删除未实现的 `SplitterPaneConfig`。
- **Resizable**：从被抓的边改尺寸并平移原点（左/上不再往反方向长）。`lockAspectRatio` 按手柄选主轴，clamp 保比例。`axis` 不渲空操作手柄。角手柄不进 Tab。`width`/`height` 传入即受控；未传 default 时从 bounding box 起拖。手柄名走 `locale.resizable`。水平定位用逻辑 inset。
- **Carousel**：`infinite` 的 scroll 轨道用首尾 clone + 关 transition 瞬移，末张再 next 不再整段倒带。水平几何走逻辑方向（transform 符号、箭头 `start`/`end`、swipe 读 `dir`）。圆点是真 tab（`role="tab"` + `aria-selected` + 方向键，只有当前项进 Tab）。非当前页和 clone 同时 `inert` + `aria-hidden`。无名不是 landmark。开 autoplay 时有可聚焦暂停；hover/focus 暂停拆开；`autoplaySpeed<=0` 和 `prefers-reduced-motion` 都不自动播。手势只走 pointer（capture / cancel）。控件色走 surface/text token；`overflow-hidden` 只在视口。Vue 导出 `CarouselProps` / `CarouselMethods`。文案走 locale（含 `roleDescription` / 暂停），不再启发式「图片轮播」。
- **布局原语 B（Descriptions / List / ScrollArea / Masonry / PrintLayout）**：Descriptions 竖向也按 `column`/`span` 排格，冒号走 locale，标题绑表，列数跟容器。List 外框/分割线拆开，分页受控，拖拽用数据源下标和手柄，loading 不卸项，空态不是 live region。ScrollArea 滚轮落到视口、键盘滚动、逻辑横轴、双轴让角、不溢出不进 Tab。Masonry 跟容器宽、换列不卸子树、全 0 高度保持 round-robin。PrintLayout 写入 `@page`、屏幕看得见页眉页脚、断页节点打印仍在。
- **布局原语 A（Space / Divider / AspectRatio / Skeleton / Card）**：AspectRatio 根默认裁切媒体，不必调用方再写 `overflow-hidden`。Skeleton `wave` 真扫光并进 reduced-motion；默认尺寸走 class，用户 `style.height` / `h-*` 生效；`custom` 无默认几何。Card `hoverable` 不再假装按钮，`onClick`/`href` 才进 Tab；封面自己裁圆角，根不 `overflow-hidden`。竖 Divider 在默认 Space 里 `self-stretch`；gradient 吃 `color`/`thickness`。Vue Space/Divider 声明 `className`。
- **Layout 壳 + Grid**：有 Sidebar 直子（或 `hasSider` / `direction="horizontal"`）时根横排，嵌套内层不再贴一份 `min-h-screen`。`fullHeight` 才是视口壳，Content 吃剩余高度并自己滚。Header / Footer 未传 `height` 不写 inline；玻璃变体替换不透明底并 sticky。Sidebar 逻辑边框、`collapsedWidth="0px"` 时 inert 离 Tab，未传名走 locale，内层 Menu 跟随折叠。Content / Footer 有 `as`。Row 缝改为 CSS gap，数字 gutter 只开横缝；Col 传入 `flex` 即走 flex 项，`span={0}` 隐藏，offset 逻辑边。删除 `getGutterStyles` 与负 margin 链。Container `full` 与 `false` 分道，宽度读 `--tiger-breakpoint-*`。React 壳与栅格转发 ref。
- **Avatar / AvatarGroup**：`src` 变化清 error，不必换 `key`。图片名落在 `img alt`（`text` / `aria-label` 也算）。`onLoad` / `srcSet` 绑 img；React 转发根 span ref。未传 `bgColor` 且有 `text` 时 `generateAvatarColor` 同名同色（canonical token）。`#`/`rgb()`/`var()` 走 style。CJK 才双字，`José` 是 `J`。组叠缝逻辑 margin；`shape` 进 context；overflow `role="img"`；`max` 只计 Avatar；`max={0}` 无负边距。Vue 只摊 Fragment、丢掉 Comment。
- **Badge**：按 `type` 决议内容（text 不被 `max` 封顶；非法数字隐藏）。默认不是 live region。叠放 class/ref 在包装上，隐藏计数包装仍在。`right`/`left` 跟阅读方向。实心字混向 `--tiger-text` 过 AA。
- **Tag**：去掉 `role="status"`。关闭只通知父级，不内部隐藏；`visible={false}` 才不渲染。关闭名走 locale。React 转发 ref；关闭钮 `focus-visible`。`pill` 全圆角。尺寸读 `--tiger-component-tag-*`。浅底状态字混向 `--tiger-text` 过 AA。删除 `formatBadgeContent` / `shouldHideBadge`（改 `resolveBadgeContent`）。
- **ImagePreview / ImageViewer 一套全屏看图**：同一棵 overlay dialog（portal host 链、滚锁、焦点陷阱、Escape 栈、`OVERLAY_Z_INDEX.modal`）。ImageViewer 是配置别名（`minZoom`/`maxZoom` → `minScale`/`maxScale`，`onClose` 仍在关时触发）。指针手势一份（capture + document pointermove）；滚轮 `applyWheelZoom` 且 `{ passive: false }`。`currentIndex` 夹紧；空 `images` emit 关闭；切图/重开清变换；到头 disable 不循环。`images` 支持 `{ src, alt? }`；chrome 走 `locale.imageViewer`；导航/关闭用逻辑 inset。删除第二套 DOM、`ImagePreviewToolbarAction`、`clampZoom`、假 `--tiger-image-mask` token。
- **Image / ImageGroup**：默认 preview 是可聚焦 `<button>`，读屏名走 `locale.image`（不再写死 Preview image）。preview 开启时内层 img `alt=""`。`onLoad` / `srcSet` / `sizes` 落在 `<img>`，React `forwardRef` 指向 img。fallback 二次失败走 error 槽；加载中用 spinner 叠在 img 上，不再画损坏图标。`previewTrigger="hover"` 仍可用 focus 和 click。ImageGroup 按实例 id 登记（重复 src 合法），登记表走 state；`getImageGroupClasses` 合并而非替换；组 `preview={false}` 时子图不是按钮。
- **Marquee**：clone 同时 `inert` + `aria-hidden`，Tab 只落在第一份。无名默认不是 landmark（删硬编码 `Scrolling content` / `DEFAULT_MARQUEE_ARIA_LABEL`，短语在 `locale.marquee.ariaLabel`）。横向 `left`/`right` 走逻辑方向；纵向视口吃第一份，repeat 不再撑高。`repeat < 2`（含 0）静态一份；短内容不自动铺满。`pauseOnHover` 只管指针，焦点暂停是 `pauseOnFocus`（默认开）；受控 `paused`。style inject 以 DOM 节点为准，React `useLayoutEffect` / Vue `onMounted`。
- **排版 + Icon**：Icon fill 不再描边；SVG 构造与 1.5 线宽在 core。Link `_blank` 合并安全 rel、disabled 保留 href、静止态下划线。Text `align` 用 start/end，非法 tag 回退 `p`。Code 复制状态、live region、逻辑 end。Kbd 组合键可读名；Highlight 保树，`global={false}` 是每个 keyword 一次。
- **Button / ButtonGroup**：变体 class 只在 core `resolveButtonClasses` 决议，非法 variant 回退 primary；实心字走 on-color，键盘环只留 `focus-visible`。`htmlType` 与原生 `type` 同一属性（冲突时 htmlType 胜出）；React 转发 button ref。loading 不再设原生 `disabled`（可聚焦、`aria-busy`、吞掉 click）。图标按 `iconPosition` 改 DOM 顺序。组圆角 `first-child:not(:last-child)` + 逻辑属性，InputGroup compact 共用 `getJoinedGroupItemClasses`；直子必须是 Button。
- **Form 一份引擎 + FormItem 接管显示**：校验、依赖重验、debounce、history 收成 `createFormEngine`；Vue/React `<Form>` 与 `useFormController` 共用。`<Form controller={ctrl}>` 真的绑同一份值。`setValueByPath` 与 get 成对；`fieldDependencies` 收 `Map | Record`。`undoable` 每次提交自动 snapshot，history 深拷贝。隐藏/禁用字段清 error 仍拓扑重验；环 visited 切断。`type: 'number'` 拒绝 boolean/array；`Invalid Date` 失败；`/g` 不再吃 lastIndex。debounce `cancel()` 改为 reject。FormItem 注入 `value`/`modelValue` + change，不绑 Input 时 `resetFields` 仍清空。错误只从 FormItem 出；`inlineMessage={false}` 关行内红字。`<form noValidate>`、`aria-busy`、`fieldset disabled`、提交失败 focus 第一项 invalid。`labelPosition` 默认 `'left'`（label 在控件前）；`'right'` 把 label 放到控件后。删死 `dynamicFields`。根入口导出 `useFormItemControlContext` / `FORM_ITEM_CONTROL_INJECTION_KEY`。
- **指针会话 + 列表拖拽原语**：`createDocumentDragSession` 改为 pointer（含 cancel / Escape / 阈值 / 锁轴 / capture）。Splitter、Resizable、ScrollArea、Modal 共用这一份，不再手写 `mousemove`。List / Tree / FileManager / `useDrag` 共用 `createListReorderController`（`setData`、项上 drop、跨容器共享会话）。删除未实现的 `ghostClass` / `scrollSpeed` / `scrollMargin` 和 `applyFileDragReorder`；越界 `moveItemBetweenContainers` 返回 `null`。子路径 `./useDrag`。
- **`useControlledState`**：options 对象（`value` / `defaultValue` / `onChange` / `postState`）。同拍 updater 累加；同值不发 `onChange`；受控切省略保留最后展示值。`undefined` 非受控，`null` 合法空。Vue `modelValue` 默认改为 `undefined`。根入口导出 `SetControlledState` / `UseControlledStateOptions`，子路径 `./useControlledState`。
- **Overlay 基础设施**：Vue `placement` / `offset` 打开后仍跟 props。Portal 目标链为最近 overlay-host → ConfigProvider 根 → `document.body`；body portal 也包 layer+host。一份 focus trap（空列表仍拦 Tab）+ 全屏 `inert`。ID 可重置或走 `useId`。scroll lock 按 Document 并补偿滚动条。`OVERLAY_Z_INDEX` 一层尺度（viewport < overlay < modal < message < loading-bar）。删除未使用的 `applyFloatingStyles`；Vue `useFloatingPopup` 与 React 对齐为 `usePopup`。
- **ConfigProvider 文档所有权**：`TigerConfig` 与方向决议下沉 core（显式 `direction` → 本层 locale.direction → 按本层 locale id 推断 → 父级）。只有最外层仍挂着的 ConfigProvider 写 `html` 的 `dir` / `lang` / 主题；内层只改 context；卸载 restore 含停掉 `colorScheme="auto"` 的 media 监听。React 在 render / `useLayoutEffect` 对齐 Vue immediate。失败暴露 `localeLoadError`。`theme="modern"` 与 F-001 开关等价。
- **Locale / i18n 一条事实源**：内置 13 套语言包都是与 en-US 同叶子的完整对象，不再经 `defineLocale` 用英文填洞。`get*Labels` 只读 `overrides ?? locale.section ?? en-US`，禁止 `startsWith('zh')` / 中文句子启发式；zh-TW 缺键不再灌简体。`mergeTigerLocale` 与 `TIGER_LOCALE_KEYS` 从 `TigerLocale` 对齐（含 `dataExport`），`undefined` 不擦基值。`createTigerLocaleScope` 下沉 core，Node 默认不装进程全局栈。删除成对 `DEFAULT_*` / `ZH_CN_*` 文案常量；Rate `{plural}` 走 `Intl.PluralRules`。`common` 增补 `closeMessageAriaLabel` / `closeNotificationAriaLabel`。
- **Theme / tokens 一条事实源**：`tokens.json` 生成 default 预设与组件正在读的 `--tiger-*` 别名（primary 统一为 `#2563eb`）。`ThemeManager` 按类型注释 merge default 段，切 dark 不再丢掉 radius/motion。Tailwind plugin 写入完整预设（含非颜色）。`setTheme('modern')` 与 `@plugin ".../tailwind/modern"` 是同一开关。运动只留 `--tiger-transition-*` / `--tiger-motion-duration-*`。新增 on-color 与 error hover token；删从未写入的 `--tiger-tag-*` / `--tiger-alert-*` 假名。内置主题改为 `registerBuiltInThemes()` / ThemeManager 惰性注册。生成物不再包含 `tailwind-tokens.js`。

## v2.1.2

v2.1.2 patch：下游 Tigercat_Admin 上游建议 4–6 的 locale/labels 补齐（ColorPicker、Select、富文本/Markdown 工具条）。本版本无 breaking change。建议 1–3（Notification `actions`、BackTop `position`、FloatButton `floating`）已在 v2.1.0 / v2.1.1 落地。

- **同步 `.size-limit.json` 预算（v2.1.2 实测）**：`Core (full)` 140→142 kB（实测 141.01）、`Vue (full)` 315→316 kB（实测 315.55）、`React (full)` 351→352 kB（实测 351.52）、`Core locale (zh-CN)` 4→5 kB（实测 4.03）；若干含子路径因 locale-utils 增补略超，一并按实测上调。
- **ColorPicker `labels` / locale（触发器 / 面板标题 / 清空）**：Vue / React 经 `getColorPickerLabels` + ConfigProvider locale 解析触发器 `aria-label`/`title`、面板标题、清空钮以及 Hue / Alpha / 色值 / 预览 / 预设 chrome。无 locale 回落英文 `Pick color` / `Color` / `Clear`；`locale=zh-CN` 为「选择颜色 / 颜色 / 清空」。可选 `labels` 覆盖。清空发出空字符串。13 套内置 locale 增补 `colorPicker` 分区。公开 API 增补，无新必填 prop。
- **Select locale `placeholder` / `emptyText`**：`TigerLocaleSelect` 增补占位与空选项文案键。未传 `placeholder` / `emptyText` 时走 ConfigProvider locale；无 locale 仍为 `Select an option` / `No options found`；`locale=zh-CN` 为「请选择 / 暂无选项」。显式 prop 与 `labels` 仍优先。13 套内置 locale 同步。公开 API 增补，无新必填 prop。
- **RichTextEditor / MarkdownEditor 工具条 labels**：内置工具条 Bold / Italic / 标题 / 列表等走 `getRichTextEditorLabels` / `getMarkdownEditorLabels`。无 locale 仍为英文；`locale=zh-CN` 为「加粗 / 斜体」等。自定义 `toolbar` 仍用调用方文案；可选 `labels` 覆盖。公开 API 增补，无新必填 prop。

## v2.1.1

v2.1.1 patch：v2.1.0 之后的 Pages + source 审查修复（暗色 chrome、受控绑定、overlay 视口、无障碍/行为修复）。本版本无 breaking change。

- **同步 `.size-limit.json` 预算（v2.1.1 实测）**：`Core (full)` 136→140 kB（实测 139.79）、`Vue (full)` 308→315 kB（实测 314.74）、`React (full)` 344→351 kB（实测 350.67）、`React Menu` 33→34 kB（实测 33.14）。
- **Tooltip / Popover hover 关层加 delay，指针可移入浮层**：默认 hover 的 Tooltip 与 `trigger="hover"` 的 Popover（Vue/React）离开 trigger 后延迟 100ms 再关，并把 trigger + Teleport/portal 浮层当作同一 hover 组；指针穿过默认 8px 间隙进入浮层会取消关闭。Click / Esc / focus / manual 仍立即开关。公开行为修复。无新必填 prop。
- **CommentThread 内部 liked/likes overlay**：裸 CommentThread（Pages `/comment-thread` 01，无 `@like` / `onLike`）点「点赞 3」变为「已赞 4」/ Like 3 → Liked 4，仍发出 `like` / `onLike`，不改 `nodes`。绑定示例 02 的父级回写仍可用且不重复计数。Vue/React。公开行为修复。无新必填 prop。
- **RadarChart splitArea 不再用 `var(--tiger-bg,#fff)` 挖洞**：内外环改成 evenodd 透明环路径（`createPolygonRingPath` / `createCircleRingPath`），暗色页不再露出白/薄荷盘。默认 `RADAR_SPLIT_AREA_COLORS` 不再用 `rgba(0,0,0,0.02/0.05)`，改走 `color-mix` + `--tiger-text`（可选 `--tiger-chart-split-*` 覆写），暗色跟主题。Vue/React。公开视觉修复。无新必填 prop。自定义 `splitAreaColors` 未改。
- **Splitter gutter chrome 走 token，`gutterSize` 接到视觉宽度**：gutter 不再硬编码 `bg-gray-200`，把手不再硬编码 `bg-gray-400`，改走已注册 `--tiger-border` / `--tiger-text-muted`。公开 `gutterSize`（默认仍 4）写入 `--tiger-splitter-gutter`，水平 gutter 宽 / 垂直 gutter 高跟随该值，不再锁死未赋值的 `4px` fallback。Vue/React。公开视觉 + 行为修复。无新必填 prop。受控 `sizes` 覆盖拖拽未改。
- **Upload drag 模式尊重默认插槽 / children**：`drag` 为 true 且提供默认插槽 / children 时，拖拽区内只渲染该内容（Pages `/upload` 02「点击或拖拽文档到此处」可见），不再叠 locale「Click to upload / or drag and drop」；无插槽时仍回落 SVG + locale 提示 + accept/maxSize。拖拽区 / 上传按钮 chrome 不再硬编码 `bg-white` / `border-gray-300`，改走已注册 `--tiger-surface` / `--tiger-border`。Vue/React。公开行为 + 视觉修复。无新必填 prop。未绘制 `file.progress` 进度条。
- **Code copy / copied / failed 走 `getCodeLabels`，剪贴板失败可见**：无 locale 回落英文 Copy / Copied / Copy failed；zh-CN / ConfigProvider zhCN 仍为「复制 / 已复制 / 复制失败」。剪贴板失败显示 failed 态（error token + Copy failed），不再停在 idle 也不看起来像成功；成功仍只在写入成功时发 `copy` / `onCopy`。显式 `copyLabel` / `copiedLabel` / `copyFailedLabel` 仍优先。Vue/React。公开行为修复。无新必填 prop。
- **Pagination `showTotal` 默认文案走 `getPaginationLabels` / `formatPaginationTotal`**：未传自定义 `totalText` 时始终格式化 `labels.totalText`，不再在无 `locale.pagination.totalText` 块时回落硬编码中文 `defaultTotalText`。无 locale 回落英文 `Total N items`；zh-CN / ConfigProvider zhCN 仍为「共 N 条」；自定义 `totalText` 函数仍优先。`defaultTotalText` 改为英文 DEFAULT 模板。Vue/React。公开行为修复。无新必填 prop。
- **FormWizard clickable clicks resolve via findNextUnskippedStep so skipCondition/disabled cannot be landed on**：`handleStepChange` 与 Next/Prev 一样走 `findNextUnskippedStep`（从被点索引沿方向走），不再只拦 `disabled` 后直接落地。Vue/React。公开行为修复。无新 prop。
- **ChatWindow / CommentThread / ActivityFeed / NotificationCenter 默认文案走 ConfigProvider locale**：与 FormWizard / TaskBoard 相同，经 `mergeTigerLocale` + `getXxxLabels` + `resolveLocaleText` 解析；可选 `locale` / `labels` 覆盖。无 locale 时回落英文（Send / Like / No activity / Mark all as read）。zh-CN 仍为原来的中文（发送 / 点赞 / 暂无动态 / 全部标记已读）。Pages Lang=English 时 Chat 发送钮不再停在中文。既有 string props 仍优先。Vue/React。公开 API 增补 + 行为修复。无新必填 prop。
- **Chart `responsive` 观察父级后重算 plot scale / innerRect**：Bar / Line / Area / Scatter 用 ChartCanvas 解析后的宽高（ResizeObserver + rAF）重建 band/point/linear scale 与网格/轴，而不只是拉大 SVG `width`/`height`/`viewBox`。Pages `/bar-chart` 01 不再把 420×240 的柱子留在约 926×688 SVG 的左上角。自定义 `xScale`/`yScale` 仍按传入 range 使用。ChartCanvas 通过 React `onResolvedSizeChange` / Vue `resolved-size-change` 报告解析尺寸。`responsive` 默认仍为 false；观察前仍用 `width`/`height` fallback。Vue/React。公开行为修复。无新必填 prop。
- **Chart `showTooltip` 默认悬停出框，不再要求 `hoverable`**：`showTooltip`（默认 true）悬停数据点即打开 ChartTooltip；`hoverable`（默认仍 false）只控制高亮 / 透明度 / 公开 hover 事件。`showTooltip={false}` 仍不出现浮层。Pages `/bar-chart` 02、`/heatmap-chart` 02 悬停可见 `A: 10` / 格值框。Vue/React。公开行为修复。无新公开 prop。`responsive` / tooltip chrome 未改。
- **Gantt 拖条改 `start`/`end`（保时长、本地日吸附、夹到 min/max）**：非 disabled 条 pointer 拖动；松手按像素换算日期（`ganttPxToMs` / `shiftGanttTaskDates` / `moveGanttTaskByPx`）。Vue `update:data` + `task-change`；React `onDataChange` + `onTaskChange`。未回写的 `data`（Pages `/gantt` 01/02 静态数组）用内部 overlay 保住新日期，条 `x` 会动。零位移仍走原 click/select。无新 `draggable` prop。行斑马/轴文案未改（A0 已把 `--tiger-fill` / `--tiger-text-muted` 别名到 surface-muted / text-secondary）。Vue/React。公开 API 增补 + 行为修复。
- **Table 排序键盘可达，`sortData` / `filterTableData` 读 `dataKey`**：可排序表头改为真实 `<button type="button">`（`data-tiger-table-sort`，Tab/Enter/Space），`aria-sort` 仍在 `<th>`；`sortData`（可选第 5 参 `columns`）与 `filterTableData` 按 `dataKey` 否则 `key` 取值，对齐单元格/导出。Vue/React。公开行为修复。无新公开 Table prop。
- **Tour 有 target 时点遮罩可关，Vue 最后一步也发 `close`**：dimmed mask 改为全屏可点节点（`data-tiger-tour-mask`）并用 clip-path 挖洞露出 target，不再靠 `pointer-events:none` 的 box-shadow spotlight；无 target 的 fallback 与 `step.mask === false` 不变。Vue 最后一步 Finish 在 `finish` 之外兼发 `close`（对齐 React `onClose`）。Vue/React。公开行为修复。无新公开 prop。
- **Cascader / TreeSelect 非虚拟列表键盘选值，清空钮为 trigger 兄弟**：打开后面板 Arrow/Enter（及 Space）可移动并提交当前项；清空控件改为 combobox trigger 的兄弟 `<button>`（`data-tiger-cascader-clear` / `data-tiger-treeselect-clear`，对齐 Select）。Vue/React。公开无障碍/行为修复。无新公开 prop。
- **`parseDate` 将 `YYYY-MM-DD` 按本地日历日解析**：date-only ISO（可带首尾空白）用本地 `Date(year, monthIndex, day)` 午夜，不再走 `new Date(string)` 的 UTC 午夜；西时区下 DatePicker min/max/value 字符串与 Calendar/DatePicker 键盘 `data-date` 不再少一天。非法日历日（`2024-02-30`、非闰年 `02-29`）返回 null。Vue/React 消费共享 helper。公开行为修复。无新公开 prop。
- **Collapse 折叠面板 `inert` + `aria-hidden`，extra 点击不再切换**：折叠态内容包装层（`data-tiger-collapse-content`）带 HTML `inert` 与 `aria-hidden="true"`，关闭面板正文离开 a11y / 焦点树；展开时两者都不写。header 内 extra（Pages `/collapse` 03「已更新」）点击 `stopPropagation`，不再切换面板。Vue/React。公开无障碍/行为修复。无新公开 prop。
- **Menu 默认 `theme="light"` 跟随 `html.dark`**：不再把 `--tiger-surface`（及 `--tiger-text` / `--tiger-text-muted` / `--tiger-border` / `--tiger-surface-muted`）锁成浅色 hex；默认继承页面 token。Pages `/menu` 01/03 暗色跟 surface。显式 `theme="dark"` 仍强制深色 chrome。Vue/React 消费 core helpers。公开视觉/主题 chrome 修复。无新公开 prop。
- **Message / Alert 暗色 chrome 跟 surface + status**：info/success/warning/error 的 bg fallback 改为已注册 `--tiger-surface`，字/图标走已注册 `--tiger-info` / `--tiger-success` / `--tiger-warning` / `--tiger-error`（或 `--tiger-text`），边框走 `--tiger-border`；Alert description 走 `--tiger-text-secondary`，关闭钮 hover 走 `--tiger-surface-muted`。暗色 Pages `/message` / `/alert` 不再锁浅粉彩卡片。可选 `--tiger-message-*` / `--tiger-alert-*` 仍只作一层覆写，不注册进 `THEME_CSS_VARS`。Vue/React 消费 core maps。公开视觉/主题 chrome 修复。无新公开 prop。
- **Pages overlay 示例 iframe 加高**：DatePicker / TimePicker / Cascader、Tour、Loading 区域+全屏、Spotlight / Dropdown、CropUpload 的 Vue / React `demo.json` 把 `viewport.minHeight` 提到 560；Modal / Drawer 提到 720（仍 `mode: auto`，不设冻结 `height`），弹出日历 / 级联列 / 对话框 / 抽屉 / 引导 / Spotlight / 裁剪 Modal 不再困在 120–180px iframe 里。loading/01 内联、loading-bar / message / notification、DemoBlock chrome、sandbox `allow-same-origin`、srcdoc `dark:` 未改。仅示例 / Pages 视觉修复。无公开组件 API 变化，无主题变量变化。
- **ImagePreview 预览图 90vh/90vw 约束，Pages 预览 iframe 加高**：Vue / React 预览 `<img>` 由 `max-w-none` 改为 `max-h-[90vh] max-w-[90vw]`，组图/独立预览不再被裁成无限宽横条。Pages `/image` ImageGroup / ImagePreview 与 `/image-viewer` 示例把 `viewport.minHeight` 提到 560（仍 `mode: auto`，不设冻结 `height`），iframe 底足以放下该 90vh 盒。ImageViewer img 类本就有该约束；工具条未改。公开视觉修复。无主题变量变化，无新公开 prop。
- **SunburstChart `showLabels` 在弧中点绘制标签**：Vue / React 默认 `showLabels`（true）在每段弧的 `midAngle` 与环中径处绘制 SVG `<text>`，Pages `/sunburst-chart` 外环可见中国/日本/印度等子层名称，不再只有 path。React 不再把 prop 绑成 `_showLabels`。`showLabels={false}` 仍无文字。公开行为修复（死 API 现已生效）。无主题变量变化，无新公开 prop。
- **React Table `virtual` / `autoVirtual` 滚动盒对齐 Vue**：`height` + `overflow:auto` 只包表体（colgroup/header/body/summary），导出钮与 Pagination 留在外层 wrapper、不进滚动盒。公开行为修复。无主题变量变化，无新公开 prop。
- **FloatButton 默认 plus 图标与 Group placement/offset/portal**：无 children / 默认插槽时渲染 plus SVG。FloatButton.Group 接受 `placement` / `offset`（与独立 FloatButton / BackTop 同一套 viewport helpers，默认 `bottom-right` / 24）以及 `portal`（默认 true；`false` 时就地 `absolute` 定位，相对祖先可装下）。Pages `/float-button`「悬浮按钮组」留在 `h-56` 盒内，空圆/空方不再无图标。公开 API 增补 + 行为修复。无主题变量变化。
- **Anchor / ScrollSpy 当前项按 offset 线取最后一项**：Vue / React 的 active href 是文档序中最后一个 section top 位于 offset 线（`rootTop + offsetTop/targetOffset + bounds`，默认 5）之上或正好压线的项，不再取顶部 40% 带里第一个相交项。点击后锁住当前项直到程序化滚动结束（`scrollend`，否则 scroll idle + 安全超时）。公开 `bounds` 接到 IntersectionObserver 路径。Pages `/anchor`「容器滚动」点「发布」与 `/scroll-spy` 末项保持高亮。公开行为修复。无主题变量变化，无新公开 prop。
- **DropdownItem `closeOnClick`**：Vue / React 的 DropdownItem 现接受可选 `closeOnClick`（Vue `:close-on-click`）。设置后覆盖父级 Dropdown `closeOnClick`；省略则继承父级（默认 true）。Vue 示例 02「保持展开」现在保持展开；React 示例 02 对齐为同一 item 级 API。公开 API 增补。无主题变量变化。
- **Affix `offsetBottom` 相对 target 容器底钉住**：Vue / React 经 core `calculateAffixState` 把已固定的 `bottom` 写成 `innerHeight - containerRect.bottom + offset`，钉在 `target` 容器底边上方 `offset` px，不再钉视口/iframe 底。Window target 时 `containerRect.bottom === innerHeight`，`bottom` 仍是 `${offset}px`。`offsetBottom` 的 sentinel 放在内容底（affixed 时在 placeholder 后）。公开行为修复。无主题变量变化，无新 prop。
- **Vue Radio group `disabled` 继承**：Vue Radio 将 `disabled` 视为 true 或继承 RadioGroup `disabled`（OR，对齐 Checkbox）。Boolean 省略是 `false`，旧的 `!== undefined` 永不继承 group，radio 仍可聚焦而 group onChange 会 bail。React 本就正确继承，未改。公开行为/无障碍修复。无主题变量变化，无新 prop。
- **InputNumber leftover attrs 落到 spinbutton**：Vue / React 把未声明的 HTML attrs（`aria-label`、`data-*` 等）转发到 `role="spinbutton"` 的 input 上。Vue `inheritAttrs:false` 原先只把 `class` 合到 wrapper；React 丢掉未声明 attrs。`class` / `className` 仍作用在 wrapper。公开无障碍/属性转发修复。React props 类型放宽为可接受原生 input 属性（`size`/`value`/`onChange`/`min`/`max`/`step` 等已 Omit）。无主题变量变化，无新具名 prop。
- **MaskInput `name` 提交 raw**：Vue / React 在设置 `name` 时渲染隐藏 input 提交 raw 值，可见框只展示掩码且不带 `name`，原生 form 提交 `12345678` 而不是 `12/34/5678`。公开行为修复，对齐既有 `name` JSDoc；无主题变量变化，无新公开 prop。
- **Signature 拖出垫面结束笔画**：Vue / React 在 pointerdown 时对 canvas 调用 `setPointerCapture`，并在 `lostpointercapture` 与 document `pointerup`/`pointercancel` 上走同一条 `finishStroke`，拖出垫面不再把 `activeStroke` 卡住。公开行为修复，无主题变量变化，无新公开 prop。
- **Input `errorMessage` 移到字段下方**：Vue / React 不再用 `absolute inset-y-0 right-0` 把错误文案叠在值区里；错误节点作为 chrome 边框盒的兄弟（`w-full` 外壳内，顺序为 error 再 count）渲染在字段下方，并带 `aria-live="polite"`，输入框仍用 `aria-describedby` 指向该节点。Clear / 密码显隐 / suffix 在有错误时仍可用。MaskInput 共用 `getInputErrorClasses`，错误节点同样改为块级并加 `aria-live`。公开视觉/无障碍修复，无主题变量变化，无新公开 prop。
- **InputGroup compact 拼合 Input/Textarea**：Vue / React 经 core 类串把 compact 从 `[&>*:focus]` 改为 `[&>*:focus-within]`，并用 `!rounded-*` 压过 token 半径。Input 把边框/圆角/表面/状态边框/`focus-within` 焦点环提到现有 wrapper（原生 input 为无边框字段）；Textarea 在无 `showCount` 时以 textarea 自身为根（字数仍在边框盒外）。Pages `/input-group` 01 的 Input+Button 不再各自胶囊。InputNumber 根本就是边框盒，未改。公开视觉/行为修复，无主题变量变化，无新公开 prop。
- **Vue Input `clearable` + `showPassword` 双钮错开**：Vue 两钮同时可见时清除钮左移一档图标槽（`right-8`/`right-10`/`right-12`），密码显隐仍在 `right-0`，字段改用双槽 `pr-16`/`pr-20`/`pr-24`，不再叠在同一像素。仅单钮时仍 `right-0` + 一档 `pr-*`。React 本就只渲染一个（clear 优先），未改。公开视觉/行为修复，无主题变量变化，无新公开 prop。
- **TaskBoard 过滤下落点映射回源列**：Vue / React 在 `moveCard` 前把 `filterText` 可见卡的 drop index 映射回未过滤列（core `mapVisibleCardIndexToSource`）；Pages `/task-board` 02「列拖拽与自定义卡片」过滤「发布」后再拖到可见末位，不再插进隐藏卡槽。`getDropIndex` 仍读可见卡 rect（指示条位置不变）。公开行为修复，无主题变量变化，无新公开 TaskBoard prop；core 增补该 helper。
- **Vue ChatWindow 去掉 onUpdated 滚底**：auto-scroll 只跟 `messages.length`（加首次 `onMounted`），用户离开底部后跳过；受控 `v-model` 逐字输入不再把 Pages `/chat-window` 02 历史拽回最新气泡。React 本就只跟 `messages.length`。公开行为修复，无主题变量变化，无新公开 prop。
- **ScatterChart `animated` 非 circle 入场保留 translate(cx,cy)**：Vue / React 把 square / triangle / diamond 的 `translate(cx,cy)` 放在包裹 `<g>` 上，入场 CSS `transform:scale()` 只作用在内部 `<path>`（路径以 (0,0) 为中心），不再覆盖 SVG 位移。Pages `/scatter-chart` 01 菱形停在数据映射位置，不再堆在绘图区左上；circle 仍用 `cx`/`cy` 入场。公开视觉/行为修复，无主题变量变化，无新公开 prop。
- **OrgChart `direction=horizontal` 保持 nodeWidth × nodeHeight**：Vue / React 经 core `flipLayoutNode` 横向布局只交换 x/y，节点盒保持 `nodeWidth` × `nodeHeight`（默认 160×72），不再把卡片拧成 72×160 竖条。Pages `/org-chart`「组合展示」横卡可完整显示姓名与职称。公开视觉/行为修复，无主题变量变化，无新公开 prop。
- **Calendar 年视图月份芯片 emit 该月 1 日并按 disabledDate 禁月**：Vue / React `mode="year"` 点击（及 Enter/Space）月份芯片会通过 `update:modelValue` / `change` / `onChange` 写出该月 1 日（本地 Date），并仍发出 `panel-change` / `onPanelChange`。`disabledDate` 在该月每一天都被禁时禁用该芯片（周末-only 不会禁任何月）。示例 02 改为全屏月视图以展示周末禁日。Pages `/calendar` 禁用日期块可见周六/周日不可选。公开行为修复，无主题变量变化，无新公开 prop。
- **Splitter `sizes` 解析与初始化 min**：Vue / React 的 `sizes` 现接受像素数字与 `'30%'` / `'200px'` 字符串（经 core `parsePaneSize` / `calculateInitialSizes`）；挂载时对每格 `clampPaneSize(min, max)`，`[30,70]` + `min={100}` 不再是 30px 细条，首次拖拽也不会塌成 `[0,100]`。示例 01–03 改为百分比字符串。Pages `/splitter` 水平/垂直/嵌套展示比例。公开 API 放宽 + 行为修复，无主题变量变化。
- **ColorPicker rgba/hsla 解析与 showAlpha emit**：`parseColorInput` 现接受 `rgba`/`hsla`（及 `hsl`）；Vue / React 用解析后的 RGB+alpha 画触发色块，不再把 rgba 交给 `hexToRgb`。`showAlpha` 滑条会发出带 alpha 的字符串（`update:modelValue` / `onChange`）。Pages `/color-picker`「代表配置」不再是黑块。公开行为修复，无主题变量变化。
- **ImagePreview maskClosable 暗区关闭**：Vue / React 把关闭绑到独立 mask 子节点（`imagePreviewMaskClasses` / `aria-hidden`），点击暗区发出 `update:open` false / `onOpenChange(false)`；独立 mask 不再吞掉点击。`maskClosable={false}` 仍不关。Pages `/image` ImageGroup / ImagePreview 暗区可关闭。公开行为修复，无主题变量变化，无新公开 prop。
- **QRCode 移除未使用的 level**：Vue / React / core 去掉未使用的 `level` prop 与 `QRCodeLevel` 类型；剩余 QRCode 是装饰性哈希矩阵（不可扫描）；Pages `/qrcode` 不再宣传 L/M/Q/H 纠错级别。移除从未生效的死 API，调用方若传 `level` 会被忽略，无主题变量变化。
- **Avatar getInitials 短 token 原样显示**：Vue / React 经 core `getInitials` 对无空格且长度 ≤2 的 `text` 原样（再 `toUpperCase`）显示，`text="TC"` 不再只剩 **T**。Pages `/avatar`「代表外观」方块 logo 与示例一致。公开视觉/行为修复，无主题变量变化。
- **Rate 半星左半裁剪**：Vue / React 半星层保持 `overflow-hidden` 宽 50%，内部 glyph 使用 `w-[200%] h-full`（core `rateHalfStarInnerClasses`），裁出满宽星的左半而不是把 SVG 压进半宽盒。Pages `/rate` 只读 4.5 第 5 颗星不再变瘦。公开视觉/行为修复，无主题变量变化。
- **ButtonGroup 子按钮组选择器**：Vue / React 经 core `buttonGroupItemClasses` / `buttonGroupItemVerticalClasses` 把组根上的 `[&:first-child]` 自选择器改为 `[&>*:first-child]` / last / middle（对齐 InputGroup compact），并用 `!` 覆盖 Button 的 `rounded-[var(--tiger-radius-md)]`，相邻按钮共享直边与 `-ml-px` / `-mt-px` 叠缝，不再各自胶囊。公开视觉/行为修复，无主题变量变化。
- **TaskBoard / Kanban 无 handler 时插入默认卡片**：Vue / React 在 `allowAddCard` 开启且调用方未传 `onCardAdd` / `@card-add` 时插入默认卡并回写 columns（内部态 + `update:columns` / `onColumnsChange`），Pages `/kanban` 01 由 3 张变为 4 张；已提供 handler 时仍由调用方插入（task-board/01 不变）。公开行为修复，无主题变量变化。
- **FileManager 非受控 selectedKeys 内部态**：Vue / React 通过 `defaultSelectedKeys` 保留非受控选择，裸 FileManager（Pages 01）点击会更新 `aria-selected`；只有显式传入 `selectedKeys` 才受控。公开 API 增补，无主题变量变化。
- **Table 默认分页非受控**：Vue / React 默认 pagination 改用 `defaultCurrent` / `defaultPageSize`，裸表（不传 pagination）点 Next 会换行；只有调用方显式传 `current`（及 `pageSize`）才受控。公开行为修复，无主题变量变化。
- **React Upload 受控 fileList 进度回写**：受控时 `customRequest` 的 progress/success/error 经 `notify` 以新数组调用 `onChange(file, nextList)`，Pages `/upload` 自定义上传能绘成功态。Vue 已 `emit('update:file-list')`。公开行为修复，无主题变量变化。
- **React FormItem change 校验先 updateValue**：change 触发 `validateField` 前先把子控件新值写入 `formValuesRef`，同拍读到新值，必填错误不再在第一字后残留。Vue 不变。公开行为修复，无主题变量变化。
- **AutoComplete 受控回写显示 option.label**：Vue / React 在 `searchValue` 未受控时，用 core `resolveAutoCompleteDisplayValue` 把匹配选项的 `label` 同步进输入框，不再把 raw `value` 盖上去；`label !== value`（如 `北京 Beijing` / `beijing`）选中后仍显示 label。`modelValue` / `value` / `onChange` 仍使用 `option.value`。公开行为修复，无主题变量变化。
- **Vue Transfer 兼发 `update:targetKeys`**：`moveRight` / `moveLeft` 同时发出 `update:modelValue` 与 `update:targetKeys`，Pages/示例里的 `v-model:target-keys` 不再停在初始目标项；默认 `v-model` / `update:modelValue` 保持不变。公开 API 增补，无主题变量变化。
- **Switch / Stepper / ColorSwatch 非受控内部态**：两端 Switch、Stepper 与 Vue ColorSwatch 通过 `defaultValue` / `defaultChecked` 保留非受控内部状态，点击后即使父级不回写也会更新 UI；受控 `v-model` / `checked` / `value` 仍可用。公开 API 增补，无主题变量变化。
- **Vue Slider 支持默认 v-model**：同时接受 `modelValue` 并兼发 `update:modelValue`，Pages/示例里的 `<Slider v-model>` 不再停在 min；原有 `v-model:value` / `update:value` 保持不变。公开 API 增补，无主题变量变化。
- **ImageViewer 亮色工具条/导航白底白字**：工具条、左右导航与计数去掉已注册 `--tiger-surface`，改走未注册 `--tiger-image-toolbar-bg` 并以 `rgba(0,0,0,0.6)` 为 last-resort，与 ImagePreview 深色半透明 chrome 对齐。不注册进 `THEME_CSS_VARS`。
- **VirtualList 示例暗色斑马**：virtual-list/01 偶数行去掉锁死的 `bg-gray-50`，改走已注册 `--tiger-surface-muted`，避免暗色页白条浅字。可选 `--tiger-virtuallist-stripe` 为一层覆写，不注册进 `THEME_CSS_VARS`。
- **FileManager / Markdown / RTE / Print / ImageAnnotation 暗色 chrome**：FileManager 容器/加载/搜索、Markdown 容器/正文、RTE 容器 fallback 改为已注册 `--tiger-surface`，工具条走 `--tiger-surface-muted`；Print 纸面保持 `bg-white` 并强制深色墨；ImageAnnotation 未选工具钮 bg/text 成对走 `--tiger-surface` / `--tiger-text`，hover 走 `--tiger-surface-muted`。可选 `--tiger-file-manager-*` / `--tiger-md-*` / `--tiger-rte-*` / `--tiger-print-ink` / `--tiger-annotation-tool-*` 为一层覆写，不注册进 `THEME_CSS_VARS`。
- **OrgChart 暗色节点填色 / 职称**：节点 fill fallback 改为已注册 `--tiger-surface`，职称与副标题走 `--tiger-text-secondary`，姓名保持 `--tiger-text`，避免暗色页白卡浅字。可选 `--tiger-org-node-bg` / `--tiger-org-label` / `--tiger-org-title` / `--tiger-org-subtitle` 为一层覆写，不注册进 `THEME_CSS_VARS`。
- **Tree 暗色白底 chrome**：根背景 fallback 改为已注册 `--tiger-surface` 并继承 `--tiger-text`，节点 hover 走 `--tiger-surface-muted`，空态/连线走 `--tiger-text-secondary` / `--tiger-border`，避免暗色页白卡白字。可选 `--tiger-tree-bg` / `--tiger-tree-node-hover` 为一层覆写，不注册进 `THEME_CSS_VARS`。
- **Layout Content / Container 示例暗色白底**：Content 默认背景 fallback 改为已注册 `--tiger-surface-muted`，layout/01 Container 与 layout/02 Content 去掉锁死的 `bg-white` / `!bg-white`，避免暗色页白底白字。可选 `--tiger-layout-content-bg` 为一层覆写，不注册进 `THEME_CSS_VARS`。
- **Skeleton 暗色占位条**：条背景 fallback 改为已注册 `--tiger-surface-muted`，wave from/to 同一链，via 走 `--tiger-border`，避免暗色页上浅灰白杠。可选 `--tiger-skeleton-bg` / `--tiger-skeleton-bg-alt` 为一层覆写，不注册进 `THEME_CSS_VARS`。
- **Loading 全屏遮罩暗色**：fullscreen 默认背景从硬编码 `rgba(255, 255, 255, 0.9)` 改为跟随 `--tiger-surface` 的 90% `color-mix`，暗色页不再盖白布。可选 `--tiger-loading-mask` 为一层覆写，不注册进 `THEME_CSS_VARS`。
- **Kbd / Tag default 暗色 chrome**：default 背景 fallback 改为已注册 `--tiger-surface-muted`，文字保持 `--tiger-text`，避免暗色页上浅底浅字。不新增 `--tiger-tag-*` theme 变量。
- **Segmented 暗色轨道/指示器**：轨道 fallback 改为已注册 `--tiger-surface-muted`，指示器改为 `--tiger-surface-raised`，避免暗色页上浅轨+深滑块。不新增 `--tiger-segmented-*` theme 变量。
- **主题 CSS 变量别名**：公开 `THEME_CSS_VARS` 增补 `--tiger-text-muted` / `--tiger-fill` / `--tiger-bg`，分别以 `var()` alias 到已有 `--tiger-text-secondary` / `--tiger-surface-muted` / `--tiger-surface`。ThemeManager 与 Tailwind `:root` / `.dark` 共用同一转换 helper，暗色 `--tiger-bg` 跟随 `--tiger-surface`，不新增第三套颜色字段。

## v2.1.0

v2.1.0 minor：完成 Roadmap 批次 1–5。本版本无 breaking change，组件用户无需迁移。公开组件入口现为 172（相对 v2.0.19 基线 149，含批次 1–4 新增入口与子组件）。

- **TreeSelect 虚拟化**：新增可选非破坏 props `virtual`（默认 `false`）、`height`（默认 `400`）与 `itemHeight`（默认 `32`），与 Tree 对齐而非 Select `listHeight`。`virtual` 为 true 时，下拉树的可见扁平行经 Tree 的 `VirtualList` 固定行高路径只渲染可视窗口；展开/折叠、搜索过滤、单选/多选与键盘把焦点行滚进窗口均可用。Vue/React API 对称，默认非虚拟渲染不变。
- **Cascader 虚拟化**：新增可选非破坏 props `virtual`（默认 `false`）与 `listHeight`（默认 `256`，与 Select 一致）。`virtual` 为 true 时，每一列选项面板与可搜索扁平路径列表按 Select 的 fixed-size 策略（`fixedSizeStrategy` / `getRange` + overscan）只渲染可视行；键盘导航时把 active/selected 行滚进窗口。Vue/React API 对称，默认非虚拟渲染不变。
- 新增 **LoadingBar** 反馈组件（批次 4）：顶部加载条（Naive/nprogress 类），命令式离散 API `start()` / `finish()` / `error()` / `clear()`；懒加载 Root facade 与 `ensureContainer` 宿主挂载与 Message/Notification 一致，SSR 安全（无顶层 `window`，`isBrowser` 守卫）；`start` 显示并 trickle 递增，`finish` 拉满后隐藏，`error` 进入错误色后隐藏；`LoadingBarContainer` 为 `progressbar`（polite、`aria-busy`，不抢焦点）；支持 `color`/`height`/`className`/`style` 与可选挂载容器；Vue/React API 对称，不改动现有 Loading/Progress。
- **同步 `.size-limit.json` 预算**：`Core (full)` 131→135 kB、`Vue (full)` 293→305 kB、`React (full)` 328→340 kB，并新增 LoadingBar 子路径预算。
- **同步 `.size-limit.json` 全量包预算（v2.1.0 实测）**：`Core (full)` 135→136 kB、`Vue (full)` 305→308 kB、`React (full)` 340→344 kB，`Vue Highlight` 19→20 kB、`Vue ImageCompare` 26→27 kB。
- **发布检查**：`publish:check` 对 Nuxt 示例的 npm install 使用 `--legacy-peer-deps`，规避 npm 10 arborist 在 Nuxt 4 peer 树上的 `edgesOut` 崩溃。
- 新增 **ImageCompare** 基础组件（批次 4）：before/after 图片对比滑块，支持指针拖动与键盘调整手柄位置；`orientation` 横向或纵向，`position`/`defaultPosition` 受控与非受控，`beforeSrc`/`afterSrc` 或 Vue `before`/`after` 插槽 / React `before`/`after` 节点；复用 Image 家族 `ImageFit` 与 `toCSSSize`；手柄为可聚焦 `slider`（`aria-valuenow` 0–100），图片带 alt；Vue/React API 对称、SSR 安全。
- 新增 **Marquee** 基础组件（批次 4）：循环滚动子内容，默认水平向左，无缝复制轨道；`pauseOnHover` 默认在悬停与 focus-within 时暂停；`prefers-reduced-motion` 下停用动画并隐藏复制段，改为静态可滚动内容；支持 `direction`/`duration`/`gap`/`repeat`，Vue/React API 对称、SSR 安全。
- 新增 **SplitButton** 基础组件（批次 4）：主操作按钮 + 相邻 chevron 触发下拉扩展；复用 Button 与 Dropdown，不另起菜单栈；共用 `variant`/`size`/`disabled`/`loading`/`danger`，菜单项走现有 `DropdownMenu`/`DropdownItem` API，主按钮 click 与菜单开关分离；chevron 触发器带可覆盖的 `triggerAriaLabel`（默认 More options）与 `aria-expanded`；Vue/React API 对称、SSR 安全。
- 新增 **Highlight** 基础组件（批次 4）：关键词/正则文本高亮，将匹配片段包在语义化 `mark` 中并保留非匹配文本；支持 `keywords` 字符串、字符串数组与 `RegExp`，可选 `caseSensitive`/`global`，字符串关键词自动转义；匹配范围由 core helper 计算（无 DOM 依赖），Vue/React API 对称、SSR 安全，无交互角色。
- 新增 **Kbd** 基础组件（批次 4）：语义化 `kbd` 按键标识（不是按钮），支持默认插槽/`children` 与 `keys` 单键或组合键，可选 `separator`、`size`（sm/md/lg）与 `variant`（default/subtle）；样式复用 Tag 尺寸与 default 色板，Vue/React API 对称、SSR 安全，无交互角色。
- 新增 **PageHeader** 导航组件（批次 3）：页面级页头（`header` landmark，不是 Layout 顶栏），可选 `showBack`/`onBack`/`@back` 返回控件与 `backHref`；默认返回复用 Button，带链接时复用 Link，也可用 back 插槽覆盖；提供 breadcrumb/title/subTitle/actions 插槽与右侧操作区弹性布局；Vue/React API 对称、SSR 安全，无 menubar 角色。
- 新增 **NavigationMenu** 导航组件（批次 3）：水平 `menubar` 站点导航，悬停/聚焦展开下拉或 MegaMenu 面板；复用 Dropdown 菜单样式与 anchored-overlay / floating-ui 碰撞定位，默认 portal 到 `document.body`；顶栏左右方向键、Enter/Space/ArrowDown 打开、Escape 关闭并还原焦点；支持受控 `value`/`open` 与非受控 `defaultValue`/`defaultOpen`；提供 Vue/React 双端实现、示例、单测与键盘 E2E。
- 新增 **ContextMenu** 导航组件（批次 3）：右键（`contextmenu`）触发并阻止浏览器默认菜单，用 1px 虚拟参考点把菜单定位在 `clientX/clientY`；复用 Dropdown 菜单样式与 anchored-overlay / floating-ui 碰撞定位，默认 portal 到 `document.body`；支持嵌套 `ContextMenuSub`（悬停与 ArrowRight/Enter 展开、ArrowLeft/Escape 逐层关闭）、方向键/Home/End 导航、Esc 与外部点击关闭、关闭后焦点还原；受控 `open` 与非受控 `defaultOpen` 与 Dropdown 对齐；提供 Vue/React 双端实现、示例、单测与键盘 E2E。
- 新增 **InputOTP** 表单组件（批次 1）：分格输入一次性验证码/PIN，支持粘贴分发、自动聚焦推进、掩码模式（`masked`/`maskChar`）、分组显示（`groups`/`separator`）、`numeric`/`alphanumeric` 字符集与自定义 `pattern`；填满触发 `complete`；提供 Vue/React 双端实现、示例、单测与 E2E，新增 `inputOtp` locale 分区（13 套语言）。
- 新增 **TagsInput** 表单组件（批次 1）：输入创建标签，支持回车/分隔符提交、粘贴多值批量拆分、去重、最大数量、两段式退格删除、`beforeAdd` 校验/转换钩子与 `clearable` 清空，受控与非受控；chip 复用 Tag 组件；提供双端实现、示例、单测与 E2E，新增 `tagsInput` locale 分区（13 套语言）。
- 新增 **MaskInput** 表单组件（批次 1）：模板掩码输入（`#` 数字、`a` 字母、`*` 字母数字、`!` 转义），支持自定义 `tokens` 与 `transform`、固定字符 eager 插入、IME 组合输入与 `clearable`；同时输出原始值（`v-model`/`onChange` 第一参）与格式化值（`change` payload 的 `maskedValue`）；提供双端实现、示例、单测与 E2E。
- 新增 **ScrollArea** 布局组件（批次 2）：样式化滚动条容器，隐藏原生滚动条并渲染自绘轨道与滑块，支持 `direction`（`vertical`/`horizontal`/`both`）、`scrollbar` 显示策略（`auto`/`hover`/`always`/`hidden`）、`scrollbarSize` 粗细、`shadow` 滚动阴影、`minThumbSize` 与 `height`/`maxHeight`/`width`/`maxWidth` 尺寸；滑块支持拖拽、轨道支持点击跳转；`scroll` 事件回传滚动偏移与推导状态，ref 暴露 `scrollTo`/`scrollToTop`/`scrollToBottom`/`getViewport`/`getState`；提供双端实现、示例、单测与 E2E。
- 新增 **Masonry** 布局组件（批次 2）：瀑布流布局，`columns`/`gap` 支持按响应式断点配置（`xs`–`xxxl`），条目按实测高度贪心装入最短列，动态插入/移除自动重排，测量完成前回退轮询分布保证 SSR/首帧不丢条目；`layout` 事件回传列数与各列高度，ref 暴露 `relayout`/`getColumnCount`；提供 Vue/React 双端实现、示例与单测。
- 新增 **AspectRatio** 布局组件（批次 2）：宽高比容器，`ratio` 支持数字与 `'16/9'`、`'16 / 9'`、`'1.5/2'` 等分数字符串，非法值回退默认 `16/9`；基于 CSS `aspect-ratio` 与绝对定位内容包装层实现子内容铺满，纯 CSS 计算、SSR 天然安全；提供 Vue/React 双端实现、示例与单测。
- **同步 `.size-limit.json` 全量包预算**：`Core (full)` 125→131 kB、`Vue (full)` 284→293 kB、`React (full)` 320→328 kB。批次 1 的三个表单组件已让三个全量包超出旧预算（`pnpm size` 在本次改动前即为红），本次连同 ScrollArea 的增量一并按实测重设，并同步 `scripts/check-release-readiness.mjs` 的期望值。
- **格式化漂移收敛并纳入门禁**：`pnpm format` 收敛全仓库 108 个漂移文件，`pnpm format:check` 加入 `quality:static`（此前不在任何门禁里，是漂移积累的根因）。同时修掉两处生成器与 prettier 打架的根因：`packages/core/scripts/generate-tokens.mjs` 原先手写 prettier 配置子集、漏掉 `printWidth: 100`，产物停在默认 80 列；`context7.json` 原先由 `JSON.stringify(…, null, 2)` 直接写出，从不过 prettier。两者改为经 `resolveConfig` 复用 `.prettierrc.json`，`pnpm tokens:build` 与 `pnpm docs:api` 的产物现已与 `format:check` 一致且可重复生成。Next.js 自己重写的 `examples/nextjs/next-env.d.ts` 加入 `.prettierignore`。纯格式化改动，无公开 API 变化。

## v2.0.19

补记版本：v2.0.19 于 2026-07-17 打 tag 并发布，但当时未切分发布文档，条目一直留在「未发布」节。本节内容按 tag 区间（`v2.0.4..v2.0.19`）的实际提交归属整理，MCP 五条为当时原文。该版本虽为 patch 号，但 `@expcat/tigercat-mcp` 存在语义与响应契约变化，详见 [docs/MIGRATION.md](docs/MIGRATION.md#v2019)。

- **`@expcat/tigercat-mcp` 默认远程读取 skills**：裸 `npx tigercat-mcp` 不再要求本地仓库 checkout，默认从 GitHub Pages `https://expcat.github.io/Tigercat/mcp/` 拉取 `context7.json` 与 skill references；`--root` 保留本地模式（仓库开发/离线），新增 `--base-url` 与环境变量 `TIGERCAT_MCP_BASE_URL` 用于镜像站。无参调用语义变化：不再从当前目录向上查找仓库根（内部 `findTigercatRoot` 移除），库调用 `loadSkillIndex()` / `diagnoseTigercatMcp()` 无参时同样默认远程。
- **MCP 路由与引用响应瘦身**：`readReferenceSource` 支持按 markdown 小节抽取，`routeTigercatTask` 内联 sources 并去重，新增 `createReferencePointer` 以会话级背景文档形式返回指针而非全文；`createComponentRoute` 支持小节级引用。响应体积显著下降，但 MCP 工具返回结构随之变化（契约变化）。同时归一化保留 CJK 字符，组件路由扩充中文别名，中文查询匹配率提升。
- **GitHub Pages 新增 `/mcp/` 路由**：随 `vue/`、`react/` 一起发布 skills 静态文件（`context7.json`、`skills/tigercat/**.md`）、部署版本 `version.json` 与说明页；示例首页新增 MCP 入口卡片。
- **`context7.json` 新增 `skill_files` 清单**：`pnpm docs:api` 生成全部 skill markdown 的仓库相对路径，作为远程模式 allow-list 契约；`pnpm api:validate` 与磁盘双向校验。
- **修复 MCP server 版本硬编码**：`createTigercatMcpServer` 上报的 server version 由写死的 `2.0.0-rc.1` 改为运行时读取包版本；`--doctor` 输出增加 `mode: local|remote`，远程模式报告 base URL 与部署版本。
- **修复 CodeEditor 光标不可见与行高错位**：textarea 用 `text-transparent` 露出下层高亮，导致 `caret-current` 的光标同样透明、完全看不见；新增 `getCodeEditorCaretClasses(theme)` 按主题显式给出 `caret-gray-900` / `caret-gray-100`。同时把容器、textarea 与高亮层的 `leading-relaxed` 统一为固定 `leading-[1.625rem]`，消除两层文本行高不一致造成的错位。
- **文档维护入口收敛**：Roadmap 只保留当前任务与登记规则；删除已实施的 Playground 编译器提案；测试说明合并到 `tests/README.md`，移除重复且已过时的测试质量清单，并同步修正版本、SSR 与验证文档中的旧引用。
- **示例与 playground（仅仓库内，不影响发布包）**：playground 编译器由 esbuild-wasm 换为 sucrase，Vue SFC 编译拆到 `vue-sfc.ts`，新增 `scripts/validate-example-compile.mjs` 编译校验；补充 R31–R35 示例覆盖（ConfigProvider、Menu、Message/Notification 容器、Tour、Transfer、chart 交互与多种图表类型）以及 Pagination `simple`/`disabled`、InputGroup 尺寸与 compact 示例。

## v2.0.0

v2.0.0 正式版。本版本相对 v1.5.0 完成破坏性升级：ESM-only 发布面、显式 component exports、React / Vue tree-shaking 副作用收敛、compat API 删除、legacy token / icon path 兼容层清理、按需加载文档迁移、size / publish artifact gate 收口、Basic / Layout 轻量组件 API 清理、Feedback / overlay open、portal、focus 与 close lifecycle 收敛，Form primitives 和 composite selectors 的受控模型、搜索、空态和尺寸类型收敛，Navigation 组件受控回调与子组件 subpath 产物收敛，Data/table stack 数据、选择与虚拟滚动入口统一，Charts/visualization 类型拆分与 tooltip 命名收敛，以及 Advanced/media viewer 与 editor runtime guard 收敛。完整迁移路径见 [docs/MIGRATION.md](docs/MIGRATION.md)。

### 相对 rc.2 的变更

- **统一锚点浮层架构**：Dropdown、Menu/SubMenu、Tooltip、Popover、Popconfirm、Image hover preview、Select、DatePicker、TimePicker、TreeSelect、Cascader、AutoComplete、ColorPicker、Mentions 与 FormItem popup error 统一经 core anchored-overlay contract 和 React/Vue 对称适配层挂载、碰撞定位与关闭；Modal/Drawer 提供最近 layer host 与完整焦点边界，浮层不再被 dialog overflow 裁剪，也不会改变 dialog 布局。表单组件没有新增 workaround prop；Dropdown `portal` 与 Menu `popupPortal` 继续兼容。
- 公开 API 与 rc.2 完全一致，无新增功能与破坏性变更。preview.1 → rc.2 期间的增量（`@expcat/tigercat-mcp` MCP 包、DataExport 组件、Table / List 远程与简洁分页、Icon `icon` 属性与扩展图标集、Pagination 页容量事件语义、DatePicker locale 回退修复等）见下方对应预发布条目。
- **`@expcat/tigercat-mcp` bin 修复**：通过 npm `.bin` 软链（`npx tigercat-mcp`）或其他符号链接路径调用时，直接运行判定因未 realpath `argv[1]` 而失败，进程静默退出、stdio 服务器不启动；现对 `argv[1]` realpath 后再比较（rc.2 及更早预发布版本受此影响）。
- 测试确定性收口：Drawer / Form / Popover 测试的硬等待改为 fake timers / `waitFor`；移除已被 `tests/TEST_QUALITY_GUIDELINES.md` 取代的旧测试清单文档。
- 清理 `.changeset/` 中 16 个内容已随既有版本发布面消化的暂存 changeset 文件。
- root 与 `@expcat/tigercat-core`、`@expcat/tigercat-react`、`@expcat/tigercat-vue`、`@expcat/tigercat-cli`、`@expcat/tigercat-mcp` 统一为 `2.0.0`，同步运行时 `version` 导出、CLI `CLI_VERSION`、CLI 模板依赖范围与示例首页版本。

### Breaking Changes

- **core anchored overlay utilities**：删除只服务旧组件私有定位路径的 `positionMentionsDropdown`、`PositionMentionsDropdownOptions` 与 `getSubmenuPopupZIndex`；Mentions 与 Menu/SubMenu 已统一使用框架 anchored-overlay adapter，业务代码不应直接编排组件浮层定位。
- **core**：移除已废弃的 `getResultHttpLabel(status)`。请改用 `isHttpResultStatus(status) ? status : undefined`。
- **React ImageGroup**：移除旧回调 `onPreviewVisibleChange`，统一为 `onPreviewOpenChange(open)`。
- **Vue ImageGroup**：移除旧事件 `preview-visible-change`，统一为 `preview-open-change`。
- **design tokens**：`@expcat/tigercat-core/tokens.css` 不再生成旧 `--tiger-color-*`、`--tiger-space-*`、`--tiger-button-*` 和 pre-0.5.0 `--tiger-primary` 等兼容变量；请改用 `--tiger-primitive-*`、`--tiger-semantic-*` 或 `--tiger-component-*` 三层 token。
- **core token exports**：移除 `globalColors` / `globalSpace` / `globalRadius` / `globalShadow` / `globalFont` / `globalDuration` / `globalEasing`、`aliasTokens` 及对应 `Global*` 类型别名；请改用 `primitive*` 和 `semanticTokens`。
- **core icon path aliases**：移除 DatePicker / TimePicker 旧 icon path 别名 `CalendarIconPath`、`CloseIconPath`、`ChevronLeftIconPath`、`ChevronRightIconPath`、`ClockIconPath`、`TimePickerCloseIconPath`，并删除 `common-icons` 兼容 barrel；请改用 `calendarSolidIcon20PathD`、`closeSolidIcon20PathD`、`chevron*SolidIcon20PathD`、`clockSolidIcon20PathD` 或分组 icon 子路径。
- **core DatePicker i18n helper**：`getDatePickerLabels(string)` 不再默认查找 13 个内置 DatePicker locale，以避免默认 bundle 拉入全量语言表；按运行时字符串解析内置 DatePicker 文案请改用 `@expcat/tigercat-core/datepicker-locales/registry` 的 `getDatePickerLabelsFromLocale(locale)`。
- **core `defineText`**：`defineText(...)` 不再作为 `defineLocale(...)` 的别名补齐 en-US 基线，而是返回纯自定义文本 overlay；需要完整 en-US 基线时请改用 `defineLocale(...)`，需要 DatePicker 翻译时请显式传入对应 DatePicker preset。
- **core Basic / Layout type aliases**：移除等同 shared contracts 的 `SpaceDirection`、`SpaceAlign`、`CardDirection`、`StatisticSize`、`DescriptionsSize`、`ListSize`；请分别改用 `BaseLayoutProps['direction']`、`BaseLayoutProps['align']` 或 `ComponentSize`。
- **Carousel**：移除仅初始化语义的 `initialSlide`，统一为受控索引模型；React 使用 `currentIndex` / `defaultCurrentIndex` / `onCurrentIndexChange`，Vue 使用 `currentIndex` / `defaultCurrentIndex` / `update:currentIndex`。
- **React hooks**：移除旧 source hook `usePopup` 及其 hooks barrel re-export；它只暴露 `visible` / `defaultVisible` / `onVisibleChange` 合约。Tooltip、Popover、Popconfirm 等 overlay 请直接使用组件级 `open` / `defaultOpen` / `onOpenChange`。
- **Drawer close lifecycle**：`destroyOnCloseAfterLeave` 重命名为 `deferDestroyOnClose`；React `onAfterLeave` 重命名为 `onAfterClose`；Vue `after-leave` 重命名为 `after-close`。
- **Modal close lifecycle**：React Modal 新增 `onAfterClose`，Vue Modal 新增 `after-close`；外部 `open=false` 不再触发 close intent（React `onClose` / Vue `close`），用户取消、确认、遮罩、关闭按钮和 Escape 仍触发对应 intent。
- **Vue Modal / Drawer teleport**：移除测试逃生口 `disableTeleport`，Modal 和 Drawer 始终 teleport 到 `document.body`；测试或样式选择器应查询 body 中的 overlay DOM。
- **core Form primitive size aliases**：移除等同 shared contract 的 `InputSize`、`TextareaSize`、`CheckboxSize`、`RadioSize`、`SwitchSize`、`SliderSize`、`SegmentedSize`、`StepperSize`、`ColorSwatchSize`；请统一改用 `ComponentSize`。
- **Vue Form primitives controlled model**：Checkbox、Radio、Switch 单体受控状态统一为默认 `v-model`（`modelValue` / `update:modelValue`）与 `default-value`；RadioGroup 也从 `v-model:value` 切换为默认 `v-model`。React Checkbox、Radio、Switch 继续使用 `checked` / `defaultChecked` / `onChange`。
- **core Form composite size aliases**：移除等同 shared contract 的 `SelectSize`、`TreeSelectSize`、`CascaderSize`、`AutoCompleteSize`、`DatePickerSize`、`TimePickerSize`、`TransferSize`、`ColorPickerSize`、`InputGroupSize`、`FormSize`；请统一改用 `ComponentSize`。
- **DatePicker / TimePicker model aliases**：移除重复的 `DatePickerSingleModelValue`、`DatePickerRangeModelValue`、`DatePickerSingleValue`、`DatePickerRangeValue`、`TimePickerSingleValue`、`TimePickerRangeValue`；请分别使用 `DatePickerModelValue` 与 `TimePickerModelValue`。
- **Form composite search API**：Select、TreeSelect、Cascader、AutoComplete、Transfer 的搜索受控量统一为 `searchValue` / `defaultSearchValue`；React 回调统一为 `onSearchChange`，Vue 统一为 `update:searchValue` / `search-change`。TreeSelect、Cascader、Transfer 的旧 `showSearch` 改为 `searchable`。
- **Form composite empty text API**：Select、TreeSelect、Cascader、AutoComplete、Transfer 的组件级空态文案统一为 `emptyText`；旧 `notFoundText`、`noOptionsText`、`noDataText` 不再保留，未显式传入时继续从 locale / custom text 解析默认空态。
- **Upload queue helper split**：上传队列、分片与断点续传 helper 拆入 `upload-queue-utils`，普通选择、拖拽与样式 helper 继续保留在 `upload-utils`；根入口仍导出对应工具，但直接导入时应选择更小的 helper 模块。
- **React Navigation controlled callbacks**：Tabs / ScrollSpy 的受控 active key 回调从 `onChange` 改为 `onActiveKeyChange`；Menu 搜索回调从 `onSearch` 改为 `onSearchChange`；Menu / Tree 的受控 key 变化分别使用 `onSelectedKeysChange`、`onOpenKeysChange`、`onExpandedKeysChange`、`onCheckedKeysChange`。`onSelect` / `onOpenChange` / `onExpand` / `onCheck` 仍作为携带交互上下文的事件回调。
- **Navigation 子组件 subpath 产物收敛**：`AnchorLink`、`BreadcrumbItem`、`DropdownItem`、`DropdownMenu`、`MenuItem`、`MenuItemGroup`、`StepsItem`、`SubMenu`、`TabPane` 的 PascalCase package subpath 保持可用，但发布 exports 现在指向父组件产物（如 `./MenuItem` → `Menu`），源码层不再保留独立子组件 shim 文件。
- **VirtualTable 数据与选择 API**：VirtualTable 删除 `data`、`rowHeight`、`height`、`selectable`、`selectedKeys`、`onSelect` 公共入口；请改用 `dataSource`、`virtualItemHeight`、`virtualHeight`、`rowSelection`，React 使用 `onSelectionChange`，Vue 使用 `selection-change` / `update:rowSelection`。
- **Table 虚拟化阈值 API**：Table / DataTableWithToolbar 删除 `autoVirtualThreshold`；自动虚拟化启用和推荐态统一由 `virtualThreshold` 控制，`virtual=true` 仍强制启用。
- **core table 泛型类型**：移除重复的 `GenericTableColumn`、`GenericRowSelection`、`GenericExpandable`、`GenericTableProps`；请改用 `TableColumn<T>`、`RowSelectionConfig<T>`、`ExpandableConfig<T>`、`TableProps<T>`。
- **Kanban 数据模型类型别名**：移除 `KanbanCard`、`KanbanColumn`、`KanbanCardMoveEvent`、`KanbanColumnMoveEvent` 公共别名；Kanban 复用 TaskBoard 数据模型，请直接使用 `TaskBoardCard`、`TaskBoardColumn`、`TaskBoardCardMoveEvent`、`TaskBoardColumnMoveEvent`。`KanbanProps` 与 `KanbanSwimlane` 保留。
- **DataTableWithToolbar 业务回调收敛**：移除组件顶层 `onSearchChange`、`onSearch`、`onFiltersChange`、`onBulkAction`，业务回调统一从 `toolbar` 配置发出——React 使用 `toolbar.onSearchChange` / `toolbar.onSearch` / `toolbar.onFiltersChange` / `toolbar.onBulkAction`，Vue 继续使用 `@search-change` / `@search` / `@filters-change` / `@bulk-action` 事件。`onPageChange` / `onPageSizeChange` / `onSelectionChange` 等分页与表格回调仍为组件顶层 API。
- **Charts 类型拆分与重复别名删除**：`chart.ts` 拆分为 `chart-core`、`chart-cartesian`、`chart-radial`、`chart-visualization` 分组类型，根入口仍继续导出所有 chart 类型；删除重复的 `AreaChartDatum` 与 `DonutChartDatum`，请分别改用 `LineChartDatum` 与 `PieChartDatum`。
- **ChartTooltip 可见性命名**：独立 `ChartTooltip` 的可见性 prop 从 `visible` 改为 `open`；高阶图表组件继续使用 `showTooltip` 控制内置 tooltip。
- **core NumberKeyboard 受控值命名**：`NumberKeyboardProps` 删除 Vue 专属的 `modelValue` core prop，跨框架 shared contract 统一为 `value` / `defaultValue`。React 继续使用 `value` / `defaultValue` / `onChange`；Vue 组件仍保留本地 `modelValue` / `update:modelValue` 作为默认 `v-model` 入口。
- **ImagePreview / ImageViewer viewer 合约收敛**：core 新增 `ImageViewerBaseProps` 作为 `locale`、`images`、`open`、`currentIndex`、`maskClosable` 的共享 viewer contract；`ImagePreviewProps` 与 `ImageViewerProps` 继续作为两个 public surface 保留，不重新引入 `visible`、`defaultIndex` 或 `onIndexChange`。

### Added

- **Viewport positioning contracts**：BackTop 新增 `position` / `placement` / `offset`，FloatButton 新增 `floating` / `placement` / `offset`，并公开 `BackTopPosition`、`ViewportPlacement`、`ViewportOffset`、`getViewportOffsetStyle` 与相关 viewport/floating class helpers，用于统一 fixed/sticky 视口定位。
- **Notification actions**：通知命令式 API 支持内联 actions；core 新增 `NotificationAction` / `NotificationActionContext` 与 action button class helpers，action 点击可通过 `closeOnClick` 或 callback context 的 `close()` 关闭对应 toast。
- **Select labels and locale helpers**：Select 新增 `labels` / `locale` 支持，core 新增 `TigerLocaleSelect`、`DEFAULT_SELECT_LABELS`、`ZH_CN_SELECT_LABELS` 与 `getSelectLabels`，空态和选择完成按钮文案可继续从组件 locale / ConfigProvider locale 回退。
- **Picker and selector helper contracts**：core 新增 `DATEPICKER_LOCALES`、`getDatePickerLocalePreset`、`getDatePickerLabelsFromLocale` 与 `CascaderSearchConfig`，运行时字符串查找 DatePicker locale 需显式走 registry，Cascader 搜索配置使用具名 public contract。
- **ImagePreview touch gestures**：ImagePreview 新增 `touchSwipeable` 与 `touchSwipeThreshold`，用于移动端滑动切换预览图片。

### Infrastructure

- `publish:check` 纳入 `@expcat/tigercat-mcp`：与其余四包一同参与 pack、tarball 无 CJS 产物校验与 clean install，并新增导出、bin `--help` 与版本一致性 smoke；MCP 服务器包不参与组件库专属的 tree-shaking / 体积断言。
- `scripts/sync-version.mjs` 不再写入旧版 Roadmap 发布表格字段，避免当前 Rxx 路线图结构下的版本同步脚本在最后一步失败。
- core / React / Vue 构建统一为 ESM-only，不再生成 CJS 产物；core package exports 移除 `require` 条件和 `.cjs` 目标。
- 发布体积随之约减半（相比 v1.5.0，gzip 压缩包与解包体积、文件数均下降约 50%）：

  | 包                       | v1.5.0（gzip / 解包 / 文件） | v2.0.0（gzip / 解包 / 文件） |
  | ------------------------ | ---------------------------- | ---------------------------- |
  | `@expcat/tigercat-core`  | 766 kB / 3.61 MB / 155       | 380 kB / 1.84 MB / 83        |
  | `@expcat/tigercat-react` | 503 kB / 2.44 MB / 869       | 259 kB / 1.22 MB / 440       |
  | `@expcat/tigercat-vue`   | 622 kB / 3.76 MB / 863       | 316 kB / 1.89 MB / 436       |
  | `@expcat/tigercat-cli`   | 16 kB / 60 kB / 5            | 15 kB / 60 kB / 5            |

- React / Vue package exports 移除 `./*` 通配入口，改为由 `scripts/lib/public-components.mjs` 事实源生成的 148 个 PascalCase 显式组件子路径；`exports:check` 与 `release:check` 会阻止清单漂移。
- React / Vue package `sideEffects` 收敛为 `false`，不再用 `dist/chunk-*` 或 `dist/components/*` 全量副作用兜底；`MessageContainer` 与 `NotificationContainer` 拆为独立纯容器入口，命令式 `Message` / `notification` 单例挂载逻辑保留在对应 imperative 入口中。
- `api:validate` 会直接阻止 core / React / Vue 公开源码重新引入 `@deprecated`，v2 不再新增过渡废弃层。
- `api:validate` 会阻止 Feedback 示例与 React hook source 重新引入 overlay `visible` / `defaultVisible` / `onVisibleChange` 用法，Feedback 当前示例统一使用 `open` 命名。
- `api:validate` 会阻止 Vue Checkbox / Radio / Switch 及对应 Vue examples 回退到旧 `checked` / `defaultChecked` / `update:checked` / `v-model:checked` 受控模型。
- `api:validate` 会阻止 Form composite selectors 回退到已删除的尺寸别名、DatePicker / TimePicker 旧模型别名、旧搜索 props/events 或重复空态命名。
- `api:validate` 会阻止 Navigation 子组件 subpath 重新指向独立 shim、React Tabs / ScrollSpy 回退到 `onChange`，或 React Menu 回退到旧 `onSearch`。
- `api:validate` 会阻止 Data/Table stack 回退到 VirtualTable 旧数据/选择 props、Table `autoVirtualThreshold` 或重复 `GenericTable*` public interfaces。
- `api:validate` 会阻止 Kanban 重新导出 `KanbanCard` / `KanbanColumn` / `KanbanCardMoveEvent` / `KanbanColumnMoveEvent` 别名，以及 DataTableWithToolbar 重新引入顶层 `onSearchChange` / `onSearch` / `onFiltersChange` / `onBulkAction` 业务回调。
- core composite 巨型类型文件 `composite.ts` 按组件拆分为 `chat.ts`、`activity-feed.ts`、`comment-thread.ts`、`notification-center.ts`、`table-toolbar.ts`、`form-wizard.ts`、`task-board.ts`，`composite.ts` 改为薄 barrel；公共类型导出经 `@expcat/tigercat-core` 根入口保持不变。
- `api:validate` 会阻止 Charts 回退到重复 datum aliases 或独立 `ChartTooltip visible` prop；generated chart references 由拆分后的类型文件重新生成。
- `api:validate` 会阻止 Advanced/media 回退到 core `NumberKeyboardProps.modelValue`、viewer `visible` / `defaultIndex` / `onIndexChange` / `update:index` 旧命名；`browser-only-guards` 覆盖 RichTextEditor 内置 engine 在 Node/SSR 下对 `document.execCommand` / `window.prompt` 的 no-op 行为。
- `tokens:build` / `tokens:check` 的生成面收敛为 canonical token 输出，移除 legacy CSS 变量和 token alias API 生成。
- `release:check` 和 `publish:check` 增加 ESM-only 断言，发布 smoke 使用临时安装目录中的 bare ESM import 验证包入口，并阻止 `.cjs` 文件混入 tarball 或安装产物。
- `release:check` 会阻止 React / Vue 恢复宽泛 sideEffects 声明；`publish:check` 会对安装后的 React / Vue root Button named import 和 Button 子路径 import 做 bundler smoke，确保普通 Button bundle 不拉入 Message / notification 命令式挂载代码。
- `publish:check` 的 Button 子路径 smoke 增加 charts、editors 和全量 locale barrel 隔离断言，并将 React / Vue Button 子路径 bundle 上限固定为 6 kB / 8 kB；`quality:release` 现在包含 `publish:check`，发布 workflow 在现有触发面内改为执行完整 release gate。
- i18n 默认路径更利于裁剪：`defineText` 不再导入内置 locale，DatePicker 默认 helper 不再导入全量 DatePicker locale；新增 `@expcat/tigercat-core/datepicker-locales/registry` 作为显式 opt-in 的运行时字符串查表入口，`publish:check` 会防止默认 DatePicker 子路径和 `defineText` bundle 回退到全量 locale。

## v2.0.0-rc.2

v2.0.0 rc.2 验证 rc.1 之后的 MCP package 与 LLM reference routing 更新，并同步当前依赖目录。

### Features

- **Tigercat MCP package**：新增 `@expcat/tigercat-mcp` 本地 MCP 服务，用于将 LLM 查询路由到 Tigercat skill references，并提供组件元数据、组件分类、参考文档路径和诊断信息。
- **组件元数据与诊断增强**：扩展 public component facts / Context7 生成内容，MCP 查询可返回更完整的组件匹配、建议 reference 和缺失配置诊断。

### Fixed

- **响应式图表与 VirtualTable**：React/Vue Bar、Line、Area、Scatter 的响应式外层不再保留固有宽度；VirtualTable 兑现既有 `TableColumn.render` / `renderHeader` 契约，并保持 React `renderCell` 优先级。
- **React Table 测量稳定性**：普通表格不再安装无用的 ResizeObserver；只在固定列、可锁列或虚拟表真正需要几何数据时观察，减少多 Table 页面冷启动时的并发状态更新。
- **Upload 与裁剪资源生命周期**：本地文件预览 URL 在替换、移除和卸载时正确撤销；CropUpload/ImageCropper 只在图像与容器尺寸为正且有限时计算裁剪几何。
- **复合组件视觉一致性**：ActivityFeed、NotificationCenter 与 CommentThread 的共享视觉 recipe 收敛为包内实现，React/Vue 使用相同 token 与 reduced-motion 规则，不增加 public API。
- **Example 体验收口**：React/Vue 示例补齐关键操作状态、移动端说明和窄屏布局，避免演示操作无可见反馈。

### Quality and release preparation

- 本地测试入口去重并清理重复断言；当前 canonical suite 为 383 files / 6,840 tests，public API baseline、generated Skill references 与 package exports 保持零漂移。
- 删除跨系统不稳定的 Playwright 图片对比 spec 和全部 PNG 基线；保留 Chromium、Firefox、WebKit 与移动 Chromium 的功能 E2E。
- 删除 CI、E2E、benchmark 与 security audit 的 Actions workflow；发布前验证统一在本地完成，Actions 只保留 tag、npm publish 与 Pages 部署流程。
- `docs/` 收敛为当前 `ROADMAP.md` 与用户需要的 `MIGRATION.md`；完成日志、临时 Example backlog 与重复 API 审计文档不再长期维护。

### Infrastructure

- root 与 `@expcat/tigercat-core`、`@expcat/tigercat-react`、`@expcat/tigercat-vue`、`@expcat/tigercat-cli`、`@expcat/tigercat-mcp` 统一为 `2.0.0-rc.2`。
- 同步 core / React / Vue 运行时 `version` 导出、CLI `CLI_VERSION`、CLI 模板中的 Tigercat 依赖范围，以及示例首页展示版本。
- 更新 workspace catalog / lockfile 中的依赖版本，并将 MCP 包纳入 release readiness 的 fixed-version 检查。
- `React Table subpath` size 预算 40 kB → 41 kB，以覆盖 rc.1 后依赖 / 构建面更新后的稳定 gzip 体积（实测 40.52 kB）。
- `publish:check` 的 clean npm install 不再使用 `--prefer-offline`，避免本机旧 npm metadata 将当前 registry 已存在的 catalog 版本误判为 ETARGET。
- 本次 rc 无新增破坏性变更；迁移路径沿用当前 v2.0.0 条目。

## v2.0.0-rc.1

v2.0.0 rc.1 冻结当前 v2.0.0 发布面，收敛 Pagination 样式与页容量变更事件语义，并记录候选版本相对 preview.6 的 core helper 清理。

### Breaking Changes

- **移除 simple pagination 样式 helpers**：core 根入口不再导出 `getSimplePaginationContainerClasses`、`getSimplePaginationTotalClasses`、`getSimplePaginationControlsClasses`、`getSimplePaginationSelectClasses`、`getSimplePaginationButtonClasses`、`getSimplePaginationPageIndicatorClasses` 与 `getSimplePaginationButtonsWrapperClasses`。Table/List 内置分页已统一复用 Pagination；自定义分页应直接使用 React/Vue `Pagination`，或改用仍公开的通用 pagination 样式 helpers。

### Fixed

- **Pagination 激活态样式**：页码按钮激活态统一由 core 样式 helper 生成，React / Vue 不再各自拼接重复状态类。
- **Pagination 页容量事件**：变更 `pageSize` 时只触发 React `onPageSizeChange` / Vue `page-size-change`，并携带调整后的页码；即使当前页因总页数减少而被收敛，也不再额外触发页面导航 `onChange` / `change`。

### Infrastructure

- root 与 `@expcat/tigercat-core`、`@expcat/tigercat-react`、`@expcat/tigercat-vue`、`@expcat/tigercat-cli` 统一为 `2.0.0-rc.1`，并同步运行时版本、CLI 与示例首页元数据。
- 迁移和破坏性变更已同步到 `docs/MIGRATION.md`；RC 阶段不再引入未明确记录的 breaking public API。

## v2.0.0-preview.6

v2.0.0 preview 6 延续 v2.0.0 预览发布面，新增 DataExport 数据导出组件，并增强 Table / List 分页交互。

### Features

- **DataExport 数据导出组件**：Vue / React 新增 `DataExport` 组件（Data 分类，子路径 `@expcat/tigercat-react/DataExport` / `@expcat/tigercat-vue/DataExport`），支持将表格数据导出为 XLSX 或 Markdown。`columns` 复用 `TableColumn`，Table / DataTableWithToolbar 的列配置可直接透传；`formats` 单一格式渲染普通按钮、多格式渲染下拉菜单（默认 `['xlsx', 'markdown']`），另支持 `fileName`、`sheetName`、`cellFormatter`、`disabled`。序列化实现位于 core 新增子路径 `@expcat/tigercat-core/utils/data-export`，组件按需 lazy import，不使用导出功能时不进入 bundle。导出按钮文案随 locale（zh-CN / en-US）同步新增。
- **Table / List 分页增强**：`PaginationConfig` 与 `ListPaginationConfig` 新增 `simple?: boolean`（强制简洁模式：上一页/下一页 + 页码指示，默认 ≤3 页自动简洁、>3 页显示页码按钮）与 `showQuickJumper?: boolean`（快速跳页输入框，默认 >3 页自动出现）；`pageIndicatorText?: (current, totalPages) => string` 可自定义简洁模式页码指示文案（缺省 `{current} / {totalPages}`）。同时改进分页可访问性。

### Infrastructure

- root 与 `@expcat/tigercat-core`、`@expcat/tigercat-react`、`@expcat/tigercat-vue`、`@expcat/tigercat-cli` 统一为 `2.0.0-preview.6`。
- 同步 core / React / Vue 运行时 `version` 导出、CLI `CLI_VERSION`、CLI 模板中的 Tigercat 依赖范围，以及示例首页展示版本。
- 公开组件数 148 → 149（新增 DataExport），README 与示例首页统计同步更新。
- 迁移和破坏性变更内容沿用当前 v2.0.0 预览阶段条目；正式 v2.0.0 发布前继续在 `docs/MIGRATION.md` 与本文件集中更新。

## v2.0.0-preview.5

v2.0.0 preview 5 延续 v2.0.0 预览发布面，新增 Table / List 远程（服务端）分页模式。

### Features

- **Table / List 远程分页 `pagination.remote`**：`PaginationConfig` 与 `ListPaginationConfig` 新增 `remote?: boolean`（默认 `false`，完全向后兼容）。`remote: true` 语义：`dataSource` 即当前页数据，组件跳过内部切片原样渲染，总页数与 `showTotal` 范围文案全部由 `pagination.total` 计算；`current` / `pageSize` 仍为受控属性，`page-change` / `page-size-change` 事件行为不变，业务侧收到事件后按新页码重新请求。Vue / React 两端 Table 与 List 同步支持；`DataTableWithToolbar` 原样透传 `pagination`，无需额外配置。注意：remote 模式下组件内置排序/筛选仅作用于当前页数据，排序/筛选应由服务端完成。

### Infrastructure

- root 与 `@expcat/tigercat-core`、`@expcat/tigercat-react`、`@expcat/tigercat-vue`、`@expcat/tigercat-cli` 统一为 `2.0.0-preview.5`。
- 同步 core / React / Vue 运行时 `version` 导出、CLI `CLI_VERSION`、CLI 模板中的 Tigercat 依赖范围，以及示例首页展示版本。
- 迁移和破坏性变更内容沿用当前 v2.0.0 预览阶段条目；正式 v2.0.0 发布前继续在 `docs/MIGRATION.md` 与本文件集中更新。

## v2.0.0-preview.4

v2.0.0 preview 4 延续 v2.0.0 预览发布面，合入 Icon 组件 `icon` 属性与可 tree-shake 的扩展图标集。

### Features

- **Icon `icon` 属性**：Vue / React `Icon` 组件新增 `icon` 属性，接受 `IconDefinition`（viewBox + path 数据 + stroke/fill 模式），可将自定义图标（如品牌 logo）定义为常量复用，无需全局注册。优先级：自定义 SVG children > `icon` > `name`。
- **core 扩展图标集**：新增约 60 个 Heroicons outline 风格扩展图标（排序、视图、操作、通信媒体、状态反馈、商务、数据技术、场景等），以独立 `IconDefinition` 常量从 `@expcat/tigercat-core` 导出（如 `rocketIcon`、`sortAscendingIcon`），配合 `icon` 属性使用。常量带 `/*#__PURE__*/` 标注且包声明 `sideEffects: false`，未使用的图标可被 bundler tree-shake，不进入组件包体积；`iconRegistry` / `IconName` 保持原集合不变。`extendedIcons`（`Record<ExtendedIconName, IconDefinition>`）提供全量集合用于图标画廊等场景。

### Infrastructure

- root 与 `@expcat/tigercat-core`、`@expcat/tigercat-react`、`@expcat/tigercat-vue`、`@expcat/tigercat-cli` 统一为 `2.0.0-preview.4`。
- 同步 core / React / Vue 运行时 `version` 导出、CLI `CLI_VERSION`、CLI 模板中的 Tigercat 依赖范围，以及示例首页展示版本。
- `Core (full)` size 预算 118 kB → 125 kB（core 全量入口包含全部扩展图标定义；组件子路径与按需引入体积不受影响，仍由原有预算约束）。
- 迁移和破坏性变更内容沿用当前 v2.0.0 预览阶段条目；正式 v2.0.0 发布前继续在 `docs/MIGRATION.md` 与本文件集中更新。

## v2.0.0-preview.3

v2.0.0 preview 3 延续 v2.0.0 预览发布面，在 preview.2 之后合入 DatePicker locale 文案回退修复，以及 release 门禁维护更新。

### Bug Fixes

- **core DatePicker i18n**：`getDatePickerLabelsFromLocale(locale, overrides)` 现以 en-US 文案为基线合并，locale preset 缺失的键回退到 en-US，而非产生 `undefined`。

### Infrastructure

- root 与 `@expcat/tigercat-core`、`@expcat/tigercat-react`、`@expcat/tigercat-vue`、`@expcat/tigercat-cli` 统一为 `2.0.0-preview.3`。
- 同步 core / React / Vue 运行时 `version` 导出、CLI `CLI_VERSION`、CLI 模板中的 Tigercat 依赖范围，以及示例首页展示版本。
- 移除 `FormItemContext` 未使用的 React 默认导入以通过 lint 门禁；将 `Core locale (zh-CN)` size 预算从 3 kB 提升至 4 kB 以容纳持续扩充的 i18n 文案。
- 迁移和破坏性变更内容沿用当前 v2.0.0 预览阶段条目；正式 v2.0.0 发布前继续在 `docs/MIGRATION.md` 与本文件集中更新。

## v2.0.0-preview.2

v2.0.0 preview 2 延续 v2.0.0 预览发布面，用于验证 preview.1 之后已合入的示例、测试和文档收口提交。

### Infrastructure

- root 与 `@expcat/tigercat-core`、`@expcat/tigercat-react`、`@expcat/tigercat-vue`、`@expcat/tigercat-cli` 统一为 `2.0.0-preview.2`。
- 同步 core / React / Vue 运行时 `version` 导出、CLI `CLI_VERSION`、CLI 模板中的 Tigercat 依赖范围，以及示例首页展示版本。
- 迁移和破坏性变更内容沿用当前 v2.0.0 预览阶段条目；正式 v2.0.0 发布前继续在 `docs/MIGRATION.md` 与本文件集中更新。

## v2.0.0-preview.1

v2.0.0 preview 1 对齐 v2.0.0 破坏性升级当前发布面，用于预览验证已完成的版本号、运行时 version 导出、ESM-only package surface、显式 component exports、tree-shaking 护栏、API 删除与文档 / 示例迁移收口。

### Infrastructure

- root 与 `@expcat/tigercat-core`、`@expcat/tigercat-react`、`@expcat/tigercat-vue`、`@expcat/tigercat-cli` 统一为 `2.0.0-preview.1`。
- 同步 core / React / Vue 运行时 `version` 导出、CLI `CLI_VERSION`、CLI 模板中的 Tigercat 依赖范围，以及示例首页展示版本。
- 迁移和破坏性变更内容沿用当前 v2.0.0 预览阶段条目；正式 v2.0.0 发布前继续在 `docs/MIGRATION.md` 与本文件集中更新。

## v1.5.0

本版本汇总 v1.4.0 记录之后截至 2026-06-28 的主分支变更，重点标出升级后使用者需要留意的属性、行为与迁移点。

### Upgrade Notes

- **开发/发布环境要求提高**：根工程 `packageManager` 更新为 `pnpm@11.9.0`，`engines` 更新为 Node `>=22.13.0`、pnpm `>=11.9.0`。本地开发、示例构建和发布检查请先升级工具链。
- **Result 工具函数迁移建议**：`getResultHttpLabel(status)` 标记为弃用；新代码请改用 `isHttpResultStatus(status)` 判断 HTTP 状态，再按需直接使用原始 `status`。旧函数仍保留，现有导入不会立即失效。
- **Message 类型导出修正**：React `MessageProps` / Vue `VueMessageProps` 现在表示命令式 Message API 接受的 `MessageOptions`；容器组件 props 保持为单独的 `MessageContainerProps` / `VueMessageContainerProps`。如果业务侧曾把容器 props 当作全局 `message.*()` 配置类型使用，请改用新的容器 props 名称。

### Added

- **Locale 命名空间继续扩展**：`TigerLocale` 新增 `empty`、`tour`、`calendar`、`fileManager`、`imageViewer`、`imageEditor`、`status`、`qrcode`、`timeline` 等文案段，并补齐 en-US / zh-CN 及 13 个 locale preset 中的相关默认文案。新增 core helpers / 常量包括 `getTourLabels`、`getCalendarLabels`、`getFileManagerLabels`、`getImageViewerLabels`、`getImageEditorLabels`、`getStatusLabels`、`DEFAULT_*_LABELS` 与 `ZH_CN_*_LABELS`。
- **更多组件支持 `locale` 覆盖**：`AutoComplete`、`Badge`、`Calendar`、`CropUpload` / `ImageCropper`、`Empty`、`FileManager`、`ImageAnnotation`、`ImagePreview`、`ImageViewer`、`Loading`、`Tag` 等双端组件新增可选 `locale` prop，解析顺序为显式 prop / 组件 locale / ConfigProvider locale / 英文 fallback。
- **Calendar 受控能力补齐**：React `Calendar` 新增 `value`、`onChange`、`onPanelChange` 与 `locale`；Vue 侧对应行为通过既有 emits / `v-model` 对齐。
- **DataTableWithToolbar 工具栏能力补齐**：新增/公开 `onSearchChange`、`onSearch`、`onFiltersChange`、`onBulkAction`、`selectedKeys`、`tableClassName` 等属性，并把 toolbar 回调、搜索、筛选、批量操作和表格 class 传递纳入公开契约。
- **FileManager 受控与拖拽回调补齐**：新增 `onCurrentPathChange`、`onNavigate`、`onOpen`、`onSelect`、`onSelectedKeysChange`、`onSearchTextChange`、`onReorder` 等回调，支持选择、路径、搜索与重排状态外置。
- **VirtualTable 横向虚拟化与行定制**：新增 `width`、`virtualizeColumns`、`rowClassName`，core 新增 `calculateVirtualColumnRange` / `TableVirtualWindow` 等工具，用于大列数表格的横向窗口化渲染。
- **图表与编辑器能力补齐**：`GaugeChart` 新增 `tooltipFormatter`；`RichTextEditor` 的 `mode` 现在传入底层 engine；`CodeEditor` 新增 active-line 相关 core class/helper；图表 tooltip、downsample、Donut 入场动画等 core helper 纳入公开导出。
- **主题与 token 检查能力**：core 新增 `defaultThemeLightColors` / `defaultThemeDarkColors`、`THEME_CONFIG_CSS_VARS`、`themeConfigToCssVars`，Tailwind 默认主题变量改由默认主题色派生；新增 `pnpm tokens:check` 检查生成产物是否过期。

### Changed

- **DatePicker 文案来源收敛**：DatePicker labels 统一以 `datepicker-locales/*` preset 作为来源，`getDatePickerLabels(string)` 支持内置 13 个 locale id，未知 locale 自动回退 `en-US`。
- **公开但此前未完整生效的 props 落地**：Select、Table、VirtualTable、VirtualList、Kanban、RichTextEditor、图表、FileManager、Transfer、AutoComplete、Slider、Splitter、CodeEditor、ChatWindow、CropUpload、Cascader、FloatButton、Steps、Tabs、Calendar、InputNumber、CommentThread、DataTableWithToolbar 等组件完成“已声明/已透传但运行时未完全承接”的属性实现与双端对齐。
- **可访问性与键盘交互收敛**：Table / VirtualTable 行选择、展开行、筛选/导出控件、Tabs 关闭按钮、Rate、Segmented、Resizable、ImageAnnotation、Calendar、ChartLegend 等补齐 ARIA、键盘激活或可访问名称；折叠/交互场景更接近真实控件语义。
- **InputGroup 尺寸继承补齐**：React / Vue `InputNumber` 现在会继承 `InputGroup` size；Vue `InputNumber` 同时补齐 `defaultValue` 与 `className`。
- **质量脚本收敛**：`quality:ssr` 改走 `scripts/check-ssr-examples.mjs`，新增 `e2e` / `e2e:smoke` 脚本；CLI / 发布 / 校验脚本复用 `scripts/utils/files.mjs`、`scripts/utils/strings.mjs` 与 CLI `utils/exec.ts`。

### Fixed

- 修复 **MarkdownEditor** 空预览态把 `placeholder` 直接写入 `innerHTML` 的 XSS 风险：空态占位文案现在作为文本节点渲染，非空预览仍经 `sanitizeHtml`。
- 修复 **Message** 多位置渲染与类型契约：全局消息按 `top` / `top-left` / `top-right` / `bottom` / `bottom-left` / `bottom-right` 分组渲染，导出的 API options 类型不再与容器 props 混淆。
- 修复 **BackTop** 默认 `target` 在 SSR / 非浏览器环境直接访问 `window` 的问题。
- 修复 **Modal** 关闭回调顺序，避免受控关闭、确认、取消路径中 `onClose` / `onOpenChange` 语义混乱或重复触发。
- 修复 **TimePicker** 在存在秒值与 `minTime` / `maxTime` 时的禁用判断，秒列现在参与范围校验。
- 修复 **Form** 动态字段、reset、undo/redo 等路径中的内部值同步问题，减少受控 model 与内部 ref 脱节。
- 修复 **Vue** Anchor / AvatarGroup / Breadcrumb / Dropdown / DatePicker 等组件在响应式上下文、快捷日期和事件透传上的边缘问题。

### Infrastructure

- 依赖与工具链更新：Playwright、ESLint、Vitest、happy-dom、jiti、Prettier 等开发依赖升级；workspace 从 pnpm 10 迁移到 pnpm 11。
- API 基线生成与 release readiness 校验继续收敛，`api-reports/public-api-baseline.json` 纳入新增 locale/helper/props 契约，`skills/tigercat/references` 同步刷新到新的组件属性说明。
- Roadmap 文档从扫描日志整理为执行队列，历史 `docs/ROADMAP_CHECK.md` 内容已合并进 `docs/ROADMAP.md` 后删除。

## v1.4.0

本版本包含新增组件、表格列显隐、i18n 扩展、跨端逻辑收敛、发布门禁强化，以及需要迁移的 Breaking changes。迁移路径集中于 [迁移指南](docs/MIGRATION.md)。

### Added

- 新增 **MarkdownEditor** 高级组件：支持 Markdown 编辑、编辑/分屏/预览模式、内置工具栏、快捷键、预览渲染与自定义 renderer 扩展点，提供 Vue/React 双端实现、示例与测试。
- **Table 列显隐控制**：新增 `hiddenColumnKeys`（受控）/ `defaultHiddenColumnKeys`（非受控），React 提供 `onHiddenColumnKeysChange`，Vue 支持 `v-model:hidden-column-keys` 与 `hidden-column-keys-change` 事件；`TableColumn` 新增 `hideable`（默认 `true`，`false` 时列设置面板中不可隐藏）。固定列偏移、卡片字段、导出与列拖拽只作用于可见列，隐藏列上已生效的筛选仍继续过滤数据。**DataTableWithToolbar** 工具栏新增列设置入口：`toolbar.showColumnSettings` 开启内置 Popover + Checkbox 面板，`toolbar.columnSettings.lockedColumnKeys` 可锁定不可隐藏列，标题支持 `toolbar.columnSettings.title` 与 locale（`table.columnSettingsText` / `columnSettingsAriaLabel`，13 语言预设已补齐）。core 新增 `filterHiddenColumns` 工具与 `FLOATING_OVERLAY_Z_INDEX`（1000）常量。
- **i18n 本地化扩展**：未配置 ConfigProvider 时英文渲染一律不变，无需逐实例传文案。
  - **Form** 内置校验消息本地化——新增 core `TigerLocaleFormValidation`、`getFormValidationLabels` 与 `DEFAULT_FORM_VALIDATION_LABELS` / `ZH_CN_FORM_VALIDATION_LABELS`，`TigerLocale` 新增 `formValidation` 段；双端 `Form` 新增可选 `locale` prop 并接入 ConfigProvider locale，`<ConfigProvider :locale="zhCN">` 下必填/类型/范围等内置报错自动中文，单条规则 `message` 仍为最高优先级；`validateRule` / `validateField` / `validateForm` / `validateFormFields` 新增可选 `messages` 末参（向后兼容）。
  - **内置文案接入 ConfigProvider locale**——`TigerLocaleCommon` 新增 `searchPlaceholder` / `clearText` / `noMoreText`（en-US / zh-CN 及多语言预设已补齐）。双端 `Select` / `Tree` / `TreeSelect` / `Transfer` / `Cascader` / `FileManager`（及 Vue `VirtualTable` / `QRCode` / `Timeline` / `Loading` / `ImageViewer` / `AutoComplete`）不再硬编码 `'Search...'` / `'Loading...'` / `'Close'` / `'Clear'`，改读 `mergeTigerLocale(ConfigProvider locale, props.locale)` 并新增可选 `locale` prop 作最高优先级覆盖。
  - **空态 / 加载 / 清除 / 终态默认文案回退 locale**——双端 `List` / `Tree` / `TreeSelect` / `Transfer` / `VirtualTable`（`emptyText` / `notFoundText`）、`InfiniteScroll`（`loadingText` / `endText` → `common.noMoreText`）、`Signature`（`clearText`）、`Spotlight`（`placeholder` / `emptyText`）、`Cascader`（`notFoundText`）、`Tour`（`nextText` / `prevText` / `finishText` → `formWizard`）、`NumberKeyboard`（`confirmText` → `common.okText`）、`Select`（`noOptionsText` / `noDataText` → `common.emptyText`）、`FileManager`（`emptyText` → `common.emptyText`）与 React `Loading`（aria 回退 → `common.loadingText`）的英文默认值改为「未传时回退 `mergeTigerLocale(...)` 的 `common.*` / `formWizard.*`」，显式 prop 仍为最高优先级；`List` / `InfiniteScroll` / `Signature` / `Spotlight` / `Tour` / `NumberKeyboard`（含 React `VirtualTable`）新增可选 `locale` prop。同时修复 Vue `Cascader` 空态此前直接渲染 `notFoundText`、未接 locale 的漏改（React 端早已正确）。
- **core 工具新增**：`date-utils` 新增不可变日期算术 `addDays` / `addMonths` / `addYears`（`addMonths` / `addYears` 按目标月长度裁剪日期，如 1 月 31 日 +1 月 → 2 月 28/29 日）；新增命令式实例 id 计数器工厂 `createInstanceCounter`（`imperative-api`，每实例从 1 起单调自增、互相隔离）与 InputNumber 显示/解析工具 `formatInputNumberDisplay` / `parseInputNumberValue`（`input-number-utils`，`formatter` / `precision` / `parser` 以参数注入），供双端复用。
- React **Signature** 新增 `onClear` 回调：清除（工具栏按钮或 ref `clear()`）时触发，与 Vue 端 `clear` 事件对齐。

### Changed

- **跨端纯逻辑下沉 core（行为不变）**：公共组件 API、props 与 a11y 键盘行为均不变。
  - **DatePicker** 移除各自实现的 `addDays`、手写月/年步进 wraparound，改用 `date-utils` 的 `addDays` / `addMonths`。
  - **键盘导航**——core 新增 `getTreeKeyboardAction` / `getFirstVisibleChildKey`（`tree-utils`）、`getCyclicIndex`（`picker-utils`）、`focusTimePickerOption` / `TimePickerFocusUnit` / `TimePickerFocusAction`（`timepicker-utils`）、`getMenuNavigationKeys`（`menu-utils`）；双端 **Tree**（方向键/Home/End 走查与展开收起/聚焦父子/选择/勾选）、**Mentions**（环绕列表导航）、**TimePicker**（列内 roving 焦点）、**Menu**（方向键映射）改调同一份 core 实现，消除两端内联重复。
  - **命令式 API 与 InputNumber**——**Message** / **Notification** 的实例自增 id 计数器（原各自内联，双端共 4 份）改用 `createInstanceCounter()`；**InputNumber** 的显示格式化与字符串解析改调 `formatInputNumberDisplay` / `parseInputNumberValue`。core 保留 `createInstanceIdGenerator` / `parseInputNumberInput` 兼容别名。
- **SSR 守卫统一（行为不变）**：浏览器端渲染不变，统一改用 core `isBrowser()`。
  - core 端——`a11y-utils`（`createFocusTrap` / `announceToScreenReader` / live-region）/ `anchor-utils` / `chart-export-utils` / `table-export-utils` / `focus-utils` / `image-utils` 中的浏览器端命令式助手统一加 `isBrowser()` 非浏览器早退、稳定 fallback 或明确 browser-only 错误，新增 `tests/core/browser-only-guards.spec.ts` 在 Node 环境回归；`rich-text-editor-utils` 为纯函数、无运行时 DOM 副作用，保持原样。
  - Vue 端——`ConfigProvider` / `Signature` / `ImageAnnotation` 的内联 `typeof window/document === 'undefined'` 改用 core `isBrowser()`（`ImageAnnotation` 保留 `window.Image` 特性检测）。
  - React 端——**ImagePreview** 门户挂载改用 `utils/overlay` 的 `renderBodyPortal`（内含 `isBrowser()` 守卫）替代直接 `createPortal(…, document.body)`，与 Tour / FloatButton / ChartTooltip 一致；测试基建 `tests/setup.ts` 的 `matchMedia` mock 加 `typeof window` 守卫，使 SSR spec 可共用同一 setup。
- **React 受控/非受控样板收敛**：升级版 `useControlledState`（合并 `onChange`、稳定 setter、支持 updater 形式）接入 `Checkbox` / `Input` / `InputNumber` / `Radio` / `RadioGroup` / `CheckboxGroup` / `Textarea` / `MarkdownEditor` / `RichTextEditor` / `Upload` / `Spotlight`，移除各组件手写受控样板；新增 hook 单测覆盖受控 / 非受控 / updater / extra-args / 稳定 setter identity。`ScrollSpy` 与 `NumberKeyboard` 不属纯样板，暂不迁移。组件公共 API 与行为不变。
- **React 单文件巨石按 `Table/` 子模块范式拆分（行为不变）**：**Select** / **DatePicker** / **TimePicker** / **Menu** / **Tree** 各保留瘦 wrapper（公共导出与 props 类型不变），状态、渲染、图标、类型和上下文逻辑拆入子模块。框架无关纯逻辑继续调 core，无新增抽取；**DatePicker** / **TimePicker** 的内部受控值接入 `useControlledState`。公共 API、props、渲染 / a11y 行为及 `api-reports` 基线快照不变。
- **TimePicker / Upload 文案收敛与深度 i18n**：默认文案表收敛到 `locale-utils` 单一来源（新增 `DEFAULT_TIME_PICKER_LABELS` / `ZH_CN_TIME_PICKER_LABELS` / `DEFAULT_UPLOAD_LABELS` / `ZH_CN_UPLOAD_LABELS`），消除标签分散；TimePicker 标签并入 `TigerLocale`（新增 `timePicker` 区块），双端 TimePicker 接入 ConfigProvider locale 且保留字符串 locale 兼容；en-US / zh-CN locale pack 补 `upload` + `timePicker` 区块。公共 `getTimePickerLabels` / `getUploadLabels` 签名不变。
- **杂项收敛（行为不变）**：
  - `shouldLoadMore` 撤销 `@deprecated`——它是 InfiniteScroll 在 IntersectionObserver 不可用时的有意滚动回退路径，并非待移除 API。
  - core 内部 `src/theme/` 重命名为 `src/theme-runtime/`，与命名预设主题目录 `src/themes/`（预设 + `ThemeManager` + modern token）区分；`THEME_CSS_VARS` / `setThemeColors` / `getThemeColor` 及各 `*Classes` 仍经主入口 `@expcat/tigercat-core` 导出，公共 API 不变。
  - 收窄双端组件中冗余 / 脆弱的非空断言（`!`）：`Image` / `QRCode` / `Mentions` / `Alert` 去除带默认值 prop 的断言，`Tree` / `CommentThread` / `Menu` 守卫分支内改用局部 const 收窄 `node.children`。
  - **CLI** 参数校验更严格、反馈更可预测：`tigercat create` 对非法 npm 包名（含大写 / 空格 / 非法字符）直接报错退出并给出建议名；`create` / `playground` 对非法 `--template` 立即失败并列出可选值；`add` 对显式非法 `--framework` 立即失败；非空目录确认文案改为「Overwrite conflicting template files? (other files are kept)」；新增内部工具 `cli/src/utils/validate.ts`。
  - **CLI** `tigercat doctor` 诊断更深：`Version compatibility matrix` 升级为对已检测 framework 的 peer 主版本实际校验（Vue `^3`、React 与 react-dom `^19`，过旧即失败）；新增 `Core exports` 检查，当 `@expcat/tigercat-core` 已安装且可解析时校验其 `exports` 暴露 `.` / `./tailwind` / `./tailwind/modern` / `./tokens.css` / `./figma-variables.json`（未安装 / 不可解析则跳过）。

### Breaking Changes

- **React hook**：公共 hook `useControlledState` 升级为回调透传版——返回值由 `[value, setValue, isControlled]` 收敛为 `[value, setValue]`，新增可选第三参 `onChange`；`setValue(next, ...args)` 在非受控时写内部 state 并在两种模式下始终调用 `onChange?.(next, ...args)`，受控模式不再写内部 state，且支持 updater 形式与稳定 identity。仅消费 `value` 与 setter 者无需改动；此前读取第三个返回值 `isControlled` 或手写受控样板者请见 [迁移指南](docs/MIGRATION.md)。
- **core**：移除废弃别名 `kanbanAddCardClasses`。自 v0.9.0 起它仅作为 `taskBoardAddCardClasses` 的向后兼容别名，现已删除；请改用 `taskBoardAddCardClasses`（详见 [迁移指南](docs/MIGRATION.md)）。
- **Dropdown**：菜单默认渲染到 `document.body`（React portal / Vue Teleport，zIndex 1000），解决表格固定列（sticky）遮挡与 overflow 容器裁剪；新增 `portal` prop（默认 `true`），`portal: false` 可恢复原位渲染的旧 DOM 结构。包装层新增 `data-tiger-dropdown-menu` 属性便于查询，依赖原 DOM 层级的样式选择器或测试需相应调整。
- **跨端 API 对称**：统一受控量 / 事件回调的双端命名（详见 [迁移指南](docs/MIGRATION.md)）。
  - **ImageViewer (React)**：`onIndexChange` 重命名为 `onCurrentIndexChange`，与受控 prop `currentIndex` 及 Vue `update:currentIndex` 对齐。
  - **CommentThread (Vue)**：展开事件由 `expand-change` 改为 `update:expandedKeys`（支持 `v-model:expanded-keys`），与受控 prop `expandedKeys` 及 React `onExpandedChange` 对齐。
  - **Spotlight (Vue)**：移除冗余的 `close` 事件，统一改用 `open-change`（`open-change(false)` 即关闭），与 React `onOpenChange` 对齐。

### Fixed

- 修复 React **Alert** 自动关闭时强制伪造 `MouseEvent` 的不安全类型转换：`onClose` 事件参数改为可选，自动关闭时不再传入伪造事件对象。
- 修复 React **Notification** 入场动画 `setTimeout` 缺少清理函数的问题，组件在动画前卸载不再触发对已卸载组件的状态更新。
- 修复 React **Splitter** 拖拽时分隔条高亮失效的问题：拖拽状态改用 state 追踪（与 Vue 端及 React Resizable 保持一致），按下分隔条即可正确显示拖拽高亮。
- 修复 **VirtualList** 固定高度列表在 `itemHeight` 为 0（或非正值）时可见范围计算产生 `Infinity` / `NaN` 的问题：`getFixedVirtualRange` 现对非正项高与空数据返回安全的空范围。
- 修复 **CLI** `tigercat generate test` / `generate doc-template` 在目标文件已存在时因 `logWarn` 未导入而抛 `ReferenceError` 崩溃的问题：现正确告警并跳过；同时将 CLI 源级 `tsc --noEmit` 类型检查纳入验证，避免仅靠 tsup 转译漏掉此类未定义引用。
- 修复 React 示例 `UseControlledStateDemo.tsx` 仍按旧 3-tuple 解构 `useControlledState` 导致 `pnpm example:build` 类型报错的问题：demo 与展示 snippet 改用新签名 `useControlledState(value, defaultValue, onChange)`，恢复 example 构建绿。

### Infrastructure

- **质量门禁体系**：新增分层门禁 `pnpm quality:quick` / `quality:size` / `quality:examples` / `quality:release`；新增 `pnpm release:check`（校验包版本、运行时 `version` 导出、公开 package exports、Changesets fixed group 与发布文档入口）；新增 SSR 门禁 `pnpm quality:ssr`（覆盖 Nuxt 与 Next.js 示例构建）并纳入 `quality:release`。接入测试覆盖率门禁——`vitest.config.ts` 新增 `coverage.thresholds`（lines 85 / statements 83 / functions 84 / branches 76，取实测基线略低值留漂移余量），`test:coverage` 改为 `vitest run --coverage`。覆盖率阈值（`test:coverage`）、公共 API 基线漂移（`api:baseline:check`）、references 漂移（`docs:api:check`）三道闸此前仅接 `ci.yml`，现一并纳入 `quality:release` 使本地发布链可达（与 CI 改回手动 `workflow_dispatch` 解耦），`release:check` 的必含步骤校验同步登记此三项固化为发布前红门禁。`ci.yml` 维持手动 `workflow_dispatch`（控 GitHub Actions 成本），`publish.yml` / `publish-on-tag.yml` 在发布前插入 `pnpm release:check`。
- **Tailwind v4 基线与体积预算**：新增 Tailwind v4-only 基线检查，覆盖 workspace catalog、CLI 模板版本、core peer dependency 与示例项目依赖入口。重设 size-limit 基线并扩展覆盖——随 MarkdownEditor、Table 列显隐与多组件 i18n 等新功能，full bundle 体积自然增长（已核对增量来自新功能源码而非依赖膨胀，运行时仅依赖 `@floating-ui/dom`），按实测上调三个主入口与 Button 子路径预算（Core 118 kB、Vue 284 kB、React 320 kB、Vue Button 22 kB、React Button 20 kB），并新增重组件子路径（Menu/DatePicker/Table/Tree/TimePicker 双端）与 core 子路径（`tailwind/modern`、`locales/zh-CN`、`icons/common`）的体积回归护栏。
- **API / references 漂移护栏**：新增公共 API 基线快照 `scripts/generate-api-baseline.mjs`（`pnpm api:baseline`）产出确定性的 `api-reports/public-api-baseline.json`（156 个 `*Props` 接口的 props / extends、core 导出名、双端公开组件与命名导出），CI 经「生成 + `git diff --exit-code api-reports`」捕捉删导出 / 删 prop / 改名 / 改 extends 等版本间回归——与 `validate-api.mjs`（当下双端一致性）层次互补。`validate-api.mjs` 新增「受控量双端对称（controlled-parity）」护栏：把 overlay 的 `open → update:open / onOpenChange` 规则推广为显式 parity 表（`currentIndex` / `expandedKeys` / `query` / `hiddenColumnKeys` …），校验 Vue `update:<prop>` 与 React `on<Prop>Change` 成对一致（可按条目以白名单登记有意非对称），读取主文件 + `<Comp>/` 子目录以兼容拆分组件。修复 skill references 漂移：`generate-api-docs.mjs` 的 `formatMarkdown` 改经 `prettier.resolveConfig` 加载仓库配置（`printWidth` 100），生成物即 prettier-clean 且幂等；漂移闸由仅校验 `shared/api-summary.md` 扩展为校验整个 `skills/tigercat/references` 目录；`references/cli.md` 命令表转义未转义的 `|`、`references/performance.md` 补运行时基准段。
- **依赖 / CVE 扫描**：`.github/workflows/security.yml`（周度 + 手动触发，`pnpm audit --audit-level=high`）。发布包运行时仅依赖 `@floating-ui/dom`，现存 high 级告警均来自 example/dev 工具链（Nuxt / Vite / Playwright 等，不随产物分发），故 audit 取报告式（`continue-on-error` + step summary），暴露告警集供人工分诊。`.github/dependabot.yml` 自动升级当前已停用（保留为 `.github/dependabot.yml.disabled`，控 Actions / PR 成本），故现阶段无自动补救机制，依赖升级走人工。
- **运行时基准工作流** `.github/workflows/bench.yml`（周度 + 手动触发，`pnpm bench --run --outputJson` 并上传结果 JSON 产物供人工对比）：刻意非 PR 门禁、无硬回归阈值（micro-bench 在共享 runner 抖动大，硬阈值易误红）。
- **包导出与产物清理**：收敛 `@expcat/tigercat-core` 导出——移除失效冗余的 `./types` / `./theme` 子路径导出（目标文件从未由 tsup 产出、内容已由主入口导出且无消费者），`module` 字段由不存在的 `./dist/index.mjs` 修正为实际 ESM 产物 `./dist/index.js`，`release:check` 必需导出清单同步更新。修正 `@expcat/tigercat-cli` 发布 `files`——移除不存在的 `templates` 目录（实际模板内联进 `dist/index.js`），发布包稳定提供 bin/root 入口。清理 Vue 包内 7 个未使用的内部 composable（`usePopup` / `useDateNavigation` / `useDateSelection` / `useTimeSelection` / `useTimePanelKeyboard` / `useSelectOptions` / `useSelectKeyboard`，约 1,529 LOC）及其 barrel——属死代码移除，公共 composable `useChartInteraction` / `useFormController` / `useDrag` 不受影响。
- **CLI 模板单一来源与文档职责边界**：workspace catalog 补 `@vitejs/plugin-react` / `@vue/tsconfig` / `vue-tsc`，example 项目对应依赖改用 `catalog:`，使 catalog 成为全部模板 toolchain 依赖的单一来源；`tests/core/cli.spec.ts` 扩展为「全部 13 个可 catalog 化的 `TEMPLATE_VERSIONS` ↔ catalog 对齐表」并新增 example `catalog:` 断言，把模板版本漂移变为红色测试（`tigercat` 版本仍由 `release:check` 守护）。新增 [迁移指南](docs/MIGRATION.md) 作为 Breaking change 与迁移路径集中入口；明确 Roadmap、CHANGELOG、脚本文档与 API 文档的职责边界，避免完成历史长期堆回 Roadmap。

## v1.2.0 — Breaking Changes

### Removed

- **ImagePreview**: 移除已废弃的 `visible` prop，请使用 `open`。
- **Image (Vue)**: 移除已废弃的 `preview-visible-change` 事件，请使用 `preview-open-change`。
- **Image (React)**: 移除已废弃的 `onPreviewVisibleChange` prop，请使用 `onPreviewOpenChange`。

## v1.0.0 — 正式发布 🎉

Tigercat 首个正式版本，标志着从实验阶段进入稳定阶段。从 v1.0.0 起遵循 SemVer 语义化版本：
patch — Bug 修复；minor — 新特性/新组件；major — 破坏性变更。

### 亮点

- **133+ 组件** — Vue 3 + React 双端完整实现
- **4619+ 测试** — 237 test files，覆盖单元/集成/a11y
- **WCAG 2.1 AA** — 全组件无障碍达标
- **8 语言国际化** — zh-CN/en-US/zh-TW/ja/ko/th/vi/id
- **5 套预设主题** — Default/Vibrant/Professional/Minimal/Natural + 暗色模式
- **纯 SVG 图表** — 12 种图表类型，零第三方依赖
- **CLI 脚手架** — `@expcat/tigercat-cli` 项目初始化/组件生成
- **E2E 浏览器测试** — Playwright 覆盖 Chrome/Firefox/Safari
- **Bundle Size 监控** — size-limit CI 集成，核心 < 100KB gzip
- **CI/CD 完善** — lint/build/test/size-limit/e2e 全自动化

### 自 v0.8.0 以来的变更

#### 视觉样式升级

- **圆角体系升级** — 控件级 `rounded-md→rounded-lg` (4px→8px)，容器级 `rounded-lg→rounded-xl` (8px→12px)，Modal `rounded-2xl`
- **交互动效优化** — 过渡时长 150ms→200ms，新增 `ease-out` 缓动，slide 动画距离缩短 (translate-y-4→2)
- **Focus Ring 柔化** — 聚焦环从硬色改为 `/40` 半透明，视觉更柔和
- **叠加层模糊** — Modal/Drawer 遮罩新增 `backdrop-blur-[2px]` 毛玻璃效果
- **Card 悬浮** — hover 效果从 `scale-[1.02]` 改为 `-translate-y-1 + shadow-lg`，更自然
- **Token 同步** — tokens.ts / tokens.css / 5 套主题预设圆角值全部对齐
- **新增缓动常量** — `EASING_SPRING` (弹性) / `EASING_SMOOTH` (平滑) + 对应 CSS 变量
- 涉及 40+ 组件工具文件，所有 4619 测试通过

#### 新增组件

- **InputGroup** — 输入框组合容器，支持前后缀、嵌套 Input/Select/Button
- **PrintLayout** — 打印布局组件，支持纸张尺寸、页眉/页脚、分页控制
- **ImageViewer** — 全功能图片查看器，支持缩放/旋转/翻页/键盘导航

#### 组件增强

- **Alert** — 新增 `banner` 模式、`action` 插槽/prop
- **Steps** — 新增 `labelPlacement`、`progressDot` 属性
- **Breadcrumb** — 新增 `maxItems` 折叠显示、自定义分隔符

#### API 一致性改进

- **ImagePreview**: `visible` → `open`（向后兼容，`visible` 标记为 `@deprecated`）
- **Image**: `preview-visible-change` → `preview-open-change`（Vue，向后兼容）
- **Image**: `onPreviewVisibleChange` → `onPreviewOpenChange`（React，向后兼容）
- **Calendar**: `panelChange` → `panel-change`（Vue，**不向后兼容**）
- **Rate**: `hoverChange` → `hover-change`（Vue，**不向后兼容**）

#### a11y 改进

- 新增 `createFocusTrap()` — 焦点陷阱工具，支持 Tab/Shift+Tab 循环、Escape 回调
- 新增 `announceToScreenReader()` — 屏幕阅读器公告工具（aria-live region）
- 新增 `manageLiveRegion()` — 可管理的 live region 实例
- 所有新组件通过 axe-core a11y 自动化测试

#### 测试

- 测试总量: 4619 tests / 237 test files
- 新增 ButtonGroup Vue/React 测试（23 tests）
- 增强 Dropdown Vue/React 测试（+8 tests）
- 增强 Tag Vue/React 测试（+8 tests）
- 新增 a11y-utils 测试（11 new tests）

#### 基础设施

- **E2E 测试** — Playwright 跨浏览器测试（Chromium/Firefox/WebKit）
- **Bundle Size 监控** — size-limit 集成，CI 自动检查
- **性能基准** — Vitest bench 模式，关键组件渲染性能基线
- **CI/CD** — 新增 ci.yml（PR 自动检查）、e2e.yml（浏览器测试）
- **API 一致性扫描器** `scripts/validate-api.mjs` — 全量组件 API 命名检查
- **CLI 脚手架** `@expcat/tigercat-cli` v1.0.0 — 项目初始化、组件生成

#### 文档

- 迁移说明合并到 Changelog，减少根目录历史文档数量
- 文档站升级：客户端搜索、主题切换预览
- 更新 Skills 文档（shared/props、vue/react 代码示例）

### 迁移摘要

从 v0.8.0 升级到 v1.0.0 时，Vue 侧需要注意两个事件名变更：

```diff
- <Calendar @panelChange="handler" />
+ <Calendar @panel-change="handler" />

- <Rate @hoverChange="handler" />
+ <Rate @hover-change="handler" />
```

以下 API 仍可用但已标记为弃用，建议改用 `open` 命名：

```diff
- <ImagePreview :visible="show" />
+ <ImagePreview :open="show" />

- <Image @preview-visible-change="handler" />
+ <Image @preview-open-change="handler" />
```

v0.5.0 的早期破坏性变更仍需留意：弹出层组件统一使用 `open` / `update:open`，Button 原生按钮类型使用 `htmlType` 而不是 `type`。

---

## v0.8.0 — 高级交互与业务组件

新增统一拖拽系统、Splitter、Resizable、CodeEditor、RichTextEditor、Kanban、VirtualTable、InfiniteScroll、FileManager，以及 CLI 脚手架能力；该版本主要为增量功能，无破坏性变更。

## v0.5.0 — 架构筑基

统一弹出层可见性 API（`visible` → `open`），Button 原生类型 API（`type` → `htmlType`），并引入泛型类型、类型安全事件/插槽、设计 Token 与菜单键盘导航等基础能力。
