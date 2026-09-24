/**
 * @vitest-environment happy-dom
 */
import { defineComponent, h } from 'vue'
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import { ConfigProvider } from '@expcat/tigercat-vue/ConfigProvider'
import { confirmModal, destroyAllModals } from '@expcat/tigercat-vue/Modal'

const Host = defineComponent({
  setup() {
    return () => h(ConfigProvider, () => h('div', 'host'))
  }
})

describe('confirmModal', () => {
  it('renders on the config provider host and resolves from OK', async () => {
    render(Host)
    const pending = confirmModal({ title: 'Delete', content: 'This item' })
    expect(await screen.findByRole('dialog', { name: 'Delete' })).toBeTruthy()
    expect(screen.getByText('This item')).toBeTruthy()
    await userEvent.click(screen.getByRole('button', { name: 'OK' }))
    await expect(pending).resolves.toBeUndefined()
    destroyAllModals()
  })
})
