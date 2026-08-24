import { VirtualList } from '@expcat/tigercat-react/VirtualList'

const virtualListStripeClasses =
  'bg-[var(--tiger-virtuallist-stripe,var(--tiger-surface-muted,#f9fafb))]'

export default function App() {
  return (
    <VirtualList
      itemCount={10000}
      itemHeight={40}
      height={300}
      overscan={10}
      renderItem={({ index }) => (
        <div
          className={
            index % 2 === 0
              ? `flex h-full items-center px-4 ${virtualListStripeClasses}`
              : 'flex h-full items-center px-4'
          }>
          第 {index + 1} 行
        </div>
      )}
    />
  )
}
