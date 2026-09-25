import { SplitButton } from '@expcat/tigercat-react/SplitButton'
import { DropdownItem } from '@expcat/tigercat-react/DropdownItem'
import { DropdownMenu } from '@expcat/tigercat-react/DropdownMenu'

function menu() {
  return (
    <DropdownMenu>
      <DropdownItem>次要操作</DropdownItem>
      <DropdownItem divided>更多</DropdownItem>
    </DropdownMenu>
  )
}

export default function App() {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <SplitButton variant="primary">
          Primary
          {menu()}
        </SplitButton>
        <SplitButton variant="secondary">
          Secondary
          {menu()}
        </SplitButton>
        <SplitButton variant="outline">
          Outline
          {menu()}
        </SplitButton>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <SplitButton size="sm">
          Small
          {menu()}
        </SplitButton>
        <SplitButton size="md">
          Medium
          {menu()}
        </SplitButton>
        <SplitButton size="lg">
          Large
          {menu()}
        </SplitButton>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <SplitButton disabled>
          Disabled
          {menu()}
        </SplitButton>
        <SplitButton loading>
          Loading
          {menu()}
        </SplitButton>
      </div>
    </div>
  )
}
