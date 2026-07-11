import { useState } from 'react'
import type { UploadFile } from '@expcat/tigercat-react'
import { Upload } from '@expcat/tigercat-react/Upload'

const initialFiles: UploadFile[] = [
  {
    uid: 'cover',
    name: 'cover.png',
    status: 'success',
    url: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=240&h=160&fit=crop'
  }
]

export default function App() {
  const [files, setFiles] = useState<UploadFile[]>(initialFiles)

  return (
    <Upload
      fileList={files}
      onChange={(_file, nextFiles) => setFiles(nextFiles)}
      listType="picture-card"
      accept="image/*"
      limit={4}>
      添加图片
    </Upload>
  )
}
