# Message 消息提示

全局展示操作反馈信息，支持多种状态、自动关闭、队列管理等功能。

## 何时使用

- 可提供成功、警告、失败和信息等反馈信息
- 顶部居中显示并自动消失，是一种不打断用户操作的轻量级提示方式
- 适用于操作反馈、状态提示等场景

## 基本用法

### Vue 3

```vue
<script setup>
import { message } from "@tigercat/vue";

const showMessage = () => {
  message.info("这是一条普通消息");
};
</script>

<template>
  <button @click="showMessage">显示消息</button>
</template>
```

### React

```tsx
import { message } from "@tigercat/react";

function App() {
  const showMessage = () => {
    message.info("这是一条普通消息");
  };

  return <button onClick={showMessage}>显示消息</button>;
}
```

## 不同类型

Message 组件支持 5 种不同的类型：

- `info` - 信息提示
- `success` - 成功提示
- `warning` - 警告提示
- `error` - 错误提示
- `loading` - 加载提示

### Vue 3

```vue
<script setup>
import { message } from "@tigercat/vue";

const showInfo = () => {
  message.info("这是一条信息提示");
};

const showSuccess = () => {
  message.success("操作成功！");
};

const showWarning = () => {
  message.warning("请注意相关事项");
};

const showError = () => {
  message.error("操作失败，请重试");
};

const showLoading = () => {
  const close = message.loading("加载中...");
  // 3秒后关闭
  setTimeout(close, 3000);
};
</script>

<template>
  <div class="space-x-2">
    <button @click="showInfo">信息</button>
    <button @click="showSuccess">成功</button>
    <button @click="showWarning">警告</button>
    <button @click="showError">错误</button>
    <button @click="showLoading">加载</button>
  </div>
</template>
```

### React

```tsx
import { message } from "@tigercat/react";

function App() {
  const showInfo = () => {
    message.info("这是一条信息提示");
  };

  const showSuccess = () => {
    message.success("操作成功！");
  };

  const showWarning = () => {
    message.warning("请注意相关事项");
  };

  const showError = () => {
    message.error("操作失败，请重试");
  };

  const showLoading = () => {
    const close = message.loading("加载中...");
    // 3秒后关闭
    setTimeout(close, 3000);
  };

  return (
    <div className="space-x-2">
      <button onClick={showInfo}>信息</button>
      <button onClick={showSuccess}>成功</button>
      <button onClick={showWarning}>警告</button>
      <button onClick={showError}>错误</button>
      <button onClick={showLoading}>加载</button>
    </div>
  );
}
```

## 自定义持续时间

通过配置 `duration` 属性可以自定义消息的显示时间（单位：毫秒）。设置为 `0` 时消息不会自动关闭。

### Vue 3

```vue
<script setup>
import { message } from "@tigercat/vue";

const showShortMessage = () => {
  // 1秒后自动关闭
  message.info({
    content: "这条消息1秒后关闭",
    duration: 1000,
  });
};

const showLongMessage = () => {
  // 5秒后自动关闭
  message.success({
    content: "这条消息5秒后关闭",
    duration: 5000,
  });
};

const showPersistentMessage = () => {
  // 不会自动关闭
  message.warning({
    content: "这条消息需要手动关闭",
    duration: 0,
    closable: true,
  });
};
</script>

<template>
  <div class="space-x-2">
    <button @click="showShortMessage">短时间</button>
    <button @click="showLongMessage">长时间</button>
    <button @click="showPersistentMessage">不自动关闭</button>
  </div>
</template>
```

### React

```tsx
import { message } from "@tigercat/react";

function App() {
  const showShortMessage = () => {
    // 1秒后自动关闭
    message.info({
      content: "这条消息1秒后关闭",
      duration: 1000,
    });
  };

  const showLongMessage = () => {
    // 5秒后自动关闭
    message.success({
      content: "这条消息5秒后关闭",
      duration: 5000,
    });
  };

  const showPersistentMessage = () => {
    // 不会自动关闭
    message.warning({
      content: "这条消息需要手动关闭",
      duration: 0,
      closable: true,
    });
  };

  return (
    <div className="space-x-2">
      <button onClick={showShortMessage}>短时间</button>
      <button onClick={showLongMessage}>长时间</button>
      <button onClick={showPersistentMessage}>不自动关闭</button>
    </div>
  );
}
```

## 手动关闭

通过设置 `closable` 为 `true` 可以显示关闭按钮，允许用户手动关闭消息。

### Vue 3

```vue
<script setup>
import { message } from "@tigercat/vue";

const showClosableMessage = () => {
  message.info({
    content: "这条消息可以手动关闭",
    closable: true,
    duration: 0, // 不自动关闭
  });
};
</script>

<template>
  <button @click="showClosableMessage">显示可关闭消息</button>
</template>
```

### React

```tsx
import { message } from "@tigercat/react";

function App() {
  const showClosableMessage = () => {
    message.info({
      content: "这条消息可以手动关闭",
      closable: true,
      duration: 0, // 不自动关闭
    });
  };

  return <button onClick={showClosableMessage}>显示可关闭消息</button>;
}
```

## 手动控制关闭

调用 message 方法后会返回一个关闭函数，可以手动控制消息的关闭。

### Vue 3

```vue
<script setup>
import { message } from '@tigercat/vue'
import { ref } from 'vue'

const closeMessage = ref<(() => void) | null>(null)

const showMessage = () => {
  closeMessage.value = message.loading('正在处理请求...')
}

const closeManually = () => {
  if (closeMessage.value) {
    closeMessage.value()
    closeMessage.value = null
  }
}

const simulateRequest = () => {
  const close = message.loading('正在处理请求...')

  // 模拟异步请求
  setTimeout(() => {
    close() // 关闭加载消息
    message.success('请求成功！')
  }, 2000)
}
</script>

<template>
  <div class="space-x-2">
    <button @click="showMessage">显示消息</button>
    <button @click="closeManually">手动关闭</button>
    <button @click="simulateRequest">模拟请求</button>
  </div>
</template>
```

### React

```tsx
import { message } from "@tigercat/react";
import { useRef } from "react";

function App() {
  const closeMessageRef = useRef<(() => void) | null>(null);

  const showMessage = () => {
    closeMessageRef.current = message.loading("正在处理请求...");
  };

  const closeManually = () => {
    if (closeMessageRef.current) {
      closeMessageRef.current();
      closeMessageRef.current = null;
    }
  };

  const simulateRequest = () => {
    const close = message.loading("正在处理请求...");

    // 模拟异步请求
    setTimeout(() => {
      close(); // 关闭加载消息
      message.success("请求成功！");
    }, 2000);
  };

  return (
    <div className="space-x-2">
      <button onClick={showMessage}>显示消息</button>
      <button onClick={closeManually}>手动关闭</button>
      <button onClick={simulateRequest}>模拟请求</button>
    </div>
  );
}
```

## 回调函数

可以通过 `onClose` 回调函数在消息关闭时执行特定操作。

### Vue 3

```vue
<script setup>
import { message } from "@tigercat/vue";

const showMessageWithCallback = () => {
  message.success({
    content: "操作成功！",
    onClose: () => {
      console.log("消息已关闭");
      // 执行其他操作
    },
  });
};
</script>

<template>
  <button @click="showMessageWithCallback">显示消息（带回调）</button>
</template>
```

### React

```tsx
import { message } from "@tigercat/react";

function App() {
  const showMessageWithCallback = () => {
    message.success({
      content: "操作成功！",
      onClose: () => {
        console.log("消息已关闭");
        // 执行其他操作
      },
    });
  };

  return <button onClick={showMessageWithCallback}>显示消息（带回调）</button>;
}
```

## 清空所有消息

可以使用 `message.clear()` 方法清空所有正在显示的消息。

### Vue 3

```vue
<script setup>
import { message } from "@tigercat/vue";

const showMultipleMessages = () => {
  message.info("消息 1");
  message.success("消息 2");
  message.warning("消息 3");
};

const clearAll = () => {
  message.clear();
};
</script>

<template>
  <div class="space-x-2">
    <button @click="showMultipleMessages">显示多条消息</button>
    <button @click="clearAll">清空所有</button>
  </div>
</template>
```

### React

```tsx
import { message } from "@tigercat/react";

function App() {
  const showMultipleMessages = () => {
    message.info("消息 1");
    message.success("消息 2");
    message.warning("消息 3");
  };

  const clearAll = () => {
    message.clear();
  };

  return (
    <div className="space-x-2">
      <button onClick={showMultipleMessages}>显示多条消息</button>
      <button onClick={clearAll}>清空所有</button>
    </div>
  );
}
```

## 完整示例

### Vue 3

```vue
<script setup>
import { message } from "@tigercat/vue";

const handleFormSubmit = async () => {
  // 显示加载消息
  const close = message.loading("正在提交表单...");

  try {
    // 模拟异步操作
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // 关闭加载消息
    close();

    // 显示成功消息
    message.success({
      content: "表单提交成功！",
      duration: 3000,
      onClose: () => {
        console.log("成功消息已关闭");
      },
    });
  } catch (error) {
    // 关闭加载消息
    close();

    // 显示错误消息
    message.error({
      content: "表单提交失败，请重试",
      closable: true,
      duration: 5000,
    });
  }
};

const showDifferentTypes = () => {
  message.info("这是一条信息");
  setTimeout(() => message.success("操作成功"), 500);
  setTimeout(() => message.warning("请注意"), 1000);
  setTimeout(() => message.error("发生错误"), 1500);
};
</script>

<template>
  <div class="space-y-4">
    <h2 class="text-xl font-bold">Message 组件示例</h2>

    <div class="space-x-2">
      <button @click="message.info('信息提示')">信息</button>
      <button @click="message.success('成功提示')">成功</button>
      <button @click="message.warning('警告提示')">警告</button>
      <button @click="message.error('错误提示')">错误</button>
      <button @click="message.loading('加载中...')">加载</button>
    </div>

    <div class="space-x-2">
      <button @click="handleFormSubmit">提交表单（完整流程）</button>
      <button @click="showDifferentTypes">显示多种类型</button>
      <button @click="message.clear()">清空所有</button>
    </div>
  </div>
</template>
```

### React

```tsx
import { message } from "@tigercat/react";

function App() {
  const handleFormSubmit = async () => {
    // 显示加载消息
    const close = message.loading("正在提交表单...");

    try {
      // 模拟异步操作
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // 关闭加载消息
      close();

      // 显示成功消息
      message.success({
        content: "表单提交成功！",
        duration: 3000,
        onClose: () => {
          console.log("成功消息已关闭");
        },
      });
    } catch (error) {
      // 关闭加载消息
      close();

      // 显示错误消息
      message.error({
        content: "表单提交失败，请重试",
        closable: true,
        duration: 5000,
      });
    }
  };

  const showDifferentTypes = () => {
    message.info("这是一条信息");
    setTimeout(() => message.success("操作成功"), 500);
    setTimeout(() => message.warning("请注意"), 1000);
    setTimeout(() => message.error("发生错误"), 1500);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Message 组件示例</h2>

      <div className="space-x-2">
        <button onClick={() => message.info("信息提示")}>信息</button>
        <button onClick={() => message.success("成功提示")}>成功</button>
        <button onClick={() => message.warning("警告提示")}>警告</button>
        <button onClick={() => message.error("错误提示")}>错误</button>
        <button onClick={() => message.loading("加载中...")}>加载</button>
      </div>

      <div className="space-x-2">
        <button onClick={handleFormSubmit}>提交表单（完整流程）</button>
        <button onClick={showDifferentTypes}>显示多种类型</button>
        <button onClick={() => message.clear()}>清空所有</button>
      </div>
    </div>
  );
}
```

## API

### message 方法

| 方法            | 说明         | 参数类型                  | 返回值                  |
| --------------- | ------------ | ------------------------- | ----------------------- |
| message.info    | 显示信息提示 | `string \| MessageConfig` | `() => void` (关闭函数) |
| message.success | 显示成功提示 | `string \| MessageConfig` | `() => void` (关闭函数) |
| message.warning | 显示警告提示 | `string \| MessageConfig` | `() => void` (关闭函数) |
| message.error   | 显示错误提示 | `string \| MessageConfig` | `() => void` (关闭函数) |
| message.loading | 显示加载提示 | `string \| MessageConfig` | `() => void` (关闭函数) |
| message.clear   | 清空所有消息 | -                         | `void`                  |

### MessageConfig

| 参数      | 说明                                        | 类型                                                       | 默认值   |
| --------- | ------------------------------------------- | ---------------------------------------------------------- | -------- |
| content   | 消息内容                                    | `string`                                                   | -        |
| type      | 消息类型                                    | `'info' \| 'success' \| 'warning' \| 'error' \| 'loading'` | `'info'` |
| duration  | 自动关闭的延时（毫秒），设为 0 时不自动关闭 | `number`                                                   | `3000`   |
| closable  | 是否显示关闭按钮                            | `boolean`                                                  | `false`  |
| onClose   | 关闭时的回调函数                            | `() => void`                                               | -        |
| icon      | 自定义图标（SVG path）                      | `string`                                                   | -        |
| className | 自定义 CSS 类名                             | `string`                                                   | -        |

## 样式定制

Message 的颜色方案默认使用 CSS 变量（带 fallback），以便在不同主题下保持一致：

### 主题变量

- `--tiger-message-info-bg / --tiger-message-info-border / --tiger-message-info-text / --tiger-message-info-icon`
- `--tiger-message-success-bg / --tiger-message-success-border / --tiger-message-success-text / --tiger-message-success-icon`
- `--tiger-message-warning-bg / --tiger-message-warning-border / --tiger-message-warning-text / --tiger-message-warning-icon`
- `--tiger-message-error-bg / --tiger-message-error-border / --tiger-message-error-text / --tiger-message-error-icon`
- `--tiger-message-loading-bg / --tiger-message-loading-border / --tiger-message-loading-text / --tiger-message-loading-icon`

其中 loading 默认会回退到基础主题变量（如 `--tiger-surface-muted` / `--tiger-border` / `--tiger-text` / `--tiger-text-muted`）。

### 自定义样式

可以通过 `className` 属性添加自定义样式：

```javascript
message.success({
  content: "自定义样式",
  className: "my-custom-message",
});
```

## 可访问性

Message 组件遵循 WAI-ARIA 可访问性标准：

- `error` 类型使用 `role="alert"` + `aria-live="assertive"`
- 其它类型使用 `role="status"` + `aria-live="polite"`
- 消息项默认 `aria-atomic="true"`，并在 `loading` 时设置 `aria-busy="true"`
- 关闭按钮包含 `aria-label="Close message"` 属性
- 图标使用 SVG 格式，具有良好的可缩放性
- 支持键盘操作（关闭按钮可通过 Tab 键聚焦）

## 注意事项

1. Message 组件会自动创建容器并挂载到 `body` 元素中
2. 默认情况下，消息会在 3 秒后自动关闭
3. Loading 类型的消息默认不会自动关闭，需要手动关闭或设置 `duration`
4. 消息会按照调用顺序依次排列，形成队列
5. 使用 `closable` 属性时，建议同时设置 `duration: 0` 以允许用户控制关闭时机
6. 消息内容建议保持简洁，过长的文本可能会影响用户体验

## 与 Alert 的区别

| 特性     | Message            | Alert                |
| -------- | ------------------ | -------------------- |
| 使用场景 | 操作反馈、临时提示 | 页面级警告、重要信息 |
| 显示位置 | 顶部居中（全局）   | 页面内嵌             |
| 自动关闭 | 默认自动关闭       | 默认不自动关闭       |
| 调用方式 | 命令式（API 调用） | 声明式（组件）       |
| 交互方式 | 轻量级，不打断操作 | 需要用户关注         |

## TypeScript 支持

Message 组件提供完整的 TypeScript 类型定义：

```typescript
import { message, MessageConfig, MessageOptions } from "@tigercat/vue"; // 或 '@tigercat/react'

// 使用字符串
message.info("简单消息");

// 使用配置对象
const config: MessageConfig = {
  content: "详细配置",
  duration: 5000,
  closable: true,
  onClose: () => {
    console.log("已关闭");
  },
};
message.success(config);

// 获取关闭函数
const close: () => void = message.loading("加载中...");
```
