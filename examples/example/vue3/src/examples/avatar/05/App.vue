<script setup lang="ts">
import { Avatar } from '@expcat/tigercat-vue/Avatar'
import { AvatarGroup } from '@expcat/tigercat-vue/AvatarGroup'
import { Space } from '@expcat/tigercat-vue/Space'
import { Badge } from '@expcat/tigercat-vue/Badge'
</script>

<template>
  <div class="min-w-0">
    <Space align="center">
      <Avatar size="sm" text="SM" />
      <Avatar size="md" text="MD" />
      <Avatar size="lg" text="LG" />
      <Avatar size="xl" text="XL" />
    </Space>
  </div>
</template>
