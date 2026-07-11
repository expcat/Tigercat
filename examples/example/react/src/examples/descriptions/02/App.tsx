import { Descriptions } from '@expcat/tigercat-react/Descriptions'

const items = [
  { label: 'CPU', content: '8 核' },
  { label: '内存', content: '16 GB' },
  { label: '系统', content: 'Ubuntu 24.04', span: 2 }
]

export default function App() {
  return (
    <Descriptions
      title="服务器配置"
      items={items}
      layout="vertical"
      bordered
      size="sm"
      column={2}
      colon={false}
    />
  )
}
