import { Tag } from '@expcat/tigercat-react/Tag'

const variants = ['default', 'primary', 'success', 'warning', 'danger', 'info'] as const

export default function App() {
  return (
    <div className="flex flex-wrap gap-2">
      {variants.map((variant) => (
        <Tag key={variant} variant={variant}>
          {variant}
        </Tag>
      ))}
    </div>
  )
}
