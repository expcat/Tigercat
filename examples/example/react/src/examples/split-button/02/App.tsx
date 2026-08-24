import { SplitButton } from '@expcat/tigercat-react/SplitButton'
import { DropdownItem } from '@expcat/tigercat-react/DropdownItem'
import { DropdownMenu } from '@expcat/tigercat-react/DropdownMenu'

function Menu() {
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
          <Menu />
        </SplitButton>
        <SplitButton variant="secondary">
          Secondary
          <Menu />
        </SplitButton>
        <SplitButton variant="outline">
          Outline
          <Menu />
        </SplitButton>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <SplitButton size="sm">
          Small
          <Menu />
        </SplitButton>
        <SplitButton size="md">
          Medium
          <Menu />
        </SplitButton>
        <SplitButton size="lg">
          Large
          <Menu />
        </SplitButton>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <SplitButton disabled>
          Disabled
          <Menu />
        </SplitButton>
        <SplitButton loading>
          Loading
          <Menu />
        </SplitButton>
      </div>
    </div>
  )
}
