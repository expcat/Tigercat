# Tigercat

<!-- LLM-INDEX: packages=@expcat/tigercat-vue|@expcat/tigercat-react|@expcat/tigercat-core; frameworks=Vue3|React; requires=Tailwind-CSS; docs=docs/components-vue.md|docs/components-react.md|docs/theme.md -->

基于 Tailwind CSS 的 UI 组件库，支持 Vue 3 与 React。

## LLM Quick Start

### 安装

```bash
pnpm add @expcat/tigercat-vue @expcat/tigercat-core  # Vue 3
pnpm add @expcat/tigercat-react @expcat/tigercat-core # React
```

### Vue 3 最小示例

```vue
<script setup>
import { Button, ConfigProvider } from '@expcat/tigercat-vue'
</script>
<template>
  <ConfigProvider>
    <Button variant="solid" @click="handleClick">点击</Button>
  </ConfigProvider>
</template>
```

```css
/* 在项目 CSS 文件中引入 */
@import 'tailwindcss';
@source '../node_modules/@expcat/tigercat-vue/dist/**/*.{js,mjs}';
@source '../node_modules/@expcat/tigercat-core/dist/**/*.{js,mjs}';
```

### React 最小示例

```tsx
import { Button, ConfigProvider } from '@expcat/tigercat-react'
export function App() {
  return (
    <ConfigProvider>
      <Button variant="solid" onClick={handleClick}>
        点击
      </Button>
    </ConfigProvider>
  )
}
```

```css
/* 在项目 CSS 文件中引入 */
@import 'tailwindcss';
@source '../node_modules/@expcat/tigercat-react/dist/**/*.{js,mjs}';
@source '../node_modules/@expcat/tigercat-core/dist/**/*.{js,mjs}';
```

### Tailwind 配置（必需）

```js
// tailwind.config.js
import { tigercatPlugin } from '@expcat/tigercat-core'
export default {
  content: [
    './src/**/*.{vue,js,ts,jsx,tsx}',
    './node_modules/@expcat/tigercat-*/dist/**/*.{js,mjs}' // 扫描 Tigercat 包
  ],
  plugins: [tigercatPlugin] // 注入主题变量
}
```

## 演示

GitHub Pages： https://expcat.github.io/Tigercat/

## Documentation Index

**核心文档（LLM 优先）：**

- [Vue 组件总览](./docs/components-vue.md) - 所有 Vue 3 组件的 API 速览与使用示例
- [React 组件总览](./docs/components-react.md) - 所有 React 组件的 API 速览与使用示例
- [主题定制](./docs/theme.md) - CSS 变量与主题配置

**开发文档：**

- [开发路线图](./ROADMAP.md) - 功能规划与进度
- [贡献指南](./CONTRIBUTING.md) - 如何参与贡献
- [开发细节](./DEVELOPMENT.md) - 本地开发与构建
- [测试指南](./tests/TESTING_GUIDE.md) - Vue 测试规范
- [React 测试指南](./tests/REACT_TESTING_GUIDE.md) - React 测试规范

## 版本兼容性

- **Vue:** >= 3.3.0
- **React:** >= 18.0.0
- **Node.js:** >= 18 (推荐 20.19.6)
- **pnpm:** >= 8 (推荐 10)
- **Tailwind CSS:** >= 3.4.0

## 包与模块

| Package                  | Description    |
| ------------------------ | -------------- |
| `@expcat/tigercat-core`  | 通用工具与类型 |
| `@expcat/tigercat-vue`   | Vue 3 组件     |
| `@expcat/tigercat-react` | React 组件     |

## 本地开发

### 环境要求

- Node.js >= 18 (推荐 20.19.6)
- pnpm >= 8 (推荐 10)

### 安装与构建

```bash
git clone https://github.com/expcats/Tigercat.git
cd Tigercat
pnpm setup
```

或手动：

```bash
npm install -g pnpm@10.26.2
pnpm install
pnpm build
pnpm dev:check
```

### 开发与示例

```bash
pnpm dev
pnpm example:vue    # http://localhost:5173
pnpm example:react  # http://localhost:5174
pnpm example:all
```

### 测试

```bash
pnpm test
pnpm test:vue
pnpm test:react
```

测试文档：

- Vue： [tests/TESTING_GUIDE.md](./tests/TESTING_GUIDE.md)
- React： [tests/REACT_TESTING_GUIDE.md](./tests/REACT_TESTING_GUIDE.md)

## 可用脚本

| Command              | Description                      |
| -------------------- | -------------------------------- |
| `pnpm build`         | Build all packages               |
| `pnpm dev`           | Watch mode for all packages      |
| `pnpm test`          | Run all tests                    |
| `pnpm test:vue`      | Run Vue tests only               |
| `pnpm test:react`    | Run React tests only             |
| `pnpm test:ui`       | Run tests with interactive UI    |
| `pnpm test:coverage` | Run tests with coverage report   |
| `pnpm example:vue`   | Run Vue3 example (port 5173)     |
| `pnpm example:react` | Run React example (port 5174)    |
| `pnpm example:all`   | Run both examples simultaneously |
| `pnpm dev:check`     | Verify development environment   |
| `pnpm lint`          | Lint all packages                |
| `pnpm format`        | Format with Prettier             |
| `pnpm format:check`  | Check formatting (CI-friendly)   |
| `pnpm clean`         | Clean build artifacts            |

## 项目结构

```
tigercat/
├── packages/
│   ├── core/           # Core utilities and types
│   ├── vue/            # Vue 3 components
│   └── react/          # React components
├── docs/               # Documentation
│   ├── components-vue.md   # Vue component overview
│   ├── components-react.md # React component overview
│   └── theme.md            # Theme customization guide
├── tests/              # Test infrastructure and utilities
│   ├── vue/            # Vue component tests
│   ├── react/          # React component tests
│   └── utils/          # Test helpers and utilities
├── examples/           # Example applications
│   └── example/
│       ├── vue3/       # Vue 3 example app
│       └── react/      # React example app
├── package.json
├── pnpm-workspace.yaml
└── tsconfig.json
```

## 参与贡献

请先阅读 [CONTRIBUTING.md](./CONTRIBUTING.md)，开发细节见 [DEVELOPMENT.md](./DEVELOPMENT.md)。

### 快捷链接

- [Contributing Guide](./CONTRIBUTING.md)
- [Development Guide](./DEVELOPMENT.md)
- [Roadmap](./ROADMAP.md)

## License

MIT
