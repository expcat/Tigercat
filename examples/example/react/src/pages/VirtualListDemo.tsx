import { useCallback } from 'react'
import { VirtualList } from '@expcat/tigercat-react/VirtualList'
import DemoBlock from '../components/DemoBlock'
import fullPageSnippet from './VirtualListDemo.tsx?raw'

const VirtualListDemo: React.FC = () => {
  const renderItem = useCallback(
    ({ index }: { index: number }) => (
      <div className={`px-4 flex items-center h-full ${index % 2 === 0 ? 'bg-gray-50' : ''}`}>
        第 {index + 1} 行
      </div>
    ),
    []
  )

  const renderDetailItem = useCallback(
    ({ index }: { index: number }) => (
      <div className="px-4 py-2 border-b">
        <p className="font-medium">项目 {index + 1}</p>
        <p className="text-sm text-gray-500">描述信息</p>
      </div>
    ),
    []
  )

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-8">
      <h1 className="text-3xl font-bold mb-2">VirtualList 虚拟列表</h1>
      <p className="text-gray-500 mb-8">虚拟滚动渲染大量列表项，只渲染可视区域内的元素。</p>

      <DemoBlock
        title="组合展示"
        description="合并展示基础用法、自定义高度 & overscan，减少重复示例块。"
        code={fullPageSnippet}>
        <div className="space-y-6">
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">基础用法</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">10000 条数据，itemHeight=40</p>
            <div style={{ border: '1px solid #e5e7eb', borderRadius: 8 }}>
              <VirtualList itemCount={10000} itemHeight={40} height={300} renderItem={renderItem} />
            </div>
          </section>
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              自定义高度 & overscan
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">itemHeight=60，overscan=10</p>
            <VirtualList
              itemCount={5000}
              itemHeight={60}
              height={360}
              overscan={10}
              renderItem={renderDetailItem}
            />
          </section>
        </div>
      </DemoBlock>
    </div>
  )
}

export default VirtualListDemo
