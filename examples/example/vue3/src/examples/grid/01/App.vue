<script setup lang="ts">
import { Row } from '@expcat/tigercat-vue/Row'
import { Col } from '@expcat/tigercat-vue/Col'
</script>

<template>
  <div class="rounded border border-[var(--tiger-border)] p-3">
    <Row :gutter="[16, 16]">
      <Col v-for="item in 3" :key="item" :span="8">
        <div
          class="rounded bg-[var(--tiger-primary)] p-4 text-center text-[var(--tiger-primary-foreground,#fff)]">
          col-8
        </div>
      </Col>
    </Row>
  </div>
</template>
