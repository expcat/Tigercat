import { Splitter } from '@expcat/tigercat-react/Splitter'

export default function App() {
  return (
    <>
      <Splitter
        direction="horizontal"
        sizes={[30, 70]}
        min={100}
        style={{ height: 200, border: '1px solid #e5e7eb', borderRadius: 8 }}>
        <div className="p-4">最小宽度面板</div>
        <div className="p-4">主内容区</div>
      </Splitter>
    </>
  )
}
