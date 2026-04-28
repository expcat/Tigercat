# Phase 1C — 主题现代化设计稿 (2026-04)

> 设计原则：**新增 token 走 opt-in，默认外观保持现网兼容，不破坏 v1.0.x 视觉**。
> 用户启用方式：`createTigercatPlugin({ preset: modernTheme })` 或在 `:root` 自行设置 `data-tiger-style="modern"`。

## 1. 新增 token 一览

### 1.1 圆角（更圆润）

| 现有                  | 现行值 | 新 token              | 默认值 (modern) | 说明                         |
| --------------------- | ------ | --------------------- | --------------- | ---------------------------- |
| Tailwind `rounded-md` | 6px    | `--tiger-radius-sm`   | **8px**         | Input / Tag                  |
| Tailwind `rounded-lg` | 8px    | `--tiger-radius-md`   | **12px**        | Button / Card head           |
| Tailwind `rounded-xl` | 12px   | `--tiger-radius-lg`   | **16px**        | Modal / Drawer corner / Card |
| —                     | —      | `--tiger-radius-xl`   | **20px**        | FloatButton / Notification   |
| —                     | —      | `--tiger-radius-pill` | **9999px**      | Tag pill / Avatar            |

**接入策略**：组件源码改成 `rounded-[var(--tiger-radius-md,0.5rem)]`。fallback 等于现行值，向后兼容。

### 1.2 阴影（多层 + 玻璃描边）

```css
:root[data-tiger-style='modern'] {
  --tiger-shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.04), 0 1px 3px 0 rgb(0 0 0 / 0.06);
  --tiger-shadow-md: 0 4px 8px -2px rgb(0 0 0 / 0.06), 0 2px 4px -1px rgb(0 0 0 / 0.04);
  --tiger-shadow-lg: 0 12px 24px -4px rgb(0 0 0 / 0.08), 0 4px 8px -2px rgb(0 0 0 / 0.04);
  --tiger-shadow-xl: 0 24px 48px -8px rgb(0 0 0 / 0.1), 0 8px 16px -4px rgb(0 0 0 / 0.05);

  /* 玻璃拟态：背板模糊 + 内描边 + 微高光 */
  --tiger-shadow-glass:
    inset 0 1px 0 rgb(255 255 255 / 0.6), inset 0 -1px 0 rgb(0 0 0 / 0.04),
    0 8px 24px -4px rgb(15 23 42 / 0.1);
  --tiger-shadow-glass-strong:
    inset 0 1px 0 rgb(255 255 255 / 0.5), inset 0 0 0 1px rgb(255 255 255 / 0.18),
    0 16px 32px -8px rgb(15 23 42 / 0.16);
  --tiger-blur-glass: 16px;
  --tiger-blur-glass-strong: 24px;
}

.dark[data-tiger-style='modern'] {
  --tiger-shadow-glass:
    inset 0 1px 0 rgb(255 255 255 / 0.06), inset 0 -1px 0 rgb(0 0 0 / 0.4),
    0 8px 24px -4px rgb(0 0 0 / 0.4);
}
```

应用于：Modal、Drawer、Popover、Tooltip、Notification、Message、Card (raised)、FloatButton。

### 1.3 微渐变 (subtle gradient overlay)

```css
:root[data-tiger-style='modern'] {
  /* 用作按钮 / 强调卡片表面 */
  --tiger-gradient-primary: linear-gradient(
    180deg,
    color-mix(in oklab, var(--tiger-primary) 100%, white 8%) 0%,
    var(--tiger-primary) 100%
  );
  --tiger-gradient-surface: linear-gradient(
    180deg,
    color-mix(in oklab, var(--tiger-surface) 100%, white 4%) 0%,
    var(--tiger-surface) 100%
  );
  --tiger-gradient-danger: linear-gradient(
    180deg,
    color-mix(in oklab, var(--tiger-error) 100%, white 6%) 0%,
    var(--tiger-error) 100%
  );
}
```

> 浏览器：`color-mix(in oklab, ...)` 需要 Chrome 111+/Safari 16.4+/Firefox 113+。已属基线。
> 不支持时回退到纯色（CSS 引擎自动回退到下一条 `background` 声明）。

应用于：primary Button 表面、Tag (filled)、Statistic raised、Progress fill。

### 1.4 动效（更精细的 motion token）

```css
:root[data-tiger-style='modern'] {
  /* duration */
  --tiger-motion-duration-instant: 80ms;
  --tiger-motion-duration-quick: 150ms;
  --tiger-motion-duration-base: 200ms;
  --tiger-motion-duration-relaxed: 300ms;
  --tiger-motion-duration-slow: 450ms;

  /* easing — Material Motion v3 / iOS spring 灵感 */
  --tiger-motion-ease-standard: cubic-bezier(0.2, 0, 0, 1);
  --tiger-motion-ease-decelerate: cubic-bezier(0, 0, 0, 1);
  --tiger-motion-ease-accelerate: cubic-bezier(0.3, 0, 1, 1);
  --tiger-motion-ease-emphasized: cubic-bezier(0.2, 0, 0, 1.2); /* slight overshoot */
  --tiger-motion-ease-spring: linear(0, 0.36 8%, 0.85 22%, 1.05 33%, 1.02 50%, 0.99 70%, 1);

  /* compose */
  --tiger-transition-base: all var(--tiger-motion-duration-base) var(--tiger-motion-ease-standard);
  --tiger-transition-quick: all var(--tiger-motion-duration-quick) var(--tiger-motion-ease-standard);
  --tiger-transition-emphasized: transform var(--tiger-motion-duration-relaxed)
    var(--tiger-motion-ease-emphasized);
}
```

应用于：所有 `transition-all duration-200` → `transition-[color,background,box-shadow,transform] var(--tiger-transition-base)`。Hover scale、active scale 也用 spring easing 更自然。

> `linear()` easing 函数（Chrome 113+）让 spring 动效不依赖 JS。

### 1.5 暗色模式校准

- 玻璃拟态在 dark 下需要：背板透明度 `bg-[rgb(15_23_42_/_0.72)]` + `backdrop-blur-[var(--tiger-blur-glass)]` + 弱白色内描边
- 阴影从纯黑改为带微蓝 `rgb(2 6 23 / 0.5)`，避免在 dark 下"闷"

## 2. tailwindcss v4 兼容方案

Tailwind v4 已使用 `@theme` 块定义 token：

```css
/* core/tokens/index.css */
@theme {
  --color-tiger-primary: var(--tiger-primary);
  --color-tiger-surface: var(--tiger-surface);
  --radius-tiger-sm: var(--tiger-radius-sm);
  --radius-tiger-md: var(--tiger-radius-md);
  --radius-tiger-lg: var(--tiger-radius-lg);
  --shadow-tiger-glass: var(--tiger-shadow-glass);
  --ease-tiger-emphasized: var(--tiger-motion-ease-emphasized);
}
```

下游就能写 `bg-tiger-primary rounded-tiger-md shadow-tiger-glass ease-tiger-emphasized`，比 arbitrary 更稳。

## 3. 接入计划（不破坏外观）

| 阶段   | 范围                                                                                                                           |
| ------ | ------------------------------------------------------------------------------------------------------------------------------ |
| Step 1 | 在 `packages/core/src/theme/tokens.css`（新建）声明所有新 token，**fallback 到现有视觉**（旧值），并通过 `tigercatPlugin` 注入 |
| Step 2 | 提供 `data-tiger-style="modern"` 选择器覆盖默认值                                                                              |
| Step 3 | 组件源码逐组替换 `rounded-lg` → `rounded-[var(--tiger-radius-md,0.5rem)]` 等（每组一个 PR）                                    |
| Step 4 | 在 `themes/modern/` 增加 modern preset，导出 `modernTheme`                                                                     |
| Step 5 | examples 加"现代化主题"开关                                                                                                    |

## 4. 文档

- 在 `skills/tigercat/references/theme.md` 增"Modern Style 主题"节，说明启用方式、token 列表、与默认主题差异
- 提供 Vue + React 一行启用示例

## 5. 验收

- 默认配置下视觉与 v1.0.7 完全一致（pixel diff = 0）
- `data-tiger-style="modern"` 切换后所有组件圆角、阴影、动效遵从新 token，无破坏
- a11y：阴影/玻璃不影响 contrast ratio（Modal 表面 vs 文本仍 ≥4.5:1）
- prefers-reduced-motion 下 `--tiger-motion-duration-*` 全部缩短为 0ms（用 media query 覆盖）
