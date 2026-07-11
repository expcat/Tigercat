import { Button } from '@expcat/tigercat-react/Button'
import { Space } from '@expcat/tigercat-react/Space'
import { useState, useRef } from 'react'
import { Carousel } from '@expcat/tigercat-react/Carousel'
import { type CarouselRef } from '@expcat/tigercat-react'

const slideColors = [
  'bg-gradient-to-r from-blue-500 to-blue-600',
  'bg-gradient-to-r from-green-500 to-green-600',
  'bg-gradient-to-r from-purple-500 to-purple-600',
  'bg-gradient-to-r from-orange-500 to-orange-600'
]

export default function App() {
  const [dotPosition, setDotPosition] = useState<'top' | 'bottom' | 'left' | 'right'>('bottom')

  const carouselRef = useRef<CarouselRef>(null)

  return (
    <>
      <div className="p-6 bg-gray-50 rounded-lg">
        <Carousel infinite={false} arrows>
          {slideColors.map((color, index) => (
            <div
              key={index}
              className={`${color} h-48 flex items-center justify-center text-white text-2xl font-bold rounded-lg`}>
              Slide {index + 1}
            </div>
          ))}
        </Carousel>
      </div>
    </>
  )
}
