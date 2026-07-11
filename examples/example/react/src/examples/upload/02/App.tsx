import { useState } from 'react'
import type { UploadFile } from '@expcat/tigercat-react'
import { Upload } from '@expcat/tigercat-react/Upload'

export default function App() {
  const [files, setFiles] = useState<UploadFile[]>([])

  return (
    <Upload
      fileList={files}
      onChange={(_file, nextFiles) => setFiles(nextFiles)}
      drag
      multiple
      accept=".pdf,.doc,.docx">
      点击或拖拽文档到此处
    </Upload>
  )
}
