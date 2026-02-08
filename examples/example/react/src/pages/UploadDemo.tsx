import React, { useState } from 'react'
import { Upload, type UploadFile } from '@expcat/tigercat-react'
import type { UploadRequestOptions } from '@expcat/tigercat-core'
import DemoBlock from '../components/DemoBlock'

const basicSnippet = `<Upload fileList={fileList} onChange={handleChange}>选择文件</Upload>`

const dragSnippet = `<Upload fileList={fileList2} onChange={handleChange2} drag />`

const multipleSnippet = `<Upload fileList={fileList3} onChange={handleChange3} multiple>选择多个文件</Upload>`

const limitSnippet = `<Upload fileList={fileList4} onChange={handleChange4} multiple limit={3} onExceed={handleExceed}>
  最多上传 3 个文件
</Upload>`

const validateSnippet = `<div className="max-w-md space-y-6">
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">仅允许图片</label>
    <Upload fileList={fileList5} onChange={handleChange5} accept="image/*" drag />
  </div>
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">自定义校验（JPG/PNG，小于2MB）</label>
    <Upload accept="image/jpeg,image/png" maxSize={2 * 1024 * 1024} beforeUpload={beforeUpload} drag />
  </div>
</div>`

const pictureCardSnippet = `<Upload
  fileList={fileList6}
  onChange={handleChange6}
  accept="image/*"
  listType="picture-card"
  multiple
  onPreview={handlePreview}
/>`

const disabledSnippet = `<div className="max-w-md space-y-6">
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">禁用的按钮上传</label>
    <Upload disabled>选择文件（已禁用）</Upload>
  </div>
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">禁用的拖拽上传</label>
    <Upload disabled drag />
  </div>
</div>`

const customRequestSnippet = `<Upload
  fileList={fileList7}
  onChange={handleChange7}
  customRequest={simulateUpload}
  multiple
  drag
/>`

const UploadDemo: React.FC = () => {
  const [fileList, setFileList] = useState<UploadFile[]>([])
  const [fileList2, setFileList2] = useState<UploadFile[]>([])
  const [fileList3, setFileList3] = useState<UploadFile[]>([])
  const [fileList4, setFileList4] = useState<UploadFile[]>([])
  const [fileList5, setFileList5] = useState<UploadFile[]>([])
  const [fileList6, setFileList6] = useState<UploadFile[]>([])
  const [fileList7, setFileList7] = useState<UploadFile[]>([])

  const handleChange = (file: UploadFile, list: UploadFile[]) => {
    console.log('File changed:', file, list)
    setFileList(list)
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
      if (progress >= 100) {
        clearInterval(timer)
        options.onSuccess?.({ url: URL.createObjectURL(options.file) })
      }
    }, 500)
  }

  const handlePreview = (file: UploadFile) => {
    console.log('Preview file:', file)
    if (file.url) {
      window.open(file.url, '_blank')
    }
  }

  const handleExceed = (_files: File[], list: UploadFile[]) => {
    alert(`最多只能上传 ${list.length} 个文件！`)
  }

  const beforeUpload = (file: File) => {
    const isJPG = file.type === 'image/jpeg'
    const isPNG = file.type === 'image/png'
    const isLt2M = file.size / 1024 / 1024 < 2

    if (!isJPG && !isPNG) {
      alert('只能上传 JPG/PNG 格式的图片！')
      return false
    }
    if (!isLt2M) {
      alert('图片大小不能超过 2MB！')
      return false
    }
    return true
  }

  return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Upload 文件上传</h1>
        <p className="text-gray-600">通过点击或者拖拽上传文件。</p>
      </div>

      {/* 基础用法 */}
      <DemoBlock title="基础用法" description="基础的文件上传组件。" code={basicSnippet}>
        <div className="max-w-md space-y-4">
          <Upload fileList={fileList} onChange={handleChange}>
            选择文件
          </Upload>
        </div>
      </DemoBlock>

      {/* 拖拽上传 */}
      <DemoBlock title="拖拽上传" description="将文件拖拽到区域内即可上传。" code={dragSnippet}>
        <div className="max-w-md">
          <Upload fileList={fileList2} onChange={handleChange2} drag />
        </div>
      </DemoBlock>

      {/* 多文件上传 */}
      <DemoBlock
        title="多文件上传"
        description="通过设置 multiple 属性允许同时选择多个文件。"
        code={multipleSnippet}>
        <div className="max-w-md">
          <Upload fileList={fileList3} onChange={handleChange3} multiple>
            选择多个文件
          </Upload>
        </div>
      </DemoBlock>

      {/* 文件数量限制 */}
      <DemoBlock
        title="文件数量限制"
        description="通过 limit 属性限制上传文件的数量。"
        code={limitSnippet}>
        <div className="max-w-md">
          <Upload
            fileList={fileList4}
            onChange={handleChange4}
            multiple
            limit={3}
            onExceed={handleExceed}>
            最多上传 3 个文件
          </Upload>
        </div>
      </DemoBlock>

      {/* 文件类型和大小限制 */}
      <DemoBlock
        title="文件类型和大小限制"
        description="通过 accept 和 maxSize 限制文件类型和大小。"
        code={validateSnippet}>
        <div className="max-w-md space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">仅允许图片</label>
            <Upload fileList={fileList5} onChange={handleChange5} accept="image/*" drag />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              自定义校验（JPG/PNG，小于2MB）
            </label>
            <Upload
              accept="image/jpeg,image/png"
              maxSize={2 * 1024 * 1024}
              beforeUpload={beforeUpload}
              drag
            />
          </div>
        </div>
      </DemoBlock>

      {/* 图片卡片列表 */}
      <DemoBlock
        title="图片卡片列表"
        description='使用 listType="picture-card" 显示图片卡片样式。'
        code={pictureCardSnippet}>
        <div className="max-w-2xl">
          <Upload
            fileList={fileList6}
            onChange={handleChange6}
            accept="image/*"
            listType="picture-card"
            multiple
            onPreview={handlePreview}
          />
        </div>
      </DemoBlock>

      {/* 禁用状态 */}
      <DemoBlock
        title="禁用状态"
        description="设置 disabled 属性禁用上传功能。"
        code={disabledSnippet}>
        <div className="max-w-md space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">禁用的按钮上传</label>
            <Upload disabled>选择文件（已禁用）</Upload>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">禁用的拖拽上传</label>
            <Upload disabled drag />
          </div>
        </div>
      </DemoBlock>

      {/* 自定义上传 */}
      <DemoBlock
        title="自定义上传"
        description="通过 customRequest 实现自定义上传逻辑，可观察上传进度。"
        code={customRequestSnippet}>
        <div className="max-w-md">
          <Upload
            fileList={fileList7}
            onChange={handleChange7}
            customRequest={simulateUpload}
            multiple
            drag
          />
        </div>
      </DemoBlock>
    </div>
  )
}

export default UploadDemo
