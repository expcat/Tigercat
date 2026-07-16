import { Divider } from '@expcat/tigercat-react/Divider'

const styles = ['solid', 'dashed', 'dotted', 'gradient'] as const

export default function App() {
  return (
    <div>
      {styles.map((lineStyle) => (
        <div key={lineStyle}>
          <p className="text-sm text-gray-500">lineStyle=&quot;{lineStyle}&quot;</p>
          <Divider lineStyle={lineStyle} spacing="sm" />
        </div>
      ))}
    </div>
  )
}
