<script setup lang="ts">
import { Row } from '@expcat/tigercat-vue/Row'
import { Col } from '@expcat/tigercat-vue/Col'
</script>

<template>
  <Row :gutter="[16, 16]">
    <Col v-for="item in 3" :key="item" :span="8">
      <div class="rounded bg-blue-600 p-4 text-center text-white">col-8</div>
    </Col>
  </Row>
</template>
