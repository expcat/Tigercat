import { useState } from 'react'
import { Transfer } from '@expcat/tigercat-react/Transfer'

const dataSource = [
  { key: 'design', label: '设计' },
  { key: 'frontend', label: '前端' },
  { key: 'backend', label: '后端' },
  { key: 'qa', label: '测试' }
]

export default function App() {
  const [targetKeys, setTargetKeys] = useState<(string | number)[]>(['frontend'])

  return (
    <Transfer
      dataSource={dataSource}
      targetKeys={targetKeys}
      onChange={setTargetKeys}
      searchable
      sourceTitle="可选团队"
      targetTitle="已选团队"
      className="max-w-2xl"
    />
  )
}
