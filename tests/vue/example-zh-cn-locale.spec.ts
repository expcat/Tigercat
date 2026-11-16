/**
 * @vitest-environment happy-dom
 */

import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/vue'
import { h } from 'vue'
import { ConfigProvider } from '@expcat/tigercat-vue/ConfigProvider'
import { enUS } from '@expcat/tigercat-core/locales/en-US'
import { zhCN } from '@expcat/tigercat-core/locales/zh-CN'
import { zhTW } from '@expcat/tigercat-core/locales/zh-TW'
import CronEditorDemo from '../../examples/example/vue3/src/examples/cron-editor/01/App.vue'
import DatePickerDemo from '../../examples/example/vue3/src/examples/datepicker/01/App.vue'
import DataExportDemo from '../../examples/example/vue3/src/examples/data-export/01/App.vue'
import RateSizeDemo from '../../examples/example/vue3/src/examples/rate/02/App.vue'
import RateStateDemo from '../../examples/example/vue3/src/examples/rate/03/App.vue'

function renderDemo(demo: object, locale: object = zhCN) {
  return render({
    setup() {
      return () => h(ConfigProvider, { locale }, () => h(demo))
    }
  })
}

describe('Vue example pages on zh-CN', () => {
  it('names each Rate row by its visible size or state', () => {
    const sizes = renderDemo(RateSizeDemo)
    for (const label of ['sm', 'md', 'lg', 'count']) {
      expect(sizes.getByRole('slider', { name: `评分（${label}）` })).toBeInTheDocument()
    }
    sizes.unmount()
    const states = renderDemo(RateStateDemo)
    for (const label of ['自定义', '只读', '禁用']) {
      expect(states.getByRole('slider', { name: `${label}评分` })).toBeInTheDocument()
    }
  })

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
    expect(screen.queryByText('請選擇日期')).not.toBeInTheDocument()
  })

  it('renders DatePicker with the shell locale, including en-US and zh-TW', () => {
    const english = renderDemo(DatePickerDemo, enUS)
    expect(english.container.querySelector('input')).toHaveAttribute('placeholder', 'Select date')
    english.unmount()
    const traditional = renderDemo(DatePickerDemo, zhTW)
    expect(traditional.container.querySelector('input')).toHaveAttribute(
      'placeholder',
      '請選擇日期'
    )
  })

  it('renders DataExport with Simplified trigger copy', () => {
    renderDemo(DataExportDemo)
    expect(screen.getByRole('button', { name: '导出数据' })).toHaveTextContent('导出')
    expect(screen.getByText(/默认 formats/)).toBeInTheDocument()
    expect(screen.queryByText('匯出')).not.toBeInTheDocument()
  })
})
