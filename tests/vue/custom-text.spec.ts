/**
 * @vitest-environment happy-dom
 *
 * Covers the "no-i18n / custom text" option: the flat `labels` prop on
 * components and global custom text via ConfigProvider, plus precedence.
 */

import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/vue'
import { defineComponent, h } from 'vue'
import {
  Pagination,
  Modal,
  Drawer,
  FormWizard,
  TaskBoard,
  Transfer,
  List,
  InfiniteScroll,
  Select,
  Cascader,
  FileManager,
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

  describe('common.empty/loading/clear default fallback (B-2)', () => {
    it('List empty state reads global config emptyText', () => {
      render(
        defineComponent({
          setup() {
            return () =>
              h(ConfigProvider, { locale: { common: { emptyText: '暂无数据' } } }, () =>
                h(List, { dataSource: [] })
              )
          }
        })
      )
      expect(screen.getByText('暂无数据')).toBeInTheDocument()
    })

    it('List emptyText prop wins over global config', () => {
      render(
        defineComponent({
          setup() {
            return () =>
              h(ConfigProvider, { locale: { common: { emptyText: '暂无数据' } } }, () =>
                h(List, { dataSource: [], emptyText: '空空如也' })
              )
          }
        })
      )
      expect(screen.getByText('空空如也')).toBeInTheDocument()
      expect(screen.queryByText('暂无数据')).toBeNull()
    })

    it('InfiniteScroll loader reads global config loadingText', () => {
      render(
        defineComponent({
          setup() {
            return () =>
              h(ConfigProvider, { locale: { common: { loadingText: '加载中' } } }, () =>
                h(InfiniteScroll, { loading: true })
              )
          }
        })
      )
      expect(screen.getByText('加载中')).toBeInTheDocument()
    })
  })

  describe('common.empty/noMore empty-state fallback (I18N-1 / I18N-2)', () => {
    it('Cascader search empty state reads global config emptyText', async () => {
      const { container, getByText } = render(
        defineComponent({
          setup() {
            return () =>
              h(ConfigProvider, { locale: { common: { emptyText: '暂无数据' } } }, () =>
                h(Cascader, { options: [{ label: 'Beijing', value: 'bj' }], showSearch: true })
              )
          }
        })
      )
      await fireEvent.click(container.querySelector('button')!)
      await fireEvent.update(container.querySelector('input[aria-label="Search options"]')!, 'zzz')
      expect(getByText('暂无数据')).toBeInTheDocument()
    })

    it('Cascader notFoundText prop wins over global config', async () => {
      const { container, getByText, queryByText } = render(
        defineComponent({
          setup() {
            return () =>
              h(ConfigProvider, { locale: { common: { emptyText: '暂无数据' } } }, () =>
                h(Cascader, {
                  options: [{ label: 'Beijing', value: 'bj' }],
                  showSearch: true,
                  notFoundText: '查无此项'
                })
              )
          }
        })
      )
      await fireEvent.click(container.querySelector('button')!)
      await fireEvent.update(container.querySelector('input[aria-label="Search options"]')!, 'zzz')
      expect(getByText('查无此项')).toBeInTheDocument()
      expect(queryByText('暂无数据')).toBeNull()
    })

    it('Select noDataText (empty options) reads global config emptyText', async () => {
      const { container, getByText } = render(
        defineComponent({
          setup() {
            return () =>
              h(ConfigProvider, { locale: { common: { emptyText: '暂无数据' } } }, () =>
                h(Select, { options: [] })
              )
          }
        })
      )
      await fireEvent.click(container.querySelector('button')!)
      expect(getByText('暂无数据')).toBeInTheDocument()
    })

    it('Select noOptionsText (no search results) reads global config emptyText', async () => {
      const { container, getByText } = render(
        defineComponent({
          setup() {
            return () =>
              h(ConfigProvider, { locale: { common: { emptyText: '暂无数据' } } }, () =>
                h(Select, { options: [{ label: 'One', value: 1 }], searchable: true })
              )
          }
        })
      )
      await fireEvent.click(container.querySelector('button')!)
      await fireEvent.update(container.querySelector('input')!, 'zzz')
      expect(getByText('暂无数据')).toBeInTheDocument()
    })

    it('Select noDataText prop wins over global config', async () => {
      const { container, getByText, queryByText } = render(
        defineComponent({
          setup() {
            return () =>
              h(ConfigProvider, { locale: { common: { emptyText: '暂无数据' } } }, () =>
                h(Select, { options: [], noDataText: '没有可选项' })
              )
          }
        })
      )
      await fireEvent.click(container.querySelector('button')!)
      expect(getByText('没有可选项')).toBeInTheDocument()
      expect(queryByText('暂无数据')).toBeNull()
    })

    it('FileManager empty state reads global config emptyText', () => {
      render(
        defineComponent({
          setup() {
            return () =>
              h(ConfigProvider, { locale: { common: { emptyText: '暂无数据' } } }, () =>
                h(FileManager, { files: [] })
              )
          }
        })
      )
      expect(screen.getByText('暂无数据')).toBeInTheDocument()
    })

    it('FileManager emptyText prop wins over global config', () => {
      render(
        defineComponent({
          setup() {
            return () =>
              h(ConfigProvider, { locale: { common: { emptyText: '暂无数据' } } }, () =>
                h(FileManager, { files: [], emptyText: '空文件夹' })
              )
          }
        })
      )
      expect(screen.getByText('空文件夹')).toBeInTheDocument()
      expect(screen.queryByText('暂无数据')).toBeNull()
    })

    it('InfiniteScroll end state reads global config noMoreText', () => {
      render(
        defineComponent({
          setup() {
            return () =>
              h(ConfigProvider, { locale: { common: { noMoreText: '没有更多了' } } }, () =>
                h(InfiniteScroll, { hasMore: false, loading: false })
              )
          }
        })
      )
      expect(screen.getByText('没有更多了')).toBeInTheDocument()
    })

    it('InfiniteScroll endText prop wins over global config', () => {
      render(
        defineComponent({
          setup() {
            return () =>
              h(ConfigProvider, { locale: { common: { noMoreText: '没有更多了' } } }, () =>
                h(InfiniteScroll, { hasMore: false, loading: false, endText: '到底啦' })
              )
          }
        })
      )
      expect(screen.getByText('到底啦')).toBeInTheDocument()
      expect(screen.queryByText('没有更多了')).toBeNull()
    })
  })

  describe('backward compatibility', () => {
    it('Pagination outside a ConfigProvider keeps default English text', () => {
      render(Pagination, { props: { total: 100 } })
      expect(screen.getByLabelText('Previous page')).toBeInTheDocument()
    })

    it('Select empty options outside a ConfigProvider keeps default English text', async () => {
      const { container, getByText } = render(Select, { props: { options: [] } })
      await fireEvent.click(container.querySelector('button')!)
      expect(getByText('No options available')).toBeInTheDocument()
    })

    it('InfiniteScroll end state outside a ConfigProvider keeps default English text', () => {
      render(InfiniteScroll, { props: { hasMore: false, loading: false } })
      expect(screen.getByText('No more data')).toBeInTheDocument()
    })

    it('Transfer search outside a ConfigProvider keeps default English placeholder', () => {
      render(Transfer, { props: { showSearch: true } })
      expect(screen.getAllByPlaceholderText('Search...').length).toBeGreaterThan(0)
    })

    it('List outside a ConfigProvider keeps default English emptyText', () => {
      render(List, { props: { dataSource: [] } })
      expect(screen.getByText('No data')).toBeInTheDocument()
    })
  })
})
