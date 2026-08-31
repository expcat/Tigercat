import { AspectRatio } from '@expcat/tigercat-react/AspectRatio'

const ratios = [
  { label: '1/1', value: '1/1' as const },
  { label: '1.5', value: 1.5 },
  { label: 'bad → 16/9', value: 'nope' },
  { label: '21/9', value: '21/9' as const }
]

export default function App() {
  return (
    <div className="w-full max-w-2xl space-y-4">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {ratios.map((ratio) => (
          <figure key={ratio.label}>
            <AspectRatio
              ratio={ratio.value}
              className="rounded-lg border border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-800">
              <div className="flex h-full items-center justify-center">
                <span className="font-mono text-sm text-gray-700 dark:text-gray-200">
                  {ratio.label}
                </span>
              </div>
            </AspectRatio>
            <figcaption className="mt-1.5 text-center text-xs text-gray-500 dark:text-gray-400">
              {ratio.label}
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  )
}
