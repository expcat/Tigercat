# Tigercat 2.4.2 → 2.5.0 迁移指南

v2.5.0 是工作流一流完整版（minor），不是 2.4.2 的补丁。允许有计划的行为变化；无新必填 prop。完整条目见 [CHANGELOG.md](../CHANGELOG.md#v250)。索引见 [MIGRATION.md](MIGRATION.md#v250)。

不是 BPMN / Flowable / Camunda。组织 / 租户 / 字典不进主包。

## 兼容期（可先不改）

| 2.4.2 写法              | 2.5.0 行为                                                                                                        |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------- |
| 单数 `actor`            | 继续可读。非空 `actors[]` 优先。                                                                                  |
| 省略 `buttonPolicy`     | 仍用 2.4.2 默认按钮集：同意 / 拒绝 / 转交 / 撤回 / 评论。不含加签、退回、退回修改。                               |
| 省略 `tasks[]`          | `reduceWorkflowAction` 走节点级写回（与 2.4.2 同意糊整节点相同）。Viewer / Timeline 仍用 `actors` + 节点 status。 |
| 省略 `fieldPermissions` | 发起态未映射字段可编辑；审批/只读态未映射字段只读。                                                               |
| 省略 `approverPolicy`   | 展示仍读 `actor` / `actors`。解析组织是宿主的事。                                                                 |
| Designer `path`         | 语义不变：只编辑该节点 children 并回写整树。                                                                      |

默认视觉不会无迁移地改到不可用。缺省 ActionBar 仍是 2.4.2 那五个动作。

## 有计划的行为变化

### `commentRequired` 会拦住提交

2.4.2：`commentRequired` 只换确认文案 / aria，空意见仍发 `onAction`。

2.5.0：空意见 **不发** `onAction`。决议顺序：

1. 单项 `commentRequired`
2. 条级 `commentRequired`
3. 缺省：`reject` / `return` / `request_changes` 必填

宿主若依赖「拒绝空意见也能过」，显式 `commentRequired: false`（条或该项）。

### 新 action 字面量

`WorkflowTimelineAction` 增加：

- `addsign` — 前加签 / 后加签；确认层选 before / after
- `return` — 退回选节点；需 `returnTargets` 或 `renderReturnPicker` / `#returnPicker`，否则按钮禁用
- `request_changes` — 退回修改后再审（与 `reject` 分词；locale 固定）

`onAction(item, payload?)` 第二参推荐带齐扩展字段（均可选）：

```ts
{
  comment?: string
  assignee?: WorkflowTimelineActor
  assignees?: WorkflowTimelineActor[]
  position?: 'before' | 'after'
  signMode?: WorkflowSignMode
  targetNodeKey?: string
  resume?: 'resequence' | 'direct'
  taskId?: string
  actorId?: string | number
}
```

只读 `comment` 的 2.4.2 回调仍然合法。

完整演示集用 `FULL_WORKFLOW_BUTTONS` / `createFullWorkflowButtonPolicy()`。不要把完整集误当成省略 `buttonPolicy` 时的默认。

### `tasks[]` 与节点级写回

有 `tasks[]` 时，同意写到**当前用户任务**（会签 N/M），不以节点一次糊完。

```ts
import { reduceWorkflowAction } from '@expcat/tigercat-core'

const next = reduceWorkflowAction(instance, {
  action: 'approve',
  actorId: currentUser.id,
  comment: '同意'
})
```

Viewer / Timeline 传入同一份 `tasks` 才会按人分行。

### `buttonPolicy` / `fieldPermissions` / `approverPolicy`

```ts
step.buttonPolicy = {
  buttons: [
    { action: 'approve', enabled: true, placement: 'bar' },
    { action: 'reject', enabled: true, placement: 'bar', commentRequired: true },
    { action: 'addsign', enabled: true, placement: 'more' },
    { action: 'return', enabled: true, placement: 'more', commentRequired: true }
  ],
  addsign: { positions: ['before', 'after'] },
  returnResume: 'resequence'
}

step.fieldPermissions = {
  reason: 'editable',
  amount: 'readonly',
  costCenter: 'hidden'
}

step.approverPolicy = { type: 'role', key: 'finance-approver' }
```

`ApproverSource` 只存引用。`role` / `group` / `dept_leader` / `manager_chain` 由宿主 `resolveApprovers(source, ctx) => Actor[]` 解析。Tigercat 不提供通讯录组件。

字段权限派生：

```ts
import { applyWorkflowFieldPermissions } from '@expcat/tigercat-core'

const formSchema = applyWorkflowFieldPermissions(
  initiateSchema,
  currentStep.fieldPermissions,
  'approve' // initiate | approve | readonly
)
```

详情布局可用可选 `WorkflowDetailShell`（header / form / tabs / sticky action）。Admin 演示壳在后续切片，不在本库发版范围。

### Designer

选中节点后右侧 Inspector 四 Tab：审批人 / 操作按钮 / 表单权限 / 高级。画布仍是摘要卡 + 节点间 `+`。不是 Canvas 与 Inspector 两套互斥 API；现有 `v-model` / `value`+`onChange` 与 `path` 不变。

## Deprecation（2.6 可能移除）

文档标明：2.6 可能移除「仅节点级同意」的隐式行为。会签 / 或签 / 依次请改用 `tasks[]`，不要依赖「点一次同意就把整节点标通过」。

2.5.0 兼容期内：

- 无 `tasks` 的 JSON 继续节点级写回
- `actor` 继续可读
- 省略 `buttonPolicy` 继续 2.4.2 默认按钮集

## 不改的边界

- 不嵌入 Flowable / Camunda / Activiti
- 不进 BPMN 2.0 XML
- 不第二套 Timeline / Menu
- 不把组织 / 租户 / 字典做成 Tigercat 组件
- 不把 SchemaForm 做成飞书式表单设计器
