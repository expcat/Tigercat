import { ImageCompare } from '@expcat/tigercat-react/ImageCompare'

export default function App() {
  return (
    <ImageCompare
      beforeSrc="https://picsum.photos/seed/compare-before/640/360"
      afterSrc="https://picsum.photos/seed/compare-after/640/360"
      beforeTitle="原图"
      afterTitle="处理后"
      beforeAlt="原图"
      afterAlt="处理后"
    />
  )
}
