# CLI 工具 — @expcat/tigercat-cli

Tigercat CLI 脚手架工具，提供项目创建、组件添加、Playground 启动、API 文档生成和项目健康检查等开发者工具。

## 安装

```bash
pnpm add -g @expcat/tigercat-cli
# 或使用 npx
npx @expcat/tigercat-cli <command>
```

## 命令一览

| 命令                     | 说明                           | 关键选项                  |
| ------------------------ | ------------------------------ | ------------------------- |
| `tigercat create <name>` | 创建新项目                     | `--template vue3\|react`  |
| `tigercat add [comp...]` | 向现有项目添加组件（支持交互多选） | `--framework`, `--install`, `--snippet` |
| `tigercat playground`    | 启动交互式开发预览                | `--template`, `--port`, `--no-open`     |
| `tigercat generate docs` | 从 Props 类型生成 API 文档        | `--input`, `--output`                  |
| `tigercat generate test` | 生成组件测试模板                  | `--framework vue3\|react\|both`       |
| `tigercat generate doc-template` | 生成组件文档模板          | `--output`                             |
| `tigercat doctor`        | 检查项目工具链与依赖兼容性        | `--json`                               |

---

## `tigercat create <name>`

创建一个预配置好 Tigercat 的新项目。

```bash
tigercat create my-app                  # 交互式选择模板
tigercat create my-app --template vue3  # Vue 3 项目
tigercat create my-app --template react # React 项目
```

**生成的项目包含：**

- Vite 构建配置
- Tailwind CSS v4 集成（`@tailwindcss/vite`）
- 主题 CSS 变量（支持深色模式）
- 示例 App 组件（引入 Button）
- TypeScript 配置

---

## `tigercat add <component...>`

向现有项目添加组件，自动生成导入语句和 demo 文件。

```bash
tigercat add Button
tigercat add Form Input Select DatePicker  # 一次添加多个
tigercat add                              # 交互式多选组件
tigercat add Button --install             # 安装缺失依赖
tigercat add Button --snippet src/tigercat-components.ts
```

**行为：**

1. 从 `package.json` 检测项目框架（Vue/React）
2. 验证组件名（大小写不敏感，支持 50+ 组件）
3. 检查 Tigercat peer dependencies，必要时输出安装命令或用 `--install` 安装
4. 可用 `--snippet` 生成复用导入片段
5. 在 `src/components/` 下生成 demo 文件（`.vue` 或 `.tsx`）

**支持的组件类别：**

- Basic: Alert, Avatar, Badge, Button, Code, Divider, Icon, Link, Tag, Text 等
- Form: Checkbox, DatePicker, Form, Input, Select, Switch, Upload 等
- Feedback: Drawer, Modal, Message, Notification, Popover, Tooltip 等
- Layout: Card, Container, Grid, Layout, List, Space 等
- Navigation: Breadcrumb, Dropdown, Menu, Pagination, Tabs, Tree 等
- Data: Table, Timeline, Calendar, Kanban, VirtualTable 等
- Charts: AreaChart, BarChart, LineChart, PieChart, RadarChart 等

---

## `tigercat playground`

启动一个临时的交互式开发预览环境。

```bash
tigercat playground                      # 默认 Vue 3, 端口 3456
tigercat playground --template react     # React 模板
tigercat playground --port 4000          # 自定义端口
tigercat playground --no-open            # 不自动打开浏览器
```

**行为：**

1. 在 `.tigercat-playground/` 创建临时项目
2. 自动安装依赖（`pnpm install`）
3. 启动 Vite 开发服务器并默认自动打开浏览器

---

## `tigercat generate docs`

从 `packages/core/src/types/*.ts` 中的 Props 接口自动生成 Markdown API 文档。

```bash
tigercat generate docs
tigercat generate docs --input ./packages/core/src/types --output ./docs/api
```

**输出格式：**

- 每个组件生成一个 Props 表格（属性名、类型、必填、说明）
- 自动生成按字母排序的索引文件

---

## `tigercat generate test`

生成 Vue/React 组件测试模板，包含基础渲染、a11y 与 Edge Cases 结构。

```bash
tigercat generate test Button --framework both
tigercat generate test Button --framework vue3
tigercat generate test Button --framework react --dry-run
```

---

## `tigercat generate doc-template`

生成组件文档模板，覆盖 Overview、Import、Basic Usage、Props、Accessibility 与 Edge Cases。

```bash
tigercat generate doc-template Button
tigercat generate doc-template Button --output docs/components --dry-run
```

---

## `tigercat doctor`

检查当前项目是否符合 Tigercat 模板和运行时依赖要求。

```bash
tigercat doctor
tigercat doctor --json
```

**检查内容：**

- `package.json` 是否可读取
- Node.js 是否满足 `>=20`
- pnpm 是否满足 `>=8`
- Tailwind CSS 是否为 v4 兼容版本
- Vue/React Tigercat peer dependencies 是否齐全
- 当前项目依赖是否接近 CLI 模板要求
- 版本兼容矩阵和可执行修复建议

---

## 源码位置

| 文件                                      | 说明               |
| ----------------------------------------- | ------------------ |
| `packages/cli/src/index.ts`               | CLI 入口           |
| `packages/cli/src/constants.ts`           | 常量（组件列表等） |
| `packages/cli/src/commands/create.ts`     | create 命令        |
| `packages/cli/src/commands/add.ts`        | add 命令           |
| `packages/cli/src/commands/playground.ts` | playground 命令    |
| `packages/cli/src/commands/generate.ts`   | generate 命令      |
| `packages/cli/src/commands/doctor.ts`     | doctor 命令        |
| `packages/cli/src/templates/vue3.ts`      | Vue 3 项目模板     |
| `packages/cli/src/templates/react.ts`     | React 项目模板     |
| `packages/cli/src/utils/logger.ts`        | 日志工具           |
| `packages/cli/src/utils/fs.ts`            | 文件系统工具       |
| `tests/core/cli.spec.ts`                  | CLI 单元测试       |
