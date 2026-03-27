import { Affix } from '@expcat/tigercat-react'
import DemoBlock from '../components/DemoBlock'

const topSnippet = `<Affix offsetTop={0} onChange={(affixed) => console.log(affixed)}>
  <div className="px-4 py-2 bg-blue-500 text-white rounded">固定在顶部</div>
</Affix>`

const bottomSnippet = `<Affix offsetBottom={20}>
  <div className="px-4 py-2 bg-green-500 text-white rounded">距底部 20px 固定</div>
</Affix>`

const AffixDemo: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-2">Affix 固钉</h1>
      <p className="text-gray-500 mb-8">将元素固定在可视区域的指定位置。</p>

      <DemoBlock title="固定在顶部" description="offsetTop 设置触发固定的滚动距离" code={topSnippet}>
        <div style={{ height: 100, overflow: 'auto', border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 }}>
          <div style={{ height: 300 }}>
            <p className="mb-4">向下滚动触发固定</p>
            <Affix offsetTop={0} onChange={(affixed) => console.log('Affix:', affixed)}>
              <div className="px-4 py-2 bg-blue-500 text-white rounded inline-block">我会固定在顶部</div>
            </Affix>
            <p className="mt-4">更多内容...</p>
          </div>
        </div>
      </DemoBlock>

      <DemoBlock title="底部固定" description="offsetBottom 从底部触发" code={bottomSnippet}>
        <Affix offsetBottom={20}>
          <div className="px-4 py-2 bg-green-500 text-white rounded inline-block">距底部 20px 固定</div>
        </Affix>
      </DemoBlock>
    </div>
  )
}

export default AffixDemo
