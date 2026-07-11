<script setup lang="ts">
import { Divider } from '@expcat/tigercat-vue/Divider'
</script>

<template>
  <div class="min-w-0">
    <div class="p-6 bg-gray-50 rounded-lg space-y-4">
      <div>
        <div class="text-gray-700 mb-2">solid</div>
        <Divider line-style="solid" />
      </div>
      <div>
        <div class="text-gray-700 mb-2">dashed</div>
        <Divider line-style="dashed" />
      </div>
      <div>
        <div class="text-gray-700 mb-2">dotted</div>
        <Divider line-style="dotted" />
      </div>
    </div>
  </div>
</template>
