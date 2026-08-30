import { Link } from '@expcat/tigercat-react/Link'

export default function App() {
  return (
    <Link
      href="https://github.com/expcat/Tigercat"
      target="_blank"
      variant="default"
      onClick={() => {
        window.console.info('tracked navigation')
      }}>
      打开仓库（不拦截跳转）
    </Link>
  )
}
