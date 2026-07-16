import { Button } from '@expcat/tigercat-react/Button'
import { Tooltip } from '@expcat/tigercat-react/Tooltip'

const placements = ['top', 'bottom', 'left', 'right'] as const

export default function App() {
  return (
    <div className="flex flex-wrap gap-4 py-8 pl-12">
      {placements.map((placement) => (
        <Tooltip key={placement} content={`placement=${placement}`} placement={placement}>
          <Button variant="outline">{placement}</Button>
        </Tooltip>
      ))}
    </div>
  )
}
