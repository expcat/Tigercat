import { Icon } from '@expcat/tigercat-react/Icon'
import type { IconDefinition } from '@expcat/tigercat-core'

const brandMark: IconDefinition = {
  viewBox: '0 0 24 24',
  paths: ['M12 2 2 19.5h20L12 2Zm0 5.25 5.5 9.75h-11L12 7.25Z'],
  mode: 'fill'
}

export default function App() {
  return <Icon icon={brandMark} size="xl" color="#f59e0b" aria-label="Tigercat 标志" />
}
