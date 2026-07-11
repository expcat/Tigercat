import { Splitter } from '@expcat/tigercat-react/Splitter'

export default function App() {
  return (
    <>
      <Splitter
        direction="horizontal"
        sizes={[30, 70]}
        min={100}
        style={{ height: 200, border: '1px solid #e5e7eb', borderRadius: 8 }}>
        <div className="p-4">左侧面板（最小 100px）</div>
        <div className="p-4">右侧面板</div>
      </Splitter>
    </>
  )
}
