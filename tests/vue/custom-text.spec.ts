/**
 * @vitest-environment happy-dom
 *
 * Covers the "no-i18n / custom text" option: the flat `labels` prop on
 * components and global custom text via ConfigProvider, plus precedence.
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/vue'
import { defineComponent, h } from 'vue'
import {
  Pagination,
  Modal,
  Drawer,
  FormWizard,
  TaskBoard,
  Transfer,
  ConfigProvider
} from '@expcat/tigercat-vue'

describe('custom text (no i18n) — Vue', () => {
  describe('per-component labels prop', () => {
    it('Pagination uses labels without any locale', () => {
      render(Pagination, { props: { total: 100, labels: { prevPageAriaLabel: 'PREV!' } } })
      expect(screen.getByLabelText('PREV!')).toBeInTheDocument()
    })

    it('Modal default footer uses labels', () => {
      render(Modal, {
        props: {
          open: true,
          showDefaultFooter: true,
          disableTeleport: true,
          labels: { okText: 'GO', cancelText: 'STOP' }
        }
      })
      expect(screen.getByText('GO')).toBeInTheDocument()
      expect(screen.getByText('STOP')).toBeInTheDocument()
    })

    it('Drawer close button uses labels', () => {
      render(Drawer, {
        props: { open: true, disableTeleport: true, labels: { closeAriaLabel: 'Dismiss panel' } }
      })
      expect(screen.getByLabelText('Dismiss panel')).toBeInTheDocument()
    })

    it('FormWizard actions use labels', () => {
      render(FormWizard, {
        props: {
          steps: [{ title: 'A' }, { title: 'B' }],
          current: 1,
          labels: { prevText: 'Back', finishText: 'Done' }
        }
      })
      expect(screen.getByText('Back')).toBeInTheDocument()
      expect(screen.getByText('Done')).toBeInTheDocument()
    })

    it('TaskBoard empty column uses labels', () => {
      render(TaskBoard, {
        props: {
          columns: [{ id: 'c1', title: 'Col', cards: [] }],
          labels: { emptyColumnText: 'Nothing yet' }
        }
      })
      expect(screen.getByText('Nothing yet')).toBeInTheDocument()
    })
  })

  describe('global custom text via ConfigProvider', () => {
    it('Pagination reads global config text', () => {
      render(
        defineComponent({
          setup() {
            return () =>
              h(
                ConfigProvider,
                { locale: { pagination: { prevPageAriaLabel: 'GlobalPrev' } } },
                () => h(Pagination, { total: 100 })
              )
          }
        })
      )
      expect(screen.getByLabelText('GlobalPrev')).toBeInTheDocument()
    })

    it('Modal reads global config text', () => {
      render(
        defineComponent({
          setup() {
            return () =>
              h(ConfigProvider, { locale: { modal: { okText: 'GlobalOK' } } }, () =>
                h(Modal, { open: true, showDefaultFooter: true, disableTeleport: true })
              )
          }
        })
      )
      expect(screen.getByText('GlobalOK')).toBeInTheDocument()
    })

    it('labels prop wins over global config text', () => {
      render(
        defineComponent({
          setup() {
            return () =>
              h(
                ConfigProvider,
                { locale: { pagination: { prevPageAriaLabel: 'GlobalPrev' } } },
                () => h(Pagination, { total: 100, labels: { prevPageAriaLabel: 'LocalPrev' } })
              )
          }
        })
      )
      expect(screen.getByLabelText('LocalPrev')).toBeInTheDocument()
      expect(screen.queryByLabelText('GlobalPrev')).toBeNull()
    })
  })

  describe('common.searchPlaceholder wiring (B-1)', () => {
    it('Transfer search reads global config searchPlaceholder', () => {
      render(
        defineComponent({
          setup() {
            return () =>
              h(ConfigProvider, { locale: { common: { searchPlaceholder: '全局搜索' } } }, () =>
                h(Transfer, { showSearch: true })
              )
          }
        })
      )
      expect(screen.getAllByPlaceholderText('全局搜索').length).toBeGreaterThan(0)
    })

    it('Transfer locale prop wins over global config', () => {
      render(
        defineComponent({
          setup() {
            return () =>
              h(ConfigProvider, { locale: { common: { searchPlaceholder: '全局搜索' } } }, () =>
                h(Transfer, {
                  showSearch: true,
                  locale: { common: { searchPlaceholder: '局部搜索' } }
                })
              )
          }
        })
      )
      expect(screen.getAllByPlaceholderText('局部搜索').length).toBeGreaterThan(0)
      expect(screen.queryByPlaceholderText('全局搜索')).toBeNull()
    })
  })

  describe('backward compatibility', () => {
    it('Pagination outside a ConfigProvider keeps default English text', () => {
      render(Pagination, { props: { total: 100 } })
      expect(screen.getByLabelText('Previous page')).toBeInTheDocument()
    })

    it('Transfer search outside a ConfigProvider keeps default English placeholder', () => {
      render(Transfer, { props: { showSearch: true } })
      expect(screen.getAllByPlaceholderText('Search...').length).toBeGreaterThan(0)
    })
  })
})
