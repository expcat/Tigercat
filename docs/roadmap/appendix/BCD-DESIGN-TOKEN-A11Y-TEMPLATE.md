# 附录 B/C/D：Design Token、a11y 检查清单、组件模板

<!-- LLM-INDEX
type: 技术规范 + 检查清单 + 开发模板
scope: v0.5.0 及以后所有版本
sections: B(Token规格), C(a11y检查清单), D(组件模板)
-->

---

# 附录 B：Design Token 完整规格

## B.1 三层 Token 体系

### 第一层：Global Tokens（全局令牌）

| 系统 | 内容                                                                    |
| ---- | ----------------------------------------------------------------------- |
| 颜色 | Primary/Secondary/Success/Warning/Error/Info 各 9 级色阶 (50-950)       |
| 排版 | Font Family (base/mono), Size (xs 12px ~ 4xl 36px), Weight, Line Height |
| 间距 | xs (2px) ~ 4xl (64px) 共 8 级                                           |
| 圆角 | none (0) ~ full (9999px) 共 6 级                                        |
| 阴影 | xs ~ xl 共 5 级                                                         |
| 动效 | Duration (fast 100ms ~ slower 500ms), Easing (in/out/in-out)            |

### 第二层：Alias Tokens（别名令牌）

```
--tiger-bg-primary      → color.primary.50
--tiger-bg-secondary    → color.neutral.50
--tiger-text-primary    → color.neutral.900
--tiger-text-secondary  → color.neutral.600
--tiger-border          → color.neutral.200
--tiger-error           → color.error.500
```

### 第三层：Component Tokens（组件令牌）

```
button:
  --button-height-sm: 32px
  --button-height-md: 36px
  --button-bg-primary: --tiger-bg-primary
  --button-text-primary: --tiger-text-primary
  --button-border-radius: --tiger-radius-md
```

## B.2 CSS 变量命名规范

```
--tiger-<category>-<property>-<modifier>

示例:
--tiger-color-primary-500
--tiger-color-primary-500-hover
--tiger-color-error-bg
--tiger-space-md
--tiger-radius-lg
--tiger-shadow-md
--tiger-duration-base
--tiger-easing-out
```

---

# 附录 C：无障碍 (a11y) 检查清单

WCAG 标准: 2.1 Level AA

## C.1 颜色对比度

| 文本类型         | 对比度要求 |
| ---------------- | ---------- |
| 常规文本 (14px+) | 4.5:1      |
| 大文本 (18px+)   | 3:1        |
| 边框/分隔线      | 3:1        |

## C.2 键盘导航

| 快捷键                 | 功能                | 应用组件                           |
| ---------------------- | ------------------- | ---------------------------------- |
| Tab                    | 焦点移到下一元素    | 所有                               |
| Shift+Tab              | 焦点移到前一元素    | 所有                               |
| Enter                  | 确认/提交/激活      | Button, Link, Select, Menu 等      |
| Escape                 | 关闭/取消           | Modal, Drawer, Dropdown, Select 等 |
| ArrowUp / ArrowDown    | 列表中上下移动      | Select, Menu, Tree, Table 等       |
| ArrowLeft / ArrowRight | 左右移动或展开/收起 | Tabs, Tree, Slider 等              |
| Space                  | 触发按钮/勾选复选框 | Button, Checkbox, Radio 等         |

## C.3 ARIA 属性检查清单

### 通用

- [ ] 使用语义化 HTML (`<button>` 而非 `<div role="button">`)
- [ ] 非语义元素添加适当 `role`
- [ ] 交互元素添加 `aria-label` 或关联 `<label>`
- [ ] 额外描述使用 `aria-describedby`

### 表单组件

- [ ] Form: `<fieldset>` + `<legend>` 分组
- [ ] Input: 关联 `<label>` 或 `aria-label`
- [ ] Select: `aria-expanded` 表示展开状态
- [ ] Checkbox/Radio: 使用原生 `<input>` 元素

### 模态/弹出层

- [ ] Modal: `role="dialog"`, `aria-modal="true"`, `aria-labelledby`
- [ ] Popover/Tooltip: `role="tooltip"`, `aria-describedby`

## C.4 屏幕阅读器测试

推荐工具: NVDA (Win), VoiceOver (macOS/iOS), TalkBack (Android)

测试流程:

1. 逐项浏览组件，验证所有交互元素可被正确识别
2. 验证焦点顺序合理
3. 验证所有必要信息被播报

---

# 附录 D：新组件实现模板

## D.1 Vue 组件模板 (.ts, defineComponent + render)

```ts
import { defineComponent, h, computed, PropType } from 'vue'
import { classNames, coerceClassValue } from '@expcat/tigercat-core'

export const MyComponent = defineComponent({
  name: 'TigerMyComponent',
  props: {
    variant: {
      type: String as PropType<'primary' | 'secondary'>,
      default: 'primary'
    },
    disabled: { type: Boolean, default: false }
  },
  emits: ['click'],
  setup(props, { emit, slots, attrs }) {
    const classes = computed(() => classNames('ti-my-component', coerceClassValue(attrs.class)))
    return () => h('div', { class: classes.value }, slots.default?.())
  }
})
```

## D.2 React 组件模板 (.tsx)

```tsx
import React, { useMemo } from 'react'
import { classNames } from '@expcat/tigercat-core'

export interface MyComponentProps {
  variant?: 'primary' | 'secondary'
  disabled?: boolean
  className?: string
  children?: React.ReactNode
}

export const MyComponent: React.FC<MyComponentProps> = ({
  variant = 'primary',
  disabled = false,
  className,
  children,
  ...props
}) => {
  const classes = useMemo(() => classNames('ti-my-component', className), [className])

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  )
}
```

## D.3 测试模板

```typescript
import { describe, it, expect } from 'vitest'

describe('MyComponent', () => {
  it('should render correctly', () => {})
  it('should handle click events', async () => {})
  it('should support keyboard navigation', async () => {})
  it('should have proper ARIA attributes', () => {})
})
```

## D.4 i18n 模板

```typescript
// zh-CN
export const ZH_CN_COMPONENT = {
  placeholder: '请选择',
  confirm: '确认',
  cancel: '取消',
  notFound: '未找到匹配项'
}

// en-US
export const EN_US_COMPONENT = {
  placeholder: 'Please select',
  confirm: 'Confirm',
  cancel: 'Cancel',
  notFound: 'No matching options'
}
```
