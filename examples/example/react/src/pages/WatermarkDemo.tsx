import { Watermark } from '@expcat/tigercat-react'
import DemoBlock from '../components/DemoBlock'

const textSnippet = `<Watermark content="Tigercat">
  <div style={{ height: 300 }} className="bg-gray-50 rounded-lg p-4">
    <p>这里是被水印覆盖的内容区域。</p>
  </div>
</Watermark>`

const multiSnippet = `<Watermark content={['Tigercat', '2024-01-01']} font={{ fontSize: 14, color: 'rgba(0,0,0,0.1)' }}>
  <div style={{ height: 300 }} className="bg-gray-50 rounded-lg p-4">
    <p>多行水印文字，每行独立显示。</p>
  </div>
</Watermark>`

const configSnippet = `<Watermark content="Custom" rotate={-30} gapX={120} gapY={80} zIndex={5}>
  <div style={{ height: 300 }} className="bg-blue-50 rounded-lg p-4">
    <p>自定义旋转角度、水印间距和层级。</p>
  </div>
</Watermark>`

const WatermarkDemo: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-2">Watermark 水印</h1>
      <p className="text-gray-500 mb-8">在页面上添加水印，支持文字和图片，防止信息泄露。</p>

      <DemoBlock title="文字水印" description="基本水印效果" code={textSnippet}>
        <Watermark content="Tigercat">
          <div style={{ height: 300 }} className="bg-gray-50 rounded-lg p-4">
            <p>这里是被水印覆盖的内容区域。水印文字会以倾斜角度重复平铺。</p>
          </div>
        </Watermark>
      </DemoBlock>

      <DemoBlock title="多行水印" description="content 传数组实现多行，自定义字体" code={multiSnippet}>
        <Watermark content={['Tigercat', '2024-01-01']} font={{ fontSize: 14, color: 'rgba(0,0,0,0.1)' }}>
          <div style={{ height: 300 }} className="bg-gray-50 rounded-lg p-4">
            <p>多行水印文字，每行独立显示。可自定义字体大小和颜色。</p>
          </div>
        </Watermark>
      </DemoBlock>

      <DemoBlock title="自定义配置" description="调整旋转角度、间距和层级" code={configSnippet}>
        <Watermark content="Custom" rotate={-30} gapX={120} gapY={80} zIndex={5}>
          <div style={{ height: 300 }} className="bg-blue-50 rounded-lg p-4">
            <p>自定义旋转角度、水印间距和层级。</p>
          </div>
        </Watermark>
      </DemoBlock>
    </div>
  )
}

export default WatermarkDemo
