import { useState } from 'react'
import { AspectRatio } from '@expcat/tigercat-react/AspectRatio'

const options = ['16/9', '4/3', '1/1'] as const

export default function App() {
  const [ratio, setRatio] = useState<string>('16/9')

  return (
    <div className="w-full max-w-md space-y-3">
      <AspectRatio
        ratio={ratio}
        className="overflow-hidden rounded-xl border border-gray-200 shadow-sm dark:border-gray-700"
        contentClassName="bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500">
        <div className="relative h-full">
          <div className="absolute inset-x-0 bottom-0 bg-black/40 px-4 py-3 backdrop-blur-sm">
            <p className="text-sm font-medium text-white">课程封面：响应式布局实战</p>
            <p className="text-xs text-white/80">子内容铺满比例框，随比例切换重排</p>
          </div>
          <div className="flex h-full items-center justify-center">
            <span className="sr-only">封面区域</span>
          </div>
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
