<script setup lang="ts">
import { Avatar } from '@expcat/tigercat-vue/Avatar'
import { Icon } from '@expcat/tigercat-vue/Icon'
</script>

<template>
  <div class="flex flex-wrap items-center gap-3">
    <Avatar src="https://i.pravatar.cc/150?img=12" alt="Jane Doe" />
    <Avatar text="Jane Doe" />
    <Avatar text="张三" />
    <Avatar>
      <Icon name="user" />
    </Avatar>
    <Avatar
      text="TC"
      shape="square"
      bg-color="bg-[var(--tiger-primary,#2563eb)]"
      text-color="text-white" />
  </div>
</template>
