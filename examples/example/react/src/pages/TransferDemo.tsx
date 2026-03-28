import { useState } from 'react'
import { Transfer } from '@expcat/tigercat-react'
import DemoBlock from '../components/DemoBlock'

const dataSource = Array.from({ length: 10 }, (_, i) => ({
  key: String(i + 1),
  label: `内容 ${i + 1}`,
  description: `描述 ${i + 1}`
}))

const basicSnippet = `<Transfer targetKeys={targetKeys} onChange={setTargetKeys} dataSource={dataSource} />`
const searchSnippet = `<Transfer targetKeys={targetKeys} onChange={setTargetKeys} dataSource={dataSource} showSearch sourceTitle="可选" targetTitle="已选" />`

const TransferDemo: React.FC = () => {
  const [targetKeys1, setTargetKeys1] = useState<(string | number)[]>(['3', '4'])
  const [targetKeys2, setTargetKeys2] = useState<(string | number)[]>(['3', '4'])

  return (
    <div className="max-w-5xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-2">Transfer 穿梭框</h1>
      <p className="text-gray-500 mb-8">双栏穿梭选择，将数据在两栏之间移动。</p>

      <DemoBlock title="基本用法" description="双向穿梭选择" code={basicSnippet}>
        <Transfer targetKeys={targetKeys1} onChange={setTargetKeys1} dataSource={dataSource} />
      </DemoBlock>

      <DemoBlock title="搜索与标题" description="showSearch 开启搜索" code={searchSnippet}>
        <Transfer targetKeys={targetKeys2} onChange={setTargetKeys2} dataSource={dataSource} showSearch sourceTitle="可选" targetTitle="已选" />
      </DemoBlock>
    </div>
  )
}

export default TransferDemo
