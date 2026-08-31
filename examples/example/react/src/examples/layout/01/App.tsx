import { Layout } from '@expcat/tigercat-react/Layout'
import { Header } from '@expcat/tigercat-react/Header'
import { Content } from '@expcat/tigercat-react/Content'
import { Footer } from '@expcat/tigercat-react/Footer'

const longCopy = Array.from(
  { length: 12 },
  (_, i) => `段落 ${i + 1}：固定高度里由 Content 自己滚动。`
).join(' ')

export default function App() {
  return (
    <div className="space-y-4">
      <Layout className="h-56 overflow-hidden rounded border border-[var(--tiger-border)]">
        <Header>默认顶栏</Header>
        <Content>
          <p>{longCopy}</p>
        </Content>
        <Footer>默认页脚</Footer>
      </Layout>
      <Layout className="h-56 overflow-hidden rounded border border-[var(--tiger-border)]">
        <Header variant="blur">玻璃顶栏</Header>
        <Content as="div">
          <p>{longCopy}</p>
        </Content>
      </Layout>
    </div>
  )
}
