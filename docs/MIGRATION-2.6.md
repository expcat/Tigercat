# Tigercat 2.5.4 → 2.6.0 迁移指南

v2.6.0 是体验完善 minor：DetailShell 一流粘底配方 + Designer 纵向流程画布观感。无新必填 prop。不是 BPMN / Flowable / Camunda。完整条目见 [CHANGELOG.md](../CHANGELOG.md#v260)。索引见 [MIGRATION.md](MIGRATION.md#v260)。

## 兼容期（可先不改）

| 2.5.x 写法                          | 2.6.0 行为                                                                                  |
| ----------------------------------- | ------------------------------------------------------------------------------------------- |
| DetailShell 不设高度                | 根 class 增加 `h-full`。父级高度为 auto 时百分比高度仍按 CSS 回落为内容高，观感接近 2.5.x。 |
| DetailShell `className="h-[32rem]"` | 仍可用。推荐改成父级有界高度 + 壳 `h-full` / `flex-1 min-h-0`。                             |
| Designer 未选中时无右侧面板         | **Inspector 列始终在**；未选中显示 `inspectorEmpty`（locale 已有）。不是新必填 prop。       |
| 「在后方插入」按钮可见文案          | 可见字形改为 `+`；**可访问名不变**（`Insert after (Title)` / `在后方插入 (标题)`）。        |
| ActionBar `flex-wrap`               | 改为 `flex-nowrap overflow-x-auto`。窄屏横向滑，不再折到第二行。                            |

无新必填 prop。JSON 树、Inspector 四 Tab、`validateWorkflowDesigner`、`path` 语义不变。

## 推荐改法

### DetailShell：宿主给有界高度

```vue
<div class="flex min-h-0 flex-1 flex-col">
  <WorkflowDetailShell class="h-full min-h-0">
    <!-- header / form / tabs / action -->
  </WorkflowDetailShell>
</div>
```

```tsx
<div className="flex min-h-0 flex-1 flex-col">
  <WorkflowDetailShell className="h-full min-h-0" form={form} tabs={tabs} action={bar} />
</div>
```

不要写 `h-[calc(100dvh-20rem)]`。壳自己是 flex 列：body 滚、action 钉底。

### Designer

打开即是左画布 + 右 Inspector。无需新 prop。若曾依赖「未选中时没有 Node settings region」，改为读空态文案或等 `select` 后再填表单。
