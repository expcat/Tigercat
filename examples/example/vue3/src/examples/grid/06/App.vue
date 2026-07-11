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
          <Row :gutter="16">
            <Col :span="8" :order="3">
              <div class="bg-fuchsia-500 text-white p-4 rounded text-center">
                order=3（DOM 第1）
              </div>
            </Col>
            <Col :span="8" :order="1">
              <div class="bg-fuchsia-600 text-white p-4 rounded text-center">
                order=1（DOM 第2）
              </div>
            </Col>
            <Col :span="8" :order="2">
              <div class="bg-fuchsia-400 text-white p-4 rounded text-center">
                order=2（DOM 第3）
              </div>
            </Col>
          </Row>
          <div>
            <p class="text-sm text-gray-600 mb-2">响应式排序（缩小窗口试试）</p>
            <Row :gutter="16">
              <Col :span="8" :order="{ xs: 3, md: 1 }">
                <div class="bg-fuchsia-600 text-white p-4 rounded text-center">xs:3 → md:1</div>
              </Col>
              <Col :span="8" :order="{ xs: 1, md: 2 }">
                <div class="bg-fuchsia-500 text-white p-4 rounded text-center">xs:1 → md:2</div>
              </Col>
              <Col :span="8" :order="{ xs: 2, md: 3 }">
                <div class="bg-fuchsia-400 text-white p-4 rounded text-center">xs:2 → md:3</div>
              </Col>
            </Row>
          </div>
        </Space>
      </Container>
    </div>
  </div>
</template>
