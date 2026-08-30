import { Icon } from '@expcat/tigercat-react/Icon'
import type { IconDefinition } from '@expcat/tigercat-core'

const brandMark: IconDefinition = {
  viewBox: '0 0 24 24',
  paths: ['M12 2 2 19.5h20L12 2Zm0 5.25 5.5 9.75h-11L12 7.25Z'],
  mode: 'fill'
}

export default function App() {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <Icon icon={brandMark} size="xl" aria-label="Tigercat 标志" />
      <Icon color="#2563eb" aria-label="自定义描边">
        <svg viewBox="0 0 24 24">
          <path d="M5 12h14" />
        </svg>
      </Icon>
    </div>
  )
}
