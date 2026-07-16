<script setup lang="ts">
import { Button } from '@expcat/tigercat-vue/Button'
import { Tooltip } from '@expcat/tigercat-vue/Tooltip'

const placements = ['top', 'bottom', 'left', 'right'] as const
</script>

<template>
  <div class="flex flex-wrap gap-4 py-8 pl-12">
    <Tooltip v-for="placement in placements" :key="placement" :content="`placement=${placement}`" :placement="placement">
      <Button variant="outline">{{ placement }}</Button>
    </Tooltip>
  </div>
</template>
