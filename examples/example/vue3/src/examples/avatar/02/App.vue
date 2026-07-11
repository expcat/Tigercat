<script setup lang="ts">
import { Avatar } from '@expcat/tigercat-vue/Avatar'
import { AvatarGroup } from '@expcat/tigercat-vue/AvatarGroup'
import { Space } from '@expcat/tigercat-vue/Space'
import { Badge } from '@expcat/tigercat-vue/Badge'
</script>

<template>
  <div class="min-w-0">
    <Space>
      <Avatar src="/does-not-exist.jpg" text="回退" alt="加载失败回退" />
      <Avatar text="无图" />
    </Space>
  </div>
</template>
