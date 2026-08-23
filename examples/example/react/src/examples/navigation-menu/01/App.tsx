import { useState } from 'react'
import { NavigationMenu } from '@expcat/tigercat-react/NavigationMenu'
import { NavigationMenuContent } from '@expcat/tigercat-react/NavigationMenuContent'
import { NavigationMenuItem } from '@expcat/tigercat-react/NavigationMenuItem'
import { NavigationMenuLink } from '@expcat/tigercat-react/NavigationMenuLink'
import { NavigationMenuTrigger } from '@expcat/tigercat-react/NavigationMenuTrigger'

export default function App() {
  const [lastAction, setLastAction] = useState('尚未选择')

  return (
    <div className="space-y-3">
      <NavigationMenu>
        <NavigationMenuItem value="products">
          <NavigationMenuTrigger>产品</NavigationMenuTrigger>
          <NavigationMenuContent>
            <NavigationMenuLink onClick={() => setLastAction('概述')}>概述</NavigationMenuLink>
            <NavigationMenuLink onClick={() => setLastAction('定价')}>定价</NavigationMenuLink>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem value="docs">
          <NavigationMenuTrigger>文档</NavigationMenuTrigger>
          <NavigationMenuContent>
            <NavigationMenuLink onClick={() => setLastAction('指南')}>指南</NavigationMenuLink>
            <NavigationMenuLink onClick={() => setLastAction('API')}>API</NavigationMenuLink>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink
            href="#about"
            onClick={(event) => {
              event.preventDefault()
              setLastAction('关于')
            }}>
            关于
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenu>
      <p className="text-sm text-gray-500">最近操作：{lastAction}</p>
    </div>
  )
}
