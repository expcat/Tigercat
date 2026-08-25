import { expect, type FrameLocator, type Locator, type Page } from '@playwright/test'

export const exampleApps = [
  { framework: 'Vue', baseUrl: 'http://127.0.0.1:5173' },
  { framework: 'React', baseUrl: 'http://127.0.0.1:5174' }
] as const

export function demoUrl(baseUrl: string, route: string): string {
  return `${baseUrl}/#/${route}`
}

export async function openDemo(
  page: Page,
  baseUrl: string,
  route: string,
  demoId: string,
  attempt = 0
): Promise<{ moduleRoot: Locator; preview: FrameLocator }> {
  const url = demoUrl(baseUrl, route)
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30_000 })
  } catch (error) {
    if (attempt >= 2) throw error
    await page.goto('about:blank')
    return openDemo(page, baseUrl, route, demoId, attempt + 1)
  }
  const moduleRoot = page.locator(`[data-demo-id="${demoId}"]`)
  try {
    await expect(moduleRoot).toBeVisible({ timeout: 30_000 })
  } catch (error) {
    if (attempt >= 2) throw error
    await page.goto('about:blank')
    return openDemo(page, baseUrl, route, demoId, attempt + 1)
  }
  await moduleRoot.scrollIntoViewIfNeeded()
  try {
    await expect(moduleRoot.locator('iframe')).toBeVisible({ timeout: 60_000 })
  } catch (error) {
    if (attempt >= 2) throw error
    await page.goto('about:blank')
    return openDemo(page, baseUrl, route, demoId, attempt + 1)
  }
  const status = moduleRoot.locator('[aria-live="polite"]')
  await expect(status).toHaveText(/^(ready|compile-error|runtime-error)$/, { timeout: 60_000 })
  const finalStatus = await status.textContent()
  if (finalStatus !== 'ready') {
    const diagnostics = await moduleRoot.locator('[role="alert"]').allTextContents()
    const detail = diagnostics.join(' | ')
    if (
      attempt < 2 &&
      /Failed to fetch dynamically imported module: blob:|error loading dynamically imported module|Importing a module script failed|doesn't provide an export named/i.test(
        detail
      )
    ) {
      return openDemo(page, baseUrl, route, demoId, attempt + 1)
    }
    expect(finalStatus, `${demoId}: ${detail}`).toBe('ready')
  }
  return { moduleRoot, preview: moduleRoot.frameLocator('iframe') }
}

/** Scroll the host page so a tall overlay iframe footer is in the page viewport. */
export async function revealDemoIframe(moduleRoot: Locator): Promise<void> {
  await moduleRoot.locator('iframe').evaluate((el: HTMLElement) => {
    el.scrollIntoView({ block: 'end', inline: 'nearest' })
  })
}

/** Fire a paste event with clipboardData. Firefox ignores ClipboardEvent's constructor clipboardData. */
export async function dispatchPaste(locator: Locator, text: string): Promise<void> {
  await locator.evaluate((el: HTMLElement, value: string) => {
    const data = new DataTransfer()
    data.setData('text/plain', value)
    data.setData('text', value)
    const event = new Event('paste', { bubbles: true, cancelable: true })
    Object.defineProperty(event, 'clipboardData', { configurable: true, value: data })
    el.dispatchEvent(event)
  }, text)
}
