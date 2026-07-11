<script setup lang="ts">
import { Avatar } from '@expcat/tigercat-vue/Avatar'
import { AvatarGroup } from '@expcat/tigercat-vue/AvatarGroup'
import { Space } from '@expcat/tigercat-vue/Space'
import { Badge } from '@expcat/tigercat-vue/Badge'
</script>

<template>
  <div class="min-w-0">
    <Space>
      <Avatar text="默认" />
      <Avatar text="主" bg-color="bg-[var(--tiger-primary,#2563eb)]" text-color="text-white" />
      <Avatar text="次" bg-color="bg-[var(--tiger-secondary,#4b5563)]" text-color="text-white" />
    </Space>
  </div>
</template>
