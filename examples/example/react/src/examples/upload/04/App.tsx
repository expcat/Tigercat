import { useState } from 'react'
import type { UploadFile } from '@expcat/tigercat-react'
import type { UploadRequestOptions } from '@expcat/tigercat-core'
import { Upload } from '@expcat/tigercat-react/Upload'

export default function App() {
  const [files, setFiles] = useState<UploadFile[]>([])

  const upload = (options: UploadRequestOptions) => {
    let progress = 0
    const timer = window.setInterval(() => {
      progress += 25
      options.onProgress?.(Math.min(progress, 100))
      if (progress >= 100) {
        window.clearInterval(timer)
        options.onSuccess?.({ name: options.file.name })
      }
    }, 200)
  }

  return (
    <Upload
      fileList={files}
      onChange={(_file, nextFiles) => setFiles(nextFiles)}
      customRequest={upload}>
      使用自定义请求上传
    </Upload>
  )
}
