import { Text } from '../../packages/react/src/components/Text'

const copied = (text: string): void => {
  text.toUpperCase()
}

export const copyableText = (
  <Text copyable onCopy={copied}>
    Copy me
  </Text>
)
