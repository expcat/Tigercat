import { useState } from 'react'
import { Progress, Space, Button } from '@expcat/tigercat-react'
import DemoBlock from '../components/DemoBlock'

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
    <div className="max-w-5xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Progress 进度条</h1>
        <p className="text-gray-600">用于展示操作进度的组件，支持线形和圆形两种展示方式。</p>
      </div>

      {/* 基本用法 */}
      <DemoBlock title="基本用法" description="线形进度条，默认展示百分比文本。" code={basicSnippet}>
        <Space direction="vertical" className="w-full">
          <Progress percentage={0} />
          <Progress percentage={50} />
          <Progress percentage={100} />
        </Space>
      </DemoBlock>

      {/* 进度条变体 */}
      <DemoBlock title="进度条变体" description="支持六种颜色变体。" code={variantSnippet}>
        <Space direction="vertical" className="w-full">
          <Progress variant="default" percentage={20} />
          <Progress variant="primary" percentage={40} />
          <Progress variant="success" percentage={60} />
          <Progress variant="warning" percentage={80} />
          <Progress variant="danger" percentage={90} />
          <Progress variant="info" percentage={70} />
        </Space>
      </DemoBlock>

      {/* 进度条状态 */}
      <DemoBlock title="进度条状态" description="通过状态显示不同的进度状态，状态会覆盖变体颜色。" code={statusSnippet}>
        <Space direction="vertical" className="w-full">
          <Progress percentage={100} status="success" />
          <Progress percentage={50} status="exception" />
          <Progress percentage={70} status="paused" />
        </Space>
      </DemoBlock>

      {/* 进度条尺寸 */}
      <DemoBlock title="进度条尺寸" description="支持三种尺寸。" code={sizeSnippet}>
        <Space direction="vertical" className="w-full">
          <Progress size="sm" percentage={50} />
          <Progress size="md" percentage={50} />
          <Progress size="lg" percentage={50} />
        </Space>
      </DemoBlock>

      {/* 圆形进度条 */}
      <DemoBlock title="圆形进度条" description="通过设置 type=\"circle\" 展示圆形进度条。" code={circleSnippet}>
        <Space align="center">
          <Progress type="circle" percentage={0} showText={true} />
          <Progress type="circle" percentage={25} showText={true} />
          <Progress type="circle" percentage={75} showText={true} />
          <Progress type="circle" percentage={100} status="success" showText={true} />
        </Space>
      </DemoBlock>

      {/* 圆形进度条尺寸 */}
      <DemoBlock title="圆形进度条尺寸" description="圆形进度条支持三种尺寸。" code={circleSizeSnippet}>
        <Space align="center">
          <Progress type="circle" size="sm" percentage={75} showText={true} />
          <Progress type="circle" size="md" percentage={75} showText={true} />
          <Progress type="circle" size="lg" percentage={75} showText={true} />
        </Space>
      </DemoBlock>

      {/* 自定义文本 */}
      <DemoBlock title="自定义文本" description="可以自定义进度条显示的文本。" code={textSnippet}>
        <Space direction="vertical" className="w-full">
          <Progress percentage={50} text="进行中" />
          <Progress percentage={100} text="已完成" />
          <Progress percentage={50} format={(p) => `${p}个/100个`} />
        </Space>
      </DemoBlock>

      {/* 不显示文字 */}
      <DemoBlock title="不显示文字" description="可以隐藏进度条的文本显示。" code={noTextSnippet}>
        <Space direction="vertical" className="w-full">
          <Progress percentage={50} showText={false} />
          <Progress percentage={100} showText={false} />
        </Space>
      </DemoBlock>

      {/* 条纹进度条 */}
      <DemoBlock title="条纹进度条" description="线形进度条支持条纹样式和动画效果。" code={stripedSnippet}>
        <Space direction="vertical" className="w-full">
          <Progress percentage={70} striped={true} />
          <Progress percentage={70} striped={true} stripedAnimation={true} />
        </Space>
      </DemoBlock>

      {/* 文件上传示例 */}
      <DemoBlock title="文件上传示例" description="模拟文件上传进度。" code={uploadSnippet}>
        <Space direction="vertical" className="w-full">
          <Progress percentage={uploadProgress} />
          <Button variant="primary" onClick={startUpload}>
            开始上传
          </Button>
        </Space>
      </DemoBlock>

      {/* 仪表盘展示 */}
      <DemoBlock title="仪表盘展示" description="使用圆形进度条展示系统资源使用情况。" code={dashboardSnippet}>
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
      </DemoBlock>
    </div>
  )
}
