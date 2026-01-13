# Tigercat 组件优化/重构计划（总控 + 待办）

> 目标：用最小破坏面，把组件在 **一致性、可访问性(a11y)、类型正确性、跨框架复用、可测试性、可维护性** 上拉齐到同一水位。
>
> 范围：`packages/vue/src/components/*`、`packages/react/src/components/*`、必要时 `packages/core/src/{utils,types,theme}/*`、配套 `tests/*` 与 `docs/components/*`。

---

## 0. 状态板（只维护这里）

- 更新时间：2026-01-14
- 上一步：✅ `DatePicker/TimePicker` 的 20x20 实心 close(X) path + viewBox 常量统一收敛到 core `common-icons`（两端复用；tests + build 通过）
- 当前组件：Phase 0 基建
- 当前步骤：🚧 consistent classes 推进中（新增覆盖 Upload uploading spinner；持续收敛重复 SVG）
- Step1-5 完成度：已完成一轮（包含 build 验证；详见「4. 已完成」）
- 未完成清单：见「1. 未完成/待办」

---

## 1. 未完成/待办（给后续 Agent）

### 1.1 Phase 0 基建（跨组件通用，仍为待办）

> 说明：目前大量能力已在各组件内“就地实现”。若后续要持续扩展组件能力，建议把通用算法/约束补齐到 core，减少重复实现。

- [x] 建立「组件重构任务模板」并约定优先级标签：P0/P1/P2/P3（见 docs/component-refactor-task-template.md）
- [ ] a11y（优先放 `@tigercat/core`）：
  - [x] focus management（core `focus-utils` + React/Vue 对齐使用）
  - [x] keyboard helpers（`isEnterKey` / `isSpaceKey` / `isActivationKey`）
  - [x] aria id 生成（`createAriaId`）
- [x] overlay：click-outside、ESC 关闭、focus trap（core 放无框架算法；React/Vue 各自封装）
  - [x] core：`isEventOutside` + focus trap 算法（`getFocusableElements` / `getFocusTrapNavigation`）
  - [x] React：`useClickOutside` / `useEscapeKey` / `useFocusTrap`（内部 utils）
  - [x] Vue：`useVueClickOutside` / `useVueEscapeKey`（内部 utils）
- [x] i18n：常用文案（empty/loading/ok/cancel/close）以 props/locale 方式注入的统一入口
- [ ] consistent classes：组件 class 生成尽量走 core 的 `*-utils.ts` / `*-styles.ts`

  - 进度：✅ Icon 的 size/base class 映射已统一下沉到 `@tigercat/core`（`icon-utils`），Vue/React 双端复用同一实现。
  - 进度：✅ Container 的 maxWidth/center/padding class 生成已统一下沉到 `@tigercat/core`（`container-utils`），Vue/React 双端复用同一实现。
  - 进度：✅ Radio 的 size/base class 生成已统一下沉到 `@tigercat/core`（`radio-utils`），Vue/React 双端复用同一实现。
  - 进度：✅ RadioGroup 的默认 spacing class 生成已统一下沉到 `@tigercat/core`（`radio-group-utils`），Vue/React 双端复用同一实现。
  - 进度：✅ Loading 的 dots/bars/text layout class 生成已统一下沉到 `@tigercat/core`（`loading-utils` 扩展），Vue/React 双端复用同一实现。
  - 进度：✅ StepsItem 的 finish 对勾 SVG 常量（`stepFinishIcon*`）已统一下沉到 `@tigercat/core`（`steps-utils`），Vue/React 双端复用同一实现。
  - 进度：✅ Modal/Drawer/TabPane 的关闭(X) SVG 常量（`closeIcon*`）已统一下沉到 `@tigercat/core`（`common-icons`），Vue/React 双端复用同一实现。
  - 进度：✅ Upload 的 uploading spinner SVG 已统一复用 core `getSpinnerSVG('spinner')`；同时将 Vue 渲染所需的 SVG attrs 归一化（`normalizeSvgAttrs`）下沉到 `@tigercat/core`（`svg-attrs`）。
  - 进度：✅ Button/Table 的 loading spinner SVG 已统一复用 core `getSpinnerSVG('spinner')`（两端删除重复 circle/path）。
  - 进度：✅ List/Tree 的 loading spinner SVG 已统一复用 core `getSpinnerSVG('spinner')`（两端删除重复 circle/path）。
  - 进度：✅ Popconfirm 的 5 个状态 icon（warning/info/error/success/question）SVG path 常量已统一下沉到 `@tigercat/core`（`popconfirm-utils`），Vue/React 双端复用同一实现。
  - 进度：✅ Alert/Message/Notification/Tag 的“24x24 outline SVG 默认 attrs”（viewBox/strokeWidth/linecap/linejoin）+ status icon paths（success/warning/error/info）+ close(X) path 已统一收敛到 `@tigercat/core`（`common-icons`），两端删除重复字面量。
  - 进度：✅ DatePicker/TimePicker 的 20x20 实心 close(X) icon path（`closeSolidIcon20PathD`）与 viewBox（`icon20ViewBox`）已统一收敛到 `@tigercat/core`（`common-icons`）；`datepicker-icons`/`timepicker-icons` 复用该常量并保持原导出名不变。

---

## 2. 强约束（经验规则，避免踩坑）

1. **先对齐模式再动手**：优先对照同类组件（Button/Input/Form）现有写法，保持风格一致。

2. **跨框架逻辑下沉 core**：校验、格式化、数据处理、class 生成、主题变量 → 放 `@tigercat/core`；框架特有留在 Vue/React 包。

3. **先稳定 API，再优化实现**：先统一 props/events/defaults，再做内部优化。

4. **React 同名属性冲突优先排雷**：组件 props 与 `React.HTMLAttributes` 同名时必须用 `Omit<...>` 显式剔除，否则 d.ts 易出现 `string & ReactNode` 交叉类型。

5. **React cloneElement 必须先收窄**：对 `children` 做 `cloneElement` 时用 `React.isValidElement<YourChildProps>(children)` 先收窄，避免把 `unknown` 扩散进 d.ts。

6. **Vue `h()` children 不要写成 `unknown[]`**：需要“收集 children 再传给 h”时，把类型锚定到 `h()` 签名上：

```ts
import { h } from 'vue';

type HChildren = Parameters<typeof h>[2];
type HArrayChildren = Extract<NonNullable<HChildren>, unknown[]>;

const children: HArrayChildren = [h('span', '...')];

return h('div', { class: '...' }, children);
```

---

## 3. DoD（完成标准）

- **API 一致性**：Vue emits kebab-case；React handler camelCase；默认值与 docs 同步。
- **Theme 支持**：颜色相关用 CSS vars（带 fallback）。
- **A11y 基线**：可交互元素语义正确、键盘可用、焦点可见。
- **类型**：strict 下无 `any`；必要时 `unknown` + 立即收窄；通用类型/工具优先放 core。
- **测试**：至少覆盖关键路径；复杂组件补键盘/边界与 a11y。
- **文档**：`docs/components/*.md` 与真实 props/events 对齐，提供最小示例。

---

## 4. 已完成（摘要索引）

> 说明：本区只保留“可追溯摘要”，详细变更以 git 历史为准。

- 2026-01-14：`Button` Step2-5（disabled/loading 交互与默认 aria 策略、spinner a11y、测试覆盖、docs 同步、build 通过）。
- 2026-01-14：`Button`（P1）深化（补齐 keyboard 关键路径测试；注：Space 语义依赖原生 button 行为，happy-dom 不稳定不强测；build 通过）。
- 2026-01-14：Phase 0 基建（SVG spinner 复用）：`List`/`Tree`（Vue+React）loading spinner 改用 core `getSpinnerSVG('spinner')`；相关单测通过；build 通过。
- 2026-01-14：Phase 0 基建（重复 SVG 收敛）：`Popconfirm`（Vue+React）内联 5 个状态 icon SVG 改为复用 core `popconfirm-utils`（`getPopconfirmIconPath` + 相关常量）；相关单测通过；build 通过。
- 2026-01-14：Phase 0 基建（重复 SVG 收敛）：`Alert/Message/Notification/Tag`（Vue+React）统一复用 core `common-icons` 的 status icon paths + close(X) path + 24x24 outline attrs 常量；相关单测通过；build 通过。
- 2026-01-14：Phase 0 基建（重复 SVG 收敛）：`DatePicker/TimePicker`（Vue+React）统一复用 core `common-icons` 的 20x20 close(X) path + `icon20ViewBox`；`datepicker-icons`/`timepicker-icons` 内部改为引用该常量；相关单测通过；build 通过。
- 2026-01-14：Phase 0 基建（SVG spinner 复用）：`Button`/`Table`（Vue+React）loading spinner 改用 core `getSpinnerSVG('spinner')`；相关单测通过；build 通过。
- 2026-01-14：Phase 0 基建（SVG spinner 复用）：新增 core `normalizeSvgAttrs`（`svg-attrs`）+ `Upload`（Vue/React）改用 `getSpinnerSVG('spinner')`；Upload 单测通过；build 通过。
- 2026-01-14：Phase 0 基建（新增 core a11y utils：`createAriaId`/keyboard helpers；新增组件重构任务模板；补齐最小单测；build 通过）。
- 2026-01-14：Phase 0 基建（overlay）：新增 core overlay utils（click-outside/ESC/focus trap 算法）+ Vue/React 封装；对齐部分组件使用；补齐最小单测；build 通过。
- 2026-01-14：Phase 0 基建（focus management）：新增 core focus utils（capture/restore/safe focus）+ React `Modal` / Vue `Drawer` 复用；补齐最小单测；build 通过。
- 2026-01-14：Phase 0 基建（i18n）：新增 core `TigerLocale` + `resolveLocaleText`；Modal/Drawer（Vue+React）接入 locale 入口；补齐最小单测；build 通过。
- 2026-01-13：`Button` Step1；`Select` Step1-4；`Form/FormItem` Step1-3；`Menu` Step1-4；`Tabs` Step1-3；`Table` Step1-3；`Tree` Step0 + Step1-4；`DatePicker` Step1-4；`TimePicker` Step1-5；`Upload` Step1-5；`Message/Notification/Loading/Modal/Drawer/Popover` Step1。
- 2026-01-12：`Icon/Link/Text/Badge/Tag/Avatar/Card/Container/Divider/Space/Layout/Grid/Input/Textarea/Checkbox/Radio/Switch/Slider/Breadcrumb/Steps/Pagination/Dropdown/List/Descriptions/Timeline/Progress/Skeleton/Alert/Tooltip/Popconfirm` Step1。
