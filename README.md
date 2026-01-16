# Tigercat

基于 Tailwind CSS 的 UI 组件库，支持 Vue 3 与 React。

## 演示

GitHub Pages： https://expcat.github.io/Tigercat/

## 文档

- Vue 组件总览： [docs/components-vue.md](./docs/components-vue.md)
- React 组件总览： [docs/components-react.md](./docs/components-react.md)
- 主题定制： [docs/theme.md](./docs/theme.md)

## 路线图

[开发路线图](./ROADMAP.md)

## 包与模块

| Package                  | Description    |
| ------------------------ | -------------- |
| `@expcat/tigercat-core`  | 通用工具与类型 |
| `@expcat/tigercat-vue`   | Vue 3 组件     |
| `@expcat/tigercat-react` | React 组件     |

## 快速开始

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
