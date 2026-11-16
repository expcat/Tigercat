# 13 证据补采与复验

[路线图](../ROADMAP.md) · [范围与口径](00-scope.md) · [波次](14-waves.md) · [证据](13-evidence.md)

审查的总状态是 needs-evidence。3364 个视口格（841 个 Demo × 桌面 / 窄屏 × 亮 / 暗）里，大部分没有浏览器证据。很多条目的依据只有源码和 happy-dom。这一篇排的是补证据的活，不改组件代码。

| 状态    | 视觉 | 键盘 |
| ------- | ---: | ---: |
| pass    |  370 |  348 |
| finding |  174 |  136 |
| fail    |   12 |   24 |
| partial |   12 |    0 |
| blocked | 2772 | 2832 |
| pending |   24 |   24 |

数字来自 `project/final-acceptance.md`，最后一轮没有重跑。队列里 34 项 complete、160 项 needs-evidence。

## 目标

- blocked 和 pending 的格子有真实浏览器的截图与按键记录。
- 只有源码或 happy-dom 证据的条目，在修之前先在浏览器里复现一次。
- 审查目录里断掉的链接和没填的索引补上，下一轮能直接用。

## 非目标

- 不新增图片对比基线。E2E 只做功能断言。
- 不重审已经 complete 的任务。
- 不在这一篇里改组件代码。补证据时发现新问题，编号后登记到 02–12 对应的表。

## 任务

审查目录 `.local/review/2026-11-05/` 不在 git 里，下面的路径都相对它。

| 编号 | 波次 | 条目                                                                                                                                                       | 验收                                                                                                                 |
| ---- | ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| E01  | W10  | 重跑 blocked 格：视觉 2772、键盘 2832。隐藏 IAB 环境恢复后，按下面「各组件证据现状」逐组件补                                                               | 每个组件的 `matrix.csv` 里没有 blocked；补到的格要么 pass，要么关联到已有或新立的编号                                |
| E02  | W10  | 清掉 24 格 pending（视觉、键盘各 24）                                                                                                                      | `final-acceptance.md` 的 pending 行为 0                                                                              |
| E03  | W10  | Affix 16 格视觉和键盘全部 blocked，整组没看过                                                                                                              | Affix 的 16 格有截图和按键记录，并覆盖已修复的固定尺寸更新与偏移重绑通知                                             |
| E04  | W10  | picsum.photos 被区域封锁：Card 03/04 封面 16 格 blocked（iframe 内 `naturalWidth=0`），AspectRatio 01/03、ImageCompare 的 Demo 也用这个图源                | 这些 Demo 在连不上外网图源时仍能出图，16 格有封面维度的结论                                                          |
| E05  | W10  | RTL 没有实测：Card、Carousel 的冻结协议要求 RTL 渲染和方向键，两个 Demo 都没设 RTL                                                                         | 两个组件在 `dir=rtl` 下有截图和方向键记录；[12](12-tooling-docs.md) 的 X07-F02 据此核对                              |
| E06  | W10  | 真实读屏输出和 hover 悬停帧不在已有证据里                                                                                                                  | 标了「读屏未测」的 P1 条目各有一次读屏记录；Tooltip、Text 04 等依赖 hover 的格有悬停帧                               |
| E07  | W10  | 断掉的证据链接：`groups/form/Upload.md` 指向不存在的 `evidence/form/Upload/verification.json`；`groups/basic/ConfigProvider.md` 引用的两张截图文件名对不上 | 两份报告里的证据链接都能打开                                                                                         |
| E08  | W10  | `FINDINGS.md` 的索引表只到 C092（291 个编号），C093 之后和 X03–X07 只在「后续分析输入」里有摘要行；C093 DropdownItem 队列写主责 2，`primaryTask` 实为 0    | 索引表覆盖全部 564 个编号，每个编号链到主报告的锚点；C093 的主责数改对                                               |
| E09  | W10  | 只有源码或 happy-dom 证据的条目在真实浏览器复验。form、navigation、feedback、data、charts、advanced、composite 七组和 layout 的大部分属于这种情况          | 每条在开工时附一次浏览器复现；复现不了的在这里登记原因，再决定撤回还是改判                                           |
| E10  | W10  | 九份组目录 README 的「组级关联发现」都还是空的占位                                                                                                         | 按 [CHANGELOG.md](../../CHANGELOG.md) 里已完成的共性根因，以及各篇「波及多个组件的条目」回填，组级验收不再是 pending |
| E11  | W10  | 复核下面的未立项观察                                                                                                                                       | 每条要么编号后登记到 02–12 对应的表，要么写明不立项的理由                                                            |

E04 的出图方式（换本地图源还是别的办法）开工时定，改 Demo 属于 [12](12-tooling-docs.md) 的范围。

## 各组件证据现状

「队列」取自 `QUEUE.md`；「现状」是各报告对自己证据的说明，原文更细。

### basic

| 任务 | 组件           | 队列           | 现状                                                                                                                                                                                                                 |
| ---- | -------------- | -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| C001 | ConfigProvider | complete       | 8 格：视觉 6 finding（F005）/2 pass；键盘主路径 8 pass；27 张截图；测试 65 用例、a11y 49 用例通过；无 DOM SSR 通过，非 Next/Nuxt 构建                                                                                |
| C002 | Icon           | complete       | 视觉 16 pass / 8 finding（均 C002-F003）；键盘 24/24 pass；Avatar 组合 2/2 pass；66 项测试通过；未跑 hydration/E2E；forced-colors 未测                                                                               |
| C003 | Text           | complete       | 主责 32 格视觉 16 pass / 8 finding / 8 blocked，键盘 24 pass / 8 blocked；关联 8 pass / 40 blocked；31 项 spec 通过；04 tooltip、剪贴板仍阻塞                                                                        |
| C004 | Button         | complete       | 24 格：视觉 20 pass/4 finding（Vue 01，F002）/0 blocked；键盘 24 pass；160 图；测试 80 通过；F001 浏览器未复现；X01-F002 仅 SSR；对比度、读屏未验证                                                                  |
| C005 | Avatar         | complete       | 视觉 32 格：20 pass/12 finding/0 blocked；键盘 32 pass；184 图亲看；测试 41 passed；SSR 完成，hydration 未测；F001 无浏览器 AX；读屏未验证                                                                           |
| C006 | AvatarGroup    | complete       | 适用 18 格/120 图均亲看；03 的 8 格沿用 Avatar 证据，04 的 8 格无新增；键盘主路径有证据，React fixture Shift+Tab 超时 partial；测试 55 通过；hydration、读屏未测                                                     |
| C007 | Badge          | complete       | 主责 24 格：视觉 8 pass/16 finding（均 F04）/0 blocked；键盘 24 pass；136 图亲看；6 个关联消费 Demo 真实验证 0/6；测试 42 通过；hydration、实际对比度、读屏未测                                                      |
| C008 | ButtonGroup    | complete       | 两端 button/03 共 8 格已展示状态视觉/Tab 均 pass（复用 C004 的 48 图）；组内 disabled/loading 各 8 格 blocked（Demo 无入口）；测试 81 通过；hydration、读屏未测                                                      |
| C009 | Code           | complete       | 视觉 32/32 pass；键盘主路径 32/32 pass；312 图亲看；剪贴板 payload 读回 32 格 blocked；测试 86 通过；无专属 E2E；父页 DOM 截断；复制失败路径、长行软换行未覆盖                                                       |
| C010 | CopyButton     | complete       | 视觉 8/8 pass；键盘 8/8 pass；112 图亲看；测试 6 项通过（无 axe）；无专属 E2E；F001/F002 仅 SSR/happy-dom；disabled、slot、失败入口、读屏播报、payload 读回未验证                                                    |
| C011 | CropUpload     | complete       | 视觉 16/16 pass；已执行键盘主路径 16/16 pass；测试 95/97 过（2 败指向 F001）；4 Demo SSR 成功；未跑 E2E/hydration；读屏、禁用态、裁剪像素未测；16 份初拍 DOM/AX 被覆盖                                               |
| C012 | Divider        | complete       | 视觉 32/32 pass；整体键盘 32/32 finding（同一 C012-V01）；19 项测试通过；28 个 SSR 输出成功；未跑 E2E/hydration；读屏未测；双端 02/03 共 16 格原图未含主 h1（已披露）                                                |
| C013 | Empty          | complete       | 视觉 24 pass / 0 blocked（11-13 补拍后）；键盘 20 pass / 4 finding（C013-V01）；测试 96/96 通过；未跑 SSR/hydration、E2E；forced-colors 未测                                                                         |
| C014 | Gallery        | complete       | 主责 8 格：视觉 4 pass / 4 finding，键盘 4 pass / 4 finding，0 blocked；120 关联格 pending；历史测试 54 项通过；无 Gallery.spec/E2E；未跑 SSR；未切语言                                                              |
| C015 | Highlight      | needs-evidence | 画面 20 pass / 4 finding；键盘 16 pass / 8 blocked（03 八格 Enter 后到 chrome-error，外站终态未验证）；52 测试通过；6 Demo SSR 完成；未跑 E2E                                                                        |
| C016 | Image          | complete       | 主责 48 格：视觉 36 pass / 12 finding，键盘 28 pass / 20 finding，无 blocked；80 关联格 pending；193 测试通过；未跑 E2E、hydration；悬停、故障注入、切语言未测                                                       |
| C017 | ImageCompare   | complete       | 40 格：视觉 24 pass / 16 finding / 0 blocked；键盘 32 pass / 8 finding / 0 blocked；67 项测试通过；F01/F02 未动态复现；未跑 SSR、E2E、触控、数值对比度                                                               |
| C018 | ImageCropper   | complete       | 32 格：视觉 24 pass / 8 finding，键盘 8 pass / 24 finding，0 blocked；181 项测试通过；F01–F04 未浏览器复现；未跑 E2E、SSR/hydration、读屏、导出像素比对                                                              |
| C019 | ImageGroup     | complete       | 普通 16 格视觉、键盘各 8 pass / 8 finding；r1 回退 8 格各 4 pass / 4 finding，0 blocked；37 项测试通过；未跑 E2E、SSR；组级固定索引未浏览器验证                                                                      |
| C020 | ImagePreview   | complete       | 主责 24 格：视觉、键盘各 8 pass / 12 finding / 4 blocked；关联 48 格键盘 24 finding / 24 pending；156 项测试通过；无 E2E；Demo03 第二图与下载后路径缺证据                                                            |
| C021 | Inplace        | complete       | 主路径 8 格：视觉、键盘各 0 pass / 8 finding / 0 blocked；四桌面格页面起点纯键盘入口 blocked 未验证；2 项既有测试通过（无 axe 调用）；无 E2E；F02 未做原生 IME 复现                                                  |
| C022 | Kbd            | needs-evidence | C022-F01/F02 已修复。组合改为可见文本，空内容与注释 slot 不留尾随分隔符；双端 spec 启用 aria-prohibited-attr 后通过。键盘仍 blocked，读屏未测                                                                        |
| C023 | Link           | needs-evidence | C023-F01 已修复，F02 此前已修。禁用说明改为移除 href 且不可聚焦；反斜杠跨站地址此前已拒绝。键盘 16 格仍 blocked（外站终态未验证），页面起点未验证；无 E2E                                                            |
| C024 | Marquee        | complete       | C024-F01/F02/F03 已修复。Demo02 改为 end，受控由 Pause/Play 控制、焦点不暂停；子层更新后复制段为 [1,1]；再开 pauseOnFocus 后仍运行。11-13 补采视觉 32 pass，键盘 finding 为当时的 F01；无 E2E                        |
| C025 | QRCode         | complete       | C025-F01/F02/F04/F05 已修复（F03 此前 S02 完成）。刷新按钮不再包在图像角色里；显式 aria-label 保留并附状态；token 覆写后对比为 1:1；滚到容器底部高亮末节。修复前视觉 32 格 28 pass / 4 finding；读屏、独立扫码未执行 |
| C026 | Rate           | complete       | C026-F01/F02/F03/V02/V03 已修复。视觉 24 格 10 pass / 14 finding / 0 blocked；键盘 8 pass / 16 finding / 0 blocked；29 项 spec 通过；SSR 探针已跑；无 E2E；读屏、精确半星命中未测                                    |
| C027 | Result         | complete       | C027-F02 已修复（F01 此前 S11 完成）。2026-11-13 二次补采：视觉 24 pass / 0 blocked；键盘 16 pass / 8 not-applicable（Demo02 无可聚焦控件）；48 项 spec 通过（未重跑）；SSR 探针已跑；读屏未执行                     |
| C028 | Segmented      | complete       | C028-F01/V01/V02 已修复。38 项 spec（含 axe）与 types:check 通过；DOM/Provider RTL、两套暗色 token 和窄屏几何回归通过。IAB 不可用，待人工视觉复验；读屏未测                                                          |
| C029 | SplitButton    | needs-evidence | C029-F01/F04 已修复（F02/F03 此前已修）。Fragment SSR/DOM、首项键盘焦点样式通过；312 项 spec（含 axe）、types:check 通过。IAB 不可用，待人工视觉复验；历史 r4 失败保留，禁用点击与第二次 Tab 去向仍缺证；读屏未测    |
| C030 | Statistic      | complete       | C030-F01/F02/F03 已修复。49 项 spec（含 axe）与 types:check 通过；双端 SSR 终值、科学计数法与 happy-dom 水合、React 零节点通过。既有视觉 24/24 pass、键盘 pass；本次未做浏览器复验，StrictMode 动画专项未测          |
| C031 | Tag            | complete       | C031-F01/F02 已修复。24 项 spec（含 axe）与 types:check 通过；双端 Enter/Space 各通知一次 false，父级隐藏；显式 Remove Alpha 正常，文档/MCP 同步。既有视觉/键盘 32/32 pass；本次 DOM 验证，hydration、读屏未测       |
| C032 | Watermark      | complete       | C032-F01–F05 已修复。47 项 spec（含 axe）与 types:check 通过；Canvas/DOM 覆盖图片回退、内容更新和旧请求；文档/MCP 同步。既有视觉 24/24 pass、键盘 12 组 pass；本次未做浏览器复验，hydration、真实打印未测            |

### layout

| 任务 | 组件         | 队列           | 现状                                                                                                                                                                          |
| ---- | ------------ | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| C033 | AspectRatio  | complete       | C033-F01/F02 已修复；47 项 spec（含 axe）通过，IAB 不可用待视觉复验。既有视觉 8 pass / 16 图片 blocked（picsum 封锁）、键盘 24/24 pass；hydration、E2E、读屏未测              |
| C034 | Card         | complete       | F01/F02/F03/F05/F06 已修复；51 spec（axe）、类型/SSR 通过，文档/MCP 同步；IAB 不可用。旧视觉16 pass/16封面blocked、键盘16组pass；hover/href Enter/RTL/读屏/hydration/E2E 未测 |
| C035 | Carousel     | complete       | F01/F02/F03 已修复；45 spec（axe）、types:check 通过；happy-dom 验证受控释放与 slot 更新。IAB 不可用待复验；旧视觉 16/16、键盘 8/8 组 pass；RTL/hover/读屏/hydration/E2E 未测 |
| C036 | Col          | needs-evidence | F01 已修复；35 spec（双端 SSR）、types:check 通过；IAB 不可用，改用变量/CSS 断言。视觉/键盘 0/24 blocked（owner C046）；断点、offset/RTL/flex 几何及 hydration/E2E/读屏未测   |
| C037 | Container    | needs-evidence | 视觉 0/8 blocked、真实外壳键盘 0/8 blocked、截图 0（8 格 owner 均为 C042 Layout）；未跑 hydration、浏览器 E2E、读屏；Terra 运行时模型未独立核验                               |
| C038 | Content      | needs-evidence | F01 已修复；50 spec（双端 SSR/DOM）、types:check 通过；IAB 不可用，改用 href/id 断言。视觉/键盘 0/24 blocked（owner C042）；跳转点击、真实滚动及 hydration/E2E/读屏未测       |
| C039 | Descriptions | needs-evidence | F01/F02/F04/F05 已修复（F03 此前 S08 完成）；41 spec（双端 SSR/DOM/axe）、types:check 通过。本次未做浏览器复验；视觉/键盘 0/16 blocked、截图 0；hydration、读屏未测           |
| C040 | Footer       | needs-evidence | 视觉 0/16 blocked、外壳键盘 0/16 blocked、截图 0（owner 均为 C042）；未启动服务；未跑 hydration、浏览器 E2E、读屏、docs:links；无 Footer 专属 E2E                             |
| C041 | Header       | needs-evidence | F01 已修复。两端 layout/01 改为 blur 半透明顶栏，不再称未启用的 sticky。视觉/键盘 0/24 blocked、截图 0（owner 均为 C042）；hydration、浏览器 E2E、读屏未测                    |
| C042 | Layout       | needs-evidence | F01 已修复。生成笔记与 MCP 写 mode=horizontal，不再出现 direction=horizontal。视觉/键盘 0/32 blocked、截图 0；skip link、hydration、浏览器 E2E、读屏未测                      |
| C043 | List         | needs-evidence | F04/F05 已修复（F01–F03 此前已修）。两端 list/01 传入 hoverable；list/03 保存并回传 pageSize。视觉/键盘 0/40 blocked、截图 0；SSR 已跑，hydration、读屏、E2E 未执行           |
| C044 | Masonry      | needs-evidence | F01/F02/F03 已修复。最短列计入间距，探针第 4 项进第 1 列，列高 [201,102]。两端 01/03 用 shortest；02 宽屏 4 列与 16/24px。视觉/键盘 0/24 blocked；hydration、读屏、E2E 未执行 |
| C045 | Resizable    | needs-evidence | F01–F04 已修复。文档与 MCP 写未禁用角手柄进入 Tab。未设最大值时 aria-valuemax 等于当前值。style 320×180 时 right/bottom 为 320/180。根 aria-labelledby 保留手柄名。视觉/键盘 0/16 blocked；hydration、读屏、E2E 未执行 |
| C046 | Row          | needs-evidence | 视觉 0/24 blocked；键盘 0/24 blocked；截图 0；未执行新的 SSR/hydration、Example 构建、浏览器 E2E、读屏；Vue 属性更新探针为合成 DOM；Terra 两阶段只读复核完成但无图可审        |
| C047 | ScrollArea   | needs-evidence | F01–F06 已修复。hidden 或 nativeBars 且溢出时 viewport 有 tabindex、region 与名称，gutter 只跟自定义条；aria-describedby 与 aria-busy 进 viewport；Vue 字符串 tabindex=-1 保留；RTL 负值模型零点连续；已测量溢出时隐藏原生条；Demo02 写 axis。视觉/键盘 0/24 blocked、截图 0；E2E、读屏、hydration 未执行 |
| C048 | Sidebar      | needs-evidence | F01/F03 已修复。零宽折叠且调用方传入冲突属性时，根仍输出 inert、aria-hidden=true、tabindex=-1；Vue 展开态保留 tabindex=0，fullyHidden 仍为 -1。视觉/键盘 0/16 blocked、截图 0；E2E、读屏、hydration 未执行 |
| C049 | Skeleton     | needs-evidence | F01/F02/F03 已修复。preset=avatar 映射为 rounded-full w-10 h-10，显式 variant 优先。rows=8 为 6 条，rows=2.5 且 paragraph 为 2 条、末行 60%，Infinity 回退 1 条。loading 变 false 后保留 id、class、padding、aria-describedby 与点击。视觉/键盘 0/16 blocked、截图 0；E2E、读屏、hydration 未执行 |
| C050 | Space        | needs-evidence | 视觉 0/24 blocked；键盘 0/24 blocked；截图 0；28 个双端 SSR 输出与 TS 诊断已跑；hydration、E2E、全量构建、读屏未执行；C012 旧截图未重审，不计入 C050 pass                     |
| C051 | Splitter     | needs-evidence | 视觉 0/24 blocked；键盘 0/24 blocked；截图 0；双端 SSR 成功，hydration 未验证；E2E 未运行且无直接 Splitter 用例；docs:links 退出 1（均在 .local/review）                      |

### form

| 任务 | 组件            | 队列           | 现状                                                                                                                                                                                                               |
| ---- | --------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| C052 | AutoComplete    | needs-evidence | 视觉 0/24、真实键盘 0/24，24 blocked（隐藏 IAB browsers:[]）；截图 0、读屏 0；既有 78 项测试通过、6/6 Demo 离线编译；真实 Tab、水合、移动端浮层未执行                                                              |
| C053 | Cascader        | needs-evidence | 视觉与真实键盘 0/24，24 blocked（browsers=[]），截图 0；既有 46 项测试+custom-text 4 项通过，6/6 Demo 编译；无 Cascader 专属 E2E；水合、读屏、真实 IME 未执行                                                      |
| C054 | Checkbox        | needs-evidence | 视觉 32 blocked、真实键盘 32 blocked（browsers:[]），截图 0，读屏未执行；45 项既有测试通过、8/8 Demo 编译；有 happy-dom 与两端 SSR 探针；未跑浏览器/E2E                                                            |
| C055 | CheckboxGroup   | needs-evidence | Vue 12 格+React 12 格视觉与真实键盘全部 blocked（browsers:[]），截图 0；Group 相关 23 项测试通过；有 happy-dom 与 SSR 探针；未跑 E2E、Example 编译、读屏                                                           |
| C056 | ColorPicker     | needs-evidence | 视觉与真实键盘均 0/24 执行、24 blocked（browsers:[]），截图 0；既有 56 项测试通过；无独立 E2E；有 SSR 字符串与限定 axe 探针；hydration、读屏、原生 range、拖动未验证                                               |
| C057 | ColorSwatch     | needs-evidence | 视觉 0/24、真实键盘 0/24 执行，24 blocked（browsers=[]）；截图 0；既有 44 项测试通过；Node SSR 探针已跑，无 hydration；无独立 E2E；RTL 全路径、读屏未测                                                            |
| C058 | CronEditor      | needs-evidence | 视觉 0/16、真实键盘 0/16 执行，16 blocked（browsers=[]）；截图 0；既有 51 项测试及 locale 定向通过；SSR 探针无 hydration；无独立 E2E；只读选择器 happy-dom 回归通过，真实浏览器复验待补                            |
| C059 | DatePicker      | needs-evidence | 视觉 0/24、真实键盘 0/24 执行，24 blocked（browsers=[]）；截图 0；既有 49 项测试通过；SSR 探针无 hydration；无独立 E2E；尺寸继承与失焦通知 happy-dom 回归通过，真实浏览器复验待补                                  |
| C060 | Form            | needs-evidence | 视觉与键盘均 0/32，32 blocked（browsers:[]）；截图 0、主责 Demo 操作 0/8；Form 相关 373 项测试通过；未记录 E2E、SSR 执行；外部 controller debounce、挂载选项与切换订阅 happy-dom 回归通过，真实浏览器复验待补      |
| C061 | FormItem        | needs-evidence | 视觉/键盘 0/32 blocked，截图 0；无独立 Demo（8 个组合 Demo owner=C060）；387 项测试通过；SSR 已跑，无水合/读屏/E2E；controller 迁移、改名清理、无名 checked 与 extra 关联 happy-dom 回归通过，真实浏览器复验待补   |
| C062 | Input           | needs-evidence | 视觉/真实键盘 0/40 blocked，截图 0；既有定向 143 项、a11y 131 项通过；SSR 无 hydration；本轮 Vue Input 与 Demo 探针 74 项通过，原生 readOnly=true、可聚焦且输入后保持「只读」；真实浏览器复验待补                  |
| C063 | InputGroup      | needs-evidence | 视觉/键盘 0/32 blocked，截图 0；真实页面 0/8；按钮尺寸继承与显式/ButtonGroup 优先级 happy-dom 回归通过，双端定向测试 225 pass；稳定 host 文档同步检查通过；真实浏览器复验待补                                      |
| C064 | InputGroupAddon | needs-evidence | 视觉 0/32、键盘 0/32 全 blocked，截图 0（IAB browsers: []）；真实页面 0/8；定向测试 5 passed/19 skipped；Node SSR 探针完成；无读屏与计算样式验收                                                                   |
| C065 | InputNumber     | needs-evidence | 视觉/真实键盘 0/24 blocked，截图 0；本轮必填 ARIA 继承与显式覆盖、React SSR 0 一致性回归通过，双端定向测试 240 pass；文档/MCP 生成及类型检查通过；真实浏览器、读屏与 InputNumber hydration 复验待补                |
| C066 | InputOTP        | needs-evidence | 视觉 0/24、键盘 0/24 全 blocked，截图 0（IAB browsers: []）；定向测试 48 pass；SSR+happy-dom 探针；未跑 E2E、全仓测试、完整构建、读屏、hydration                                                                   |
| C067 | MaskInput       | needs-evidence | 视觉 0/24、键盘 0/24 全 blocked，截图 0（IAB browsers: []）；raw 规范化、受控/默认值/FormItem 原生提交与受控拒收 happy-dom 回归通过，双端定向测试 43 pass；类型检查通过；真实浏览器、读屏与 hydration 复验待补     |
| C068 | Mentions        | needs-evidence | 视觉/键盘各 0/24 blocked，截图 0；长度上限、Vue 首挂高度与合法 textarea 语义 happy-dom 回归通过，双端 44 pass（含未豁免 axe）；类型检查通过；真实浏览器、读屏与 hydration 待补                                     |
| C069 | NumberKeyboard  | needs-evidence | 视觉、键盘各 0/24 执行、24 blocked，截图 0；C069-F01–F05 happy-dom 回归通过，NumberKeyboard（含 Core）83 pass，Transfer / Upload 同验 143 pass（含 required axe）；类型检查通过；真实浏览器、读屏与 hydration 待补 |
| C070 | Radio           | needs-evidence | 视觉 0/32、键盘 0/32 全 blocked，截图 0（IAB browsers: []）；定向测试 58 passed；SSR+happy-dom 探针；未跑全仓测试、build/typecheck、E2E、hydration、读屏                                                           |
| C071 | RadioGroup      | needs-evidence | 视觉、真实键盘各 0/32 blocked，截图 0；必填 FormItem 的组容器 ARIA 继承与显式覆盖 happy-dom 回归通过，双端 6 文件 203 pass（含 axe、Radio 与 FormItem 组合）；类型检查通过；真实浏览器、读屏与 hydration 待补      |
| C072 | Select          | needs-evidence | 视觉、真实键盘各 0/40 blocked，截图 0；C072-F01/F03 已修复，双端只读 ARIA/聚焦/打开/搜索/值保持回归通过；12 文件 259 pass（含 picker），null JSX 与类型检查通过；真实浏览器、读屏与 hydration 待补                 |
| C073 | Signature       | needs-evidence | 视觉 0/24、键盘 0/24 全 blocked，截图 0；C073-F01 已修复，Vue 独立非法值提示、合法值恢复与 FormItem 单一反馈 happy-dom 回归通过，双端定向 54 pass；类型检查通过；真实指针/手写、焦点顺序、亮暗主题、读屏待补       |
| C074 | Slider          | needs-evidence | 视觉、真实键盘各 0/40 blocked，截图 0；C074-F01–F03 已修复，格式化气泡、Vue 多实例 ID 与后缀引用、双端越界 mark happy-dom 回归通过，双端定向 65 pass（含 axe）；类型检查通过；真实浏览器、读屏与 hydration 待补    |
| C075 | Switch          | needs-evidence | 视觉 0/24、键盘 0/24 全 blocked，截图 0；C075-F01 已修复，取消一次或连续取消后再切换、React 对照与受控拒收 happy-dom 回归通过，双端定向 32 pass；类型检查通过；真实键盘、亮暗主题、读屏与 hydration 待补           |
| C076 | TagsInput       | needs-evidence | 视觉、真实键盘各 0/24 blocked，截图 0；F01/F02/F04/F05 已修复，ID/拥有关系/React 拖放回归通过，双端 30 pass（含 axe）；SSR draggable 均 2，Demo 名称、类型/文档/示例检查通过；浏览器、读屏、拖放与 hydration 待补  |
| C077 | Textarea        | needs-evidence | 视觉/真实键盘各 0/24 blocked，截图 0；F01–F04 已修复，SSR 123、动态焦点回归通过；Textarea/SSR 52 pass（含 axe），Input/InputGroup 同验；Demo 14/12、六个名称与类型/示例检查通过；浏览器、读屏与 hydration 待补     |
| C078 | TimePicker      | needs-evidence | 视觉 0/16 blocked；键盘 0/16 blocked；截图 0（IAB browsers 为空）；定向测试 4 文件 56 通过；SSR、happy-dom 探针与 docs/exports/example-sources 检查退出 0；未跑 E2E、hydration、真实读屏                           |
| C079 | Transfer        | needs-evidence | 视觉、真实键盘各 0/16 blocked，截图 0；F01–F03 已修复（F02 方向 A，接通 ARIA 模板）；双端 35 项、Core/文案 16 项通过（含 axe/SSR）；类型、API 文档与示例来源检查通过；浏览器、读屏与 hydration 待补                |
| C080 | TreeSelect      | needs-evidence | 视觉、真实键盘各 0/24 blocked，截图 0；F02 已修复，挂起 Promise 下双击仅加载一次、完成后子节点可见；TreeSelect/Tree/Cascader/Core 8 文件 244 pass；类型检查通过；浏览器、读屏与 hydration 待补                     |
| C081 | Upload          | needs-evidence | 视觉/真实键盘各 0/32 blocked，截图 0；F01–F04、F06 已修复，单选、分片 URL、表单值、React 预览与卸载校验回归通过；双端 Upload/CropUpload/Core 6 文件 172 pass；类型通过；真实网络、分片合并、读屏与 hydration 待补  |

### navigation

| 任务 | 组件                  | 队列           | 现状                                                                                                                                                                      |
| ---- | --------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| C082 | Affix                 | needs-evidence | 视觉/键盘各 0/16 blocked，截图 0；F01/F02 已修复，happy-dom 回归通过；Affix/Core/Anchor（含 AnchorLink）5 文件 95 pass、现有 axe 与类型通过；浏览器、读屏、hydration 待补 |
| C083 | Anchor                | needs-evidence | 视觉 24 格、键盘 24 格均 blocked，截图 0；定向 Vitest 102 passed、W9 E13 1 passed；源码 SSR 探针成功，未验 hydration；未跑 E2E、build；真实 RTL、读屏未测                 |
| C084 | AnchorLink            | needs-evidence | 视觉/键盘各 24 格 blocked（owner 为 C083），截图 0；F01/F02 已修复，Anchor/Breadcrumb/Core 定向 166 passed、类型通过；E2E、build、hydration、读屏待补                     |
| C085 | BackTop               | needs-evidence | 视觉 16 格、键盘 16 格均 blocked，截图 0；定向 Vitest 30 passed、a11y 25 passed；源码 SSR 探针成功；未跑 E2E、build、hydration；读屏、reduced-motion 未测                 |
| C086 | Breadcrumb            | needs-evidence | 视觉 24 格、真实键盘 24 格均 blocked，截图 0；定向 Vitest 75 passed（axe 不覆盖打开的菜单）；SSR 与 happy-dom 探针；未跑 E2E、build、hydration；读屏未测                  |
| C087 | BreadcrumbItem        | needs-evidence | 视觉 24 格、真实键盘 24 格均 blocked（owner 为 C086），截图 0；定向 Vitest 49 passed；SSR 与 happy-dom 点击探针；未跑 E2E、build、hydration；读屏未测                     |
| C088 | ContextMenu           | needs-evidence | 视觉 0/16、原生键盘 0/16 均 blocked，截图 0；E2E 双端 4 场景未执行；定向 Vitest 4 文件 44 项通过；SSR 8 份成功，未验 hydration；RTL 布局、碰撞定位、iframe 层叠、读屏未测 |
| C089 | ContextMenuItem       | needs-evidence | 共享 16 格视觉、原生键盘均 blocked（owner 为 C088），截图 0；E2E 4 场景未执行；定向 Vitest 85 项通过；SSR 16 份成功，无 hydration；axe 不扫 portal 内菜单；读屏未测       |
| C090 | ContextMenuMenu       | needs-evidence | 共享 16 格视觉、真实键盘均 0/16 blocked（owner 为 C088），截图 0；E2E 未执行；定向 Vitest 83 项通过、10 项 skipped；SSR 8 份，未验 hydration；RTL、读屏未测               |
| C091 | ContextMenuSub        | needs-evidence | 共享 16 格视觉与真实键盘全部 blocked（owner 为 C088），截图 0；E2E 未执行；定向 Vitest 93 项通过，a11y 复跑 33 项（重叠）；SSR 6 份，未测 hydration；RTL、触摸、读屏未测  |
| C092 | Dropdown              | needs-evidence | 视觉 24 格 blocked；原生键盘 24 格 blocked（Mac 锁屏无浏览器）；未跑 E2E/build/hydration；SSR 仅 16 个服务端渲染场景成功；读屏、主题、窄屏、reduced-motion 未测           |
| C093 | DropdownItem          | needs-evidence | 共享 Demo（owner C092）视觉 24 blocked、原生键盘 24 blocked、截图 0；未跑 E2E/build/hydration/真实导航；SSR 仅 12 场景服务端输出；读屏未测                                |
| C094 | DropdownMenu          | needs-evidence | 共享 Demo（owner C092）视觉 24 blocked、原生键盘 24 blocked、截图 0；E2E/build/hydration 未执行；SSR 仅 8 份字符串；亮暗主题、窄屏、RTL、读屏无证据                       |
| C095 | FloatButton           | needs-evidence | 视觉 24 blocked、原生键盘 24 blocked、截图 0（CUA browsers=[]）；无专属 E2E；hydration 未测，SSR 仅 10 份字符串；亮暗主题、窄屏、RTL、焦点可见性、读屏未验收              |
| C096 | FloatButtonGroup      | needs-evidence | 视觉 24 blocked、原生键盘 24 blocked、截图 0（owner 均 C095，仅 02 渲染 Group）；浏览器 E2E 未执行；hydration 未测，SSR 仅 6 份；亮暗主题、窄屏、RTL 未验收               |
| C097 | FullscreenButton      | needs-evidence | 视觉 8 blocked、原生键盘 8 blocked、截图 0（CUA browsers=[]）；无 Core 专项或 E2E 用例；hydration 未测，SSR 仅 2 份字符串；真实全屏进入/退出与外部状态同步未验            |
| C098 | Menu                  | needs-evidence | 视觉 40 blocked、原生键盘 40 blocked、截图 0；TIGER_A11Y=1 下 182 项 2 failed（即 F01）；浏览器 E2E、hydration、读屏未执行，SSR 仅 2 份                                   |
| C099 | MenuItem              | needs-evidence | F01–F04 已修复并通过定向自动门禁；原 Demo（owner C098）视觉 40 blocked、原生键盘 40 blocked、截图 0；无专属 E2E；hydration 未测                                           |
| C100 | MenuItemGroup         | needs-evidence | Demo（owner C098）视觉 40 blocked、原生键盘 40 blocked、截图 0；TIGER_A11Y=1 下 79 项 2 failed（归 C098-F01）；无专属 E2E；hydration、读屏未测                            |
| C101 | SubMenu               | needs-evidence | 视觉 0/40 blocked；原生键盘 0/40 blocked；截图 0；无专属 E2E；SSR 字符串无警告，hydration 未测；TIGER_A11Y 79 项 77 passed/2 failed；读屏、RTL 几何未测                   |
| C102 | NavigationMenu        | needs-evidence | 视觉 0/16 blocked；原生键盘 0/16 blocked；截图 0；E2E、SSR 未跑；React NavigationMenu 组合的 TIGER_A11Y=1 单文件 33 项通过；RTL 几何未测                                  |
| C103 | NavigationMenuContent | needs-evidence | 视觉 0/16 blocked；原生键盘 0/16 blocked；截图 0；E2E 未执行；SSR/hydration 未跑且无专项覆盖；React NavigationMenu 组合的 TIGER_A11Y=1 单文件 33 项通过                   |
| C104 | NavigationMenuItem    | needs-evidence | 视觉 0/16 blocked；原生键盘 0/16 blocked；截图 0；E2E 未执行；SSR/hydration 未跑且无专项覆盖；React NavigationMenu 组合的 TIGER_A11Y=1 单文件 33 项通过                   |
| C105 | NavigationMenuLink    | needs-evidence | 视觉 0/16 blocked；原生键盘 0/16 blocked；截图 0；E2E 未执行；SSR/hydration 未跑且无专项覆盖；React NavigationMenu 组合的 TIGER_A11Y=1 单文件 33 项通过                   |
| C106 | NavigationMenuList    | needs-evidence | 视觉 0/16 blocked；原生键盘 0/16 blocked；截图 0；E2E 未执行；SSR/hydration 未跑；React NavigationMenu 组合的 TIGER_A11Y=1 单文件 33 项通过；真实像素与 resize 未测       |
| C107 | NavigationMenuTrigger | needs-evidence | 视觉 0/16 blocked；原生键盘 0/16 blocked；截图 0；E2E 未执行；SSR/hydration、w9-t07 未跑；React NavigationMenu 组合的 TIGER_A11Y=1 单文件 33 项通过；无浏览器清单         |
| C108 | PageHeader            | needs-evidence | 视觉 0/32 blocked；原生键盘 0/32 blocked；截图空；无 PageHeader E2E；SSR/hydration、w9-t07 未跑；测试 38 passed；happy-dom 探针 1 passed；无浏览器清单                    |
| C109 | Pagination            | needs-evidence | 视觉 0/40 blocked；原生键盘 0/40 blocked；截图空；无 Pagination E2E；SSR/hydration、w9-t07 未跑；测试 54 passed；happy-dom 探针 1 passed；无浏览器清单                    |
| C110 | ScrollSpy             | needs-evidence | 视觉 0/16 blocked；原生键盘 0/16 blocked；截图空；无 E2E；SSR 仅探针静态渲染，hydration 未跑；测试 87 passed，w9-t07 1 passed/14 skipped；无浏览器清单                    |
| C111 | Spotlight             | needs-evidence | 视觉 0/16（16 blocked）；原生键盘 0/16（16 blocked）；截图全空；无 Spotlight E2E；SSR 仅 node 探针渲染未抛错，未跑 hydrate；happy-dom 50 passed                           |
| C112 | Steps                 | needs-evidence | 视觉 0/24 blocked；原生键盘 0/24 blocked；无 Steps E2E；SSR 仅 node 探针 renderToString 未抛错，未跑 hydrate 与独立 SSR 套件；happy-dom 52 passed                         |
| C113 | StepsItem             | needs-evidence | 视觉 0/24 blocked；原生键盘 0/24 blocked；无 StepsItem E2E；无专属测试路径，父组件 spec 42 passed（happy-dom）；SSR 仅 node 探针未抛错，未跑 hydrate                      |
| C114 | Tabs                  | needs-evidence | 视觉 0/32 blocked；原生键盘 0/32 blocked；无 E2E；未跑 hydration；无 happy-dom 探针；Tabs 与 tabs-utils spec 101 passed 仅 happy-dom                                      |
| C115 | TabPane               | needs-evidence | 视觉 0/32 blocked；原生键盘 0/32 blocked；无 E2E；无独立 spec，Tabs 相关 101 passed（happy-dom）；未跑 hydration；无 happy-dom / SSR 探针                                 |
| C116 | Tree                  | needs-evidence | 视觉 0/24 blocked；原生键盘 0/24 blocked；无 Tree E2E；未跑 hydration；本轮未调用 MCP；无 happy-dom 探针；Tree 相关 spec 159 passed 仅 happy-dom                          |

### feedback

| 任务 | 组件                  | 队列           | 现状                                                                                                                                                       |
| ---- | --------------------- | -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| C117 | Alert                 | needs-evidence | 视觉 0/32 blocked；键盘 0/32 blocked；截图 0；定向 vitest 43 项通过（happy-dom）；未跑 SSR 渲染与 w9-render-wire；探针为 jiti 读取，非 DOM 渲染            |
| C118 | Drawer                | needs-evidence | 视觉 0/24 blocked；键盘 0/24 blocked；截图 0；定向 vitest 73 项通过（happy-dom，含 feedback-ssr 2 项）；未跑 w9-render-wire 与 SSR 属性探针                |
| C119 | Loading               | needs-evidence | 视觉 0/24 blocked；键盘 0/24 blocked；截图 0；定向 vitest 36 项通过（happy-dom/node）；未跑 SSR 与 SSR 属性探针                                            |
| C120 | LoadingBarContainer   | needs-evidence | loading-bar/04 的 8 格视觉与键盘 blocked；01–03 的 24 格也 blocked；截图 0；定向 vitest 30 项通过（happy-dom/node）；无主责测试文件；未启动 Vite           |
| C121 | LoadingBar            | needs-evidence | 视觉 0/32 blocked；键盘 0/32 blocked；截图 0；定向 vitest 30 项通过（happy-dom/node，有 React act 警告）；未启动 Vite                                      |
| C122 | MessageContainer      | needs-evidence | 主责视觉矩阵 0 格；message/05 的 8 格 blocked（owner C123）；视觉与键盘未执行；截图 0；Message 两份 spec 13 项通过（happy-dom）；无 MessageContainer.spec  |
| C123 | Message               | needs-evidence | 视觉 0/40 blocked；键盘 0/40 blocked；截图 0；定向 vitest 40 项通过（happy-dom，React 有未包 act 的 stderr）；未启动 Vite                                  |
| C124 | Modal                 | needs-evidence | 视觉 0/40 blocked；键盘 0/40 blocked；截图 0；定向 vitest 100 项通过（happy-dom，有 act stderr 与 Popover 无名开发警告）；未启动 Vite                      |
| C125 | NotificationContainer | needs-evidence | 主责矩阵 0 格记 blocked；notification/05 的 8 格 blocked（owner X05）；键盘未执行；截图 0；Notification spec 11 项通过（happy-dom，属 X06）；未跑 w9       |
| C126 | Popconfirm            | needs-evidence | 视觉 0/16 blocked；键盘 0/16 blocked；截图 0；定向 vitest 27 项通过（happy-dom）；未做挂载探针；未启动 Vite                                                |
| C127 | Popover               | needs-evidence | 视觉 0/16 blocked；键盘 0/16 blocked；截图 0；定向 vitest 64 项通过（happy-dom）；未做挂载探针；未启动 Vite                                                |
| C128 | Progress              | needs-evidence | 视觉 0/32 blocked；键盘 0/32 blocked；截图 0；定向 vitest 31 项通过（happy-dom）；Intl 探针是 node 输出，非组件挂载；height 为 0 未做挂载探针；未启动 Vite |
| C129 | Tooltip               | needs-evidence | 视觉 0/32 blocked；键盘 0/32 blocked；截图 0；定向 vitest 47 项通过（happy-dom）；未做类型测试与挂载探针；未启动 Vite                                      |
| C130 | Tour                  | needs-evidence | 视觉 0/16 blocked；键盘 0/16 blocked；截图 0；定向 vitest 87 项通过（happy-dom，未设 TIGER_A11Y，axe 未扫描）；未跑 docs:api:check、exports:check          |

### data

| 任务 | 组件          | 队列           | 现状                                                                                                                                                         |
| ---- | ------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| C131 | Calendar      | needs-evidence | 视觉 0/32、键盘 0/32 均 blocked，截图 0；vitest 4 files 49 passed（happy-dom，axe 未扫）；未跑 docs:api:check、exports:check；无读屏、无真实 RTL             |
| C132 | Collapse      | needs-evidence | 视觉 0/24、键盘 0/24 均 blocked，截图 0；vitest 3 files 75 passed（happy-dom，axe 未扫）；未跑 docs:api:check、exports:check；无 ref 探针                    |
| C133 | CollapsePanel | needs-evidence | 主责视觉格 0；相关 24 格（owner C132）视觉、键盘 0/24 blocked，截图 0；vitest 2 files 66 passed（happy-dom，axe 未扫，无自有测试）；无读屏                   |
| C134 | Countdown     | needs-evidence | 视觉 0/16、键盘 0/16 均 blocked，截图 0；vitest 3 files 77 passed（happy-dom，axe 未扫）；临时 happy-dom 探针通过（非浏览器）；未跑 docs:api:check；无读屏   |
| C135 | DataExport    | needs-evidence | 视觉 0/8、键盘 0/8 均 blocked，截图 0；vitest 3 files 40 passed（happy-dom，axe 未扫）；临时 happy-dom 探针（非浏览器、非 SSR）；未跑 docs:api:check         |
| C136 | Table         | needs-evidence | 视觉 0/64、键盘 0/64 均 blocked，截图 0；vitest 2 files 156 项通过（happy-dom）；table-utils、w9-bind、TableState spec 未跑；menu/05 属 C098                 |
| C137 | Timeline      | needs-evidence | 视觉 0/24、键盘 0/24 均 blocked，截图 0；vitest 3 files 45 passed；happy-dom 探针通过（已删，非视觉）；未跑 SSR；无读屏；alternate、right、horizontal 无画面 |

### charts

| 任务 | 组件           | 队列           | 现状                                                                                                                                                                                      |
| ---- | -------------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| C138 | AreaChart      | needs-evidence | 视觉 0/24 blocked，截图 0；键盘 0/24 blocked；视觉子代理未创建，未启动 Demo；定向 vitest 22 通过、happy-dom 探针 2 通过；未跑 SSR，无计算样式                                             |
| C139 | BarChart       | needs-evidence | 视觉 0/24 blocked，截图 0；键盘 0/24 blocked；视觉子代理未创建，未启动 Demo；定向 vitest 43 通过、happy-dom 探针 8 通过；未跑 SSR，animated 无计算样式                                    |
| C140 | ChartAxis      | needs-evidence | 主责 Demo 0，视觉矩阵 0 格未执行，截图 0；键盘未执行；定向 vitest 17 通过 135 跳过（X06 spec）、探针 4 通过；无读屏；top/right 轴与标签裁切无浏览器证据                                   |
| C141 | ChartCanvas    | needs-evidence | 主责 Demo 0，视觉矩阵 0 格未执行，截图 0；键盘未执行；定向 vitest 13 通过 25 跳过（X06 spec）、探针 7 通过；无读屏；焦点环、主题对比无浏览器证据                                          |
| C142 | ChartGrid      | needs-evidence | 主责 Demo 0，视觉矩阵 0 格未执行，截图 0；键盘未执行；定向 vitest 7 通过 145 跳过（X06 spec）、探针 4 通过；未跑 SSR；无读屏与主题对比证据                                                |
| C143 | ChartLegend    | needs-evidence | 主责 Demo 0，视觉矩阵 0 格，截图 0；键盘未执行；定向 vitest 9 通过 26 跳过（X06 spec，未断言 hidden）、探针 6 通过（happy-dom 加 server renderer，非独立 SSR）                            |
| C144 | ChartSeries    | needs-evidence | 主责 Demo 0，视觉矩阵 0 格，截图 0；键盘未执行；定向 vitest 3 通过 149 跳过（X06 spec）、探针 10 通过（happy-dom 加 server renderer）；非浏览器像素命中                                   |
| C145 | ChartTooltip   | needs-evidence | 主责 Demo 0，视觉矩阵 0 格，截图 0；浏览器键盘未执行；定向 vitest 17 通过 51 跳过（X06 spec）、探针 10 通过；无 document 的 Node SSR 与浏览器绘制帧未测                                   |
| C146 | FunnelChart    | needs-evidence | 视觉 0/24、键盘 0/24 全 blocked，截图 0；现有测试 3 文件 35 项通过；happy-dom 探针 2 文件 10 项通过；无 document 的 Node SSR、浏览器绘制帧、真实像素命中未测                              |
| C147 | Gantt          | needs-evidence | 视觉 0/16、键盘 0/16 全 blocked，截图 0；现有测试 3 文件 53 项通过；happy-dom 探针 3 文件 13 项通过；无 document 的 SSR、浏览器绘制、真实拖拽未测；RTL 未触发                             |
| C148 | GaugeChart     | needs-evidence | 视觉 0/24、键盘 0/24 全 blocked，截图 0；现有测试 3 文件 42 项通过；探针 4 文件 17 项通过（含 SSR 字符串）；浏览器绘制、真实键盘焦点、读屏未测                                            |
| C149 | HeatmapChart   | needs-evidence | 视觉 0/24、键盘 0/24 全 blocked，截图 0；现有测试 3 文件 43 项通过；探针 4 文件 18 项通过（含 SSR 字符串）；浏览器绘制、真实键盘焦点、暗色空格、读屏、RTL 页面未测                        |
| C150 | LineChart      | needs-evidence | 视觉 0/24、键盘 0/24 全 blocked，截图 0；现有测试 2 文件 26 项通过；探针 3 文件 15 项通过（含 SSR 字符串）；浏览器绘制、真实键盘焦点、面积像素、读屏未测                                  |
| C151 | OrgChart       | needs-evidence | 视觉 0/16、键盘 0/16 全 blocked，截图 0；现有测试 3 文件 42 项通过；探针 2 文件 14 项通过；浏览器绘制、真实键盘焦点、头像像素、读屏未测；rtl 布局未从组件打到；X05 页面 Demo 未打开       |
| C152 | PieChart       | needs-evidence | 视觉 0/48、键盘 0/48 全 blocked，截图 0；现有测试 2 文件 25 项通过；探针 3 文件 19 项通过（含 SSR 1 项）；浏览器绘制、真实键盘焦点、入场动画计算样式、读屏未测；X05 页面 Demo 未打开      |
| C153 | RadarChart     | needs-evidence | 视觉 0/24、键盘 0/24 均 blocked，截图 0；未建视觉子代理、未启动浏览器；happy-dom 探针 23 项（含 SSR 1）与现有测试 26 项通过；读屏未测                                                     |
| C154 | SankeyChart    | needs-evidence | 视觉 0/8、键盘 0/8 均 blocked，截图 0；未建视觉子代理、未用浏览器；happy-dom 探针 7 项（含 SSR）通过；现有测试 3 通过 13 跳过；未观察 ResizeObserver 改写后的尺寸                         |
| C155 | ScatterChart   | needs-evidence | 视觉 0/24、键盘 0/24 均 blocked，截图 0；未建视觉子代理、未启动浏览器；happy-dom 探针 17 项（含 SSR 1）与现有测试 45 项通过；未设 TIGER_A11Y，axe 未实际扫描；读屏、动画计算样式未测      |
| C156 | SunburstChart  | needs-evidence | 视觉 0/16、键盘 0/16 均 blocked，截图 0；未建视觉子代理、未启动浏览器；happy-dom 探针 21 项（含 SSR 1）通过；现有测试 31 项通过但本轮未重跑；axe 未实际扫描；读屏、过渡计算样式未测       |
| C157 | TreeMapChart   | needs-evidence | 视觉 0/16、键盘 0/16 均 blocked，截图 0；未建视觉子代理、未启动浏览器；happy-dom 探针 27 项（含 SSR 1）通过；现有测试 26 项通过但补写报告时未重跑；axe 未实际扫描；读屏、过渡计算样式未测 |
| C158 | WaterfallChart | needs-evidence | 视觉 0/8、键盘 0/8 均 blocked，截图 0；未建视觉子代理、未用浏览器；happy-dom 探针 7 项（含 SSR）通过；现有测试 3 通过 13 跳过，无 WaterfallChart.spec                                     |

### advanced

| 任务 | 组件            | 队列           | 现状                                                                                                                                                                           |
| ---- | --------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| C159 | CodeEditor      | needs-evidence | 视觉 0/24 blocked；键盘 0/24 blocked；截图 0；未启动 Example；定向 spec 44 项通过；临时探针 6 过 2 败；w9-bind.spec 未跑                                                       |
| C160 | Drag            | needs-evidence | 视觉 0/8 blocked；键盘 0/8 blocked；截图 0；未启动 Example；定向 spec 63 项通过（happy-dom，无键盘用例）；临时探针 5 败 1 过                                                   |
| C161 | FileManager     | needs-evidence | 视觉 0/16 blocked；键盘 0/16 blocked；截图 0；未启动 Example；定向 spec 120 项通过（happy-dom）；临时探针 4 项通过并留快照；未跑 SSR                                           |
| C162 | ImageAnnotation | needs-evidence | 视觉 0/16 blocked；键盘 0/16 blocked；截图 0；未启动 Example；定向 spec 72 项通过（happy-dom，React 有 act 警告）；临时探针 6 项通过并留快照；未跑 SSR                         |
| C163 | InfiniteScroll  | needs-evidence | 视觉 0/16 blocked；键盘 0/16 blocked；截图 0；未启动 Example、未在页面滚到哨兵；定向 spec 79 项通过；custom-text 7 项通过（不含错误文案）；探针含 SSR 字符串快照，汇总行未落盘 |
| C164 | MarkdownEditor  | needs-evidence | 视觉 0/16 blocked；键盘 0/16 blocked；截图 0；未启动 Example；定向 spec 84 项通过（happy-dom）；探针两端各 1 项通过；w9-bind 未重跑；真实 IME、390×844 未测                    |
| C165 | PrintLayout     | needs-evidence | 视觉 0/8 blocked；键盘 0/8 blocked；截图 0；未启动 Example；TIGER_A11Y=1 定向 spec 44 通过（a11y 用例无页眉）；探针 Vue 3、React 4 通过；未开打印对话框；未做 SSR              |
| C166 | PrintPageBreak  | needs-evidence | 无独立 Demo；组合 Demo 视觉 0/8、键盘 0/8 blocked（owner 为 C165）；截图 0；定向 spec 44 通过（a11y 用例无分页符）；探针摘要未留盘；未开打印对话框；未做 SSR                   |
| C167 | RichTextEditor  | needs-evidence | 视觉 0/16 blocked；键盘 0/16 blocked；截图 0；未启动 Example；定向 spec 155 通过（无 axe 用例）；探针 2 通过；SSR renderToString 两端有 textbox、不抛错                        |
| C168 | VirtualList     | needs-evidence | 视觉 0/16 blocked；键盘 0/16 blocked；截图 0；未启动 Example；TIGER_A11Y=1 定向 spec 63 通过（两条 axe 实跑）；探针 2 通过（happy-dom）                                        |
| C169 | VirtualTable    | needs-evidence | 视觉 0/16 blocked；键盘 0/16 blocked；截图 0；未启动 Example；TIGER_A11Y=1 定向 spec 46 通过（两条 axe 实跑）；探针 2 通过（happy-dom）                                        |

### composite

| 任务 | 组件                 | 队列           | 现状                                                                                                                                                        |
| ---- | -------------------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| C170 | ActivityFeed         | needs-evidence | 视觉 0/16、键盘 0/16 均 blocked，截图 0；仅 happy-dom：现有用例 25+4 通过，两端探针各 1 通过；未提 E2E/SSR                                                  |
| C171 | AppShell             | needs-evidence | 视觉 0/8、键盘 0/8 均 blocked，截图 0；仅 happy-dom：现有用例 2 通过 4 跳过，两端探针各 1 通过；未提 E2E/SSR                                                |
| C172 | AssigneePicker       | needs-evidence | 视觉 0/8、键盘 0/8 均 blocked，截图 0；仅 happy-dom：现有用例 4 通过 4 跳过，两端探针各 1 通过；未提 E2E/SSR                                                |
| C173 | ChatWindow           | needs-evidence | 视觉 0/16、键盘 0/16 均 blocked，截图 0；仅 happy-dom：3 个文件 48 项通过（含 axe），两端探针各 1 项；亮暗、窄屏、真实焦点未测                              |
| C174 | CommentThread        | needs-evidence | 视觉 0/16、键盘 0/16 均 blocked，截图 0；仅 happy-dom：3 个文件 62 项通过（含 axe），两端探针 JSON；亮暗、窄屏、真实焦点未测                                |
| C175 | DataTableWithToolbar | needs-evidence | 视觉 0/48、键盘 0/48 均 blocked，截图 0；仅 happy-dom：3 个文件 83 项通过（含 axe），两端探针各 1 项；亮暗、窄屏、真实焦点未测                              |
| C176 | FormWizard           | needs-evidence | 视觉 0/16、键盘 0/16 均 blocked，截图 0；仅 happy-dom：3 个文件 43 项通过（含 axe），两端探针各 1 项；亮暗、窄屏、真实焦点未测                              |
| C177 | NotificationBell     | needs-evidence | 视觉 0/8、键盘 0/8 均 blocked，截图 0；仅 happy-dom：4 项通过 6 项跳过（两端探针加初次播报用例）；探针内 SSR 无报错；亮暗、窄屏、真实焦点未测               |
| C178 | NotificationCenter   | needs-evidence | 视觉 0/16 blocked；键盘 0/16 blocked，截图 0；happy-dom 定向 50 项通过（含两端临时探针）；SSR 仅探针未抛错；无真实浏览器亮暗色、窄屏与焦点顺序证据          |
| C179 | SchemaForm           | needs-evidence | 视觉 0/24 blocked；键盘 0/24 blocked，截图 0；happy-dom 定向 37 项通过，两端探针各 1 项；SSR 仅探针未抛错；无真实浏览器亮暗色、窄屏与焦点顺序证据           |
| C180 | TaskBoard            | needs-evidence | 视觉 0/24 blocked；键盘 0/24 blocked，截图 0；happy-dom 定向 193 项通过，两端探针各 1 项；SSR 仅探针未抛错；X02-F001 无计算样式证据；无真实浏览器证据       |
| C181 | WorkflowDesigner     | needs-evidence | 视觉 0/16 blocked；键盘 0/16 blocked，截图 0；happy-dom 定向 54 项通过，两端探针各 1 项；SSR 仅探针未抛错；无真实浏览器亮暗色、窄屏与焦点顺序证据           |
| C182 | WorkflowDetailShell  | needs-evidence | 视觉 0/8 blocked；键盘 0/8 blocked，截图 0；happy-dom 11 项通过（含两端探针）；SSR 仅 happy-dom 未抛错，非纯 Node；未量像素高度与 timeline padding 计算样式 |
| C183 | WorkflowTimeline     | needs-evidence | 视觉 0/8 blocked；键盘 0/8 blocked，截图 0；happy-dom 104 项通过（含临时探针 4 项，已删除）；未跑全量门禁、未启动 Example；SSR 未提及                       |
| C184 | WorkflowActionBar    | needs-evidence | 视觉 0/8 blocked；键盘 0/8 blocked，截图 0，矩阵 owner 是 C183；happy-dom 现有 100 项通过、临时探针 5 项通过；无独立 Demo；未跑全量门禁、未启动 Example     |
| C185 | WorkflowViewer       | needs-evidence | 视觉 0/8 blocked；键盘 0/8 blocked，截图 0；happy-dom 35 项通过（含两端临时探针各 2 项，已删除）；未跑全量门禁、未启动 Example；SSR 未提及                  |

### 专题

| 任务  | 专题                 | 队列           | 现状                                                                                                                                                                                |
| ----- | -------------------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| X01   | 共享 Core 与框架基础 | complete       | 视觉不适用（主责 Demo 为 0，未执行浏览器/截图/视口主题矩阵）；键盘人工与读屏未测；定向测试 98 文件/1,579 项全过；四组复现脚本有日志；未跑全量测试、完整构建、axe、E2E、七项漂移门禁 |
| X02   | 主题、样式与 i18n    | complete       | 视觉未做（841 个 Demo 主责为 0）；键盘未测；CSS 为 Chromium 计算样式 9 案例，i18n 为 happy-dom 渲染，均不计视觉矩阵；14 spec/238 测试通过；未跑全量构建、E2E、axe                   |
| X03   | CLI 与 MCP           | needs-evidence | 无视觉矩阵，视觉/键盘未做；playground 未执行记 blocked；4 spec/131 测试通过（主责 X06）；exports:check exit 0；dist add 探针 7 组件加 3 个 dry-run                                  |
| X04   | API 文档与生成器     | needs-evidence | 无视觉矩阵，界面验收 blocked；docs:api/api:baseline/exports/example:index 四项 check 与 api:validate 均 exit 0；未跑 docs:links、组件 spec                                          |
| X05   | Example 平台与 SSR   | needs-evidence | 17 个 Demo 68 格视觉与键盘 68/68 blocked，截图 0；example:sources/index check exit 0；7 spec 22 项通过（主责 X06）；example:ssr:check 未跑                                          |
| X06   | 构建、测试与发布配置 | needs-evidence | 无视觉矩阵；E2E 6 spec、benchmark 8 个未跑；release/types/dev check exit 0，14 项分组测试通过；未跑全量 test、a11y、coverage、size、publish:check                                   |
| X07   | 项目级文档           | needs-evidence | 无视觉矩阵，未启动 Example，截图 0；32 个 Markdown 相对链接与锚点 0 处失效；未跑 pnpm test、docs:api:check、bench、E2E，未查 npm registry；RC3 档案视觉结论未复核                   |
| FINAL | 全覆盖核对与目录验收 | needs-evidence | 3364 格（841 Demo×4）。视觉 pass 370、finding 174、fail 12、partial 12、blocked 2772、pending 24；键盘 348、136、24、0、2832、24（同序）；未重跑                                    |

## 未立项观察

报告里提到但没有编号的现象。它们没有进 02–12 的任务表，由 E11 复核。右列是报告备注的摘录，里面也夹着一些范围说明。

| 任务 | 组件                  | 报告备注                                                                                                                                                                                                                                                         |
| ---- | --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| X05  | Example 平台与 SSR    | 420 文件 SHA-256 无缺失无不一致，74 个只做摘要比对（含 playground 运行时 23）。两端非首页路由 146 对 146。未立项：use-chart-interaction/01 第一组只接鼠标；use-drag 列表项无 tabIndex；SSR smoke 未测打开的浮层                                                  |
| X07  | 项目级文档            | 32 文件 SHA-256 无缺失无不一致；20 个 changeset/旧迁移档案仅核版本事实，3 个长文档只读相关段。ROADMAP 第 17 行 Cron 摘要与 X02-F003 是同一未完成事项。未立项：React Input readOnly 大小写、ImagePreview 默认循环                                                 |
| C001 | ConfigProvider        | 未立项候选：窄屏设置层 AX 缺名与显式 aria-label 矛盾，缺展开态 DOM 证据；10 个关联 Demo（calendar/01、modal/05 等）只核实消费关系；嵌套 Provider 不改 html 属设计                                                                                                |
| C007 | Badge                 | 不能记 complete：float-button/03、notification-bell/01、menu/05 共 6 个消费 Demo 待 C095/C177/C098 证据；待验证观察：数字字符串计数的 sr-only 用封顶文本、overlay ARIA 只作用于内部徽标                                                                          |
| C009 | Code                  | 无 Code 专属新缺陷；X02-F003 方向：把换行/语言标题文案纳入 TigerLocale 合并覆盖链；仅传 locale=zh-CN 时出现反向分裂；Vue 字符串 style 有开发警告未立项；C004 的 Button 专属发现不适用（原生按钮）                                                                |
| C010 | CopyButton            | Vue 失败态有 aria-describedby 而 React 没有，未立项；无 copying 状态与定时复位，文档未承诺故不算缺陷；Demo 缺 disabled、slot/children、可控失败入口；固定 outline/sm，C004 的非法 variant/size 问题不触发                                                        |
| C011 | CropUpload            | 待验证：Demo 01 后续成功时是否残留旧错误；无 cropping 证据；compact 文档只列 4/10 属性为有意压缩；28 个关联 Demo 待属主证据                                                                                                                                      |
| C014 | Gallery               | 未立项接线差异：Vue watch 受控值同步内部索引而 React 不同步；Gallery 无 open prop 仅有通知事件；受控回调、空数组、Space、关闭后焦点返回无专门用例；V01 仍待 ImagePreview 窄屏计数，不另立编号；C004/C011 独有问题与 X01 未见适用；X02-F002 未实测                |
| C016 | Image                 | 待验证：React 有 complete/naturalWidth 检查而 Vue 只靠 load/error，缓存/hydration 无证据；aria-busy 两端差异未立项；image/02 metadata 把原生 lazy 写成视口前占位，列为文案建议；现有测试未覆盖失败后激活预览                                                     |
| C017 | ImageCompare          | Core/Vue alt 注释写默认空串，实际空值回落 locale Before/After，建议注释改为「空值视为未提供」（未立项）；V01 与 C013-V01 同为预览/焦点组合候选，交 X05 去重；Props 文档 4/19 属明确精简；Demo 均用 Picsum，无失败回退演示                                        |
| C019 | ImageGroup            | C019-F01 已修复；Vue watch 把受控 currentIndex 存入内部值而 React 不同步（未立项）；动态重排、语言切换未测                                                                                                                                                       |
| C020 | ImagePreview          | C020-F01、C020-F02、C020-F03 已修复。未立项待验证：Vue 打开态卸载未 release Escape 条目；Demo03 下载使 iframe 导航到跨源图片（sandbox 无 allow-downloads，根因未隔离）；空列表首屏 React 发 open=false 而 Vue 不发；受控导航不回写时画面停在父层索引             |
| C021 | Inplace               | C021-F01、C021-F02、C021-F03、C021-K01 已修复。未立项：React display/input 缺省回退 children，Vue 不读 default slot；textarea 普通 Enter 也退出，不另建问题；四桌面格页面起点纯键盘入口仍未验证                                                                  |
| C024 | Marquee               | C024-F01、C024-F02、C024-F03 已修复。末尾 11-07 旧记录仍写「保持 needs-evidence」，以开头 11-13 补采为准（当前会话直接看图）；props 文档标注总数 14 与 Core 类型 13 个成员不符，交 X04；Vue prop 默认仍写 left（回退为 start，未立项）；hover 同类清理模式未执行 |
| C031 | Tag                   | TagsInput、ActivityFeed、CommentThread 及三个 Workflow 组件直接渲染 Tag；12 个关联 Demo 只核源码；use-drag/01 两端仍传不存在的 color=blue（未立项）；现有 Demo 不含 lg、显式 closeAriaLabel 场景                                                                 |
| C047 | ScrollArea            | 未立项线索：双轴 lg 轨道 inset 14px 与 thumb 推导不一致（186 对 200）；横向 shadow 渐变方向；Vue 简例 max-height 字符串透传；Vue Props 类型未列 nativeBars。a11y helper 关闭多条 axe 规则                                                                        |
| C052 | AutoComplete          | 02 Demo 未显示原始 value 也未配 name，恢复时不能凭 label 声称读回底层值；受控父级拒绝选中时两端 hidden 保持原值（未登记缺陷）；恢复预留端口 Vue 8774 / React 8775                                                                                                |
| C054 | Checkbox              | 未升级观察：固定 indeterminate=true 时 happy-dom click 后 input.indeterminate 变 false 而 aria-checked 仍 mixed，待真实浏览器判断；axe helper 关闭 label 等 5 条规则；恢复端口 8778/8779                                                                         |
| C056 | ColorPicker           | 契约澄清建议（未立项）：Core ColorPickerRef 为 focus/open/close，Vue expose 三方法，React forwardRef 实际返回 HTMLButtonElement；运行时模型未核验；恢复端口 8782/8783                                                                                            |
| C079 | Transfer              | 已编号的 F01–F03 已修复；待验证观察：Vue focus() 带 name 时先命中 hidden input、React ref 返回无 tabindex 的根 div，真实聚焦未验；虚拟列表估算行高与真实 CSS、跨窗口 Tab、窄屏布局未验；默认不设 TIGER_A11Y 时组件内 axe 被跳过                                  |
| C080 | TreeSelect            | C080-F02/F03 已修复；SchemaForm 是遗漏的真实消费者；组件测试 axe 只扫 container，portal 树在外；待验证观察：popup tree 自身无 aria-label/aria-labelledby，未立项；懒加载在途时 React 树项 busy=true、Vue 无；勾选策略、加载失败、数据替换竞争未逐一执行          |
| C081 | Upload                | C081-F01–F04、F06 已修复；Demo 04 双端 customRequest 不返回 abort handle、成功响应无 URL，记为示例能力限制未立项；未传 allowedPreviewOrigins 时放行其他 http(s)，该默认政策应写入文档；SchemaForm 与 form/01 是真实消费者                                        |
| C082 | Affix                 | C082-F01/F02 已修复并同验 Anchor、AnchorLink；Anchor 启用 affix 时用 Affix 包裹 nav 且只传 offsetTop。待验证观察：自定义滚动根移动后仅发 window scroll 未更新固定 top，原生 IntersectionObserver 是否补通知未验证，未登记为缺陷                                  |
| C091 | ContextMenuSub        | 待验证：展开后把 disabled 改为 true，4 组仍 aria-expanded=true 且 popup 保留（expanded 不含 disabled），Core 未定义预期，未立项。X01-F017 原判保留未重演。Sub 用例只测开合键                                                                                     |
| C092 | Dropdown              | X02-F001 只确认 chevron 消费链，未证可见失效；Vue 递归 schema 子菜单 role=null、ArrowRight 不展开且不继承外层 portal（未编号观察）；实际消费者含 SplitButton/DataExport/Tabs/WorkflowTimeline                                                                    |
| C103 | NavigationMenuContent | 无独立主责文件与 Demo；4 个 Demo 均未开 viewport，恢复浏览器后仍需另行覆盖；React useFloating 在 floating ref 缺失时逐帧重试，无性能实测、未立项                                                                                                                 |
| C108 | PageHeader            | 22 个主责文件与 8/8 Demo 已读；labels.backAriaLabel 传空串会覆盖 locale 并落到英文 Back（边角，未立项）；AppShell 内 header 在 main 中不是 banner，不记缺陷；Vue subTitle 同为 Boolean 判断但未探针                                                              |
| C110 | ScrollSpy             | 14 个主责文件与 4/4 Demo 已读；与 Anchor 共享 createAnchorObserver；其注释称无 IntersectionObserver 时返回空函数，实际仍挂 scroll/resize（未立项）；DOM 直写 aria-label 会被 locale 默认值盖住                                                                   |
| C111 | Spotlight             | 现有测试未覆盖 hotkey false→true、搜索框上的切换热键、已注册图标名、带查询的 recent 顺序、SSR 首帧 aria-activedescendant；有可见标题时调用方 aria-label 被 aria-labelledby 取代（与现有 locale 测试一致，未立项）                                                |
| C112 | Steps                 | 未立项：Vue 注释 size 写 @default 'default'（实为 md）、clickable 注释误贴 progressDot；error 图标支缺 motion-reduce:transition-none；button 无 focus-visible 类，无计算样式未判缺陷                                                                             |
| C113 | StepsItem             | C113 主责文件 0 个，无独立源文件与 Demo，./StepsItem 与 ./Steps 同模块；按钮类无 focus-visible，无计算样式未立项；React StepsItem displayName 为 null，isStepsItemType 只靠引用匹配（现状非缺陷）                                                                |
| C115 | TabPane               | C115 主责文件 0 个；Vue 标签 aria-label 固定为 props.label；Vue 具名关闭按钮在 tablist 外（sr-only），React 关闭 button 嵌在 role=tab 内并被测试锁定，均未立项；C114 写的 Vue icon 行 289 实为 292                                                               |
| C122 | MessageContainer      | NotificationContainer.ts:243 的 notification-${position} 是同一写法，本报告未另建 ID；props 表 Default 列只读 @default，position/messages 显示「-」；无用例覆盖 Vue 换位与同位双实例                                                                             |
| C123 | Message               | 没有新增 ID。未单列：公开 MessageRoot 只转发五种类型与 clear，不含内层 Message.promise；同位置上限 5 文档未写数字；组件 spec 未直接断言同 key 替换；Infinity 不自动关文档未点名                                                                                  |
| C131 | Calendar              | 无编号观察：view 未就绪时渲染空壳 div，aria-label 用 switchToMonth 且不展开 attrs；Vue expose focus() 而 React 没有；mode 受控时点月份需父级更新才切视图；DatePicker 内部渲染 Calendar，未重审                                                                   |
| C132 | Collapse              | 无编号观察：Vue 根 style 只写 props.style，盖住 attrs.style；点击走 collapseLevelKeys，已测的 togglePanelKey 未用；过渡控制器无生产调用；两端 spec 无方向键测试                                                                                                  |
| C133 | CollapsePanel         | 无编号观察：两端 extra 判断不一致，Vue 传 false 可能留下空 span；面板不透传 data/aria attrs；图标 rtl: 类未经计算样式验证；面板无自己的 Demo 目录和测试文件                                                                                                      |
| C134 | Countdown             | 无编号观察：无 SSS 时不足 1 秒显示 00:00:01 而 finished 为 false（core spec 锁定的既有约定）；Vue title/prefix/suffix 声明为 String 而 Core 为 unknown；change/finish 不在 props 表                                                                              |
| C135 | DataExport            | 无编号观察：Demo fileName=report.xlsx 导出 csv 得 report.xlsx.csv；空数据时带 render 的列被丢（与注释一致）；customExport 不过单元格上限；C092-F01 至 F04 原文是「不在这条调用上」                                                                               |
| C136 | Table                 | 无编号观察：React className 落在 table，Vue 无 className prop、class 落根 wrapper；column.width 为 0 被当未设置；X06 的 w9-bind 依赖 sorts:[] 能查到面板，grid 用例只测一列                                                                                      |
| C137 | Timeline              | 无编号观察：timelineLabelSide 两分支返回值相同；pending 固定在 DOM 末尾，reverse 不挪动（测试锁定）；alternate/right/horizontal 无独立 Demo；ActivityFeed、WorkflowTimeline 内部渲染 Timeline                                                                    |
| C141 | ChartCanvas           | 无主责 spec；实际渲染它的 Demo 是 use-chart-interaction/02（X05），只读源码；width/height 传 0 被清洗成 320×200（X01 主责，未立项）；C132 到 C137 不复现未逐条列 ID                                                                                              |
| C142 | ChartGrid             | 新增发现 0。两端把调用方 aria-hidden 覆盖成 true（装饰节点、测试已锁，未立项）；网格触发的 devWarn 文案仍写 ChartAxis（axis.ts，X01，未立项）；无主责 spec；Demo 仅 use-chart-interaction/02（X05）                                                              |
| C144 | ChartSeries           | 无主责 spec，现有用例只断言 line 的 fill/stroke；表 3/7 的 7 含 React children；无 class 时 SSR 带空 class（未立项）；系列隐藏逻辑在父图；Demo 仅 use-chart-interaction/02（X05）                                                                                |
| C145 | ChartTooltip          | Vue 运行时有 id prop 但 VueChartTooltipProps 未导出（未立项）；BarChart、LineChart 与 interaction demo 都不传 dismiss；无主责 spec；Demo 仅 use-chart-interaction/01、02（X05）                                                                                  |
| C148 | GaugeChart            | 未编号：空字符串 label 使 meter 的 aria-label 为空串并挡住 title；Vue 导出类型缺 bind 但运行时有，生成器只把 bind 算进 React；示例文档只有 value=72；chart-radial.ts 的 Pie、Radar 类型未审                                                                      |
| C151 | OrgChart              | 未编号：可交互节点全是 tabindex 0、方向键无效，nextOrgChartNodeIndex 未被组件调用；组件不传 direction，rtl 布局打不到；Vue 导出类型缺 bind；生成器未执行 Omit，分母 27、真实 core 24                                                                             |
| C152 | PieChart              | 未编号：非交互时中心组 Vue 始终 aria-hidden、React 仅 interactive 时隐藏，未定性；图例隐藏与 C146-F01 同一可见路径；12 个 Demo 都没开 hoverable、selectable；现有测试只锁初始 tabindex                                                                           |
| C153 | RadarChart            | 未编号：React 用例标题写默认隐藏装饰点却传 showTooltip:false，标题与入参不一致；levels 上限 12 不编号；6 个主责 Demo 均未传 title、hoverable、selectable，点默认不可聚焦；C151 整体不适用                                                                        |
| C154 | SankeyChart           | 未编号：width/height 注释默认 320×200，运行时 480×280；没有单独的 SankeyChart.spec，现有用例只断言 data-sankey-link；节点 rect 没有 tabindex 和键盘处理；矩阵其余 88 行属其他任务，仍是 pending                                                                  |
| C155 | ScatterChart          | 未编号：示例文档只有路由和两端各一行 data，没写点形、轴、图例、sizeScale、onPointClick；6 个 Demo 没有「图例 + 只传 onPointClick」组合；selectable 未单独断言选中下标；React 图例按钮点击次数未断言                                                              |
| C156 | SunburstChart         | 未编号：示例文档没写 02 的渐变、标签开关和图例；02 说明写悬停详情却没开 hoverable、selectable、onArcClick，弧默认 aria-hidden；bind.roots 的 DrillHost 未操作折叠；矩阵其余 80 行 pending                                                                        |
| C157 | TreeMapChart          | 未编号：nextTreeMapNodeIndex 没有组件调用，也没有测试；示例文档没写 02 的渐变、标签开关和图例；02 说明写悬停详情却没开 hoverable、selectable、onNodeClick；DrillHost 未操作折叠；矩阵其余 80 行 pending                                                          |
| C158 | WaterfallChart        | 未编号：locale 里没有瀑布图名称键，无 title 时 SVG 的 aria-label 为空，报告不另建缺名发现；矩形没有 tabindex、方向键、图例和 tooltip；空数据、负值和自定义 labels 没有探针；矩阵其余 88 行仍是 pending                                                           |
| C159 | CodeEditor            | 未编号：导出的 VueCodeEditorProps 的 theme 不含 auto 且缺 bind；单组件页「共 1 个组件」是生成器通用行为；FormItem 与调用方 describedby 并存、无 name 的 highlighter、滚动/缩进/括号匹配未单独断言                                                                |
| C160 | Drag                  | 未编号：默认 dragClass tiger-drag-active 无配套 CSS；示例页未写 Vue #item 的 item/attrs/isDragging；Vue 根原生 dragover 被 zone 盖住；React disabled、跨列表落下、空列表、手柄、水平轴未断言                                                                     |
| C161 | FileManager           | 未编号：事件行省略 onReorder、onFilesChange；React Demo 02 的 demo.json 照抄 Vue 的 v-model:files 说明；项类名 transition-colors 未走共享 token；拖拽重排、搜索、跨文件夹导航、空列表、禁用项未单独断言                                                          |
| C163 | InfiniteScroll        | 未编号：root 默认已收成 null，undefined 分支是死代码；height 注释只对 container 根成立，视口根仍加载；disabled 时 Retry 仍发请求；优先列表 direction? 应为 orientation；inverse、横向 RTL 未断言                                                                 |
| C164 | MarkdownEditor        | 未编号：Vue 预览在 split 总加左边框，React 只在非窄屏加；工具按钮未走共享 transition token；w9-bind 只断言包含 bold，锁不住 b/i 被剥；F04 改动在 X01 主责的 w9-data.ts                                                                                           |
| C165 | PrintLayout           | 未编号：现有 spec 名写 tiger-print-content div，实际节点是 TD、页眉是 TH（测试名旧）；ref.print() 克隆根进隐藏 iframe 并复制 html class，0 尺寸 iframe 在真实浏览器的表现未证；对比度为 WCAG 计算值，无暗色截图                                                  |
| C167 | RichTextEditor        | 未编号：Vue 公开类型缺 bind；bind 按钮文字是字面量 table、image；SSR 输出不含初始内容（挂载后才写 innerHTML）；现有 155 项未覆盖七条发现的路径；引擎 rich-text-engine.ts 主责是 X01；C164-F01、F02 仅以「原判不改」带过                                          |
| C168 | VirtualList           | 未编号：React 每行 observeSize、Vue 只在 mounted/updated 量，渲染后高度自变未证；调用方 Tree、TreeSelect、ChatWindow、NotificationCenter 未重审；现有 63 项无方向键用例                                                                                          |
| C171 | AppShell              | 示例文件 28 行起混入数据表 Custom Filters（同 C170-F05 分类附录，未另建 ID）；现有测试未覆盖折叠、页签面板、headerSticky、自定义区域                                                                                                                             |
| C172 | AssigneePicker        | 示例文件 24 行起混入数据表 Custom Filters（同 C170-F05 附录，未另建 ID）；两端 spec 非 C172 主责；现有测试没往搜索框输入，未覆盖无命中文案、点击后活动项、属性透传；Demo 只有两人                                                                                |
| C173 | ChatWindow            | 示例文件 28 行起混入数据表 Custom Filters（同 C170-F05 附录，未另建 ID）；可传 virtual=false 关闭虚拟窗；chat-window-utils.ts 主责 X01                                                                                                                           |
| C174 | CommentThread         | 示例文件 28 行起混入数据表 Custom Filters（未另建 ID）；生成说明「文章是 feed 直接子级」只在未开窗时成立；emitWithReturn 吞同步异常属共享工具（主责 X01）；React 传字符串 style 会抛错，未立项                                                                   |
| C175 | DataTableWithToolbar  | 现有两端 spec 把英文 Reset 写成预期；生成 Uses 漏 Icon（未单列）；title 属性落点两端不同（未立项）；十二个 Demo 都没有查询区；Custom Filters 节被当作分类附录带进其他 composite 示例文件                                                                         |
| C176 | FormWizard            | 生成 Uses 漏 Icon 和 Modal（未单列）；示例文件 28 行起是数据表 Custom Filters 附录，其中 React Input 示例仍属 C175-F06；core 测试「跳过 disabled」口径要随 C176-F03 改；离开框不读 labels                                                                        |
| C177 | NotificationBell      | 没有组件 spec 主文件，现有测试只有一条初次播报；Core NotificationBellProps 两端组件都没引用；两只铃铛可同时开着（未另建 ID）；示例文件 24 行起是数据表 Custom Filters 附录（C175 范围）；C056-F04 的 Vue 侧不复现                                                |
| C178 | NotificationCenter    | 未编号观察：examples/notification-center.md 第 28 行起混入 DataTableWithToolbar 分类附录；React 传字符串 style 会抛错；筛选键盘在 happy-dom 可用；C177-F02 属主仍是 NotificationBell                                                                             |
| C179 | SchemaForm            | 未编号观察：React 未知 type 返回 null 时误报 FormItem supports a single field control；受控值不听更新时 DOM 与模型不同步（未证实回滚）；工作流 readonly 实为 disabled；C160–C178 既有项整体不归并                                                                |
| C180 | TaskBoard             | 未编号观察：列键盘抓取播报把列名套进卡片句子模板；两端都用看板名盖掉调用方 aria-label 与 role；examples/task-board.md 第 28 行起混入 DataTableWithToolbar 一节；C160–C179 既有项整体不归并                                                                       |
| C181 | WorkflowDesigner      | 未编号观察：zh-CN 下重复键横幅仍是英语（属 X02-F004）；两端 role 都被收成 region；examples/workflow-designer.md 第 26 行起混入 DataTableWithToolbar 一节；C160–C180 既有项整体不归并                                                                             |
| C182 | WorkflowDetailShell   | 未编号观察：拒绝时返回实例是原对象、无 formValues（与 utils 同一引用判断一致）；title 传数字 0 回退默认标题；嵌入的 SchemaForm、Timeline、Viewer、ActionBar、Tabs 未复审；C160–C181 其余项不归并                                                                 |
| C183 | WorkflowTimeline      | 同一文件还导出 WorkflowActionBar（C184）；显式 actions 未传 viewerRole 时条目原样显示、不按权限过滤（未编号）；WorkflowViewer 原样画出同一句停放文案（主责 C185）；13 个语言包 workflowTimeline 均 72 键                                                         |
| C185 | WorkflowViewer        | 未编号观察：传 role=list 时根角色仍被写死为 region；分岔图 overflow-x-auto 无 tabindex，窄屏第二列能否用键盘滚出未验证；对比度未测；现有 spec 未覆盖停放对象                                                                                                     |

另有一条：C035 Carousel 的报告记了 C035-O01，Fragment 计页在两端有差异，定性为观察，不是缺陷。
