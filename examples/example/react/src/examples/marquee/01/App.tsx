import { Marquee } from '@expcat/tigercat-react/Marquee'
import { Tag } from '@expcat/tigercat-react/Tag'

export default function App() {
  return (
    <Marquee duration={16000}>
      <Tag>Vue</Tag>
      <Tag variant="primary">React</Tag>
      <Tag>TypeScript</Tag>
      <Tag variant="success">SSR</Tag>
      <Tag>Tailwind</Tag>
      <Tag variant="warning">a11y</Tag>
    </Marquee>
  )
}
