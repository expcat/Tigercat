import { Marquee } from '@expcat/tigercat-react/Marquee'
import { Tag } from '@expcat/tigercat-react/Tag'

export default function App() {
  return (
    <Marquee className="h-40" direction="up" duration={12000} gap={12}>
      <Tag>Inbox</Tag>
      <Tag variant="primary">Mentions</Tag>
      <Tag variant="success">Shipped</Tag>
      <Tag variant="warning">Review</Tag>
      <Tag>Archive</Tag>
    </Marquee>
  )
}
