/**
 * @vitest-environment happy-dom
 *
 * Covers the "no-i18n / custom text" option: the flat `labels` prop on
 * components and global custom text via ConfigProvider, plus precedence.
 */

import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import {
  Pagination,
  Modal,
  Drawer,
  FormWizard,
  TaskBoard,
  Transfer,
  ConfigProvider
} from '@expcat/tigercat-react'

describe('custom text (no i18n) — React', () => {
  describe('per-component labels prop', () => {
    it('Pagination uses labels without any locale', () => {
      render(<Pagination total={100} labels={{ prevPageAriaLabel: 'PREV!' }} />)
      expect(screen.getByLabelText('PREV!')).toBeInTheDocument()
    })

    it('Modal default footer uses labels', () => {
      render(<Modal open showDefaultFooter labels={{ okText: 'GO', cancelText: 'STOP' }} />)
      expect(screen.getByText('GO')).toBeInTheDocument()
      expect(screen.getByText('STOP')).toBeInTheDocument()
    })

    it('Drawer close button uses labels', () => {
      render(<Drawer open labels={{ closeAriaLabel: 'Dismiss panel' }} />)
      expect(screen.getByLabelText('Dismiss panel')).toBeInTheDocument()
    })

    it('FormWizard actions use labels', () => {
      render(
        <FormWizard
          steps={[{ title: 'A' }, { title: 'B' }]}
          current={1}
          labels={{ prevText: 'Back', finishText: 'Done' }}
        />
      )
      expect(screen.getByText('Back')).toBeInTheDocument()
      expect(screen.getByText('Done')).toBeInTheDocument()
    })

    it('TaskBoard empty column uses labels', () => {
      render(
        <TaskBoard
          columns={[{ id: 'c1', title: 'Col', cards: [] }]}
          labels={{ emptyColumnText: 'Nothing yet' }}
        />
      )
      expect(screen.getByText('Nothing yet')).toBeInTheDocument()
    })
  })

  describe('global custom text via ConfigProvider', () => {
    it('Pagination reads global config text', () => {
      render(
        <ConfigProvider locale={{ pagination: { prevPageAriaLabel: 'GlobalPrev' } }}>
          <Pagination total={100} />
        </ConfigProvider>
      )
      expect(screen.getByLabelText('GlobalPrev')).toBeInTheDocument()
    })

    it('Modal reads global config text', () => {
      render(
        <ConfigProvider locale={{ modal: { okText: 'GlobalOK' } }}>
          <Modal open showDefaultFooter />
        </ConfigProvider>
      )
      expect(screen.getByText('GlobalOK')).toBeInTheDocument()
    })

    it('labels prop wins over global config text', () => {
      render(
        <ConfigProvider locale={{ pagination: { prevPageAriaLabel: 'GlobalPrev' } }}>
          <Pagination total={100} labels={{ prevPageAriaLabel: 'LocalPrev' }} />
        </ConfigProvider>
      )
      expect(screen.getByLabelText('LocalPrev')).toBeInTheDocument()
      expect(screen.queryByLabelText('GlobalPrev')).toBeNull()
    })
  })

  describe('common.searchPlaceholder wiring (C-1)', () => {
    it('Transfer search reads global config searchPlaceholder', () => {
      render(
        <ConfigProvider locale={{ common: { searchPlaceholder: '全局搜索' } }}>
          <Transfer showSearch />
        </ConfigProvider>
      )
      expect(screen.getAllByPlaceholderText('全局搜索').length).toBeGreaterThan(0)
    })

    it('Transfer locale prop wins over global config', () => {
      render(
        <ConfigProvider locale={{ common: { searchPlaceholder: '全局搜索' } }}>
          <Transfer showSearch locale={{ common: { searchPlaceholder: '局部搜索' } }} />
        </ConfigProvider>
      )
      expect(screen.getAllByPlaceholderText('局部搜索').length).toBeGreaterThan(0)
      expect(screen.queryByPlaceholderText('全局搜索')).toBeNull()
    })
  })

  describe('backward compatibility', () => {
    it('Pagination outside a ConfigProvider keeps default English text', () => {
      render(<Pagination total={100} />)
      expect(screen.getByLabelText('Previous page')).toBeInTheDocument()
    })

    it('Transfer search outside a ConfigProvider keeps default English placeholder', () => {
      render(<Transfer showSearch />)
      expect(screen.getAllByPlaceholderText('Search...').length).toBeGreaterThan(0)
    })
  })
})
