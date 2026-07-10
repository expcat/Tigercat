# Tigercat

[![@expcat/tigercat-vue](https://img.shields.io/npm/v/@expcat/tigercat-vue?style=flat-square&logo=vue.js&label=@expcat/tigercat-vue)](https://www.npmjs.com/package/@expcat/tigercat-vue)
[![@expcat/tigercat-react](https://img.shields.io/npm/v/@expcat/tigercat-react?style=flat-square&logo=react&label=@expcat/tigercat-react)](https://www.npmjs.com/package/@expcat/tigercat-react)
[![@expcat/tigercat-core](https://img.shields.io/npm/v/@expcat/tigercat-core?style=flat-square&logo=npm&label=@expcat/tigercat-core)](https://www.npmjs.com/package/@expcat/tigercat-core)
[![@expcat/tigercat-cli](https://img.shields.io/npm/v/@expcat/tigercat-cli?style=flat-square&logo=npm&label=@expcat/tigercat-cli)](https://www.npmjs.com/package/@expcat/tigercat-cli)
[![@expcat/tigercat-mcp](https://img.shields.io/npm/v/@expcat/tigercat-mcp?style=flat-square&logo=npm&label=@expcat/tigercat-mcp)](https://www.npmjs.com/package/@expcat/tigercat-mcp)

基于 Tailwind CSS 的 UI 组件库，支持 Vue 3 与 React。**149+ 组件**，开箱即用。

**v2.0.0 预览阶段** — 遵循 SemVer 语义化版本，正式 v2.0.0 发布前持续在预览通道迭代（当前版本以顶部 npm 徽章为准）。

> **🚀 在线示例**：<https://expcat.github.io/Tigercat/> — Vue 3 与 React 组件示例、主题切换与暗色模式实时预览。

> **📘 AI Agent 文档**
> 详细的组件 API、使用示例和配置指南请参考 [skills/tigercat/SKILL.md](./skills/tigercat/SKILL.md)
> LLM 客户端可优先通过 `tigercat-mcp` 路由 skill references，按任务读取最小必要上下文。

## 快速开始

### 安装

```bash
# Vue 3
pnpm add @expcat/tigercat-vue @expcat/tigercat-core

# React
pnpm add @expcat/tigercat-react @expcat/tigercat-core
```

### Tailwind v4 配置（必需）

```css
@import 'tailwindcss';
@plugin "@expcat/tigercat-core/tailwind/modern";
```

### Vue 3 示例

```vue
<script setup>
import { Button } from '@expcat/tigercat-vue'
</script>
<template>
  <Button variant="solid" @click="handleClick">点击</Button>
</template>
```

### React 示例

```tsx
import { Button } from '@expcat/tigercat-react'

export function App() {
  return (
    <Button variant="solid" onClick={handleClick}>
      点击
    </Button>
  )
}
```

## 文档

| 文档                                                   | 说明                                             |
| ------------------------------------------------------ | ------------------------------------------------ |
| [在线示例](https://expcat.github.io/Tigercat/)         | 🚀 GitHub Pages 组件演示（Vue 3 / React）        |
| [skills/tigercat/SKILL.md](./skills/tigercat/SKILL.md) | 📘 **AI Agent 入口** - 组件列表、API、主题、i18n |
| [docs/ROADMAP.md](./docs/ROADMAP.md)                   | 开发路线图与当前规划                             |
| [docs/MIGRATION.md](./docs/MIGRATION.md)               | v2 breaking change 与迁移路径                    |
| [CHANGELOG.md](./CHANGELOG.md)                         | 版本变更与发布历史                               |
| [tests/README.md](./tests/README.md)                   | 测试结构、运行方式与质量标准入口                 |
| [examples/README.md](./examples/README.md)             | Vue / React 示例应用运行说明                     |

## 性能与兼容性

- 所有包配置为 `sideEffects: false`，支持 tree shaking；高级组件优先使用子路径导入以减小 bundle。
- 大数据列表/表格优先使用 `VirtualList`、`VirtualTable` 或 `InfiniteScroll`；`Table` 不会因数据量自动切换布局，只通过 `data-tiger-virtual-recommended="true"` 暴露建议状态。
- `Table` 与 `VirtualTable` 的固定列默认会跟随表格 token、条纹行和 hover 状态；需要覆盖 sticky 单元格外观时，优先在列定义上使用 `fixedClassName` / `fixedHeaderClassName`，而不是写全局 `[style*="position: sticky"]` 选择器。
- 图表基于纯 SVG，无第三方图表运行时依赖；超过 1000 点建议启用降采样，超过 5000 点建议服务端聚合。
- 主题基于 CSS 变量，推荐使用 `setThemeColors` 批量更新变量，减少重复重绘。
- 浏览器支持范围为现代浏览器最新两个主要版本；功能 E2E 覆盖 Chromium、Firefox、WebKit 与移动 Chromium，不维护跨系统易漂移的图片对比基线。

## 包

| Package                  | Description                  |
| ------------------------ | ---------------------------- |
| `@expcat/tigercat-core`  | 通用工具与类型               |
| `@expcat/tigercat-vue`   | Vue 3 组件                   |
| `@expcat/tigercat-react` | React 组件                   |
| `@expcat/tigercat-cli`   | CLI 脚手架工具               |
| `@expcat/tigercat-mcp`   | LLM skill reference 路由服务 |

## 兼容性

- **Vue:** >= 3.3.0
- **React:** >= 18.0.0
- **Tailwind CSS:** >= 4.0.0
- **Node.js:** >= 22.13.0

## 本地开发

```bash
git clone https://github.com/expcat/Tigercat.git
cd Tigercat
pnpm install && pnpm build
pnpm example:vue    # http://localhost:5173
pnpm example:react  # http://localhost:5174
```

## 常用命令

| Command            | Description            |
| ------------------ | ---------------------- |
| `pnpm build`       | 构建所有包             |
| `pnpm dev`         | 监听模式               |
| `pnpm test`        | 运行测试               |
| `pnpm test:a11y`   | 运行 axe 无障碍回归    |
| `pnpm size`        | 检查 bundle 大小       |
| `pnpm bench`       | 运行性能基准           |
| `pnpm docs:api`    | 生成 skills API 摘要   |
| `pnpm mcp:build`   | 构建本地 MCP 服务      |
| `pnpm mcp:serve`   | 以 stdio 启动 MCP 服务 |
| `pnpm example:all` | 同时运行两个示例       |
| `pnpm lint`        | 代码检查               |
| `pnpm clean`       | 清理构建产物           |

## 参与贡献

请先运行 `pnpm setup` 完成依赖安装、构建和环境检查。组件 API、示例与维护规则以 [skills/tigercat/SKILL.md](./skills/tigercat/SKILL.md) 为准，后续规划见 [docs/ROADMAP.md](./docs/ROADMAP.md)。

## License

MIT
