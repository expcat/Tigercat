# 3.0.0-rc.3 Example / Admin 验收档案

状态：已归档。核实日期为 2026-10-25，完成记录见 [CHANGELOG](../CHANGELOG.md#v300-rc32026-10-24)。

本次活动核实于 2026-10-24 至 25 日。Admin 本地迁移与全功能验收已完成，17 项已发现缺陷全部闭合，其中 7 项上游原组件问题已在真实消费中复验。最终候选 `ca6fa5f2bd525152f461590f04dc10567f291c6d` 已进入远程 main，`v3.0.0-rc.3` 已推送，五包与 Example Pages 的 tag Actions 均成功；注册表消费 smoke 与线上 Example 关键流程的组合验收已通过。Admin 已升级正式注册表包并提交、推送、发布 Pages；完整静态 E2E 为 158 / 158，本地关键流程 22 个不同场景和部署后 20 个选定条件均已验收。

UI-00 计划与 UI-01 / UI-02 / UI-03 三阶段已完成总控模型视觉验收；覆盖由全矩阵初始采集和定向修复复验合成，不代表全部条件在最后修改后重新采集。RELEASE-01 曾在候选 `f6892893f49f6851814d558fce3285f3f277086b` 完成本地完整发布门禁、E2E 和 production preview。2026-10-24 最终 E2E 使用默认输出目录时清理了 `test-results/`，其中旧 Example 截图、阶段报告和日志未恢复；下文阶段数字保留为历史执行记录，不能当作当前仍可核验的原始证据。Admin 的 `artifacts/` 完整保留；最终发布门禁重新运行并另存于隔离输出目录之外。

## 阶段结果

下表保留本轮阶段范围和最终状态。历史证据根目录为 ignored 的 `test-results/visual-rc.3/`；可用性限制见上文。新的验证任务按 [测试指南](../tests/README.md#按改动范围验证) 与 [发布流程](../skills/tigercat/references/release.md) 执行。

| 阶段       | 验收范围                                               | 归档状态               |
| ---------- | ------------------------------------------------------ | ---------------------- |
| UI-01      | 外壳、basic、layout，40 页 / 框架                      | 模型视觉验收通过       |
| UI-02      | form、navigation、feedback，53 页 / 框架               | 模型视觉验收通过       |
| UI-03      | data、charts、advanced、composite、hooks，54 页 / 框架 | 模型视觉验收通过       |
| RELEASE-01 | 本地发布门禁、E2E 和构建预览，候选变更后重跑           | 自动门禁与本地验收完成 |
| ADMIN-01   | 本地包接入与业务用法迁移                               | 本地接入完成           |
| ADMIN-02   | 全功能验收及上游缺陷复验                               | 已发现缺陷全部闭合     |
| RELEASE-02 | tag Actions、五包注册表、消费 smoke 与 Example Pages   | 发布与远程验收完成     |
| ADMIN-03   | 正式 rc.3 升级、本地门禁与 Pages                       | 发布与线上验收完成     |

ADMIN-01 已核验本地三包内容与 peer 来源，完成双端 AspectRatio 用法、折叠菜单与真实安装版本展示迁移。类型、API / Mock 双端构建、12 项现有交互和 8 项局部布局断言通过；新增验收文档链接 17 / 17 通过，全量文档末次有两个既有 GitHub 外链返回 Status 0，未冒称全量通过。Admin 已登记双端各 37 页及 43 个公共组件文件，清单见 `Tigercat_Admin/docs/frontend-rc3-validation.md`；随后进入 ADMIN-02 复验。上游已复现并修复 React Upload StrictMode 控制器重用、挂载阶段 ref 提交被忽略，以及自定义上传取消后仍显示上传中。React / Vue / Core Upload 定向测试 129 项通过；第二轮包的双端桌面 / 手机实际上传路径和 68 张重要状态原图已复验通过，ADMIN-UP-01 / 02 闭合。FunnelChart 比例口径与 FileManager 加载后播报修复已在第三轮真实消费复验闭合，相关 181 项测试及三包构建通过。WorkflowActionBar 的操作与“更多”确认气泡首选起端对齐，第四轮双端 14 条条件、56 张原图及实际互动复验通过；ADMIN-UP-01 至 05 全部闭合。

Shell 补验发现 ADMIN-UP-06：Tour 在 ConfigProvider 延后挂载气泡时漏掉初次测量，手机首步的下一步 / 关闭按钮落在屏外。第五轮包已在真实消费中验证首步、全部步骤、缩放、关闭、完成持久化与焦点恢复；实际检查 38 张原图时又发现 ADMIN-UP-07：375px 手机目标步骤的箭头不随气泡偏移，左右空间均不足时客服气泡覆盖目标。Core 已统一修复方向选择和箭头偏移，两框架绑定同一 helper；87 项相关测试、三包构建与独立代码审查通过。第六轮三包已核对实际安装字节和 Core peer；React / Vue × 1440 浅色、375 / 320 暗色的实际步骤、缩放、关闭、完成持久化与焦点复验通过，56 张原图已按原像素检查，目标零重叠且箭头中心误差不超过 1px。证据为 `Tigercat_Admin/artifacts/admin-02/parent-visual-review/shell-remaining/round-06-tour/`；ADMIN-UP-01 至 07 全部闭合。Admin 默认 296 条页面条件已绑定实际图审；其余业务互动、组件总表与本地门禁的最新关闭状态由 `Tigercat_Admin/docs/frontend-rc3-validation.md` 及 `artifacts/admin-02/coverage.json` 记录。不据此前门禁宣称最终候选已验收。

UI-02 已完成总控验收：424 个页面条件、1368 个演示条件、342 个真实 demo；before 400 表 / 2388 图、after 68 表 / 392 图及 Anchor 补证均已实际图审。最终 212 条交互为 196 条普通视觉通过及 16 条组合证据通过，逐源索引包含 876 张实际审阅图片；18 项缺陷闭合，未处理项为零。总控核对 4384 个文件引用、全部来源与替代关系后记录 `orchestrator/ui02-acceptance.json`，详细报告为 `ui-02/report.md`。历史失败保留，212 条聚合不冒称一次整体 exit 0。Input / Modal 六主题、320px 日期与表单、章节导航的独立补证已计入相应索引，完整发布门禁结果见 RELEASE-01 报告。

UI-03 前置定向验证已完成：Table01 窄屏列宽及 DemoPage 长标题折行修复见 `orchestrator/narrow-ui03/report.md`；WorkflowViewer 真实触摸内部横滚见该目录 `viewer-scroll/accepted/`；BarChart 六主题 24 条条件 / 48 图见 `orchestrator/themes-bar-chart/review-final.json`。UI-03 引用这些证据并检查其余全部页面和交互，不重复采集已验收的定向矩阵。

历史阶段报告分别记录「已实现」「自动门禁通过」「等待人工验收」，总控看过有效截图和报告才确认视觉通过。交付摘要已归入 [CHANGELOG](../CHANGELOG.md)，本任务已从 [ROADMAP](ROADMAP.md) 删除；本档案保留事实与证据限制。

## 路由与分组清单

事实源为共享导航 [app-config.ts](../examples/example/shared/app-config.ts) 及 [Vue router](../examples/example/vue3/src/router.ts)、[React router](../examples/example/react/src/router.tsx)。两端各 146 个演示路由，加首页 `/` 各 147 页，总计 294 个框架页面；两端与导航集合一致、无重复。

React 有 421 个 `demo.json` 模块；Vue 有 420 个，覆盖 145 条路由。Vue 的 `use-controlled-state` 是直接渲染的说明与受控 / 非受控 Counter 页面，没有 iframe，属于有意的框架差异，仍须检查；不把它补成 React hook。其余页面按实际 `data-demo-id` / `demo.json` 清点全部区块，不能只看每页第一个示例。

## 历史覆盖矩阵与证据

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

本轮使用 Node `v25.5.0`、pnpm `11.9.0`、Playwright `1.61.1` 与 Chromium `149.0.7827.55`。最终候选的验证结果见下节；这些结果是历史记录，不代表后续文档整理重新运行了完整发布门禁。

最终 E2E 使用独立的 `--output test-results/e2e-rc3`，报告、日志和本地包存放在 Playwright 输出目录之外。开发与发布命令分别以 [示例指南](../examples/README.md)、[测试指南](../tests/README.md#按改动范围验证) 和 [发布流程](../skills/tigercat/references/release.md) 为准。

## 版本、远程与发布边界

初始基线与远程 main 为 `804fb3a55fc83893af085b55d617e26b256cd7ea`，origin 为 `https://github.com/expcat/Tigercat.git`。本地最初候选为 `f6892893f49f6851814d558fce3285f3f277086b`，Admin 复验后的包源码候选为 `58b00c4568941b7d5bc5c110f3f1ce74a4296066`；根包与五个发布包已统一为 `3.0.0-rc.3`，两个私有 SPA Example 版本为 `1.5.0`。最终发布候选为 `ca6fa5f2bd525152f461590f04dc10567f291c6d`。同一干净提交的 `quality:release` 通过（9321 项单测 / 561 个文件，另跑 45 项 a11y / 3 个文件，五包构建与 tarball、四种消费示例 / SSR）；完整 Chromium / mobile E2E 为 50 / 50。最终日志和报告单独保存于本对话的 `rc3-release/` 归档目录，位于 Playwright 清理目录之外。

发布包固定为 `@expcat/tigercat-{core,vue,react,cli,mcp}`。五包 `3.0.0-rc.3` 均已在 npm registry 核验，均为 `next=3.0.0-rc.3`、`latest=2.9.4`；`pnpm smoke:published` 已实际安装注册表包并通过导出、tree-shaking、Vue / React SSR、CLI / MCP 检查。初始传播期间的部分 404 保留为历史，后续完整 packument 已确认五包全部上线。

[真实 tag workflow](https://github.com/expcat/Tigercat/blob/main/.github/workflows/publish-on-tag.yml) 在 push `v*` 时确认 tag 位于默认分支历史，安装、构建并执行 `pnpm exec changeset publish --tag next` 发布预发布版本；五包上线后调整 / 检查 dist-tag。稳定版才走 latest。Pages 同 tag 触发 [deploy workflow](https://github.com/expcat/Tigercat/blob/main/.github/workflows/deploy.yml)。另外两个手动 workflow 仅拒绝分支发布 / 自动升版，不是 rc.3 入口。

rc.3 的 [Publish Packages run](https://github.com/expcat/Tigercat/actions/runs/40106835987) 与 [Example Pages run](https://github.com/expcat/Tigercat/actions/runs/40106835980) 均为 success，head SHA 均为最终候选。GitHub Deployments API 另核实 Pages deployment `7300576126`、环境 `github-pages`、ref `v3.0.0-rc.3` 与相同 SHA；最新状态 `20492466045` 为 success，并指向该 run 的 deploy job `120910486698`。

线上根页与 `/index.html` 均为 HTTP 200，正文与候选 `examples/index.html` 完全一致（SHA-256 `6d6c35d1a7511cea47ae81d3b22a602e9dad659615a38c65fa9a952298e3f7b2`）。MCP manifest 为 rc.3，version commit 为最终候选，404 个镜像文件摘要均与候选清单一致。Vue / React × 1440 浅色桌面 / 375 暗色触控手机的 Funnel 比例与明暗切换、Upload 成功 / 移除、FileManager 搜索 / 清空 / 播报、Workflow 确认气泡 / 取消 / 焦点返回、Tour 步骤 / 完成 / 焦点返回，共 20 条部署后条件经组合证据接受：19 条为自动互动加实际原图检查，React 桌面静态 Funnel 为正确渲染原图加实际主题切换记录；不能称为一次 20 / 20 自动通过。证据索引为本对话 `rc3-release/live-example-acceptance.json`。

线上首次及补采的模块加载超时、错误测试断言和被终止的运行均保留：静态 Funnel 不支持选择，早期脚本错误断言其交互属性，未改写原失败；手机 Vue 上传成功项最初不在可见截图内，立即滚动的补图仍未有效绘制，另在滚动稳定后确认成功条目和原生移除。部分 GitHub Pages IP 在本机连接超时，后续浏览器使用可连接的 `185.199.109.153`，保留真实 origin 且不拦截正文；未宣称冷加载始终成功。旧 React 手机图的设置面板处于打开状态，关键组件控件可见；关闭态外壳由后续 Funnel 图补证。该线上定向矩阵不替代历史全量本地视觉矩阵。

本轮普通推送 main 并创建、推送 `v3.0.0-rc.3`；没有强推或重打标签。发布由 tag Actions 执行，后续通过 `pnpm smoke:published`、五包 dist-tag 和线上关键流程复验。

## Tigercat_Admin 验收与发布结果

本轮先完成本地包引用、业务用法迁移及全功能验收；上游组件问题在 Tigercat 根因修复并重新打包消费复验。rc.3 注册表发布与远程验收成功后，Admin 移除临时覆盖，升级正式包并完成自身本地门禁与 Pages 验收。

正式升级已完成：React / Vue / MockApi 清单、release-age 例外与 lock 均固定注册表 rc.3，三个临时 file overrides 已移除。普通与冻结安装、双端类型检查、API / Mock / Pages 构建通过；现有静态 E2E 为 158 / 158。关键流程 22 个不同场景按首次 21 / 22 与 Vue 320 定向 1 / 1 组合接受，首次等待超时保留，未改产品源码。已验收的生产源码集合摘要继续为 `a6de8e0c67baca84417914a110601b714cd66b5138db7a4b1726ec0e52512560`；此前后端 271 / 271 和真实 API 28 / 28 不改称本轮重跑。

Core / React / Vue 的 74 / 534 / 532 个实际安装文件逐个匹配正式 registry tarball，SHA512 与 registry 及 lock 一致，框架 peers 和共享 Core 实例均正确。正式构建与历史本地包并非逐字节相同：Core 与 Vue Tour 只有调用换行，后者使 chunk 改名并更新入口 import；React 7 / Vue 143 个声明文件的顺序差异经 TypeScript AST 核对等价。上游生产源码在已消费的 `58b00c4` 至发布候选 `ca6fa5f` 之间未变；不能据此把不同构建归档说成字节相同。详细来源和差异记录在 Admin 的 `artifacts/admin-02/registry-rc3/`。

Admin [提交 `be8a2a6`](https://github.com/expcat/Tigercat_Admin/commit/be8a2a6b7218a78fca9294649fa45e872a89cea1) 已普通推送 main；总控独立核对 58 个提交文件均与已审候选摘要一致，未改手动工作流。[Pages run 40110051841](https://github.com/expcat/Tigercat_Admin/actions/runs/40110051841) 为 success；GitHub Deployments API 的 `github-pages` deployment `7301056234`、status `20494404909` 和 deploy job `120919796631` 均成功并关联相同提交。总控另取得 [Admin 入口](https://expcat.github.io/Tigercat_Admin/) 及 `/react/`、`/vue/` 的 HTTP 200 正文，首次 React 连接超时与定向成功分别保留。入口正文 SHA-256 为 `1dcaf97686b30af1860657ce98ace31d904ddf02346bf53ce5e72bd4ae381e30`；两端 HTML、主 JS 和 CSS 共 6 个线上资源与已验本地构建一致。

部署后，React / Vue × 1440 浅色桌面 / 375 暗色触控手机的五类流程，共 20 个唯一条件经真实操作与原图检查接受：登录并完成全部 Tour 步骤；批量状态取消、禁用持久化、恢复和禁止停用当前用户；通知铃铛与页面未读数同步；文件搜索 3 → 1 → 0 → 3；审批确认、转交人选择、Escape 关闭和焦点返回。手机实际触控参数已核对，Tour 和转交气泡边界与按钮完整可见。总控独立检查选定条件的原图、结果来源和摘要。

该结果由多次有效运行合成，不冒称一次 20 / 20 自动运行。桌面批量状态取 `online-round-03`，React 手机四条业务流取 `online-round-01`；React 桌面 Tour 使用 `online-round-03` 与 `online-session-04` 的有效记录，其余三条流程取 `online-session-04`，Vue 桌面其余流程取 `online-vue-session-04`，React 手机 Tour 取 `online-react-mobile-session-05`；Vue 手机五项取本对话 `rc3-release/admin-live-vue/results.json` 与 `admin-online-vue-mobile-acceptance.json`。前述 Admin 相对路径均位于 `artifacts/admin-02/registry-rc3/`，完整索引为 `online-acceptance.json` 与 `online-visual-review.json`；总控独立索引为本对话 `rc3-release/admin-online-parent-acceptance.json`，逐源核对结果为 `admin-online-index-audit.json`。模块加载超时、同文档跳转返回空 response 的脚本错误和未稳定的加载截图均保留并排除；部分后续截图保留前一步成功通知，关键正文与互动状态实际可见。线上定向复验不替代此前 74 个功能页面、43 个公共组件文件与 296 个历史默认条件的本地全量验收。

Admin 最终归档[提交 `cddbf31`](https://github.com/expcat/Tigercat_Admin/commit/cddbf312e2131a8a50a84a2badf7d576b8081623) 已普通推送，独立查询远程 main 精确匹配；仅更新 `Roadmap.md` 与 `docs/frontend-rc3-validation.md`，工作区干净。该文档提交不重新部署产品，实际 Pages 仍对应已验收的 `be8a2a6`。上游归档同样只更新文档，`v3.0.0-rc.3` 保持指向发布候选 `ca6fa5f`。
