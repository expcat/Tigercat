import { expect, test } from '@playwright/test'
import { exampleApps, openDemo } from './example-helpers'

for (const app of exampleApps) {
  test(`${app.framework} example source can be edited, run and reset`, async ({ page }) => {
    test.setTimeout(45_000)
    const { moduleRoot, preview } = await openDemo(page, app.baseUrl, 'button', 'button-01')
    const editedLabel = `${app.framework} 已编辑按钮`
    const sourceLabel = '提交中'

    await expect(preview.getByRole('button', { name: sourceLabel, exact: true })).toBeVisible()
    await moduleRoot.getByTestId('demo-edit-source').click()
    const editor = moduleRoot.getByRole('textbox', { name: /Code editor|代码编辑器/ })
    const source = await editor.inputValue()
    await editor.fill(source.replace(sourceLabel, editedLabel))
    await expect(moduleRoot.getByTestId('demo-reset')).toBeEnabled()

    await moduleRoot.getByTestId('demo-run').click()
    await expect(preview.getByRole('button', { name: editedLabel, exact: true })).toBeVisible()
    await expect(moduleRoot.locator('[role="alert"]')).toHaveCount(0)

    await moduleRoot.getByTestId('demo-reset').click()
    await expect(preview.getByRole('button', { name: sourceLabel, exact: true })).toBeVisible({
      timeout: 15_000
    })
    await expect(preview.getByRole('button', { name: editedLabel, exact: true })).toHaveCount(0)
  })
}

test('Vue overlay remains inside its independent sandbox', async ({ page }) => {
  test.setTimeout(45_000)
  const { preview } = await openDemo(page, 'http://127.0.0.1:5173', 'modal', 'modal-01')
  await preview.getByRole('button', { name: '打开对话框', exact: true }).click()
  await expect(preview.getByRole('dialog', { name: '基本对话框', exact: true })).toBeVisible()
  await expect(page.locator('body > [role="dialog"]')).toHaveCount(0)
})

test('compile errors preserve the last successful preview', async ({ page }) => {
  test.setTimeout(45_000)
  const { moduleRoot, preview } = await openDemo(
    page,
    'http://127.0.0.1:5174',
    'button',
    'button-01'
  )
  await expect(preview.getByRole('button', { name: '提交中', exact: true })).toBeVisible()
  await moduleRoot.getByTestId('demo-edit-source').click()
  await moduleRoot
    .getByRole('textbox', { name: /Code editor|代码编辑器/ })
    .fill('export default function App( {')
  await moduleRoot.getByTestId('demo-run').click()
  await expect(moduleRoot.locator('[role="alert"]')).toBeVisible()
  await expect(preview.getByRole('button', { name: '提交中', exact: true })).toBeVisible()
})
