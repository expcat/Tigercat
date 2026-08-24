import { Highlight } from '@expcat/tigercat-react/Highlight'
import { Text } from '@expcat/tigercat-react/Text'

const orderId = /#\d+/

export default function App() {
  return (
    <div className="space-y-2">
      <Text tag="p" size="sm">
        <Highlight text="Order #42 ships on 2026-08-23, follow-up #7." keywords={orderId} />
      </Text>
      <Text tag="p" size="sm">
        <Highlight text="Vue then vue then VUE" keywords="Vue" caseSensitive global={false} />
      </Text>
    </div>
  )
}
