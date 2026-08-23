import { ImageCompare } from '@expcat/tigercat-react/ImageCompare'

const before = 'https://picsum.photos/seed/tiger-compare-before/800/500'
const after = 'https://picsum.photos/seed/tiger-compare-after/800/500'

export default function App() {
  return (
    <ImageCompare
      beforeSrc={before}
      afterSrc={after}
      beforeAlt="改造前"
      afterAlt="改造后"
      width={480}
      height={280}
    />
  )
}
