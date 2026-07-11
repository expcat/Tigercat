import { Splitter } from '@expcat/tigercat-react/Splitter'

export default function App() {
  return (
    <>
      <Splitter
        direction="horizontal"
        sizes={[25, 75]}
        style={{ height: 300, border: '1px solid #e5e7eb', borderRadius: 8 }}>
        <div className="p-4 bg-gray-50 h-full">侧边栏</div>
        <Splitter direction="vertical" sizes={[60, 40]}>
          <div className="p-4">内容区</div>
          <div className="p-4 bg-gray-50">底部面板</div>
        </Splitter>
      </Splitter>
    </>
  )
}
