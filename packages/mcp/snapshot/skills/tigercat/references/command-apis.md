---
name: tigercat-command-apis
description: Imperative Message, notification, and LoadingBar root APIs
---

# Command APIs

`Message`、`notification`、`LoadingBar` 是根入口命令式 API，不是空组件。从包根导入；PascalCase 子路径 `/Message`、`/LoadingBar` 是懒加载 Root。不要渲染空的 `<Message />`。

```ts
import { Message, notification, LoadingBar } from '@expcat/tigercat-react'
// Vue: '@expcat/tigercat-vue'

Message.info('Saved')
Message.loading({ content: 'Saving', duration: 0 })
notification.info({
  title: 'Done',
  actions: [{ label: 'Undo', onClick: () => {} }]
})
LoadingBar.start()
LoadingBar.set(40)
LoadingBar.finish()
```

## Rules

- `notification` **不是**公开组件；收件箱 UI 用 `NotificationCenter`。
- 命令参数类型是 `MessageOptions` / `NotificationOptions`。`MessageProps` / `NotificationProps` / `LoadingBarProps` 是条目/容器字段。
- `Message` 和 `notification` 只改当前 `ConfigProvider` 渲染的队列，读这一层的文案和方向。调用点不另开 React root 或 Vue app。服务端调用什么都不做。先挂上 `ConfigProvider`。
- 同一个 `key` 替换那一条。`onClose` 抛错也不会把条目留在界面上。
- `Message` 默认可关闭。指针或焦点在条目上时暂停计时。同一位置超出上限时丢掉最旧的一条。`loading` 不自动关。负时长和 `NaN` 不自动关。
- `notification` 的主动作是一颗按钮（`actionLabel`，默认 locale 的查看文案），整张卡片不是点击目标。`actions` 是另外的按钮，不会触发主动作。用 `closeOnClick` 或回调里的 `close()` 关掉这一条。
- 声明式容器：Vue 发 `close`（`@close`），不要只绑 `:on-close`。
- 关闭名走 locale：`common.closeMessageAriaLabel` / `closeNotificationAriaLabel`。LoadingBar 默认名是 `common.loadingText`。
- `Message.loading({ duration })` 尊重传入 duration。`LoadingBar.finish` 后下一次 `start()` 不粘上一次 color。`error` 和 `finish` 共用 `start` 计数；还有未结束的 `start` 时保持加载。

条目/容器 props 见 [feedback.md](shared/props/feedback.md) 的 `## Message`、`## LoadingBar`、`## NotificationContainer`。绑定差异见 [common.md](shared/patterns/common.md)。文案见 [i18n.md](i18n.md)。

Next: [getting-started.md](getting-started.md) · [i18n.md](i18n.md) · [component-index.md](component-index.md)
