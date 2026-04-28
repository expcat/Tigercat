# Phase 1D-G — i18n / CLI / Examples / Tests 横切审查 (2026-04)

## 1D. i18n

### 现状

- `packages/core/src/utils/i18n/locales.ts` 单文件含 enUS / zhCN（可能还有其他 locale）
- 通过根 barrel 全量导出 → 下游即使只用英文也会拉中文字典
- `ConfigProvider` (Vue + React) 通过 inject/context 提供 `locale`

### 优化项

| #   | 内容                                                                                   | 优先级 |
| --- | -------------------------------------------------------------------------------------- | ------ |
| D1  | 拆分 locales 为 `i18n/locales/{en-US,zh-CN,ja-JP,...}.ts` 各自一个文件                 | P1     |
| D2  | 提供子路径 `@expcat/tigercat-core/locales/zh-CN` 让用户按需 import                     | P1     |
| D3  | 主入口仅导出 `enUS` 默认 + 类型 `TigerLocale`                                          | P1     |
| D4  | 新增 `defineLocale<T>(partial: PartialDeep<TigerLocale>): TigerLocale`，深度合并到默认 | P2     |
| D5  | ConfigProvider 支持 `locale={() => import('...')}` 异步加载                            | P2     |
| D6  | 新增内置 locale：`ja-JP / ko-KR / fr-FR / de-DE / es-ES`（高频需求）                   | P2     |
| D7  | 文档：在 `skills/tigercat/references/i18n.md` 给 Vue+React 各 1 个完整示例（含懒加载） | P1     |

---

## 1E. CLI（@expcat/tigercat-cli）

### 现状

- 入口：`packages/cli/src/index.ts`，子命令在 `commands/`
- 依赖：`commander 13` / `prompts 2.4` / `picocolors 1.1`（最新 14 / 同 / 同）
- 模板：`packages/cli/templates/` 提供项目脚手架

### 优化项

| #   | 内容                                                                                   | 优先级 |
| --- | -------------------------------------------------------------------------------------- | ------ |
| E1  | commander 14 升级（注意 `.option()` hook 改名、Node 20+ 起步）                         | P2     |
| E2  | Windows 下 `bin` 路径需 `.cmd` shim 验证（pnpm/npm/bun 三家）；建议 README 提示        | P1     |
| E3  | 模板的 `package.json` 应使用 catalog 或同根 lockfile 的版本范围                        | P1     |
| E4  | 模板 `tailwind.config.js` 已写死 v3 → 需要同步升 v4 风格（用 `@import "tailwindcss"`） | **P0** |
| E5  | 模板 demo 代码替换为现代化主题示例（启用 `data-tiger-style="modern"`）                 | P1     |
| E6  | 新增 `tigercat add <component>` 子命令拷贝单组件源码到本地（shadcn 风格 opt-in）       | P2     |
| E7  | 新增 `tigercat doctor` 检查 Tailwind 版本 / peer deps 一致性                           | P2     |
| E8  | 输出彩色提示统一过 `picocolors`（避免散落 raw ANSI）                                   | P1     |
| E9  | 单测：`tests/core/cli.spec.ts` 已存在，需补 Windows 路径分隔符场景                     | P1     |

---

## 1F. Examples（examples/example/{vue3,react}）

### 现状

- 99 个 demo 页面（vue3 + react 各 99 个），覆盖 99% 组件
- 路由：vue-router 4 / react-router-dom 7
- 样式：tailwindcss 4 + @tailwindcss/vite ✅ 已是 v4
- 缺：主题切换、动效演示开关、对比 Modal、a11y 检查面板

### 缺失页面（vs `packages/*/src/index.*` 导出）

对照导出对比，**两边覆盖完整**，仅以下"组合/边界"未单独 demo：

- `MessageContainer` / `NotificationContainer` 演示在 MessageDemo / NotificationDemo 中
- `useChartInteraction` / `useDrag` / `useControlledState` 缺示范页面 → **建议补 hooks/ 子分类**
- `defineComponent` 的 ConfigProvider 暂无完整 demo

### 优化项（Vue3 + React 共用）

| #   | 内容                                                                                   | 优先级 |
| --- | -------------------------------------------------------------------------------------- | ------ |
| F1  | 顶部加 **主题切换器**（default / modern / minimal / professional / vibrant / natural） | **P0** |
| F2  | 顶部加 **暗色模式开关**                                                                | P1     |
| F3  | 顶部加 **现代化样式开关**（`data-tiger-style="modern"` toggle）                        | P1     |
| F4  | 顶部加 **语言切换**（联动 ConfigProvider locale）                                      | P1     |
| F5  | 每个 demo 页统一布局组件 `<DemoSection title="..." description="...">` 减少重复        | P1     |
| F6  | 加"复制代码"按钮（已有 `copyText` util 可复用）                                        | P2     |
| F7  | 新增 hooks 演示页面（useDrag / useControlledState / useChartInteraction）              | P1     |
| F8  | 加 `<a11y-check>` 调试面板（开发态用 axe-core，已是依赖）                              | P2     |
| F9  | 路由结构对齐 SKILL.md 的 8 大分类（Basic/Form/.../Advanced），目前是平铺               | P1     |
| F10 | 部署到 GitHub Pages 时分别 `vue/`、`react/` 子路径，Home 页加跨框架对比卡片            | P2     |
| F11 | examples 共享一份"主题/i18n 状态"代码（src/shared/）减少 vue3 和 react 重复            | P2     |
| F12 | demo 引入 lazy route（`defineAsyncComponent` / `React.lazy`）减小首屏                  | P1     |

---

## 1G. Tests

### 现状

- `tests/core/`：utils 单测 ~40 个文件
- `tests/vue/`、`tests/react/`：组件单测
- vitest 4.0 → 4.1.5（小升级 P1）
- happy-dom 20 → 20.9（小升级 P1）
- jest-axe / axe-core 已就位

### 优化项

| #   | 内容                                                                                                                                                              | 优先级 |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| G1  | 跑一次 `pnpm test:coverage` 拿基线，归档到 `docs/reports/2026-04/coverage-baseline.json`                                                                          | **P0** |
| G2  | `tests/COMPONENT_TEST_CHECKLIST.md` / `REACT_COMPONENT_TEST_CHECKLIST.md` 与现有测试对账，补缺口（推断：高级组件 Kanban / RichTextEditor / FileManager 覆盖较弱） | P1     |
| G3  | a11y 测试：`a11y-helpers.ts` 应在所有交互组件至少跑一次 axe 扫描                                                                                                  | P1     |
| G4  | Vue 与 React 的同名组件单测应使用**同一份用例描述**（中文 it 文案统一），便于交叉对比                                                                             | P2     |
| G5  | 新增主题切换 / Modern 样式相关测试（确保 `data-tiger-style="modern"` 触发新 class）                                                                               | P1     |
| G6  | 新增 sideEffects 修复后的 chunk 副作用回归测试（mount Message/Notification 容器后预期 DOM 结果）                                                                  | P1     |
| G7  | playwright e2e (`e2e/components.spec.ts`) 升级到 1.59，补一个跨浏览器视觉回归测试（Modal / Drawer / Popover 三件套截图比对）                                      | P2     |
| G8  | bench (`benchmarks/core-utils.bench.ts`) 增加 chart-utils（最大文件） + virtual-list-utils 的基准用例                                                             | P2     |
| G9  | vitest config 升级 4.1：检查 `coverage.exclude` / `pool` 默认值变更                                                                                               | P1     |
