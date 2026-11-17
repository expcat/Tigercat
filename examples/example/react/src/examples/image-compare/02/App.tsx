import { ImageCompare } from '@expcat/tigercat-react/ImageCompare'
import { demoImageBefore as before, demoImageAfter as after } from '@demo-shared/demo-images'

export default function App() {
  return (
    <div className="py-2">
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
    </div>
  )
}
