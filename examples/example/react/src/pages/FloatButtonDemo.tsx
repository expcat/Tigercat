import { FloatButton, FloatButtonGroup } from '@expcat/tigercat-react'
import DemoBlock from '../components/DemoBlock'

const basicSnippet = `<FloatButton tooltip="默认" onClick={() => console.log('clicked')} />
<FloatButton shape="square" type="default" tooltip="方形" />
<FloatButton size="lg" tooltip="大号" />`

const groupSnippet = `<FloatButtonGroup trigger="hover" triggerNode={<FloatButton tooltip="菜单" />}>
  <FloatButton tooltip="操作 A" type="default" />
  <FloatButton tooltip="操作 B" type="default" />
</FloatButtonGroup>`

const disabledSnippet = `<FloatButton disabled tooltip="不可用" />`

const FloatButtonDemo: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-2">FloatButton 悬浮按钮</h1>
      <p className="text-gray-500 mb-8">悬浮在页面角落的操作按钮，支持分组展开。</p>

      <DemoBlock title="基础用法" description="shape、size、type 和 tooltip" code={basicSnippet}>
        <div className="relative h-64 border rounded-lg overflow-hidden">
          <FloatButton tooltip="默认" style={{ position: 'absolute', right: 24, bottom: 24 }} onClick={() => console.log('clicked')} />
          <FloatButton shape="square" type="default" tooltip="方形" style={{ position: 'absolute', right: 24, bottom: 80 }} />
          <FloatButton size="lg" tooltip="大号" style={{ position: 'absolute', right: 24, bottom: 136 }} />
        </div>
      </DemoBlock>

      <DemoBlock title="按钮组" description="FloatButton.Group 分组展开" code={groupSnippet}>
        <div className="relative h-64 border rounded-lg overflow-hidden">
          <FloatButtonGroup trigger="hover" triggerNode={<FloatButton tooltip="菜单" />} style={{ position: 'absolute', right: 24, bottom: 24 }}>
            <FloatButton tooltip="操作 A" type="default" />
            <FloatButton tooltip="操作 B" type="default" />
          </FloatButtonGroup>
        </div>
      </DemoBlock>

      <DemoBlock title="禁用" code={disabledSnippet}>
        <div className="relative h-40 border rounded-lg overflow-hidden">
          <FloatButton disabled tooltip="不可用" style={{ position: 'absolute', right: 24, bottom: 24 }} />
        </div>
      </DemoBlock>
    </div>
  )
}

export default FloatButtonDemo
