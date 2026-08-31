<script setup lang="ts">
import { Avatar } from '@expcat/tigercat-vue/Avatar'
import { AvatarGroup } from '@expcat/tigercat-vue/AvatarGroup'

const extra = false
</script>

<template>
  <div class="flex flex-col gap-4">
    <AvatarGroup :max="3" size="md">
      <Avatar src="https://i.pravatar.cc/150?img=21" alt="王一" />
      <Avatar src="https://i.pravatar.cc/150?img=22" alt="李敏" />
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
