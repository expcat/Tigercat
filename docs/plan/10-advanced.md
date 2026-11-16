# 10 高级组件

[路线图](../ROADMAP.md) · [范围与口径](00-scope.md) · [波次](14-waves.md) · [证据](13-evidence.md)

advanced 组 11 个组件（C159–C169），视觉与键盘全部 blocked。

## 目标

- 虚拟滚动的窗口能用键盘滚到后续行。
- 编辑器类组件的输入、粘贴和公告走 locale，不抛错。

## 非目标

- 不换编辑器内核。

## 依赖与顺序

- RichTextEditor 的引擎 `rich-text-engine.ts` 主责是 X01；C164-F04 的改动落在 `w9-data.ts`。

## 概览

本篇 22 条：P2 17、P3 5。
按波次：W6 17、W9 5。

已完成，记录在 [CHANGELOG.md](../../CHANGELOG.md)：C160-F04（S03）、C162-F03（S03）、C159-F01、C160-F01、C160-F02、C160-F03、C161-F01、C161-F02、C162-F01、C162-F02。

## 条目

### C159 CodeEditor

报告 `groups/advanced/CodeEditor.md`，队列状态 needs-evidence。另受 S01 影响。

| 编号     | 级别 | 波次 | 端  | 类别   | 条目                            | 验收                                                                            |
| -------- | ---- | ---- | --- | ------ | ------------------------------- | ------------------------------------------------------------------------------- |
| C159-F02 | P3   | W9   | Vue | 无障碍 | Vue 覆盖调用方 aria-describedby | 不包 FormItem 传 aria-describedby=hint，Vue textarea 仍为 hint；并存时含两个 id |

### C160 Drag

报告 `groups/advanced/Drag.md`，队列状态 needs-evidence。另受 S01 影响。

| 编号     | 级别 | 波次 | 端   | 类别   | 条目                                    | 验收                                                                     |
| -------- | ---- | ---- | ---- | ------ | --------------------------------------- | ------------------------------------------------------------------------ |
| C160-F05 | P3   | W9   | 双端 | 无障碍 | ul 根的直接子节点含 live 区域与预览 div | 渲染及拖拽中，ul 根的直接子节点只有 li，或根不再是 ul；live 区域仍能播报 |

### C161 FileManager

报告 `groups/advanced/FileManager.md`，队列状态 needs-evidence。另受 S01、S08 影响。

| 编号     | 级别 | 波次 | 端        | 类别 | 条目                                           | 验收                                                                                    |
| -------- | ---- | ---- | --------- | ---- | ---------------------------------------------- | --------------------------------------------------------------------------------------- |
| C161-F03 | P3   | W9   | 双端      | i18n | 英文字面量哨兵吞掉调用方 Empty folder 空文案   | zhCN 下把 fileManager.emptyText 设成 Empty folder、列表为空，空态显示 Empty folder      |

### C163 InfiniteScroll

报告 `groups/advanced/InfiniteScroll.md`，队列状态 needs-evidence。另受 S01、S03 影响。

| 编号     | 级别 | 波次 | 端        | 类别 | 条目                                      | 验收                                                                                             |
| -------- | ---- | ---- | --------- | ---- | ----------------------------------------- | ------------------------------------------------------------------------------------------------ |
| C163-F01 | P2   | W6   | Core+双端 | i18n | 错误与重试文案不走 locale，zh-CN 下仍英文 | zh-CN、error 为 true 且不传文案时错误与重试为中文；传 errorText=加载失败 时显示传入值            |
| C163-F02 | P2   | W6   | 双端      | 键盘 | container 滚动根无 tabindex，键盘滚不动   | root=container、无错误时根 tabindex 为 0 且有焦点样式，Tab 可聚焦滚动盒；默认视口根不加 tabindex |
| C163-F03 | P2   | W6   | Demo      | 示例 | Demo 01 描述写 3 条连拉填满，与源码不符   | 两端 infinite-scroll/01 的 demo.json 描述为 12 条、容器根、内容不满时不自动连拉                  |

### C164 MarkdownEditor

报告 `groups/advanced/MarkdownEditor.md`，队列状态 needs-evidence。另受 S01、S03 影响。

| 编号     | 级别 | 波次 | 端   | 类别 | 条目                                     | 验收                                                                                           |
| -------- | ---- | ---- | ---- | ---- | ---------------------------------------- | ---------------------------------------------------------------------------------------------- |
| C164-F01 | P2   | W6   | Vue  | 行为 | Vue 窄屏 split 缺编辑/预览窗格切换       | 窄屏、mode=split、showModeSwitch 与 toolbar 为 false 时 Vue 有编辑和预览按钮，点预览后预览出现 |
| C164-F02 | P2   | W6   | Vue  | 行为 | Vue bind 目录按钮误聚焦页面其他 textarea | 编辑器前有 id=other 的 textarea（选区 3）时点目录按钮，焦点进编辑器，other 选区仍为 3          |
| C164-F03 | P2   | W6   | Vue  | 行为 | Vue 组合输入期间仍执行格式热键           | value 为 hello、选区 0 到 5，compositionstart 后按 Ctrl+B，Vue 不发出变更，与 React 一致       |
| C164-F04 | P3   | W9   | Core | 行为 | htmlToMarkdown 缺 b、i 映射，只剩文字    | 粘贴 \<b>bold\</b>\<i>item\</i>\<strong>s\</strong> 后 b、i 带粗斜体标记，不是纯文字           |

### C165 PrintLayout

报告 `groups/advanced/PrintLayout.md`，队列状态 needs-evidence。另受 S01、S08 影响。

| 编号     | 级别 | 波次 | 端   | 类别 | 条目                                            | 验收                                                                                     |
| -------- | ---- | ---- | ---- | ---- | ----------------------------------------------- | ---------------------------------------------------------------------------------------- |
| C165-F01 | P2   | W6   | Core | 样式 | 白纸上页眉页脚用次级文字色，暗色下对比约 1.47:1 | .dark 下页眉、页脚、分页符标签文字色不随 --tiger-text-secondary 变浅，与正文同为纸面墨色 |
| C165-F02 | P2   | W6   | 双端 | 行为 | bind 页码预览纸高边距算错且会进打印             | landscape、bind.contentHeightMm=250 时预览至少 2 页，预览节点带 print:hidden             |

### C167 RichTextEditor

报告 `groups/advanced/RichTextEditor.md`，队列状态 needs-evidence。另受 S01 影响。

| 编号     | 级别 | 波次 | 端   | 类别 | 条目                                             | 验收                                                                                        |
| -------- | ---- | ---- | ---- | ---- | ------------------------------------------------ | ------------------------------------------------------------------------------------------- |
| C167-F02 | P2   | W6   | 双端 | i18n | 链接表单占位写死 https://，打开后不聚焦输入框    | zh-CN、不传 onRequestUrl 时触发链接表单，placeholder 为「输入链接地址」且活动元素是该 input |
| C167-F03 | P2   | W6   | Core | 行为 | plain 模式受控回写后编辑区仍残留 strong 等格式   | mode=plain、编辑区含 strong 段落、受控值回写 Hello world 后，innerHTML 不再含 strong        |
| C167-F04 | P2   | W6   | Core | 行为 | 只有图片的内容被判为空，placeholder 仍盖在图片上 | 正文只有 img 并传 placeholder 时 isContentEmpty 为 false、不显示占位；空段落仍算空          |
| C167-F05 | P2   | W6   | Core | i18n | 图片粘贴被拒的 live 公告写死英文，不走 locale    | locale 为 zh-CN 时粘贴被拒图片，live region 文本为中文拒绝文案，不含 Image was not pasted.  |
| C167-F06 | P2   | W6   | Vue  | 行为 | Vue 内部 onKeydown、onBlur 盖住调用方            | 给 Vue RichTextEditor 传 keydown、blur、paste、click 监听后四个计数都为 1，内部热键仍生效   |
| C167-F07 | P2   | W6   | Core | 行为 | HTML 转 markdown 时图片 alt 丢失                 | alt 在 src 前或后的 img 转 markdown 后，方括号内都保留 alt 文本                             |

### C168 VirtualList

报告 `groups/advanced/VirtualList.md`，队列状态 needs-evidence。另受 S01 影响。

| 编号 | 级别 | 波次 | 端  | 类别 | 条目 | 验收 |
| ---- | ---- | ---- | --- | ---- | ---- | ---- |

### C169 VirtualTable

报告 `groups/advanced/VirtualTable.md`，队列状态 needs-evidence。另受 S01 影响。

| 编号     | 级别 | 波次 | 端        | 类别 | 条目                                           | 验收                                                                                  |
| -------- | ---- | ---- | --------- | ---- | ---------------------------------------------- | ------------------------------------------------------------------------------------- |
| C169-F02 | P2   | W6   | 双端      | 行为 | overscan 没有传进行窗口，纵向始终按默认 5 渲染 | 200 行、行高 40、容器高 160 时，overscan 0 与 20 渲染的行数不同（不再都是 9 行）      |
| C169-F03 | P2   | W6   | Core+双端 | 文档 | virtualItemHeight 默认写 48 实为 40            | 不传 virtualItemHeight 时行内联 height 与类型注释、生成 Props 页的 Default 是同一个数 |
| C169-F04 | P2   | W6   | 双端      | 行为 | pagination 两端不一致，React 写死关闭          | 30 行、pageSize 5、容器高 400、行高 40 时两端渲染行数与是否出现分页导航一致           |
| C169-F05 | P3   | W9   | Core      | 文档 | 注释称缺行身份不参与选择，实际发 fallback key  | 两处注释写明缺 id 的行选择 key 是 tiger-row:索引 形式的 fallback，选择行为不变        |

### 没有新增条目的组件

报告没有给这些组件立新的编号。右列是并入的既有条目，修那些条目时要在这里复验。

| 任务 | 组件           | 报告                                | 并入的条目    |
| ---- | -------------- | ----------------------------------- | ------------- |
| C166 | PrintPageBreak | `groups/advanced/PrintPageBreak.md` | S02、C165-F01 |
