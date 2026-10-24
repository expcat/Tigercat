# 3.0.0-rc.3 Example 视觉验收

本次活动计划，核实于 2026-10-24。总控依次开启下表对话并综合验收；执行对话不再派生对话。UI-00 计划与 UI-01 / UI-02 / UI-03 三阶段已完成总控模型视觉验收；覆盖由全矩阵初始采集和定向修复复验合成，不代表全部条件在最后修改后重新采集。RELEASE-01 已在候选 `f6892893f49f6851814d558fce3285f3f277086b` 完成本地完整发布门禁、E2E 和 production preview，证据为 `test-results/visual-rc.3/release-01/report.md`。2026-10-24 用户调整顺序：先完成 Tigercat_Admin 本地引用、迁移与全功能视觉验收，反复修复和复测上游原组件，再发布 rc.3，最后由 Admin 升级注册表包并发布 Pages。远程发布尚未开始。

## 顺序阶段

每个阶段输入为本文件、当前工作区 / 分支差异及前阶段报告；开工时重新核对实际源码和状态。视觉阶段都包含发现、根因定位、最小修复和同条件复验，不把缺陷留到最后集中打补丁。证据根目录为现有 ignored 目录 `test-results/visual-rc.3/`，无需新增测试框架、永久截图基线或依赖。

| 对话                          | 负责范围                                                                               | 验收与输出                                                                                                                                                                                                                                                                     | 当前状态            |
| ----------------------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------- |
| UI-01 外壳与基础              | 首页、basic、layout，共 40 页 / 框架；导航、主题、语言、章节锚点和 Playground 共用外壳 | 下文矩阵中本范围全部页面 / 演示区块；展开与折叠侧栏、移动菜单遮罩关闭、设置、主题与语言持久化、内层滚动和源码编辑 / 运行 / 重置 / 编译错误保留上次预览。产出 `ui-01/report.md`、覆盖清单、前后截图及定向检查日志                                                               | 总控视觉验收通过    |
| UI-02 表单与浮层              | form、navigation、feedback，共 53 页 / 框架；下拉、焦点与嵌套层一起验收                | 全范围基础矩阵；表单校验 / 提交 / loading、选择器 / 日期时间、菜单键盘、Modal / Drawer 中的选择器、边缘碰撞 / 滚动 / 关闭 / 焦点返回。产出 `ui-02/` 下同类证据                                                                                                                 | 总控视觉验收通过    |
| UI-03 数据与复杂交互          | data、charts、advanced、composite、hooks，共 54 页 / 框架                              | 全范围基础矩阵；表格 / 虚拟列表 / 图表的滚动与选择、编辑器、拖放 / 缩放 / 触控、工作流 / 任务板 / 文件管理、组合表单和通知。复验前两阶段共享修复的本阶段消费者；产出 `ui-03/` 下同类证据                                                                                       | 总控视觉验收通过    |
| RELEASE-01 本地验收与发布准备 | 输入三份视觉报告及累计 diff；核完缺陷、版本和发布记录，验证最终候选提交                | 全路由矩阵无未处理缺口；相关现有测试通过；rc.3 版本与文档准备完整；在同一最终提交运行 `quality:release`、`e2e`，并在 production preview 复验受改动页面。输出 `release-01/report.md`、最终 SHA、命令退出码 / 日志、发布 diff / 包清单 / tag / dist-tag 和待执行命令，交总控审阅 | 本地验收完成        |
| ADMIN-01 本地引用与迁移       | 在 Tigercat_Admin 新对话消费已验证本地包，核对用法与新增能力                           | 类型、相关现有测试和构建通过，给出真实路由、组件及交互验收清单                                                                                                                                                                                                                 | 本地接入完成        |
| ADMIN-02 全功能视觉验收       | ADMIN-01 完成后启动；Admin 修复业务用法，上游由本对话根因修复                          | desktop / mobile、明暗和真实互动证据完整；每轮重新构建、引用与复测，全部已发现问题闭合后复核最终发布候选                                                                                                                                                                       | 执行中              |
| RELEASE-02 发布与远程验收     | 输入 Admin 验收、最终候选发布门禁及总控取得的有效确认口令                              | 推送已验证提交与 tag，跟进 Publish Packages / Pages；五包版本和 dist-tag 正确，`smoke:published` 通过，线上 Example 可访问且关键状态可用                                                                                                                                       | 待 Admin 验收与口令 |
| ADMIN-03 rc.3 升级与 Pages    | 输入 rc.3 tag / SHA、Action 与注册表消费验证结果                                       | 移除临时本地引用，升级注册表 rc.3；本地门禁与关键交互复测通过后提交、推送并验证 Pages 实际部署                                                                                                                                                                                 | 待 rc.3 发布        |

ADMIN-01 已核验本地三包内容与 peer 来源，完成双端 AspectRatio 用法、折叠菜单与真实安装版本展示迁移。类型、API / Mock 双端构建、12 项现有交互和 8 项局部布局断言通过；新增验收文档链接 17 / 17 通过，全量文档末次有两个既有 GitHub 外链返回 Status 0，未冒称全量通过。Admin 已登记双端各 37 页及 43 个公共组件文件，清单见 `Tigercat_Admin/docs/frontend-rc3-validation.md`；ADMIN-02 已启动，用户已明确授权现有 Playwright。上游已复现并修复 React Upload StrictMode 控制器重用、挂载阶段 ref 提交被忽略，以及自定义上传取消后仍显示上传中。React / Vue / Core Upload 定向测试 129 项通过；第二轮包的双端桌面 / 手机实际上传路径和 68 张重要状态原图已复验通过，ADMIN-UP-01 / 02 闭合。FunnelChart 比例口径与 FileManager 加载后播报修复已在第三轮真实消费复验闭合，相关 181 项测试及三包构建通过。WorkflowActionBar 的操作与“更多”确认气泡首选起端对齐，第四轮双端 14 条条件、56 张原图及实际互动复验通过；ADMIN-UP-01 至 05 全部闭合。

Shell 补验发现 ADMIN-UP-06：Tour 在 ConfigProvider 延后挂载气泡时漏掉初次测量，手机首步的下一步 / 关闭按钮落在屏外。第五轮包已在真实消费中验证首步、全部步骤、缩放、关闭、完成持久化与焦点恢复；实际检查 38 张原图时又发现 ADMIN-UP-07：375px 手机目标步骤的箭头不随气泡偏移，左右空间均不足时客服气泡覆盖目标。Core 已统一修复方向选择和箭头偏移，两框架绑定同一 helper；87 项相关测试通过，等待第六轮包消费复验。Admin 业务修复与证据总表仍在收尾。不据此前测试或截图宣称最终候选已验收。

UI-02 已完成总控验收：424 个页面条件、1368 个演示条件、342 个真实 demo；before 400 表 / 2388 图、after 68 表 / 392 图及 Anchor 补证均已实际图审。最终 212 条交互为 196 条普通视觉通过及 16 条组合证据通过，逐源索引包含 876 张实际审阅图片；18 项缺陷闭合，未处理项为零。总控核对 4384 个文件引用、全部来源与替代关系后记录 `orchestrator/ui02-acceptance.json`，详细报告为 `ui-02/report.md`。历史失败保留，212 条聚合不冒称一次整体 exit 0。Input / Modal 六主题、320px 日期与表单、章节导航的独立补证已计入相应索引，完整发布门禁结果见 RELEASE-01 报告。

UI-03 前置定向验证已完成：Table01 窄屏列宽及 DemoPage 长标题折行修复见 `orchestrator/narrow-ui03/report.md`；WorkflowViewer 真实触摸内部横滚见该目录 `viewer-scroll/accepted/`；BarChart 六主题 24 条条件 / 48 图见 `orchestrator/themes-bar-chart/review-final.json`。UI-03 引用这些证据并检查其余全部页面和交互，不重复采集已验收的定向矩阵。

阶段报告分别记录「已实现」「自动门禁通过」「等待人工验收」，总控看过有效截图和报告才确认视觉通过。最终完成后把交付摘要归入 [CHANGELOG](../CHANGELOG.md)，从 [ROADMAP](ROADMAP.md) 删除本任务；本活动文档标记「已归档」并链接完成记录，不把历史复制回路线图。既有 Cron 摘要增强不自动并入此次任务；若视觉证据显示该页面存在实际缺陷，按缺陷处理。

## 路由与分组清单

事实源为共享导航 [app-config.ts](../examples/example/shared/app-config.ts) 及 [Vue router](../examples/example/vue3/src/router.ts)、[React router](../examples/example/react/src/router.tsx)。两端各 146 个演示路由，加首页 `/` 各 147 页，总计 294 个框架页面；两端与导航集合一致、无重复。下表 slug 对应 `#/<slug>`，按导航实际分组，不按 router 注释分组（`splitter` 属于 advanced）。

| 导航组            | 数量 | 阶段  | 完整 slug                                                                                                                                                                                                                                                                                   |
| ----------------- | ---- | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| basic 基础        | 27   | UI-01 | copy-button, button, split-button, config-provider, icon, link, inplace, text, code, kbd, highlight, marquee, image, image-compare, image-cropper, gallery, image-preview, avatar, badge, tag, empty, result, qrcode, statistic, rate, segmented, watermark                                 |
| layout 布局       | 12   | UI-01 | layout, grid, space, divider, card, descriptions, list, skeleton, scroll-area, masonry, aspect-ratio, print-layout                                                                                                                                                                          |
| form 表单         | 26   | UI-02 | input, input-number, input-group, textarea, checkbox, radio, switch, slider, select, auto-complete, cascader, tree-select, color-picker, color-swatch, cron-editor, signature, number-keyboard, input-otp, tags-input, mask-input, mentions, transfer, datepicker, timepicker, upload, form |
| navigation 导航   | 17   | UI-02 | menu, breadcrumb, dropdown, context-menu, navigation-menu, page-header, tabs, steps, pagination, anchor, backtop, affix, tour, float-button, fullscreen-button, spotlight, scroll-spy                                                                                                       |
| feedback 反馈     | 10   | UI-02 | alert, message, modal, popconfirm, popover, tooltip, notification, drawer, loading, loading-bar                                                                                                                                                                                             |
| data 数据展示     | 10   | UI-03 | table, data-export, virtual-table, timeline, progress, tree, collapse, carousel, calendar, countdown                                                                                                                                                                                        |
| charts 图表       | 15   | UI-03 | waterfall-chart, bar-chart, line-chart, area-chart, pie-chart, scatter-chart, radar-chart, sankey-chart, funnel-chart, gauge-chart, heatmap-chart, treemap-chart, sunburst-chart, org-chart, gantt                                                                                          |
| advanced 高级交互 | 10   | UI-03 | drag, splitter, resizable, virtual-list, infinite-scroll, code-editor, rich-text-editor, markdown-editor, file-manager, image-annotation                                                                                                                                                    |
| composite 组合    | 16   | UI-03 | app-shell, data-table-with-toolbar, form-wizard, schema-form, workflow-designer, workflow-timeline, workflow-viewer, workflow-detail-shell, chat-window, comment-thread, activity-feed, assignee-picker, notification-bell, notification-center, crop-upload, task-board                    |
| hooks             | 3    | UI-03 | use-drag, use-controlled-state, use-chart-interaction                                                                                                                                                                                                                                       |

React 有 421 个 `demo.json` 模块；Vue 有 420 个，覆盖 145 条路由。Vue 的 `use-controlled-state` 是直接渲染的说明与受控 / 非受控 Counter 页面，没有 iframe，属于有意的框架差异，仍须检查；不把它补成 React hook。其余页面按实际 `data-demo-id` / `demo.json` 清点全部区块，不能只看每页第一个示例。

## 最小覆盖矩阵与证据

| 维度               | 必须覆盖                                                                                                         | 范围                                                                                                                                                                             |
| ------------------ | ---------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 框架 × 视口 × 明暗 | Vue / React × desktop 1440×900 / mobile 390×844（触控）× light / dark                                            | 默认 preset、zh-CN 下全部 147 页 / 框架，共 1176 个页面条件；逐段滚动检查全部演示区块，包括页尾。每个条件标记通过 / 缺陷 / 阻塞和截图路径                                        |
| 交互状态           | 正常、hover / 可见键盘焦点、选中 / 展开、禁用 / 只读、loading、error / empty / success；只检查组件实际支持的状态 | 已展示的变体随全区块扫描；需触发的状态按上表阶段，至少在两框架的 desktop light 与 mobile dark 跑各独立交互家族，记录操作和结果。浮层需打开后看边缘与嵌套层，不能用关闭态截图代替 |
| 其余主题 preset    | modern、vibrant、minimal、high-contrast、professional、natural                                                   | 两框架各在 button / input / modal / bar-chart 代表面切换，light / dark；其中 mobile 检查设置与浮层。验证外壳和 iframe 实际同步，不扩成全部路由 × 7 preset                        |
| 窄屏与语言         | 320px；zh-TW / en-US                                                                                             | 两框架检查外壳、form、table、modal、workflow-detail-shell 等密集或长文案面；在 767/768 和 1023/1024px 两侧检查外壳断点。问题涉及的条件追加复验，不做全量语言笛卡尔积             |

外壳实际在 767px 以下使用移动菜单，1023px 以下使用紧凑设置。主滚动容器在 `main` 内；Playground 又有独立 iframe 和懒加载。每个区块先滚入视口，等待 `ready` 并确认画面稳定，再捕获实际可见状态；单张 `fullPage` 不代表已覆盖内层滚动内容。交互须在对应 iframe 内操作。编译 / runtime 错误、console error 与失败请求都记录并判断根因；不得把空白、loading 或报错图标记通过。

每阶段使用一个简单 Markdown / JSON / CSV 覆盖清单即可：`framework, route, demo-id/section, viewport, preset, scheme, language, state, result, screenshot`。截图名含这些条件和 `before/after`；原图逐张或以可读拼图检查，可疑处回看原图。报告记录 URL、源码 SHA / 未提交 diff、复现步骤、可见问题、责任层、全部同类消费者、修复位置、前后截图、实际运行的测试与结果。截图和本地报告留在阶段目录，不提交 `test-results/`。

根因与架构边界遵循 [CONTRIBUTING](../CONTRIBUTING.md#根因修复与架构约束)：先解释根因、责任层及同类消费者，形成可用于 Issue / PR 的说明；跨组件 / 框架在 core 或现有共享适配层修复，并核对全部消费者与两端行为。不能用组件专属覆盖、Modal / Drawer 特判、业务侧规避或第二套实现。现有测试足够就不新增；缺少本次行为覆盖时，最多补一条主路径和必要的一条关键失败路径，不建设新测试体系。

## 运行与验证

本次核实 Node `v25.5.0`、pnpm `11.9.0`，项目已有 `@playwright/test 1.61.1`；Chromium 已实际 headless 启动成功（`149.0.7827.55`）。当前没有已核实可用的 Browser / IAB 表面，后续可直接用现有 Playwright 在 `test-results/` 写一次性 capture 脚本、manifest 和截图，无需安装依赖或继续查找浏览器插件。已有 Product Design preflight 未发现保存上下文；以当前 Example、tokens 和同类组件为视觉依据，不另行设计风格。

交互修复时可分别运行 `pnpm example:vue` 与 `pnpm example:react`，开发地址为 `http://localhost:5173/#/<slug>` 与 `http://localhost:5174/#/<slug>`。发布验收使用真实构建产物：

```bash
pnpm example:build
```

分别在两个终端启动（这些端口也由 E2E 使用，跑 E2E 前停止手动 preview）：

```bash
pnpm --filter @expcat/tigercat-example-vue3 preview --host 127.0.0.1 --port 4173 --strictPort --base /Tigercat/vue/
```

```bash
pnpm --filter @expcat/tigercat-example-react preview --host 127.0.0.1 --port 4174 --strictPort --base /Tigercat/react/
```

对应 `http://127.0.0.1:4173/Tigercat/vue/#/<slug>` 与 `http://127.0.0.1:4174/Tigercat/react/#/<slug>`。验证命令按 [tests/README](../tests/README.md#按改动范围验证) 与 [scripts/README](../scripts/README.md) 选择，修复时先运行受影响的现有单文件 / 分组测试及必要生成物检查。

RELEASE-01 在最终候选提交上依次运行并保留退出码和日志：

```bash
pnpm quality:release
pnpm e2e
```

`quality:release` 已包含 release 元数据、静态 / API / exports / tokens 漂移、全部 Example 模块编译、一次五包构建、完整单测与独立 a11y、tarball 消费及四个示例构建 / SSR 验证。`e2e` 再构建两端工作区 Example 并启动 production preview，运行 Chromium 与 mobile-chromium；已有 runtime sweep 只跑每条路由首个 sandbox，不能代替上述全区块视觉检查。`pnpm e2e:full` 是按需 Firefox / WebKit 抽查，`pnpm e2e:smoke` 只查 shell，均不代替必跑命令。不要为同一最终提交重复单独跑已经包含的重门禁；代码再变时重验受影响范围并在新的候选提交运行发布门禁。

用户要求的「CI 对应测试」在本地执行，现有约定明确禁止把测试或 `quality:release` 接入 Action；不新建 CI 测试流程。

## 版本、远程与发布边界

初始基线与远程 main 为 `804fb3a55fc83893af085b55d617e26b256cd7ea`，origin 为 `https://github.com/expcat/Tigercat.git`。本地候选为 `f6892893f49f6851814d558fce3285f3f277086b`，根包与五个发布包已统一为 `3.0.0-rc.3`；两个私有 SPA Example 版本为 `1.5.0`。发布前重新核对远程与最终候选，Admin 验收产生上游修复时更新候选及发布门禁。

发布包固定为 `@expcat/tigercat-{core,vue,react,cli,mcp}`。2026-10-24 重新查询 npm registry：五包均有 rc.2、没有 rc.3，均为 `next=3.0.0-rc.2`、`latest=2.9.4`。`git ls-remote` 发现 rc.1 / rc.2 tag，没有 rc.3；GitHub rc.3 Release 查询返回 404。本地 `pnpm release:check` 对 rc.3 通过，不代表远程已发布。发布前必须重新查远程，避免覆盖后来出现的版本或 tag。

准备命令为 `pnpm sync:version 3.0.0-rc.3`，事实源是 [sync-version.mjs](../scripts/sync-version.mjs)：同步根包、五包和 `examples/index.html` 版本标记。再补齐 `CHANGELOG.md` 与 `docs/MIGRATION.md` 的 `## v3.0.0-rc.3`；无 breaking 也据实说明。按实际变更同步 API / Example / skill 文档，生成物只重跑生成器；检查 lockfile 是否实际受影响，不无故改写。消费掉的 changeset notes 按现有 [release 流程](../skills/tigercat/references/release.md) 处理。

[真实 tag workflow](https://github.com/expcat/Tigercat/blob/main/.github/workflows/publish-on-tag.yml) 在 push `v*` 时确认 tag 位于默认分支历史，安装、构建并执行 `pnpm exec changeset publish --tag next` 发布预发布版本；五包上线后调整 / 检查 dist-tag。稳定版才走 latest。Pages 同 tag 触发 [deploy workflow](https://github.com/expcat/Tigercat/blob/main/.github/workflows/deploy.yml)。另外两个手动 workflow 仅拒绝分支发布 / 自动升版，不是 rc.3 入口。

已核实 rc.2 的 [Publish Packages run](https://github.com/expcat/Tigercat/actions/runs/39775713102) 与 [Pages run](https://github.com/expcat/Tigercat/actions/runs/39775712981) 均 success；新版本必须核验自己的 run 和 head SHA。无 `gh` CLI，可继续用现有 GitHub connector 读取 runs / jobs / logs，不安装工具。

RELEASE-01 先准备完整 diff、候选提交、门禁结果、五包清单、tag、dist-tag、以下命令及影响范围，之后才由总控索取用户指定并回复的确认口令。当前没有有效口令，不得推送触发发布的 tag 或执行 npm publish；不在计划阶段提问。口令匹配后，确认本地 main 就是已验证候选提交，方可执行：

```bash
git push origin HEAD:main
git tag -a v3.0.0-rc.3 -m 'Release 3.0.0-rc.3'
git push origin refs/tags/v3.0.0-rc.3
```

若 main 推送发生冲突或合并改变提交，先验证最终提交，再创建 / 推送 tag，不强推已有 tag。不运行本地 `release` / `release:next` / `release:canary`、`npm publish` 或 `changeset publish`，包发布交给 tag Action。

发布后运行 `pnpm smoke:published`（读取根包 rc.3 版本），逐包核实 `npm view @expcat/tigercat-<包>@3.0.0-rc.3 version` 和 `npm view @expcat/tigercat-<包> dist-tags --json`，要求五包 `next=3.0.0-rc.3`、`latest=2.9.4`。Pages 验收 `https://expcat.github.io/Tigercat/` 及 `/vue/`、`/react/` 的外壳、明暗切换和修复过的关键页面。Action 绿灯不代替 registry、消费 smoke 与实际页面核验。

## Tigercat_Admin 交接

按 2026-10-24 用户最新指令，Admin 验收移至发布前，注册表升级和 Pages 发布留在 rc.3 远程验收后。已创建项目对话 `01a16d8a-6d1d-7ce0-8652-09397cc0b813`，先执行本地包引用与用法迁移，完成后由本对话启动全功能视觉验收。新对话先读取 Admin 自身 AGENTS、分支差异、依赖与实际路由；有 `.codegraph/` 才查询，不主动索引。对 Admin 的真实页面和关键业务流执行 desktop / mobile、明暗、键盘焦点、浮层及复杂互动检查，保留截图与运行证据，再跑该仓库已有本地门禁。

Admin 业务问题在 Admin 根因修复；上游原组件问题报告到本对话，定位责任层并修复全部同类消费者，随后重新构建本地包、交回 Admin 重新引用与复测，直到已发现问题全部闭合。不用 Admin CSS 覆盖或兼容层掩盖上游问题。发布前核实 Admin 消费的包与最终候选一致，不把 workspace Example 验收当成 Admin 验收。

rc.3 远程验收成功后，交接 tag / SHA、两条 Action run、五包与 dist-tag / smoke 结果、修复清单及证据。Admin 移除临时本地覆盖，升级注册表 `3.0.0-rc.3`，完成本地门禁和关键流程复测，再按用户授权提交、推送并发布 Pages；最终核实实际部署 SHA 和线上页面。
