import { useState } from 'react'
import { Radio } from '@expcat/tigercat-react/Radio'

export default function App() {
  const [checked, setChecked] = useState(false)

  return (
    <Radio value="agreement" checked={checked} onChange={() => setChecked(true)} size="lg">
      同意服务条款
    </Radio>
  )
}
