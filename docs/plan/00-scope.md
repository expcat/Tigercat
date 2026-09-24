# 00 范围

彻底重构，禁止补丁。条目一次做到新结构：不留弃用别名、双写 prop、运行时兼容分支，或只改半边行为的收尾。每个改到的组件，同一批同步 `skills/tigercat` 与 `examples`。测试只在本地跑，不写入 CI / workflow。

本目录是 3.0 的执行计划。审查结论在仓库同级的 `tigercat-review-v3/`（不在本 git 仓库内）。优化与增强的正文留在那里，这里只排期、给验收、定顺序。

## 目标

- 用一份 token、请求级主题 / 文档 / locale、静态布局、core 内的一份逻辑，收口 Vue 与 React。
- 默认路径上会注入、写错数据、走错已发布工作流、或让发布物不可信的问题，全部重写掉。
- 键盘、方向、水合、叠层和标配能力同样排期，不丢进「以后再说」。
- 每改一个组件，skill 与 examples 同时改到新 API。
- 终点是 `3.0.0-preview.1`。

## 非目标

- 正式 Release，以及为了发出 Release 而保留的兼容层。
- BPMN / Flowable / Camunda，第二套 Menu 或 Timeline。
- 把租户、组织、部门、岗位、字典做成库组件。登录页和 404 继续用 Basic 的 Result。
- 人机验证码组件。一次性口令格是 T03 O6，不是图片验证码。
- Dock。PrimeVue 有；Ant Design、Element Plus、Mantine、Naive UI 不把它当基础组件。
- 独立 TimeSelect。Element Plus 的 TimeSelect 是离散时刻列表；本库用 TimePicker，吸附和禁用整段由 T04 E2 覆盖。
- 把 React peer 从 `^19.0.0` 下探到 18。现行 `packages/react` 的 peer 已是 React 19。Ant Design 5 仍声明支持 React 18，那是他们的双版本矩阵；3.0 保持单一 React 19 peer。
- headless 开关与带样式组件并列。无样式扩展走 T01 E5、E6 的语义类和 part / state，不另加 `unstyled` prop。
- CI / workflow 运行测试或全量 `quality:release`。

原路线图里的长期观察项按上表改判完毕，不再单设「不绑定版本」的观察节。要做的两项追加任务见 [01 地基](01-foundation.md) 的 OBS-1、OBS-2（行内编辑、复制按钮）。图表轴与提示共享比例尺由 T09 E1、E3、E4 覆盖。

## 编号

| 写法 | 位置 |
| --- | --- |
| `T01`…`T12` | 审查模块，见下表 |
| `T03 O4` | `tigercat-review-v3/02-optimizations/` 里该模块文件的 O4 |
| `T11 E1` | `tigercat-review-v3/03-enhancements/` 里该模块文件的 E1 |
| `F331` | `tigercat-review-v3/01-findings/` 中的全局编号（F1–F364，文件按步骤分段） |

模块编号只在该模块文件内从 1 计。`T01 O1` 与 `T02 O1` 不是同一条。

| 模块 | 审查文件词干 | 优化 | 增强 | 计划落点 |
| --- | --- | ---: | ---: | --- |
| T01 | `core-foundation` | 21 | 13 | `01-foundation.md` |
| T02 | `basic` | 15 | 10 | `01-foundation.md` |
| T03 | `form-basics` | 27 | 8 | `02-forms.md` |
| T04 | `form-advanced` | 31 | 12 | `02-forms.md` |
| T05 | `feedback` | 21 | 10 | `03-feedback.md` |
| T06 | `layout` | 23 | 13 | `04-layout.md` |
| T07 | `navigation` | 23 | 14 | `05-navigation.md` |
| T08 | `data-table` | 23 | 16 | `06-data-table.md` |
| T09 | `charts` | 21 | 13 | `08-charts.md` |
| T10 | `advanced` | 15 | 8 | `07-virtual.md`, `09-editors.md` |
| T11 | `composite-admin` | 20 | 9 | `10-composite.md` |
| T12 | `tooling` | 13 | 6 | `11-tooling.md` |

合计优化 253、增强 132。T02 没有单独成篇：基础组件和协议门、代码 token、水印、二维码写在 [01](01-foundation.md)，避免从清单里漏掉。T10 的窗口算术在 [07](07-virtual.md)，编辑器与画布在 [09](09-editors.md)。

## 波次

波次是派工标签，不是全局锁。硬依赖见 [13 波次](13-waves.md)。同一条优化或增强只出现在一个落点文件的一张任务表里。

| 波次 | 名称 | 条数 | 优化 | 增强 |
| --- | --- | ---: | ---: | ---: |
| W0 | 地基单源 | 9 | 9 | 0 |
| W1 | 原语 | 12 | 12 | 0 |
| W2 | 协议门、记录与发布安全 | 16 | 16 | 0 |
| W3 | 表单基础 | 27 | 27 | 0 |
| W4 | 表单复杂与树 | 33 | 33 | 0 |
| W5 | 复合正确性 | 16 | 16 | 0 |
| W6 | 虚拟窗口与读对数据 | 22 | 22 | 0 |
| W7 | 反馈浮层 | 21 | 21 | 0 |
| W8 | 其余组件重构 | 97 | 97 | 0 |
| W9 | 模块增强 | 123 | 0 | 123 |
| W10 | 开箱壳与发布面 | 9 | 0 | 9 |

W11 是收口，不占上表条数：迁移终稿、本地全量验证、打 `3.0.0-preview.1`。另有 OBS-1、OBS-2 两条观察项改判，记在 01 与 [12](12-enhancements-backlog.md)，不计入 132。

## 验收总则

下列条款适用于每一行任务：

1. 行为按该条优化或增强的正文落地，两端一致，逻辑在 core。
2. 本地测试覆盖这条行为。命令按仓库 `tests/README.md` 的改动范围来选。测试不进入 workflow。
3. 改到的组件同步 `skills/tigercat`（含引用）和 `examples`。生成物只重跑生成器。
4. 公开名字的增减先改 `scripts/lib/public-components.mjs`，再生成 CLI 白名单、文档 slug、测试组和 exports 检查。
5. 不新增弃用别名，不保留双写 prop。

## preview.1

`3.0.0-preview.1` 表示本目录全部任务（253 + 132 + OBS-1 + OBS-2）已经完成，并且：

- `docs/MIGRATION-3.0.md` 已按 [14](14-migration.md) 收成总结式终稿，`MIGRATION.md` 有索引。
- 本地测试通过。
- 本地静态检查通过：导出同步、基线 diff、文档 diff、`publish:check`。
- 发布脚本满足 [11](11-tooling.md) 的安全条件后，打 tag `v3.0.0-preview.1`。

正式 Release 不在本目录。preview 交给引用库验证，再由人工指挥。
