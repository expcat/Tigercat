---
name: tigercat-building-apps
description: Recipe for building a complete general-purpose web app with Tigercat — app shell, routing, theme, dark mode, i18n, and common archetypes
---

# Building Apps With Tigercat

用 Tigercat 从零搭一个通用网页应用的端到端配方。组件细节查 [../component-index.md](../component-index.md)，
绑定差异查 [../shared/patterns/common.md](../shared/patterns/common.md)；本页只讲“怎么把组件组装成一个应用”。

## 1. Scaffold

优先用 CLI 模板（Tailwind v4 已接好）：

```bash
tigercat create my-app --template react   # 或 --template vue3
```

模板只给最小 App。手动接入与 `doctor` 见 [../getting-started.md](../getting-started.md) 与 [../cli.md](../cli.md)。应用 CSS 必须：

```css
@import 'tailwindcss';
@plugin '@expcat/tigercat-core/tailwind/modern';
```

组件导入优先使用 PascalCase 子路径，例如 `@expcat/tigercat-react/Button` 或
`@expcat/tigercat-vue/Button`；根入口 named exports 只作为小应用便利入口、hooks/composables、命令式
API 与共享类型入口。

## 2. App Shell

根部包一层 `ConfigProvider`（注入 locale / 主题），内部用布局组件拼出 Header + Sidebar + Content：

- 容器：`Layout` / `Header` / `Sidebar` / `Content` / `Footer`（props/examples 见 layout 分类）。
- 导航：侧栏 `Menu` + `MenuItem` / `SubMenu`，顶部 `Breadcrumb`，页内目录 `Anchor`。
- 路由出口：当前页放进 `Content` —— React 用 react-router `<Outlet/>`，Vue 用 vue-router `<router-view/>`。

React 骨架（精简自 examples/example/react，实际导入建议使用组件子路径）：

```tsx
<ConfigProvider locale={locale}>
  <Layout>
    <Header>{/* 品牌 + 主题/语言切换 */}</Header>
    <Layout>
      <Sidebar>
        <Menu items={nav} />
      </Sidebar>
      <Content>
        <Outlet />
      </Content>
    </Layout>
  </Layout>
</ConfigProvider>
```

Vue 同构：`<ConfigProvider :locale="locale">` 包裹，`<router-view/>` 放进 `Content`，导航事件用 kebab（`@select`）。完整可运行参考：`examples/example/{react,vue3}/src/layouts/AppLayout.*` 与 `App.*`。

## 3. Theme / Dark / Modern

- 暗色：`<html class="dark">` 或 `ThemeManager.setColorScheme('light' | 'dark' | 'auto')`。
- 现代视觉：`<html data-tiger-style="modern">`。
- 运行时换色：`setThemeColors({ primary })`。细节见 [../theme.md](../theme.md)。

## 4. i18n

`ConfigProvider` 的 `locale` 一次性注入，支持对象 / Promise / 懒加载函数。单语言应用可跳过 locale 体系，直接用组件 `labels` 或全局 `defineText(...)`。细节见 [../i18n.md](../i18n.md)。

## 5. Archetypes（选型）

| 应用类型    | 骨架                         | 关键组件                                                                   |
| ----------- | ---------------------------- | -------------------------------------------------------------------------- |
| 后台仪表盘  | Shell + 卡片栅格 + 图表      | `Card`, `Row`/`Col`, `Statistic`, Charts 分类, `DataTableWithToolbar`      |
| CRUD 列表页 | Shell + 工具栏 + 表格 + 弹窗 | `DataTableWithToolbar` / `Table`, `Modal` / `Drawer`, `Form`, `Pagination` |
| 表单密集型  | Shell + 多步表单             | `Form` / `FormItem`, `FormWizard`, 各 Form 输入组件                        |
| 内容/落地页 | Shell + 排版 + 反馈          | `Container`, `Space`, `Text`, `Tabs`, `Alert`, `Card`                      |

每种类型先开对应 examples 分类拿配置式片段，再按 component-index 规则查 props。

## 6. Data / State

Tigercat 不绑定数据层：表单值、弹层 `open`、表格选择 / 分页都是受控状态（Vue `v-model` / React `value` + `onChange`），由你的 store（Pinia / Redux / signals）或 `useState` / `ref` 持有。组合组件（`DataTableWithToolbar`、`FormWizard`）优先用其 props 接口配置，不要拆内部结构。

## 7. SSR / a11y

Nuxt / Next 直接用包入口，不要在模块顶层读浏览器 API，见 [../ssr.md](../ssr.md)。键盘 / 对比度 / role 默认达标，自定义交互补充见 [../accessibility.md](../accessibility.md)。

## Scope

本配方只保留可直接搭应用的稳定路径。需要完整页面时，以 `examples/example/{react,vue3}/src` 作为事实源；未来更完整的模板、数据获取、鉴权或在线编辑演示属于仓库维护计划，不进入普通 Skill 读取路径。
