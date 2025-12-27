import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Slider, Space, Divider, Text } from '@tigercat/react'

const SliderDemo: React.FC = () => {
  const [value1, setValue1] = useState(50)
  const [value2, setValue2] = useState(30)
  const [value3] = useState(75)

  return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Slider 滑块</h1>
        <p className="text-gray-600">通过拖动滑块在一个固定区间内进行选择。</p>
      </div>

      {/* 基础用法 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">基础用法</h2>
        <p className="text-gray-600 mb-6">基础的滑块用法，显示当前值。</p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Space direction="vertical" className="w-full max-w-md">
            <div className="flex items-center gap-4">
              <Slider value={value1} onChange={(val) => setValue1(Array.isArray(val) ? val[0] : val)} min={0} max={100} className="flex-1" />
              <Text>{value1}</Text>
            </div>
          </Space>
        </div>
        <Divider className="my-6" />
      </section>

      {/* 不同范围 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">不同范围</h2>
        <p className="text-gray-600 mb-6">通过 min 和 max 属性设置范围。</p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Space direction="vertical" className="w-full max-w-md">
            <div>
              <Text className="text-sm text-gray-600 mb-2">0-100 (默认)</Text>
              <div className="flex items-center gap-4">
                <Slider value={value1} onChange={(val) => setValue1(Array.isArray(val) ? val[0] : val)} min={0} max={100} className="flex-1" />
                <Text>{value1}</Text>
              </div>
            </div>
            <div>
              <Text className="text-sm text-gray-600 mb-2">0-200</Text>
              <div className="flex items-center gap-4">
                <Slider value={value2} onChange={(val) => setValue2(Array.isArray(val) ? val[0] : val)} min={0} max={200} className="flex-1" />
                <Text>{value2}</Text>
              </div>
            </div>
          </Space>
        </div>
        <Divider className="my-6" />
      </section>

      {/* 禁用状态 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">禁用状态</h2>
        <p className="text-gray-600 mb-6">通过 disabled 属性禁用滑块。</p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Space direction="vertical" className="w-full max-w-md">
            <div className="flex items-center gap-4">
              <Slider value={value3} min={0} max={100} disabled className="flex-1" />
              <Text>{value3}</Text>
            </div>
          </Space>
        </div>
      </section>

      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <Link to="/" className="text-blue-600 hover:text-blue-800">← 返回首页</Link>
      </div>
    </div>
  )
}

export default SliderDemo
