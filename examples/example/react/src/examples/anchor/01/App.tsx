import { Anchor } from '@expcat/tigercat-react/Anchor'
import { AnchorLink } from '@expcat/tigercat-react/AnchorLink'

export default function App() {
  return (
    <div className="grid gap-4 md:grid-cols-[1fr_160px]">
      <div className="space-y-3">
        <section id="anchor-overview" className="min-h-32 rounded bg-blue-50 p-4">
          <h3 className="font-semibold">概览</h3>
        </section>
        <section id="anchor-api" className="min-h-32 rounded bg-green-50 p-4">
          <h3 className="font-semibold">API</h3>
        </section>
      </div>
      <Anchor affix={false} direction="vertical">
        <AnchorLink href="#anchor-overview" title="概览" />
        <AnchorLink href="#anchor-api" title="API" />
      </Anchor>
    </div>
  )
}
