/**
 * @vitest-environment happy-dom
 *
 * Covers the "no-i18n / custom text" option: the flat `labels` prop on
 * components and global custom text via ConfigProvider, plus precedence.
 */

import React from 'react'
import { describe, it, expect } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
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

    it('Select done action uses labels', () => {
      const { container } = render(
        <Select options={[{ label: 'One', value: 1 }]} labels={{ doneText: 'Complete' }} />
      )
      fireEvent.click(container.querySelector('button')!)
      expect(screen.getByRole('button', { name: 'Complete' })).toBeInTheDocument()
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

    it('Select labels prop wins over global config text', () => {
      const { container } = render(
        <ConfigProvider locale={{ select: { doneText: 'GlobalDone' } }}>
          <Select options={[{ label: 'One', value: 1 }]} labels={{ doneText: 'LocalDone' }} />
        </ConfigProvider>
      )
      fireEvent.click(container.querySelector('button')!)
      expect(screen.getByRole('button', { name: 'LocalDone' })).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'GlobalDone' })).toBeNull()
    })
  })

  describe('common.searchPlaceholder wiring (C-1)', () => {
    it('Transfer search reads global config searchPlaceholder', () => {
      render(
        <ConfigProvider locale={{ common: { searchPlaceholder: '全局搜索' } }}>
          <Transfer searchable />
        </ConfigProvider>
      )
      expect(screen.getAllByPlaceholderText('全局搜索').length).toBeGreaterThan(0)
    })

    it('Transfer locale prop wins over global config', () => {
      render(
        <ConfigProvider locale={{ common: { searchPlaceholder: '全局搜索' } }}>
          <Transfer searchable locale={{ common: { searchPlaceholder: '局部搜索' } }} />
        </ConfigProvider>
      )
      expect(screen.getAllByPlaceholderText('局部搜索').length).toBeGreaterThan(0)
      expect(screen.queryByPlaceholderText('全局搜索')).toBeNull()
    })
  })

  describe('common.emptyText default fallback (C-2)', () => {
    it('List empty state reads global config emptyText', () => {
      render(
        <ConfigProvider locale={{ common: { emptyText: '暂无数据' } }}>
          <List dataSource={[]} />
        </ConfigProvider>
      )
      expect(screen.getByText('暂无数据')).toBeInTheDocument()
    })

    it('List emptyText prop wins over global config', () => {
      render(
        <ConfigProvider locale={{ common: { emptyText: '暂无数据' } }}>
          <List dataSource={[]} emptyText="空空如也" />
        </ConfigProvider>
      )
      expect(screen.getByText('空空如也')).toBeInTheDocument()
      expect(screen.queryByText('暂无数据')).toBeNull()
    })
  })

  describe('common.empty/noMore empty-state fallback (I18N-1 / I18N-2)', () => {
    it('Cascader search empty state reads global config emptyText', () => {
      const { container, getByText } = render(
        <ConfigProvider locale={{ common: { emptyText: '暂无数据' } }}>
          <Cascader options={[{ label: 'Beijing', value: 'bj' }]} searchable />
        </ConfigProvider>
      )
      fireEvent.click(container.querySelector('button')!)
      fireEvent.change(container.querySelector('input[aria-label="Search options"]')!, {
        target: { value: 'zzz' }
      })
      expect(getByText('暂无数据')).toBeInTheDocument()
    })

    it('Cascader emptyText prop wins over global config', () => {
      const { container, getByText, queryByText } = render(
        <ConfigProvider locale={{ common: { emptyText: '暂无数据' } }}>
          <Cascader options={[{ label: 'Beijing', value: 'bj' }]} searchable emptyText="查无此项" />
        </ConfigProvider>
      )
      fireEvent.click(container.querySelector('button')!)
      fireEvent.change(container.querySelector('input[aria-label="Search options"]')!, {
        target: { value: 'zzz' }
      })
      expect(getByText('查无此项')).toBeInTheDocument()
      expect(queryByText('暂无数据')).toBeNull()
    })

    it('Select emptyText (empty options) reads global config emptyText', () => {
      const { container, getByText } = render(
        <ConfigProvider locale={{ common: { emptyText: '暂无数据' } }}>
          <Select options={[]} />
        </ConfigProvider>
      )
      fireEvent.click(container.querySelector('button')!)
      expect(getByText('暂无数据')).toBeInTheDocument()
    })

    it('Select emptyText (no search results) reads global config emptyText', () => {
      const { container, getByText } = render(
        <ConfigProvider locale={{ common: { emptyText: '暂无数据' } }}>
          <Select options={[{ label: 'One', value: 1 }]} searchable />
        </ConfigProvider>
      )
      fireEvent.click(container.querySelector('button')!)
      fireEvent.change(container.querySelector('input')!, { target: { value: 'zzz' } })
      expect(getByText('暂无数据')).toBeInTheDocument()
    })

    it('Select emptyText prop wins over global config', () => {
      const { container, getByText, queryByText } = render(
        <ConfigProvider locale={{ common: { emptyText: '暂无数据' } }}>
          <Select options={[]} emptyText="没有可选项" />
        </ConfigProvider>
      )
      fireEvent.click(container.querySelector('button')!)
      expect(getByText('没有可选项')).toBeInTheDocument()
      expect(queryByText('暂无数据')).toBeNull()
    })

    it('FileManager empty state reads global config emptyText', () => {
      render(
        <ConfigProvider locale={{ common: { emptyText: '暂无数据' } }}>
          <FileManager files={[]} />
        </ConfigProvider>
      )
      expect(screen.getByText('暂无数据')).toBeInTheDocument()
    })

    it('FileManager emptyText prop wins over global config', () => {
      render(
        <ConfigProvider locale={{ common: { emptyText: '暂无数据' } }}>
          <FileManager files={[]} emptyText="空文件夹" />
        </ConfigProvider>
      )
      expect(screen.getByText('空文件夹')).toBeInTheDocument()
      expect(screen.queryByText('暂无数据')).toBeNull()
    })

    it('InfiniteScroll end state reads global config noMoreText', () => {
      render(
        <ConfigProvider locale={{ common: { noMoreText: '没有更多了' } }}>
          <InfiniteScroll hasMore={false} loading={false} />
        </ConfigProvider>
      )
      expect(screen.getByText('没有更多了')).toBeInTheDocument()
    })

    it('InfiniteScroll endText prop wins over global config', () => {
      render(
        <ConfigProvider locale={{ common: { noMoreText: '没有更多了' } }}>
          <InfiniteScroll hasMore={false} loading={false} endText="到底啦" />
        </ConfigProvider>
      )
      expect(screen.getByText('到底啦')).toBeInTheDocument()
      expect(screen.queryByText('没有更多了')).toBeNull()
    })
  })

  describe('backward compatibility', () => {
    it('Pagination outside a ConfigProvider keeps default English text', () => {
      render(<Pagination total={100} />)
      expect(screen.getByLabelText('Previous page')).toBeInTheDocument()
    })

    it('Select empty options outside a ConfigProvider keeps default English text', () => {
      const { container, getByText } = render(<Select options={[]} />)
      fireEvent.click(container.querySelector('button')!)
      expect(getByText('No options found')).toBeInTheDocument()
    })

    it('InfiniteScroll end state outside a ConfigProvider keeps default English text', () => {
      render(<InfiniteScroll hasMore={false} loading={false} />)
      expect(screen.getByText('No more data')).toBeInTheDocument()
    })

    it('Transfer search outside a ConfigProvider keeps default English placeholder', () => {
      render(<Transfer searchable />)
      expect(screen.getAllByPlaceholderText('Search...').length).toBeGreaterThan(0)
    })

    it('List outside a ConfigProvider keeps default English emptyText', () => {
      render(<List dataSource={[]} />)
      expect(screen.getByText('No data')).toBeInTheDocument()
    })
  })
})
