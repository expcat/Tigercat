import { Space } from '@expcat/tigercat-react/Space'
import { Button } from '@expcat/tigercat-react/Button'
import { useState } from 'react'
import { Progress } from '@expcat/tigercat-react/Progress'

export default function App() {
  const [uploadProgress, setUploadProgress] = useState(0)

  const startUpload = () => {
    setUploadProgress(0)
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        const next = prev + 10
        if (next >= 100) {
          clearInterval(interval)
        }
        return next
      })
    }, 500)
  }

  return (
    <>
      <div className="space-y-6">
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">文件上传示例</h3>
          <Space direction="vertical" className="w-full">
            <Progress percentage={uploadProgress} aria-label="文件上传进度" />
            <Button variant="primary" onClick={startUpload}>
              开始上传
            </Button>
          </Space>
        </div>
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">仪表盘展示</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <h4 className="mb-4 text-sm font-medium">CPU 使用率</h4>
              <Progress
                type="circle"
                percentage={75}
                variant="primary"
                showText={true}
                aria-label="CPU 使用率"
              />
            </div>
            <div className="text-center">
              <h4 className="mb-4 text-sm font-medium">内存使用率</h4>
              <Progress
                type="circle"
                percentage={60}
                variant="success"
                showText={true}
                aria-label="内存使用率"
              />
            </div>
            <div className="text-center">
              <h4 className="mb-4 text-sm font-medium">磁盘使用率</h4>
              <Progress
                type="circle"
                percentage={85}
                status="paused"
                showText={true}
                aria-label="磁盘使用率"
              />
            </div>
            <div className="text-center">
              <h4 className="mb-4 text-sm font-medium">网络带宽</h4>
              <Progress
                type="circle"
                percentage={95}
                status="exception"
                showText={true}
                aria-label="网络带宽"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
