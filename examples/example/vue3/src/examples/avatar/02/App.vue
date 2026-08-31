<script setup lang="ts">
import { ref } from 'vue'
import { Avatar } from '@expcat/tigercat-vue/Avatar'
import { Button } from '@expcat/tigercat-vue/Button'

const src = ref('/missing-avatar.jpg')
</script>

<template>
  <div class="flex flex-wrap items-center gap-3">
    <Avatar :src="src" text="Ada Lovelace" />
    <Button size="sm" variant="outline" @click="src = 'https://i.pravatar.cc/150?img=32'">
      换成有效地址
    </Button>
    <Avatar src="https://i.pravatar.cc/150?img=15" text="No Alt" />
  </div>
</template>
