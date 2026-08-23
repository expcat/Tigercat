import { Highlight } from '@expcat/tigercat-react/Highlight'
import { Text } from '@expcat/tigercat-react/Text'

const keywords = ['Vue', 'React']

export default function App() {
  return (
    <Text tag="p" size="sm">
      <Highlight text="Search Vue, React, and vue again." keywords={keywords} />
    </Text>
  )
}
