<script setup lang="ts">
import { ref } from 'vue'
import { NavigationMenu } from '@expcat/tigercat-vue/NavigationMenu'
import { NavigationMenuContent } from '@expcat/tigercat-vue/NavigationMenuContent'
import { NavigationMenuItem } from '@expcat/tigercat-vue/NavigationMenuItem'
import { NavigationMenuLink } from '@expcat/tigercat-vue/NavigationMenuLink'
import { NavigationMenuTrigger } from '@expcat/tigercat-vue/NavigationMenuTrigger'

const lastAction = ref('尚未选择')
</script>

<template>
  <div class="space-y-3">
    <NavigationMenu aria-label="产品导航">
      <NavigationMenuItem value="products">
        <NavigationMenuTrigger>产品</NavigationMenuTrigger>
        <NavigationMenuContent mega>
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-1">
              <p class="px-3 text-xs font-semibold uppercase tracking-wider text-gray-500">平台</p>
              <NavigationMenuLink href="#analytics" @click.prevent="lastAction = '分析'">
                分析
              </NavigationMenuLink>
              <NavigationMenuLink href="#automation" @click.prevent="lastAction = '自动化'">
                自动化
              </NavigationMenuLink>
            </div>
            <div class="space-y-1">
              <p class="px-3 text-xs font-semibold uppercase tracking-wider text-gray-500">资源</p>
              <NavigationMenuLink href="#cases" @click.prevent="lastAction = '案例'">
                案例
              </NavigationMenuLink>
              <NavigationMenuLink href="#blog" @click.prevent="lastAction = '博客'">
                博客
              </NavigationMenuLink>
            </div>
          </div>
        </NavigationMenuContent>
      </NavigationMenuItem>
      <NavigationMenuItem>
        <NavigationMenuLink href="#docs" @click.prevent="lastAction = '文档'">
          文档
        </NavigationMenuLink>
      </NavigationMenuItem>
    </NavigationMenu>
    <p class="text-sm text-gray-500">最近操作：{{ lastAction }}</p>
  </div>
</template>
