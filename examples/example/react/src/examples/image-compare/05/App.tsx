import { ImageCompare } from '@expcat/tigercat-react/ImageCompare'
import { demoImageBefore as before, demoImageAfter as after } from '@demo-shared/demo-images'

export default function App() {
  return (
    <ImageCompare
      beforeSrc={before}
      afterSrc={after}
      beforeTitle="原图"
      afterTitle="处理后"
      beforeAlt="原图"
      afterAlt="处理后"
    />
  )
}
