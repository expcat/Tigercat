# Notification 通知

全局显示通知提示信息，支持多种展示位置、关闭与定时消失，适用于较为复杂的通知场景。

## 何时使用

- 需要显示系统级通知信息
- 需要较长时间停留的反馈信息，带有描述内容
- 需要在屏幕四个角落展示通知
- 适用于成功、警告、失败和信息等通知场景
- 与 Message 相比，Notification 更适合展示带标题和描述的复杂内容

## 基本用法

### Vue 3

```vue
<script setup>
import { notification } from '@expcat/tigercat-vue'

const showNotification = () => {
  notification.info('通知标题')
}
</script>

<template>
  <button @click="showNotification">显示通知</button>
</template>
```

### React

```tsx
import { notification } from '@expcat/tigercat-react'

function App() {
  const showNotification = () => {
    notification.info('通知标题')
  }

  return <button onClick={showNotification}>显示通知</button>
}
```

## 不同类型

Notification 组件支持 4 种不同的类型：

- `info` - 信息通知
- `success` - 成功通知
- `warning` - 警告通知
- `error` - 错误通知

### Vue 3

```vue
<script setup>
import { notification } from '@expcat/tigercat-vue'

const showInfo = () => {
  notification.info({
    title: '信息通知',
    description: '这是一条信息通知的详细描述内容'
  })
}

const showSuccess = () => {
  notification.success({
    title: '操作成功',
    description: '您的操作已经成功完成！'
  })
}

const showWarning = () => {
  notification.warning({
    title: '警告提示',
    description: '请注意相关事项，以避免潜在问题'
  })
}

const showError = () => {
  notification.error({
    title: '操作失败',
    description: '操作失败，请检查网络连接后重试'
  })
}
</script>

<template>
  <div class="space-x-2">
    <button @click="showInfo">信息</button>
    <button @click="showSuccess">成功</button>
    <button @click="showWarning">警告</button>
    <button @click="showError">错误</button>
  </div>
</template>
```

### React

```tsx
import { notification } from '@expcat/tigercat-react'

function App() {
  const showInfo = () => {
    notification.info({
      title: '信息通知',
      description: '这是一条信息通知的详细描述内容'
    })
  }

  const showSuccess = () => {
    notification.success({
      title: '操作成功',
      description: '您的操作已经成功完成！'
    })
  }

  const showWarning = () => {
    notification.warning({
      title: '警告提示',
      description: '请注意相关事项，以避免潜在问题'
    })
  }

  const showError = () => {
    notification.error({
      title: '操作失败',
      description: '操作失败，请检查网络连接后重试'
    })
  }

  return (
    <div className="space-x-2">
      <button onClick={showInfo}>信息</button>
      <button onClick={showSuccess}>成功</button>
      <button onClick={showWarning}>警告</button>
      <button onClick={showError}>错误</button>
    </div>
  )
}
```

## 不同位置

通知可以在屏幕的四个角落显示，通过 `position` 参数控制。

### Vue 3

```vue
<script setup>
import { notification } from '@expcat/tigercat-vue'

const showTopLeft = () => {
  notification.info({
    title: '左上角通知',
    description: '这是显示在左上角的通知',
    position: 'top-left'
  })
}

const showTopRight = () => {
  notification.success({
    title: '右上角通知',
    description: '这是显示在右上角的通知（默认位置）',
    position: 'top-right'
  })
}

const showBottomLeft = () => {
  notification.warning({
    title: '左下角通知',
    description: '这是显示在左下角的通知',
    position: 'bottom-left'
  })
}

const showBottomRight = () => {
  notification.error({
    title: '右下角通知',
    description: '这是显示在右下角的通知',
    position: 'bottom-right'
  })
}
</script>

<template>
  <div class="space-x-2">
    <button @click="showTopLeft">左上角</button>
    <button @click="showTopRight">右上角</button>
    <button @click="showBottomLeft">左下角</button>
    <button @click="showBottomRight">右下角</button>
  </div>
</template>
```

### React

```tsx
import { notification } from '@expcat/tigercat-react'

function App() {
  const showTopLeft = () => {
    notification.info({
      title: '左上角通知',
      description: '这是显示在左上角的通知',
      position: 'top-left'
    })
  }

  const showTopRight = () => {
    notification.success({
      title: '右上角通知',
      description: '这是显示在右上角的通知（默认位置）',
      position: 'top-right'
    })
  }

  const showBottomLeft = () => {
    notification.warning({
      title: '左下角通知',
      description: '这是显示在左下角的通知',
      position: 'bottom-left'
    })
  }

  const showBottomRight = () => {
    notification.error({
      title: '右下角通知',
      description: '这是显示在右下角的通知',
      position: 'bottom-right'
    })
  }

  return (
    <div className="space-x-2">
      <button onClick={showTopLeft}>左上角</button>
      <button onClick={showTopRight}>右上角</button>
      <button onClick={showBottomLeft}>左下角</button>
      <button onClick={showBottomRight}>右下角</button>
    </div>
  )
}
```

## 自定义持续时间

通过配置 `duration` 属性可以自定义通知的显示时间（单位：毫秒）。设置为 `0` 时通知不会自动关闭。

### Vue 3

```vue
<script setup>
import { notification } from '@expcat/tigercat-vue'

const showShortNotification = () => {
  // 2秒后自动关闭
  notification.info({
    title: '短时间通知',
    description: '这条通知2秒后关闭',
    duration: 2000
  })
}

const showLongNotification = () => {
  // 10秒后自动关闭
  notification.success({
    title: '长时间通知',
    description: '这条通知10秒后关闭',
    duration: 10000
  })
}

const showPersistentNotification = () => {
  // 不会自动关闭
  notification.warning({
    title: '持久通知',
    description: '这条通知需要手动关闭',
    duration: 0
  })
}
</script>

<template>
  <div class="space-x-2">
    <button @click="showShortNotification">短时间</button>
    <button @click="showLongNotification">长时间</button>
    <button @click="showPersistentNotification">不自动关闭</button>
  </div>
</template>
```

### React

```tsx
import { notification } from '@expcat/tigercat-react'

function App() {
  const showShortNotification = () => {
    // 2秒后自动关闭
    notification.info({
      title: '短时间通知',
      description: '这条通知2秒后关闭',
      duration: 2000
    })
  }

  const showLongNotification = () => {
    // 10秒后自动关闭
    notification.success({
      title: '长时间通知',
      description: '这条通知10秒后关闭',
      duration: 10000
    })
  }

  const showPersistentNotification = () => {
    // 不会自动关闭
    notification.warning({
      title: '持久通知',
      description: '这条通知需要手动关闭',
      duration: 0
    })
  }

  return (
    <div className="space-x-2">
      <button onClick={showShortNotification}>短时间</button>
      <button onClick={showLongNotification}>长时间</button>
      <button onClick={showPersistentNotification}>不自动关闭</button>
    </div>
  )
}
```

## 手动关闭

通知默认显示关闭按钮，可以通过设置 `closable` 为 `false` 来隐藏关闭按钮。

### Vue 3

```vue
<script setup>
import { notification } from '@expcat/tigercat-vue'

const showClosableNotification = () => {
  notification.info({
    title: '可关闭通知',
    description: '这条通知可以通过点击关闭按钮来关闭',
    closable: true, // 默认为 true
    duration: 0 // 不自动关闭
  })
}

const showNonClosableNotification = () => {
  notification.success({
    title: '不可手动关闭',
    description: '这条通知没有关闭按钮，5秒后自动消失',
    closable: false,
    duration: 5000
  })
}
</script>

<template>
  <div class="space-x-2">
    <button @click="showClosableNotification">可关闭</button>
    <button @click="showNonClosableNotification">不可关闭</button>
  </div>
</template>
```

### React

```tsx
import { notification } from '@expcat/tigercat-react'

function App() {
  const showClosableNotification = () => {
    notification.info({
      title: '可关闭通知',
      description: '这条通知可以通过点击关闭按钮来关闭',
      closable: true, // 默认为 true
      duration: 0 // 不自动关闭
    })
  }

  const showNonClosableNotification = () => {
    notification.success({
      title: '不可手动关闭',
      description: '这条通知没有关闭按钮，5秒后自动消失',
      closable: false,
      duration: 5000
    })
  }

  return (
    <div className="space-x-2">
      <button onClick={showClosableNotification}>可关闭</button>
      <button onClick={showNonClosableNotification}>不可关闭</button>
    </div>
  )
}
```

## 手动控制关闭

调用 notification 方法后会返回一个关闭函数，可以手动控制通知的关闭。

### Vue 3

```vue
<script setup>
import { notification } from '@expcat/tigercat-vue'
import { ref } from 'vue'

const closeNotification = ref(null)

const showNotification = () => {
  closeNotification.value = notification.info({
    title: '处理中',
    description: '正在处理您的请求...',
    duration: 0
  })
}

const closeManually = () => {
  if (closeNotification.value) {
    closeNotification.value()
    closeNotification.value = null
  }
}

const simulateRequest = () => {
  const close = notification.info({
    title: '请求处理',
    description: '正在处理您的请求...',
    duration: 0
  })

  // 模拟异步请求
  setTimeout(() => {
    close() // 关闭通知
    notification.success({
      title: '请求成功',
      description: '您的请求已成功处理！'
    })
  }, 3000)
}
</script>

<template>
  <div class="space-x-2">
    <button @click="showNotification">显示通知</button>
    <button @click="closeManually">手动关闭</button>
    <button @click="simulateRequest">模拟请求</button>
  </div>
</template>
```

### React

```tsx
import { notification } from '@expcat/tigercat-react'
import { useRef } from 'react'

function App() {
  const closeNotificationRef = useRef<(() => void) | null>(null)

  const showNotification = () => {
    closeNotificationRef.current = notification.info({
      title: '处理中',
      description: '正在处理您的请求...',
      duration: 0
    })
  }

  const closeManually = () => {
    if (closeNotificationRef.current) {
      closeNotificationRef.current()
      closeNotificationRef.current = null
    }
  }

  const simulateRequest = () => {
    const close = notification.info({
      title: '请求处理',
      description: '正在处理您的请求...',
      duration: 0
    })

    // 模拟异步请求
    setTimeout(() => {
      close() // 关闭通知
      notification.success({
        title: '请求成功',
        description: '您的请求已成功处理！'
      })
    }, 3000)
  }

  return (
    <div className="space-x-2">
      <button onClick={showNotification}>显示通知</button>
      <button onClick={closeManually}>手动关闭</button>
      <button onClick={simulateRequest}>模拟请求</button>
    </div>
  )
}
```

## 点击事件

可以通过 `onClick` 回调函数在通知被点击时执行特定操作。

### Vue 3

```vue
<script setup>
import { notification } from '@expcat/tigercat-vue'

const showClickableNotification = () => {
  notification.info({
    title: '可点击通知',
    description: '点击这条通知查看详情',
    onClick: () => {
      console.log('通知被点击了')
      alert('查看详情功能')
    }
  })
}
</script>

<template>
  <button @click="showClickableNotification">显示可点击通知</button>
</template>
```

### React

```tsx
import { notification } from '@expcat/tigercat-react'

function App() {
  const showClickableNotification = () => {
    notification.info({
      title: '可点击通知',
      description: '点击这条通知查看详情',
      onClick: () => {
        console.log('通知被点击了')
        alert('查看详情功能')
      }
    })
  }

  return <button onClick={showClickableNotification}>显示可点击通知</button>
}
```

## 回调函数

可以通过 `onClose` 回调函数在通知关闭时执行特定操作。

### Vue 3

```vue
<script setup>
import { notification } from '@expcat/tigercat-vue'

const showNotificationWithCallback = () => {
  notification.success({
    title: '操作成功',
    description: '您的操作已经成功完成！',
    onClose: () => {
      console.log('通知已关闭')
      // 执行其他操作，例如刷新数据
    }
  })
}
</script>

<template>
  <button @click="showNotificationWithCallback">显示通知（带回调）</button>
</template>
```

### React

```tsx
import { notification } from '@expcat/tigercat-react'

function App() {
  const showNotificationWithCallback = () => {
    notification.success({
      title: '操作成功',
      description: '您的操作已经成功完成！',
      onClose: () => {
        console.log('通知已关闭')
        // 执行其他操作，例如刷新数据
      }
    })
  }

  return <button onClick={showNotificationWithCallback}>显示通知（带回调）</button>
}
```

## 清空所有通知

可以使用 `notification.clear()` 方法清空所有正在显示的通知，也可以指定位置清空特定位置的通知。

### Vue 3

```vue
<script setup>
import { notification } from '@expcat/tigercat-vue'

const showMultipleNotifications = () => {
  notification.info({
    title: '通知 1',
    description: '第一条通知',
    position: 'top-right'
  })

  notification.success({
    title: '通知 2',
    description: '第二条通知',
    position: 'top-left'
  })

  notification.warning({
    title: '通知 3',
    description: '第三条通知',
    position: 'bottom-right'
  })
}

const clearAll = () => {
  notification.clear() // 清空所有位置的通知
}

const clearTopRight = () => {
  notification.clear('top-right') // 仅清空右上角的通知
}
</script>

<template>
  <div class="space-x-2">
    <button @click="showMultipleNotifications">显示多条通知</button>
    <button @click="clearAll">清空所有</button>
    <button @click="clearTopRight">清空右上角</button>
  </div>
</template>
```

### React

```tsx
import { notification } from '@expcat/tigercat-react'

function App() {
  const showMultipleNotifications = () => {
    notification.info({
      title: '通知 1',
      description: '第一条通知',
      position: 'top-right'
    })

    notification.success({
      title: '通知 2',
      description: '第二条通知',
      position: 'top-left'
    })

    notification.warning({
      title: '通知 3',
      description: '第三条通知',
      position: 'bottom-right'
    })
  }

  const clearAll = () => {
    notification.clear() // 清空所有位置的通知
  }

  const clearTopRight = () => {
    notification.clear('top-right') // 仅清空右上角的通知
  }

  return (
    <div className="space-x-2">
      <button onClick={showMultipleNotifications}>显示多条通知</button>
      <button onClick={clearAll}>清空所有</button>
      <button onClick={clearTopRight}>清空右上角</button>
    </div>
  )
}
```

## 完整示例

### Vue 3

```vue
<script setup>
import { notification } from '@expcat/tigercat-vue'

const handleFormSubmit = async () => {
  // 显示处理通知
  const close = notification.info({
    title: '正在提交',
    description: '正在提交表单，请稍候...',
    duration: 0
  })

  try {
    // 模拟异步操作
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // 关闭处理通知
    close()

    // 显示成功通知
    notification.success({
      title: '提交成功',
      description: '表单已成功提交！',
      duration: 4500,
      onClose: () => {
        console.log('成功通知已关闭')
      }
    })
  } catch (error) {
    // 关闭处理通知
    close()

    // 显示错误通知
    notification.error({
      title: '提交失败',
      description: '表单提交失败，请检查网络连接后重试',
      duration: 0,
      closable: true
    })
  }
}

const showDifferentTypes = () => {
  notification.info({
    title: '信息通知',
    description: '这是一条信息通知',
    position: 'top-right'
  })

  setTimeout(
    () =>
      notification.success({
        title: '成功通知',
        description: '操作成功',
        position: 'top-left'
      }),
    500
  )

  setTimeout(
    () =>
      notification.warning({
        title: '警告通知',
        description: '请注意',
        position: 'bottom-right'
      }),
    1000
  )

  setTimeout(
    () =>
      notification.error({
        title: '错误通知',
        description: '发生错误',
        position: 'bottom-left'
      }),
    1500
  )
}
</script>

<template>
  <div class="space-y-4">
    <h2 class="text-xl font-bold">Notification 组件示例</h2>

    <div class="space-x-2">
      <button @click="notification.info('快速信息')">快速信息</button>
      <button @click="notification.success('快速成功')">快速成功</button>
      <button @click="notification.warning('快速警告')">快速警告</button>
      <button @click="notification.error('快速错误')">快速错误</button>
    </div>

    <div class="space-x-2">
      <button @click="handleFormSubmit">提交表单（完整流程）</button>
      <button @click="showDifferentTypes">显示多种类型</button>
      <button @click="notification.clear()">清空所有</button>
    </div>
  </div>
</template>
```

### React

```tsx
import { notification } from '@expcat/tigercat-react'

function App() {
  const handleFormSubmit = async () => {
    // 显示处理通知
    const close = notification.info({
      title: '正在提交',
      description: '正在提交表单，请稍候...',
      duration: 0
    })

    try {
      // 模拟异步操作
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // 关闭处理通知
      close()

      // 显示成功通知
      notification.success({
        title: '提交成功',
        description: '表单已成功提交！',
        duration: 4500,
        onClose: () => {
          console.log('成功通知已关闭')
        }
      })
    } catch (error) {
      // 关闭处理通知
      close()

      // 显示错误通知
      notification.error({
        title: '提交失败',
        description: '表单提交失败，请检查网络连接后重试',
        duration: 0,
        closable: true
      })
    }
  }

  const showDifferentTypes = () => {
    notification.info({
      title: '信息通知',
      description: '这是一条信息通知',
      position: 'top-right'
    })

    setTimeout(
      () =>
        notification.success({
          title: '成功通知',
          description: '操作成功',
          position: 'top-left'
        }),
      500
    )

    setTimeout(
      () =>
        notification.warning({
          title: '警告通知',
          description: '请注意',
          position: 'bottom-right'
        }),
      1000
    )

    setTimeout(
      () =>
        notification.error({
          title: '错误通知',
          description: '发生错误',
          position: 'bottom-left'
        }),
      1500
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Notification 组件示例</h2>

      <div className="space-x-2">
        <button onClick={() => notification.info('快速信息')}>快速信息</button>
        <button onClick={() => notification.success('快速成功')}>快速成功</button>
        <button onClick={() => notification.warning('快速警告')}>快速警告</button>
        <button onClick={() => notification.error('快速错误')}>快速错误</button>
      </div>

      <div className="space-x-2">
        <button onClick={handleFormSubmit}>提交表单（完整流程）</button>
        <button onClick={showDifferentTypes}>显示多种类型</button>
        <button onClick={() => notification.clear()}>清空所有</button>
      </div>
    </div>
  )
}
```

## API

### notification 方法

| 方法                 | 说明         | 参数类型                       | 返回值                  |
| -------------------- | ------------ | ------------------------------ | ----------------------- |
| notification.info    | 显示信息通知 | `string \| NotificationConfig` | `() => void` (关闭函数) |
| notification.success | 显示成功通知 | `string \| NotificationConfig` | `() => void` (关闭函数) |
| notification.warning | 显示警告通知 | `string \| NotificationConfig` | `() => void` (关闭函数) |
| notification.error   | 显示错误通知 | `string \| NotificationConfig` | `() => void` (关闭函数) |
| notification.clear   | 清空通知     | `NotificationPosition?`        | `void`                  |

### NotificationConfig

| 参数        | 说明                                        | 类型                                                           | 默认值        |
| ----------- | ------------------------------------------- | -------------------------------------------------------------- | ------------- |
| title       | 通知标题                                    | `string`                                                       | -             |
| description | 通知描述内容                                | `string`                                                       | -             |
| type        | 通知类型                                    | `'info' \| 'success' \| 'warning' \| 'error'`                  | `'info'`      |
| duration    | 自动关闭的延时（毫秒），设为 0 时不自动关闭 | `number`                                                       | `4500`        |
| closable    | 是否显示关闭按钮                            | `boolean`                                                      | `true`        |
| position    | 通知显示位置                                | `'top-left' \| 'top-right' \| 'bottom-left' \| 'bottom-right'` | `'top-right'` |
| onClose     | 关闭时的回调函数                            | `() => void`                                                   | -             |
| onClick     | 点击通知时的回调函数                        | `() => void`                                                   | -             |
| icon        | 自定义图标（SVG path）                      | `string`                                                       | -             |
| className   | 自定义 CSS 类名                             | `string`                                                       | -             |

### NotificationPosition

通知可以显示在屏幕的四个角落：

- `'top-left'` - 左上角
- `'top-right'` - 右上角（默认）
- `'bottom-left'` - 左下角
- `'bottom-right'` - 右下角

## 样式定制

Notification 支持通过 CSS 变量进行主题定制（均带 fallback），避免依赖硬编码的 Tailwind 颜色。

### 主题变量

按类型可定制：

- `--tiger-notification-info-bg / --tiger-notification-info-border / --tiger-notification-info-icon`
- `--tiger-notification-success-bg / --tiger-notification-success-border / --tiger-notification-success-icon`
- `--tiger-notification-warning-bg / --tiger-notification-warning-border / --tiger-notification-warning-icon`
- `--tiger-notification-error-bg / --tiger-notification-error-border / --tiger-notification-error-icon`

标题/描述默认继承通用文本变量（也可按类型覆盖）：

- `--tiger-text` / `--tiger-text-muted`
- `--tiger-notification-<type>-title`
- `--tiger-notification-<type>-description`

关闭按钮/图标：

- `--tiger-notification-close-icon`
- `--tiger-notification-close-icon-hover`
- `--tiger-primary`（focus ring）

### 自定义样式

可以通过 `className` 属性添加自定义样式：

```javascript
notification.success({
  title: '自定义样式',
  description: '这是一条自定义样式的通知',
  className: 'my-custom-notification'
})
```

## 可访问性

Notification 组件遵循 WAI-ARIA 可访问性标准：

- `error` 类型使用 `role="alert"` + `aria-live="assertive"`
- 其它类型使用 `role="status"` + `aria-live="polite"`（避免打断用户）
- 使用 `aria-atomic="true"` 属性确保整个通知内容被读取
- 关闭按钮包含 `aria-label="Close notification"` 属性
- 图标使用 SVG 格式，具有良好的可缩放性
- 支持键盘操作（关闭按钮可通过 Tab 键聚焦；当传入 `onClick` 时通知本体支持 Enter/Space 触发）

为了便于测试与调试，渲染节点包含稳定的 `data-*` 标记（如 `data-tiger-notification`、`data-tiger-notification-container`）。

## 注意事项

1. Notification 组件会自动创建容器并挂载到 `body` 元素中
2. 默认情况下，通知会在 4.5 秒后自动关闭
3. 通知默认显示关闭按钮，可通过 `closable` 属性控制
4. 不同位置的通知相互独立，可以同时显示多条通知
5. 每个位置的通知会按照调用顺序依次排列，形成队列
6. 使用 `duration: 0` 时，通知不会自动关闭，建议同时设置 `closable: true`
7. 通知内容建议包含标题和描述，以提供清晰的上下文信息
8. 通知宽度固定为 384px（24rem），在小屏幕上会自动适应

## 与 Message 的区别

| 特性         | Notification               | Message            |
| ------------ | -------------------------- | ------------------ |
| 使用场景     | 系统级通知、复杂信息       | 操作反馈、简单提示 |
| 显示位置     | 屏幕四个角落               | 顶部居中           |
| 内容结构     | 标题 + 描述                | 单行内容           |
| 默认持续时间 | 4.5 秒                     | 3 秒               |
| 默认关闭按钮 | 显示                       | 不显示             |
| 适用场景     | 需要较长时间停留的重要通知 | 轻量级操作反馈     |
| 视觉复杂度   | 较高（带标题和描述）       | 较低（单行文本）   |

## 与全局状态集成

Notification 组件可以轻松地与全局状态管理工具（如 Pinia、Redux）集成：

### Vue 3 + Pinia 示例

```typescript
// store/notification.ts
import { defineStore } from 'pinia'
import { notification } from '@expcat/tigercat-vue'
import type { NotificationOptions } from '@expcat/tigercat-core'

export const useNotificationStore = defineStore('notification', {
  actions: {
    notify(config: NotificationOptions) {
      return notification.info(config)
    },
    success(config: NotificationOptions) {
      return notification.success(config)
    },
    error(config: NotificationOptions) {
      return notification.error(config)
    }
  }
})
```

### React + Redux 示例

```typescript
// actions/notification.ts
import { notification } from '@expcat/tigercat-react'
import type { NotificationOptions } from '@expcat/tigercat-core'

export const showNotification = (config: NotificationOptions) => {
  return () => {
    notification.info(config)
  }
}

export const showSuccess = (config: NotificationOptions) => {
  return () => {
    notification.success(config)
  }
}
```

## TypeScript 支持

Notification 组件提供完整的 TypeScript 类型定义：

```typescript
import {
  notification,
  NotificationConfig,
  NotificationOptions,
  NotificationPosition,
  NotificationType
} from '@expcat/tigercat-vue' // 或 '@expcat/tigercat-react'

// 使用字符串（仅标题）
notification.info('简单通知')

// 使用配置对象
const config: NotificationConfig = {
  title: '详细配置',
  description: '这是通知的详细描述',
  duration: 5000,
  position: 'top-right',
  closable: true,
  onClick: () => {
    console.log('通知被点击')
  },
  onClose: () => {
    console.log('通知已关闭')
  }
}
notification.success(config)

// 获取关闭函数
const close: () => void = notification.info({
  title: '处理中',
  description: '正在处理...',
  duration: 0
})

// 清空特定位置的通知
const position: NotificationPosition = 'top-right'
notification.clear(position)
```

## 最佳实践

1. **选择合适的类型**：根据消息的性质选择合适的通知类型（info、success、warning、error）
2. **提供清晰的标题**：标题应简洁明了，能够快速传达通知的主要内容
3. **添加详细描述**：描述应提供足够的上下文信息，帮助用户理解通知的完整含义
4. **合理设置持续时间**：根据内容重要性和复杂度设置合适的显示时间
5. **避免过多通知**：避免同时显示过多通知，以免影响用户体验
6. **使用回调函数**：利用 `onClick` 和 `onClose` 回调实现更丰富的交互
7. **一致的位置策略**：在应用中保持一致的通知位置策略，避免用户困惑
