# Phase 2.1 — Basic 组件审查 (2026-04)

> 范围：16 个组件 — Alert, Avatar, AvatarGroup, Badge, Button, ButtonGroup, Code, Divider, Empty, Icon, Image, ImageCropper, Link, QRCode, Tag, Text
> 文档：[`shared/props/basic.md`](../../skills/tigercat/references/shared/props/basic.md) · [`vue/basic.md`](../../skills/tigercat/references/vue/basic.md) · [`react/basic.md`](../../skills/tigercat/references/react/basic.md)

## 1. 体积现状（dist 估算）

按 dts 文件大小推断 .mjs 体积（dts ≈ 实际代码 ×0.7 系数）：

| 组件                              | Vue dts            | 备注                           |
| --------------------------------- | ------------------ | ------------------------------ |
| Button                            | 中等               | 含 spinner SVG，loadingIcon 槽 |
| ImageCropper                      | 2.7 KB             | 较重，含 crop/zoom             |
| QRCode                            | 1.8 KB             | 自实现 QR 生成？需查           |
| Image / ImagePreview / ImageGroup | 3.2 / 2.5 / 1.1 KB | 三件套，可考虑合并子文件       |
| Text / Tag / Badge / Avatar       | 1–3 KB             | 健康                           |

**优化点**：QRCode 若内置 QR 算法应抽到 `core/utils/qrcode-utils.ts`（已存在），按需 import。

## 2. 代码层优化（P0/P1/P2）

| #   | 优化项                                                                                                                                 | 优先级 |
| --- | -------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| B1  | **Button**：`getSpinnerSVG('spinner')` 在模块顶层执行 → 即使不 loading 也会创建对象。改为函数式 lazy 创建（`useMemo`/`computed`）      | P1     |
| B2  | **Button**：Vue 的 `LoadingSpinner` 是 module-level h() 调用，在 SSR 多次组件实例化时可能复用同一 vnode 引用导致渲染问题。改为工厂函数 | **P0** |
| B3  | **AvatarGroup / ImageGroup / ButtonGroup**：3 个 group 组件结构相似（max + overflow + 子项 context），可抽 `core/utils/group-utils.ts` | P1     |
| B4  | **Image**：现状 lazy load 是否用 `IntersectionObserver`？应统一用 `core/utils/responsive.ts` 提供的 hooks 避免重复实现                 | P1     |
| B5  | **Icon**：当前实现需要全量 import `common-icons.ts`；改为分组路径 `@expcat/tigercat-core/icons/<group>`                                | P1     |
| B6  | **QRCode**：检查是否有内联的 QR 算法重复实现（vue+react 各一份），若是抽到 core                                                        | P1     |
| B7  | **Text / Code**：内容很短，是否有过度抽象？合并为 `Typography` 一个文件可能更合适                                                      | P2     |
| B8  | **Empty**：默认插画 SVG 是否可改为 CSS-only 或外链可替换？减少包体                                                                     | P2     |
| B9  | **Divider**：仅一个简单组件，不需要单独文件 → 可与 Space 合并                                                                          | P2     |
| B10 | **Tag**：closable / icon 渲染的事件处理在 vue/react 应使用统一 `closeIconPathD`（已在 common-icons）                                   | P1     |

## 3. 样式现代化清单（接 Phase 1C tokens）

| 组件         | 现状                                                         | 现代化方案                                                                                                                                  |
| ------------ | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Button       | `rounded-lg` 硬编码 + `transition-all duration-200 ease-out` | `rounded-[var(--tiger-radius-md,0.5rem)]` + `var(--tiger-transition-base)`；primary 背面叠 `--tiger-gradient-primary`；按下用 spring easing |
| Tag          | 略方                                                         | `rounded-[var(--tiger-radius-sm,0.375rem)]`；提供 `pill` 形态用 `--tiger-radius-pill`                                                       |
| Badge        | 圆点/数字                                                    | dot 形态用 `--tiger-radius-pill`；新增 `glow` 动效（hover 时 `box-shadow: 0 0 0 4px color-mix(...)`）                                       |
| Avatar       | 默认圆                                                       | 引入 `shape: 'circle' \| 'square' \| 'squircle'`，squircle 用 `border-radius: 30%` 现代风                                                   |
| Card         | 见 Layout                                                    | —                                                                                                                                           |
| Alert        | 方框                                                         | `rounded-[var(--tiger-radius-md)]` + 左侧 4px 实色 strip + 微渐变背景（`color-mix(in oklab, var(--tiger-info), white 92%)`）                |
| Modal/Drawer | —                                                            | 见 Feedback                                                                                                                                 |
| Image        | rounded-md                                                   | 升 `--tiger-radius-md`；提供 `glassFrame` prop（玻璃框）                                                                                    |
| Tooltip      | —                                                            | 见 Feedback                                                                                                                                 |
| Empty        | —                                                            | 插画支持彩色渐变（`stroke="url(#tiger-grad)"`）                                                                                             |
| Divider      | 直线                                                         | 支持 `gradient` 形态 `linear-gradient(90deg, transparent, var(--tiger-border), transparent)`                                                |

## 4. 演示案例改进

### Vue3 / React 共用

- ButtonDemo：增加"现代化主题对比"分屏 + spring easing 演示
- AvatarDemo：增加 squircle 形态
- BadgeDemo：增加 glow / ribbon 形态
- AlertDemo：增加 glass 形态
- ImageDemo：增加 lazy + 占位骨架联动
- QRCodeDemo：增加渐变前景 / logo 嵌入演示
- IconDemo：分组展示，按需 import 路径示例

### 缺失

- ImageCropperDemo 当前仅基础裁剪，缺**圆形裁剪 + zoom + 实时预览**完整流
- ButtonGroup 缺 vertical + 不同 variant 混合演示

## 5. 风险与依赖

- B2 Button SSR 修复必须先做（影响 v1.0.x 稳定性）
- 样式现代化依赖 Phase 1C 的 token 注入完成
- B5 Icon 分组依赖 Phase 1B 的 sideEffects 修复
