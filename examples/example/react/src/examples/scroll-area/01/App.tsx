import { ScrollArea } from '@expcat/tigercat-react/ScrollArea'

const items = Array.from({ length: 24 }, (_, index) => `第 ${index + 1} 条更新日志`)

export default function App() {
  return (
    <div className="w-full max-w-md">
      <ScrollArea
        height={200}
        maxHeight={200}
        shadow
        ariaLabel="更新日志"
        className="rounded-lg border border-gray-200 dark:border-gray-700">
        <ul className="divide-y divide-gray-100 px-4 dark:divide-gray-800">
          {items.map((item) => (
            <li key={item} className="py-2 text-sm text-gray-700 dark:text-gray-200">
              {item}
            </li>
          ))}
        </ul>
      </ScrollArea>
    </div>
  )
}
