import { useState, useRef } from 'react'
import { Carousel, Button, Space, type CarouselRef } from '@expcat/tigercat-react'
import DemoBlock from '../components/DemoBlock'

const basicSnippet = `<Carousel>
  <div className="slide">Slide 1</div>
  <div className="slide">Slide 2</div>
  <div className="slide">Slide 3</div>
</Carousel>`

const arrowsSnippet = `<Carousel arrows>
  <div className="slide">Slide 1</div>
  <div className="slide">Slide 2</div>
</Carousel>`

const autoplaySnippet = `<Carousel autoplay autoplaySpeed={3000} pauseOnHover>
  <div className="slide">Slide 1</div>
  <div className="slide">Slide 2</div>
</Carousel>`

const fadeSnippet = `<Carousel effect="fade" arrows>
  <div className="slide">Slide 1</div>
  <div className="slide">Slide 2</div>
</Carousel>`

const dotPositionSnippet = `<Carousel dotPosition={position}>
  <div className="slide">Slide 1</div>
  <div className="slide">Slide 2</div>
</Carousel>`

const nonInfiniteSnippet = `<Carousel infinite={false} arrows>
  <div className="slide">Slide 1</div>
  <div className="slide">Slide 2</div>
  <div className="slide">Slide 3</div>
</Carousel>`

const imperativeSnippet = `const carouselRef = useRef<CarouselRef>(null)

<Carousel ref={carouselRef}>
  <div className="slide">Slide 1</div>
  <div className="slide">Slide 2</div>
  <div className="slide">Slide 3</div>
</Carousel>
<Space>
  <Button onClick={() => carouselRef.current?.prev()}>Prev</Button>
  <Button onClick={() => carouselRef.current?.next()}>Next</Button>
  <Button onClick={() => carouselRef.current?.goTo(0)}>Go to First</Button>
</Space>`

const slideColors = [
  'bg-gradient-to-r from-blue-500 to-blue-600',
  'bg-gradient-to-r from-green-500 to-green-600',
  'bg-gradient-to-r from-purple-500 to-purple-600',
  'bg-gradient-to-r from-orange-500 to-orange-600'
]

export default function CarouselDemo() {
  const [dotPosition, setDotPosition] = useState<'top' | 'bottom' | 'left' | 'right'>('bottom')
  const carouselRef = useRef<CarouselRef>(null)

  return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Carousel 轮播图</h1>
        <p className="text-gray-600">轮播组件，用于展示图片、卡片等内容。</p>
      </div>

      <DemoBlock
        title="基本用法"
        description="最简单的轮播图，通过点击导航点切换。"
        code={basicSnippet}>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Carousel>
            {slideColors.map((color, index) => (
              <div
                key={index}
                className={`${color} h-48 flex items-center justify-center text-white text-2xl font-bold rounded-lg`}>
                Slide {index + 1}
              </div>
            ))}
          </Carousel>
        </div>
      </DemoBlock>

      <DemoBlock title="带箭头" description="显示前进后退箭头。" code={arrowsSnippet}>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Carousel arrows>
            {slideColors.map((color, index) => (
              <div
                key={index}
                className={`${color} h-48 flex items-center justify-center text-white text-2xl font-bold rounded-lg`}>
                Slide {index + 1}
              </div>
            ))}
          </Carousel>
        </div>
      </DemoBlock>

      <DemoBlock title="自动播放" description="自动切换，鼠标悬停时暂停。" code={autoplaySnippet}>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Carousel autoplay autoplaySpeed={3000} pauseOnHover arrows>
            {slideColors.map((color, index) => (
              <div
                key={index}
                className={`${color} h-48 flex items-center justify-center text-white text-2xl font-bold rounded-lg`}>
                Slide {index + 1}
              </div>
            ))}
          </Carousel>
          <p className="text-sm text-gray-500 mt-2">鼠标悬停在轮播图上会暂停自动播放</p>
        </div>
      </DemoBlock>

      <DemoBlock title="渐变效果" description="使用渐变切换效果。" code={fadeSnippet}>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Carousel effect="fade" arrows>
            {slideColors.map((color, index) => (
              <div
                key={index}
                className={`${color} h-48 flex items-center justify-center text-white text-2xl font-bold rounded-lg`}>
                Slide {index + 1}
              </div>
            ))}
          </Carousel>
        </div>
      </DemoBlock>

      <DemoBlock title="导航点位置" description="可以调整导航点的位置。" code={dotPositionSnippet}>
        <div className="p-6 bg-gray-50 rounded-lg">
          <div className="mb-4">
            <Space>
              {(['top', 'bottom', 'left', 'right'] as const).map((pos) => (
                <Button
                  key={pos}
                  variant={dotPosition === pos ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setDotPosition(pos)}>
                  {pos}
                </Button>
              ))}
            </Space>
          </div>
          <Carousel dotPosition={dotPosition} arrows>
            {slideColors.map((color, index) => (
              <div
                key={index}
                className={`${color} h-48 flex items-center justify-center text-white text-2xl font-bold rounded-lg`}>
                Slide {index + 1}
              </div>
            ))}
          </Carousel>
        </div>
      </DemoBlock>

      <DemoBlock
        title="非循环模式"
        description="关闭无限循环，到达边界时箭头自动禁用。"
        code={nonInfiniteSnippet}>
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
      </DemoBlock>

      <DemoBlock
        title="编程式控制"
        description="通过 ref 调用 next / prev / goTo 方法。"
        code={imperativeSnippet}>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Carousel ref={carouselRef}>
            {slideColors.map((color, index) => (
              <div
                key={index}
                className={`${color} h-48 flex items-center justify-center text-white text-2xl font-bold rounded-lg`}>
                Slide {index + 1}
              </div>
            ))}
          </Carousel>
          <div className="mt-4">
            <Space>
              <Button size="sm" onClick={() => carouselRef.current?.prev()}>
                Prev
              </Button>
              <Button size="sm" onClick={() => carouselRef.current?.next()}>
                Next
              </Button>
              <Button size="sm" onClick={() => carouselRef.current?.goTo(0)}>
                Go to First
              </Button>
            </Space>
          </div>
        </div>
      </DemoBlock>
    </div>
  )
}
