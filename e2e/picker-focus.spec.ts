import { expect, test } from '@playwright/test'
import { exampleApps, openDemo } from './example-helpers'

for (const { framework, baseUrl } of exampleApps) {
  test(`${framework} pickers restore focus inside a Drawer and preserve the next Tab stop`, async ({
    page
  }) => {
    await page.setViewportSize({ width: 1280, height: 1400 })
    const { moduleRoot, preview } = await openDemo(page, baseUrl, 'button', 'button-01')
    const imports = ['Drawer', 'DatePicker', 'TimePicker', 'TreeSelect']
      .map(
        (name) => `import { ${name} } from '@expcat/tigercat-${framework.toLowerCase()}/${name}'`
      )
      .join('\n')
    const source =
      framework === 'React'
        ? `${imports}
        export default function App() {
          return <Drawer open title="Picker focus" width={520}>
            <DatePicker aria-label="Date" /><button>After date</button>
            <DatePicker range aria-label="Date range" /><button>After date range</button>
            <TimePicker aria-label="Time" /><button>After time</button>
            <TimePicker range aria-label="Time range" /><button>After time range</button>
            <TreeSelect aria-label="Tree" searchable defaultExpandAll treeData={[{ key: 'root', label: 'Root', children: [{ key: 'leaf', label: 'Leaf' }] }]} />
            <button>After tree</button>
          </Drawer>
        }`
        : `<script setup lang="ts">${imports}</script>
        <template><Drawer open title="Picker focus" :width="520">
          <DatePicker aria-label="Date" /><button>After date</button>
          <DatePicker range aria-label="Date range" /><button>After date range</button>
          <TimePicker aria-label="Time" /><button>After time</button>
          <TimePicker range aria-label="Time range" /><button>After time range</button>
          <TreeSelect aria-label="Tree" searchable default-expand-all :tree-data="[{ key: 'root', label: 'Root', children: [{ key: 'leaf', label: 'Leaf' }] }]" />
          <button>After tree</button>
        </Drawer></template>`
    await moduleRoot.getByTestId('demo-edit-source').click()
    await moduleRoot.getByRole('textbox', { name: /Code editor|代码编辑器/ }).fill(source)
    await moduleRoot.getByTestId('demo-run').click()
    const drawer = preview.getByRole('dialog', { name: 'Picker focus' })
    await expect(drawer).toBeVisible()
    for (const name of ['Date', 'Date range', 'Time', 'Time range']) {
      const input = drawer.getByRole('textbox', { name, exact: true })
      await input.focus()
      await input.press('ArrowDown')
      await expect(input).toHaveAttribute('aria-expanded', 'true')
      const panel = preview.locator(
        '[data-tiger="datepicker-panel"], [data-tiger="timepicker-panel"]'
      )
      await expect(panel).toBeVisible()
      await panel.locator('button:not([disabled]), [tabindex="0"]').first().focus()
      await expect
        .poll(() => panel.evaluate((node) => node.contains(node.ownerDocument.activeElement)))
        .toBe(true)
      await page.keyboard.press('Escape')
      await expect(panel).toHaveCount(0)
      await expect(drawer).toBeVisible()
      await expect(input).toBeFocused()
      await input.press('Tab')
      await expect(input.locator('..').getByRole('button')).toBeFocused()
      await page.keyboard.press('Tab')
      await expect(
        drawer.getByRole('button', { name: `After ${name.toLowerCase()}`, exact: true })
      ).toBeFocused()
    }
    const tree = drawer.getByRole('combobox', { name: 'Tree', exact: true })
    await tree.click()
    await expect(preview.getByRole('treeitem', { name: /Root/ })).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(tree).toHaveAttribute('aria-expanded', 'false')
    await expect(tree).toBeFocused()
    await tree.press('Tab')
    await expect(drawer.getByRole('button', { name: 'After tree', exact: true })).toBeFocused()
  })
}
