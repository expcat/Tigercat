import { useState } from 'react'
import type { SignatureChangePayload } from '@expcat/tigercat-react'
import { Signature } from '@expcat/tigercat-react/Signature'

export default function App() {
  const [signed, setSigned] = useState(false)

  const handleChange = (payload: SignatureChangePayload) => setSigned(!payload.empty)

  return (
    <div className="space-y-2">
      <Signature
        width={420}
        height={180}
        penColor="#0f766e"
        lineWidth={3}
        exportType="image/svg+xml"
        ariaLabel="合同签名"
        clearText="清空"
        onChange={handleChange}
      />
      <p className="text-sm text-gray-600 dark:text-gray-300">
        {signed ? '签名已记录' : '等待签名'}
      </p>
    </div>
  )
}
