---
name: tigercat-tokens
description: Tigercat design token architecture, generated assets, Figma export, and token inventory
---

# 设计 Token

Tigercat 的 token 以 `packages/core/tokens/tokens.json` 为单一数据源，生成 CSS 变量、TypeScript 常量、Tailwind 扩展和 Figma Variables JSON。

## 分层模型

| Layer     | Source key  | 用途                                      | CSS 前缀                     | TS 导出           |
| --------- | ----------- | ----------------------------------------- | ---------------------------- | ----------------- |
| Primitive | `primitive` | 颜色、间距、字号、圆角、阴影、motion 原值 | `--tiger-primitive-*`        | `primitive*`      |
| Semantic  | `semantic`  | intent 映射，如 surface/text/border/focus | `--tiger-semantic-*`         | `semanticTokens`  |
| Component | `component` | 组件级尺寸、间距、圆角、阴影覆盖          | `--tiger-component-{name}-*` | `componentTokens` |

兼容导出继续保留：`globalColors` / `globalSpace` / `aliasTokens` 与旧 CSS 变量（如 `--tiger-primary`、`--tiger-button-border-radius`）仍可使用。

## 生成命令

```bash
pnpm tokens:build
```

输出文件：

| File                                        | 内容                       |
| ------------------------------------------- | -------------------------- |
| `packages/core/tokens/tokens.css`           | 分层 CSS 变量 + 兼容变量   |
| `packages/core/src/tokens/tokens.ts`        | TS 常量、类型和兼容导出    |
| `packages/core/tokens/tailwind-tokens.js`   | Tailwind theme extend 对象 |
| `packages/core/tokens/figma-variables.json` | Figma Variables JSON       |

## 零闪烁主题加载

主题 CSS 应在应用 CSS 前加载，使 `color-scheme` 与变量在首帧可用：

```html
<link rel="preload" href="/node_modules/@expcat/tigercat-core/tokens.css" as="style" />
<link rel="stylesheet" href="/node_modules/@expcat/tigercat-core/tokens.css" />
```

若应用服务端已知道暗色偏好，可在首屏 HTML 上直接输出 `class="dark"`。`tokens.css` 会让 `.dark` 在 JS 执行前应用 `color-scheme: dark`，`ThemeManager` 运行后会同步维护 `<html>` 的 class 与 `style.colorScheme`。

## Figma Variables

Figma 导出位于 `@expcat/tigercat-core/figma-variables.json`，包含三个 collection：Primitive、Semantic、Component。每个变量都包含：

| Field         | 含义                    |
| ------------- | ----------------------- |
| `name`        | Figma 变量路径          |
| `type`        | `COLOR` 或 `STRING`     |
| `cssVariable` | 对应 CSS 变量名         |
| `value`       | Figma 可读取的值        |
| `reference`   | 上游 token 路径（如有） |

设计侧应以该 JSON 为导入源，不手工维护第二套 token。

## Token 清单

<TokenExplorer />
