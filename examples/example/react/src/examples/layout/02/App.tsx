import { Layout } from '@expcat/tigercat-react/Layout'
import { Header } from '@expcat/tigercat-react/Header'
import { Content } from '@expcat/tigercat-react/Content'
import { Footer } from '@expcat/tigercat-react/Footer'

export default function App() {
  return (
    <Layout className="min-h-64 overflow-hidden rounded border border-gray-300">
      <Header className="!bg-blue-600 !p-4 !text-white">Header</Header>
      <Content className="!bg-white !p-4">Content</Content>
      <Footer className="!bg-gray-800 !p-4 !text-white">Footer</Footer>
    </Layout>
  )
}
