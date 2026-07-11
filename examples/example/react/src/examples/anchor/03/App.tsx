import { Anchor } from '@expcat/tigercat-react/Anchor'
import { AnchorLink } from '@expcat/tigercat-react/AnchorLink'

export default function App() {
  return (
    <Anchor affix={false} showInkInFixed>
      <AnchorLink href="#guide" title="指南">
        <AnchorLink href="#guide-install" title="安装" />
        <AnchorLink href="#guide-theme" title="主题" />
      </AnchorLink>
      <AnchorLink href="#api-reference" title="API 参考" />
    </Anchor>
  )
}
