import { LoadingBarContainer } from '@expcat/tigercat-react/LoadingBarContainer'

export default function App() {
  return (
    <div>
      <LoadingBarContainer percentage={60} status="loading" />
      <p>受控加载进度：60%</p>
    </div>
  )
}
