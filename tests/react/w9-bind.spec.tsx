/**
 * @vitest-environment happy-dom
 */
import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render } from '@testing-library/react'
import { Table } from '../../packages/react/src/components/Table'
import { Timeline } from '../../packages/react/src/components/Timeline'
import { Collapse } from '../../packages/react/src/components/Collapse'
import { CollapsePanel } from '../../packages/react/src/components/CollapsePanel'
import { BarChart } from '../../packages/react/src/components/BarChart'
import { LineChart } from '../../packages/react/src/components/LineChart'
import { PieChart } from '../../packages/react/src/components/PieChart'
import { RadarChart } from '../../packages/react/src/components/RadarChart'
import { GaugeChart } from '../../packages/react/src/components/GaugeChart'
import { HeatmapChart } from '../../packages/react/src/components/HeatmapChart'
import { SunburstChart } from '../../packages/react/src/components/SunburstChart'
import { TreeMapChart } from '../../packages/react/src/components/TreeMapChart'
import { Gantt } from '../../packages/react/src/components/Gantt'
import { OrgChart } from '../../packages/react/src/components/OrgChart'
import { CodeEditor } from '../../packages/react/src/components/CodeEditor'
import { MarkdownEditor } from '../../packages/react/src/components/MarkdownEditor'
import { RichTextEditor } from '../../packages/react/src/components/RichTextEditor'
import { FileManager } from '../../packages/react/src/components/FileManager'
import { ImageAnnotation } from '../../packages/react/src/components/ImageAnnotation'
import { Drag } from '../../packages/react/src/components/Drag'
import { PrintLayout } from '../../packages/react/src/components/PrintLayout'
import { ActivityFeed } from '../../packages/react/src/components/ActivityFeed'
import { CommentThread } from '../../packages/react/src/components/CommentThread'

const columns = [
  { key: 'name', title: 'Name', sortable: true },
  {
    key: 'qty',
    title: 'Qty',
    sortable: true,
    edit: 'number' as const,
    sum: true,
    cellFormatter: (value: unknown) => `n:${value}`
  }
]

describe('W9 view bindings', () => {
  it('filters, sorts, hides, and resizes from the header menu', () => {
    const { container } = render(
      <Table
        columns={columns}
        dataSource={[
          { id: 1, name: 'b', qty: 2 },
          { id: 2, name: 'a', qty: 1 }
        ]}
        rowKey="id"
        pagination={false}
        sorts={[]}
      />
    )
    expect(container.querySelector('[data-tiger-header-menu]')).toBeTruthy()
    const input = container.querySelector('[data-tiger-filter-menu] input') as HTMLInputElement
    fireEvent.change(input, { target: { value: 'a' } })
    expect(container.textContent).toContain('b')
    fireEvent.submit(container.querySelector('[data-tiger-filter-menu]')!)
    expect(container.textContent).not.toContain('b')
    fireEvent.click(container.querySelector('[data-tiger-sort="name"]')!)
    expect(container.querySelector('[data-tiger-sort="name"]')?.getAttribute('data-sort-direction')).toBe(
      'asc'
    )
    fireEvent.click(container.querySelector('[data-tiger-hide="qty"]')!)
    expect(container.querySelector('[data-tiger-table-column-key="qty"]')).toBeNull()
    fireEvent.change(container.querySelector('[data-tiger-resize="name"]')!, { target: { value: '80' } })
    expect(container.querySelector('[data-tiger-col-width="80"]')).toBeTruthy()
  })

  it('selects the page, a shift range, and announces once', () => {
    const onSelectionChange = vi.fn()
    const { container } = render(
      <Table
        columns={columns}
        dataSource={[
          { id: 1, name: 'a', qty: 1 },
          { id: 2, name: 'b', qty: 2 },
          { id: 3, name: 'c', qty: 3 }
        ]}
        rowKey="id"
        pagination={false}
        sorts={[]}
        rowSelection={{
          getCheckboxProps: (record: { id: number }) => ({ disabled: record.id === 2 })
        }}
        onSelectionChange={onSelectionChange}
      />
    )
    fireEvent.click(container.querySelector('[data-tiger-select-page]')!)
    const announced = container.querySelector('[data-tiger-selection-live]')?.textContent
    expect(announced).toContain('2')
    fireEvent.click(container.querySelector('[data-tiger-select-page]')!)
    expect(container.querySelector('[data-tiger-selection-live]')?.textContent).toBe(announced)
    expect(onSelectionChange).toHaveBeenCalled()
    fireEvent.click(container.querySelector('[data-tiger-shift-key="1"]')!)
    fireEvent.click(container.querySelector('[data-tiger-shift-key="3"]')!, { shiftKey: true })
    expect(onSelectionChange.mock.calls.at(-1)?.[0]).toEqual([1, 3])
  })

  it('exports the current page with formatted cells', () => {
    const { container } = render(
      <Table
        columns={columns}
        dataSource={[{ id: 1, name: 'a', qty: 4 }]}
        rowKey="id"
        pagination={false}
        sorts={[]}
      />
    )
    fireEvent.click(container.querySelector('[data-tiger-export-scope="page"]')!)
    expect(container.querySelector('[data-tiger-export-text]')?.textContent).toContain('n:4')
  })

  it('moves grid cells, validates editors, spans groups, and sums', () => {
    const grid = render(
      <Table
        columns={[{ key: 'name', title: 'Name' }]}
        dataSource={[{ id: 1, name: 'a' }]}
        rowKey="id"
        pagination={false}
        grid
      />
    )
    const table = grid.container.querySelector('table')!
    expect(table.getAttribute('data-keyboard-mode')).toBe('grid')
    table.focus()
    fireEvent.keyDown(table, { key: 'ArrowRight' })
    expect(table.getAttribute('data-grid-cell')).toBe('0-0')

    const onCellChange = vi.fn()
    const edit = render(
      <Table
        columns={[{ key: 'qty', title: 'Qty', edit: 'number', validate: () => false }]}
        dataSource={[{ id: 1, qty: 1 }]}
        rowKey="id"
        pagination={false}
        onCellChange={onCellChange}
      />
    )
    fireEvent.doubleClick(edit.container.querySelector('td')!)
    fireEvent.blur(edit.container.querySelector('input')!)
    expect(onCellChange).not.toHaveBeenCalled()

    const grouped = render(
      <Table
        columns={[
          { key: 'name', title: 'Name', rowSpan: 2 },
          { key: 'dept', title: 'Dept' }
        ]}
        dataSource={[
          { id: 1, name: 'Ada', dept: 'Eng' },
          { id: 2, name: 'Bea', dept: 'Eng' }
        ]}
        rowKey="id"
        pagination={false}
        groupBy="dept"
        collapsedGroupKeys={[]}
        summaryRow={{ show: true, sum: ['qty'] }}
      />
    )
    expect(grouped.container.querySelector('[rowspan="2"]')).toBeTruthy()
    expect(grouped.container.querySelector('[data-tiger-group]')?.textContent).toContain('2')
    fireEvent.click(grouped.container.querySelector('[data-tiger-group]')!)
    expect(grouped.container.textContent).not.toContain('Ada')
    expect(grouped.container.querySelector('[data-tiger-summary]')).toBeTruthy()
  })

  it('virtualizes cards by height and exposes drag handles', () => {
    const rows = Array.from({ length: 30 }, (_, index) => ({ id: index, name: `row-${index}` }))
    const { container } = render(
      <Table
        columns={[{ key: 'name', title: 'Name' }]}
        dataSource={rows}
        rowKey="id"
        pagination={false}
        responsiveMode="card"
        cardViewport
        cardItemHeight={40}
        rowDraggable
        columnDraggable
      />
    )
    const window = container.querySelector('[data-tiger-card-window]')?.getAttribute('data-tiger-card-window')
    expect(window).toBeTruthy()
    expect(window).not.toBe('0-30')
    expect(container.textContent).not.toContain('row-29')
    const handles = render(
      <Table
        columns={[{ key: 'name', title: 'Name' }]}
        dataSource={[{ id: 1, name: 'Ada' }]}
        rowKey="id"
        pagination={false}
        rowDraggable
        columnDraggable
      />
    )
    expect(handles.container.querySelector('[data-tiger-row-drag-handle]')).toBeTruthy()
    expect(handles.container.querySelector('[data-tiger-col-drag-handle]')).toBeTruthy()
    const onRowOrderChange = vi.fn()
    const onColumnOrderChange = vi.fn()
    const ordered = render(
      <Table
        columns={[
          { key: 'name', title: 'Name' },
          { key: 'qty', title: 'Qty' }
        ]}
        dataSource={[
          { id: 1, name: 'Ada' },
          { id: 2, name: 'Bea' }
        ]}
        rowKey="id"
        pagination={false}
        rowDraggable
        columnDraggable
        onRowOrderChange={onRowOrderChange}
        onColumnOrderChange={onColumnOrderChange}
      />
    )
    fireEvent.dragStart(ordered.container.querySelector('[data-tiger-row-drag-handle]')!)
    fireEvent.drop(ordered.container.querySelectorAll('tbody tr')[1]!)
    expect(onRowOrderChange).toHaveBeenCalledWith([
      { id: 2, name: 'Bea' },
      { id: 1, name: 'Ada' }
    ])
    expect(ordered.container.querySelector('[data-tiger-drag-live]')?.textContent).toBeTruthy()
    fireEvent.dragStart(ordered.container.querySelector('[data-tiger-col-drag-handle]')!)
    fireEvent.drop(ordered.container.querySelectorAll('[data-tiger-col-drag-handle]')[1]!)
    expect(
      (onColumnOrderChange.mock.calls[0]?.[0] as { key: string }[]).map((column) => column.key)
    ).toEqual(['qty', 'name'])
  })

  it('places timeline labels opposite the axis, including horizontal', () => {
    const { container } = render(
      <Timeline mode="horizontal" items={[{ label: '2024-01-02', content: 'Ship' }]} />
    )
    const time = container.querySelector('time')
    expect(time?.getAttribute('datetime')).toBe('2024-01-02')
    expect(time?.getAttribute('data-timeline-label-side')).toBe('start')
    expect(container.querySelector('[data-timeline-mode="horizontal"]')).toBeTruthy()
  })

  it('keeps nested collapse keys on their own level', () => {
    const { getByRole } = render(
      <Collapse defaultActiveKey={['outer']}>
        <CollapsePanel panelKey="outer" header="Outer">
          <Collapse defaultActiveKey={[]}>
            <CollapsePanel panelKey="inner" header="Inner" />
          </Collapse>
        </CollapsePanel>
      </Collapse>
    )
    const inner = getByRole('button', { name: 'Inner' })
    fireEvent.click(inner)
    expect(inner.getAttribute('aria-expanded')).toBe('true')
    expect(getByRole('button', { name: 'Outer' }).getAttribute('aria-expanded')).toBe('true')
  })

  it('binds chart, editor, and feed helpers', () => {
    const bar = render(
      <BarChart
        responsive={false}
        width={200}
        height={120}
        data={[{ x: 'a', y: 1 }]}
        bind={{
          mode: 'stacked',
          series: [
            { key: 's', data: [{ x: 'a', y: 2 }] },
            { key: 't', data: [{ x: 'a', y: 3 }] }
          ],
          line: [{ y: 5 }]
        }}
      />
    )
    expect(bar.container.querySelector('[data-tiger-bar-layout="stacked"]')).toBeTruthy()
    expect(bar.container.querySelector('[data-combo-line]')?.getAttribute('data-combo-line')).toBe('5')

    const line = render(
      <LineChart
        responsive={false}
        width={200}
        height={120}
        data={[{ x: 1, y: 2 }]}
        bind={{
          time: [Date.UTC(2024, 0, 1)],
          domain: { min: 0, max: 10 },
          reference: { value: 4, end: 6 },
          brush: { min: 1, max: 3 },
          secondAxis: true,
          tooltip: [{ name: 'A', value: 2 }],
          tooltipTotal: 4
        }}
      />
    )
    expect(line.container.querySelector('[data-time-tick]')?.getAttribute('data-time-tick')).toMatch(
      /2024/
    )
    expect(line.container.querySelector('[data-reference]')?.getAttribute('data-reference')).toBe('4')
    expect(line.container.querySelector('[data-brush-start]')?.getAttribute('data-brush-start')).toBe('1')
    expect(line.container.querySelector('[data-second-axis]')).toBeTruthy()
    expect(line.container.querySelector('[data-tooltip-row]')?.getAttribute('data-tooltip-row')).toContain(
      'A:2:'
    )

    const pie = render(
      <PieChart
        responsive={false}
        width={160}
        height={160}
        data={[{ value: 1 }, { value: 4 }]}
        bind={{
          rose: true,
          base: 40,
          max: 4,
          values: [1, 4],
          labels: [
            { index: 0, x: 0, y: 0, width: 10, height: 20 },
            { index: 1, x: 0, y: 4, width: 10, height: 20 }
          ]
        }}
      />
    )
    const labelYs = [...pie.container.querySelectorAll('[data-pie-label-y]')].map((node) =>
      Number(node.getAttribute('data-pie-label-y'))
    )
    expect(labelYs[1]).toBeGreaterThan(labelYs[0])
    const radii = [...pie.container.querySelectorAll('[data-pie-radius]')].map((node) =>
      Number(node.getAttribute('data-pie-radius'))
    )
    expect(radii[1]).toBeGreaterThan(radii[0])

    const radar = render(
      <RadarChart
        responsive={false}
        width={160}
        height={160}
        data={[{ label: 'A', value: 50 }]}
        bind={{ values: [50], indicators: [{ name: 'A', max: 100 }] }}
      />
    )
    expect(radar.container.querySelector('[data-radar-ratio]')?.getAttribute('data-radar-ratio')).toBe(
      '0.5'
    )

    const gauge = render(
      <GaugeChart responsive={false} width={160} height={100} value={40} bind={{ display: 'arc' }} />
    )
    expect(gauge.container.querySelector('[data-gauge-pointer]')?.getAttribute('data-gauge-pointer')).toBe(
      'false'
    )

    const heat = render(
      <HeatmapChart
        responsive={false}
        width={160}
        height={120}
        xLabels={['A']}
        yLabels={['One']}
        data={[{ x: 'A', y: 'One', value: 1 }]}
        bind={{
          minColor: '#fff',
          maxColor: '#000',
          value: 1,
          min: 0,
          max: 2,
          calendar: [Date.UTC(2024, 5, 1)]
        }}
      />
    )
    expect(heat.container.querySelector('[data-heat-label]')?.getAttribute('data-heat-label')).toBeTruthy()
    expect(heat.container.querySelector('[data-calendar-tick]')).toBeTruthy()

    const sun = render(
      <SunburstChart
        responsive={false}
        width={160}
        height={160}
        data={[]}
        bind={{ roots: [{ id: 'root', children: [{ id: 'leaf' }] }] }}
      />
    )
    expect(sun.container.querySelector('[data-drill-node="root"]')).toBeTruthy()
    fireEvent.click(sun.container.querySelector('[data-drill-node="root"]')!)
    expect(sun.container.querySelector('[data-drill-node="leaf"]')).toBeTruthy()
    fireEvent.click(sun.container.querySelector('[data-tiger-breadcrumb]')!)
    expect(sun.container.querySelector('[data-drill-node="root"]')).toBeTruthy()

    const tree = render(
      <TreeMapChart
        responsive={false}
        width={160}
        height={120}
        data={[]}
        bind={{ roots: [{ id: 'map', children: [{ id: 'cell' }] }] }}
      />
    )
    fireEvent.click(tree.container.querySelector('[data-drill-node="map"]')!)
    expect(tree.container.querySelector('[data-drill-node="cell"]')).toBeTruthy()

    const gantt = render(
      <Gantt
        data={[]}
        bind={{
          tasks: [
            { id: 'm', start: 5, end: 5 },
            { id: 'bar', start: 1, end: 4 }
          ],
          dependency: 'SS',
          source: { x: 0, width: 10 },
          target: { x: 20, width: 8 },
          window: { start: 0, end: 6 },
          viewportHeight: 40,
          rowHeight: 20
        }}
      />
    )
    expect(gantt.container.querySelector('[data-gantt-milestone="m"]')).toBeTruthy()
    expect(gantt.container.querySelector('[data-gantt-anchor]')?.getAttribute('data-gantt-anchor')).toBe(
      '0,20'
    )

    const org = render(
      <OrgChart
        data={[{ id: 'a', label: 'Ada' }]}
        bind={{
          nodes: [{ id: 'ada', label: 'Ada', children: [{ id: 'bea', label: 'Bea' }] }],
          collapsed: ['ada'],
          query: 'bea'
        }}
      />
    )
    expect(org.container.querySelector('[data-org-visible="bea"]')).toBeNull()
    expect(org.container.querySelector('[data-org-match]')?.getAttribute('data-org-match')).toBe('bea')
    fireEvent.click(org.container.querySelector('[data-tiger-org-zoom-in]')!)

    const onCodeChange = vi.fn()
    const code = render(
      <CodeEditor
        value="alpha (beta)"
        onChange={onCodeChange}
        bind={{
          query: 'alpha',
          replacement: 'omega',
          caret: 6,
          scrollTop: 0,
          viewportHeight: 40,
          lineHeight: 20,
          lineCount: 80,
          language: { id: 'demo', keywords: ['alpha'] }
        }}
      />
    )
    expect(code.container.querySelector('[data-code-match="0"]')).toBeTruthy()
    expect(code.container.querySelector('[data-bracket]')?.getAttribute('data-bracket')).toContain('-')
    expect(code.container.querySelector('[data-line-window]')?.getAttribute('data-line-window')).toContain(
      'demo'
    )
    fireEvent.click(code.container.querySelector('[data-tiger-replace]')!)
    expect(onCodeChange).toHaveBeenCalledWith('omega (beta)')

    const onMarkdownChange = vi.fn()
    const markdown = render(
      <MarkdownEditor
        value={'# Title\n- [ ] task'}
        onChange={onMarkdownChange}
        bind={{ html: '<b>bold</b>', lockScroll: true }}
      />
    )
    expect(markdown.container.querySelector('[data-toc="Title"]')).toBeTruthy()
    expect(markdown.container.querySelector('[data-markdown-task="open"]')).toBeTruthy()
    expect(markdown.container.querySelector('[data-lock-scroll]')).toBeTruthy()
    const editPane = markdown.container.querySelector('textarea') as HTMLTextAreaElement
    const preview = markdown.container.querySelector('div.overflow-auto') as HTMLElement
    Object.defineProperty(editPane, 'scrollHeight', { configurable: true, value: 200 })
    Object.defineProperty(editPane, 'clientHeight', { configurable: true, value: 100 })
    Object.defineProperty(preview, 'scrollHeight', { configurable: true, value: 400 })
    Object.defineProperty(preview, 'clientHeight', { configurable: true, value: 100 })
    editPane.scrollTop = 50
    fireEvent.scroll(editPane)
    expect(preview.scrollTop).toBe(150)
    fireEvent.click(markdown.container.querySelector('[data-tiger-md-paste]')!)
    expect(String(onMarkdownChange.mock.calls[0]?.[0])).toContain('bold')

    const rich = render(<RichTextEditor bind />)
    fireEvent.click(rich.container.querySelector('[data-tiger-slash="table"]')!)
    fireEvent.click(rich.container.querySelector('[data-tiger-slash="image"]')!)
    expect(rich.container.querySelector('[data-tiger-rte-serial]')?.textContent).toContain('|')
    expect(rich.container.querySelector('[data-shortcut]')?.getAttribute('data-shortcut')).toBe('heading')

    const files = render(
      <FileManager
        files={[
          { key: 'a', name: 'Alpha', type: 'file' },
          { key: 'b', name: 'Beta', type: 'folder', children: [{ key: 'c', name: 'Gamma', type: 'file' }] }
        ]}
        bind={{
          query: 'gamma',
          recursive: true,
          name: 'Alpha\n',
          permission: { readable: false, writable: false }
        }}
      />
    )
    expect(files.container.querySelector('[data-tiger-file-open]')?.hasAttribute('disabled')).toBe(true)
    expect(files.container.querySelector('[data-tiger-file-rename]')?.hasAttribute('disabled')).toBe(true)
    expect(files.container.querySelector('[data-file-hit="Gamma"]')).toBeTruthy()
    const photo = new File(['x'], 'photo.png', { type: 'image/png' })
    const upload = files.container.querySelector('[data-tiger-file-upload]') as HTMLInputElement
    Object.defineProperty(upload, 'files', { value: [photo] })
    fireEvent.change(upload)
    expect(files.container.querySelector('[data-file-upload]')?.textContent).toBe('photo.png')
    expect(files.container.querySelector('[data-file-preview]')?.textContent).toBe('photo.png')
    const onOpen = vi.fn()
    const renamed = render(
      <FileManager
        files={[{ key: 'a', name: 'Alpha', type: 'file' }]}
        onOpen={onOpen}
        bind={{ name: 'Alpha\n', permission: { readable: true, writable: true } }}
      />
    )
    fireEvent.click(renamed.container.querySelector('[data-tiger-file-rename]')!)
    expect(renamed.container.querySelector('[data-file-action]')?.textContent).toBe('Alpha')
    fireEvent.click(renamed.container.querySelector('[data-tiger-file-open]')!)
    expect(onOpen).toHaveBeenCalled()

    const note = render(<ImageAnnotation src="" bind />)
    fireEvent.click(note.container.querySelector('[data-tiger-nudge]')!)
    expect(
      Number(note.container.querySelector('[data-annotation-box]')?.textContent?.split(',')[0])
    ).toBeGreaterThan(0.2)
    fireEvent.click(note.container.querySelector('[data-tiger-vertex]')!)
    expect(note.container.querySelector('[data-annotation-vertex]')?.textContent).toBe('0.5')

    const drag = render(<Drag items={[{ id: 'a' }, { id: 'b' }]} />)
    const dragItems = drag.container.querySelectorAll('li')
    fireEvent.dragStart(dragItems[0]!)
    expect(drag.container.querySelector('[data-tiger-drag-preview]')?.textContent).toBe('a')
    fireEvent.dragOver(dragItems[1]!)
    expect(drag.container.querySelector('[data-tiger-drag-live]')?.textContent).toBeTruthy()

    const print = render(
      <PrintLayout bind={{ contentHeightMm: 500, pageHeightMm: 200, marginMm: 10, manualBreaks: 1 }} />
    )
    expect(print.container.querySelectorAll('[data-page-number]').length).toBeGreaterThan(1)

    const onLoadMore = vi.fn()
    const feed = render(
      <ActivityFeed
        groupByDate
        hasMore
        onLoadMore={onLoadMore}
        items={[
          { id: '1', title: 'Newest', time: '2024-05-02T00:00:00Z' },
          { id: '2', title: 'Older', time: '2024-05-01T00:00:00Z' }
        ]}
      />
    )
    expect(feed.container.querySelector('[data-activity-date="2024-05-02"]')).toBeTruthy()
    expect(feed.container.querySelector('[aria-live="polite"]')?.textContent).toContain('Newest')
    fireEvent.click(feed.container.querySelector('[data-tiger-next-page]')!)
    expect(onLoadMore).toHaveBeenCalled()

    const onEdit = vi.fn()
    const onDelete = vi.fn()
    const comments = render(
      <CommentThread
        editable
        rich
        onEdit={onEdit}
        onDelete={onDelete}
        items={[{ id: 'c1', content: '<script>x</script><b>ok</b>' }]}
      />
    )
    expect(comments.container.querySelector('[data-comment-html]')?.innerHTML).not.toContain('script')
    fireEvent.click(comments.container.querySelector('[data-comment-edit="c1"]')!)
    expect(onEdit.mock.calls[0]?.[0]).toMatchObject({ id: 'c1' })
    fireEvent.click(comments.container.querySelector('[data-comment-delete="c1"]')!)
    expect(onDelete).toHaveBeenCalledWith('c1')
  })
})
