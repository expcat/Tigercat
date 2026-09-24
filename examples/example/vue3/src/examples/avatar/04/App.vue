<script setup lang="ts">
import { Avatar } from '@expcat/tigercat-vue/Avatar'
import { AvatarGroup } from '@expcat/tigercat-vue/AvatarGroup'
</script>

<template>
  <AvatarGroup :max="2">
    <Avatar text="安" />
    <Avatar text="柏" />
    <Avatar text="陈" />
    <Avatar alt="丁" />
  </AvatarGroup>
</template>
