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
    <NavigationMenu aria-label="主导航">
      <NavigationMenuItem value="products">
        <NavigationMenuTrigger>产品</NavigationMenuTrigger>
        <NavigationMenuContent>
          <NavigationMenuLink href="#overview" @click.prevent="lastAction = '概述'">
            概述
          </NavigationMenuLink>
          <NavigationMenuLink href="#pricing" @click.prevent="lastAction = '定价'">
            定价
          </NavigationMenuLink>
        </NavigationMenuContent>
      </NavigationMenuItem>
      <NavigationMenuItem value="docs">
        <NavigationMenuTrigger>文档</NavigationMenuTrigger>
        <NavigationMenuContent>
          <NavigationMenuLink href="#guide" @click.prevent="lastAction = '指南'">
            指南
          </NavigationMenuLink>
          <NavigationMenuLink href="#api" @click.prevent="lastAction = 'API'">
            API
          </NavigationMenuLink>
        </NavigationMenuContent>
      </NavigationMenuItem>
      <NavigationMenuItem>
        <NavigationMenuLink href="#about" @click.prevent="lastAction = '关于'">
          关于
        </NavigationMenuLink>
      </NavigationMenuItem>
    </NavigationMenu>
    <p class="text-sm text-gray-500">最近操作：{{ lastAction }}</p>
  </div>
</template>
