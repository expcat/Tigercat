import { useState } from 'react'
import { ImageCompare } from '@expcat/tigercat-react/ImageCompare'
import { Text } from '@expcat/tigercat-react/Text'

const before = 'https://picsum.photos/seed/tiger-compare-slot-before/800/500'
const after = 'https://picsum.photos/seed/tiger-compare-slot-after/800/500'

export default function App() {
  const [position, setPosition] = useState(60)

  return (
    <div className="flex flex-col gap-2">
      <Text size="sm">当前位置 {position}%</Text>
      <ImageCompare
        position={position}
        onChange={setPosition}
        width={480}
        height={280}
        aria-label="装修前后对比"
        before={<img src={before} alt="插槽 before" className="block h-full w-full object-cover" />}
        after={<img src={after} alt="插槽 after" className="block h-full w-full object-cover" />}
      />
    </div>
  )
}
