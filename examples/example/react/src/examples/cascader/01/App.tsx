import { useState } from 'react'
import { FormItem } from '@expcat/tigercat-react/FormItem'
import { Cascader } from '@expcat/tigercat-react/Cascader'

const options = [
  {
    label: '浙江',
    value: 'zhejiang',
    children: [
      {
        label: '杭州',
        value: 'hangzhou',
        children: [
          { label: '西湖区', value: 'xihu' },
          { label: '余杭区', value: 'yuhang' }
        ]
      }
    ]
  },
  {
    label: '江苏',
    value: 'jiangsu',
    children: [{ label: '南京', value: 'nanjing' }]
  }
]

export default function App() {
  const [value, setValue] = useState<(string | number)[] | undefined>(undefined)

  return (
    <FormItem label="地区" className="w-full max-w-sm">
      <Cascader value={value} onChange={setValue} options={options} />
    </FormItem>
  )
}
