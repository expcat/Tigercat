import { Carousel } from '@expcat/tigercat-react/Carousel'

const slides = ['Slide 1 · 产品概览', 'Slide 2 · 关键能力', 'Slide 3 · 立即开始']

export default function App() {
  return (
    <Carousel autoplay autoplaySpeed={4000} arrows effect="fade" pauseOnHover>
      {slides.map((slide, index) => (
        <div
          key={slide}
          className="flex h-48 items-center justify-center rounded-lg bg-blue-600 text-xl font-semibold text-white">
          {slide}
        </div>
      ))}
    </Carousel>
  )
}
