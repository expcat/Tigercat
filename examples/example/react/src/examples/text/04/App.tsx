import { Text } from '@expcat/tigercat-react/Text'

export default function App() {
  return (
    <div className="space-y-3">
      <Text copyable>user-42</Text>
      <Text tag="span" copyable={{ text: 'evt_8f2a', tooltip: '复制事件 ID' }}>
        evt_8f2a
      </Text>
    </div>
  )
}
