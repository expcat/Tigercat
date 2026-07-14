# Tigercat

[![@expcat/tigercat-vue](https://img.shields.io/npm/v/@expcat/tigercat-vue?style=flat-square&logo=vue.js&label=@expcat/tigercat-vue)](https://www.npmjs.com/package/@expcat/tigercat-vue)
[![@expcat/tigercat-react](https://img.shields.io/npm/v/@expcat/tigercat-react?style=flat-square&logo=react&label=@expcat/tigercat-react)](https://www.npmjs.com/package/@expcat/tigercat-react)
[![@expcat/tigercat-core](https://img.shields.io/npm/v/@expcat/tigercat-core?style=flat-square&logo=npm&label=@expcat/tigercat-core)](https://www.npmjs.com/package/@expcat/tigercat-core)
[![@expcat/tigercat-cli](https://img.shields.io/npm/v/@expcat/tigercat-cli?style=flat-square&logo=npm&label=@expcat/tigercat-cli)](https://www.npmjs.com/package/@expcat/tigercat-cli)
[![@expcat/tigercat-mcp](https://img.shields.io/npm/v/@expcat/tigercat-mcp?style=flat-square&logo=npm&label=@expcat/tigercat-mcp)](https://www.npmjs.com/package/@expcat/tigercat-mcp)

基于 Tailwind CSS v4 的 Vue 3 / React UI 组件库。两套框架共享设计 token、类型与交互约定，并各自提供 **149 个公共组件入口**。

当前稳定版本为 **v2.0.0**，所有官方包保持相同版本并遵循 SemVer（线上最新版本以顶部 npm 徽章为准）。

> **🚀 在线示例**：<https://expcat.github.io/Tigercat/> — Vue 3 与 React 组件示例、主题切换与暗色模式实时预览。

> **📘 AI Agent 文档**
> 组件 API、使用示例和配置指南请参考 [skills/tigercat/SKILL.md](./skills/tigercat/SKILL.md)。
> LLM 客户端可通过 `@expcat/tigercat-mcp` 按任务路由并读取最小必要上下文。

## 特性

- Vue 3 与 React 组件保持一致的功能边界、命名和设计 token。
- 支持组件子路径导入、tree shaking、暗色模式、主题定制与国际化。
- 覆盖表单、导航、数据展示、虚拟化、图表、编辑器和复合业务组件。
- 提供 Vite 脚手架、组件辅助命令、环境诊断以及本地 MCP 文档路由。
- 支持 SSR；功能 E2E 覆盖 Chromium、Firefox、WebKit 与移动 Chromium。

## 快速开始

### 使用 CLI 创建项目（推荐）

CLI 会生成已配置 Tailwind CSS v4 的 Vue 3 或 React Vite 项目：

```bash
pnpm dlx @expcat/tigercat-cli create my-app --template vue3
# 或
pnpm dlx @expcat/tigercat-cli create my-app --template react

cd my-app
pnpm install
pnpm dev
```

### 手动安装

```bash
# Vue 3
pnpm add @expcat/tigercat-vue @expcat/tigercat-core

# React
pnpm add @expcat/tigercat-react @expcat/tigercat-core

# Tailwind CSS v4（两套框架均需要）
pnpm add -D tailwindcss @tailwindcss/vite
```

在 Vite 中启用 `@tailwindcss/vite`，然后在全局样式中引入 Tigercat 插件：

```css
@import 'tailwindcss';
@plugin "@expcat/tigercat-core/tailwind/modern";
```

可运行 `pnpm dlx @expcat/tigercat-cli doctor` 检查 Node.js、pnpm、Tailwind CSS、框架 peer dependency 与模板工具链。

### Vue 3 示例

```vue
<script setup lang="ts">
import { Button } from '@expcat/tigercat-vue/Button'
</script>

<template>
  <Button variant="primary">开始使用</Button>
</template>
```

### React 示例

```tsx
import { Button } from '@expcat/tigercat-react/Button'

export function App() {
  return <Button variant="primary">开始使用</Button>
}
```

推荐在应用边界使用上述 PascalCase 子路径导入以获得更小的按需 bundle；根入口的命名导出仍可用于小型应用、hooks、command API 和共享类型。

## 文档

| 文档                                                   | 说明                                            |
| ------------------------------------------------------ | ----------------------------------------------- |
| [在线示例](https://expcat.github.io/Tigercat/)         | 🚀 GitHub Pages 组件演示（Vue 3 / React）       |
| [skills/tigercat/SKILL.md](./skills/tigercat/SKILL.md) | 📘 **AI Agent 入口**：组件列表、API、主题、i18n |
| [docs/ROADMAP.md](./docs/ROADMAP.md)                   | 当前状态、发布边界与后续任务规则                |
| [docs/MIGRATION.md](./docs/MIGRATION.md)               | v2 breaking changes 与迁移路径                  |
| [CHANGELOG.md](./CHANGELOG.md)                         | 版本变更与发布历史                              |
| [tests/README.md](./tests/README.md)                   | 测试结构、运行方式与质量标准入口                |
| [examples/README.md](./examples/README.md)             | Vue / React 示例应用运行说明                    |

## 性能与兼容性

- 框架包提供 PascalCase 组件子路径导出并支持 tree shaking；高级组件优先使用子路径导入以减小 bundle。
- 大数据列表/表格优先使用 `VirtualList`、`VirtualTable` 或 `InfiniteScroll`；`Table` 不会因数据量自动切换布局，只通过 `data-tiger-virtual-recommended="true"` 暴露建议状态。
- `Table` 与 `VirtualTable` 的固定列默认会跟随表格 token、条纹行和 hover 状态；需要覆盖 sticky 单元格外观时，优先在列定义上使用 `fixedClassName` / `fixedHeaderClassName`，而不是写全局 `[style*="position: sticky"]` 选择器。
- 图表基于纯 SVG，无第三方图表运行时依赖；超过 1000 点建议启用降采样，超过 5000 点建议服务端聚合。
- 主题基于 CSS 变量，推荐使用 `setThemeColors` 批量更新变量，减少重复重绘。
- 浏览器支持范围为现代浏览器最新两个主要版本；功能 E2E 覆盖 Chromium、Firefox、WebKit 与移动 Chromium，不维护跨系统易漂移的图片对比基线。

## 包

| Package                  | Description                                 |
| ------------------------ | ------------------------------------------- |
| `@expcat/tigercat-core`  | 共享类型、设计 token、主题与 Tailwind 插件  |
| `@expcat/tigercat-vue`   | Vue 3 组件与 composables                    |
| `@expcat/tigercat-react` | React 组件与 hooks                          |
| `@expcat/tigercat-cli`   | 项目脚手架、组件辅助、playground 与环境诊断 |
| `@expcat/tigercat-mcp`   | 面向 LLM 的本地 Skill reference 路由服务    |

## 兼容性

- **Vue:** 3.x
- **React / React DOM:** 19.x
- **Tailwind CSS / @tailwindcss/vite:** 4.x
- **Node.js:** >= 22.13.0
- **pnpm（仓库开发）:** >= 11.9.0

## 本地开发

```bash
git clone https://github.com/expcat/Tigercat.git
cd Tigercat
corepack pnpm setup
pnpm example:vue    # http://localhost:5173
pnpm example:react  # http://localhost:5174
```

## 常用命令

| Command                | Description                          |
| ---------------------- | ------------------------------------ |
| `pnpm build`           | 构建所有发布包                       |
| `pnpm dev`             | 以监听模式构建所有包                 |
| `pnpm test`            | 运行单元与组件测试                   |
| `pnpm test:a11y`       | 运行 axe 无障碍回归                  |
| `pnpm quality:quick`   | 运行静态检查与 core 快速回归         |
| `pnpm quality:release` | 运行完整本地发布门禁                 |
| `pnpm e2e`             | 运行跨浏览器功能 E2E                 |
| `pnpm size`            | 检查 bundle 大小                     |
| `pnpm docs:api`        | 重新生成 Skill API 摘要              |
| `pnpm mcp:build`       | 构建本地 MCP 服务                    |
| `pnpm mcp:serve`       | 以 stdio 启动 MCP 服务               |
| `pnpm example:all`     | 同时运行 Vue 3 与 React 在线示例应用 |

## 参与贡献

请先运行 `corepack pnpm setup` 完成依赖安装、构建和环境检查。提交前按改动范围运行 focused tests；涉及公共 API、生成文档或发布面的改动应运行 `pnpm quality:release`。

开发与评审必须遵守 [CONTRIBUTING.md](./CONTRIBUTING.md) 的“根因修复与架构约束”；组件 API、示例与自动化维护规则以 [skills/tigercat/SKILL.md](./skills/tigercat/SKILL.md) 为准，当前项目状态与后续任务规则见 [docs/ROADMAP.md](./docs/ROADMAP.md)。

## License

MIT
