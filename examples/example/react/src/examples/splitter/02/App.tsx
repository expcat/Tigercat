import { Splitter } from '@expcat/tigercat-react/Splitter'

export default function App() {
  return (
    <>
      <Splitter
        direction="vertical"
        sizes={[40, 60]}
        style={{ height: 300, border: '1px solid #e5e7eb', borderRadius: 8 }}>
        <div className="p-4">上方面板</div>
        <div className="p-4">下方面板</div>
      </Splitter>
    </>
  )
}
