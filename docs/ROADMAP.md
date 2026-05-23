# Tigercat 路线图

<!-- LLM-INDEX
type: active-roadmap
scope: full development roadmap
verified-date: 2026-05-17
source: project audit and planning
-->

已完成条目直接删除，剩余工作合并到新待办。

> **最近完成**（2026-05-24）：§9.5 无障碍增强 — 消化 validate a11y warnings，新增 CI axe 回归、高对比度主题预设、屏幕阅读器手工测试清单和全组件键盘导航文档。

## 基线 v1.1.0

| 指标       | 数据                                                                  |
| ---------- | --------------------------------------------------------------------- |
| 组件       | 133+（Vue 3 + React 双端，含 12 种 SVG 图表）                         |
| 测试       | 6272 cases / 309 files                                                |
| 覆盖率     | Stmts 84.66% / Branch 77.68% / Funcs 86.06% / Lines 86.64%            |
| E2E        | 56 passed（Chromium）                                                 |
| validate   | 226/226 通过，58 warnings（初始 458）                                 |
| i18n       | 9 locale（zh-CN/en-US/zh-TW/ja/ko/th/vi/id + DatePicker 独立 locale） |
| 主题       | 6 预设（含高对比度）+ 暗色模式                                        |
| CLI        | create / add / playground / generate / doctor                         |
| SSR 守卫   | 原始 `typeof window/document/navigator` 检查已集中到 `isBrowser()`    |
| Size Limit | Core < 100KB / Vue < 250KB / React < 250KB（gzip）                    |

---

## 一、技术债务清理

### 1.1 validate warnings 分批消化

458 条软警告来源于 `scripts/validate-tests.mjs` 的五类检查：

| 类别                                               | 估计数量 | 优先级 | 影响           |
| -------------------------------------------------- | -------- | ------ | -------------- |
| 缺少 a11y 检查（无 `expectNoA11yViolations` 调用） | ~80      | 高     | 无障碍合规风险 |
| 缺少 Edge Case / Boundary 描述块                   | ~80      | 高     | 健壮性盲区     |
| 测试数低于软阈值（3 ≤ n < softMin）                | ~100     | 中     | 覆盖薄弱       |
| 命名描述率 < 50%                                   | ~100     | 低     | 可读性         |
| 无 `describe` 结构                                 | ~98      | 低     | 维护成本       |

执行策略：

- [x] 第一批：补齐 a11y 检查 + Edge Case 描述块（~160 warnings → 消除 361 条）
- [ ] 第二批：低测试数组件补量（重点见 §3 测试覆盖）— 首轮 Alert/Avatar/Icon/GaugeChart/Rate/Statistic（93→80）；二轮 FunnelChart/Loading/Progress/ImageCropper/TreeMapChart/SunburstChart（80→68）；三轮 Affix/CommentThread/HeatmapChart/ImageGroup/NotificationCenter（68→58）
- [x] 第三批：命名规范 + 结构优化（剩余 1 条 naming warning 已清理，可结合日常改动继续维护）
- [ ] 每批完成后运行 `pnpm test:validate`，记录 warnings 下降趋势：458 → 93 → 80 → 68 → 58

### 1.2 代码质量扫描

- [x] 清理未使用的工具函数（`packages/core/src/utils/` 100+ 文件，审计死代码）
- [x] 审计 `any` 残留（测试文件中 validate 已禁止，源码 0 处残留）

---

## 二、废弃 API 移除

### 2.1 当前废弃清单

| 组件          | 废弃 API                      | 替代                  | 引入版本 | 计划移除 |
| ------------- | ----------------------------- | --------------------- | -------- | -------- |
| ImagePreview  | `visible` prop                | `open`                | v0.5.0   | v2.0     |
| Image (Vue)   | `preview-visible-change` 事件 | `preview-open-change` | v1.0.0   | v2.0     |
| Image (React) | `onPreviewVisibleChange` prop | `onPreviewOpenChange` | v1.0.0   | v2.0     |

### 2.2 执行步骤

- [x] v1.2：开发环境 console.warn 输出 deprecation 提示，生产环境静默
- [x] v1.2：`skills/tigercat/references/shared/props/basic.md` Image 部分添加迁移说明
- [x] v1.x：Example 中所有用法已使用新 API，旧别名仅保留为兼容层
- [ ] v2.0：删除废弃 prop/事件、移除兼容层代码，CHANGELOG 标注 Breaking Change

### 2.3 预防机制

- [x] `scripts/validate-api.mjs` 新增规则：检测 `@deprecated` 标注的 API 是否仍被 Example 引用
- [x] 新增 API 设计审查：弹出层组件统一 `open` / `update:open`，禁止再引入 `visible`

---

## 三、测试覆盖提升

### 3.1 低覆盖组件补测

| 组件       | Vue 测试数 | React 测试数 | 目标 | 状态    |
| ---------- | ---------- | ------------ | ---- | ------- |
| Menu       | 31         | 32           | ≥25  | ✅ 完成 |
| Code       | 24         | 24           | ≥20  | ✅ 完成 |
| Dropdown   | 20         | 22           | ≥20  | ✅ 完成 |
| CropUpload | 30         | 30           | ≥30  | ✅ 完成 |

### 3.2 覆盖率目标提升

| 指标   | 当前   | 目标 |
| ------ | ------ | ---- |
| Stmts  | 84.66% | ≥88% |
| Branch | 77.68% | ≥82% |
| Funcs  | 86.06% | ≥90% |
| Lines  | 86.64% | ≥90% |

### 3.3 E2E 测试扩展

- [ ] 恢复多浏览器：`npx playwright install` 后添加 Firefox/WebKit project，生成新基准快照
- [ ] 新增交互 E2E：表单提交流程、Modal/Drawer 打开关闭、Tab 切换、Table 排序筛选
- [ ] CI 多浏览器矩阵（Chromium + Firefox + WebKit）

### 3.4 测试基础设施

- [ ] 补充 `benchmarks/` 用例：Table 大数据渲染、Tree 虚拟化、Chart SVG 生成
- [ ] 移动端触控测试：Playwright 触控模拟（`page.touchscreen`）
- [ ] 视觉回归覆盖新增组件（当前 56 张快照，目标覆盖全部有视觉表现的组件）

---

## 四、开发者体验

### 4.1 公共文档站

当前文档仅作为 Agent Skills 存在（`skills/tigercat/`），缺少可浏览文档站。

- [ ] 选型：VitePress（Vue 生态一致）或 Astro Starlight（框架无关）
- [ ] 组件 API 页面：复用 `scripts/generate-api-docs.mjs` 自动生成
- [ ] 在线 Playground：嵌入 StackBlitz WebContainer，支持 Vue/React 切换
- [ ] 主题预览：6 预设（含高对比度）+ 暗色模式实时切换
- [ ] 全文搜索：MiniSearch / Algolia DocSearch
- [ ] 代码示例：从 `skills/tigercat/references/vue/` 和 `react/` 同步，保持单一数据源
- [ ] 部署：GitHub Pages / Vercel，CI 自动构建

### 4.2 CLI 增强

| 命令         | 增强方向                                             |
| ------------ | ---------------------------------------------------- |
| `add`        | 交互式多选组件 + 依赖自动解析 + 按需导入代码片段生成 |
| `playground` | 热更新预览 + 自动打开浏览器                          |
| `generate`   | 支持生成测试模板、文档模板                           |
| `doctor`     | 结构化 JSON 输出 + 修复建议 + 版本兼容矩阵检查       |

- [x] 补充 CLI README 使用示例
- [x] 添加 `--dry-run` 模式（预览变更不写入文件）
- [x] CLI E2E 测试（验证 create/add/generate 输出正确）

### 4.3 发布流程自动化

- [ ] 引入 changesets：PR 附带 changeset 文件，合并时自动聚合版本
- [ ] CI workflow：tag push → `pnpm release` → npm publish → GitHub Release + CHANGELOG
- [ ] 预发布渠道：`next`（预览版）/ `canary`（每日构建）
- [ ] 四包版本同步：core/vue/react/cli 统一升版

### 4.4 TypeScript 开发体验

- [ ] 导出所有组件 Props 类型（React 已完成，Vue 侧检查补齐）
- [ ] 补充 JSDoc 到公共 API（组件 props、工具函数入参/返回值）
- [ ] 发布 `.d.ts` sourcemap 方便跳转到源码

---

## 五、LLM 文档优化

提升大模型通过文档理解项目的能力，精简 token 消耗。

### 5.1 Skills 文档精简

当前 `skills/tigercat/` 已有 9 类 Props 文档 + Vue/React 示例 + theme/i18n/cli 文档，但存在冗余。

- [ ] 合并重复描述：`SKILL.md` 导航表 + `copilot-instructions.md` 模板 → 去重，SKILL.md 仅保留索引
- [ ] Props 文档压缩：移除重复的"支持 Vue/React"列（全组件双端，无需逐行标注）
- [ ] 示例代码精简：每组件保留 1 个最小可运行示例 + 1 个进阶示例，删除冗余变体
- [x] 统一术语：建立术语表（slot/children、emit/callback、attrs/props 等），文档中用简写引用

### 5.2 LLM-INDEX 标注增强

- [x] 每个 Props 文档头部添加 `<!-- LLM-INDEX -->` 摘要（组件数量、关键 API 列表）
- [x] `copilot-instructions.md` 精简：移除历史决策说明，保留可执行规则
- [x] 新增 `skills/tigercat/references/shared/glossary.md`：组件术语速查，减少重复解释

### 5.3 文档自动化

- [ ] `scripts/generate-api-docs.mjs` 同时输出 LLM 摘要格式（精简版 API 表）
- [ ] CI 检查：文档与源码 API 一致性校验（新增/删除组件时自动检测文档遗漏）
- [ ] Props 文档从 TypeScript 类型定义自动生成，减少手写维护成本

### 5.4 Context 文件优化

- [x] 优化 `context7.json` 结构：按组件分类索引，支持 Context7 MCP 精准检索
- [x] 审计 `copilot-instructions.md` token 开销：目标控制在 2000 token 以内（当前 257 words / 2860 bytes）
- [x] 确保 Agent 通过 `SKILL.md` → 分类文档 → 具体组件的三级导航能在 2 步内定位任意组件

---

## 六、移动端适配

### 6.1 触控手势体系

当前仅 Carousel 有 swipe 支持（`carousel-utils.ts`），需扩展。

- [ ] 新增 `packages/core/src/utils/gesture-utils.ts`：统一手势识别
  - Swipe（方向 + 速度）
  - Pinch-to-zoom（缩放因子）
  - Long Press（长按阈值可配置）
  - Pan（拖拽偏移量）
- [ ] 手势接入组件：

| 组件         | 手势        | 行为                          |
| ------------ | ----------- | ----------------------------- |
| Carousel     | Swipe       | 已有，迁移到统一手势工具      |
| Drawer       | Swipe       | 向边缘滑动关闭                |
| ImagePreview | Pinch + Pan | 缩放 + 平移                   |
| Tabs         | Swipe       | 左右滑动切换                  |
| Modal        | Swipe Down  | 下滑关闭（移动端 Sheet 模式） |

### 6.2 移动端布局适配

- [ ] Drawer：移动端自动全屏（`<768px` 时 `placement` 忽略，覆盖全屏）
- [ ] Modal：移动端底部弹出 Sheet 模式（可选 prop `mobileSheet`）
- [ ] Table：响应式模式（`<640px` 时切换为卡片列表或横向滚动，可选 `responsiveMode: 'card' | 'scroll'`）
- [ ] DatePicker / TimePicker：移动端使用滚轮选择器替代下拉面板
- [ ] Select / Cascader：移动端使用全屏选择面板

### 6.3 移动端基础设施

- [ ] 新增 `packages/core/src/utils/viewport-utils.ts`：视口断点检测（`isMobile()` / `isTablet()`）
- [ ] CSS 断点统一：`--tiger-breakpoint-sm/md/lg/xl` 变量，与 Tailwind 断点对齐
- [ ] 移动端测试：Playwright `viewport` + `isMobile` + `hasTouch` 配置
- [ ] 触控 E2E 测试用例（至少覆盖 Carousel swipe、Drawer 手势关闭）

---

## 七、组件增强与性能优化

### 7.1 组件功能增强

| 组件       | 增强内容                                                                               | 优先级 |
| ---------- | -------------------------------------------------------------------------------------- | ------ |
| **Table**  | 列拖拽排序、行拖拽排序、列固定增强、单元格编辑、导出 Excel/CSV 增强                    | 高     |
| **Form**   | 内置校验预设（email/phone/url/id-card）、条件联动 DSL、表单性能优化（大表单 >50 字段） | 高     |
| **Select** | 虚拟滚动（>1000 选项）、远程搜索防抖、创建新选项                                       | 高     |
| **Tree**   | 大数据虚拟化（>10000 节点）、节点拖拽排序、搜索高亮                                    | 中     |
| **Upload** | 断点续传、分片上传、上传队列管理                                                       | 中     |
| **Menu**   | 菜单搜索过滤、折叠模式增强                                                             | 中     |
| **Charts** | 数据缩放（brush）、导出 PNG/SVG、图表联动、自适应 resize 增强                          | 中     |
| **Tour**   | 步骤条件跳过、异步步骤加载、移动端适配                                                 | 低     |
| **Kanban** | 泳道分组、WIP 限制可视化、卡片过滤                                                     | 低     |

### 7.2 性能优化

#### Bundle 优化

- [ ] Tree-shaking 审计：确保子路径导入 `@expcat/tigercat-vue/Button` 可用
- [ ] 重型组件懒加载：Modal、Drawer、DatePicker、TimePicker、ColorPicker、Charts
- [ ] Chart 按需加载：每种图表独立 entry（`@expcat/tigercat-vue/LineChart`）
- [ ] size-limit 细化：新增子路径 size 检查（单组件 < 15KB gzip）

#### 运行时优化

- [ ] 虚拟滚动统一：VirtualList / VirtualTable 共享滚动引擎，减少重复实现
- [ ] 大数据 Table：>10000 行时自动启用虚拟滚动
- [ ] Form 性能：大表单场景（>50 字段）校验防抖、按需校验（仅校验变更字段）
- [ ] 事件委托：Menu / Tree / Table 改用事件委托减少 listener 数量
- [ ] CSS 变量缓存：主题切换时批量更新，避免逐条 setProperty

#### 基准测试扩展

当前 `benchmarks/` 仅 3 个文件，需扩展：

- [ ] Table：1000/5000/10000 行渲染 + 排序 + 筛选
- [ ] Tree：1000/5000 节点展开 + 搜索
- [ ] Form：10/30/50 字段校验
- [ ] Chart：100/500/1000 数据点渲染
- [ ] 虚拟滚动：滚动帧率（FPS）基准

---

## 八、新增组件规划

### 8.1 近期候选（v1.3–v1.5）

| 组件               | 类别       | 说明                                            | 复杂度 |
| ------------------ | ---------- | ----------------------------------------------- | ------ |
| **Spotlight**      | Navigation | ⌘K 搜索命令面板，模糊搜索 + 键盘导航 + 分组结果 | 高     |
| **Signature**      | Form       | 手写签名画板，支持笔压 + 颜色 + 导出 PNG/SVG    | 中     |
| **NumberKeyboard** | Form       | 移动端数字键盘，支持身份证/金额等格式           | 低     |
| **ScrollSpy**      | Navigation | 滚动监听 + 自动高亮导航（与 Anchor 互补）       | 低     |
| **Countdown**      | Data       | 倒计时组件，支持天/时/分/秒格式化               | 低     |

### 8.2 中期候选（v1.6–v2.0）

| 组件                | 类别     | 说明                                                  | 复杂度 |
| ------------------- | -------- | ----------------------------------------------------- | ------ |
| **Gantt**           | Charts   | 甘特图，复用 Chart SVG 基础设施 + 时间轴 + 任务依赖线 | 高     |
| **OrgChart**        | Charts   | 组织结构图，复用 Tree + SVG 连线                      | 高     |
| **MarkdownEditor**  | Advanced | Markdown 编辑器，实时预览 + 工具栏 + 插件化           | 高     |
| **ImageAnnotation** | Advanced | 图片标注，矩形/圆形/多边形/自由画笔标注               | 中     |
| **CronEditor**      | Form     | Cron 表达式可视化编辑器                               | 中     |
| **ColorSwatch**     | Form     | 色板选择器（预设色组 + 自定义色组）                   | 低     |

### 8.3 新增组件 DoD

每个新组件必须满足：

1. `packages/core/src/types/` 定义共享 Props 类型
2. `packages/core/src/utils/` 抽取框架无关逻辑
3. `packages/vue/src/components/` + `packages/react/src/components/` 双端实现
4. `packages/*/src/index.*` 导出
5. 测试 ≥20 cases（含 a11y + edge case）
6. `skills/tigercat/references/` 对应分类文档更新
7. Example 页面
8. i18n label（如有文案）

---

## 九、其他规划

### 9.1 设计 Token 体系升级

当前 token 系统：`tokens/tokens.ts` + `tokens/tokens.css` + 5 主题预设。

- [ ] 分层重构：primitive（颜色/间距/字号原始值）→ semantic（intent: primary/danger/success）→ component（button-bg/input-border）
- [ ] 主题切换零闪烁：`color-scheme` + CSS 变量优先加载（`<link rel="preload">`）
- [ ] Figma Token 导出：生成 Figma Variables JSON，设计稿与代码 token 单一数据源
- [ ] Token 文档页面：可视化展示所有 token 及其在组件中的引用关系

### 9.2 动画系统

当前：`EASING_SPRING` / `EASING_SMOOTH` 常量 + `motion/` 工具集。

- [ ] View Transitions API 集成：页面级路由过渡
- [ ] 组件动画可配置：通过 prop 或 CSS 变量控制进出场动画（duration/easing/direction）
- [ ] `prefers-reduced-motion` 全面适配：所有动画组件响应此媒体查询
- [ ] 动画编排 API：多组件协调动画（stagger、sequence）

### 9.3 SSR 支持

当前 SSR 守卫已集中到 `isBrowser()`，但未经框架级验证。

- [ ] Nuxt 3 集成测试：创建 `examples/nuxt/` 验证 Vue 组件 SSR 渲染
- [ ] Next.js 集成测试：创建 `examples/nextjs/` 验证 React 组件 SSR 渲染
- [ ] hydration mismatch 修复：重点排查 DatePicker（日期格式化依赖 locale）、Chart（SVG id 唯一性）
- [x] SSR 文档：在 `skills/tigercat/references/` 新增 `ssr.md`

### 9.4 i18n 扩展

当前 9 locale，覆盖东亚 + 东南亚。

- [ ] 新增 locale：es-ES（西班牙语）、fr-FR（法语）、de-DE（德语）、pt-BR（葡萄牙语）、ar-SA（阿拉伯语 RTL）
- [ ] RTL 布局支持：阿拉伯语/希伯来语方向适配（CSS `direction: rtl` + 组件镜像）
- [ ] i18n 覆盖审计：确认全部含文案组件都接入 locale 系统（估计覆盖 ~80%，目标 100%）
- [ ] 复数/日期格式：接入 Intl API 替代硬编码格式

### 9.5 无障碍增强

当前已达 WCAG 2.1 AA，可向 AAA 和更高自动化推进。

- [x] 消化 validate 中 ~80 条 a11y warnings（当前 `pnpm test:validate` 无 a11y warnings，剩余 58 条为低测试数软警告）
- [x] 新增 axe-core 自动扫描到 CI（全组件 a11y 回归）
- [x] 高对比度主题预设
- [x] 屏幕阅读器手工测试文档（NVDA / VoiceOver 验证清单）
- [x] 键盘导航文档：每个组件标注支持的快捷键

### 9.6 社区与生态

- [x] Contributing Guide：贡献流程、开发环境搭建、PR 规范
- [x] Issue/PR 模板：Bug Report / Feature Request / Component Proposal
- [ ] Discord / GitHub Discussions 社区
- [ ] Starter Templates：通过 CLI `create` 提供 Vite + Vue/React + Tigercat 模板
- [ ] 与 Tailwind v4 兼容性验证

### 9.7 CI/CD 完善

- [ ] PR 自动检查：lint + build + test + size-limit + a11y scan
- [ ] E2E 定时运行（nightly）：多浏览器 + 移动端视口
- [ ] 依赖更新自动化：Renovate / Dependabot
- [ ] 发布后自动运行 smoke test（npm install + 基本渲染验证）
