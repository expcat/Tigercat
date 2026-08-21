import { useState } from 'react'
import { Button } from '@expcat/tigercat-react/Button'
import { Masonry } from '@expcat/tigercat-react/Masonry'

const heights = ['h-24', 'h-40', 'h-32', 'h-28', 'h-36', 'h-44']

interface Card {
  id: number
  height: string
}

function createCard(id: number): Card {
  return { id, height: heights[id % heights.length] }
}

export default function App() {
  const [cards, setCards] = useState<Card[]>(() =>
    Array.from({ length: 6 }, (_, index) => createCard(index + 1))
  )

  return (
    <div className="w-full max-w-md space-y-3">
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          onClick={() => setCards((current) => [...current, createCard(current.length + 1)])}>
          添加卡片
        </Button>
        <Button
          size="sm"
          variant="secondary"
          disabled={cards.length === 0}
          onClick={() => setCards((current) => current.slice(0, -1))}>
          移除卡片
        </Button>
      </div>
      <Masonry columns={2} gap={12} aria-label="动态卡片瀑布流">
        {cards.map((card) => (
          <div
            key={card.id}
            className={`flex items-center justify-center rounded-lg bg-violet-50 text-sm font-medium text-violet-700 dark:bg-violet-950 dark:text-violet-200 ${card.height}`}>
            #{card.id}
          </div>
        ))}
      </Masonry>
      <p className="text-sm text-gray-600 dark:text-gray-300">
        当前 {cards.length} 张卡片,插入后自动重排。
      </p>
    </div>
  )
}
