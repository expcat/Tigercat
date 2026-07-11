<script setup lang="ts">
import { Row } from '@expcat/tigercat-vue/Row'
import { Col } from '@expcat/tigercat-vue/Col'
import { Container } from '@expcat/tigercat-vue/Container'
import { Space } from '@expcat/tigercat-vue/Space'

const justifyValues = [
  'start',
  'center',
  'end',
  'space-between',
  'space-around',
  'space-evenly'
] as const
const alignValues = ['top', 'middle', 'bottom', 'stretch'] as const
</script>

<template>
  <div class="min-w-0">
    <div class="p-6 bg-gray-50 rounded-lg">
      <Container>
        <Row :gutter="16">
          <Col :span="0" :flex="1">
            <div class="bg-slate-700 text-white p-4 rounded text-center">flex=1</div>
          </Col>
          <Col :span="0" :flex="2">
            <div class="bg-slate-600 text-white p-4 rounded text-center">flex=2</div>
          </Col>
          <Col :span="0" flex="0_0_160px">
            <div class="bg-slate-500 text-white p-4 rounded text-center">flex=0 0 160px</div>
          </Col>
        </Row>
      </Container>
    </div>
  </div>
</template>
