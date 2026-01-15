import React, { useState } from 'react'
import { DatePicker } from '@expcat/tigercat-react'
import { useLang } from '../context/lang'

const PICKER_WIDTH = 'w-full max-w-[260px]'
const RANGE_PICKER_WIDTH = 'w-full max-w-[340px]'

const DatePickerDemo: React.FC = () => {
  const { lang: locale } = useLang()
  const [date, setDate] = useState<Date | null>(null)
  const [dateWithDefault, setDateWithDefault] = useState<Date | null>(new Date('2024-01-15'))
  const [minMaxDate, setMinMaxDate] = useState<Date | null>(null)
  const [range, setRange] = useState<[Date | null, Date | null]>([null, null])

  const minDate = new Date('2024-01-01')
  const maxDate = new Date('2024-12-31')

  return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">DatePicker 日期选择器</h1>
        <p className="text-gray-600">用于选择或输入日期。</p>
      </div>

      {/* 基础用法 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">基础用法</h2>
        <p className="text-gray-600 mb-6">基础的日期选择器组件。</p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <div className="max-w-md space-y-4">
            <DatePicker
              className={PICKER_WIDTH}
              value={date}
              onChange={setDate}
              placeholder="请选择日期"
              locale={locale}
            />
            <p className="text-sm text-gray-600">
              选中的日期：{date ? date.toLocaleDateString(locale) : '未选择'}
            </p>
          </div>
        </div>
      </section>

      {/* 范围选择 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">范围选择</h2>
        <p className="text-gray-600 mb-6">选择开始日期与结束日期。</p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <div className="max-w-md space-y-4">
            <DatePicker
              range
              className={RANGE_PICKER_WIDTH}
              value={range}
              onChange={setRange}
              placeholder="请选择日期范围"
              locale={locale}
            />
            <p className="text-sm text-gray-600">
              已选范围：
              {range[0] ? range[0].toLocaleDateString(locale) : '未选择'} -{' '}
              {range[1] ? range[1].toLocaleDateString(locale) : '未选择'}
            </p>
          </div>
        </div>
      </section>

      {/* 自定义文案 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">自定义文案</h2>
        <p className="text-gray-600 mb-6">
          通过 <code>labels</code> 覆盖 Today/OK 与 aria-label 文案。
        </p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <div className="max-w-md space-y-4">
            <DatePicker
              range
              className={RANGE_PICKER_WIDTH}
              defaultValue={[new Date('2024-03-10'), null]}
              locale={locale}
              labels={{
                today: locale === 'zh-CN' ? '今天（自定义）' : 'Today (Custom)',
                ok: locale === 'zh-CN' ? '确定（自定义）' : 'OK (Custom)',
                toggleCalendar: locale === 'zh-CN' ? '打开选择器' : 'Open picker'
              }}
            />
          </div>
        </div>
      </section>

      {/* 不同尺寸 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">不同尺寸</h2>
        <p className="text-gray-600 mb-6">日期选择器有三种尺寸：小、中、大。</p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <div className="max-w-md space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">小尺寸</label>
              <DatePicker
                size="sm"
                className={PICKER_WIDTH}
                placeholder="小尺寸日期选择器"
                locale={locale}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">中尺寸</label>
              <DatePicker
                size="md"
                className={PICKER_WIDTH}
                placeholder="中尺寸日期选择器"
                locale={locale}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">大尺寸</label>
              <DatePicker
                size="lg"
                className={PICKER_WIDTH}
                placeholder="大尺寸日期选择器"
                locale={locale}
              />
            </div>
          </div>
        </div>
      </section>

      {/* 日期格式 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">日期格式</h2>
        <p className="text-gray-600 mb-6">仅展示两种常用日期显示格式。</p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <div className="max-w-md space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">yyyy-MM-dd</label>
              <DatePicker
                className={PICKER_WIDTH}
                value={dateWithDefault}
                onChange={setDateWithDefault}
                format="yyyy-MM-dd"
                locale={locale}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">MM/dd/yyyy</label>
              <DatePicker
                className={PICKER_WIDTH}
                value={dateWithDefault}
                onChange={setDateWithDefault}
                format="MM/dd/yyyy"
                locale={locale}
              />
            </div>
          </div>
        </div>
      </section>

      {/* 日期范围限制 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">日期范围限制</h2>
        <p className="text-gray-600 mb-6">
          使用 minDate 和 maxDate 限制可选择的日期范围（2024年度）。
        </p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <div className="max-w-md space-y-4">
            <DatePicker
              className={PICKER_WIDTH}
              value={minMaxDate}
              onChange={setMinMaxDate}
              minDate={minDate}
              maxDate={maxDate}
              placeholder="仅可选择2024年的日期"
              locale={locale}
            />
            <p className="text-sm text-gray-600">
              选中日期：
              {minMaxDate ? minMaxDate.toLocaleDateString(locale) : '未选择'}
            </p>
          </div>
        </div>
      </section>

      {/* 禁用和只读 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">禁用和只读</h2>
        <p className="text-gray-600 mb-6">日期选择器可以设置为禁用或只读状态。</p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <div className="max-w-md space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">禁用</label>
              <DatePicker
                className={PICKER_WIDTH}
                value={new Date('2024-06-15')}
                disabled
                locale={locale}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">只读</label>
              <DatePicker
                className={PICKER_WIDTH}
                value={new Date('2024-06-15')}
                readonly
                locale={locale}
              />
            </div>
          </div>
        </div>
      </section>

      {/* 可清除 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">可清除</h2>
        <p className="text-gray-600 mb-6">使用 clearable 属性控制是否显示清除按钮。</p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <div className="max-w-md space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">可清除</label>
              <DatePicker
                className={PICKER_WIDTH}
                value={dateWithDefault}
                onChange={setDateWithDefault}
                clearable={true}
                locale={locale}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">不可清除</label>
              <DatePicker
                className={PICKER_WIDTH}
                value={dateWithDefault}
                onChange={setDateWithDefault}
                clearable={false}
                locale={locale}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default DatePickerDemo
