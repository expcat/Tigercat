# Tigercat

[![@expcat/tigercat-vue](https://img.shields.io/npm/v/@expcat/tigercat-vue?style=flat-square&logo=vue.js&label=@expcat/tigercat-vue)](https://www.npmjs.com/package/@expcat/tigercat-vue)
[![@expcat/tigercat-react](https://img.shields.io/npm/v/@expcat/tigercat-react?style=flat-square&logo=react&label=@expcat/tigercat-react)](https://www.npmjs.com/package/@expcat/tigercat-react)
[![@expcat/tigercat-core](https://img.shields.io/npm/v/@expcat/tigercat-core?style=flat-square&logo=npm&label=@expcat/tigercat-core)](https://www.npmjs.com/package/@expcat/tigercat-core)

基于 Tailwind CSS 的 UI 组件库，支持 Vue 3 与 React。**133+ 组件**，开箱即用。

**v1.0.0** — 首个正式稳定版本，遵循 SemVer 语义化版本。

> **📘 AI Agent 文档**
> 详细的组件 API、使用示例和配置指南请参考 [skills/tigercat/SKILL.md](./skills/tigercat/SKILL.md)

## 快速开始

### 安装

```bash
# Vue 3
pnpm add @expcat/tigercat-vue @expcat/tigercat-core

# React
pnpm add @expcat/tigercat-react @expcat/tigercat-core
```

### Tailwind 配置（必需）

```js
// tailwind.config.js
import { tigercatPlugin } from '@expcat/tigercat-core'
export default {
  content: [
    './src/**/*.{vue,js,ts,jsx,tsx}',
    './node_modules/@expcat/tigercat-*/dist/**/*.{js,mjs}'
  ],
  plugins: [tigercatPlugin]
}
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

## 演示

GitHub Pages： https://expcat.github.io/Tigercat/

## 文档

| 文档                                                   | 说明                                             |
| ------------------------------------------------------ | ------------------------------------------------ |
| [skills/tigercat/SKILL.md](./skills/tigercat/SKILL.md) | 📘 **AI Agent 入口** - 组件列表、API、主题、i18n |
| [ROADMAP.md](./ROADMAP.md)                             | 开发路线图与进度                                 |
| [MIGRATION_v1.0.0.md](./MIGRATION_v1.0.0.md)           | v0.8.0 → v1.0.0 迁移指南                         |
| [docs/PERFORMANCE.md](./docs/PERFORMANCE.md)           | 性能优化最佳实践                                 |
| [docs/BROWSER_SUPPORT.md](./docs/BROWSER_SUPPORT.md)   | 浏览器兼容性矩阵                                 |

## 包

| Package                  | Description    |
| ------------------------ | -------------- |
| `@expcat/tigercat-core`  | 通用工具与类型 |
| `@expcat/tigercat-vue`   | Vue 3 组件     |
| `@expcat/tigercat-react` | React 组件     |
| `@expcat/tigercat-cli`   | CLI 脚手架工具 |

## 兼容性

- **Vue:** >= 3.3.0
- **React:** >= 18.0.0
- **Tailwind CSS:** >= 3.4.0
- **Node.js:** >= 18

## 本地开发

```bash
git clone https://github.com/expcats/Tigercat.git
cd Tigercat
pnpm install && pnpm build
pnpm example:vue    # http://localhost:5173
pnpm example:react  # http://localhost:5174
```

## 常用命令

| Command            | Description      |
| ------------------ | ---------------- |
| `pnpm build`       | 构建所有包       |
| `pnpm dev`         | 监听模式         |
| `pnpm test`        | 运行测试         |
| `pnpm size`        | 检查 bundle 大小 |
| `pnpm bench`       | 运行性能基准     |
| `pnpm docs:api`    | 生成 API 文档    |
| `pnpm example:all` | 同时运行两个示例 |
| `pnpm lint`        | 代码检查         |
| `pnpm clean`       | 清理构建产物     |

## 参与贡献

请先阅读 [CONTRIBUTING.md](./CONTRIBUTING.md)，开发细节见 [DEVELOPMENT.md](./DEVELOPMENT.md)。

### 快捷链接

- [Contributing Guide](./CONTRIBUTING.md)
- [Development Guide](./DEVELOPMENT.md)
- [Roadmap](./ROADMAP.md)

## License

MIT
