# 附录 B/C/D：Design Token、a11y 检查清单、组件模板

---

# 附录 B：Design Token 完整规格

**文档类型**: 技术规范
**适用范围**: v0.5.0 及以后所有版本
**用途**: Design Token 体系的完整定义和应用指引

## B.1 三层 Token 体系定义

Tigercat 的 Design Token 体系分为三层：

### 第一层：Global Tokens（全局令牌）

**颜色系统**:

- 主色 (Primary): Blue 系列，9 级色阶 (50-950)
- 次色 (Secondary): Gray/Neutral 系列，9 级色阶
- 功能色 (Functional): Success (Green), Warning (Orange), Error (Red), Info (Blue) 各 9 级

**排版系统**:

- Font Family: 基础字体、等宽字体
- Font Size: xs (12px) - 4xl (36px) 共 9 个等级
- Font Weight: normal (400) - bold (700)
- Line Height: tight (1.25) - loose (2) 共 4 个等级

**间距系统**:

- xs (2px) - 4xl (64px) 共 8 个等级
- 用于 margin、padding、gap 等

**圆角系统**:

- none (0) - full (9999px) 共 6 个等级

**阴影系统**:

- xs - xl 共 5 个等级
- 用于深度表现

**动效系统**:

- Duration: fast (100ms) - slower (500ms)
- Easing: in, out, in-out

### 第二层：Alias Tokens（别名令牌）

将 Global Tokens 映射为语义化的别名：

```
--tiger-bg-primary      → Global.color.primary.50     # 主要背景
--tiger-bg-secondary    → Global.color.neutral.50     # 次要背景
--tiger-text-primary    → Global.color.neutral.900    # 主要文字
--tiger-text-secondary  → Global.color.neutral.600    # 次要文字
--tiger-border          → Global.color.neutral.200    # 边框
--tiger-error           → Global.color.error.500      # 错误状态
```

### 第三层：Component Tokens（组件级别令牌）

为每个组件定义专属的 Token：

```
button:
  --button-height-sm: 32px
  --button-height-md: 36px
  --button-bg-primary: --tiger-bg-primary
  --button-text-primary: --tiger-text-primary
  --button-border-radius: --tiger-radius-md
```

## B.2 Token JSON 结构示例

见各版本规格文档中的完整示例。

## B.3 CSS 变量命名规范

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

**文档类型**: 检查清单
**WCAG 标准**: 2.1 Level AA
**适用范围**: 所有组件

## C.1 颜色对比度要求

| 文本类型         | 对比度要求 | 检查工具                |
| ---------------- | ---------- | ----------------------- |
| 常规文本 (14px+) | 4.5:1      | WCAG Contrast Checker   |
| 大文本 (18px+)   | 3:1        | WCAG Contrast Checker   |
| 边框/分隔线      | 3:1        | Color Contrast Analyzer |

## C.2 键盘导航要求

### 所有交互组件必须支持

| 快捷键                 | 功能                 | 应用组件                           |
| ---------------------- | -------------------- | ---------------------------------- |
| Tab                    | 焦点移到下一元素     | 所有                               |
| Shift+Tab              | 焦点移到前一元素     | 所有                               |
| Enter                  | 确认、提交、激活     | Button, Link, Select, Menu 等      |
| Escape                 | 关闭、取消           | Modal, Drawer, Dropdown, Select 等 |
| ArrowUp / ArrowDown    | 在列表中上下移动     | Select, Menu, Tree, Table 等       |
| ArrowLeft / ArrowRight | 左右移动或展开/收起  | Tabs, Tree, Slider 等              |
| Space                  | 触发按钮、勾选复选框 | Button, Checkbox, Radio 等         |

## C.3 ARIA 属性检查清单

### 通用属性（所有组件）

- [ ] 使用语义化 HTML 元素（`<button>` vs `<div role="button">`）
- [ ] 为非语义元素添加适当的 `role` 属性
- [ ] 为交互元素添加 `aria-label` 或关联 `<label>`
- [ ] 当需要额外描述时，添加 `aria-describedby`

### 表单组件

- [ ] Form: `<fieldset>` 和 `<legend>` 用于分组
- [ ] Input: 关联 `<label>` 或 `aria-label`
- [ ] Select: `aria-expanded` 表示打开/关闭状态
- [ ] Checkbox/Radio: 使用 `<input type="checkbox">` 等原生元素

### 按钮和链接

- [ ] Button: `<button>` 元素，`aria-pressed` 表示开关状态
- [ ] Link: 链接文本清晰，`aria-current` 表示当前页面
- [ ] Icon Button: 必须有 `aria-label` 或 `aria-labelledby`

### 模态和弹出层

- [ ] Modal: `role="dialog"`, `aria-modal="true"`, `aria-labelledby="title"`
- [ ] Drawer: 与 Modal 相同
- [ ] Popover/Tooltip: `role="tooltip"`, `aria-describedby`

## C.4 屏幕阅读器播报测试

**推荐测试工具**:

- NVDA (Windows)
- JAWS (Windows, 付费)
- VoiceOver (macOS/iOS)
- TalkBack (Android)

**测试流程**:

1. 使用屏幕阅读器逐项浏览组件
2. 验证所有可交互元素都能被正确识别
3. 验证焦点顺序合理
4. 验证所有必要信息都被播报

---

# 附录 D：新组件实现模板

**文档类型**: 开发模板
**用途**: Copilot 和开发者参考，新增组件时按此模板执行

## D.1 组件规格文档模板

```markdown
# [ComponentName] 组件规格

## 功能说明

[2-3 句话，说明这个组件是什么、解决什么问题]

## API 规格

### Props

[Table: 名称, 类型, 默认值, 说明, 是否必需]

### Events / Emits

[Table: 事件名, 参数, 说明]

### Slots

[Table: 插槽名, 作用域变量, 说明]

## 类型定义

[TypeScript 接口代码]

## 使用示例

[Vue 和 React 各一个示例]

## 键盘导航

[支持的快捷键表]

## 无障碍要求

[ARIA 属性、播报要求等]

## 国际化

[i18n 文案列表]

## 验收标准

[测试覆盖项]
```

## D.2 Vue 组件文件模板

```vue
<template>
  <div class="ti-[component-name]" :class="classes">
    <!-- Component content -->
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { [ComponentName]Props, [ComponentName]Emits } from '@expcat/tigercat-core/types';

const props = withDefaults(defineProps<[ComponentName]Props>(), {
  // 默认值
});

const emit = defineEmits<[ComponentName]Emits>();

// 计算属性
const classes = computed(() => ({
  'is-disabled': props.disabled,
  'is-loading': props.loading,
}));

// 方法
const handleClick = () => {
  emit('click');
};
</script>

<style scoped>
.ti-[component-name] {
  /* Scoped styles using Tailwind + Design Tokens */
}
</style>
```

## D.3 React 组件文件模板

```tsx
import { forwardRef, type Ref } from 'react';
import type { [ComponentName]Props } from '@expcat/tigercat-core/types';

export const [ComponentName] = forwardRef<
  HTMLDivElement,
  [ComponentName]Props
>(
  (
    {
      disabled = false,
      loading = false,
      ...props
    },
    ref: Ref<HTMLDivElement>
  ) => {
    const handleClick = () => {
      props.onClick?.();
    };

    return (
      <div
        ref={ref}
        className={`ti-[component-name] ${disabled ? 'is-disabled' : ''}`}
        onClick={handleClick}
      >
        {props.children}
      </div>
    );
  }
);

[ComponentName].displayName = '[ComponentName]';
```

## D.4 测试文件模板

```typescript
// [ComponentName].spec.ts / [ComponentName].test.ts

import { describe, it, expect, vi } from 'vitest'

describe('[ComponentName]', () => {
  it('should render correctly', () => {
    // render & assert
  })

  it('should handle click events', async () => {
    // test event handling
  })

  it('should support keyboard navigation', async () => {
    // test Tab, Enter, Escape etc.
  })

  it('should have proper ARIA attributes', () => {
    // test ARIA labels, roles, etc.
  })

  it('should be accessible with screen readers', () => {
    // accessibility testing
  })
})
```

## D.5 文档文件模板

```markdown
# [Component Name]

## 基础用法

### Vue 示例

[代码块]

### React 示例

[代码块]

## Props

| 属性名 | 类型 | 默认值 | 说明 |
| ------ | ---- | ------ | ---- |
| ...    | ...  | ...    | ...  |

## Events

| 事件名 | 参数 | 说明 |
| ------ | ---- | ---- |
| ...    | ...  | ...  |

## Slots

| 插槽名 | 说明 |
| ------ | ---- |
| ...    | ...  |

## 高级用法

[更复杂的用法示例]

## 常见问题

[FAQ]

## 无障碍

该组件符合 WCAG 2.1 AA 标准，支持：

- 完整的键盘导航
- 屏幕阅读器
- 高对比度模式
```

## D.6 国际化文件模板

```typescript
// i18n/locales/zh-CN.ts

export const ZH_CN_COMPONENT = {
  placeholder: '请选择',
  label: '标签',
  confirm: '确认',
  cancel: '取消',
  notFound: '未找到匹配项'
}

// i18n/locales/en-US.ts

export const EN_US_COMPONENT = {
  placeholder: 'Please select',
  label: 'Label',
  confirm: 'Confirm',
  cancel: 'Cancel',
  notFound: 'No matching options'
}
```

---

**文档版本**: v1.0
**最后更新**: 2025-03-09
