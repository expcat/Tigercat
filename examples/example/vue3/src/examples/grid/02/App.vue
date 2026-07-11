<script setup lang="ts">
import { Row } from '@expcat/tigercat-vue/Row'
import { Col } from '@expcat/tigercat-vue/Col'
</script>

<template>
  <Row :gutter="16">
    <Col :span="{ xs: 24, md: 12, lg: 8 }">
      <div class="rounded bg-teal-600 p-4 text-center text-white">xs-24 md-12 lg-8</div>
    </Col>
    <Col :span="{ xs: 24, md: 12, lg: 16 }">
      <div class="rounded bg-teal-500 p-4 text-center text-white">xs-24 md-12 lg-16</div>
    </Col>
  </Row>
</template>
