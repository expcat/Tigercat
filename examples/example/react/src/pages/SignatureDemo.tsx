import { Signature } from '@expcat/tigercat-react/Signature'
import { useRef, useState } from 'react'
import { Button } from '@expcat/tigercat-react/Button'
import { type SignatureRef, type SignatureChangePayload } from '@expcat/tigercat-react'
import DemoBlock from '../components/DemoBlock'
import fullPageSnippet from './SignatureDemo.tsx?raw'

const basicSnippet = `<Signature
  width={420}
  height={180}
  penColor="#0f766e"
  lineWidth={3}
  exportType="image/svg+xml"
  onChange={(payload) => setSignatureValue(payload.value)} />`

const exportSnippet = `const signatureRef = useRef<SignatureRef>(null)

const exportPng = () => {
  const url = signatureRef.current?.toDataURL('image/png')
  if (url) setPreviewUrl(url)
}

const exportSvg = () => {
  const svg = signatureRef.current?.toSVG()
  if (svg) setSvgText(svg)
}`

const disabledSnippet = `<Signature disabled />
<Signature readonly />`

export default function SignatureDemo() {
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
    <div className="max-w-4xl mx-auto p-4 sm:p-8">
      <h1 className="text-3xl font-bold mb-2">Signature 手写签名</h1>
      <p className="text-gray-500 mb-8">手写签名画板，支持颜色、线宽、清空和 PNG / SVG 导出。</p>

      <DemoBlock
        title="基本用法"
        description="通过 onChange 获取当前签名导出值"
        code={fullPageSnippet}>
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
      </DemoBlock>

      <DemoBlock
        title="导出"
        description="通过 ref 导出 PNG data URL 或 SVG 字符串"
        code={fullPageSnippet}>
        <div className="space-y-4">
          <Signature ref={signatureRef} width={420} height={180} backgroundColor="#ffffff" />
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
      </DemoBlock>

      <DemoBlock
        title="禁用和只读"
        description="disabled / readonly 状态下不可绘制"
        code={fullPageSnippet}>
        <div className="grid gap-4 md:grid-cols-2">
          <Signature width={320} height={140} disabled clearText="清空" />
          <Signature width={320} height={140} readonly clearText="清空" />
        </div>
      </DemoBlock>
    </div>
  )
}
