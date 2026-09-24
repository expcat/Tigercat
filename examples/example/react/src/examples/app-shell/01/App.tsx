import { useState } from 'react'
import { AppShell } from '@expcat/tigercat-react'

const routes = [
  { key: 'home', title: 'Home' },
  { key: 'list', title: 'List' }
]

export default function App() {
  const [active, setActive] = useState('home')
  return (
    <AppShell
      title="Home"
      headerSticky
      tabs={routes}
      activeTab={active}
      onTabChange={setActive}
      breadcrumb={[{ title: 'Home' }]}
      sidebar={<span>Menu</span>}>
      <p>{active}</p>
    </AppShell>
  )
}
