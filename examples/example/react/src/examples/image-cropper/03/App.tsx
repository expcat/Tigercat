import { useRef, useState } from 'react'
import { ImageCropper } from '@expcat/tigercat-react/ImageCropper'
import type { ImageCropperRef } from '@expcat/tigercat-react'
import type { CropRect, CropResult } from '@expcat/tigercat-core'

const PHOTO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#bae6fd" />
      <stop offset="1" stop-color="#0f766e" />
    </linearGradient>
    <linearGradient id="ground" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#fef3c7" />
      <stop offset="1" stop-color="#f97316" />
    </linearGradient>
  </defs>
  <rect width="800" height="600" fill="url(#sky)" />
  <circle cx="620" cy="120" r="58" fill="#facc15" />
  <path d="M0 420 C130 340 210 420 330 350 C470 270 560 380 800 290 L800 600 L0 600 Z" fill="url(#ground)" />
  <path d="M0 470 C140 390 260 500 420 420 C560 350 640 450 800 390 L800 600 L0 600 Z" fill="#14532d" opacity="0.72" />
  <rect x="120" y="180" width="170" height="220" rx="24" fill="#ffffff" opacity="0.86" />
  <rect x="150" y="220" width="110" height="28" rx="14" fill="#0ea5e9" />
  <rect x="150" y="268" width="80" height="80" rx="18" fill="#f97316" />
  <path d="M500 220 L570 350 L430 350 Z" fill="#0f172a" opacity="0.72" />
  <path d="M546 245 L610 350 L480 350 Z" fill="#334155" opacity="0.8" />
</svg>`

const PHOTO = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(PHOTO_SVG)}`

export default function App() {
  const cropperRef = useRef<ImageCropperRef>(null)

  const squareRef = useRef<ImageCropperRef>(null)

  const [resultUrl, setResultUrl] = useState('')

  const [squareResultUrl, setSquareResultUrl] = useState('')

  const [cropRect, setCropRect] = useState<CropRect | null>(null)

  const [cropError, setCropError] = useState('')

  const [squareCropError, setSquareCropError] = useState('')

  const handleCrop = async () => {
    try {
      const result: CropResult | undefined = await cropperRef.current?.getCropResult()
      if (result) {
        setResultUrl(result.dataUrl)
        setCropError('')
      }
    } catch {
      setCropError('图片仍在加载或加载失败，请稍后重试。')
    }
  }

  const handleSquareCrop = async () => {
    try {
      const result = await squareRef.current?.getCropResult()
      if (result) {
        setSquareResultUrl(result.dataUrl)
        setSquareCropError('')
      }
    } catch {
      setSquareCropError('图片仍在加载或加载失败，请稍后重试。')
    }
  }

  return (
    <>
      <ImageCropper src={PHOTO} guides={false} />
    </>
  )
}
