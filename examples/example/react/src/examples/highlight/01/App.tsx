import { Highlight } from '@expcat/tigercat-react/Highlight'
import { Text } from '@expcat/tigercat-react/Text'

export default function App() {
  return (
    <Text tag="p" size="sm">
      <Highlight keywords="Vue">
        {'Tigercat 同时提供 Vue 与 React 组件，文档与 API 保持对称。'}
      </Highlight>
    </Text>
  )
}
