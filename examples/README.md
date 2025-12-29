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

## 故障排查

### 常见问题

#### 1. Demo 无法启动

**问题**: 运行 `pnpm demo:vue` 或 `pnpm demo:react` 时出现错误。

**解决方案**:
```bash
# 确保已安装依赖
pnpm install

# 确保已构建核心包
pnpm build

# 再次尝试运行
pnpm demo:vue
```

#### 2. 组件样式不显示

**问题**: Demo 页面显示但组件样式缺失。

**解决方案**:
- 确保已构建所有包: `pnpm build`
- 检查浏览器控制台是否有错误
- 刷新浏览器缓存 (Ctrl+Shift+R 或 Cmd+Shift+R)

#### 3. 端口被占用

**问题**: `Error: Port 5173 is already in use` 或 `Port 5174 is already in use`

**解决方案**:
```bash
# 查找占用端口的进程
lsof -i :5173  # Vue3 demo
lsof -i :5174  # React demo

# 终止进程
kill -9 <PID>

# 或修改端口号
# 编辑 demo/vue3/vite.config.ts 或 demo/react/vite.config.ts
# 修改 server.port 配置
```

#### 4. 热重载不工作

**问题**: 修改代码后页面不自动刷新。

**解决方案**:
- 确保在开发模式下运行: `pnpm demo:vue` 或 `pnpm demo:react`
- 如果修改了 `@tigercat` 包，需要在另一个终端运行 `pnpm dev` 来监听包变化
- 检查 Vite 控制台是否有错误信息

#### 5. TypeScript 类型错误

**问题**: IDE 显示类型错误。

**解决方案**:
```bash
# 重新构建类型定义
pnpm build

# 重启 TypeScript 服务器 (在 VSCode 中)
# Cmd+Shift+P → "TypeScript: Restart TS Server"
```

### 推荐的开发工作流

1. **首次设置**:
   ```bash
   pnpm install
   pnpm build
   ```

2. **日常开发**:
   ```bash
   # 终端 1: 监听包变化
   pnpm dev
   
   # 终端 2: 运行 demo
   pnpm demo:vue    # 或 pnpm demo:react
   ```

3. **调试**:
   - 使用浏览器开发者工具
   - 检查 Vite 控制台输出
   - 查看 `/tmp/vue3-demo.log` 或 `/tmp/react-demo.log` (当使用 `pnpm demo:all` 时)

### 获取帮助

如果遇到未在此列出的问题:

1. 检查 [DEVELOPMENT.md](../../DEVELOPMENT.md#troubleshooting)
2. 搜索 [GitHub Issues](https://github.com/expcats/Tigercat/issues)
3. 在 [GitHub Discussions](https://github.com/expcats/Tigercat/discussions) 提问
4. 查看主 [README.md](../../README.md)
