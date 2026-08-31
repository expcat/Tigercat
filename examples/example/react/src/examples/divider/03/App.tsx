import { Divider } from '@expcat/tigercat-react/Divider'

const styles = ['solid', 'dashed', 'dotted', 'gradient'] as const

export default function App() {
  return (
    <div>
      {styles.map((lineStyle) => (
        <div key={lineStyle}>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            lineStyle=&quot;{lineStyle}&quot;
          </p>
          <Divider
            lineStyle={lineStyle}
            spacing="sm"
            color={lineStyle === 'gradient' ? '#7c3aed' : undefined}
            thickness={lineStyle === 'gradient' ? '3px' : undefined}
          />
        </div>
      ))}
    </div>
  )
}
