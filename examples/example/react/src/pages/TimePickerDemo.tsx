import React, { useState } from 'react'
import { TimePicker } from '@expcat/tigercat-react'
import { useLang } from '../context/lang'
import DemoBlock from '../components/DemoBlock'

const PICKER_WIDTH = 'w-full max-w-[260px]'
const RANGE_PICKER_WIDTH = 'w-full max-w-[340px]'

const basicSnippet = `<TimePicker
  className={PICKER_WIDTH}
  value={time}
  onChange={setTime}
  locale={locale}
  placeholder="请选择时间"
/>
<p className="text-sm text-gray-600">选中的时间：{time || '未选择'}</p>`

const rangeSnippet = `<TimePicker
  range
  className={RANGE_PICKER_WIDTH}
  locale={locale}
  value={timeRange}
  onChange={setTimeRange}
  placeholder={locale === 'zh-CN' ? '请选择时间段' : 'Select time range'}
/>
<p className="text-sm text-gray-600">选中的时间段：{timeRange[0] || '未选择'} - {timeRange[1] || '未选择'}</p>`

const sizeSnippet = `<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">小尺寸</label>
  <TimePicker size="sm" className={PICKER_WIDTH} locale={locale} placeholder="小尺寸时间选择器" />
</div>
<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">中尺寸</label>
  <TimePicker size="md" className={PICKER_WIDTH} locale={locale} placeholder="中尺寸时间选择器" />
</div>
<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">大尺寸</label>
  <TimePicker size="lg" className={PICKER_WIDTH} locale={locale} placeholder="大尺寸时间选择器" />
</div>`

const formatSnippet = `<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">24 小时制</label>
  <TimePicker className={PICKER_WIDTH} value={time24} onChange={setTime24} format="24" locale={locale} />
  <p className="text-sm text-gray-500 mt-1">显示：{time24}</p>
</div>
<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">12 小时制</label>
  <TimePicker className={PICKER_WIDTH} value={time12} onChange={setTime12} format="12" locale={locale} />
  <p className="text-sm text-gray-500 mt-1">显示：{time12}</p>
</div>`

const secondsSnippet = `<TimePicker
  className={PICKER_WIDTH}
  value={timeWithSeconds}
  onChange={setTimeWithSeconds}
  showSeconds={true}
  locale={locale}
  placeholder="选择时间（包含秒）"
/>
<p className="text-sm text-gray-600">选中时间：{timeWithSeconds || '未选择'}</p>`

const stepSnippet = `<TimePicker
  className={PICKER_WIDTH}
  value={timeWithSteps}
  onChange={setTimeWithSteps}
  hourStep={2}
  minuteStep={15}
  locale={locale}
  placeholder="小时步长 2，分钟步长 15"
/>
<p className="text-sm text-gray-600">选中时间：{timeWithSteps || '未选择'}</p>`

const limitSnippet = `<TimePicker
  className={PICKER_WIDTH}
  value={timeWithRange}
  onChange={setTimeWithRange}
  minTime="09:00"
  maxTime="18:00"
  locale={locale}
  placeholder="仅可选择 9:00-18:00"
/>
<p className="text-sm text-gray-600">选中时间：{timeWithRange || '未选择'}</p>`

const disabledSnippet = `<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">禁用</label>
  <TimePicker className={PICKER_WIDTH} value="14:30" disabled locale={locale} />
</div>
<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">只读</label>
  <TimePicker className={PICKER_WIDTH} value="14:30" readonly locale={locale} />
</div>`

const clearableSnippet = `<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">可清除</label>
  <TimePicker className={PICKER_WIDTH} value={time24} onChange={setTime24} clearable={true} locale={locale} />
</div>
<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">不可清除</label>
  <TimePicker className={PICKER_WIDTH} value={time24} onChange={setTime24} clearable={false} locale={locale} />
</div>`

const TimePickerDemo: React.FC = () => {
  const { lang: locale } = useLang()
  const [time, setTime] = useState<string | null>(null)
  const [time24, setTime24] = useState<string | null>('14:30')
  const [time12, setTime12] = useState<string | null>('14:30')
  const [timeWithSeconds, setTimeWithSeconds] = useState<string | null>('14:30:45')
  const [timeWithSteps, setTimeWithSteps] = useState<string | null>(null)
  const [timeWithRange, setTimeWithRange] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState<[string | null, string | null]>([null, null])

  return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">TimePicker 时间选择器</h1>
        <p className="text-gray-600">用于选择或输入时间。</p>
      </div>

      {/* 基础用法 */}
      <DemoBlock title="基础用法" description="基础的时间选择器组件。" code={basicSnippet}>
        <div className="max-w-md space-y-4">
          <TimePicker
            className={PICKER_WIDTH}
            value={time}
            onChange={setTime}
            locale={locale}
            placeholder="请选择时间"
          />
          <p className="text-sm text-gray-600">选中的时间：{time || '未选择'}</p>
        </div>
      </DemoBlock>

      {/* 时间段选择 */}
      <DemoBlock
        title="时间段选择"
        description="启用 range 后可选择开始/结束时间。"
        code={rangeSnippet}>
        <div className="max-w-md space-y-4">
          <TimePicker
            range
            className={RANGE_PICKER_WIDTH}
            locale={locale}
            value={timeRange}
            onChange={setTimeRange}
            placeholder={locale === 'zh-CN' ? '请选择时间段' : 'Select time range'}
          />
          <p className="text-sm text-gray-600">
            选中的时间段：{timeRange[0] || '未选择'} - {timeRange[1] || '未选择'}
          </p>
        </div>
      </DemoBlock>

      {/* 不同尺寸 */}
      <DemoBlock
        title="不同尺寸"
        description="时间选择器有三种尺寸：小、中、大。"
        code={sizeSnippet}>
        <div className="max-w-md space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">小尺寸</label>
            <TimePicker
              size="sm"
              className={PICKER_WIDTH}
              locale={locale}
              placeholder="小尺寸时间选择器"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">中尺寸</label>
            <TimePicker
              size="md"
              className={PICKER_WIDTH}
              locale={locale}
              placeholder="中尺寸时间选择器"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">大尺寸</label>
            <TimePicker
              size="lg"
              className={PICKER_WIDTH}
              locale={locale}
              placeholder="大尺寸时间选择器"
            />
          </div>
        </div>
      </DemoBlock>

      {/* 时间格式 */}
      <DemoBlock title="时间格式" description="支持 12 小时制和 24 小时制。" code={formatSnippet}>
        <div className="max-w-md space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">24 小时制</label>
            <TimePicker
              className={PICKER_WIDTH}
              value={time24}
              onChange={setTime24}
              format="24"
              locale={locale}
            />
            <p className="text-sm text-gray-500 mt-1">显示：{time24}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">12 小时制</label>
            <TimePicker
              className={PICKER_WIDTH}
              value={time12}
              onChange={setTime12}
              format="12"
              locale={locale}
            />
            <p className="text-sm text-gray-500 mt-1">显示：{time12}</p>
          </div>
        </div>
      </DemoBlock>

      {/* 显示秒 */}
      <DemoBlock
        title="显示秒"
        description="使用 showSeconds 属性控制是否显示秒。"
        code={secondsSnippet}>
        <div className="max-w-md space-y-4">
          <TimePicker
            className={PICKER_WIDTH}
            value={timeWithSeconds}
            onChange={setTimeWithSeconds}
            showSeconds={true}
            locale={locale}
            placeholder="选择时间（包含秒）"
          />
          <p className="text-sm text-gray-600">选中时间：{timeWithSeconds || '未选择'}</p>
        </div>
      </DemoBlock>

      {/* 时间步长 */}
      <DemoBlock
        title="时间步长"
        description="使用 hourStep、minuteStep、secondStep 控制时间选择步长。"
        code={stepSnippet}>
        <div className="max-w-md space-y-4">
          <TimePicker
            className={PICKER_WIDTH}
            value={timeWithSteps}
            onChange={setTimeWithSteps}
            hourStep={2}
            minuteStep={15}
            locale={locale}
            placeholder="小时步长 2，分钟步长 15"
          />
          <p className="text-sm text-gray-600">选中时间：{timeWithSteps || '未选择'}</p>
        </div>
      </DemoBlock>

      {/* 时间范围限制 */}
      <DemoBlock
        title="时间范围限制"
        description="使用 minTime 和 maxTime 限制可选择的时间范围（9:00-18:00）。"
        code={limitSnippet}>
        <div className="max-w-md space-y-4">
          <TimePicker
            className={PICKER_WIDTH}
            value={timeWithRange}
            onChange={setTimeWithRange}
            minTime="09:00"
            maxTime="18:00"
            locale={locale}
            placeholder="仅可选择 9:00-18:00"
          />
          <p className="text-sm text-gray-600">选中时间：{timeWithRange || '未选择'}</p>
        </div>
      </DemoBlock>

      {/* 禁用和只读 */}
      <DemoBlock
        title="禁用和只读"
        description="时间选择器可以设置为禁用或只读状态。"
        code={disabledSnippet}>
        <div className="max-w-md space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">禁用</label>
            <TimePicker className={PICKER_WIDTH} value="14:30" disabled locale={locale} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">只读</label>
            <TimePicker className={PICKER_WIDTH} value="14:30" readonly locale={locale} />
          </div>
        </div>
      </DemoBlock>

      {/* 可清除 */}
      <DemoBlock
        title="可清除"
        description="使用 clearable 属性控制是否显示清除按钮。"
        code={clearableSnippet}>
        <div className="max-w-md space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">可清除</label>
            <TimePicker
              className={PICKER_WIDTH}
              value={time24}
              onChange={setTime24}
              clearable={true}
              locale={locale}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">不可清除</label>
            <TimePicker
              className={PICKER_WIDTH}
              value={time24}
              onChange={setTime24}
              clearable={false}
              locale={locale}
            />
          </div>
        </div>
      </DemoBlock>
    </div>
  )
}

export default TimePickerDemo
