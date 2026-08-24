import { ImageCompare } from '@expcat/tigercat-react/ImageCompare'

const before = 'https://picsum.photos/seed/tiger-compare-top/800/500'
const after = 'https://picsum.photos/seed/tiger-compare-bottom/800/500'

export default function App() {
  return (
    <ImageCompare
      beforeSrc={before}
      afterSrc={after}
      beforeAlt="上半部分"
      afterAlt="下半部分"
      orientation="vertical"
      defaultPosition={40}
      width={480}
      height={280}
    />
  )
}
