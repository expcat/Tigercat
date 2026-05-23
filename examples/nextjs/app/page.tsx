import { TigercatClientSurface } from './tigercat-client-surface'

export default function Page() {
  return (
    <main className="ssr-shell">
      <section className="ssr-panel">
        <p className="eyebrow">Next.js SSR</p>
        <h1>Tigercat React SSR smoke page</h1>
        <p className="copy">
          This server route renders a client boundary containing Tigercat React components so Next
          can pre-render and hydrate the same tree.
        </p>
      </section>
      <TigercatClientSurface />
    </main>
  )
}
