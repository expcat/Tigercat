<script setup lang="ts">
import { Avatar } from '@expcat/tigercat-vue/Avatar'
import { AvatarGroup } from '@expcat/tigercat-vue/AvatarGroup'
import { Space } from '@expcat/tigercat-vue/Space'
import { Badge } from '@expcat/tigercat-vue/Badge'
</script>

<template>
  <div class="min-w-0">
    <Space>
      <div>
        <p class="text-sm text-gray-600 mb-2 text-center">圆形</p>
        <Avatar shape="circle" text="圆形" />
      </div>
      <div>
        <p class="text-sm text-gray-600 mb-2 text-center">方形</p>
        <Avatar shape="square" text="方形" />
      </div>
    </Space>
  </div>
</template>
