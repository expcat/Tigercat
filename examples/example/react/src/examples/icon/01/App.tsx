import { Icon } from '@expcat/tigercat-react/Icon'
import { Text } from '@expcat/tigercat-react/Text'

export default function App() {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <Text tag="span" color="primary">
        <Icon name="search" size="lg" />
      </Text>
      <Icon name="search" size="lg" aria-label="搜索" />
    </div>
  )
}
