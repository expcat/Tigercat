import { Marquee } from '@expcat/tigercat-react/Marquee'
import { Tag } from '@expcat/tigercat-react/Tag'

export default function App() {
  return (
    <Marquee direction="right" duration={18000}>
      <Tag>News</Tag>
      <Tag variant="primary">Release</Tag>
      <Tag>Docs</Tag>
      <Tag variant="success">Examples</Tag>
      <Tag>Changelog</Tag>
    </Marquee>
  )
}
