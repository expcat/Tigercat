import { useState } from 'react'
import { Button } from '@expcat/tigercat-react/Button'
import { Marquee } from '@expcat/tigercat-react/Marquee'
import { Tag } from '@expcat/tigercat-react/Tag'

export default function App() {
  const [paused, setPaused] = useState(false)

  return (
    <div className="flex flex-col gap-3">
      <Button onClick={() => setPaused((value) => !value)}>{paused ? 'Play' : 'Pause'}</Button>
      <Marquee direction="right" duration={18000} paused={paused} aria-label="Release ticker">
        <Tag>News</Tag>
        <Tag variant="primary">Release</Tag>
        <Button>Docs</Button>
        <Tag variant="success">Examples</Tag>
        <Tag>Changelog</Tag>
      </Marquee>
    </div>
  )
}
