import { expect, type FrameLocator, type Locator, type Page } from '@playwright/test'

export const exampleApps = [
  {
    framework: 'Vue',
    packageName: '@expcat/tigercat-example-vue3',
    baseUrl: 'http://127.0.0.1:4173/Tigercat/vue/'
  },
  {
    framework: 'React',
    packageName: '@expcat/tigercat-example-react',
    baseUrl: 'http://127.0.0.1:4174/Tigercat/react/'
  }
] as const

export function demoUrl(baseUrl: string, route: string): string {
  return new URL(`#/${route}`, baseUrl).toString()
}

export async function openDemo(
  page: Page,
  baseUrl: string,
  route: string,
  demoId: string
): Promise<{ moduleRoot: Locator; preview: FrameLocator }> {
  const url = demoUrl(baseUrl, route)
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30_000 })
  const moduleRoot = page.locator(`[data-demo-id="${demoId}"]`)
  await expect(moduleRoot).toBeVisible({ timeout: 30_000 })
  // Example shell scrolls Layout Content, not the window.
  await moduleRoot.scrollIntoViewIfNeeded()
  await moduleRoot.evaluate((el: HTMLElement) => {
    const sticky = document.querySelector<HTMLElement>(
      '.sticky.top-0, [class*="sticky"][class*="top-0"]'
    )
    if (!sticky) return
    const overlap = sticky.getBoundingClientRect().bottom - el.getBoundingClientRect().top + 8
    if (overlap <= 0) return
    let node: HTMLElement | null = el.parentElement
    while (node) {
      const style = getComputedStyle(node)
      if (/(auto|scroll)/.test(style.overflowY) && node.scrollHeight > node.clientHeight) {
        node.scrollTop -= overlap
        return
      }
      node = node.parentElement
    }
    if (document.scrollingElement) document.scrollingElement.scrollTop -= overlap
  })
  await expect(moduleRoot.locator('iframe')).toBeVisible({ timeout: 60_000 })
  const status = moduleRoot.locator('[aria-live="polite"]')
  await expect(status).toHaveText(/^(ready|compile-error|runtime-error)$/, { timeout: 60_000 })
  const finalStatus = await status.textContent()
  if (finalStatus !== 'ready') {
    const diagnostics = await moduleRoot.locator('[role="alert"]').allTextContents()
    const detail = diagnostics.join(' | ')
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
