import { useEffect, useState } from 'react'
import { CropUpload } from '@expcat/tigercat-react/CropUpload'
import type { CropResult } from '@expcat/tigercat-core'

export default function App() {
  const [result, setResult] = useState<CropResult | null>(null)
  const [previewUrl, setPreviewUrl] = useState('')

  useEffect(() => {
    if (!result) {
      setPreviewUrl('')
      return
    }
    const url = URL.createObjectURL(result.blob)
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [result])

  return (
    <div className="space-y-4">
      <CropUpload onCropComplete={setResult}>
        <span className="inline-flex cursor-pointer items-center gap-2 rounded bg-green-600 px-4 py-2 text-white">
          📷 上传头像
        </span>
      </CropUpload>
      {previewUrl ? (
        <img src={previewUrl} className="max-w-48 rounded" alt={result?.file?.name} />
      ) : null}
    </div>
  )
}
