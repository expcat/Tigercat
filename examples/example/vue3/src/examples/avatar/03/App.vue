<script setup lang="ts">
import { Avatar } from '@expcat/tigercat-vue/Avatar'
import { AvatarGroup } from '@expcat/tigercat-vue/AvatarGroup'
</script>

<template>
  <AvatarGroup :max="3" size="md" aria-label="项目成员">
    <Avatar src="https://i.pravatar.cc/150?img=21" alt="成员：王一" />
    <Avatar src="https://i.pravatar.cc/150?img=22" alt="成员：李敏" />
    <Avatar text="陈晨" aria-label="成员：陈晨" />
    <Avatar text="赵六" aria-label="成员：赵六" />
  </AvatarGroup>
</template>
