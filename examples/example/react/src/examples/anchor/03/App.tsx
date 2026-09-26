import { Anchor } from '@expcat/tigercat-react/Anchor'
import { AnchorLink } from '@expcat/tigercat-react/AnchorLink'

export default function App() {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_11rem] gap-4">
      <div id="anchor-guide" className="h-80 overflow-auto rounded border">
        <section id="guide" className="min-h-96 bg-blue-50 p-4">
          <h3 className="font-semibold">指南</h3>
        </section>
        <section id="guide-install" className="min-h-96 bg-blue-50/60 p-4">
          <h3 className="font-semibold">安装</h3>
        </section>
        <section id="guide-theme" className="min-h-96 bg-blue-50/40 p-4">
          <h3 className="font-semibold">主题</h3>
        </section>
        <section id="api-reference" className="min-h-96 bg-green-50 p-4">
          <h3 className="font-semibold">API 参考</h3>
        </section>
      </div>
      <Anchor affix={false} getContainer="#anchor-guide">
        <AnchorLink href="#guide" title="指南">
          <AnchorLink href="#guide-install" title="安装" />
          <AnchorLink href="#guide-theme" title="主题" />
        </AnchorLink>
        <AnchorLink href="#api-reference" title="API 参考" />
      </Anchor>
    </div>
  )
}
