import { useState } from 'react'
import { AutoComplete } from '@expcat/tigercat-react/AutoComplete'

const options = [
  { label: '北京 Beijing', value: 'beijing' },
  { label: '上海 Shanghai', value: 'shanghai' },
  { label: '深圳 Shenzhen', value: 'shenzhen' }
]

export default function App() {
  const [value, setValue] = useState<string | number | undefined>()

  return (
    <AutoComplete
      value={value}
      onChange={setValue}
      options={options}
      placeholder="输入城市中英文名称"
      className="w-full max-w-sm"
    />
  )
}
