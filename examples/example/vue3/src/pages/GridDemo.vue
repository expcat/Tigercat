<script setup lang="ts">
import { Row, Col, Container, Space } from '@expcat/tigercat-vue'
import DemoBlock from '../components/DemoBlock.vue'

const basicSnippet = `<Row>
  <Col :span="24">col-24</Col>
  <Col :span="12">col-12</Col>
  <Col :span="12">col-12</Col>
  <Col :span="8">col-8</Col>
  <Col :span="8">col-8</Col>
  <Col :span="8">col-8</Col>
  <Col :span="6">col-6</Col>
  <Col :span="6">col-6</Col>
  <Col :span="6">col-6</Col>
  <Col :span="6">col-6</Col>
</Row>`

const gutterSnippet = `<Row :gutter="16">...</Row>
<Row :gutter="[16, 16]">...</Row>`

const responsiveSnippet = `<Row :gutter="[16, 16]">
  <Col :span="{ xs: 24, md: 12, lg: 8 }">...</Col>
  <Col :span="{ xs: 24, md: 6, lg: 6 }">...</Col>
  <Col :span="{ xs: 24, md: 4, lg: 6 }">...</Col>
  <Col :span="{ xs: 24, md: 2, lg: 4 }">...</Col>
</Row>
<Row :gutter="16">
  <Col :span="8">...</Col>
  <Col :span="8" :offset="{ xs: 0, md: 8 }">...</Col>
</Row>`

const alignSnippet = `<Row justify="space-between">...</Row>
<Row align="middle">...</Row>`

const offsetSnippet = `<Row :gutter="16">
  <Col :span="8">...</Col>
  <Col :span="8" :offset="8">...</Col>
</Row>
<Row :gutter="16">
  <Col :span="6" :offset="6">...</Col>
  <Col :span="6" :offset="6">...</Col>
</Row>`

const orderSnippet = `<Row :gutter="16">
  <Col :span="8" :order="3">...</Col>
  <Col :span="8" :order="1">...</Col>
  <Col :span="8" :order="2">...</Col>
</Row>`

const nowrapSnippet = `<Row :gutter="16" :wrap="false" class="min-w-[720px]">...</Row>`

const flexSnippet = `<Row :gutter="16">
  <Col :span="0" :flex="1">...</Col>
  <Col :span="0" :flex="2">...</Col>
  <Col :span="0" flex="0_0_160px">...</Col>
</Row>`

const mixedSnippet = `<Row :gutter="16">
  <Col :span="16">...</Col>
  <Col :span="8">...</Col>
</Row>
<Row :gutter="16">
  <Col :span="8">...</Col>
  <Col :span="8">...</Col>
  <Col :span="4">...</Col>
  <Col :span="4">...</Col>
</Row>`
</script>

<template>
  <div class="max-w-5xl mx-auto p-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">Grid 栅格</h1>
      <p class="text-gray-600">通过基础的 24 分栏，迅速简便地创建布局。</p>
    </div>

    <DemoBlock title="基础栅格"
               description="使用单一分栏创建基础的栅格布局。"
               :code="basicSnippet">
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
    </DemoBlock>

    <DemoBlock title="分栏间隔"
               description="支持水平间距或 [水平, 垂直] 的间距数组。"
               :code="gutterSnippet">
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
    </DemoBlock>

    <DemoBlock title="响应式栅格"
               description="span / offset 支持按断点设置（xs, sm, md, lg, xl, 2xl）。"
               :code="responsiveSnippet">
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
    </DemoBlock>

    <DemoBlock title="Row 对齐与分布"
               description="justify 控制水平分布，align 控制垂直对齐。"
               :code="alignSnippet">
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
                  <div class="bg-rose-500 text-white p-4 rounded text-center h-10 flex items-center justify-center">
                    h-10
                  </div>
                </Col>
                <Col :span="8">
                  <div class="bg-rose-500 text-white p-4 rounded text-center h-16 flex items-center justify-center">
                    h-16
                  </div>
                </Col>
                <Col :span="8">
                  <div class="bg-rose-500 text-white p-4 rounded text-center h-12 flex items-center justify-center">
                    h-12
                  </div>
                </Col>
              </Row>
            </div>
          </Space>
        </Container>
      </div>
    </DemoBlock>

    <DemoBlock title="列偏移"
               description="使用 offset 在 24 栅格内做留白与对齐。"
               :code="offsetSnippet">
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
    </DemoBlock>

    <DemoBlock title="列排序"
               description="使用 order 改变列的显示顺序（不改变 DOM 顺序）。"
               :code="orderSnippet">
      <div class="p-6 bg-gray-50 rounded-lg">
        <Container>
          <Row :gutter="16">
            <Col :span="8"
                 :order="3">
              <div class="bg-fuchsia-500 text-white p-4 rounded text-center">
                order=3（DOM 第1）
              </div>
            </Col>
            <Col :span="8"
                 :order="1">
              <div class="bg-fuchsia-600 text-white p-4 rounded text-center">
                order=1（DOM 第2）
              </div>
            </Col>
            <Col :span="8"
                 :order="2">
              <div class="bg-fuchsia-400 text-white p-4 rounded text-center">
                order=2（DOM 第3）
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    </DemoBlock>

    <DemoBlock title="不换行（wrap=false）"
               description="当总宽度超过 24 栅格时，不换行会导致横向溢出。"
               :code="nowrapSnippet">
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
    </DemoBlock>

    <DemoBlock title="Flex 自适应"
               description="使用 flex 进行比例分配（建议与 span=0 搭配）。"
               :code="flexSnippet">
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
    </DemoBlock>

    <DemoBlock title="混合布局"
               description="通过基础的 1/24 分栏任意扩展组合形成较为复杂的混合布局。"
               :code="mixedSnippet">
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
    </DemoBlock>
  </div>
</template>
