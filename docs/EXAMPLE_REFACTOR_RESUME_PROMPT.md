# 交接提示词：Example 单示例精简改造 — 剩余验证

> 本文件是交给另一台机器上的 Agent 的完整任务提示词。将「任务提示词」一节整体作为初始 prompt 使用。

## 交接前提（本机操作，Agent 无法代劳）

改造目前是 **未提交的本地变更**（约 1800 个文件，含 900+ 删除）。交接前必须在本机：

```bash
git add -A && git commit -m "refactor(examples): 单示例精简与复合展示改造"
git push origin main   # 或推到专用分支
```

若推到非 main 分支，把下文提示词中的分支名替换掉。

---

## 任务提示词（以下内容整体交给目标机器的 Agent）

继续完成 Tigercat 仓库「Example 单示例精简与复合展示改造」的收尾验证。**实现已全部完成并推送，你只做验证和报告**：不要改动示例内容（`examples/example/*/src/examples/**`）、校验脚本（`scripts/validate-example-sources.mjs`）、E2E spec（`e2e/*.ts`）或任何公共组件代码。验证失败时先判断是环境问题还是真实回归，报告后等待指示，不要自行"修复"示例。

### 仓库与环境

- 仓库：`git@github.com:expcat/Tigercat.git`，分支 `main`（monorepo，pnpm workspace）。
- 要求 Node >= 22.13.0；包管理器 pnpm 11.9.0。若机器没有 corepack/pnpm，所有命令用 `npx -y pnpm@11.9.0` 代替 `pnpm`（下文统一写 `pnpm`，自行替换）。
- 初始化：
  ```bash
  git clone git@github.com:expcat/Tigercat.git && cd Tigercat
  pnpm install
  pnpm exec playwright install chromium firefox webkit   # E2E 需要；只跑必测项可仅装 chromium
  ```
- 环境自检（确认拿到的是改造后的代码）：
  ```bash
  find examples/example/react/src/examples -name demo.json | wc -l   # 必须是 221
  find examples/example/vue3/src/examples -name demo.json | wc -l    # 必须是 220
  ```
  数字不对说明分支/提交不对，停下报告。

### 背景：已在源机器上验证通过的部分（不必重复，但快速门禁可作环境自检重跑）

| 项 | 结果 |
|---|---|
| `pnpm example:sources:check` | 通过（221 React + 220 Vue；脚本已动态化，无硬编码数量） |
| `pnpm example:build` | 通过（含 `tsc`/`vue-tsc`，examples 的 `noUnusedLocals: true` 门禁生效） |
| changed-file Prettier + `git diff --check` | 通过 |
| 针对性 E2E：`e2e/playground.spec.ts` `e2e/components.spec.ts` `e2e/interaction.spec.ts`（chromium，38 项） | 通过 |
| `e2e/mobile-touch.spec.ts`（mobile-chromium，2 项） | 通过 |
| 全路由巡检 `e2e/example-runtime.spec.ts`（chromium）| 跑到 12/20 组时因耗时被取消；已完成的 Vue 全部 10 组 + React basic 组 **零失败** |

### 待执行任务（按顺序）

E2E 由 `playwright.config.ts` 的 `webServer` 自动启动两个 Vite dev server（Vue `127.0.0.1:5173` / React `127.0.0.1:5174`），无需手动起服务。`workers: 1` 是刻意配置，不要改。

**1. 补完全路由运行时巡检的 React 部分**（约 10–20 分钟）

```bash
pnpm exec playwright test e2e/example-runtime.spec.ts --project=chromium --grep "React" --reporter=line > sweep-react.log 2>&1
echo "EXIT=$?" && tail -30 sweep-react.log
```

- 该 spec 逐路由滚动触发所有 demo 模块的浏览器内编译，断言状态为 `ready` 且无 `role="alert"`。
- **判定看退出码，不看输出是否安静**；不要用 `... | tail` 直接接管道（会用 tail 的退出码掩盖失败）。
- 失败时看 `test-results/*/error-context.md`。若错误是 `chrome-error://chromewebdata/` 或连接拒绝，是 dev server 掉了（环境问题），确认 5173/5174 无残留监听进程后重跑；若是 `compile-error`/`runtime-error` 加具体模块 ID，才是真实回归，报告模块 ID 和 alert 文本。

**2. 浏览器亮/暗主题与桌面/移动布局抽查**（约 5–10 分钟）

仓库里没有现成脚本，按下文创建 `spot-check.mjs`（放仓库根，用完删除，不要提交）：

```js
import { chromium } from '@playwright/test'
import { mkdirSync } from 'node:fs'

mkdirSync('spot-shots', { recursive: true })

const targets = [
  { app: 'react', base: 'http://127.0.0.1:5174', routes: ['button', 'select', 'table', 'modal', 'drawer', 'upload', 'line-chart', 'data-table-with-toolbar'] },
  { app: 'vue', base: 'http://127.0.0.1:5173', routes: ['button', 'select', 'table', 'modal'] }
]

async function waitReady(page) {
  const statuses = page.locator('[data-demo-id] [aria-live="polite"]')
  const deadline = Date.now() + 90_000
  for (let i = 0; i < 12; i++) {
    await page.mouse.wheel(0, 800)
    await page.waitForTimeout(250)
  }
  await page.evaluate(() => window.scrollTo(0, 0))
  while (Date.now() < deadline) {
    const texts = await statuses.allTextContents()
    if (texts.length > 0 && texts.every((t) => /^(ready|compile-error|runtime-error)$/.test(t))) return texts
    await page.waitForTimeout(500)
  }
  return statuses.allTextContents()
}

const browser = await chromium.launch()
const problems = []

for (const { app, base, routes } of targets) {
  for (const route of routes) {
    for (const [mode, opts] of [
      ['desktop-light', { viewport: { width: 1280, height: 900 }, colorScheme: 'light' }],
      ['desktop-dark', { viewport: { width: 1280, height: 900 }, colorScheme: 'dark' }],
      ['mobile-light', { viewport: { width: 390, height: 844 }, colorScheme: 'light', isMobile: true, hasTouch: true }]
    ]) {
      const context = await browser.newContext(opts)
      const page = await context.newPage()
      try {
        await page.goto(`${base}/#/${route}`, { waitUntil: 'domcontentloaded', timeout: 30_000 })
        const statuses = await waitReady(page)
        const bad = statuses.filter((t) => t !== 'ready')
        if (bad.length > 0) {
          const alerts = await page.locator('[role="alert"]').allTextContents()
          problems.push(`${app}/${route} [${mode}]: ${bad.join(',')} :: ${alerts.join(' | ').slice(0, 300)}`)
        }
        await page.screenshot({ path: `spot-shots/${app}-${route}-${mode}.png`, fullPage: mode !== 'mobile-light' })
      } catch (error) {
        problems.push(`${app}/${route} [${mode}]: ${String(error).slice(0, 200)}`)
      } finally {
        await context.close()
      }
    }
  }
}

await browser.close()
if (problems.length > 0) {
  console.error('PROBLEMS:')
  for (const p of problems) console.error('- ' + p)
  process.exit(1)
}
console.log('All spot-check routes rendered ready in light/dark/mobile.')
```

执行步骤：

```bash
# 两个终端/后台分别启动（--host 127.0.0.1 保证 IPv4 可达；某些机器 Vite 默认只听 IPv6 ::1）
pnpm --filter @expcat/tigercat-example-vue3 dev --host 127.0.0.1 --port 5173 --strictPort
pnpm --filter @expcat/tigercat-example-react dev --host 127.0.0.1 --port 5174 --strictPort
# 就绪后
node spot-check.mjs
```

- 脚本退出码 0 = 全部 ready；再人工翻看 `spot-shots/` 截图，确认暗色主题下文字/背景对比正常、移动视口无横向溢出、同屏没有并发的同类浮层（Modal/Message/Notification 任一时刻至多一个流程）。
- 检查完删除 `spot-check.mjs` 和 `spot-shots/`。

**3. `pnpm quality:release`**（约 30–60 分钟，最后一道长门禁）

```bash
pnpm run quality:release > quality-release.log 2>&1
echo "EXIT=$?" && tail -40 quality-release.log
```

- 串行包含：release:check → lint → types:check → api:validate → test:coverage → test:special → api:baseline:check → exports:check → docs:api:check → size → publish:check → test:validate → example:sources:check → example:build → SSR check。
- 本次改造只动了 examples、e2e 和 examples 校验脚本，未动任何包源码或公共 API，因此 **任何包级失败（types、api、size、coverage）都大概率是该机器的环境差异而非本次回归**——对比失败项与改动面，报告而非乱修。
- 注意：源机器（Windows）上全仓 `prettier`/`tsc` 存在与本次改造无关的预存红色噪声；如果目标机器同样失败，先检查失败文件是否在本次改动范围内（`git show --stat HEAD`）。

**4. （可选，发布前）跨浏览器全量**

```bash
pnpm e2e   # 全部 spec × chromium/firefox/webkit + mobile-chromium，1 小时以上
```

被跳过的仅是 firefox/webkit 对已通过用例的重复执行，优先级最低。

### 完成报告格式

逐项列出：命令、退出码、耗时、失败摘要（若有：模块 ID / spec 名 / 日志关键行），以及 spot-shots 截图中发现的视觉问题清单（无问题也要明确说"已翻看，无异常"）。不要提交任何文件；`sweep-react.log`、`quality-release.log`、`spot-check.mjs`、`spot-shots/` 用完全部删除。
