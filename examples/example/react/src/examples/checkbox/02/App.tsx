import { useState } from 'react'
import { Checkbox } from '@expcat/tigercat-react/Checkbox'

export default function App() {
  const [checked, setChecked] = useState(false)

  return (
    <Checkbox checked={checked} indeterminate={!checked} onChange={setChecked}>
      全选（当前为部分选择）
    </Checkbox>
  )
}
