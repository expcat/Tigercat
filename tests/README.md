# Tigercat 测试指南

本目录包含 framework-agnostic core 测试、React/Vue 绑定测试和共享测试工具。本文是测试约定的唯一入口；脚本行为以 `package.json` 与 `vitest.config.ts` 为准。

下一跳：脚本与门禁清单见 [scripts/README.md](../scripts/README.md)；代理约束见 [AGENTS.md](../AGENTS.md)。「按改动范围验证」见下文。

## 目录

```text
tests/
├── core/     # 共享算法、工具、导出与跨框架回归
├── react/    # React 渲染、事件、受控状态与生命周期绑定
├── vue/      # Vue 渲染、emits、响应式状态与生命周期绑定
├── mcp/      # MCP 路由契约
├── utils/    # render、a11y、主题、observer 与 frame helpers
└── setup.ts  # Vitest 全局环境
```

`tests/utils` 只保留在用 helper。新增 helper 前先确认现有 render、a11y、theme、
observer、frame 工具不能满足；不再被任何 spec 引用的 helper 应随改动一并删除。

## 常用命令

```bash
pnpm test                         # 全部单测（本地；跳过逐组件 jest-axe 与 a11y 专用 spec）
pnpm test:core                   # core 测试（不含 a11y 专用 spec）
pnpm test:react                  # React 测试
pnpm test:vue                    # Vue 测试
pnpm test:a11y                   # 跨组件 axe / ARIA 回归
TIGER_A11Y=1 pnpm test            # 对全部组件 spec 跑 jest-axe
pnpm test:group:form             # 指定组件分组
pnpm test:group -- --group data --framework react
pnpm test:coverage               # 按需 coverage 诊断（保留原阈值）
pnpm test:coverage:report        # 按需生成 JSON/HTML 报告
pnpm test:special                # coverage 后定向补跑被排除的 4 个 spec
pnpm e2e                         # Playwright：Chromium + mobile
pnpm e2e:full                    # Playwright：全部浏览器引擎
pnpm test:watch                  # watch mode
pnpm test:ui                     # Vitest UI
```

运行单文件或按名称筛选：

```bash
pnpm vitest run tests/react/Button.spec.tsx
pnpm vitest run -t "opens the menu"
```

组件分组、filter 与 framework 参数见 [scripts/README.md](../scripts/README.md)。

## 编写原则

1. 测行为，不测实现细节。优先断言角色、ARIA、属性、可见内容、事件和受控值；不要断言 Tailwind class 字符串。
2. 每条测试只覆盖一个独立意图。相同代码路径的 controlled/uncontrolled、键盘/鼠标或多个变体优先合并为代表性用例或 `it.each`。
3. 不写 snapshot 测试；直接断言需要保护的行为。
4. 共享纯逻辑只在 `tests/core` 测一次；React/Vue spec 只验证各自的绑定、渲染、事件、slots/children、生命周期和无障碍接线。
5. 交互组件每个框架保留一条 `expectNoA11yViolations` 调用（默认 `pnpm test` 不执行 axe，避免约占全量 20% 的扫描时间）。键盘与 ARIA 断言始终跑。`a11y-aa-regression` / `a11y-interactive-regression` / `composite-a11y-roles` 不进默认 `pnpm test`，只走 `pnpm test:a11y`。需要全量 axe 时用 `TIGER_A11Y=1 pnpm test`。
6. 不使用任意 timeout 等待；使用 `waitFor`、`findBy*`、observer mock 或 frame scheduler 驱动状态。
7. 测试必须独立，不依赖执行顺序或跨测试共享的可变状态。
8. 默认环境是 `happy-dom`。不需要 DOM 的 spec 必须用文件头 docblock 显式声明 `@vitest-environment node`，不要在 node 环境 spec 里依赖 `window`。

新 spec 的导入方式可参考 [React Button](react/Button.spec.tsx) 与 [Vue Button](vue/Button.spec.ts)；只参考当前所需行为和对应框架的 helper，不复制整套用例。新增 helper 前先检查现有 render、a11y、theme、observer 和 frame 工具。

组件 spec 从已发布子路径导入（`@expcat/tigercat-vue/Button` / `@expcat/tigercat-react/Button`），避免根 barrel 求值全部组件。不要在 spec 里 `import('@expcat/tigercat-react')` 动态拉整包。

## 执行模型

`vitest.config.ts` 把测试拆成两个 project：

| Project     | Pool      | 范围                      | 原因                                       |
| ----------- | --------- | ------------------------- | ------------------------------------------ |
| `unit`      | `threads` | 除 fork-only 外的 spec    | worker thread 复用比每文件 fork 进程快得多 |
| `fork-only` | `forks`   | `FORK_ONLY_SPECS` 的 5 个 | 见下                                       |

`FORK_ONLY_SPECS` 目前包含：

- `tests/core/cli.spec.ts` —— 用 `process.chdir()`，worker thread 不支持。
- `tests/core/imperative-side-effects.spec.ts` —— 保留独立进程；包根命令会懒加载实现，
  助手必须在同一次异步 `act` 中明确等待 `vi.dynamicImportSettled()`。
  fork 本身没有消除该根入口挂载超时。
- `tests/react/Notification.spec.tsx`、`tests/vue/Message.spec.ts`、
  `tests/vue/Notification.spec.ts` —— 挂载进程级
  Message/Notification 容器并依赖真实定时器，共享 worker 线程的事件循环争用会让
  1s `waitFor` 偶发超时，使用独立进程隔离争用。

新 spec 若需要 `process.chdir()`、原生模块、其他线程不安全 API，或挂载进程级全局
容器，请加入 `FORK_ONLY_SPECS` 并在此登记；不要为它关闭全局隔离，也不要靠调大
timeout 掩盖。

默认 `pnpm test` 同时运行 `unit` 与 `fork-only` 两个 project，包含全部 5 个
fork-only spec；仅排除 a11y 专用三件套（它们只走 `pnpm test:a11y`）。
coverage 运行额外排除上面 4 个命令式 API spec（`COVERAGE_EXCLUDED_SPECS`），
保留 `cli.spec.ts` 的独立 fork；按需运行 coverage 后，用 `pnpm test:special`
定向补跑这 4 个 spec。排除项写在配置里而不是 CLI `--exclude`：`projects`
不继承 CLI 的 include/exclude 过滤器。

**文件级隔离保持开启**：每个 spec 文件都拿到干净的模块注册表。测试之间不得依赖
执行顺序或跨文件共享的可变状态（模块级缓存、全局 registry、未清理的事件监听）。

测试只在本地运行。不要把 `pnpm test`、coverage 或 Playwright 接到
`.github/workflows/`；发布 Action 只安装、构建和发布。

## E2E

Playwright 按顺序构建 Vue 与 React 示例（包含各自完整类型检查），再在专用严格端口
4173 / 4174 启动 production preview，测试 `/Tigercat/vue/` 与 `/Tigercat/react/` 下的
真实构建产物。每次运行重新构建，不复用已有服务器；开发服务器不参与 E2E。
测试直接保留首个导航或断言错误，不在用例内恢复导航或递归重试。

默认 `pnpm e2e` 只跑 Chromium 与 `mobile-chromium`（触控 spec）。
`pnpm e2e:full` 才跑 Firefox / WebKit，供本地发版前抽查。`pnpm e2e:smoke` 只跑
example shell。不要把与单测重复的按钮点击、输入填值、图表 SVG 冒烟写进 e2e；
e2e 只留真实浏览器才有意义的路径（playground iframe、portal/overlay 碰撞、
原生滚动条/拖滑块、触控滑动、右键菜单）。

## 自动门禁（仅本地）

发布门禁运行 `pnpm test` 与 `pnpm test:a11y`，覆盖完整行为单测和独立 axe / ARIA
回归。Vitest 启用 `forbidOnly` 拒绝 `.only`，未收集到测试的 spec 由实际测试运行
报错。

Coverage 与全量 size-limit 是按需诊断，不阻塞 `quality:release`。Coverage 阈值仍由
`vitest.config.ts` 统一维护：lines 85%、statements 83%、functions 84%、branches 76%；
`pnpm size` 使用现有 `.size-limit.json` 与当前构建产物。真实 tarball 消费、Button
子路径预算与 tree-shaking 检查继续由发布门禁中的 `publish:check` 执行。

## 按改动范围验证

这是全仓库的唯一一份改动范围 → 验证命令映射，其他文档只链接到这里。

| 改动范围                     | 运行                                                                                                                                         |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| 单组件                       | 对应单文件 + `pnpm test:group:<group>`；必要时用 `--framework` / `--filter` 再缩小                                                           |
| 跨组共享 helper              | 所有受影响 group 的 `pnpm test:group:<group>`，再补 focused `vitest run` core spec                                                           |
| 文档或 Example               | `pnpm docs:links`、`pnpm docs:api:check`、`pnpm example:sources:check`、相关 examples 检查与 changed-file Prettier；无需运行无关的完整测试集 |
| public API、发布面或门禁策略 | `pnpm quality:release`，并按需 `pnpm e2e`                                                                                                    |

发布验证必须在本地手动完成并记录结果。发布 Action 只执行安装、构建和发布；不要向
`.github/workflows/` 添加 `quality:release`、测试、coverage、SSR、e2e 或
publish smoke 等 CI 门禁。

提交前确认测试保护的是用户可观察行为、没有重复覆盖共享逻辑，也没有通过扩大等待时间掩盖不稳定性。
