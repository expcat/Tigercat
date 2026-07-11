import { useState } from 'react'
import { Checkbox } from '@expcat/tigercat-react/Checkbox'

export default function App() {
  const [checked, setChecked] = useState(false)

  return (
    <Checkbox checked={checked} onChange={setChecked} size="lg">
      接收更新通知
    </Checkbox>
  )
}
