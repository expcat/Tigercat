import { useRef } from 'react'
import { Button } from '@expcat/tigercat-react/Button'
import { Carousel } from '@expcat/tigercat-react/Carousel'
import type { CarouselRef } from '@expcat/tigercat-react'

export default function App() {
  const carouselRef = useRef<CarouselRef>(null)

  return (
    <div className="space-y-6">
      <Carousel autoplay autoplaySpeed={4000} arrows effect="fade" pauseOnHover pauseOnFocus>
        <div className="flex h-32 items-center justify-center rounded-lg bg-violet-600 text-white">
          矮页
        </div>
        <div className="flex h-56 items-center justify-center rounded-lg bg-violet-700 text-xl text-white">
          高页 · 高度跟当前张
        </div>
        <div className="flex h-40 items-center justify-center rounded-lg bg-violet-800 text-white">
          中页
        </div>
      </Carousel>
      <div className="space-y-3">
        <Carousel ref={carouselRef} infinite={false} arrows>
          {['第一页', '第二页', '第三页'].map((slide) => (
            <div
              key={slide}
              className="flex h-36 items-center justify-center rounded-lg bg-purple-600 text-white">
              {slide}
            </div>
          ))}
        </Carousel>
        <div className="flex gap-2">
          <Button size="sm" onClick={() => carouselRef.current?.prev()}>
            上一页
          </Button>
          <Button size="sm" onClick={() => carouselRef.current?.next()}>
            下一页
          </Button>
          <Button size="sm" variant="secondary" onClick={() => carouselRef.current?.goTo(0)}>
            回到第一页
          </Button>
        </div>
      </div>
    </div>
  )
}
