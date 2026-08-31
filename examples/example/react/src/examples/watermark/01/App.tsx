import { Watermark } from '@expcat/tigercat-react/Watermark'

const font = { fontWeight: 700 as const }

export default function App() {
  return (
    <Watermark content="Tigercat" rotate={-24} gapX={110} gapY={80} font={font}>
      <div className="h-56 rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
        文字水印按 gap 留白平铺，默认墨水跟 --tiger-text。
      </div>
    </Watermark>
  )
}
