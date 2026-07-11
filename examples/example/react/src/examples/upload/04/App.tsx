import { useState } from 'react'
import type { UploadFile } from '@expcat/tigercat-react'
import type { UploadRequestOptions } from '@expcat/tigercat-core'
import { Upload } from '@expcat/tigercat-react/Upload'

export default function App() {
  const [files, setFiles] = useState<UploadFile[]>([])

  const upload = (options: UploadRequestOptions) => {
    window.setTimeout(() => {
      options.onProgress?.(100)
      options.onSuccess?.({ name: options.file.name })
    }, 600)
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
