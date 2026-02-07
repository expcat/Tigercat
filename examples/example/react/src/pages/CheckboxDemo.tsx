import React, { useState } from 'react'
import { Checkbox, CheckboxGroup, Space } from '@expcat/tigercat-react'
import DemoBlock from '../components/DemoBlock'

const basicSnippet = `<Space direction="vertical">
  <Checkbox checked={checked} onChange={setChecked}>复选框</Checkbox>
  <p className="text-sm text-gray-600">选中状态：{checked.toString()}</p>
</Space>`

const uncontrolledSnippet = `<Space>
  <Checkbox defaultChecked>默认选中</Checkbox>
  <Checkbox>默认未选中</Checkbox>
</Space>`

const disabledSnippet = `<Space>
  <Checkbox disabled>未选中禁用</Checkbox>
  <Checkbox checked disabled>选中禁用</Checkbox>
</Space>`

const indeterminateSnippet = `<Space direction="vertical">
  <Checkbox checked={allChecked} indeterminate={indeterminate} onChange={handleCheckAllChange}>
    全选
  </Checkbox>
  <CheckboxGroup value={indeterminateValues} onChange={handleIndeterminateValuesChange}>
    <Checkbox value="apple">苹果</Checkbox>
    <Checkbox value="banana">香蕉</Checkbox>
    <Checkbox value="orange">橙子</Checkbox>
  </CheckboxGroup>
  <p className="text-sm text-gray-600">已选择：{indeterminateValues.join(', ')}</p>
</Space>`

const groupSnippet = `<Space direction="vertical">
  <CheckboxGroup value={fruits} onChange={handleFruitsChange}>
    <Checkbox value="apple">苹果</Checkbox>
    <Checkbox value="banana">香蕉</Checkbox>
    <Checkbox value="orange">橙子</Checkbox>
    <Checkbox value="grape">葡萄</Checkbox>
  </CheckboxGroup>
  <p className="text-sm text-gray-600">选中的水果：{fruits.join(', ')}</p>
</Space>`

const sizeSnippet = `<Space>
  <Checkbox size="sm">Small</Checkbox>
  <Checkbox size="md">Medium</Checkbox>
  <Checkbox size="lg">Large</Checkbox>
</Space>`

const groupDisabledSnippet = `<Space direction="vertical">
  <CheckboxGroup disabled value={['apple']}>
    <Checkbox value="apple">苹果</Checkbox>
    <Checkbox value="banana">香蕉</Checkbox>
    <Checkbox value="orange">橙子</Checkbox>
  </CheckboxGroup>
</Space>`

const groupSizeSnippet = `<Space direction="vertical">
  <CheckboxGroup size="lg" value={groupSizeValues} onChange={setGroupSizeValues}>
    <Checkbox value="apple">苹果</Checkbox>
    <Checkbox value="banana">香蕉</Checkbox>
    <Checkbox value="orange" size="sm">橙子 (sm 覆盖)</Checkbox>
  </CheckboxGroup>
  <p className="text-sm text-gray-600">已选择：{groupSizeValues.join(', ')}</p>
</Space>`

const CheckboxDemo: React.FC = () => {
  const [checked, setChecked] = useState(false)
  const [indeterminateValues, setIndeterminateValues] = useState<(string | number | boolean)[]>([
    'apple'
  ])
  const [fruits, setFruits] = useState<(string | number | boolean)[]>(['apple'])
  const [groupSizeValues, setGroupSizeValues] = useState<(string | number | boolean)[]>(['apple'])

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
      <DemoBlock
        title="基础用法"
        description="单独使用可以表示两种状态之间的切换。"
        code={basicSnippet}>
        <Space direction="vertical">
          <Checkbox checked={checked} onChange={setChecked}>
            复选框
          </Checkbox>
          <p className="text-sm text-gray-600">选中状态：{checked.toString()}</p>
        </Space>
      </DemoBlock>

      {/* 非受控模式 */}
      <DemoBlock
        title="非受控模式"
        description="使用 defaultChecked 设置默认选中，组件内部管理状态。"
        code={uncontrolledSnippet}>
        <Space>
          <Checkbox defaultChecked>默认选中</Checkbox>
          <Checkbox>默认未选中</Checkbox>
        </Space>
      </DemoBlock>

      {/* 禁用状态 */}
      <DemoBlock title="禁用状态" description="多选框不可用状态。" code={disabledSnippet}>
        <Space>
          <Checkbox disabled>未选中禁用</Checkbox>
          <Checkbox checked disabled>
            选中禁用
          </Checkbox>
        </Space>
      </DemoBlock>

      {/* 不确定状态 */}
      <DemoBlock
        title="不确定状态"
        description="通过 indeterminate 实现“全选/半选”效果。"
        code={indeterminateSnippet}>
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
      </DemoBlock>

      {/* 多选框组 */}
      <DemoBlock
        title="多选框组"
        description="适用于多个勾选框绑定到同一个数组的情景。"
        code={groupSnippet}>
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
      </DemoBlock>

      {/* 尺寸 */}
      <DemoBlock
        title="尺寸"
        description="支持 sm / md / lg 三种尺寸，可在 CheckboxGroup 中统一设置。"
        code={sizeSnippet}>
        <Space>
          <Checkbox size="sm">Small</Checkbox>
          <Checkbox size="md">Medium</Checkbox>
          <Checkbox size="lg">Large</Checkbox>
        </Space>
      </DemoBlock>

      {/* 分组禁用 */}
      <DemoBlock
        title="分组禁用"
        description="设置 CheckboxGroup 的 disabled 可禁用所有子复选框。"
        code={groupDisabledSnippet}>
        <Space direction="vertical">
          <CheckboxGroup disabled value={['apple']}>
            <Checkbox value="apple">苹果</Checkbox>
            <Checkbox value="banana">香蕉</Checkbox>
            <Checkbox value="orange">橙子</Checkbox>
          </CheckboxGroup>
        </Space>
      </DemoBlock>

      {/* 分组尺寸继承 */}
      <DemoBlock
        title="分组尺寸继承"
        description="CheckboxGroup 设置 size 后子复选框继承，个别子项可通过自身 size 覆盖。"
        code={groupSizeSnippet}>
        <Space direction="vertical">
          <CheckboxGroup size="lg" value={groupSizeValues} onChange={setGroupSizeValues}>
            <Checkbox value="apple">苹果</Checkbox>
            <Checkbox value="banana">香蕉</Checkbox>
            <Checkbox value="orange" size="sm">
              橙子 (sm 覆盖)
            </Checkbox>
          </CheckboxGroup>
          <p className="text-sm text-gray-600">
            已选择：
            {groupSizeValues.filter((f) => typeof f === 'string').join(', ')}
          </p>
        </Space>
      </DemoBlock>
    </div>
  )
}

export default CheckboxDemo
