import React, { useState } from 'react'
import { Inplace } from '@expcat/tigercat-react/Inplace'

export default function App() {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState('行内标题')
  return (
    <Inplace
      editing={editing}
      onEditingChange={setEditing}
      display={value}
      input={
        <input
          aria-label="编辑标题"
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
      }
    />
  )
}
