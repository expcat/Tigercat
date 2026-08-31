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
      <NavigationMenu aria-label="产品导航">
        <NavigationMenuItem value="products">
          <NavigationMenuTrigger>产品</NavigationMenuTrigger>
          <NavigationMenuContent mega>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="px-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  平台
                </p>
                <NavigationMenuLink
                  href="#analytics"
                  onClick={(event) => {
                    event.preventDefault()
                    setLastAction('分析')
                  }}>
                  分析
                </NavigationMenuLink>
                <NavigationMenuLink
                  href="#automation"
                  onClick={(event) => {
                    event.preventDefault()
                    setLastAction('自动化')
                  }}>
                  自动化
                </NavigationMenuLink>
              </div>
              <div className="space-y-1">
                <p className="px-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  资源
                </p>
                <NavigationMenuLink
                  href="#cases"
                  onClick={(event) => {
                    event.preventDefault()
                    setLastAction('案例')
                  }}>
                  案例
                </NavigationMenuLink>
                <NavigationMenuLink
                  href="#blog"
                  onClick={(event) => {
                    event.preventDefault()
                    setLastAction('博客')
                  }}>
                  博客
                </NavigationMenuLink>
              </div>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink
            href="#docs"
            onClick={(event) => {
              event.preventDefault()
              setLastAction('文档')
            }}>
            文档
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenu>
      <p className="text-sm text-gray-500">最近操作：{lastAction}</p>
    </div>
  )
}
