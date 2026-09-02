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
- 容器由命令式 host 挂载。Vue 容器发 `close`（`@close`），不要只绑 `:on-close`。
- 关闭名走 locale：`common.closeMessageAriaLabel` / `closeNotificationAriaLabel`。LoadingBar 默认名是 `common.loadingText`。
- `Message.loading({ duration })` 尊重传入 duration。`finish` 后下一次 `start()` 不粘上一次 color。
- Action 点击不触发整条 toast 的 `onClick`；用 `closeOnClick` 或回调里的 `close()`。

条目/容器 props 见 [feedback.md](shared/props/feedback.md) 的 `## Message`、`## LoadingBar`、`## NotificationContainer`。绑定差异见 [common.md](shared/patterns/common.md)。文案见 [i18n.md](i18n.md)。

Next: [getting-started.md](getting-started.md) · [i18n.md](i18n.md) · [component-index.md](component-index.md)
