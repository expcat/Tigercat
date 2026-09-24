import { Dropdown } from '@expcat/tigercat-react/Dropdown'
import { DropdownMenu } from '@expcat/tigercat-react/DropdownMenu'
import { DropdownItem } from '@expcat/tigercat-react/DropdownItem'

export default function App() {
  return (
    <Dropdown>
      操作
      <DropdownMenu>
        <DropdownItem>编辑</DropdownItem>
        <DropdownItem>固定</DropdownItem>
        <DropdownItem>删除</DropdownItem>
      </DropdownMenu>
    </Dropdown>
  )
}
