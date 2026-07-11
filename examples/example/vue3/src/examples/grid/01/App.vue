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
          <Row>
            <Col :span="24">
              <div class="bg-blue-500 text-white p-4 rounded text-center">col-24</div>
            </Col>
          </Row>
          <Row>
            <Col :span="12">
              <div class="bg-blue-600 text-white p-4 rounded text-center">col-12</div>
            </Col>
            <Col :span="12">
              <div class="bg-blue-400 text-white p-4 rounded text-center">col-12</div>
            </Col>
          </Row>
          <Row>
            <Col :span="8">
              <div class="bg-green-600 text-white p-4 rounded text-center">col-8</div>
            </Col>
            <Col :span="8">
              <div class="bg-green-500 text-white p-4 rounded text-center">col-8</div>
            </Col>
            <Col :span="8">
              <div class="bg-green-400 text-white p-4 rounded text-center">col-8</div>
            </Col>
          </Row>
          <Row>
            <Col :span="6">
              <div class="bg-purple-600 text-white p-4 rounded text-center">col-6</div>
            </Col>
            <Col :span="6">
              <div class="bg-purple-500 text-white p-4 rounded text-center">col-6</div>
            </Col>
            <Col :span="6">
              <div class="bg-purple-400 text-white p-4 rounded text-center">col-6</div>
            </Col>
            <Col :span="6">
              <div class="bg-purple-300 text-white p-4 rounded text-center">col-6</div>
            </Col>
          </Row>
        </Space>
      </Container>
    </div>
  </div>
</template>
