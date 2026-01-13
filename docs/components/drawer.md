# Drawer 抽屉

从页面边缘滑出的面板，用于展示详细信息或进行操作。

## 基本使用

### Vue 示例

```vue
<template>
  <div>
    <Button @click="visible = true">打开抽屉</Button>
    <Drawer v-model:visible="visible" title="抽屉标题">
      <p>这是抽屉内容</p>
    </Drawer>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Drawer, Button } from '@tigercat/vue';

const visible = ref(false);
</script>
```

### React 示例

````tsx
import React, { useState } from "react";
import { Drawer, Button } from "@tigercat/react";

function App() {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <Button onClick={() => setVisible(true)}>打开抽屉</Button>
      <Drawer
        visible={visible}
        title="抽屉标题"
        onClose={() => setVisible(false)}
      >
        <p>这是抽屉内容</p>
      </Drawer>
    </div>
  );
}

## i18n / Locale

`Drawer` 支持通过 `locale` 覆盖常用文案（例如关闭按钮的 aria-label）。

### Vue 示例

```vue
<Drawer
  v-model:visible="visible"
  title="抽屉标题"
  :locale="{ drawer: { closeAriaLabel: 'Close drawer' } }"
/>
````

### React 示例

```tsx
<Drawer
  visible={visible}
  title="抽屉标题"
  locale={{ drawer: { closeAriaLabel: 'Close drawer' } }}
  onClose={() => setVisible(false)}
/>
```

````

## 不同位置

通过 `placement` 属性设置抽屉从不同方向弹出。

### Vue 示例

```vue
<template>
  <div>
    <Space>
      <Button @click="showDrawer('left')">左侧</Button>
      <Button @click="showDrawer('right')">右侧</Button>
      <Button @click="showDrawer('top')">顶部</Button>
      <Button @click="showDrawer('bottom')">底部</Button>
    </Space>

    <Drawer
      v-model:visible="visible"
      :placement="placement"
      :title="`${placement} 抽屉`"
    >
      <p>从 {{ placement }} 弹出的抽屉</p>
    </Drawer>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Drawer, Button, Space } from "@tigercat/vue";
import type { DrawerPlacement } from "@tigercat/core";

const visible = ref(false);
const placement = ref<DrawerPlacement>("right");

const showDrawer = (pos: DrawerPlacement) => {
  placement.value = pos;
  visible.value = true;
};
</script>
````

### React 示例

```tsx
import React, { useState } from 'react';
import { Drawer, Button, Space } from '@tigercat/react';
import type { DrawerPlacement } from '@tigercat/core';

function App() {
  const [visible, setVisible] = useState(false);
  const [placement, setPlacement] = useState<DrawerPlacement>('right');

  const showDrawer = (pos: DrawerPlacement) => {
    setPlacement(pos);
    setVisible(true);
  };

  return (
    <div>
      <Space>
        <Button onClick={() => showDrawer('left')}>左侧</Button>
        <Button onClick={() => showDrawer('right')}>右侧</Button>
        <Button onClick={() => showDrawer('top')}>顶部</Button>
        <Button onClick={() => showDrawer('bottom')}>底部</Button>
      </Space>

      <Drawer
        visible={visible}
        placement={placement}
        title={`${placement} 抽屉`}
        onClose={() => setVisible(false)}>
        <p>从 {placement} 弹出的抽屉</p>
      </Drawer>
    </div>
  );
}
```

## 不同尺寸

通过 `size` 属性设置抽屉的大小。

### Vue 示例

```vue
<template>
  <div>
    <Space>
      <Button @click="showDrawer('sm')">Small</Button>
      <Button @click="showDrawer('md')">Medium</Button>
      <Button @click="showDrawer('lg')">Large</Button>
      <Button @click="showDrawer('xl')">Extra Large</Button>
      <Button @click="showDrawer('full')">Full</Button>
    </Space>

    <Drawer v-model:visible="visible" :size="size" title="不同尺寸的抽屉">
      <p>尺寸: {{ size }}</p>
    </Drawer>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Drawer, Button, Space } from '@tigercat/vue';
import type { DrawerSize } from '@tigercat/core';

const visible = ref(false);
const size = ref<DrawerSize>('md');

const showDrawer = (s: DrawerSize) => {
  size.value = s;
  visible.value = true;
};
</script>
```

### React 示例

```tsx
import React, { useState } from 'react';
import { Drawer, Button, Space } from '@tigercat/react';
import type { DrawerSize } from '@tigercat/core';

function App() {
  const [visible, setVisible] = useState(false);
  const [size, setSize] = useState<DrawerSize>('md');

  const showDrawer = (s: DrawerSize) => {
    setSize(s);
    setVisible(true);
  };

  return (
    <div>
      <Space>
        <Button onClick={() => showDrawer('sm')}>Small</Button>
        <Button onClick={() => showDrawer('md')}>Medium</Button>
        <Button onClick={() => showDrawer('lg')}>Large</Button>
        <Button onClick={() => showDrawer('xl')}>Extra Large</Button>
        <Button onClick={() => showDrawer('full')}>Full</Button>
      </Space>

      <Drawer
        visible={visible}
        size={size}
        title="不同尺寸的抽屉"
        onClose={() => setVisible(false)}>
        <p>尺寸: {size}</p>
      </Drawer>
    </div>
  );
}
```

## 自定义头部和底部

### Vue 示例

```vue
<template>
  <div>
    <Button @click="visible = true">打开抽屉</Button>
    <Drawer v-model:visible="visible">
      <template #header>
        <div style="display: flex; align-items: center; gap: 8px;">
          <Icon name="settings" />
          <span>自定义头部</span>
        </div>
      </template>

      <p>这是抽屉内容</p>

      <template #footer>
        <Space>
          <Button @click="visible = false">取消</Button>
          <Button variant="primary" @click="handleSubmit">确定</Button>
        </Space>
      </template>
    </Drawer>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Drawer, Button, Space, Icon } from '@tigercat/vue';

const visible = ref(false);

const handleSubmit = () => {
  console.log('提交');
  visible.value = false;
};
</script>
```

### React 示例

```tsx
import React, { useState } from 'react';
import { Drawer, Button, Space, Icon } from '@tigercat/react';

function App() {
  const [visible, setVisible] = useState(false);

  const handleSubmit = () => {
    console.log('提交');
    setVisible(false);
  };

  return (
    <div>
      <Button onClick={() => setVisible(true)}>打开抽屉</Button>
      <Drawer
        visible={visible}
        header={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Icon name="settings" />
            <span>自定义头部</span>
          </div>
        }
        footer={
          <Space>
            <Button onClick={() => setVisible(false)}>取消</Button>
            <Button variant="primary" onClick={handleSubmit}>
              确定
            </Button>
          </Space>
        }
        onClose={() => setVisible(false)}>
        <p>这是抽屉内容</p>
      </Drawer>
    </div>
  );
}
```

## 无蒙层

设置 `mask={false}` 可以不显示遮罩层。

### Vue 示例

```vue
<template>
  <div>
    <Button @click="visible = true">打开无蒙层抽屉</Button>
    <Drawer v-model:visible="visible" :mask="false" title="无蒙层抽屉">
      <p>这个抽屉没有蒙层</p>
    </Drawer>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Drawer, Button } from '@tigercat/vue';

const visible = ref(false);
</script>
```

### React 示例

```tsx
import React, { useState } from 'react';
import { Drawer, Button } from '@tigercat/react';

function App() {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <Button onClick={() => setVisible(true)}>打开无蒙层抽屉</Button>
      <Drawer
        visible={visible}
        mask={false}
        title="无蒙层抽屉"
        onClose={() => setVisible(false)}>
        <p>这个抽屉没有蒙层</p>
      </Drawer>
    </div>
  );
}
```

## 点击蒙层不关闭

设置 `maskClosable={false}` 可以禁止点击蒙层关闭抽屉。

### Vue 示例

```vue
<template>
  <div>
    <Button @click="visible = true">打开抽屉</Button>
    <Drawer
      v-model:visible="visible"
      :mask-closable="false"
      title="点击蒙层不关闭">
      <p>点击蒙层或按 ESC 键无法关闭，只能点击关闭按钮</p>
    </Drawer>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Drawer, Button } from '@tigercat/vue';

const visible = ref(false);
</script>
```

### React 示例

```tsx
import React, { useState } from 'react';
import { Drawer, Button } from '@tigercat/react';

function App() {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <Button onClick={() => setVisible(true)}>打开抽屉</Button>
      <Drawer
        visible={visible}
        maskClosable={false}
        title="点击蒙层不关闭"
        onClose={() => setVisible(false)}>
        <p>点击蒙层或按 ESC 键无法关闭，只能点击关闭按钮</p>
      </Drawer>
    </div>
  );
}
```

## API

### Props

| 属性           | 说明                                         | 类型                                        | 默认值           |
| -------------- | -------------------------------------------- | ------------------------------------------- | ---------------- |
| visible        | 抽屉是否可见 (Vue: v-model:visible)          | `boolean`                                   | `false`          |
| placement      | 抽屉位置                                     | `'left' \| 'right' \| 'top' \| 'bottom'`    | `'right'`        |
| size           | 抽屉尺寸                                     | `'sm' \| 'md' \| 'lg' \| 'xl' \| 'full'`    | `'md'`           |
| title          | 抽屉标题                                     | `string`                                    | -                |
| closable       | 是否显示关闭按钮                             | `boolean`                                   | `true`           |
| mask           | 是否显示蒙层                                 | `boolean`                                   | `true`           |
| maskClosable   | 点击蒙层是否关闭抽屉                         | `boolean`                                   | `true`           |
| zIndex         | 抽屉的 z-index                               | `number`                                    | `1000`           |
| className      | 抽屉容器的自定义类名                         | `string`                                    | -                |
| bodyClassName  | 抽屉内容区域的自定义类名                     | `string`                                    | -                |
| destroyOnClose | 关闭时销毁内容                               | `boolean`                                   | `false`          |
| closeAriaLabel | 关闭按钮的 aria-label                        | `string`                                    | `'Close drawer'` |
| style          | 抽屉面板的自定义内联样式（Vue/React 都支持） | `CSSProperties` / `Record<string, unknown>` | -                |

### Events (Vue)

| 事件名         | 说明               | 回调参数             |
| -------------- | ------------------ | -------------------- |
| update:visible | visible 改变时触发 | `(visible: boolean)` |
| close          | 关闭抽屉时触发     | `()`                 |
| after-enter    | 进入动画完成后触发 | `()`                 |
| after-leave    | 离开动画完成后触发 | `()`                 |

### Events (React)

| 属性         | 说明                 | 类型         |
| ------------ | -------------------- | ------------ |
| onClose      | 关闭抽屉时的回调     | `() => void` |
| onAfterEnter | 进入动画完成后的回调 | `() => void` |
| onAfterLeave | 离开动画完成后的回调 | `() => void` |

### Slots (Vue)

| 插槽名  | 说明       |
| ------- | ---------- |
| default | 抽屉内容   |
| header  | 自定义头部 |
| footer  | 自定义底部 |

### React Props

| 属性     | 说明           | 类型              |
| -------- | -------------- | ----------------- |
| header   | 自定义头部内容 | `React.ReactNode` |
| children | 抽屉内容       | `React.ReactNode` |
| footer   | 自定义底部内容 | `React.ReactNode` |

## 尺寸说明

- `sm`: 小尺寸（左右：256px，上下：192px）
- `md`: 中等尺寸（左右：384px，上下：256px）
- `lg`: 大尺寸（左右：512px，上下：384px）
- `xl`: 超大尺寸（左右：768px，上下：512px）
- `full`: 全屏

## 主题定制

Drawer 组件使用 Tigercat 的主题系统，支持通过 CSS 变量自定义颜色。关闭按钮的聚焦环使用主色调。

```css
:root {
  --tiger-drawer-mask: rgba(0, 0, 0, 0.5);
  --tiger-primary: #2563eb;
  --tiger-primary-hover: #1d4ed8;
  --tiger-surface: #ffffff;
  --tiger-surface-muted: #f9fafb;
  --tiger-border: #e5e7eb;
  --tiger-text: #111827;
  --tiger-text-muted: #6b7280;
}
```

## 可访问性

- 使用 `role="dialog"` 和 `aria-modal="true"` 属性
- 支持 ESC 键关闭
- 关闭按钮包含 `aria-label`
- 如果设置了 `title/header`，会自动添加 `aria-labelledby` 并指向实际标题元素（也可通过传入 `aria-labelledby` 覆盖）

## 注意事项

1. Drawer 组件使用 Portal/Teleport 渲染到 `document.body`
2. 按 ESC 键可以关闭抽屉
3. 抽屉的动画时长为 300ms（class 过渡）
4. 当 `destroyOnClose={false}` 时：首次打开后，关闭会将抽屉设为 `hidden` 但保持内容挂载；当 `destroyOnClose={true}` 时：关闭会卸载内容
5. 多个抽屉可以通过 `zIndex` 属性控制层级关系
