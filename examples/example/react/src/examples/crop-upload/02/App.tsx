import { useState } from 'react'
import { CropUpload } from '@expcat/tigercat-react/CropUpload'
import type { CropResult } from '@expcat/tigercat-core'

export default function App() {
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
    <>
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
    </>
  )
}
