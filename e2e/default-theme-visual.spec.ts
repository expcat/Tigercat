import { expect, test, type Locator, type Page } from '@playwright/test'

const targets = [
  { framework: 'vue', label: 'Vue', baseUrl: 'http://localhost:5173' },
  { framework: 'react', label: 'React', baseUrl: 'http://localhost:5174' }
] as const

const coreComponentCases = [
  { component: 'button', path: 'button', sectionTitle: '按钮类型' },
  { component: 'input', path: 'input', sectionTitle: '基础用法' },
  { component: 'card', path: 'card', sectionTitle: '卡片变体' },
  { component: 'form', path: 'form', sectionTitle: '基础用法' },
  { component: 'table', path: 'table', sectionTitle: '基础用法' },
  { component: 'tabs', path: 'tabs', sectionTitle: '基本用法' }
] as const

function demoUrl(baseUrl: string, path: string): string {
  return `${baseUrl}/#/${path}`
}

async function preparePage(page: Page, url: string): Promise<void> {
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto(url, { waitUntil: 'networkidle' })
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation-duration: 0s !important;
        animation-delay: 0s !important;
        transition-duration: 0s !important;
        transition-delay: 0s !important;
      }
    `
  })

  await page.evaluate(async () => {
    await document.fonts.ready
    await new Promise(requestAnimationFrame)
    await new Promise(requestAnimationFrame)
  })
}

async function getDemoSection(page: Page, title: string): Promise<Locator> {
  const section = page.locator('section').filter({ hasText: title }).first()
  await section.scrollIntoViewIfNeeded()
  await expect(section).toBeVisible()
  return section
}

for (const { framework, label, baseUrl } of targets) {
  test.describe(`${label} — Default theme visual regression`, () => {
    for (const { component, path, sectionTitle } of coreComponentCases) {
      test(`${component} default theme matches snapshot`, async ({ page }) => {
        await preparePage(page, demoUrl(baseUrl, path))

        const section = await getDemoSection(page, sectionTitle)
        await expect(section).toHaveScreenshot(`${framework}-${component}-default-theme.png`, {
          animations: 'disabled',
          caret: 'hide'
        })
      })
    }
  })
}
