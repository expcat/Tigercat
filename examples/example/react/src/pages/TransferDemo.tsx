import { useState } from 'react'
import { Transfer } from '@expcat/tigercat-react/Transfer'
import DemoBlock from '../components/DemoBlock'
import fullPageSnippet from './TransferDemo.tsx?raw'

const dataSource = Array.from({ length: 10 }, (_, i) => ({
  key: String(i + 1),
  label: `内容 ${i + 1}`,
  description: `描述 ${i + 1}`
}))

const basicSnippet = `<Transfer targetKeys={targetKeys} onChange={setTargetKeys} dataSource={dataSource} />`

const basicScriptSnippet = `import { useState } from 'react'

const dataSource = Array.from({ length: 10 }, (_, i) => ({
  key: String(i + 1),
  label: \`内容 \${i + 1}\`,
  description: \`描述 \${i + 1}\`
}))

const [targetKeys, setTargetKeys] = useState(['3', '4'])`

const searchSnippet = `<Transfer targetKeys={targetKeys} onChange={setTargetKeys} dataSource={dataSource} searchable sourceTitle="可选" targetTitle="已选" />`

const TransferDemo: React.FC = () => {
  const [targetKeys1, setTargetKeys1] = useState<(string | number)[]>(['3', '4'])
  const [targetKeys2, setTargetKeys2] = useState<(string | number)[]>(['3', '4'])

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-8">
      <h1 className="text-3xl font-bold mb-2">Transfer 穿梭框</h1>
      <p className="text-gray-500 mb-8">双栏穿梭选择，将数据在两栏之间移动。</p>

      <DemoBlock title="基本用法" description="双向穿梭选择" code={fullPageSnippet}>
        <Transfer targetKeys={targetKeys1} onChange={setTargetKeys1} dataSource={dataSource} />
      </DemoBlock>

      <DemoBlock title="搜索与标题" description="searchable 开启搜索" code={fullPageSnippet}>
        <Transfer
          targetKeys={targetKeys2}
          onChange={setTargetKeys2}
          dataSource={dataSource}
          searchable
          sourceTitle="可选"
          targetTitle="已选"
        />
      </DemoBlock>
    </div>
  )
}

export default TransferDemo
