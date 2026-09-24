import { useEffect, useState } from 'react'
import { CropUpload } from '@expcat/tigercat-react/CropUpload'
import type { CropResult } from '@expcat/tigercat-core'

export default function App() {
  const [result, setResult] = useState<CropResult | null>(null)
  const [error, setError] = useState('')
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
    <>
      <div className="space-y-4">
        <CropUpload
          maxSize={2 * 1024 * 1024}
          cropperProps={{ aspectRatio: 1 }}
          onCropComplete={setResult}
          onError={(value) => setError(value.message)}
        />
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {result ? (
          <p className="text-sm text-[var(--tiger-text-secondary)]">{result.file?.name}</p>
        ) : null}
        {previewUrl ? <img src={previewUrl} className="max-w-48 rounded" alt="裁剪结果" /> : null}
      </div>
    </>
  )
}
