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
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">基本用法</h3>
          <Space direction="vertical" className="w-full">
            <Progress percentage={0} aria-label="基础进度 0%" />
            <Progress percentage={50} aria-label="基础进度 50%" />
            <Progress percentage={100} aria-label="基础进度 100%" />
          </Space>
        </div>
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">进度条变体</h3>
          <Space direction="vertical" className="w-full">
            <Progress variant="default" percentage={20} aria-label="默认进度" />
            <Progress variant="primary" percentage={40} aria-label="主要进度" />
            <Progress variant="success" percentage={60} aria-label="成功进度" />
            <Progress variant="warning" percentage={80} aria-label="警告进度" />
            <Progress variant="danger" percentage={90} aria-label="危险进度" />
            <Progress variant="info" percentage={70} aria-label="信息进度" />
          </Space>
        </div>
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">进度条状态</h3>
          <Space direction="vertical" className="w-full">
            <Progress percentage={100} status="success" aria-label="成功状态进度" />
            <Progress percentage={50} status="exception" aria-label="异常状态进度" />
            <Progress percentage={70} status="paused" aria-label="暂停状态进度" />
          </Space>
        </div>
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">进度条尺寸</h3>
          <Space direction="vertical" className="w-full">
            <Progress size="sm" percentage={50} aria-label="小尺寸进度" />
            <Progress size="md" percentage={50} aria-label="中尺寸进度" />
            <Progress size="lg" percentage={50} aria-label="大尺寸进度" />
          </Space>
        </div>
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">圆形进度条</h3>
          <Space align="center">
            <Progress type="circle" percentage={0} showText={true} aria-label="圆形进度 0%" />
            <Progress type="circle" percentage={25} showText={true} aria-label="圆形进度 25%" />
            <Progress type="circle" percentage={75} showText={true} aria-label="圆形进度 75%" />
            <Progress
              type="circle"
              percentage={100}
              status="success"
              showText={true}
              aria-label="圆形成功进度"
            />
          </Space>
        </div>
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">圆形进度条尺寸</h3>
          <Space align="center">
            <Progress
              type="circle"
              size="sm"
              percentage={75}
              showText={true}
              aria-label="小尺寸圆形进度"
            />
            <Progress
              type="circle"
              size="md"
              percentage={75}
              showText={true}
              aria-label="中尺寸圆形进度"
            />
            <Progress
              type="circle"
              size="lg"
              percentage={75}
              showText={true}
              aria-label="大尺寸圆形进度"
            />
          </Space>
        </div>
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">自定义文本</h3>
          <Space direction="vertical" className="w-full">
            <Progress percentage={50} text="进行中" aria-label="任务进行中" />
            <Progress percentage={100} text="已完成" aria-label="任务已完成" />
            <Progress percentage={50} format={(p) => `${p}个/100个`} aria-label="处理数量进度" />
          </Space>
        </div>
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">不显示文字</h3>
          <Space direction="vertical" className="w-full">
            <Progress percentage={50} showText={false} aria-label="隐藏文字进度 50%" />
            <Progress percentage={100} showText={false} aria-label="隐藏文字进度 100%" />
          </Space>
        </div>
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">条纹进度条</h3>
          <Space direction="vertical" className="w-full">
            <Progress percentage={70} striped={true} aria-label="条纹进度" />
            <Progress
              percentage={70}
              striped={true}
              stripedAnimation={true}
              aria-label="动画条纹进度"
            />
          </Space>
        </div>
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">自定义尺寸</h3>
          <Space direction="vertical" className="w-full">
            <Progress percentage={60} width="300px" aria-label="自定义宽度进度" />
            <Progress percentage={60} height={20} aria-label="自定义高度进度" />
            <Progress
              type="circle"
              percentage={60}
              strokeWidth={10}
              showText={true}
              aria-label="自定义线宽圆形进度"
            />
          </Space>
        </div>
      </div>
    </>
  )
}
