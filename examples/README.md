# Tigercat Examples

本目录保留 Vite 示例应用与 SSR 示例应用，用来验证 Tigercat Vue 与 React 组件的真实使用路径。
示例源码优先使用 PascalCase 组件子路径导入，保留根入口 named exports 覆盖 hooks/composables、
命令式 API 和共享类型等非组件使用面。

> 🚀 **在线示例（GitHub Pages）**：<https://expcat.github.io/Tigercat/>

## 结构

```text
examples/
├── nuxt/      # @expcat/tigercat-example-nuxt，Nuxt 4 SSR smoke
├── nextjs/    # @expcat/tigercat-example-nextjs，Next.js SSR smoke
├── example/
│   ├── vue3/   # @expcat/tigercat-example-vue3
│   └── react/  # @expcat/tigercat-example-react
├── mcp/        # MCP skills 落地页
└── index.html  # GitHub Pages 入口（由 DEMO_NAV_GROUPS 生成）
```

入口页的组件清单、计数和分类来自 `examples/example/shared/app-config.ts` 的 `DEMO_NAV_GROUPS`。
改导航后运行 `node ./scripts/generate-example-index.mjs`。

## 可编辑示例模块

React 与 Vue 组件页中的每个展示块都是独立运行模块。模块放在对应应用的
`src/examples/<route>/<id>/` 下：

```text
01/
├── demo.json  # id、标题、描述、顺序、入口、视口与可选沙箱权限
├── App.tsx    # React 入口；Vue 使用 App.vue
└── data.ts    # 可选的同目录辅助文件，编译器会解析相对导入
```

- React 入口默认导出函数组件；Vue 入口使用标准 `<script setup>` SFC。
- 模块可导入同目录文本文件、框架运行时、Tigercat 公开入口及 `@demo-shared`。相对导入必须指向 registry 已收进 `bundle.files` 的文件。不支持任意 npm 包、Node 内置模块，或 Vue `<style lang="scss">`（只支持原生 CSS）。
- 页面首次展示及点击“运行”都在 iframe 中执行；编辑内容只保留在当前页面内存，刷新即恢复仓库源码。
- `Cmd/Ctrl+Enter` 可运行。编译失败会保留最后一次成功预览。
- 复杂示例可在 `demo.json` 中声明固定视口或沙箱权限。浮层类路由的默认高度由壳层按打开态计算，不要再靠 120px 白名单。

## 运行

```bash
pnpm example:vue    # http://localhost:5173
pnpm example:react  # http://localhost:5174
pnpm --filter @expcat/tigercat-example-nuxt dev
pnpm --filter @expcat/tigercat-example-nextjs dev
pnpm example:all    # 同时启动两个示例
```

首次运行或源码更新后推荐先执行：

```bash
pnpm install
pnpm build
```

## 构建

```bash
pnpm example:build
pnpm example:ssr:build
```

单独构建：

```bash
pnpm --filter @expcat/tigercat-example-vue3 build
pnpm --filter @expcat/tigercat-example-react build
pnpm --filter @expcat/tigercat-example-nuxt build
pnpm --filter @expcat/tigercat-example-nextjs build
```

SSR 示例（Next 16 / Nuxt 4）必须接上面的 Tailwind 配方。页面 HTML 含 styled Button、关着的 DatePicker（`2024-01-15`）和定宽高 gradient BarChart。不要把未打开的日历或未演示的 Modal/Drawer/Tooltip 写成已覆盖。`pnpm example:ssr:check` 锁产物 HTML、主题 CSS 与 hydrate。

## 样式接入要点

产品是 Tailwind CSS v4。业务项目需要扫描 Tigercat 构建产物：

```css
@import 'tailwindcss';
@plugin '@expcat/tigercat-core/tailwind';
@source '../node_modules/@expcat/tigercat-react/dist';
@source '../node_modules/@expcat/tigercat-core/dist';
```

运行时换肤走 `ConfigProvider` 的 `theme` / `colorScheme`（或 `ThemeManager`），不要再手写一套 hex 盘。
`@plugin '@expcat/tigercat-core/tailwind/modern'` 是 modern 预设的 CSS 入口，与 `theme="modern"` 等价。

## 维护

新增或修改组件 API 时，同步检查：

1. `examples/example/shared/app-config.ts` 中的分类、描述和路径，并重跑 `node ./scripts/generate-example-index.mjs`。
2. `examples/example/vue3/src` 与 `examples/example/react/src` 中的组件 value imports 是否继续使用 PascalCase 子路径；hooks/composables、`notification`、共享类型可继续走根入口或 core。
3. 每个 `demo.json` 是否拥有唯一 ID、有效入口和稳定顺序，源码是否能在独立沙箱中运行；新增或修改后运行 `pnpm example:sources:check`。
4. 单个模块是否保持小而可复制：只保留自身状态、数据和交互；颜色、尺寸、位置等正交静态变体使用一个代表实例复合展示，其余取值写入说明。
5. 只有交互方式、数据流或结构真正不同才拆分模块；弹层使用单一受控实例，异步流程、焦点与滚动场景不得依赖同页面其他示例。
6. 路由页是否继续通过 `React.lazy` / 原生 Vue Router import factory 懒加载，模块源码和浏览器编译器是否保持按需加载。
7. 对应组件分组测试是否通过，例如 `pnpm test:group:form` 或 `pnpm test:group -- --group feedback --framework react`。
8. `pnpm example:build` 是否通过；SSR、懒加载或按需导入变更还需要 `pnpm example:ssr:check`。
9. 本次变更文件是否通过 changed-file Prettier check。

组件 API 文档入口见 [skills/tigercat/SKILL.md](../skills/tigercat/SKILL.md)，测试入口见 [tests/README.md](../tests/README.md)。
