import { VirtualList } from '@expcat/tigercat-react/VirtualList'

export default function App() {
  return (
    <VirtualList
      itemCount={10000}
      itemHeight={40}
      aria-label="Rows"
      renderItem={({ index }) => (
        <div
          className={
            index % 2 === 0
              ? 'flex h-full items-center px-4 bg-[var(--tiger-surface-muted,#f9fafb)]'
              : 'flex h-full items-center px-4'
          }>
          第 {index + 1} 行
        </div>
      )}
    />
  )
}
