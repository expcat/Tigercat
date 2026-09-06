import { Layout } from '@expcat/tigercat-react/Layout'
import { Header } from '@expcat/tigercat-react/Header'
import { Content } from '@expcat/tigercat-react/Content'
import { Footer } from '@expcat/tigercat-react/Footer'

const longCopy = Array.from(
  { length: 10 },
  (_, i) => `段落 ${i + 1}：这段会跟着 Content 一起滚。`
).join(' ')

export default function App() {
  return (
    <div className="space-y-4">
      <Layout className="h-48 overflow-hidden rounded border border-[var(--tiger-border)]">
        <Header>随内容滚动</Header>
        <Content as="div">
          <p>{longCopy}</p>
          <Footer size="compact">© Tigercat · 紧凑页脚在 Content 内</Footer>
        </Content>
      </Layout>
      <Layout className="h-48 overflow-hidden rounded border border-[var(--tiger-border)]">
        <Header>固定页脚</Header>
        <Content as="div">
          <p>{longCopy}</p>
        </Content>
        <Footer size="compact">© Tigercat · 紧凑固定页脚</Footer>
      </Layout>
    </div>
  )
}
