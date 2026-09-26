import { useState } from 'react'
import { Anchor } from '@expcat/tigercat-react/Anchor'
import { AnchorLink } from '@expcat/tigercat-react/AnchorLink'

export default function App() {
  const [active, setActive] = useState('')

  return (
    <div className="space-y-2">
      <p className="text-xs text-gray-500">当前 {active || '（滚动或点锚点）'}</p>
      <div id="anchor-doc" className="h-80 overflow-auto rounded border">
        <div className="grid grid-cols-[minmax(0,1fr)_9rem] gap-4 p-4">
          <div className="space-y-4">
            <section id="anchor-overview" className="min-h-96 rounded bg-blue-50 p-4">
              <h3 className="font-semibold">概览</h3>
              <p className="mt-2 text-sm text-gray-500">这一节高于滚动区，下一节在视口外。</p>
            </section>
            <section id="anchor-api" className="min-h-96 rounded bg-green-50 p-4">
              <h3 className="font-semibold">API</h3>
              <p className="mt-2 text-sm text-gray-500">点「API」应滚到这里，并高亮该项。</p>
            </section>
            <section id="anchor-more" className="min-h-96 rounded bg-amber-50 p-4">
              <h3 className="font-semibold">更多</h3>
              <p className="mt-2 text-sm text-gray-500">继续下滚，墨水跟到「更多」。</p>
            </section>
          </div>
          <div className="self-start">
            <Anchor getContainer="#anchor-doc" offsetTop={8} onChange={setActive}>
              <AnchorLink href="#anchor-overview" title="概览" />
              <AnchorLink href="#anchor-api" title="API" />
              <AnchorLink href="#anchor-more" title="更多" />
            </Anchor>
          </div>
        </div>
      </div>
    </div>
  )
}
