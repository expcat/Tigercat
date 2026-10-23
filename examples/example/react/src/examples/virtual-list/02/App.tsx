import { VirtualList } from '@expcat/tigercat-react/VirtualList'

const getItemHeight = (index: number) => (index % 5 === 0 ? 64 : 40)

export default function App() {
  return (
    <VirtualList
      itemCount={2000}
      getItemHeight={getItemHeight}
      height={400}
      aria-label="Variable rows"
      renderItem={({ index }) => (
        <div className="flex items-center px-4" style={{ height: getItemHeight(index) }}>
          第 {index + 1} 行 · {getItemHeight(index)}px
        </div>
      )}
    />
  )
}
