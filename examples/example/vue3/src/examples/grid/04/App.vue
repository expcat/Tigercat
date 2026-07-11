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
          <p class="text-sm font-medium text-gray-700">justify 水平分布</p>
          <div v-for="j in justifyValues" :key="j">
            <p class="text-sm text-gray-600 mb-1">justify: {{ j }}</p>
            <Row :gutter="16" :justify="j">
              <Col :span="4">
                <div class="bg-amber-500 text-white p-3 rounded text-center">A</div>
              </Col>
              <Col :span="4">
                <div class="bg-amber-400 text-white p-3 rounded text-center">B</div>
              </Col>
              <Col :span="4">
                <div class="bg-amber-300 text-white p-3 rounded text-center">C</div>
              </Col>
            </Row>
          </div>

          <p class="text-sm font-medium text-gray-700 mt-4">align 垂直对齐</p>
          <div v-for="a in alignValues" :key="a">
            <p class="text-sm text-gray-600 mb-1">align: {{ a }}</p>
            <Row :gutter="16" :align="a">
              <Col :span="8">
                <div
                  class="bg-rose-500 text-white p-3 rounded text-center h-8 flex items-center justify-center">
                  h-8
                </div>
              </Col>
              <Col :span="8">
                <div
                  class="bg-rose-400 text-white p-3 rounded text-center h-16 flex items-center justify-center">
                  h-16
                </div>
              </Col>
              <Col :span="8">
                <div
                  class="bg-rose-300 text-white p-3 rounded text-center h-12 flex items-center justify-center">
                  h-12
                </div>
              </Col>
            </Row>
          </div>
        </Space>
      </Container>
    </div>
  </div>
</template>
