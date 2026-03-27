# 浏览器兼容性

Tigercat v1.0.0 支持以下浏览器的最新两个主要版本：

## 兼容性矩阵

| 浏览器  | 最低版本  | 测试覆盖               |
| ------- | --------- | ---------------------- |
| Chrome  | 最新 2 版 | ✅ Playwright          |
| Firefox | 最新 2 版 | ✅ Playwright          |
| Safari  | 最新 2 版 | ✅ Playwright (WebKit) |
| Edge    | 最新 2 版 | ✅ (Chromium 内核)     |

## 不支持

- Internet Explorer（任何版本）
- Chrome < 90
- Firefox < 90
- Safari < 15

## 技术依赖

| 特性                  | 用途                         | 兼容性         |
| --------------------- | ---------------------------- | -------------- |
| CSS Custom Properties | 主题系统                     | 所有现代浏览器 |
| CSS Grid / Flexbox    | 布局组件                     | 所有现代浏览器 |
| Intersection Observer | InfiniteScroll / VirtualList | 所有现代浏览器 |
| Resize Observer       | Resizable / 响应式           | 所有现代浏览器 |
| Drag and Drop API     | Kanban / FileManager         | 所有现代浏览器 |
| SVG                   | 图表组件                     | 所有现代浏览器 |

## E2E 测试

所有关键用户流程通过 Playwright 在 Chromium、Firefox、WebKit 三个引擎中自动测试。

```bash
# 运行 E2E 测试
npx playwright test

# 指定浏览器
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

## 移动端

组件支持触摸事件与响应式布局，在移动端浏览器（iOS Safari、Android Chrome）中可正常使用。
