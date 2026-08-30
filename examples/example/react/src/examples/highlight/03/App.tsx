import { Highlight } from '@expcat/tigercat-react/Highlight'
import { Link } from '@expcat/tigercat-react/Link'
import { Text } from '@expcat/tigercat-react/Text'

const orderId = /#\d+/

export default function App() {
  return (
    <div className="space-y-2">
      <Text tag="p" size="sm">
        <Highlight text="Order #42 ships on 2026-08-23, follow-up #7." keywords={orderId} />
      </Text>
      <Text tag="p" size="sm">
        <Highlight
          text="Vue and React, then Vue and React again."
          keywords={['Vue', 'React']}
          global={false}
        />
      </Text>
      <Text tag="p" size="sm">
        <Highlight keywords="Vue">
          Learn <Link href="https://vuejs.org">Vue</Link> today
        </Highlight>
      </Text>
    </div>
  )
}
