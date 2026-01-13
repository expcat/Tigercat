# Tigercat 组件优化/重构计划（总控 + 待办）

> 目标：用最小破坏面，把组件在 **一致性、可访问性(a11y)、类型正确性、跨框架复用、可测试性、可维护性** 上拉齐到同一水位。
>
> 范围：`packages/vue/src/components/*`、`packages/react/src/components/*`、必要时 `packages/core/src/{utils,types,theme}/*`、配套 `tests/*` 与 `docs/components/*`。

---

## 0. 状态板（只维护这里）

- 更新时间：2026-01-14
- 上一步：✅ `Button` P1 深化（keyboard 关键路径补测 + build 验证）
- 当前组件：待选择（下一组件 / Phase 0 基建）
- 当前步骤：准备进入下一个组件（待确认）
- Step1-5 完成度：已完成一轮（包含 build 验证；详见「4. 已完成」）
- 未完成清单：见「1. 未完成/待办」

---

## 1. 未完成/待办（给后续 Agent）

### 1.1 Phase 0 基建（跨组件通用，仍为待办）

> 说明：目前大量能力已在各组件内“就地实现”。若后续要持续扩展组件能力，建议把通用算法/约束补齐到 core，减少重复实现。

- [ ] 建立「组件重构任务模板」并约定优先级标签：P0/P1/P2/P3
- [ ] a11y：focus management、keyboard helpers、aria id 生成（优先放 `@tigercat/core`）
- [ ] overlay：click-outside、ESC 关闭、focus trap（core 放无框架算法；React/Vue 各自封装）
- [ ] i18n：常用文案（empty/loading/ok/cancel）以 props/locale 方式注入的统一入口
- [ ] consistent classes：组件 class 生成尽量走 core 的 `*-utils.ts` / `*-styles.ts`

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
- 2026-01-13：`Button` Step1；`Select` Step1-4；`Form/FormItem` Step1-3；`Menu` Step1-4；`Tabs` Step1-3；`Table` Step1-3；`Tree` Step0 + Step1-4；`DatePicker` Step1-4；`TimePicker` Step1-5；`Upload` Step1-5；`Message/Notification/Loading/Modal/Drawer/Popover` Step1。
- 2026-01-12：`Icon/Link/Text/Badge/Tag/Avatar/Card/Container/Divider/Space/Layout/Grid/Input/Textarea/Checkbox/Radio/Switch/Slider/Breadcrumb/Steps/Pagination/Dropdown/List/Descriptions/Timeline/Progress/Skeleton/Alert/Tooltip/Popconfirm` Step1。
