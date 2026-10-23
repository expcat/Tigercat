<script setup lang="ts">
import { ref } from 'vue'
import { Avatar } from '@expcat/tigercat-vue/Avatar'
import { Button } from '@expcat/tigercat-vue/Button'

const validSrc = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><rect width="128" height="128" fill="#fce7f3"/><path d="M12 128v-16a52 52 0 0 1 104 0v16" fill="#be185d"/><path d="M30 76V43a34 34 0 0 1 68 0v33" fill="#78350f"/><circle cx="64" cy="53" r="24" fill="#f4c7a1"/><path d="M40 44c0-30 48-30 48 0L64 30Z" fill="#78350f"/></svg>'
)}`
const avatarSrc = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><rect width="128" height="128" fill="#ccfbf1"/><path d="M12 128v-16a52 52 0 0 1 104 0v16" fill="#0f766e"/><circle cx="64" cy="53" r="25" fill="#b87850"/><path d="M38 48V37c0-31 52-31 52 0v11L74 31Z" fill="#292524"/></svg>'
)}`

const src = ref('/missing-avatar.jpg')
</script>

<template>
  <div class="flex flex-wrap items-center gap-3">
    <Avatar :src="src" text="Ada Lovelace" />
    <Button size="sm" variant="outline" @click="src = validSrc"> 换成有效地址 </Button>
    <Avatar :src="avatarSrc" text="No Alt" />
  </div>
</template>
