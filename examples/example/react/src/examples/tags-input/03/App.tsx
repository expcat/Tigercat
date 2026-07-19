import { TagsInput } from '@expcat/tigercat-react/TagsInput'

export default function App() {
  return (
    <div className="w-full max-w-md space-y-4">
      <TagsInput defaultValue={['sm']} size="sm" clearable placeholder="小尺寸" />
      <TagsInput defaultValue={['warn']} size="md" status="warning" clearable placeholder="警告态" />
      <TagsInput
        defaultValue={['error']}
        size="lg"
        status="error"
        errorMessage="至少保留一个标签"
        clearable
      />
    </div>
  )
}
