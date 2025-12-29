import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { DatePicker } from '@tigercat/react'

const DatePickerDemo: React.FC = () => {
  const [date, setDate] = useState<Date | null>(null)
  const [dateWithDefault, setDateWithDefault] = useState<Date | null>(new Date('2024-01-15'))
  const [minMaxDate, setMinMaxDate] = useState<Date | null>(null)
  
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
            <DatePicker value={date} onChange={setDate} placeholder="请选择日期" />
            <p className="text-sm text-gray-600">
              选中的日期：{date ? date.toLocaleDateString() : '未选择'}
            </p>
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
              <DatePicker size="sm" placeholder="小尺寸日期选择器" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">中尺寸</label>
              <DatePicker size="md" placeholder="中尺寸日期选择器" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">大尺寸</label>
              <DatePicker size="lg" placeholder="大尺寸日期选择器" />
            </div>
          </div>
        </div>
      </section>

      {/* 日期格式 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">日期格式</h2>
        <p className="text-gray-600 mb-6">支持多种日期显示格式。</p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <div className="max-w-md space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">yyyy-MM-dd</label>
              <DatePicker value={dateWithDefault} onChange={setDateWithDefault} format="yyyy-MM-dd" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">MM/dd/yyyy</label>
              <DatePicker value={dateWithDefault} onChange={setDateWithDefault} format="MM/dd/yyyy" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">dd/MM/yyyy</label>
              <DatePicker value={dateWithDefault} onChange={setDateWithDefault} format="dd/MM/yyyy" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">yyyy/MM/dd</label>
              <DatePicker value={dateWithDefault} onChange={setDateWithDefault} format="yyyy/MM/dd" />
            </div>
          </div>
        </div>
      </section>

      {/* 日期范围限制 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">日期范围限制</h2>
        <p className="text-gray-600 mb-6">使用 minDate 和 maxDate 限制可选择的日期范围（2024年度）。</p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <div className="max-w-md space-y-4">
            <DatePicker 
              value={minMaxDate} 
              onChange={setMinMaxDate}
              minDate={minDate}
              maxDate={maxDate}
              placeholder="仅可选择2024年的日期"
            />
            <p className="text-sm text-gray-600">
              选中日期：{minMaxDate ? minMaxDate.toLocaleDateString() : '未选择'}
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
              <DatePicker value={new Date('2024-06-15')} disabled />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">只读</label>
              <DatePicker value={new Date('2024-06-15')} readonly />
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
              <DatePicker value={dateWithDefault} onChange={setDateWithDefault} clearable={true} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">不可清除</label>
              <DatePicker value={dateWithDefault} onChange={setDateWithDefault} clearable={false} />
            </div>
          </div>
        </div>
      </section>

      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <Link to="/" className="text-blue-600 hover:text-blue-800">← 返回首页</Link>
      </div>
    </div>
  )
}

export default DatePickerDemo
