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
          <div>
            <p class="text-sm text-gray-600 mb-2">gutter: 16</p>
            <Row :gutter="16">
              <Col :span="6">
                <div class="bg-blue-500 text-white p-4 rounded text-center">col-6</div>
              </Col>
              <Col :span="6">
                <div class="bg-blue-500 text-white p-4 rounded text-center">col-6</div>
              </Col>
              <Col :span="6">
                <div class="bg-blue-500 text-white p-4 rounded text-center">col-6</div>
              </Col>
              <Col :span="6">
                <div class="bg-blue-500 text-white p-4 rounded text-center">col-6</div>
              </Col>
            </Row>
          </div>

          <div>
            <p class="text-sm text-gray-600 mb-2">gutter: [16, 16]（水平+垂直）</p>
            <div class="py-2">
              <Row :gutter="[16, 16]">
                <Col :span="12">
                  <div class="bg-indigo-500 text-white p-4 rounded text-center">col-12</div>
                </Col>
                <Col :span="12">
                  <div class="bg-indigo-400 text-white p-4 rounded text-center">col-12</div>
                </Col>
                <Col :span="8">
                  <div class="bg-indigo-500 text-white p-4 rounded text-center">col-8</div>
                </Col>
                <Col :span="8">
                  <div class="bg-indigo-400 text-white p-4 rounded text-center">col-8</div>
                </Col>
                <Col :span="8">
                  <div class="bg-indigo-300 text-white p-4 rounded text-center">col-8</div>
                </Col>
              </Row>
            </div>
          </div>
        </Space>
      </Container>
    </div>
  </div>
</template>
