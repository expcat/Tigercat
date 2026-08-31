import { Tag } from '@expcat/tigercat-react/Tag'

const variants = ['default', 'primary', 'success', 'warning', 'danger', 'info'] as const

export default function App() {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {variants.map((variant) => (
          <Tag key={variant} variant={variant}>
            {variant}
          </Tag>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Tag variant="warning" size="sm">
          warning sm
        </Tag>
        <Tag variant="success" size="sm">
          success sm
        </Tag>
        <Tag pill variant="info">
          pill
        </Tag>
      </div>
    </div>
  )
}
