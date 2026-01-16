# 贡献指南

## 环境要求

- Node.js >= 18（推荐 20.19.6）
- pnpm >= 8（推荐 10）

## 快速开始

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

## 开发流程（简）

```bash
pnpm dev
pnpm example:vue    # http://localhost:5173
pnpm example:react  # http://localhost:5174
pnpm test
```

## 修改位置

```
tigercat/
├── packages/
│   ├── core/           # Framework-agnostic utilities and types
│   ├── vue/            # Vue 3 components
│   └── react/          # React components
├── examples/
│   └── example/
│       ├── vue3/       # Vue 3 example app
│       └── react/      # React example app
├── tests/
│   ├── vue/            # Vue component tests
│   ├── react/          # React component tests
│   └── utils/          # Shared test utilities
├── docs/               # Documentation
├── scripts/            # Development scripts
└── .vscode/            # VSCode settings and recommendations
```

## 修改位置

- Core：`packages/core/src/`
- Vue：`packages/vue/src/components/`
- React：`packages/react/src/components/`
- 文档：`docs/components-vue.md` / `docs/components-react.md` / `docs/theme.md`
- 测试：`tests/vue/` / `tests/react/`

## 代码规范（简）

- TypeScript 严格模式，避免 `any`
- Vue 事件使用 kebab-case（如 `@click`）
- React 事件使用 camelCase（如 `onClick`）
- 样式优先 Tailwind + CSS 变量

## 提交与 PR（简）

- Commit 规范：`feat|fix|docs|chore|refactor|test|perf`
- 提交前：`pnpm test`、`pnpm lint`、`pnpm build`
- 新组件：补文档与测试，必要时更新 [ROADMAP.md](./ROADMAP.md)

## 相关文档

- [DEVELOPMENT.md](./DEVELOPMENT.md)
- [Vue Testing Guide](./tests/TESTING_GUIDE.md)
- [React Testing Guide](./tests/REACT_TESTING_GUIDE.md)
- [Vue Components](./docs/components-vue.md)
- [React Components](./docs/components-react.md)
