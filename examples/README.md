# Tigercat Examples

This directory contains example projects demonstrating how to use Tigercat UI components.

## Demo Projects

### Vue3 Demo (`demo/vue3`)

A comprehensive Vue 3 demo showcasing all Tigercat components with TypeScript and Tailwind CSS.

- **Port**: 5173
- **Framework**: Vue 3.5+
- **Build Tool**: Vite 7.3+

[查看 Vue3 Demo 文档](./demo/vue3/README.md)

### React Demo (`demo/react`)

A comprehensive React demo showcasing all Tigercat components with TypeScript and Tailwind CSS.

- **Port**: 5174
- **Framework**: React 19.2+
- **Build Tool**: Vite 7.3+

[查看 React Demo 文档](./demo/react/README.md)

## 快速开始

### 安装依赖

在项目根目录运行：

```bash
pnpm install
```

### 运行 Vue3 Demo

```bash
pnpm --filter @tigercat-demo/vue3 dev
```

### 运行 React Demo

```bash
pnpm --filter @tigercat-demo/react dev
```

### 同时运行两个 Demo

你可以在两个终端窗口中分别运行上述命令，或者使用并发工具。

## 项目结构

```
examples/
├── demo/
│   ├── vue3/           # Vue3 演示项目
│   │   ├── src/
│   │   ├── index.html
│   │   ├── package.json
│   │   ├── vite.config.ts
│   │   └── README.md
│   └── react/          # React 演示项目
│       ├── src/
│       ├── index.html
│       ├── package.json
│       ├── vite.config.ts
│       └── README.md
└── README.md          # 本文件
```

## 演示的组件

所有演示项目都包含以下组件类别：

- **基础组件**: Button, Link, Icon, Text
- **表单组件**: Input, Textarea, Select, Checkbox, Radio, Switch, Slider, Form, FormItem
- **布局组件**: Layout, Header, Sidebar, Content, Footer, Row, Col, Container, Space
- **其他组件**: Divider

## 技术栈

- **Vue3 Demo**: Vue 3.5, TypeScript, Vite, Tailwind CSS
- **React Demo**: React 19.2, TypeScript, Vite, Tailwind CSS
- **UI 组件**: @tigercat/vue 和 @tigercat/react
