# Phase 1A — 依赖升级矩阵 (2026-04)

数据来源：`pnpm -r outdated`（2026-04-28）。

> 优先级：**P0** = 安全/统一/必修；**P1** = 推荐升级，有小破坏可控；**P2** = 重大破坏性，独立 PR

## 1. 紧急修复（P0）

| 包                                            | 当前          | 最新   | 影响范围                | 动作          | 备注                                                                            |
| --------------------------------------------- | ------------- | ------ | ----------------------- | ------------- | ------------------------------------------------------------------------------- |
| **tailwindcss**（core）                       | 3.4.19        | 4.2.4  | `@expcat/tigercat-core` | **必须升 v4** | 用户的 examples 已在 v4，core 还在 v3，会导致下游用户安装出现两套 Tailwind 共存 |
| `@playwright/test`                            | wanted 1.58.2 | 1.59.1 | 根                      | 升 1.59.x     | "missing"，未真正安装到所声明版本                                               |
| `size-limit` & `@size-limit/preset-small-lib` | wanted 12.0.1 | 12.1.0 | 根                      | 升 12.1.x     | 修复"missing"                                                                   |

## 2. 推荐小升级（P1，无破坏性，可一次合）

| 包                                              | 当前 → 目标          | Workspace                |
| ----------------------------------------------- | -------------------- | ------------------------ |
| `@floating-ui/dom`                              | 1.7.4 → **1.7.6**    | core                     |
| `@testing-library/react`                        | 16.3.1 → **16.3.2**  | 根                       |
| `@types/react`                                  | 19.2.7 → **19.2.14** | examples-react / react   |
| `@vitejs/plugin-vue`                            | 6.0.3 → **6.0.6**    | examples-vue3 / vue / 根 |
| `axe-core`                                      | 4.11.0 → **4.11.3**  | 根                       |
| `react` / `react-dom`                           | 19.2.3 → **19.2.5**  | 全部含 react 的包        |
| `vue`                                           | 3.5.26 → **3.5.33**  | examples-vue3 / vue / 根 |
| `@tailwindcss/vite`                             | 4.1.18 → **4.2.4**   | examples                 |
| `@types/node`                                   | 25.0.3 → **25.6.0**  | react / vue / 根         |
| `@typescript-eslint/*`                          | 8.52 → **8.59.1**    | 根                       |
| `@vitest/coverage-v8` / `@vitest/ui` / `vitest` | 4.0.16 → **4.1.5**   | 根                       |
| `happy-dom`                                     | 20.0.11 → **20.9.0** | 根                       |
| `prettier`                                      | 3.7.4 → **3.8.3**    | 根                       |
| `react-router-dom`                              | 7.11.0 → **7.14.2**  | examples-react           |
| `tailwindcss`                                   | 4.1.18 → **4.2.4**   | examples                 |

> 这一栏建议作为**单独一个 PR**：`chore(deps): bump non-breaking minor/patch versions`

## 3. 重大破坏性（P2，每项独立 PR）

| 包                        | 当前   | 最新                    | 破坏点                                                                  | 升级动作                                                                                                                                                   |
| ------------------------- | ------ | ----------------------- | ----------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **tailwindcss**（core）   | 3.4.19 | **4.2.4**               | CSS-first 配置；JS 插件 API 重写；`@layer` 行为变更                     | 重写 `packages/core/src/tailwind-plugin.ts` 为 v4 plugin（用 `@plugin` 指令或 v4 plugin API），更新 `tokens/` 输出为 `@theme` 块；core README 更新安装文档 |
| **typescript**            | 5.9.3  | **6.0.3**               | 严格模式收紧；新的废弃 API                                              | 全包 `tsconfig` review；`vue-tsc` 必须同步升 3.x；先在单包试跑                                                                                             |
| **vue-tsc**               | 2.2.12 | **3.2.7**               | 与 TS 6 配套；`vue-tsc --noEmit` 行为差异                               | 与 TS 6 一起升                                                                                                                                             |
| **vite**                  | 7.3.0  | **8.0.10**              | Rollup 5 → 6；环境 API 变更；CJS 入口移除                               | examples + vue 包同时升；检查 tsup 是否需要适配                                                                                                            |
| **@vitejs/plugin-react**  | 4.7.0  | **6.0.1**               | React Refresh 选项；HMR 重构                                            | examples-react 单独升                                                                                                                                      |
| **vue-router**            | 4.6.4  | **5.0.6**               | Composition API 重构；类型导出变化；过渡到 Pinia 风格 navigation guards | examples-vue3 单独升，重写路由配置                                                                                                                         |
| **commander**             | 13.1.0 | **14.0.3**              | Node 20+ 起步；某些 hook 重命名                                         | CLI 包升级，回归测试模板生成                                                                                                                               |
| **eslint** + `@eslint/js` | 9.39.2 | **10.2.1** / **10.0.1** | flat config 强制；规则集精简                                            | 升级 `eslint.config.js`；同时升 `@typescript-eslint/*`（已在 P1）                                                                                          |
| **@vue/tsconfig**         | 0.7.0  | **0.9.1**               | 与 TS 6 + Vue 3.6 配套                                                  | 同 TS 6                                                                                                                                                    |

## 4. CLI 包缺装依赖（P0 修补）

`@expcat/tigercat-cli` 的 `commander / prompts / picocolors / @types/prompts / tsup` 都是 "missing"。说明 lockfile 没真正解析过 → 执行一次 `pnpm install` 即可补齐（`Phase 0` 已做）。

## 5. 升级路线图建议

```
Step 1 (PR-A) ── 修补缺失依赖（已完成）+ Phase 0 基线
Step 2 (PR-B) ── tailwindcss core 从 v3 升 v4（消除版本错乱）          ★ 必须先
Step 3 (PR-C) ── 非破坏性小版本统一升级（P1 表）
Step 4 (PR-D) ── ESLint 10 + @typescript-eslint 升级
Step 5 (PR-E) ── TypeScript 6 + vue-tsc 3 + @vue/tsconfig 0.9
Step 6 (PR-F) ── Vite 8 + plugin-react 6 + plugin-vue 6.0.6
Step 7 (PR-G) ── vue-router 5（仅 examples-vue3）
Step 8 (PR-H) ── commander 14（CLI）
```

每步都要跑 `pnpm build / test / size:check`，对照 baseline.md 看回归。

## 6. 跨包版本一致性

需要在根 `pnpm-workspace.yaml` 增加 `catalog:` 或 `overrides`，确保：

- `vue` 在 vue / examples-vue3 / 根 dev 三处一致
- `react` / `react-dom` 在 react / examples-react / 根 dev 三处一致
- `typescript` 在所有包一致
- `tsup` / `tailwindcss` 在所有 build 包一致

当前 lockfile 通过手动声明同版本维护，未来用 catalog 机制更稳。
