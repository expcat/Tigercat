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
      <div className="space-y-4">
        <Signature
          ref={signatureRef}
          width={420}
          height={180}
          backgroundColor="#ffffff"
          ariaLabel="导出签名"
          clearText="清空"
        />
        <div className="flex flex-wrap gap-3">
          <Button onClick={exportPng}>导出 PNG</Button>
          <Button variant="secondary" onClick={exportSvg}>
            导出 SVG
          </Button>
          <Button variant="secondary" onClick={() => signatureRef.current?.clear()}>
            清空
          </Button>
        </div>
        {previewUrl && (
          <img
            src={previewUrl}
            className="max-w-xs rounded border border-gray-200 bg-white"
            alt="签名 PNG 预览"
          />
        )}
        {svgText && (
          <pre className="max-h-40 overflow-auto rounded border border-gray-200 bg-gray-50 p-3 text-xs text-gray-600">
            {svgText}
          </pre>
        )}
      </div>
    </>
  )
}
