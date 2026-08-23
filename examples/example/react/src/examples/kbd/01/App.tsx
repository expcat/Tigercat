import { Kbd } from '@expcat/tigercat-react/Kbd'
import { Text } from '@expcat/tigercat-react/Text'

export default function App() {
  return (
    <Text tag="p" size="sm">
      按下 <Kbd>Esc</Kbd> 关闭面板，或 <Kbd>/</Kbd> 打开搜索。
    </Text>
  )
}
