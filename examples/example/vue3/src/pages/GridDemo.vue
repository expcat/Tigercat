<script setup lang="ts">
import { Row, Col, Container, Space } from '@tigercat/vue'
</script>

<template>
  <div class="max-w-5xl mx-auto p-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">Grid 栅格</h1>
      <p class="text-gray-600">通过基础的 24 分栏，迅速简便地创建布局。</p>
    </div>

    <!-- 基础栅格 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">基础栅格</h2>
      <p class="text-gray-600 mb-6">使用单一分栏创建基础的栅格布局。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Container>
          <Space direction="vertical"
                 class="w-full">
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
    </section>

    <!-- 分栏间隔 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">分栏间隔</h2>
      <p class="text-gray-600 mb-6">支持水平间距或 [水平, 垂直] 的间距数组。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Container>
          <Space direction="vertical"
                 class="w-full">
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
    </section>

    <!-- 响应式栅格 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">响应式栅格</h2>
      <p class="text-gray-600 mb-6">span / offset 支持按断点设置（xs, sm, md, lg, xl, 2xl）。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Container>
          <Space direction="vertical"
                 class="w-full">
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
              <Col :span="8"
                   :offset="{ xs: 0, md: 8 }">
                <div class="bg-cyan-500 text-white p-4 rounded text-center">offset: md-8</div>
              </Col>
            </Row>
          </Space>
        </Container>
      </div>
    </section>

    <!-- Row 对齐与分布 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">Row 对齐与分布</h2>
      <p class="text-gray-600 mb-6">justify 控制水平分布，align 控制垂直对齐。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Container>
          <Space direction="vertical"
                 class="w-full">
            <div>
              <p class="text-sm text-gray-600 mb-2">justify: space-between</p>
              <Row :gutter="16"
                   justify="space-between">
                <Col :span="6">
                  <div class="bg-amber-500 text-white p-4 rounded text-center">A</div>
                </Col>
                <Col :span="6">
                  <div class="bg-amber-500 text-white p-4 rounded text-center">B</div>
                </Col>
                <Col :span="6">
                  <div class="bg-amber-500 text-white p-4 rounded text-center">C</div>
                </Col>
              </Row>
            </div>

            <div>
              <p class="text-sm text-gray-600 mb-2">align: middle</p>
              <Row :gutter="16"
                   align="middle">
                <Col :span="8">
                  <div class="bg-rose-500 text-white p-4 rounded text-center h-10 flex items-center justify-center">h-10
                  </div>
                </Col>
                <Col :span="8">
                  <div class="bg-rose-500 text-white p-4 rounded text-center h-16 flex items-center justify-center">h-16
                  </div>
                </Col>
                <Col :span="8">
                  <div class="bg-rose-500 text-white p-4 rounded text-center h-12 flex items-center justify-center">h-12
                  </div>
                </Col>
              </Row>
            </div>
          </Space>
        </Container>
      </div>
    </section>

    <!-- 列偏移 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">列偏移</h2>
      <p class="text-gray-600 mb-6">使用 offset 在 24 栅格内做留白与对齐。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Container>
          <Space direction="vertical"
                 class="w-full">
            <Row :gutter="16">
              <Col :span="8">
                <div class="bg-blue-600 text-white p-4 rounded text-center">span=8</div>
              </Col>
              <Col :span="8"
                   :offset="8">
                <div class="bg-blue-500 text-white p-4 rounded text-center">span=8 offset=8</div>
              </Col>
            </Row>
            <Row :gutter="16">
              <Col :span="6"
                   :offset="6">
                <div class="bg-blue-600 text-white p-4 rounded text-center">span=6 offset=6</div>
              </Col>
              <Col :span="6"
                   :offset="6">
                <div class="bg-blue-500 text-white p-4 rounded text-center">span=6 offset=6</div>
              </Col>
            </Row>
          </Space>
        </Container>
      </div>
    </section>

    <!-- 排序 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">列排序</h2>
      <p class="text-gray-600 mb-6">使用 order 改变列的显示顺序（不改变 DOM 顺序）。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Container>
          <Row :gutter="16">
            <Col :span="8"
                 :order="3">
              <div class="bg-fuchsia-500 text-white p-4 rounded text-center">order=3（DOM 第1）</div>
            </Col>
            <Col :span="8"
                 :order="1">
              <div class="bg-fuchsia-600 text-white p-4 rounded text-center">order=1（DOM 第2）</div>
            </Col>
            <Col :span="8"
                 :order="2">
              <div class="bg-fuchsia-400 text-white p-4 rounded text-center">order=2（DOM 第3）</div>
            </Col>
          </Row>
        </Container>
      </div>
    </section>

    <!-- 不换行 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">不换行（wrap=false）</h2>
      <p class="text-gray-600 mb-6">当总宽度超过 24 栅格时，不换行会导致横向溢出。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Container>
          <div class="overflow-x-auto overflow-y-hidden px-2">
            <Row :gutter="16"
                 :wrap="false"
                 class="min-w-[720px]">
              <Col :span="6">
                <div class="bg-emerald-600 text-white p-4 rounded text-center">6</div>
              </Col>
              <Col :span="6">
                <div class="bg-emerald-500 text-white p-4 rounded text-center">6</div>
              </Col>
              <Col :span="6">
                <div class="bg-emerald-400 text-white p-4 rounded text-center">6</div>
              </Col>
              <Col :span="6">
                <div class="bg-emerald-300 text-white p-4 rounded text-center">6</div>
              </Col>
              <Col :span="6">
                <div class="bg-emerald-600 text-white p-4 rounded text-center">6</div>
              </Col>
            </Row>
          </div>
        </Container>
      </div>
    </section>

    <!-- Flex -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">Flex 自适应</h2>
      <p class="text-gray-600 mb-6">使用 flex 进行比例分配（建议与 span=0 搭配）。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Container>
          <Row :gutter="16">
            <Col :span="0"
                 :flex="1">
              <div class="bg-slate-700 text-white p-4 rounded text-center">flex=1</div>
            </Col>
            <Col :span="0"
                 :flex="2">
              <div class="bg-slate-600 text-white p-4 rounded text-center">flex=2</div>
            </Col>
            <Col :span="0"
                 flex="0_0_160px">
              <div class="bg-slate-500 text-white p-4 rounded text-center">flex=0 0 160px</div>
            </Col>
          </Row>
        </Container>
      </div>
    </section>

    <!-- 混合布局 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">混合布局</h2>
      <p class="text-gray-600 mb-6">通过基础的 1/24 分栏任意扩展组合形成较为复杂的混合布局。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Container>
          <Space direction="vertical"
                 class="w-full">
            <Row :gutter="16">
              <Col :span="16">
                <div class="bg-green-500 text-white p-4 rounded text-center">col-16</div>
              </Col>
              <Col :span="8">
                <div class="bg-green-500 text-white p-4 rounded text-center">col-8</div>
              </Col>
            </Row>
            <Row :gutter="16">
              <Col :span="8">
                <div class="bg-green-500 text-white p-4 rounded text-center">col-8</div>
              </Col>
              <Col :span="8">
                <div class="bg-green-500 text-white p-4 rounded text-center">col-8</div>
              </Col>
              <Col :span="4">
                <div class="bg-green-500 text-white p-4 rounded text-center">col-4</div>
              </Col>
              <Col :span="4">
                <div class="bg-green-500 text-white p-4 rounded text-center">col-4</div>
              </Col>
            </Row>
          </Space>
        </Container>
      </div>
    </section>
  </div>
</template>
