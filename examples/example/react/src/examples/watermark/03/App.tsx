import { Watermark } from '@expcat/tigercat-react/Watermark'

export default function App() {
  return (
    <Watermark content="Tigercat" rowGap={16} density={2} printVisible={false}>
      <div className="h-40">页面内容</div>
    </Watermark>
  )
}
