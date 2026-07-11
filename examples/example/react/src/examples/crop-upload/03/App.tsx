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
      <CropUpload onCropComplete={handleCropComplete}>
        <span className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded cursor-pointer hover:bg-green-600 transition-colors">
          📷 上传头像
        </span>
      </CropUpload>
    </>
  )
}
