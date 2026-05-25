---
name: tigercat
description: Tigercat UI component library for Vue 3 and React
---

# Tigercat UI Component Library

Tailwind CSS 驱动的跨框架组件库。此文件只做 LLM 导航索引；编码规则见 `.github/copilot-instructions.md`。

## Open First

| Need                                      | File                                                                                                                                                                                                             |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 术语与 Vue/React 映射                     | [shared/glossary.md](references/shared/glossary.md)                                                                                                                                                              |
| 常用跨框架模式                            | [shared/patterns/common.md](references/shared/patterns/common.md)                                                                                                                                                |
| TS 派生 API 摘要                          | [shared/api-summary.md](references/shared/api-summary.md)                                                                                                                                                        |
| Setup / Theme / Tokens / i18n / SSR / CLI | [getting-started.md](references/getting-started.md), [theme.md](references/theme.md), [tokens.md](references/tokens.md), [i18n.md](references/i18n.md), [ssr.md](references/ssr.md), [cli.md](references/cli.md) |
| Accessibility / Performance / Release     | [accessibility.md](references/accessibility.md), [performance.md](references/performance.md), [release.md](references/release.md)                                                                                |

## Category Index

| Category   | Shared Props                                                        | Vue                                               | React                                                 |
| ---------- | ------------------------------------------------------------------- | ------------------------------------------------- | ----------------------------------------------------- |
| Basic      | [shared/props/basic.md](references/shared/props/basic.md)           | [vue/basic.md](references/vue/basic.md)           | [react/basic.md](references/react/basic.md)           |
| Form       | [shared/props/form.md](references/shared/props/form.md)             | [vue/form.md](references/vue/form.md)             | [react/form.md](references/react/form.md)             |
| Feedback   | [shared/props/feedback.md](references/shared/props/feedback.md)     | [vue/feedback.md](references/vue/feedback.md)     | [react/feedback.md](references/react/feedback.md)     |
| Layout     | [shared/props/layout.md](references/shared/props/layout.md)         | [vue/layout.md](references/vue/layout.md)         | [react/layout.md](references/react/layout.md)         |
| Navigation | [shared/props/navigation.md](references/shared/props/navigation.md) | [vue/navigation.md](references/vue/navigation.md) | [react/navigation.md](references/react/navigation.md) |
| Data       | [shared/props/data.md](references/shared/props/data.md)             | [vue/data.md](references/vue/data.md)             | [react/data.md](references/react/data.md)             |
| Charts     | [shared/props/charts.md](references/shared/props/charts.md)         | [vue/charts.md](references/vue/charts.md)         | [react/charts.md](references/react/charts.md)         |
| Advanced   | [shared/props/advanced.md](references/shared/props/advanced.md)     | [vue/advanced.md](references/vue/advanced.md)     | [react/advanced.md](references/react/advanced.md)     |
| Composite  | [shared/props/composite.md](references/shared/props/composite.md)   | [vue/composite.md](references/vue/composite.md)   | [react/composite.md](references/react/composite.md)   |

## 2-Step Component Lookup

1. 在下表搜索组件名，确认所属分类。
2. 打开同一行的 Props / Vue / React 分类文档，再搜索组件标题。

| Category   | Components                                                                                                                                                                                                                             | Props                                          | Vue                                 | React                                   |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- | ----------------------------------- | --------------------------------------- |
| Basic      | Alert, Avatar, AvatarGroup, Badge, Button, ButtonGroup, Code, Divider, Empty, Icon, Image, ImageCropper, Link, QRCode, Tag, Text                                                                                                       | [Props](references/shared/props/basic.md)      | [Vue](references/vue/basic.md)      | [React](references/react/basic.md)      |
| Form       | AutoComplete, Cascader, Checkbox, CheckboxGroup, ColorPicker, DatePicker, Form, Input, InputGroup, InputNumber, Mentions, Radio, RadioGroup, Rate, Select, Slider, Stepper, Switch, Textarea, TimePicker, Transfer, TreeSelect, Upload | [Props](references/shared/props/form.md)       | [Vue](references/vue/form.md)       | [React](references/react/form.md)       |
| Feedback   | Drawer, Loading, Message, Modal, Notification, Popconfirm, Popover, Progress, Result, Tooltip, Tour, Watermark                                                                                                                         | [Props](references/shared/props/feedback.md)   | [Vue](references/vue/feedback.md)   | [React](references/react/feedback.md)   |
| Layout     | Card, Carousel, Container, Descriptions, Grid, Layout, List, Resizable, Skeleton, Space, Splitter, Statistic                                                                                                                           | [Props](references/shared/props/layout.md)     | [Vue](references/vue/layout.md)     | [React](references/react/layout.md)     |
| Navigation | Affix, Anchor, BackTop, Breadcrumb, Dropdown, FloatButton, Menu, Pagination, Segmented, Steps, Tabs, Tree                                                                                                                              | [Props](references/shared/props/navigation.md) | [Vue](references/vue/navigation.md) | [React](references/react/navigation.md) |
| Data       | Calendar, Collapse, Table, Timeline                                                                                                                                                                                                    | [Props](references/shared/props/data.md)       | [Vue](references/vue/data.md)       | [React](references/react/data.md)       |
| Charts     | AreaChart, BarChart, ChartCanvas, ChartLegend, ChartTooltip, DonutChart, FunnelChart, GaugeChart, HeatmapChart, LineChart, PieChart, RadarChart, ScatterChart, SunburstChart, TreeMapChart                                             | [Props](references/shared/props/charts.md)     | [Vue](references/vue/charts.md)     | [React](references/react/charts.md)     |
| Advanced   | CodeEditor, FileManager, ImageViewer, InfiniteScroll, Kanban, PrintLayout, RichTextEditor, TaskBoard, VirtualList, VirtualTable                                                                                                        | [Props](references/shared/props/advanced.md)   | [Vue](references/vue/advanced.md)   | [React](references/react/advanced.md)   |
| Composite  | ActivityFeed, ChatWindow, CommentThread, CropUpload, DataTableWithToolbar, FormWizard, NotificationCenter                                                                                                                              | [Props](references/shared/props/composite.md)  | [Vue](references/vue/composite.md)  | [React](references/react/composite.md)  |
