import { Button } from '@expcat/tigercat-react/Button'
import { Marquee } from '@expcat/tigercat-react/Marquee'
import { Tag } from '@expcat/tigercat-react/Tag'

export default function App() {
  return (
    <Marquee duration={16000} aria-label="Framework ticker">
      <Tag>Vue</Tag>
      <Tag variant="primary">React</Tag>
      <Tag>TypeScript</Tag>
      <Button>Docs</Button>
      <Tag>Tailwind</Tag>
      <Tag variant="warning">a11y</Tag>
    </Marquee>
  )
}
