import { Signature } from '@expcat/tigercat-react/Signature'
import { useRef, useState } from 'react'
import { Button } from '@expcat/tigercat-react/Button'
import { type SignatureRef, type SignatureChangePayload } from '@expcat/tigercat-react'

export default function App() {
  const signatureRef = useRef<SignatureRef>(null)

  const [signatureValue, setSignatureValue] = useState('')

  const [previewUrl, setPreviewUrl] = useState('')

  const [svgText, setSvgText] = useState('')

  const handleChange = (payload: SignatureChangePayload) => {
    setSignatureValue(payload.empty ? '' : payload.value)
  }

  const exportPng = () => {
    const url = signatureRef.current?.toDataURL('image/png')
    if (url) setPreviewUrl(url)
  }

  const exportSvg = () => {
    const svg = signatureRef.current?.toSVG()
    if (svg) setSvgText(svg)
  }

  return (
    <>
      <div className="space-y-3">
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
        <p className="text-sm text-gray-500">
          {signatureValue ? `已生成签名值：${signatureValue.slice(0, 64)}...` : '等待签名'}
        </p>
      </div>
    </>
  )
}
