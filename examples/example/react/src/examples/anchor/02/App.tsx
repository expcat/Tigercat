import { Anchor } from '@expcat/tigercat-react/Anchor'
import { AnchorLink } from '@expcat/tigercat-react/AnchorLink'

export default function App() {
  return (
    <div className="grid gap-4 md:grid-cols-[1fr_160px]">
      <div id="anchor-scroll-container" className="h-64 overflow-auto rounded border">
        <section id="anchor-audit" className="h-52 bg-blue-50 p-4">
          审计
        </section>
        <section id="anchor-release" className="h-52 bg-green-50 p-4">
          发布
        </section>
      </div>
      <Anchor affix={false} getContainer="#anchor-scroll-container" direction="horizontal">
        <AnchorLink href="#anchor-audit" title="审计" />
        <AnchorLink href="#anchor-release" title="发布" />
      </Anchor>
    </div>
  )
}
