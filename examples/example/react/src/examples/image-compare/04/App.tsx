import { ImageCompare } from '@expcat/tigercat-react/ImageCompare'

const before = 'https://picsum.photos/seed/tiger-compare-rtl-before/800/500'
const after = 'https://picsum.photos/seed/tiger-compare-rtl-after/800/500'

export default function App() {
  return (
    <ImageCompare
      dir="rtl"
      beforeSrc={before}
      afterSrc={after}
      beforeAlt="改造前"
      afterAlt="改造后"
      width={480}
      height={280}
    />
  )
}
