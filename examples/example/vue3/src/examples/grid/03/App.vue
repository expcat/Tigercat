<script setup lang="ts">
import { Row } from '@expcat/tigercat-vue/Row'
import { Col } from '@expcat/tigercat-vue/Col'
</script>

<template>
  <Row :gutter="16" justify="space-between" align="middle" :wrap="false">
    <Col flex="120px">
      <div class="rounded bg-amber-500 p-3 text-center text-white">固定</div>
    </Col>
    <Col flex="auto">
      <div class="rounded bg-amber-400 p-6 text-center text-white">自适应</div>
    </Col>
  </Row>
</template>
