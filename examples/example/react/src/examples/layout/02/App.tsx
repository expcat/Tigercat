import { Container } from '@expcat/tigercat-react/Container'

const box =
  'rounded border border-[var(--tiger-border)] bg-[var(--tiger-surface-muted)] p-3 text-sm'

export default function App() {
  return (
    <div className="space-y-3">
      <Container maxWidth={false} className={box}>
        maxWidth=false：无 max-width，仍 width 100%
      </Container>
      <Container maxWidth="full" className={box}>
        maxWidth=&quot;full&quot;：max-width 100%
      </Container>
      <Container maxWidth="lg" className={box}>
        maxWidth=&quot;lg&quot;：max-width 跟 --tiger-breakpoint-lg
      </Container>
      <Container maxWidth="lg" padding={false} center={false} className={box}>
        padding 与 center 都关掉
      </Container>
    </div>
  )
}
