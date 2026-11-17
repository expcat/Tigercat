import { ImageCompare } from '@expcat/tigercat-react/ImageCompare'
import { demoImageBefore as before, demoImageAfter as after } from '@demo-shared/demo-images'

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
