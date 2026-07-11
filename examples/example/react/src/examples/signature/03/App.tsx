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
      <div className="grid gap-4 md:grid-cols-2">
        <Signature width={320} height={140} disabled ariaLabel="禁用签名" clearText="清空" />
        <Signature width={320} height={140} readonly ariaLabel="只读签名" clearText="清空" />
      </div>
    </>
  )
}
