# Tigercat i18n 覆盖审计

更新时间：2026-05-23

## 结论

§9.4 审计后，Tigercat 的用户可见默认文案分为两类：

| 状态        | 范围                                                                                                                                                                                            | 结论                                                                                         |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Locale 驱动 | `ConfigProvider`、`Pagination`、`DatePicker`、`TimePicker`、`Modal`、`Drawer`、`Upload`、`FormWizard`、`TaskBoard`                                                                              | 已接入 `TigerLocale` / locale code，支持内置语言包、懒加载和局部覆盖。                       |
| Prop 驱动   | `NotificationCenter`、`ActivityFeed`、`ChatWindow`、`CommentThread`、`List`、`Table`、`VirtualTable`、`Tree`、`FileManager`、`InfiniteScroll`、`Transfer`、`Tour`、`Popconfirm` 等组合/内容组件 | 默认文案均可通过显式 props、slots 或 children 覆盖；没有发现只能通过源码修改的不可覆盖文案。 |

因此当前目标定义为：基础控件默认文案纳入 locale 系统；业务/组合组件保持 props-first，本地化由调用方传入文案。新增组件若引入框架级默认文案，应优先加入 `TigerLocale`；若文案与业务语境强相关，应提供显式 prop/slot 并在文档列入 prop-driven 范围。

## 内置语言包

核心 locale 预设现为 13 个：`en-US`、`zh-CN`、`zh-TW`、`ja-JP`、`ko-KR`、`th-TH`、`vi-VN`、`id-ID`、`es-ES`、`fr-FR`、`de-DE`、`pt-BR`、`ar-SA`。

DatePicker 专用 locale 同步提供 13 个同名子路径。主入口仍不 re-export locale 预设，避免把未使用语言打入产物。

## RTL

`TigerLocale` 增加 `locale` 与 `direction` 元数据。`ar-SA` 设置为 `direction: 'rtl'`，`ConfigProvider` 会同步 `document.documentElement` 的 `dir` 与 `data-tiger-dir`。`getLocaleDirection()` 会自动识别 `ar`、`fa`、`he`、`iw`、`ps`、`ur` 等 RTL 语言码。

已验证的组件镜像点：

| 组件          | RTL 行为                                                                                 |
| ------------- | ---------------------------------------------------------------------------------------- |
| Pagination    | 上一页/下一页视觉箭头按 RTL 镜像，aria-label 保持 locale 文案。                          |
| DatePicker    | 上月/下月导航图标按 RTL 镜像，月份/星期通过 locale code 本地化。                         |
| Tailwind 插件 | 提供 `tiger-rtl-mirror`、`tiger-text-start`、`tiger-text-end`、`tiger-flex-row` 辅助类。 |

## Intl 格式

| 工具                                                                | Intl 接入                                                                                                  |
| ------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `formatPaginationTotal()`                                           | 使用 `Intl.NumberFormat` 格式化 `{total}`、`{start}`、`{end}`，并通过 `Intl.PluralRules` 提供 `{plural}`。 |
| `formatPageAriaLabel()`                                             | 使用 `Intl.NumberFormat` 格式化页码。                                                                      |
| `formatDate()`                                                      | 传入 locale 时使用 `Intl.DateTimeFormat`；未传 locale 保留历史固定格式。                                   |
| `formatDateWithLocale()`                                            | 新增通用 DateTimeFormat 包装，支持自定义 `Intl.DateTimeFormatOptions`。                                    |
| `formatActivityTime()` / `formatChatTime()` / `formatCommentTime()` | 增加 locale 与 options 参数，允许调用方显式控制日期时间格式。                                              |

## 回归测试

覆盖文件：

- `tests/core/i18n-locales.spec.ts`
- `tests/core/datepicker-i18n.spec.ts`
- `tests/core/date-utils.spec.ts`
- `tests/core/pagination-utils.spec.ts`
- `tests/react/ConfigProvider.spec.tsx`
- `tests/vue/ConfigProvider.spec.ts`

新增断言覆盖新语言包、DatePicker 文案、RTL direction、Intl 数字/日期格式和 TimePicker 多语言标签。
