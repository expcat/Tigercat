/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React, { useState } from 'react'
import { ConfigProvider } from '@expcat/tigercat-react/ConfigProvider'
import { Transfer } from '@expcat/tigercat-react/Transfer'
import { zhTW } from '@expcat/tigercat-core/locales/zh-TW'
import { expectNoA11yViolations } from '../utils/react'

const dataSource = [
  { key: '1', label: 'Item 1' },
  { key: '2', label: 'Item 2' },
  { key: '3', label: 'Item 3' },
  { key: '4', label: 'Item 4' },
  { key: '5', label: 'Item 5', disabled: true }
]

describe('Transfer', () => {
  describe('Rendering', () => {
    it('should render two panels', () => {
      render(<Transfer dataSource={dataSource} />)
      expect(screen.getByRole('group', { name: 'Source' })).toBeInTheDocument()
      expect(screen.getByRole('group', { name: 'Target' })).toBeInTheDocument()
    })

    it('should apply custom className', () => {
      const { container } = render(<Transfer dataSource={dataSource} className="custom-transfer" />)
      expect(container.querySelector('.custom-transfer')).toBeInTheDocument()
    })
  })

  describe('Transfer operations', () => {
    it('moves a checked item into the target panel when uncontrolled', async () => {
      const user = userEvent.setup()
      const onChange = vi.fn()
      render(<Transfer dataSource={dataSource} onChange={onChange} />)

      await user.click(screen.getByText('Item 1'))
      await user.click(screen.getByLabelText('Move selected to target'))

      expect(onChange).toHaveBeenCalled()
      expect(onChange.mock.calls[0][1]).toBe('right')
      const target = screen.getByRole('group', { name: 'Target' })
      expect(target).toHaveTextContent('Item 1')
    })

    it('keeps target order from targetKeys', () => {
      render(
        <Transfer
          dataSource={[
            { key: 'design', label: 'design' },
            { key: 'qa', label: 'qa' }
          ]}
          targetKeys={['qa', 'design']}
        />
      )
      const target = screen.getByRole('group', { name: 'Target' })
      const labels = Array.from(target.querySelectorAll('span.block.truncate')).map(
        (node) => node.textContent
      )
      expect(labels).toEqual(['qa', 'design'])
    })

    it('should disable move buttons when nothing selected', () => {
      render(<Transfer dataSource={dataSource} />)
      expect(screen.getByLabelText('Move selected to target')).toBeDisabled()
      expect(screen.getByLabelText('Move selected to source')).toBeDisabled()
    })
  })

  describe('Search', () => {
    it('should show search inputs when searchable', () => {
      const { container } = render(<Transfer dataSource={dataSource} searchable />)
      expect(container.querySelectorAll('input[type="search"]').length).toBe(2)
    })

    it('filters by description by default', async () => {
      const user = userEvent.setup()
      render(
        <Transfer
          dataSource={[{ key: 'auth', label: '鉴权', description: '核心权限' }]}
          searchable
        />
      )
      const search = document.querySelector('input[type="search"]') as HTMLInputElement
      await user.type(search, '核心')
      expect(screen.getByText('鉴权')).toBeInTheDocument()
      expect(screen.getByText('核心权限')).toBeInTheDocument()
    })
  })

  describe('Disabled', () => {
    it('should disable all checkboxes when disabled', () => {
      const { container } = render(<Transfer dataSource={dataSource} disabled />)
      container.querySelectorAll('input[type="checkbox"]').forEach((cb) => {
        expect(cb).toBeDisabled()
      })
    })

    it('should not allow selecting disabled items', () => {
      const { getByText } = render(<Transfer dataSource={dataSource} />)
      const checkbox = getByText('Item 5')
        .closest('label')!
        .querySelector('input[type="checkbox"]')!
      expect(checkbox).toBeDisabled()
    })
  })

  describe('Accessibility', () => {
    it('should have correct ARIA structure', () => {
      render(<Transfer dataSource={dataSource} />)
      expect(screen.getByRole('group', { name: 'Source' })).toBeInTheDocument()
      expect(screen.queryAllByRole('listbox')).toHaveLength(0)
      expect(screen.getByLabelText('Move selected to target')).toBeInTheDocument()
    })

    it('should have no accessibility violations', async () => {
      const { container } = render(<Transfer dataSource={dataSource} searchable />)
      await expectNoA11yViolations(container)
    })

    it('uses official zhTW labels', () => {
      render(
        <ConfigProvider locale={zhTW}>
          <Transfer dataSource={dataSource} />
        </ConfigProvider>
      )
      expect(screen.getByRole('group', { name: '來源清單' })).toBeInTheDocument()
    })
  })
})
