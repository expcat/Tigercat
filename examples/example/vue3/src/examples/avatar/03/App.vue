<script setup lang="ts">
import { Avatar } from '@expcat/tigercat-vue/Avatar'
import { AvatarGroup } from '@expcat/tigercat-vue/AvatarGroup'

const firstSrc = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><rect width="128" height="128" fill="#dbeafe"/><path d="M12 128v-16a52 52 0 0 1 104 0v16" fill="#2563eb"/><path d="M32 70V44a32 32 0 0 1 64 0v26" fill="#334155"/><circle cx="64" cy="53" r="24" fill="#f4c7a1"/><path d="M40 44c0-30 48-30 48 0L64 30Z" fill="#334155"/></svg>'
)}`
const secondSrc = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><rect width="128" height="128" fill="#ccfbf1"/><path d="M12 128v-16a52 52 0 0 1 104 0v16" fill="#0f766e"/><circle cx="64" cy="53" r="25" fill="#b87850"/><path d="M38 48V37c0-31 52-31 52 0v11L74 31Z" fill="#292524"/></svg>'
)}`

const extra = false
</script>

<template>
  <div class="flex flex-col gap-4">
    <AvatarGroup :max="3" size="md">
      <Avatar :src="firstSrc" alt="王一" />
      <Avatar :src="secondSrc" alt="李敏" />
      <Avatar text="陈晨" />
      <Avatar text="赵六" />
    </AvatarGroup>
    <div dir="rtl">
      <AvatarGroup :max="3">
        <Avatar text="A" />
        <Avatar text="B" />
        <Avatar text="C" />
      </AvatarGroup>
    </div>
    <AvatarGroup :max="2">
      <Avatar text="A" />
      <Avatar v-if="extra" text="Hidden" />
      <Avatar text="B" />
      <Avatar text="C" />
    </AvatarGroup>
    <AvatarGroup :max="0" shape="square">
      <Avatar text="方" />
      <Avatar text="形" />
    </AvatarGroup>
  </div>
</template>
