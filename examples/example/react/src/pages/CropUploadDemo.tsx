import { useState } from 'react'
import { CropUpload } from '@expcat/tigercat-react'
import type { CropResult } from '@expcat/tigercat-core'
import DemoBlock from '../components/DemoBlock'

const basicSnippet = `<CropUpload onCropComplete={(r) => setResult(r)} onError={handleError} />
{result && <img src={result.dataUrl} />}`

const aspectRatioSnippet = `{/* 强制正方形裁剪 */}
<CropUpload cropperProps={{ aspectRatio: 1 }} onCropComplete={handleSquareCrop} />`

const customTriggerSnippet = `{/* 自定义触发按钮 */}
<CropUpload onCropComplete={handleCrop}>
  <span className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded cursor-pointer hover:bg-green-600">
    📷 上传头像
  </span>
</CropUpload>`

const disabledSnippet = `<CropUpload disabled />`

const maxSizeSnippet = `{/* 限制文件大小 2MB */}
<CropUpload maxSize={2 * 1024 * 1024} onError={handleError} />`

export default function CropUploadDemo() {
  const [result1, setResult1] = useState<CropResult | null>(null)
  const [result2, setResult2] = useState<CropResult | null>(null)
  const [errorMsg, setErrorMsg] = useState('')

  const handleCropComplete = (r: CropResult) => {
    setResult1(r)
    console.log('CropUpload result:', r)
  }

  const handleSquareCrop = (r: CropResult) => {
    setResult2(r)
  }

  const handleError = (err: Error) => {
    setErrorMsg(err.message)
    setTimeout(() => setErrorMsg(''), 3000)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">CropUpload 裁剪上传</h1>
      <p className="text-gray-600 mb-8">
        组合组件：选择图片 → 弹窗裁剪 → 输出裁剪结果。适用于头像上传、封面裁剪等场景。
      </p>

      {errorMsg && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded text-sm">{errorMsg}</div>
      )}

      <DemoBlock
        title="基本用法"
        description="点击按钮选择图片，弹窗中裁剪后获取结果"
        code={basicSnippet}>
        <div className="space-y-4">
          <CropUpload onCropComplete={handleCropComplete} onError={handleError} />
          {result1 && (
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-2">裁剪结果：</p>
              <img
                src={result1.dataUrl}
                className="max-w-xs border border-gray-200 rounded"
                alt="裁剪结果"
              />
            </div>
          )}
        </div>
      </DemoBlock>

      <DemoBlock
        title="固定宽高比"
        description="通过 cropperProps 传递 aspectRatio 实现正方形裁剪"
        code={aspectRatioSnippet}>
        <div className="space-y-4">
          <CropUpload cropperProps={{ aspectRatio: 1 }} onCropComplete={handleSquareCrop} />
          {result2 && (
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-2">裁剪结果：</p>
              <img
                src={result2.dataUrl}
                className="max-w-[200px] border border-gray-200 rounded"
                alt="裁剪结果"
              />
            </div>
          )}
        </div>
      </DemoBlock>

      <DemoBlock
        title="自定义触发按钮"
        description="通过 children 自定义触发按钮"
        code={customTriggerSnippet}>
        <CropUpload onCropComplete={handleCropComplete}>
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded cursor-pointer hover:bg-green-600 transition-colors">
            📷 上传头像
          </span>
        </CropUpload>
      </DemoBlock>

      <DemoBlock
        title="限制文件大小"
        description="maxSize 限制文件大小（字节），超出触发 onError"
        code={maxSizeSnippet}>
        <CropUpload
          maxSize={2 * 1024 * 1024}
          onCropComplete={handleCropComplete}
          onError={handleError}
        />
      </DemoBlock>

      <DemoBlock title="禁用状态" description="disabled 禁用触发按钮" code={disabledSnippet}>
        <CropUpload disabled />
      </DemoBlock>
    </div>
  )
}
