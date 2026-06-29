# Tigercat Examples

本目录保留 Vite 示例应用与 SSR 示例应用，用来验证 Tigercat Vue 与 React 组件的真实使用路径。
示例源码优先使用 PascalCase 组件子路径导入，保留根入口 named exports 覆盖 hooks/composables、
命令式 API 和共享类型等非组件使用面。

## 结构

```text
examples/
├── nuxt/      # @expcat/tigercat-example-nuxt，Nuxt 3 SSR smoke
├── nextjs/    # @expcat/tigercat-example-nextjs，Next.js SSR smoke
├── example/
│   ├── vue3/   # @expcat/tigercat-example-vue3
│   └── react/  # @expcat/tigercat-example-react
└── index.html  # GitHub Pages 入口
```

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

SSR 示例会渲染稳定 `DatePicker` 与带 SVG gradient 的 `BarChart`，覆盖 Roadmap §9.3 中的 hydration mismatch 风险点。

## 样式接入要点

业务项目需要让 Tailwind 扫描 Tigercat 构建产物：

```js
export default {
  content: [
    './src/**/*.{vue,js,ts,jsx,tsx}',
    './node_modules/@expcat/tigercat-*/dist/**/*.{js,mjs}'
  ]
}
```

如果使用 Tailwind v4 CSS 入口，也需要在应用 CSS 中加入对应 `@source`：

```css
@import 'tailwindcss';
@source '../node_modules/@expcat/tigercat-*/dist/**/*.{js,mjs}';
```

## 维护

新增或修改组件 API 时，同步检查：

1. `examples/example/shared/app-config.ts` 中的分类、描述和路径。
2. `examples/example/vue3/src` 与 `examples/example/react/src` 中的组件 value imports 是否继续使用 PascalCase 子路径；hooks/composables、`notification`、共享类型可继续走根入口或 core。
3. 路由页是否继续通过 `React.lazy` / `defineAsyncComponent` 懒加载。
4. 对应组件分组测试是否通过，例如 `pnpm test:group:form` 或 `pnpm test:group -- --group feedback --framework react`。
5. `pnpm example:build` 是否通过；SSR、懒加载或按需导入变更还需要 `pnpm example:ssr:check`。
6. 本次变更文件是否通过 changed-file Prettier check。

组件 API 文档入口见 [skills/tigercat/SKILL.md](../skills/tigercat/SKILL.md)，测试入口见 [tests/README.md](../tests/README.md)。
