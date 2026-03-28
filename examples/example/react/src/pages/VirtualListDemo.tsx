import { useCallback } from 'react'
import { VirtualList } from '@expcat/tigercat-react'
import DemoBlock from '../components/DemoBlock'

const basicSnippet = `<VirtualList itemCount={10000} itemHeight={40} height={300}
  renderItem={({ index }) => <div className="px-4 flex items-center h-full">第 {index + 1} 行</div>}
/>`

const customSnippet = `<VirtualList itemCount={5000} itemHeight={60} height={360} overscan={10}
  renderItem={({ index }) => (
    <div className="px-4 py-2 border-b">
      <p className="font-medium">项目 {index + 1}</p>
      <p className="text-sm text-gray-500">描述信息</p>
    </div>
  )}
/>`

const VirtualListDemo: React.FC = () => {
  const renderItem = useCallback(({ index }: { index: number }) => (
    <div className={`px-4 flex items-center h-full ${index % 2 === 0 ? 'bg-gray-50' : ''}`}>
      第 {index + 1} 行
    </div>
  ), [])

  const renderDetailItem = useCallback(({ index }: { index: number }) => (
    <div className="px-4 py-2 border-b">
      <p className="font-medium">项目 {index + 1}</p>
      <p className="text-sm text-gray-500">描述信息</p>
    </div>
  ), [])

  return (
    <div className="max-w-5xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-2">VirtualList 虚拟列表</h1>
      <p className="text-gray-500 mb-8">虚拟滚动渲染大量列表项，只渲染可视区域内的元素。</p>

      <DemoBlock title="基础用法" description="10000 条数据，itemHeight=40" code={basicSnippet}>
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 8 }}>
          <VirtualList itemCount={10000} itemHeight={40} height={300}
            renderItem={renderItem}
          />
        </div>
      </DemoBlock>

      <DemoBlock title="自定义高度 & overscan" description="itemHeight=60，overscan=10" code={customSnippet}>
        <VirtualList itemCount={5000} itemHeight={60} height={360} overscan={10}
          renderItem={renderDetailItem}
        />
      </DemoBlock>
    </div>
  )
}

export default VirtualListDemo
