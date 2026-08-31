import { useState } from 'react'
import { AspectRatio } from '@expcat/tigercat-react/AspectRatio'

const options = ['16/9', '4/3', '1/1'] as const
const cover = 'https://picsum.photos/seed/tiger-overlay/640/360'

export default function App() {
  const [ratio, setRatio] = useState<string>('16/9')

  return (
    <div className="w-full max-w-md space-y-3">
      <AspectRatio
        ratio={ratio}
        className="rounded-xl border border-gray-200 shadow-sm dark:border-gray-700">
        <img src={cover} alt="" />
        <div className="absolute inset-x-0 bottom-0 bg-black/40 px-4 py-3 backdrop-blur-sm">
          <p className="text-sm font-medium text-white">课程封面：响应式布局实战</p>
          <p className="text-xs text-white/80">覆盖层铺在媒体上，圆角由比例盒裁切</p>
        </div>
      </AspectRatio>
      <div className="flex items-center gap-2">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setRatio(option)}
            className={
              'rounded-md border px-3 py-1.5 font-mono text-xs transition-colors ' +
              (ratio === option
                ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                : 'border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800')
            }>
            {option}
          </button>
        ))}
      </div>
    </div>
  )
}
