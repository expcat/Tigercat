import { Link } from '@expcat/tigercat-react/Link'

export default function App() {
  return (
    <div className="flex flex-col gap-3">
      <Link href="https://github.com" target="_blank" rel="nofollow" variant="primary" size="lg">
        在新窗口打开 GitHub
      </Link>
      <Link href="https://github.com/expcat/Tigercat" disabled>
        禁用仍是链接
      </Link>
    </div>
  )
}
