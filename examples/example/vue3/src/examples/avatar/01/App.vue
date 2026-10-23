<script setup lang="ts">
import { Avatar } from '@expcat/tigercat-vue/Avatar'
import { Icon } from '@expcat/tigercat-vue/Icon'

const avatarSrc = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><rect width="128" height="128" fill="#dbeafe"/><path d="M12 128v-16a52 52 0 0 1 104 0v16" fill="#2563eb"/><path d="M32 70V44a32 32 0 0 1 64 0v26" fill="#334155"/><circle cx="64" cy="53" r="24" fill="#f4c7a1"/><path d="M40 44c0-30 48-30 48 0L64 30Z" fill="#334155"/></svg>'
)}`
</script>

<template>
  <div class="flex flex-wrap items-center gap-3">
    <Avatar :src="avatarSrc" alt="Jane Doe" />
    <Avatar text="Jane Doe" />
    <Avatar text="张三" />
    <Avatar>
      <Icon name="user" />
    </Avatar>
    <Avatar text="TC" shape="square" bg-color="primary" text-color="#ffffff" />
  </div>
</template>
