# Tigercat Examples

This directory contains example projects demonstrating how to use Tigercat UI components.

## Demo Projects

### Vue3 Demo (`demo/vue3`)

A comprehensive Vue 3 demo showcasing all Tigercat components with TypeScript and Tailwind CSS.

- **Port**: 5173
- **Framework**: Vue 3.5+
- **Build Tool**: Vite 7.3+
- **Features**: 
  - All component demos with interactive examples
  - Real-time theme switching (5 preset themes)
  - Responsive layouts
  - TypeScript type safety

[查看 Vue3 Demo 文档](./demo/vue3/README.md)

### React Demo (`demo/react`)

A comprehensive React demo showcasing all Tigercat components with TypeScript and Tailwind CSS.

- **Port**: 5174
- **Framework**: React 19.2+
- **Build Tool**: Vite 7.3+
- **Features**:
  - All component demos with interactive examples
  - Real-time theme switching (5 preset themes)
  - Responsive layouts
  - TypeScript type safety

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

访问 http://localhost:5173

### 运行 React Demo

```bash
pnpm --filter @tigercat-demo/react dev
```

访问 http://localhost:5174

### 同时运行两个 Demo

你可以在两个终端窗口中分别运行上述命令，或者使用并发工具。

## 项目结构

```
examples/
├── demo/
│   ├── vue3/           # Vue3 演示项目
│   │   ├── src/
│   │   │   ├── components/    # 共享组件 (如 ThemeSwitch)
│   │   │   ├── pages/         # 各组件演示页面
│   │   │   ├── App.vue
│   │   │   ├── main.ts
│   │   │   └── router.ts
│   │   ├── index.html
│   │   ├── package.json
│   │   ├── vite.config.ts
│   │   └── README.md
│   └── react/          # React 演示项目
│       ├── src/
│       │   ├── components/    # 共享组件 (如 ThemeSwitch)
│       │   ├── pages/         # 各组件演示页面
│       │   ├── App.tsx
│       │   ├── main.tsx
│       │   └── router.tsx
│       ├── index.html
│       ├── package.json
│       ├── vite.config.ts
│       └── README.md
└── README.md          # 本文件
```

## 演示的组件

所有演示项目都包含以下组件类别：

### 基础组件
- **Button** - 按钮 (支持多种样式、尺寸和状态)
- **Link** - 链接
- **Icon** - 图标
- **Text** - 文本

### 表单组件
- **Input** - 输入框 (支持多种类型和验证)
- **Textarea** - 文本域
- **Select** - 选择器 (支持单选和多选)
- **Checkbox** - 复选框 (单独使用或组合使用)
- **Radio** - 单选框 (与 RadioGroup 配合)
- **Switch** - 开关 (多种尺寸)
- **Slider** - 滑块 (可定制范围和步长)
- **Form** - 表单容器 (完整的表单示例)
- **FormItem** - 表单项
- **DatePicker** - 日期选择器 (多种格式和验证)
- **TimePicker** - 时间选择器
- **Upload** - 文件上传

### 布局组件
- **Layout** - 布局容器
- **Header** - 页头
- **Sidebar** - 侧边栏
- **Content** - 内容区
- **Footer** - 页脚
- **Row** - 行布局
- **Col** - 列布局
- **Grid** - 网格布局
- **Container** - 容器
- **Space** - 间距
- **Divider** - 分割线

## 主题系统

两个演示项目都集成了实时主题切换功能，可以在首页右上角切换主题：

### 预设主题

1. **默认蓝色** - Tigercat 默认主题 (#2563eb)
2. **绿色主题** - 清新自然的绿色 (#10b981)
3. **紫色主题** - 优雅的紫色 (#8b5cf6)
4. **橙色主题** - 活力的橙色 (#f59e0b)
5. **粉色主题** - 温馨的粉色 (#ec4899)

### 自定义主题

你可以通过修改 CSS 变量来自定义主题：

```css
:root {
  --tiger-primary: #your-color;
  --tiger-primary-hover: #your-hover-color;
  --tiger-primary-disabled: #your-disabled-color;
  --tiger-secondary: #your-secondary-color;
  --tiger-secondary-hover: #your-secondary-hover-color;
  --tiger-secondary-disabled: #your-secondary-disabled-color;
}
```

或者通过 JavaScript/TypeScript：

```typescript
// Vue3
import { setThemeColors } from '@tigercat/core'

setThemeColors({
  primary: '#10b981',
  primaryHover: '#059669',
  primaryDisabled: '#6ee7b7',
})

// React
const root = document.documentElement
root.style.setProperty('--tiger-primary', '#10b981')
root.style.setProperty('--tiger-primary-hover', '#059669')
```

### ThemeSwitch 组件

两个演示项目都包含 `ThemeSwitch` 组件，位于：
- Vue3: `examples/demo/vue3/src/components/ThemeSwitch.vue`
- React: `examples/demo/react/src/components/ThemeSwitch.tsx`

你可以在自己的项目中复用这个组件。

## 技术栈

- **Vue3 Demo**: Vue 3.5, TypeScript, Vite, Tailwind CSS
- **React Demo**: React 19.2, TypeScript, Vite, Tailwind CSS
- **UI 组件**: @tigercat/vue 和 @tigercat/react

## 如何扩展演示

### 添加新的组件演示

1. **创建演示页面**

   Vue3:
   ```bash
   # 在 examples/demo/vue3/src/pages/ 创建新文件
   # 例如: NewComponentDemo.vue
   ```

   React:
   ```bash
   # 在 examples/demo/react/src/pages/ 创建新文件
   # 例如: NewComponentDemo.tsx
   ```

2. **添加路由**

   Vue3 (`router.ts`):
   ```typescript
   { path: '/new-component', component: () => import('./pages/NewComponentDemo.vue') }
   ```

   React (`router.tsx`):
   ```typescript
   const NewComponentDemo = lazy(() => import('./pages/NewComponentDemo'))
   { path: '/new-component', element: <NewComponentDemo /> }
   ```

3. **更新首页导航**

   在 `Home.vue` 或 `Home.tsx` 的 `components` 数组中添加：
   ```typescript
   { name: 'NewComponent', path: '/new-component', category: '你的分类' }
   ```

### 创建自定义主题

在 `ThemeSwitch` 组件的 `themes` 数组中添加新主题：

```typescript
{
  name: '你的主题名',
  value: 'your-theme',
  colors: {
    primary: '#yourColor',
    primaryHover: '#yourHoverColor',
    primaryDisabled: '#yourDisabledColor',
    secondary: '#yourSecondaryColor',
    secondaryHover: '#yourSecondaryHoverColor',
    secondaryDisabled: '#yourSecondaryDisabledColor',
  }
}
```

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

#### 6. 主题切换不生效

**问题**: 切换主题后组件颜色没有变化。

**解决方案**:
- 检查浏览器控制台是否有错误
- 确保已正确导入 ThemeSwitch 组件
- 刷新页面后再次尝试
- 使用浏览器开发者工具检查 CSS 变量是否正确设置

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

## 演示截图

访问演示项目查看实时效果：
- Vue3: http://localhost:5173
- React: http://localhost:5174

主要特性：
- ✅ 完整的组件演示
- ✅ 实时主题切换
- ✅ 响应式布局
- ✅ TypeScript 类型支持
- ✅ 代码示例和说明

## 获取帮助

如果遇到未在此列出的问题:

1. 检查 [DEVELOPMENT.md](../../DEVELOPMENT.md#troubleshooting)
2. 搜索 [GitHub Issues](https://github.com/expcats/Tigercat/issues)
3. 在 [GitHub Discussions](https://github.com/expcats/Tigercat/discussions) 提问
4. 查看主 [README.md](../../README.md)

## 贡献

欢迎贡献新的演示示例！请参考 [CONTRIBUTING.md](../../CONTRIBUTING.md) 了解如何参与。
