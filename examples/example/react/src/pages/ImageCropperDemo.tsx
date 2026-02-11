import { useRef, useState } from 'react'
import { ImageCropper } from '@expcat/tigercat-react'
import type { ImageCropperRef } from '@expcat/tigercat-react'
import type { CropRect, CropResult } from '@expcat/tigercat-core'
import DemoBlock from '../components/DemoBlock'

const PHOTO = 'https://picsum.photos/seed/cropper/800/600'

const basicSnippet = `const cropperRef = useRef<ImageCropperRef>(null)

<ImageCropper
  ref={cropperRef}
  src={photo}
  onCropChange={(rect) => setCropRect(rect)} />
<button onClick={async () => {
  const result = await cropperRef.current?.getCropResult()
  setResultUrl(result?.dataUrl)
}}>裁剪</button>
{resultUrl && <img src={resultUrl} />}`

const aspectRatioSnippet = `{/* 1:1 正方形裁剪 */}
<ImageCropper
  ref={squareRef}
  src={photo}
  aspectRatio={1} />
<button onClick={handleSquareCrop}>裁剪为正方形</button>`

const noGuidesSnippet = `{/* 隐藏辅助线 */}
<ImageCropper src={photo} guides={false} />`

const jpegSnippet = `{/* 输出 JPEG 格式，质量 0.8 */}
<ImageCropper src={photo} outputType="image/jpeg" quality={0.8} />`

export default function ImageCropperDemo() {
  const cropperRef = useRef<ImageCropperRef>(null)
  const squareRef = useRef<ImageCropperRef>(null)
  const [resultUrl, setResultUrl] = useState('')
  const [squareResultUrl, setSquareResultUrl] = useState('')
  const [cropRect, setCropRect] = useState<CropRect | null>(null)

  const handleCrop = async () => {
    const result: CropResult | undefined = await cropperRef.current?.getCropResult()
    if (result) setResultUrl(result.dataUrl)
  }

  const handleSquareCrop = async () => {
    const result = await squareRef.current?.getCropResult()
    if (result) setSquareResultUrl(result.dataUrl)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">ImageCropper 图片裁剪</h1>
      <p className="text-gray-600 mb-8">
        交互式图片裁剪组件，支持自由裁剪、固定宽高比、辅助线、Canvas 输出。
      </p>

      <DemoBlock title="基本用法" description="自由裁剪，拖拽和缩放裁剪区域" code={basicSnippet}>
        <div className="space-y-4">
          <ImageCropper ref={cropperRef} src={PHOTO} onCropChange={(rect) => setCropRect(rect)} />
          <div className="flex items-center gap-4">
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              onClick={handleCrop}>
              裁剪
            </button>
            {cropRect && (
              <span className="text-sm text-gray-500">
                {Math.round(cropRect.x)}, {Math.round(cropRect.y)} — {Math.round(cropRect.width)} ×{' '}
                {Math.round(cropRect.height)}
              </span>
            )}
          </div>
          {resultUrl && (
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-2">裁剪结果：</p>
              <img
                src={resultUrl}
                className="max-w-xs border border-gray-200 rounded"
                alt="裁剪结果"
              />
            </div>
          )}
        </div>
      </DemoBlock>

      <DemoBlock
        title="固定宽高比"
        description="设置 aspectRatio 为 1 实现正方形裁剪"
        code={aspectRatioSnippet}>
        <div className="space-y-4">
          <ImageCropper ref={squareRef} src={PHOTO} aspectRatio={1} />
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            onClick={handleSquareCrop}>
            裁剪为正方形
          </button>
          {squareResultUrl && (
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-2">裁剪结果：</p>
              <img
                src={squareResultUrl}
                className="max-w-[200px] border border-gray-200 rounded"
                alt="裁剪结果"
              />
            </div>
          )}
        </div>
      </DemoBlock>

      <DemoBlock title="隐藏辅助线" description="guides={false} 隐藏三分线" code={noGuidesSnippet}>
        <ImageCropper src={PHOTO} guides={false} />
      </DemoBlock>

      <DemoBlock
        title="JPEG 输出"
        description="指定 outputType='image/jpeg' 和 quality"
        code={jpegSnippet}>
        <ImageCropper src={PHOTO} outputType="image/jpeg" quality={0.8} />
      </DemoBlock>
    </div>
  )
}
