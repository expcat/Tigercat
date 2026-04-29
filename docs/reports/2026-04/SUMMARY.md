# Tigercat 2026-04 全量审查 — SUMMARY

> 来源：[baseline.md](baseline.md) · [deps-matrix.md](deps-matrix.md) · [phase1b-core-utils.md](phase1b-core-utils.md) · [phase1c-theme-modernization.md](phase1c-theme-modernization.md) · [phase1d-i18n-cli-examples-tests.md](phase1d-i18n-cli-examples-tests.md) · phase2.1–2.9（按文档分组的组件报告）

## 0. 阅读顺序

1. **基线** — [baseline.md](baseline.md)
2. **依赖矩阵** — [deps-matrix.md](deps-matrix.md)
3. **Phase 1 横切** — Core utils / 主题现代化 / i18n+CLI+Examples+Tests
4. **Phase 2 分组** — 9 份按 SKILL 文档分类的组件报告
5. **Phase 3 SUMMARY**（本文）

---

## 1. Top 20 全局优化（按收益排）

> 收益 = 体积↓ × 性能↑ × 视觉收益 × 用户面价值

| #   | 项                                                                             | 收益                                                                | 优先级 | 报告        |
| --- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------- | ------ | ----------- |
| 1   | **修复 sideEffects 误标导致 chunk 被忽略**                                     | 体积稳定 + 防止 Message/Notification 等 imperative API 在 prod 失效 | **P0** | 1B / 2.3    |
| 2   | **统一 core 与 examples 的 Tailwind 版本（升 v4）**                            | 消除安装版本错乱                                                    | **P0** | deps-matrix |
| 3   | **chart-utils.ts (28KB) 拆分为 chart/{scale,axis,path,format,color}**          | 17 个 chart tree-shaking ↑                                          | **P0** | 1B / 2.7    |
| 4   | **Table 单文件拆分 (Header/Body/Sort/Filter/Selection)**                       | 可读性 ↑ + 维护性 ↑                                                 | **P0** | 2.6         |
| 5   | **Affix / Anchor 改用 IntersectionObserver**                                   | 滚动性能 ↑                                                          | **P0** | 2.5         |
| 6   | **i18n locales 子路径化**                                                      | 不用中文的用户少 ~3KB                                               | P1     | 1B / 1D     |
| 7   | **icons 按使用组件分组**                                                       | tree-shaking ↑                                                      | P1     | 1B / 2.1    |
| 8   | **5 个 picker (Select/Cascader/AutoComplete/Tree/Transfer) 共享 picker-utils** | 体积 ↓ 5–8 KB                                                       | P1     | 2.2         |
| 9   | **Composite 组件零重复（DataTable/CropUpload/FormWizard）**                    | 体积 ↓ + 维护 ↑                                                     | **P0** | 2.8         |
| 10  | **CodeEditor / RichTextEditor 不打包重型引擎**                                 | 体积 ↓（潜在 100KB+）                                               | **P0** | 2.9         |
| 11  | **Vue Button SSR 修复（module-level h() vnode 引用）**                         | 稳定性                                                              | **P0** | 2.1         |
| 12  | **Tree 用 VirtualList、不重复实现**                                            | 体积 + 性能                                                         | **P0** | 2.5         |
| 13  | **ChatWindow 强制 VirtualList**                                                | 大对话性能                                                          | **P0** | 2.8         |
| 14  | **新增 modern 主题 token (radius/shadow/glass/gradient/motion)**               | 视觉收益 ↑↑↑（opt-in 不破坏）                                       | **P0** | 1C          |
| 15  | **样式按组逐步迁移到 token (`var(--tiger-radius-md, ...)`)**                   | 主题切换可用                                                        | P1     | 1C / 2.x    |
| 16  | **examples 加主题切换 + 暗色 + 现代化开关**                                    | 用户体验 + 文档说服力                                               | **P0** | 1F          |
| 17  | **CLI 模板升级 Tailwind v4 + 现代主题**                                        | 新用户上手                                                          | **P0** | 1E          |
| 18  | **依赖小升级一键 PR (P1 表)**                                                  | 维护成本 ↓                                                          | P1     | deps-matrix |
| 19  | **chart 配色去硬编码（使用 chart1..6 token）**                                 | 主题切换可用 + 暗色一致                                             | **P0** | 2.7         |
| 20  | **菜单/下拉/锚点/步骤/标签等同族父子组件文件合并**                             | 减少 chunk 数 + 维护性                                              | P1     | 2.5         |

---

## 2. 依赖升级路线图

```
PR-A  补缺失依赖 + Phase 0 基线 (已完成)
PR-B  ★ tailwindcss core v3 → v4（消除版本错乱，含 tigercat-plugin 重写）
PR-C  非破坏性小升级合包（deps-matrix.md §2 表）
PR-D  eslint 10 + @typescript-eslint
PR-E  TypeScript 6 + vue-tsc 3 + @vue/tsconfig 0.9
PR-F  Vite 8 + plugin-react 6 + plugin-vue 6.0.6
PR-G  vue-router 5（仅 examples-vue3）
PR-H  commander 14（CLI）
```

> 每步独立可回滚；每步过 `pnpm build / test / size:check`。

---

## 3. 主题现代化交付物

详见 [phase1c-theme-modernization.md](phase1c-theme-modernization.md)。

新增 token 一览（**全部 opt-in，默认外观保持不变**）：

- `--tiger-radius-{sm,md,lg,xl,pill}`（更圆润）
- `--tiger-shadow-{sm,md,lg,xl,glass,glass-strong}` + `--tiger-blur-glass*`（多层阴影 + 玻璃）
- `--tiger-gradient-{primary,surface,danger}`（OKLab color-mix 微渐变）
- `--tiger-motion-duration-* / ease-{standard,decelerate,accelerate,emphasized,spring}` + `--tiger-transition-*`（精细动效）
- 暗色模式 token 校准

启用方式：`<html data-tiger-style="modern" class="dark">` 或 `createTigercatPlugin({ preset: modernTheme })`。

---

## 4. Examples 升级清单

详见 [phase1d-...md](phase1d-i18n-cli-examples-tests.md) §1F。

- 主题切换器 + 暗色 + 现代化开关 + 语言切换（4 件套，统一布局）
- 路由按 SKILL 8 大分类（含 Composite/Advanced）+ hooks 子分类
- lazy route + 共享 demo 布局组件（`<DemoSection>`）
- 复制代码 + a11y 调试面板（dev only）
- 部署到 GH Pages 时 `vue/` `react/` 跨框架对比 Home

---

## 5. 建议 PR 列表（执行阶段）

| #             | PR                                                               | 范围                         | 风险                     |
| ------------- | ---------------------------------------------------------------- | ---------------------------- | ------------------------ |
| **PR-1**      | sideEffects 修复（vue + react package.json）                     | 2 个文件                     | 低，直接收益体积         |
| **PR-2**      | tailwindcss core v3 → v4（重写 plugin）                          | core                         | **中**，需大量回归       |
| **PR-3**      | 非破坏性依赖统一升级                                             | 全包 package.json            | 低                       |
| **PR-4**      | i18n locales 子路径化 + 主入口仅 enUS                            | core                         | 低（向后兼容 re-export） |
| **PR-5**      | icons 按使用方分组 + 子路径                                      | core + 各组件 import         | 低                       |
| **PR-6**      | 主题 token 增量（modern preset）                                 | core/theme + tailwind plugin | 低 (opt-in)              |
| **PR-7**      | examples 加 4 件套切换器 + 共享布局                              | examples                     | 低                       |
| **PR-8**      | CLI 模板升级 v4 + modern                                         | cli/templates                | 低                       |
| **PR-9**      | Vue Button SSR + 横切 utils 优化（class composer）               | core + vue/react             | 低                       |
| **PR-10**     | Form picker 共享层 (Select/Cascader/...)                         | core + 5 组件                | 中                       |
| **PR-11**     | DatePicker/TimePicker 复用 date-utils 去重                       | core + 2 组件                | 中                       |
| **PR-12**     | chart-utils.ts 拆分 + chart 配色 token                           | core + 17 chart              | **中**                   |
| **PR-13**     | Affix/Anchor → IntersectionObserver                              | 2 组件                       | 低                       |
| **PR-14**     | Tree 使用 VirtualList + ChatWindow 强制 virtual                  | 2 组件                       | 中                       |
| **PR-15**     | Composite 去重（DataTableWithToolbar / CropUpload / FormWizard） | 3 组件                       | 中                       |
| **PR-16**     | Table 单文件拆分 (~10 子文件)                                    | Table 主体                   | **大**                   |
| **PR-17**     | CodeEditor / RichTextEditor engine 化                            | 2 组件 + 文档                | **大**                   |
| **PR-18**     | Kanban + TaskBoard 合并方案讨论 + 实施                           | v2.x 里程碑                  | **大**                   |
| **PR-19a..k** | 各组组件样式现代化（按 phase2 分组依次）                         | vue + react 各组             | 低-中                    |
| **PR-20**     | examples 重构（按 SKILL 分类、lazy、demo 模板）                  | examples                     | 低                       |
| **PR-21**     | tests 覆盖率补齐 + a11y/视觉回归                                 | tests + e2e                  | 低                       |
| **PR-22**     | TypeScript 6 + vue-tsc 3 升级                                    | 全包 tsconfig                | 中                       |
| **PR-23**     | Vite 8 + plugin-react/vue 升级                                   | examples + vue               | 中                       |
| **PR-24**     | ESLint 10 升级                                                   | 根 + lint config             | 低                       |
| **PR-25**     | vue-router 5 / commander 14（孤立升级）                          | examples-vue3 / cli          | 低                       |

---

## 6. 不在本轮的事项

- 不在本轮对源代码做实际修改（仅产报告）
- 视觉对比截图：留待执行 PR-6/PR-7 后由人工补；本轮以 token 设计稿为准
- 跨浏览器 e2e 视觉回归：留待 PR-21
- 性能压测（chart 大数据 / Table 万行）：留待对应 PR

---

## 7. 执行进度跟踪 (Execution Tracker)

> 每次执行一个 PR/Phase，完成后在此更新状态。下次会话可据此继续。

| PR        | 标题                                                             | 状态       | 完成日期   | 备注                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| --------- | ---------------------------------------------------------------- | ---------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **PR-1**  | sideEffects 修复（vue + react package.json）                     | ✅ Done    | 2026-04-28 | 修复 esbuild `ignored-bare-import` 警告归零；4619 tests 通过；体积无回归。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| PR-2      | tailwindcss core v3 → v4（重写 plugin）                          | ⬜ Pending |            |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| PR-3      | 非破坏性依赖统一升级                                             | ✅ Done    | 2026-04-28 | 14 项依赖小版本升级（vue 3.5.33 等）；4619 tests 通过；体积小幅变化（Vue +866 B 来自 vue 运行时）。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| PR-4      | i18n locales 子路径化 + 主入口仅 enUS                            | ✅ Done    | 2026-04-28 | 拆分 `locales.ts` → `i18n/locales/{en-US,zh-CN,zh-TW,ja-JP,ko-KR,th-TH,vi-VN,id-ID}.ts`；新增 `tsup.config.ts` 多入口构建；package.json 暴露 `@expcat/tigercat-core/locales/<bcp47>` 子路径；主入口仍 re-export 保持向后兼容；i18n.md 文档新增懒加载/子路径示例；4619 tests 通过。                                                                                                                                                                                                                                                                                                                                                                                          |
| PR-5      | icons 按使用方分组 + 子路径                                      | ⬜ Pending |            |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| PR-6      | 主题 token 增量（modern preset）                                 | ✅ Done    | 2026-04-28 | 新增 `themes/modern/{tokens.ts,theme.ts}` (`MODERN_BASE_TOKENS_LIGHT/DARK`、`MODERN_OVERRIDE_TOKENS_LIGHT/DARK`、`MODERN_REDUCED_MOTION_TOKENS`)；`tigercatPlugin` 默认注入 base token（与现有视觉一致），`createTigercatPlugin({ modern: true })` 追加 `[data-tiger-style="modern"]` override + `prefers-reduced-motion`；`modernTheme` 注册到 `builtInPresets`，`ThemePresetName` 加 `'modern'`；新增 10 项 spec → 4629 tests 通过；Core 70.89 KB / Vue 195.56 KB / React 225.86 KB（仍在预算内）；theme.md 新增 Modern Style 章节。                                                                                                                                      |
| PR-7      | examples 加 4 件套切换器 + 共享布局                              | ⬜ Pending |            |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| PR-8      | CLI 模板升级 v4 + modern                                         | ⬜ Pending |            |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| PR-9      | Vue Button SSR + 横切 utils 优化（class composer）               | ✅ Done    | 2026-04-28 | 新增 `composeComponentClasses` (core); Vue Button 的 module-level vnode 改为 `createLoadingSpinner()` 工厂；Button 改用新 composer。4619 tests 通过。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| PR-10     | Form picker 共享层 (Select/Cascader/...)                         | ⬜ Pending |            |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| PR-11     | DatePicker/TimePicker 复用 date-utils 去重                       | ⬜ Pending |            |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| PR-12     | chart-utils.ts 拆分 + chart 配色 token                           | ✅ Done    | 2026-04-29 | 28 KB 单文件 → `utils/chart/{color,scale,axis,path,format}.ts` 五个模块 + barrel `index.ts`；`chart-utils.ts` 改为薄 re-export 保持公共 API 兼容；DonutChart (Vue + React) 默认 9 色 palette 由硬编码 hex 改为 `var(--tiger-chart-1..6, <fallback>)`，主题切换/暗色模式生效；同步更新 2 个 spec 断言。Core 70,855 B / Vue 195,558 B / React 225,869 B（基本无回归，体积浮动 < 0.01 %）；4629 tests 通过；esbuild WARN 0。剩余 16 个 chart 组件 `borderColor: '#ffffff'`/`stroke='#fff'` 等暗色不友好默认值未在本 PR 处理（需配套 `--tiger-bg-elevated` token 评估，留待 PR-19a chart 现代化）。                                                                             |
| PR-13     | Affix/Anchor → IntersectionObserver                              | ✅ Done    | 2026-04-28 | 新增 `createAffixObserver` + `createAnchorObserver` (core)；Affix 改 IO + sentinel + ResizeObserver；Anchor 改 IO 替换 scroll listener；4619 tests 通过。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| PR-14     | Tree 使用 VirtualList + ChatWindow 强制 virtual                  | ✅ Done    | 2026-04-29 | Tree (Vue+React) 新增 `virtual` / `height` / `itemHeight` props，virtual 模式下 `getVisibleTreeItems` 扁平化后交由 `VirtualList` 渲染（提取 `renderTreeRow` 复用单行 markup，保留键盘导航 / 拖拽 / 复选 / 展开收起逻辑）；ChatWindow (Vue+React) 新增 `virtual` / `virtualItemHeight` / `virtualHeight` / `autoScrollToBottom` props，自动滚动到底部使用 `requestAnimationFrame`（virtual 模式下作用于 `VirtualList` 内部滚动容器，非 virtual 模式下作用于消息列表本体）；core `composite.ts` / `tree.ts` 类型同步增量。新增 4 个虚拟模式 spec（Vue/React × Tree/ChatWindow）→ 4633 tests 通过；Core 70,855 B / Vue 195,906 B (+348) / React 226,140 B (+271)，仍在预算内。 |
| PR-15     | Composite 去重（DataTableWithToolbar / CropUpload / FormWizard） | ⬜ Pending |            |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| PR-16     | Table 单文件拆分 (~10 子文件)                                    | ⬜ Pending |            |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| PR-17     | CodeEditor / RichTextEditor engine 化                            | ⬜ Pending |            |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| PR-18     | Kanban + TaskBoard 合并方案讨论 + 实施                           | ⬜ Pending |            |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| PR-19a..k | 各组组件样式现代化（按 phase2 分组依次）                         | ⬜ Pending |            |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| PR-20     | examples 重构（按 SKILL 分类、lazy、demo 模板）                  | ⬜ Pending |            |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| PR-21     | tests 覆盖率补齐 + a11y/视觉回归                                 | ⬜ Pending |            |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| PR-22     | TypeScript 6 + vue-tsc 3 升级                                    | ⬜ Pending |            |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| PR-23     | Vite 8 + plugin-react/vue 升级                                   | ⬜ Pending |            |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| PR-24     | ESLint 10 升级                                                   | ⬜ Pending |            |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| PR-25     | vue-router 5 / commander 14（孤立升级）                          | ⬜ Pending |            |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |

**下一步建议**：执行 PR-10（Form picker 共享层 Select/Cascader/AutoComplete/Tree/Transfer → picker-utils）或 PR-5（icons 按使用方分组 + 子路径）。PR-2（Tailwind v4）需要中等回归验证。

### 基线快照（PR-14 完成后）

| 指标                               | 数值      | 上限      |
| ---------------------------------- | --------- | --------- |
| Core (full)                        | 70,855 B  | 100,000 B |
| Vue (full)                         | 195,906 B | 250,000 B |
| React (full)                       | 226,140 B | 250,000 B |
| Tests                              | 4633 pass | —         |
| esbuild WARN `ignored-bare-import` | 0         | —         |

> Core ±0 / Vue +348 B / React +271 B（vs PR-12 基线）。Tree 引入扁平虚拟分支（提取 `renderTreeRow` + 调用 `VirtualList`）和 ChatWindow 引入 virtual + autoScroll 副作用合计增量 < 0.5 KB；非 virtual 路径（默认）行为保持 100% 兼容，新 props 全部带向后兼容默认值（`virtual=false`、ChatWindow `autoScrollToBottom=true` 替代旧的"无任何自动滚动"行为）。

### 基线快照（PR-12 完成后）

| 指标                               | 数值      | 上限      |
| ---------------------------------- | --------- | --------- |
| Core (full)                        | 70,855 B  | 100,000 B |
| Vue (full)                         | 195,558 B | 250,000 B |
| React (full)                       | 225,869 B | 250,000 B |
| Tests                              | 4629 pass | —         |
| esbuild WARN `ignored-bare-import` | 0         | —         |

> Core −35 B / Vue −2 B / React +9 B（vs PR-6 基线）。`chart-utils.ts` 拆为 5 个子模块后总符号未变；DonutChart palette 由 hex 字面量改为含 fallback 的 `var(--tiger-chart-N,#hex)` 字符串带来极小 net 增加，与 barrel 改造抵消。新文件结构便于后续按 chart 类别 tree-shake，并为 PR-19a chart 视觉现代化（玻璃 tooltip / 渐变 / spring）打开模块边界。

### 基线快照（PR-6 完成后）

| 指标                               | 数值      | 上限      |
| ---------------------------------- | --------- | --------- |
| Core (full)                        | 70,890 B  | 100,000 B |
| Vue (full)                         | 195,560 B | 250,000 B |
| React (full)                       | 225,860 B | 250,000 B |
| Tests                              | 4629 pass | —         |
| esbuild WARN `ignored-bare-import` | 0         | —         |

> Core +1,040 B 来自 `themes/modern/{tokens,theme}` 与 `tailwind-plugin` 扩展（modern token 表 + override 块 + 注册项）。运行时无变化：默认 `tigercatPlugin` 仅多注入一组与现有视觉等价的 fallback token，组件不需改动；`createTigercatPlugin({ modern: true })` 才会启用新 visual。

### 基线快照（PR-4 完成后）

| 指标                               | 数值      | 上限      |
| ---------------------------------- | --------- | --------- |
| Core (full)                        | 69,850 B  | 100,000 B |
| Vue (full)                         | 194,410 B | 250,000 B |
| React (full)                       | 224,700 B | 250,000 B |
| Tests                              | 4619 pass | —         |
| esbuild WARN `ignored-bare-import` | 0         | —         |

> 主入口体积无回归（向后兼容 re-export 仍包含全部 locales）。新增 8 个 locale 子路径产物，单文件约 0.9–1.7 KB（ESM）/ 1.0–1.8 KB（CJS），下游按需 `import` 即可仅打包所选语言（中文用户可省 ~3 KB 其他语言数据）。

### 基线快照（PR-13 完成后）

| 指标                               | 数值      | 上限      |
| ---------------------------------- | --------- | --------- |
| Core (full)                        | 69,873 B  | 100,000 B |
| Vue (full)                         | 194,439 B | 250,000 B |
| React (full)                       | 224,718 B | 250,000 B |
| Tests                              | 4619 pass | —         |
| esbuild WARN `ignored-bare-import` | 0         | —         |

> 体积变化（vs PR-3 基线）：Core +452 B（两个 IO observer 工厂）/ Vue +682 B（Affix sentinel + ResizeObserver）/ React +607 B（同上）。性能：滚动事件 → IO 回调，长列表/嵌入容器场景 CPU 占用显著降低。

### 基线快照（PR-3 完成后）

| 指标                               | 数值      | 上限      |
| ---------------------------------- | --------- | --------- |
| Core (full)                        | 69,421 B  | 100,000 B |
| Vue (full)                         | 193,757 B | 250,000 B |
| React (full)                       | 224,111 B | 250,000 B |
| Tests                              | 4619 pass | —         |
| esbuild WARN `ignored-bare-import` | 0         | —         |

> 依赖升级本身带来 Vue +866 B（vue 3.5.33 运行时微增）、React/Core 微变化。

### 基线快照（PR-9 完成后）

| 指标                               | 数值      | 上限      |
| ---------------------------------- | --------- | --------- |
| Core (full)                        | 69,460 B  | 100,000 B |
| Vue (full)                         | 192,891 B | 250,000 B |
| React (full)                       | 224,097 B | 250,000 B |
| Tests                              | 4619 pass | —         |
| esbuild WARN `ignored-bare-import` | 0         | —         |

> 体积变化：Core +60 B / Vue +71 B / React +46 B，源自新增 `composeComponentClasses` helper（一次性成本，后续多组件迁移不再增加）。

### 基线快照（PR-1 完成后）

| 指标                               | 数值      | 上限      |
| ---------------------------------- | --------- | --------- |
| Core (full)                        | 69,400 B  | 100,000 B |
| Vue (full)                         | 192,820 B | 250,000 B |
| React (full)                       | 224,051 B | 250,000 B |
| Tests                              | 4619 pass | —         |
| esbuild WARN `ignored-bare-import` | 0         | —         |

---

## 8. 总览统计

- 报告文件：14 份（baseline / deps-matrix / phase1b-d / phase2.1-2.9 / SUMMARY）
- 优化项总条数：约 120 项（P0 ≈ 22，P1 ≈ 70，P2 ≈ 30）
- 预估 Vue/React full bundle 在所有 P0 + P1 落地后可下降：**10–25 KB**（gzip）
- 预估视觉现代化交付：**新增 1 个 modern preset + 8 大组件分组改造 PR**
