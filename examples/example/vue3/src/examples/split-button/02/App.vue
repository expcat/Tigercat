<script setup lang="ts">
import { SplitButton } from '@expcat/tigercat-vue/SplitButton'
import { DropdownItem } from '@expcat/tigercat-vue/DropdownItem'
import { DropdownMenu } from '@expcat/tigercat-vue/DropdownMenu'
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-center gap-3">
      <SplitButton variant="primary">
        Primary
        <DropdownMenu>
          <DropdownItem>次要操作</DropdownItem>
          <DropdownItem divided>更多</DropdownItem>
        </DropdownMenu>
      </SplitButton>
      <SplitButton variant="secondary">
        Secondary
        <DropdownMenu>
          <DropdownItem>次要操作</DropdownItem>
          <DropdownItem divided>更多</DropdownItem>
        </DropdownMenu>
      </SplitButton>
      <SplitButton variant="outline">
        Outline
        <DropdownMenu>
          <DropdownItem>次要操作</DropdownItem>
          <DropdownItem divided>更多</DropdownItem>
        </DropdownMenu>
      </SplitButton>
    </div>
    <div class="flex flex-wrap items-center gap-3">
      <SplitButton size="sm">
        Small
        <DropdownMenu>
          <DropdownItem>次要操作</DropdownItem>
        </DropdownMenu>
      </SplitButton>
      <SplitButton size="md">
        Medium
        <DropdownMenu>
          <DropdownItem>次要操作</DropdownItem>
        </DropdownMenu>
      </SplitButton>
      <SplitButton size="lg">
        Large
        <DropdownMenu>
          <DropdownItem>次要操作</DropdownItem>
        </DropdownMenu>
      </SplitButton>
    </div>
    <div class="flex flex-wrap items-center gap-3">
      <SplitButton disabled>
        Disabled
        <DropdownMenu>
          <DropdownItem>次要操作</DropdownItem>
        </DropdownMenu>
      </SplitButton>
      <SplitButton loading>
        Loading
        <DropdownMenu>
          <DropdownItem>次要操作</DropdownItem>
        </DropdownMenu>
      </SplitButton>
    </div>
  </div>
</template>
