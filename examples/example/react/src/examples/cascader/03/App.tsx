import { Space } from '@expcat/tigercat-react/Space'
import { useState } from 'react'
import { Cascader } from '@expcat/tigercat-react/Cascader'

const options = [
  {
    label: '浙江',
    value: 'zj',
    children: [
      {
        label: '杭州',
        value: 'hz',
        children: [
          { label: '西湖区', value: 'xh' },
          { label: '余杭区', value: 'yh' }
        ]
      },
      { label: '宁波', value: 'nb', children: [{ label: '鄞州区', value: 'yz' }] }
    ]
  },
  {
    label: '江苏',
    value: 'js',
    children: [
      {
        label: '南京',
        value: 'nj',
        children: [
          { label: '鼓楼区', value: 'gl' },
          { label: '玄武区', value: 'xw' }
        ]
      },
      { label: '苏州', value: 'sz', children: [{ label: '虎丘区', value: 'hq' }] }
    ]
  }
]

export default function App() {
  const [val, setVal] = useState<(string | number)[]>([])

  const [val2, setVal2] = useState<(string | number)[]>([])

  return (
    <>
      <Space direction="vertical" size={12}>
        <Cascader options={options} placeholder="小" size="sm" />
        <Cascader options={options} placeholder="中" size="md" />
        <Cascader options={options} placeholder="大" size="lg" />
        <Cascader options={options} placeholder="禁用" disabled />
      </Space>
    </>
  )
}
