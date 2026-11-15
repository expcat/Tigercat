import { FormItem } from '@expcat/tigercat-react/FormItem'
import { TagsInput } from '@expcat/tigercat-react/TagsInput'

export default function App() {
  return (
    <div className="w-full max-w-md space-y-4">
      <TagsInput
        aria-label="小尺寸标签"
        defaultValue={['sm']}
        size="sm"
        clearable
        placeholder="小尺寸"
      />
      <TagsInput
        aria-label="警告态标签"
        defaultValue={['warn']}
        size="md"
        status="warning"
        clearable
        placeholder="警告态"
      />
      <FormItem label="标签" error="至少保留一个标签">
        <TagsInput defaultValue={['error']} size="lg" clearable />
      </FormItem>
    </div>
  )
}
