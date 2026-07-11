import { Watermark } from '@expcat/tigercat-react/Watermark'

export default function App() {
  return (
    <Watermark
      content="Tigercat"
      rotate={-24}
      gapX={110}
      gapY={80}
      font={{ color: 'rgba(37, 99, 235, 0.16)', fontWeight: 700 }}>
      <div className="h-56 rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
        文字水印会重复覆盖整个内容区域。
      </div>
    </Watermark>
  )
}
