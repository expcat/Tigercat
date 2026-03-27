import { useState } from 'react'
import { Cascader, Space } from '@expcat/tigercat-react'
import DemoBlock from '../components/DemoBlock'

const options = [
  {
    label: '浙江', value: 'zj', children: [
      { label: '杭州', value: 'hz', children: [{ label: '西湖区', value: 'xh' }, { label: '余杭区', value: 'yh' }] },
      { label: '宁波', value: 'nb', children: [{ label: '鄞州区', value: 'yz' }] }
    ]
  },
  {
    label: '江苏', value: 'js', children: [
      { label: '南京', value: 'nj', children: [{ label: '鼓楼区', value: 'gl' }, { label: '玄武区', value: 'xw' }] },
      { label: '苏州', value: 'sz', children: [{ label: '虎丘区', value: 'hq' }] }
    ]
  }
]

const basicSnippet = `<Cascader value={val} onChange={setVal} options={options} placeholder="请选择地区" />`
const searchSnippet = `<Cascader value={val} onChange={setVal} options={options} placeholder="搜索地区" showSearch />`
const sizeSnippet = `<Cascader options={options} placeholder="小" size="sm" />
<Cascader options={options} placeholder="中" size="md" />
<Cascader options={options} placeholder="大" size="lg" />
<Cascader options={options} placeholder="禁用" disabled />`

const CascaderDemo: React.FC = () => {
  const [val, setVal] = useState<(string | number)[]>([])
  const [val2, setVal2] = useState<(string | number)[]>([])

  return (
    <div className="max-w-5xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-2">Cascader 级联选择</h1>
      <p className="text-gray-500 mb-8">多级联动选择器，适用于省市区等层级数据。</p>

      <DemoBlock title="基本用法" description="逐级选择" code={basicSnippet}>
        <Cascader value={val} onChange={setVal} options={options} placeholder="请选择地区" />
      </DemoBlock>

      <DemoBlock title="可搜索" description="showSearch 开启搜索过滤" code={searchSnippet}>
        <Cascader value={val2} onChange={setVal2} options={options} placeholder="搜索地区" showSearch />
      </DemoBlock>

      <DemoBlock title="尺寸与禁用" description="sm/md/lg 三种尺寸" code={sizeSnippet}>
        <Space direction="vertical" size={12}>
          <Cascader options={options} placeholder="小" size="sm" />
          <Cascader options={options} placeholder="中" size="md" />
          <Cascader options={options} placeholder="大" size="lg" />
          <Cascader options={options} placeholder="禁用" disabled />
        </Space>
      </DemoBlock>
    </div>
  )
}

export default CascaderDemo
