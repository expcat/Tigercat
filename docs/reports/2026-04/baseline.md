# Phase 0 — Baseline Snapshot (2026-04)

## 产物体积（`pnpm size:check`）

| Bundle       | Size (gzip) | Limit     | 余量  |
| ------------ | ----------- | --------- | ----- |
| Core (full)  | 67.77 KB    | 97.66 KB  | 30 KB |
| Vue (full)   | 188.30 KB   | 244.14 KB | 56 KB |
| React (full) | 218.80 KB   | 244.14 KB | 25 KB |

> ⚠️ size-limit esbuild 在打包 React/Vue 时反复报 `Ignoring this import because "<chunk>.mjs" was marked as having no side effects`。这意味着 tsup 把代码拆成了 chunk-\*.mjs，但 `sideEffects: false` 让 esbuild 直接忽略了对它们的"裸引入"，**真实运行时可能因为这些 chunk 没被加载而出现样式/副作用缺失**（详见 Tree-shaking 风险，列入 P0）。

## 依赖矩阵（`pnpm -r outdated`）

完整列表见 [deps-matrix.md](deps-matrix.md)。要点：

- **重大破坏性**：`tailwindcss 3.4 → 4.2`（core）、`typescript 5.9 → 6.0`、`vite 7 → 8`、`vue-router 4 → 5`、`@vitejs/plugin-react 4 → 6`、`vue-tsc 2 → 3`、`commander 13 → 14`、`eslint 9 → 10` / `@eslint/js 9 → 10`
- **关键不一致**：根目录与 examples 已使用 **Tailwind v4**，但 core 仍 Tailwind v3 → 用户实际安装时**版本错乱**（必须修复）
- **小升级**：@floating-ui/dom、@types/react、@vitejs/plugin-vue、axe-core、prettier、@types/node、happy-dom、@typescript-eslint、vitest 4.0→4.1、@playwright/test 1.58→1.59 等

## 工具链命令现状

```
pnpm build       # ✅ 通过
pnpm size:check  # ✅ 通过（但有 sideEffects 警告）
pnpm test        # 未运行（本次仅出报告）
pnpm lint        # 未运行
pnpm bench       # 未运行
```

## 仓库当前规模

- Vue 组件：130 个 `.ts` 文件 (`packages/vue/src/components/`)
- React 组件：~130 个 `.tsx` 文件 (`packages/react/src/components/`)
- Core utils：~125 个文件 (`packages/core/src/utils/`)
- 测试：`tests/{core,vue,react,utils}/`

## SKILL.md 与实际不一致

- 仓库 README/根 SKILL 写"组件 133+"，但 `c:\Users\holys\.copilot\skills\tigercat\SKILL.md` 仍写"63"，需要同步（列入 Phase 3）
- Quick Navigation 缺 Composite/Advanced/CLI 链接（仓库内 `skills/tigercat/SKILL.md` 已补；用户全局 SKILL 没补）
