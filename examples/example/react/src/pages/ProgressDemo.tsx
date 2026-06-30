import { Space } from '@expcat/tigercat-react/Space'
import { Button } from '@expcat/tigercat-react/Button'
import { useState } from 'react'
import { Progress } from '@expcat/tigercat-react/Progress'
import DemoBlock from '../components/DemoBlock'
import fullPageSnippet from './ProgressDemo.tsx?raw'

const basicSnippet = `<Space direction="vertical" className="w-full">
  <Progress percentage={0} />
  <Progress percentage={50} />
  <Progress percentage={100} />
</Space>`

const variantSnippet = `<Space direction="vertical" className="w-full">
  <Progress variant="default" percentage={20} />
  <Progress variant="primary" percentage={40} />
  <Progress variant="success" percentage={60} />
  <Progress variant="warning" percentage={80} />
  <Progress variant="danger" percentage={90} />
  <Progress variant="info" percentage={70} />
</Space>`

const statusSnippet = `<Space direction="vertical" className="w-full">
  <Progress percentage={100} status="success" />
  <Progress percentage={50} status="exception" />
  <Progress percentage={70} status="paused" />
</Space>`

const sizeSnippet = `<Space direction="vertical" className="w-full">
  <Progress size="sm" percentage={50} />
  <Progress size="md" percentage={50} />
  <Progress size="lg" percentage={50} />
</Space>`

const circleSnippet = `<Space align="center">
  <Progress type="circle" percentage={0} showText={true} />
  <Progress type="circle" percentage={25} showText={true} />
  <Progress type="circle" percentage={75} showText={true} />
  <Progress type="circle" percentage={100} status="success" showText={true} />
</Space>`

const circleSizeSnippet = `<Space align="center">
  <Progress type="circle" size="sm" percentage={75} showText={true} />
  <Progress type="circle" size="md" percentage={75} showText={true} />
  <Progress type="circle" size="lg" percentage={75} showText={true} />
</Space>`

const textSnippet = `<Space direction="vertical" className="w-full">
  <Progress percentage={50} text="进行中" />
  <Progress percentage={100} text="已完成" />
  <Progress percentage={50} format={(p) => \`\${p}个/100个\`} />
</Space>`

const noTextSnippet = `<Space direction="vertical" className="w-full">
  <Progress percentage={50} showText={false} />
  <Progress percentage={100} showText={false} />
</Space>`

const stripedSnippet = `<Space direction="vertical" className="w-full">
  <Progress percentage={70} striped={true} />
  <Progress percentage={70} striped={true} stripedAnimation={true} />
</Space>`

const customSizeSnippet = `<Space direction="vertical" className="w-full">
  <Progress percentage={60} width="300px" />
  <Progress percentage={60} height={20} />
  <Progress type="circle" percentage={60} strokeWidth={10} showText={true} />
</Space>`

const uploadSnippet = `<Space direction="vertical" className="w-full">
  <Progress percentage={uploadProgress} />
  <Button variant="primary" onClick={startUpload}>开始上传</Button>
</Space>`

const dashboardSnippet = `<div className="grid grid-cols-2 md:grid-cols-4 gap-8">
  <div className="text-center">
    <h4 className="mb-4 text-sm font-medium">CPU 使用率</h4>
    <Progress type="circle" percentage={75} variant="primary" showText={true} />
  </div>
  <div className="text-center">
    <h4 className="mb-4 text-sm font-medium">内存使用率</h4>
    <Progress type="circle" percentage={60} variant="success" showText={true} />
  </div>
  <div className="text-center">
    <h4 className="mb-4 text-sm font-medium">磁盘使用率</h4>
    <Progress type="circle" percentage={85} status="paused" showText={true} />
  </div>
  <div className="text-center">
    <h4 className="mb-4 text-sm font-medium">网络带宽</h4>
    <Progress type="circle" percentage={95} status="exception" showText={true} />
  </div>
</div>`

const uploadScriptSnippet = `const [uploadProgress, setUploadProgress] = useState(0)`

export default function ProgressDemo() {
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
    <div className="max-w-5xl mx-auto p-4 sm:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Progress 进度条</h1>
        <p className="text-gray-600 dark:text-gray-400">
          用于展示操作进度的组件，支持线形和圆形两种展示方式。
        </p>
      </div>

      {/* 基本用法 */}
      <DemoBlock
        title="基本用法等组合展示"
        description="合并展示基本用法、进度条变体、进度条状态等互不冲突的使用方式。"
        code={fullPageSnippet}>
        <div className="space-y-6">
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">基本用法</h3>
            <Space direction="vertical" className="w-full">
              <Progress percentage={0} />
              <Progress percentage={50} />
              <Progress percentage={100} />
            </Space>
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">进度条变体</h3>
            <Space direction="vertical" className="w-full">
              <Progress variant="default" percentage={20} />
              <Progress variant="primary" percentage={40} />
              <Progress variant="success" percentage={60} />
              <Progress variant="warning" percentage={80} />
              <Progress variant="danger" percentage={90} />
              <Progress variant="info" percentage={70} />
            </Space>
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">进度条状态</h3>
            <Space direction="vertical" className="w-full">
              <Progress percentage={100} status="success" />
              <Progress percentage={50} status="exception" />
              <Progress percentage={70} status="paused" />
            </Space>
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">进度条尺寸</h3>
            <Space direction="vertical" className="w-full">
              <Progress size="sm" percentage={50} />
              <Progress size="md" percentage={50} />
              <Progress size="lg" percentage={50} />
            </Space>
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">圆形进度条</h3>
            <Space align="center">
              <Progress type="circle" percentage={0} showText={true} />
              <Progress type="circle" percentage={25} showText={true} />
              <Progress type="circle" percentage={75} showText={true} />
              <Progress type="circle" percentage={100} status="success" showText={true} />
            </Space>
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              圆形进度条尺寸
            </h3>
            <Space align="center">
              <Progress type="circle" size="sm" percentage={75} showText={true} />
              <Progress type="circle" size="md" percentage={75} showText={true} />
              <Progress type="circle" size="lg" percentage={75} showText={true} />
            </Space>
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">自定义文本</h3>
            <Space direction="vertical" className="w-full">
              <Progress percentage={50} text="进行中" />
              <Progress percentage={100} text="已完成" />
              <Progress percentage={50} format={(p) => `${p}个/100个`} />
            </Space>
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">不显示文字</h3>
            <Space direction="vertical" className="w-full">
              <Progress percentage={50} showText={false} />
              <Progress percentage={100} showText={false} />
            </Space>
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">条纹进度条</h3>
            <Space direction="vertical" className="w-full">
              <Progress percentage={70} striped={true} />
              <Progress percentage={70} striped={true} stripedAnimation={true} />
            </Space>
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">自定义尺寸</h3>
            <Space direction="vertical" className="w-full">
              <Progress percentage={60} width="300px" />
              <Progress percentage={60} height={20} />
              <Progress type="circle" percentage={60} strokeWidth={10} showText={true} />
            </Space>
          </div>
        </div>
      </DemoBlock>

      {/* 文件上传示例 */}
      <DemoBlock
        title="文件上传示例与仪表盘展示"
        description="合并展示文件上传示例、仪表盘展示，减少重复示例块。"
        code={fullPageSnippet}>
        <div className="space-y-6">
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">文件上传示例</h3>
            <Space direction="vertical" className="w-full">
              <Progress percentage={uploadProgress} />
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
                <Progress type="circle" percentage={75} variant="primary" showText={true} />
              </div>
              <div className="text-center">
                <h4 className="mb-4 text-sm font-medium">内存使用率</h4>
                <Progress type="circle" percentage={60} variant="success" showText={true} />
              </div>
              <div className="text-center">
                <h4 className="mb-4 text-sm font-medium">磁盘使用率</h4>
                <Progress type="circle" percentage={85} status="paused" showText={true} />
              </div>
              <div className="text-center">
                <h4 className="mb-4 text-sm font-medium">网络带宽</h4>
                <Progress type="circle" percentage={95} status="exception" showText={true} />
              </div>
            </div>
          </div>
        </div>
      </DemoBlock>
    </div>
  )
}
