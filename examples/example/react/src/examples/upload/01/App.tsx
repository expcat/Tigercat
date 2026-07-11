import React, { useState } from 'react'
import { Upload } from '@expcat/tigercat-react/Upload'
import { type UploadFile } from '@expcat/tigercat-react'
import type { UploadRequestOptions } from '@expcat/tigercat-core'

export default function App() {
  const [fileList, setFileList] = useState<UploadFile[]>([])

  const [fileList2, setFileList2] = useState<UploadFile[]>([])

  const [fileList3, setFileList3] = useState<UploadFile[]>([])

  const [fileList4, setFileList4] = useState<UploadFile[]>([])

  const [fileList5, setFileList5] = useState<UploadFile[]>([])

  const [fileList6, setFileList6] = useState<UploadFile[]>([])

  const [fileList7, setFileList7] = useState<UploadFile[]>([])

  const [uploadFeedback, setUploadFeedback] = useState('尚未执行上传操作')

  const handleChange = (file: UploadFile, list: UploadFile[]) => {
    setFileList(list)
    setUploadFeedback(`${file.name} 已加入上传列表，当前 ${list.length} 个文件。`)
  }

  const handleChange2 = (_file: UploadFile, list: UploadFile[]) => {
    setFileList2(list)
  }

  const handleChange3 = (_file: UploadFile, list: UploadFile[]) => {
    setFileList3(list)
  }

  const handleChange4 = (_file: UploadFile, list: UploadFile[]) => {
    setFileList4(list)
  }

  const handleChange5 = (_file: UploadFile, list: UploadFile[]) => {
    setFileList5(list)
  }

  const handleChange6 = (_file: UploadFile, list: UploadFile[]) => {
    setFileList6(list)
  }

  const handleChange7 = (_file: UploadFile, list: UploadFile[]) => {
    setFileList7(list)
  }

  const simulateUpload = (options: UploadRequestOptions) => {
    let progress = 0
    const timer = setInterval(() => {
      progress += 20
      options.onProgress?.(progress)
      setUploadFeedback(`正在上传 ${options.file.name}：${progress}%`)
      if (progress >= 100) {
        clearInterval(timer)
        options.onSuccess?.({ name: options.file.name })
        setUploadFeedback(`${options.file.name} 上传完成`)
      }
    }, 500)
  }

  const handlePreview = (file: UploadFile) => {
    setUploadFeedback(`正在预览 ${file.name}`)
    if (file.url) {
      window.open(file.url, '_blank')
    }
  }

  const handleExceed = (_files: File[], list: UploadFile[]) => {
    setUploadFeedback(`已拒绝超出数量限制的文件；当前已有 ${list.length} 个，最多 3 个。`)
  }

  const beforeUpload = (file: File) => {
    const isJPG = file.type === 'image/jpeg'
    const isPNG = file.type === 'image/png'
    const isLt2M = file.size / 1024 / 1024 < 2

    if (!isJPG && !isPNG) {
      setUploadFeedback(`已拒绝 ${file.name}：只能上传 JPG/PNG 格式的图片。`)
      return false
    }
    if (!isLt2M) {
      setUploadFeedback(`已拒绝 ${file.name}：图片大小不能超过 2MB。`)
      return false
    }
    setUploadFeedback(`${file.name} 校验通过，等待上传。`)
    return true
  }

  return (
    <>
      <div className="max-w-md space-y-4">
        <Upload fileList={fileList} onChange={handleChange}>
          选择文件
        </Upload>
      </div>
    </>
  )
}
