# Tigercat React Example

这是 Tigercat UI 组件库的 React 示例项目。

## 功能特性

- 展示所有 Tigercat React 组件
- 使用 Vite 作为构建工具
- 使用 TypeScript 进行类型检查
- 集成 Tailwind CSS 样式系统

## 在业务项目中使用（NPM + 按需样式）

安装依赖：

```bash
pnpm add @expcat/tigercat-react
```

在 Tailwind 配置中加入 Tigercat 构建产物路径，确保按需生成样式：

```js
// tailwind.config.js
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    './node_modules/@expcat/tigercat-*/dist/**/*.{js,mjs}'
  ],
  theme: {
    extend: {}
  },
  plugins: []
}
```

使用组件：

```tsx
import { Button } from '@expcat/tigercat-react'

export function App() {
  return <Button>Button</Button>
}
```

在项目的 CSS 文件中加入以下内容（放在业务样式之前）：

```css
@import 'tailwindcss';
@source '../node_modules/@expcat/tigercat-react/dist/**/*.{js,mjs}';
@source '../node_modules/@expcat/tigercat-core/dist/**/*.{js,mjs}';
```

## 安装依赖

在项目根目录运行：

```bash
pnpm install
```

## 开发

启动开发服务器：

```bash
pnpm --filter @expcat/tigercat-example-react dev
```

或者在当前目录下运行：

```bash
pnpm dev
```

访问 http://localhost:5174 查看演示页面。

## 构建

构建生产版本：

```bash
pnpm build
```

## 预览

预览生产构建：

```bash
pnpm preview
```

## 组件演示

此演示项目包含以下组件的示例：

- **按钮组件**: 不同变体、大小和状态的按钮
- **表单组件**: Input, Textarea, Select, Checkbox, Radio, Switch, Slider
- **布局组件**: Layout, Header, Sidebar, Content, Footer, Row, Col, Container
- **文本组件**: Text, Link, Icon
- **其他组件**: Space, Divider

## 技术栈

- React 19.2+
- TypeScript 5.9+
- Vite 7.3+
- Tailwind CSS 3.4+
- Tigercat UI Components
