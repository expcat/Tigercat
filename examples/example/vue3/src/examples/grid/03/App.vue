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
        <Space direction="vertical" class="w-full">
          <Row :gutter="[16, 16]">
            <Col :span="{ xs: 24, md: 12, lg: 8 }">
              <div class="bg-teal-600 text-white p-4 rounded text-center">xs-24 md-12 lg-8</div>
            </Col>
            <Col :span="{ xs: 24, md: 6, lg: 6 }">
              <div class="bg-teal-500 text-white p-4 rounded text-center">xs-24 md-6 lg-6</div>
            </Col>
            <Col :span="{ xs: 24, md: 4, lg: 6 }">
              <div class="bg-teal-400 text-white p-4 rounded text-center">xs-24 md-4 lg-6</div>
            </Col>
            <Col :span="{ xs: 24, md: 2, lg: 4 }">
              <div class="bg-teal-300 text-white p-4 rounded text-center">xs-24 md-2 lg-4</div>
            </Col>
          </Row>

          <Row :gutter="16">
            <Col :span="8">
              <div class="bg-cyan-600 text-white p-4 rounded text-center">span=8</div>
            </Col>
            <Col :span="8" :offset="{ xs: 0, md: 8 }">
              <div class="bg-cyan-500 text-white p-4 rounded text-center">offset: md-8</div>
            </Col>
          </Row>
        </Space>
      </Container>
    </div>
  </div>
</template>
