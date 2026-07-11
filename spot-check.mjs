import { chromium } from '@playwright/test'
import { mkdirSync } from 'node:fs'

const outDir = process.env.SPOT_OUT ?? 'spot-shots'
mkdirSync(outDir, { recursive: true })

const targets = [
  { app: 'react', base: 'http://[::1]:5280', routes: ['button', 'select', 'table', 'modal', 'drawer', 'upload', 'line-chart', 'data-table-with-toolbar'] },
  { app: 'vue', base: 'http://[::1]:5281', routes: ['button', 'select', 'table', 'modal'] }
]

async function waitReady(page) {
  const statuses = page.locator('[data-demo-id] [aria-live="polite"]')
  const deadline = Date.now() + 90_000
  // Scroll through the page so lazy modules compile.
  for (let i = 0; i < 12; i++) {
    await page.mouse.wheel(0, 800)
    await page.waitForTimeout(250)
  }
  await page.evaluate(() => window.scrollTo(0, 0))
  while (Date.now() < deadline) {
    const texts = await statuses.allTextContents()
    if (texts.length > 0 && texts.every((t) => /^(ready|compile-error|runtime-error)$/.test(t))) {
      return texts
    }
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
        await page.screenshot({ path: `${outDir}/${app}-${route}-${mode}.png`, fullPage: mode !== 'mobile-light' })
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
