import React, { useState } from 'react'
import { Checkbox, CheckboxGroup, Space, Divider } from '@tigercat/react'

const CheckboxDemo: React.FC = () => {
  const [checked, setChecked] = useState(false)
  const [indeterminateValues, setIndeterminateValues] = useState<(string | number | boolean)[]>([
    'apple'
  ])
  const [fruits, setFruits] = useState<(string | number | boolean)[]>(['apple'])

  const options = ['apple', 'banana', 'orange']

  const allChecked =
    indeterminateValues.filter((f) => typeof f === 'string').length === options.length
  const indeterminate = indeterminateValues.length > 0 && !allChecked

  const handleFruitsChange = (value: (string | number | boolean)[]) => {
    setFruits(value)
  }

  const handleIndeterminateValuesChange = (value: (string | number | boolean)[]) => {
    setIndeterminateValues(value)
  }

  const handleCheckAllChange = (nextChecked: boolean) => {
    setIndeterminateValues(nextChecked ? [...options] : [])
  }

  return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Checkbox 多选框</h1>
        <p className="text-gray-600">在一组可选项中进行多项选择。</p>
      </div>

      {/* 基础用法 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">基础用法</h2>
        <p className="text-gray-600 mb-6">单独使用可以表示两种状态之间的切换。</p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Space direction="vertical">
            <Checkbox checked={checked} onChange={setChecked}>
              复选框
            </Checkbox>
            <p className="text-sm text-gray-600">选中状态：{checked.toString()}</p>
          </Space>
        </div>
        <Divider className="my-6" />
      </section>

      {/* 非受控模式 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">非受控模式</h2>
        <p className="text-gray-600 mb-6">使用 defaultChecked 设置默认选中，组件内部管理状态。</p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Space>
            <Checkbox defaultChecked>默认选中</Checkbox>
            <Checkbox>默认未选中</Checkbox>
          </Space>
        </div>
        <Divider className="my-6" />
      </section>

      {/* 禁用状态 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">禁用状态</h2>
        <p className="text-gray-600 mb-6">多选框不可用状态。</p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Space>
            <Checkbox disabled>未选中禁用</Checkbox>
            <Checkbox checked disabled>
              选中禁用
            </Checkbox>
          </Space>
        </div>
        <Divider className="my-6" />
      </section>

      {/* 不确定状态 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">不确定状态</h2>
        <p className="text-gray-600 mb-6">通过 indeterminate 实现“全选/半选”效果。</p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Space direction="vertical">
            <Checkbox
              checked={allChecked}
              indeterminate={indeterminate}
              onChange={handleCheckAllChange}>
              全选
            </Checkbox>
            <CheckboxGroup value={indeterminateValues} onChange={handleIndeterminateValuesChange}>
              <Checkbox value={options[0]}>苹果</Checkbox>
              <Checkbox value={options[1]}>香蕉</Checkbox>
              <Checkbox value={options[2]}>橙子</Checkbox>
            </CheckboxGroup>
            <p className="text-sm text-gray-600">
              已选择：
              {indeterminateValues.filter((f) => typeof f === 'string').join(', ')}
            </p>
          </Space>
        </div>
        <Divider className="my-6" />
      </section>

      {/* 多选框组 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">多选框组</h2>
        <p className="text-gray-600 mb-6">适用于多个勾选框绑定到同一个数组的情景。</p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Space direction="vertical">
            <CheckboxGroup value={fruits} onChange={handleFruitsChange}>
              <Checkbox value="apple">苹果</Checkbox>
              <Checkbox value="banana">香蕉</Checkbox>
              <Checkbox value="orange">橙子</Checkbox>
              <Checkbox value="grape">葡萄</Checkbox>
            </CheckboxGroup>
            <p className="text-sm text-gray-600">
              选中的水果：
              {fruits.filter((f) => typeof f === 'string').join(', ')}
            </p>
          </Space>
        </div>
        <Divider className="my-6" />
      </section>

      {/* 尺寸 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">尺寸</h2>
        <p className="text-gray-600 mb-6">
          支持 sm / md / lg 三种尺寸，可在 CheckboxGroup 中统一设置。
        </p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Space direction="vertical">
            <Space>
              <Checkbox size="sm">Small</Checkbox>
              <Checkbox size="md">Medium</Checkbox>
              <Checkbox size="lg">Large</Checkbox>
            </Space>
          </Space>
        </div>
      </section>
    </div>
  )
}

export default CheckboxDemo
