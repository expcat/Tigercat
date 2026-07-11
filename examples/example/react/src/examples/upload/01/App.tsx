import { useState } from 'react'
import type { UploadFile } from '@expcat/tigercat-react'
import { Upload } from '@expcat/tigercat-react/Upload'

export default function App() {
  const [files, setFiles] = useState<UploadFile[]>([])

  return (
    <Upload
      fileList={files}
      onChange={(_file, nextFiles) => setFiles(nextFiles)}
      accept=".jpg,.jpeg,.png"
      maxSize={2 * 1024 * 1024}
      limit={3}
      multiple>
      选择图片
    </Upload>
  )
}
