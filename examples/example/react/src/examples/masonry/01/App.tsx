import { Masonry } from '@expcat/tigercat-react/Masonry'

const heights = ['h-24', 'h-40', 'h-32', 'h-28', 'h-36', 'h-24', 'h-44', 'h-28', 'h-32']
const cards = heights.map((height, index) => ({
  id: index + 1,
  height,
  title: `卡片 ${index + 1}`
}))

export default function App() {
  return (
    <div className="w-full max-w-md">
      <Masonry aria-label="卡片瀑布流">
        {cards.map((card) => (
          <div
            key={card.id}
            className={`flex items-center justify-center rounded-lg bg-blue-50 text-sm font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-200 ${card.height}`}>
            {card.title}
          </div>
        ))}
      </Masonry>
    </div>
  )
}
