import { Marquee } from '@expcat/tigercat-react/Marquee'
import { Tag } from '@expcat/tigercat-react/Tag'

export default function App() {
  return (
    <div className="flex gap-6">
      <Marquee direction="up" duration={12000} gap={12} aria-label="Inbox up">
        <Tag>Inbox</Tag>
        <Tag variant="primary">Mentions</Tag>
        <Tag variant="success">Shipped</Tag>
        <Tag variant="warning">Review</Tag>
        <Tag>Archive</Tag>
      </Marquee>
      <Marquee direction="down" duration={12000} gap={12} aria-label="Inbox down">
        <Tag>Inbox</Tag>
        <Tag variant="primary">Mentions</Tag>
        <Tag variant="success">Shipped</Tag>
        <Tag variant="warning">Review</Tag>
        <Tag>Archive</Tag>
      </Marquee>
    </div>
  )
}
