# Tigercat 测试指南

本目录包含 framework-agnostic core 测试、React/Vue 绑定测试和共享测试工具。本文是测试约定的唯一入口；脚本行为以 `package.json`、`vitest.config.ts` 与 `scripts/validate-tests.mjs` 为准。

## 目录

```text
tests/
├── core/     # 共享算法、工具、导出与跨框架回归
├── react/    # React 渲染、事件、受控状态与生命周期绑定
├── vue/      # Vue 渲染、emits、响应式状态与生命周期绑定
├── utils/    # render、a11y、主题、observer 与 frame helpers
└── setup.ts  # Vitest 全局环境
```

## 常用命令

```bash
pnpm test                         # 全部测试
pnpm test:core                   # core 测试
pnpm test:react                  # React 测试
pnpm test:vue                    # Vue 测试
pnpm test:group:form             # 指定组件分组
pnpm test:group -- --group data --framework react
pnpm test:coverage               # 发布门禁使用的 coverage
pnpm test:coverage:report        # 按需生成 JSON/HTML 报告
pnpm test:validate               # 测试质量检查
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
5. 交互组件每个框架保留一条 `expectNoA11yViolations` 检查，并针对真实风险补充键盘与 ARIA 断言。
6. 不使用任意 timeout 等待；使用 `waitFor`、`findBy*`、observer mock 或 frame scheduler 驱动状态。
7. 测试必须独立，不依赖执行顺序或跨测试共享的可变状态。

`tests/react/ComponentTemplate.spec.tsx.template` 与 `tests/vue/ComponentTemplate.spec.ts.template` 提供最小模板。共享 helper 从 `tests/utils` 导入；新增 helper 前先检查现有 render、a11y、theme、observer 和 frame 工具。

## 自动门禁

`pnpm test:validate` 的硬错误：

- spec 没有收集到测试；
- 存在 `.only`；
- 非注释代码中使用 `: any`。

以下仅为建议警告：

- 少于一半测试名包含可识别的行为动词；
- React/Vue 组件 spec 没有 `expectNoA11yViolations`。

Coverage 阈值由 `vitest.config.ts` 统一维护，当前为 lines 85%、statements 83%、functions 84%、branches 76%。不要在文档或单个 spec 中另设一套阈值。

## 按改动范围验证

- 单组件：运行对应单文件和 `pnpm test:group:<group>`。
- 共享 helper：运行所有受影响 group，并补充 focused core spec。
- public API 或发布面：运行 `pnpm quality:release`，并按需执行 `pnpm e2e`。
- 文档或 Example：运行相关 docs/examples 检查和 changed-file Prettier；无需运行无关的完整测试集。

提交前确认测试保护的是用户可观察行为、没有重复覆盖共享逻辑，也没有通过扩大等待时间掩盖不稳定性。
