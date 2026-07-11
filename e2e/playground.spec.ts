import { expect, test } from '@playwright/test'

const apps = [
  {
    framework: 'React',
    url: 'http://127.0.0.1:5174/#/button',
    editedLabel: 'React 已编辑按钮',
    sourceLabel: '主要按钮'
  },
  {
    framework: 'Vue',
    url: 'http://127.0.0.1:5173/#/button',
    editedLabel: 'Vue 已编辑按钮',
    sourceLabel: '主要按钮'
  }
] as const

for (const app of apps) {
  test(`${app.framework} example source can be edited, run and reset`, async ({ page }) => {
    test.setTimeout(45_000)
    await page.goto(app.url)

    const module = page.locator('[data-demo-id="button-01"]')
    const preview = page.frameLocator('iframe[title="外观、尺寸与状态 示例预览"]')
    await expect(
      preview.getByRole('button', { name: app.sourceLabel, exact: true }).first()
    ).toBeVisible()

    await module.getByRole('button', { name: '编辑源码', exact: true }).click()
    const editor = module.getByRole('textbox', { name: 'Code editor', exact: true })
    const source = await editor.inputValue()
    await editor.fill(source.replace(app.sourceLabel, app.editedLabel))
    await expect(module.getByText('已修改 · 尚未运行', { exact: true })).toBeVisible()

    await module.getByRole('button', { name: '运行', exact: true }).click()
    await expect(preview.getByRole('button', { name: app.editedLabel, exact: true })).toBeVisible()
    await expect(module.locator('[role="alert"]')).toHaveCount(0)

    await module.getByRole('button', { name: '重置', exact: true }).click()
    await expect(
      preview.getByRole('button', { name: app.sourceLabel, exact: true }).first()
    ).toBeVisible({ timeout: 15_000 })
    await expect(preview.getByRole('button', { name: app.editedLabel, exact: true })).toHaveCount(0)
  })
}

test('Vue overlay remains inside its independent sandbox', async ({ page }) => {
  test.setTimeout(45_000)
  await page.goto('http://127.0.0.1:5173/#/modal')
  const preview = page.frameLocator('iframe[title="基本用法 示例预览"]')
  await preview.getByRole('button', { name: '打开对话框', exact: true }).click()
  await expect(preview.getByRole('dialog', { name: '基本对话框', exact: true })).toBeVisible()
  await expect(page.locator('body > [role="dialog"]')).toHaveCount(0)
})

test('compile errors are reported without replacing the last successful preview', async ({
  page
}) => {
  test.setTimeout(45_000)
  await page.goto('http://127.0.0.1:5174/#/button')
  const module = page.locator('[data-demo-id="button-01"]')
  const preview = page.frameLocator('iframe[title="外观、尺寸与状态 示例预览"]')
  await expect(preview.getByRole('button', { name: '主要按钮', exact: true }).first()).toBeVisible()

  await module.getByRole('button', { name: '编辑源码', exact: true }).click()
  await module
    .getByRole('textbox', { name: 'Code editor', exact: true })
    .fill('export default function App( {')
  await module.getByRole('button', { name: '运行', exact: true }).click()

  await expect(module.locator('[role="alert"]')).toBeVisible()
  await expect(preview.getByRole('button', { name: '主要按钮', exact: true }).first()).toBeVisible()
})
