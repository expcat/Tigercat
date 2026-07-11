import { AnchorLink } from '@expcat/tigercat-react/AnchorLink'
import { useRef, useState } from 'react'
import { Anchor } from '@expcat/tigercat-react/Anchor'

// Get the main scroll container from the layout
const getMainContainer = () => {
  // The layout uses a scrollable div inside main
  const scrollContainer = document.querySelector('main > div.overflow-y-auto')
  return (scrollContainer as HTMLElement) || window
}

export default function App() {
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Use getElementById to always get fresh DOM reference (handles HMR)
  const getScrollContainer = () => document.getElementById('custom-scroll-container') || window

  const handleChange = (href: string) => {
    console.log('Anchor changed:', href)
  }

  const [lastEvent, setLastEvent] = useState('')

  const handleDemoClick = (_e: React.MouseEvent, href: string) => {
    setLastEvent(`点击: ${href}`)
  }

  const handleDemoChange = (activeLink: string) => {
    window.setTimeout(() => setLastEvent(`激活: ${activeLink}`), 0)
  }

  return (
    <>
      <div className="p-6 bg-gray-50 rounded-lg">
        <div className="flex gap-4">
          <div
            id="custom-scroll-container"
            ref={scrollContainerRef}
            className="flex-1 h-64 overflow-auto border border-gray-200 rounded-lg bg-white">
            <div id="target-section1" className="p-4 h-48 bg-blue-50">
              <h3 className="font-semibold text-blue-700">Section 1</h3>
              <p className="text-gray-600 mt-2">这是 Section 1 的内容区域。</p>
            </div>
            <div id="target-section2" className="p-4 h-48 bg-green-50">
              <h3 className="font-semibold text-green-700">Section 2</h3>
              <p className="text-gray-600 mt-2">这是 Section 2 的内容区域。</p>
            </div>
            <div id="target-section3" className="p-4 h-48 bg-purple-50">
              <h3 className="font-semibold text-purple-700">Section 3</h3>
              <p className="text-gray-600 mt-2">这是 Section 3 的内容区域。</p>
            </div>
            <div id="target-section4" className="p-4 h-48 bg-orange-50">
              <h3 className="font-semibold text-orange-700">Section 4</h3>
              <p className="text-gray-600 mt-2">这是 Section 4 的内容区域。</p>
            </div>
          </div>
          <div className="w-40">
            <Anchor getContainer={getScrollContainer}>
              <AnchorLink href="#target-section1" title="Section 1" />
              <AnchorLink href="#target-section2" title="Section 2" />
              <AnchorLink href="#target-section3" title="Section 3" />
              <AnchorLink href="#target-section4" title="Section 4" />
            </Anchor>
          </div>
        </div>
      </div>
    </>
  )
}
