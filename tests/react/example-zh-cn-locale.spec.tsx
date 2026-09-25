/**
 * @vitest-environment happy-dom
 */

import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { ReactElement } from 'react'
import { ConfigProvider } from '@expcat/tigercat-react/ConfigProvider'
import { zhCN } from '@expcat/tigercat-core/locales/zh-CN'
import CronEditorDemo from '../../examples/example/react/src/examples/cron-editor/01/App'
import DatePickerDemo from '../../examples/example/react/src/examples/datepicker/01/App'
import DataExportDemo from '../../examples/example/react/src/examples/data-export/01/App'

function renderDemo(Demo: () => ReactElement) {
  return render(
    <ConfigProvider locale={zhCN}>
      <Demo />
    </ConfigProvider>
  )
}

describe('React example pages on zh-CN', () => {
  it('renders CronEditor with Simplified copy', () => {
    renderDemo(CronEditorDemo)
    expect(screen.getByText('执行计划')).toBeInTheDocument()
    expect(screen.getByText('分钟')).toBeInTheDocument()
    expect(screen.getByRole('option', { name: '选择预设' })).toBeInTheDocument()
    expect(screen.queryByText('選擇預設')).not.toBeInTheDocument()
    expect(screen.queryByText('分鐘')).not.toBeInTheDocument()
  })

  it('renders DatePicker with the Simplified placeholder', () => {
    const { container } = renderDemo(DatePickerDemo)
    expect(container.querySelector('input')).toHaveAttribute('placeholder', '请选择日期')
  })

  it('renders DataExport with Simplified trigger copy', () => {
    renderDemo(DataExportDemo)
    expect(screen.getByRole('button', { name: '导出数据' })).toHaveTextContent('导出')
    expect(screen.getByText(/默认 formats/)).toBeInTheDocument()
    expect(screen.queryByText('匯出')).not.toBeInTheDocument()
  })
})
