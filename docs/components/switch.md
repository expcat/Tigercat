# Switch 开关

用于在两个互斥的状态之间切换的开关组件，支持键盘操作和自定义尺寸。

## 基本用法

### Vue 3

```vue
<script setup>
import { ref } from 'vue'
import { Switch } from '@expcat/tigercat-vue'

const checked = ref(false)
</script>

<template>
  <Switch v-model:checked="checked" />
</template>
```

### React

```tsx
import { useState } from 'react'
import { Switch } from '@expcat/tigercat-react'

function App() {
  const [checked, setChecked] = useState(false)

  return <Switch checked={checked} onChange={setChecked} />
}
```

## 尺寸 (Sizes)

Switch 组件支持 3 种不同的尺寸：

- `sm` - 小尺寸
- `md` - 中等尺寸（默认）
- `lg` - 大尺寸

### Vue 3

```vue
<script setup>
import { ref } from 'vue'
import { Switch } from '@expcat/tigercat-vue'

const checked1 = ref(false)
const checked2 = ref(false)
const checked3 = ref(false)
</script>

<template>
  <div class="flex items-center gap-4">
    <Switch v-model:checked="checked1" size="sm" />
    <Switch v-model:checked="checked2" size="md" />
    <Switch v-model:checked="checked3" size="lg" />
  </div>
</template>
```

### React

```tsx
import { useState } from 'react'
import { Switch } from '@expcat/tigercat-react'

function App() {
  const [checked1, setChecked1] = useState(false)
  const [checked2, setChecked2] = useState(false)
  const [checked3, setChecked3] = useState(false)

  return (
    <div className="flex items-center gap-4">
      <Switch checked={checked1} onChange={setChecked1} size="sm" />
      <Switch checked={checked2} onChange={setChecked2} size="md" />
      <Switch checked={checked3} onChange={setChecked3} size="lg" />
    </div>
  )
}
```

## 禁用状态 (Disabled)

通过 `disabled` 属性禁用开关。

### Vue 3

```vue
<template>
  <div class="flex items-center gap-4">
    <Switch :checked="false" disabled />
    <Switch :checked="true" disabled />
  </div>
</template>
```

### React

```tsx
<div className="flex items-center gap-4">
  <Switch checked={false} disabled />
  <Switch checked={true} disabled />
</div>
```

## 带标签的开关

### Vue 3

```vue
<script setup>
import { ref } from 'vue'
import { Switch } from '@expcat/tigercat-vue'

const notifications = ref(true)
</script>

<template>
  <div class="flex items-center gap-3">
    <Switch v-model:checked="notifications" />
    <span class="text-gray-700">启用通知</span>
  </div>
</template>
```

### React

```tsx
import { useState } from 'react'
import { Switch } from '@expcat/tigercat-react'

function App() {
  const [notifications, setNotifications] = useState(true)

  return (
    <div className="flex items-center gap-3">
      <Switch checked={notifications} onChange={setNotifications} />
      <span className="text-gray-700">启用通知</span>
    </div>
  )
}
```

## 键盘操作

Switch 组件支持键盘操作，提供良好的无障碍访问体验：

- **Space** - 切换开关状态
- **Enter** - 切换开关状态
- **Tab** - 焦点导航到下一个元素
- **Shift + Tab** - 焦点导航到上一个元素

### Vue 3

```vue
<template>
  <div class="flex flex-col gap-4">
    <div class="flex items-center gap-3">
      <Switch v-model:checked="option1" />
      <span>选项 1</span>
    </div>
    <div class="flex items-center gap-3">
      <Switch v-model:checked="option2" />
      <span>选项 2</span>
    </div>
    <div class="flex items-center gap-3">
      <Switch v-model:checked="option3" />
      <span>选项 3</span>
    </div>
  </div>
</template>
```

### React

```tsx
<div className="flex flex-col gap-4">
  <div className="flex items-center gap-3">
    <Switch checked={option1} onChange={setOption1} />
    <span>选项 1</span>
  </div>
  <div className="flex items-center gap-3">
    <Switch checked={option2} onChange={setOption2} />
    <span>选项 2</span>
  </div>
  <div className="flex items-center gap-3">
    <Switch checked={option3} onChange={setOption3} />
    <span>选项 3</span>
  </div>
</div>
```

## 事件处理

### Vue 3

Switch 组件提供两个事件：

- `update:checked` - v-model 绑定的更新事件
- `change` - 状态改变时触发

```vue
<script setup>
import { ref } from 'vue';
import { Switch } from '@expcat/tigercat-vue';

const checked = ref(false);

const handleChange = (newValue: boolean) => {
  console.log('Switch changed:', newValue);
};
</script>

<template>
  <Switch v-model:checked="checked" @change="handleChange" />
</template>
```

### React

```tsx
import { useState } from 'react'
import { Switch } from '@expcat/tigercat-react'

function App() {
  const [checked, setChecked] = useState(false)

  const handleChange = (newValue: boolean) => {
    console.log('Switch changed:', newValue)
    setChecked(newValue)
  }

  return <Switch checked={checked} onChange={handleChange} />
}
```

## API

### Props / 属性

| 属性     | 说明     | 类型         | 默认值  | 可选值                     |
| -------- | -------- | ------------ | ------- | -------------------------- |
| checked  | 是否选中 | `boolean`    | `false` | `true` \| `false`          |
| disabled | 是否禁用 | `boolean`    | `false` | `true` \| `false`          |
| size     | 开关尺寸 | `SwitchSize` | `'md'`  | `'sm'` \| `'md'` \| `'lg'` |

#### React 专属属性

| 属性       | 说明                 | 类型                         | 默认值 |
| ---------- | -------------------- | ---------------------------- | ------ |
| onChange   | 状态改变时的回调函数 | `(checked: boolean) => void` | -      |
| className  | 额外的 CSS 类名      | `string`                     | -      |
| aria-label | 无障碍标签           | `string`                     | -      |

### Events / 事件 (Vue)

| 事件名         | 说明                                 | 回调参数             |
| -------------- | ------------------------------------ | -------------------- |
| update:checked | checked 值更新时触发（用于 v-model） | `(checked: boolean)` |
| change         | 开关状态改变时触发                   | `(checked: boolean)` |

## 样式定制

Switch 组件使用 Tailwind CSS 构建，支持通过 CSS 变量进行主题配置。

### 主题颜色配置

Switch 组件的选中状态颜色使用与 Button 组件相同的主题变量；未选中轨道与滑块也支持主题变量覆盖：

```css
/* 默认主题 */
:root {
  --tiger-primary: #2563eb;
  --tiger-border: #e5e7eb; /* 未选中轨道 */
  --tiger-surface: #ffffff; /* 滑块 */
}

/* 自定义主题 */
.custom-theme {
  --tiger-primary: #10b981; /* 绿色开关 */
}
```

### 使用 JavaScript API

**Vue 3:**

```vue
<script setup>
import { Switch, setThemeColors } from '@expcat/tigercat-vue'

const switchTheme = () => {
  setThemeColors({
    primary: '#10b981'
  })
}
</script>

<template>
  <div>
    <button @click="switchTheme">切换为绿色主题</button>
    <Switch v-model:checked="checked" />
  </div>
</template>
```

**React:**

```tsx
import { Switch, setThemeColors } from '@expcat/tigercat-react'

function App() {
  const switchTheme = () => {
    setThemeColors({
      primary: '#10b981'
    })
  }

  return (
    <div>
      <button onClick={switchTheme}>切换为绿色主题</button>
      <Switch checked={checked} onChange={setChecked} />
    </div>
  )
}
```

查看完整的主题配置文档：[主题配置指南](../theme.md)

### React 额外样式

React 版本的 Switch 组件支持 `className` 属性，可以传入额外的 CSS 类：

```tsx
<Switch className="my-custom-class" checked={checked} onChange={setChecked} />
```

## 无障碍 (Accessibility)

Switch 组件遵循 ARIA 最佳实践：

- 使用正确的 `role="switch"` 语义角色
- 通过 `aria-checked` 属性表示当前状态
- 通过 `aria-disabled` 属性表示禁用状态
- 支持键盘操作（Space 和 Enter 键）
- 禁用状态下不可通过 Tab 键聚焦（tabindex=-1）
- 提供清晰的焦点指示器（focus:ring）
- React 版本支持 `aria-label` 属性用于屏幕阅读器

## TypeScript 支持

Switch 组件完全使用 TypeScript 编写，提供完整的类型定义：

```ts
import type { SwitchProps, SwitchSize } from '@expcat/tigercat-core'
import type { VueSwitchProps } from '@expcat/tigercat-vue'
import type { SwitchProps as ReactSwitchProps } from '@expcat/tigercat-react'
```

## 示例

### 设置面板

#### Vue 3

```vue
<script setup>
import { ref } from 'vue'
import { Switch } from '@expcat/tigercat-vue'

const settings = ref({
  notifications: true,
  emailAlerts: false,
  darkMode: false
})
</script>

<template>
  <div class="space-y-4 p-6 bg-white rounded-lg shadow">
    <h3 class="text-lg font-semibold mb-4">设置</h3>

    <div class="flex items-center justify-between">
      <div>
        <div class="font-medium">通知</div>
        <div class="text-sm text-gray-500">接收应用通知</div>
      </div>
      <Switch v-model:checked="settings.notifications" />
    </div>

    <div class="flex items-center justify-between">
      <div>
        <div class="font-medium">邮件提醒</div>
        <div class="text-sm text-gray-500">接收邮件通知</div>
      </div>
      <Switch v-model:checked="settings.emailAlerts" />
    </div>

    <div class="flex items-center justify-between">
      <div>
        <div class="font-medium">深色模式</div>
        <div class="text-sm text-gray-500">使用深色主题</div>
      </div>
      <Switch v-model:checked="settings.darkMode" />
    </div>
  </div>
</template>
```

#### React

```tsx
import { useState } from 'react'
import { Switch } from '@expcat/tigercat-react'

function SettingsPanel() {
  const [settings, setSettings] = useState({
    notifications: true,
    emailAlerts: false,
    darkMode: false
  })

  const updateSetting = (key: string) => (value: boolean) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="space-y-4 p-6 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">设置</h3>

      <div className="flex items-center justify-between">
        <div>
          <div className="font-medium">通知</div>
          <div className="text-sm text-gray-500">接收应用通知</div>
        </div>
        <Switch checked={settings.notifications} onChange={updateSetting('notifications')} />
      </div>

      <div className="flex items-center justify-between">
        <div>
          <div className="font-medium">邮件提醒</div>
          <div className="text-sm text-gray-500">接收邮件通知</div>
        </div>
        <Switch checked={settings.emailAlerts} onChange={updateSetting('emailAlerts')} />
      </div>

      <div className="flex items-center justify-between">
        <div>
          <div className="font-medium">深色模式</div>
          <div className="text-sm text-gray-500">使用深色主题</div>
        </div>
        <Switch checked={settings.darkMode} onChange={updateSetting('darkMode')} />
      </div>
    </div>
  )
}
```

### 表单集成

#### Vue 3

```vue
<script setup>
import { ref } from 'vue'
import { Switch, Button } from '@expcat/tigercat-vue'

const formData = ref({
  username: '',
  agreeTerms: false,
  newsletter: false
})

const handleSubmit = () => {
  if (!formData.value.agreeTerms) {
    alert('请同意服务条款')
    return
  }
  console.log('提交表单:', formData.value)
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="space-y-4">
    <div>
      <label class="block mb-2">用户名</label>
      <input v-model="formData.username" type="text" class="border rounded px-3 py-2 w-full" />
    </div>

    <div class="flex items-center gap-3">
      <Switch v-model:checked="formData.agreeTerms" />
      <span>我同意服务条款</span>
    </div>

    <div class="flex items-center gap-3">
      <Switch v-model:checked="formData.newsletter" />
      <span>订阅新闻通讯</span>
    </div>

    <Button type="submit" variant="primary">提交</Button>
  </form>
</template>
```

#### React

```tsx
import { useState } from 'react'
import { Switch, Button } from '@expcat/tigercat-react'

function FormExample() {
  const [formData, setFormData] = useState({
    username: '',
    agreeTerms: false,
    newsletter: false
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.agreeTerms) {
      alert('请同意服务条款')
      return
    }
    console.log('提交表单:', formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block mb-2">用户名</label>
        <input
          value={formData.username}
          onChange={(e) => setFormData((prev) => ({ ...prev, username: e.target.value }))}
          type="text"
          className="border rounded px-3 py-2 w-full"
        />
      </div>

      <div className="flex items-center gap-3">
        <Switch
          checked={formData.agreeTerms}
          onChange={(checked) => setFormData((prev) => ({ ...prev, agreeTerms: checked }))}
        />
        <span>我同意服务条款</span>
      </div>

      <div className="flex items-center gap-3">
        <Switch
          checked={formData.newsletter}
          onChange={(checked) => setFormData((prev) => ({ ...prev, newsletter: checked }))}
        />
        <span>订阅新闻通讯</span>
      </div>

      <Button type="submit" variant="primary">
        提交
      </Button>
    </form>
  )
}
```
