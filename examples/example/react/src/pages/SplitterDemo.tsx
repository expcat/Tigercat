import { Splitter } from '@expcat/tigercat-react'
import DemoBlock from '../components/DemoBlock'

const horizontalSnippet = `<Splitter direction="horizontal" sizes={[30, 70]} style={{ height: 200, border: '1px solid #e5e7eb', borderRadius: 8 }}>
  <Splitter.Panel><div className="p-4">左侧面板 (30%)</div></Splitter.Panel>
  <Splitter.Panel><div className="p-4">右侧面板 (70%)</div></Splitter.Panel>
</Splitter>`

const verticalSnippet = `<Splitter direction="vertical" sizes={[40, 60]} style={{ height: 300 }}>
  <Splitter.Panel><div className="p-4">上方面板</div></Splitter.Panel>
  <Splitter.Panel><div className="p-4">下方面板</div></Splitter.Panel>
</Splitter>`

const nestedSnippet = `<Splitter direction="horizontal" sizes={[25, 75]} style={{ height: 300 }}>
  <Splitter.Panel><div className="p-4 bg-gray-50 h-full">侧边栏</div></Splitter.Panel>
  <Splitter.Panel>
    <Splitter direction="vertical" sizes={[60, 40]}>
      <Splitter.Panel><div className="p-4">内容区</div></Splitter.Panel>
      <Splitter.Panel><div className="p-4 bg-gray-50">底部面板</div></Splitter.Panel>
    </Splitter>
  </Splitter.Panel>
</Splitter>`

const collapsibleSnippet = `<Splitter direction="horizontal" sizes={[30, 70]} collapsible={[true, false]} minSizes={[100]}>
  <Splitter.Panel><div className="p-4">可折叠面板</div></Splitter.Panel>
  <Splitter.Panel><div className="p-4">主内容区</div></Splitter.Panel>
</Splitter>`

const SplitterDemo: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-2">Splitter 分割面板</h1>
      <p className="text-gray-500 mb-8">可拖拽分割面板，支持水平/垂直、嵌套和折叠。</p>

      <DemoBlock title="水平分割" description="拖拽分割条调整面板大小" code={horizontalSnippet}>
        <Splitter direction="horizontal" sizes={[30, 70]} style={{ height: 200, border: '1px solid #e5e7eb', borderRadius: 8 }}>
          <Splitter.Panel><div className="p-4">左侧面板 (30%)</div></Splitter.Panel>
          <Splitter.Panel><div className="p-4">右侧面板 (70%)</div></Splitter.Panel>
        </Splitter>
      </DemoBlock>

      <DemoBlock title="垂直分割" code={verticalSnippet}>
        <Splitter direction="vertical" sizes={[40, 60]} style={{ height: 300, border: '1px solid #e5e7eb', borderRadius: 8 }}>
          <Splitter.Panel><div className="p-4">上方面板</div></Splitter.Panel>
          <Splitter.Panel><div className="p-4">下方面板</div></Splitter.Panel>
        </Splitter>
      </DemoBlock>

      <DemoBlock title="嵌套分割" description="水平套垂直，实现 IDE 布局" code={nestedSnippet}>
        <Splitter direction="horizontal" sizes={[25, 75]} style={{ height: 300, border: '1px solid #e5e7eb', borderRadius: 8 }}>
          <Splitter.Panel><div className="p-4 bg-gray-50 h-full">侧边栏</div></Splitter.Panel>
          <Splitter.Panel>
            <Splitter direction="vertical" sizes={[60, 40]}>
              <Splitter.Panel><div className="p-4">内容区</div></Splitter.Panel>
              <Splitter.Panel><div className="p-4 bg-gray-50">底部面板</div></Splitter.Panel>
            </Splitter>
          </Splitter.Panel>
        </Splitter>
      </DemoBlock>

      <DemoBlock title="可折叠" description="collapsible 允许折叠面板" code={collapsibleSnippet}>
        <Splitter direction="horizontal" sizes={[30, 70]} collapsible={[true, false]} minSizes={[100]} style={{ height: 200, border: '1px solid #e5e7eb', borderRadius: 8 }}>
          <Splitter.Panel><div className="p-4">可折叠面板</div></Splitter.Panel>
          <Splitter.Panel><div className="p-4">主内容区</div></Splitter.Panel>
        </Splitter>
      </DemoBlock>
    </div>
  )
}

export default SplitterDemo
