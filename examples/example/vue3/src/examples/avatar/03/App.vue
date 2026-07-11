<script setup lang="ts">
import { Avatar } from '@expcat/tigercat-vue/Avatar'
import { AvatarGroup } from '@expcat/tigercat-vue/AvatarGroup'
import { Space } from '@expcat/tigercat-vue/Space'
import { Badge } from '@expcat/tigercat-vue/Badge'
</script>

<template>
  <div class="min-w-0">
    <Space>
      <Avatar text="Alice" />
      <Avatar text="Bob Smith" />
      <Avatar text="John Doe" />
      <Avatar text="张三" />
      <Avatar text="李明华" />
    </Space>
  </div>
</template>
