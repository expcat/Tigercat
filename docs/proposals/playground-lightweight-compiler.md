# 提案:示例站 Playground 轻量编译器(sucrase 替换 esbuild-wasm)

> 状态:已实施(2026-07-15)
> 日期:2026-07-15
> 目标:消除 GitHub Pages 示例站打开组件展示页时"正在准备独立示例…"的编译等待,同时完整保留"编辑源码 → 重新运行 → 更新展示"的能力。

## 1. 背景与现状机制

示例站(`/Tigercat/react/`、`/Tigercat/vue/`)中每个示例由 `DemoBlock` 渲染,完整链路:

1. **视口懒触发**:`examples/example/react/src/components/DemoBlock.tsx`(vue3 有对应实现)用 IntersectionObserver(rootMargin 500px)在示例块接近视口时启动加载。
2. **取源码**:`examples/example/{react,vue3}/src/playground/registry.ts` 通过 `import.meta.glob(..., { query: '?raw' })` 懒加载示例源码字符串,拼成 `{ entry, files, sourceHash }`。
3. **浏览器内编译**:单例 Web Worker(`examples/example/{react,vue3}/src/playground/compiler.worker.ts`)首次编译前初始化 **esbuild-wasm 0.28.1**,`esbuild.build()` 产出 `{ js, css, imports }`;Vue 站在 esbuild 之前先用 **@vue/compiler-sfc** 把 SFC 编成 JS + CSS。
4. **iframe 沙箱**:`examples/example/shared/playground/sandbox.ts` 生成 srcDoc——importmap 把裸导入(react/vue/@expcat/*)映射到预构建 runtime chunk,编译出的 JS 转 blob URL 后 `import` 挂载。

**瓶颈在第 3 步**:`esbuild.wasm` 体积 13MB(gzip 约 3-4MB),下载 + WebAssembly 实例化耗时秒级,且编译结果零持久缓存,刷新即重来。编译本身只需毫秒,用户等的几乎全是 wasm。

## 2. 关键事实(方案成立的前提,已核实)

| 事实 | 含义 |
|---|---|
| 全部 441 个示例(React 221 + Vue 220)均为**单文件**(App.tsx / App.vue + demo.json),**零相对导入** | esbuild 的打包(bundle)能力完全没被用到,它实际只做 ① TS/JSX 转译 ② 收集裸导入供 importmap |
| 220 个 Vue 示例全用 `<script setup lang="ts">` | SFC 编译本来就靠 @vue/compiler-sfc(纯 JS,已在 vue worker chunk 内,约 835KB),与 wasm 无关;esbuild 只负责脱 TS 类型 |
| 沙箱只消费 `{ js, css, imports }` 三元组 | 对"编译器是谁"毫无感知,替换编译器不影响 sandbox/importmap/DemoBlock |
| Vue 官方 SFC Playground(@vue/repl,play.vuejs.org)即 compiler-sfc + **sucrase**、无打包器 | 生产级先例,路线成熟 |

结论:13MB wasm 是在为一个"转译单文件"的任务买单。用纯 JS 转译器 **sucrase** 原位替换即可,无需引入构建期预编译等重型机械。

## 3. 推荐方案:sucrase 原位替换 esbuild-wasm

改动仅限两个 `compiler.worker.ts` 内部,架构、数据流、编辑路径全部不动。

### 3.1 React worker

`examples/example/react/src/playground/compiler.worker.ts`:

```ts
import { transform } from 'sucrase'

const result = transform(source, {
  transforms: ['typescript', 'jsx'],
  jsxRuntime: 'automatic',
  production: true // 必须:走 react/jsx-runtime,与现有 importmap 对齐;否则引 react/jsx-dev-runtime
})
```

### 3.2 Vue worker

`examples/example/vue3/src/playground/compiler.worker.ts`:

- `compileVueFile()`(compiler-sfc 的 parse/compileScript/compileStyle,含 scoped CSS 收集)**原样保留**;
- 其输出仍含 TS 类型,再过一遍 `transform(code, { transforms: ['typescript'] })` 即得最终 JS。

### 3.3 裸导入收集与白名单

esbuild 的 `onResolve` 钩子由 **es-module-lexer**(约 7KB,Vite 自身依赖)替代:解析转译产物的 import 语句,得到裸导入列表供 `imports` 字段(importmap 用)。

- 沿用 `examples/example/shared/playground/compiler-utils.ts` 的 `isAllowedImport` / `isBareImport` 白名单校验,不允许的导入照旧报"不允许导入外部模块:…";
- 相对导入直接报"找不到示例文件:…"(现状零使用,见 §5 未来扩展)。

注意 es-module-lexer 需一次 `await init`(内联微型 wasm,毫秒级),放在 worker 顶部即可。

### 3.4 删除与保留

- **删除**:`esbuild-wasm` 依赖、`esbuild.wasm?url` 引用、`ensureEsbuild()` 初始化、`demo-files` esbuild 插件。
- **保留 Worker 形态**:继续在 Web Worker 里跑(滚动时批量编译不卡主线程),仅替换内部实现;`{ type: 'compile', requestId, bundle }` 消息协议与 `{ js, css, imports }` 产物形状不变。
- **完全不动**:registry、DemoBlock、sandbox、importmap、`vite-runtime-plugin.ts`、`deploy.yml`。编辑 → 运行走同一条编译路径,"可编辑后更改显示效果"天然保留,`e2e/playground.spec.ts` 继续全覆盖。

### 3.5 收益对比(体积为估算,以实测为准)

| 指标 | 现状(esbuild-wasm) | 本方案(sucrase) |
|---|---|---|
| 编译器下载 | 13MB wasm(gzip 3-4MB)+ worker chunk(React 70KB / Vue 835KB) | React worker 约 300KB min(gzip ~70KB);Vue worker 在原 835KB 基础上 −wasm +sucrase |
| 初始化 | wasm 下载 + 实例化,秒级 | 无(纯 JS,es-module-lexer init 毫秒级) |
| 单示例编译 | 毫秒级(但首个示例被 wasm init 挡住) | 毫秒级,首个示例即达 |
| 编辑后重新运行 | 同左(wasm 已就绪时快) | 同路径同快 |
| 类型检查 | 无(esbuild 本就不做) | 无(等价,类型错误由仓库 tsc/vue-tsc 兜底) |

## 4. 细节与风险

- **sucrase 的 TS 子集限制**:不支持少数遗留语法(如跨文件 `const enum` 语义、部分 namespace 用法);`import type` 与仅类型使用的导入会正确擦除。
  **缓解**:新增 node 校验脚本(仿 `scripts/validate-example-sources.mjs` 先例,如 `scripts/validate-example-compile.mjs`),用与 worker 同一份 transform 配置全量编译 441 个示例(纯 JS,秒级),挂进 CI / `example:sources:check` 同级质量门,在提交/部署前拦截不兼容语法。理想形态是把"transform 配置 + 导入扫描"提炼成 worker 与脚本共用的小模块,避免两份漂移。
- **sourcemap**:现状产 inline sourcemap 仅为排错锦上添花。示例是单文件短代码,建议不再生成(sucrase 支持但默认关),产物更小;需要时再开。
- **jsx production 语义**:`production: true` 意味着不产 `__source`/`__self` 调试信息,与线上站定位一致。
- **@vue/compiler-sfc 仍在关键路径**:Vue 站首个示例前仍需加载 worker chunk(内含 compiler-sfc),但它是纯 JS、单次加载、无实例化开销,与现状相比净减一个 13MB wasm。

## 5. 未来扩展:多文件示例(现状不存在)

若将来需要多文件示例,两条路(实现时二选一):

- **a. 锁死单文件规则**(最简):校验脚本断言每个示例目录除 demo.json 外仅一个源文件,越界即 CI 失败;
- **b. 小型模块图**(约 50 行):逐文件 transform → es-module-lexer 定位相对导入 specifier 的字符区间 → 按依赖自底向上创建 blob URL 并改写 specifier(示例间无循环依赖的前提下成立,Vue REPL 同思路)。

## 6. 备选方案对比(为何不选)

| 方案 | 思路 | 评价 |
|---|---|---|
| A. 构建期 AOT 预编译 | Vite 插件在 build 时用原生 esbuild 把全部示例预编译成 JSON 资产,运行时 fetch;`sourceHash` 校验命中 | 展示零编译,但需新增插件、manifest 虚拟模块、preview 冒烟 e2e 一整套机械,且编辑路径仍要保留 13MB wasm——重 |
| **B. sucrase 替换(本提案)** | 换编译器,架构不动 | 改动集中在 2 个 worker + 1 个校验脚本;展示与编辑同路径同快;唯一交付风险(TS 子集)有 CI 拦截 |
| C. sourceHash 持久缓存 | 编译结果按 registry 已算好的 sourceHash 存 IndexedDB | 首访无改善、wasm 仍在关键路径;只可作 B 的锦上添花 |
| B+A 组合 | 先 B,不够快再叠 A | B 落地后编译已毫秒级,预计无必要;上线后若仍有体感等待再议 |

## 7. 实施清单(后续执行)

1. `examples/example/react/src/playground/compiler.worker.ts`:esbuild → sucrase(§3.1)+ es-module-lexer 导入扫描(§3.3)。
2. `examples/example/vue3/src/playground/compiler.worker.ts`:保留 compileVueFile,esbuild → sucrase typescript(§3.2)+ 导入扫描。
3. `examples/example/shared/playground/compiler-utils.ts`:新增"扫描并校验导入"的共享辅助(worker 与校验脚本共用);`loaderForFile`/`resolveDemoFile` 等 esbuild 专属辅助视引用情况清理。
4. 依赖:两站 package.json `+sucrase +es-module-lexer −esbuild-wasm`(catalog 同步更新 pnpm-workspace.yaml)。
5. 新增 `scripts/validate-example-compile.mjs` 并挂进 CI 质量门(§4)。
6. 类型:`types.ts` 的消息协议不变;若清理 esbuild 类型引用(`compiler-utils.ts` 顶部的 `Loader`/`Message` type import)需一并处理。

## 8. 验证步骤(后续执行)

1. `pnpm dev` 起两个示例站,肉眼验证:打开组件页示例近即时出现;编辑源码 → 运行 → 展示更新;重置恢复。
2. `pnpm exec playwright test e2e/playground.spec.ts`(编辑/运行/重置/编译错误保留预览)全部通过。
3. `node scripts/validate-example-compile.mjs` 全量 441 示例编译通过。
4. `pnpm example:build` 成功,确认两站 dist 中不再出现 `esbuild-*.wasm`,worker chunk 体积符合 §3.5 预期。
5. 常规质量门(`example:sources:check` 等)不受影响。
