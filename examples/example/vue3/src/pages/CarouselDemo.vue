<script setup lang="ts">
import { ref } from 'vue'
import { Carousel, Button, Space } from '@expcat/tigercat-vue'
import DemoBlock from '../components/DemoBlock.vue'

const basicSnippet = `<Carousel>
  <div class="slide">Slide 1</div>
  <div class="slide">Slide 2</div>
  <div class="slide">Slide 3</div>
</Carousel>`

const arrowsSnippet = `<Carousel arrows>
  <div class="slide">Slide 1</div>
  <div class="slide">Slide 2</div>
</Carousel>`

const autoplaySnippet = `<Carousel autoplay :autoplaySpeed="3000" pauseOnHover>
  <div class="slide">Slide 1</div>
  <div class="slide">Slide 2</div>
</Carousel>`

const fadeSnippet = `<Carousel effect="fade" arrows>
  <div class="slide">Slide 1</div>
  <div class="slide">Slide 2</div>
</Carousel>`

const dotPositionSnippet = `<Carousel :dotPosition="position">
  <div class="slide">Slide 1</div>
  <div class="slide">Slide 2</div>
</Carousel>`

const dotPosition = ref<'top' | 'bottom' | 'left' | 'right'>('bottom')

const slideColors = [
    'bg-gradient-to-r from-blue-500 to-blue-600',
    'bg-gradient-to-r from-green-500 to-green-600',
    'bg-gradient-to-r from-purple-500 to-purple-600',
    'bg-gradient-to-r from-orange-500 to-orange-600'
]
</script>

<template>
    <div class="max-w-5xl mx-auto p-8">
        <div class="mb-8">
            <h1 class="text-3xl font-bold mb-2">Carousel 轮播图</h1>
            <p class="text-gray-600">轮播组件，用于展示图片、卡片等内容。</p>
        </div>

        <DemoBlock title="基本用法"
                   description="最简单的轮播图，通过点击导航点切换。"
                   :code="basicSnippet">
            <div class="p-6 bg-gray-50 rounded-lg">
                <Carousel>
                    <div v-for="(color, index) in slideColors"
                         :key="index"
                         :class="[color, 'h-48 flex items-center justify-center text-white text-2xl font-bold rounded-lg']">
                        Slide {{ index + 1 }}
                    </div>
                </Carousel>
            </div>
        </DemoBlock>

        <DemoBlock title="带箭头"
                   description="显示前进后退箭头。"
                   :code="arrowsSnippet">
            <div class="p-6 bg-gray-50 rounded-lg">
                <Carousel arrows>
                    <div v-for="(color, index) in slideColors"
                         :key="index"
                         :class="[color, 'h-48 flex items-center justify-center text-white text-2xl font-bold rounded-lg']">
                        Slide {{ index + 1 }}
                    </div>
                </Carousel>
            </div>
        </DemoBlock>

        <DemoBlock title="自动播放"
                   description="自动切换，鼠标悬停时暂停。"
                   :code="autoplaySnippet">
            <div class="p-6 bg-gray-50 rounded-lg">
                <Carousel autoplay
                          :autoplaySpeed="3000"
                          pauseOnHover
                          arrows>
                    <div v-for="(color, index) in slideColors"
                         :key="index"
                         :class="[color, 'h-48 flex items-center justify-center text-white text-2xl font-bold rounded-lg']">
                        Slide {{ index + 1 }}
                    </div>
                </Carousel>
                <p class="text-sm text-gray-500 mt-2">鼠标悬停在轮播图上会暂停自动播放</p>
            </div>
        </DemoBlock>

        <DemoBlock title="渐变效果"
                   description="使用渐变切换效果。"
                   :code="fadeSnippet">
            <div class="p-6 bg-gray-50 rounded-lg">
                <Carousel effect="fade"
                          arrows>
                    <div v-for="(color, index) in slideColors"
                         :key="index"
                         :class="[color, 'h-48 flex items-center justify-center text-white text-2xl font-bold rounded-lg']">
                        Slide {{ index + 1 }}
                    </div>
                </Carousel>
            </div>
        </DemoBlock>

        <DemoBlock title="导航点位置"
                   description="可以调整导航点的位置。"
                   :code="dotPositionSnippet">
            <div class="p-6 bg-gray-50 rounded-lg">
                <div class="mb-4">
                    <Space>
                        <Button v-for="pos in ['top', 'bottom', 'left', 'right'] as const"
                                :key="pos"
                                :variant="dotPosition === pos ? 'primary' : 'outline'"
                                size="sm"
                                @click="dotPosition = pos">
                            {{ pos }}
                        </Button>
                    </Space>
                </div>
                <Carousel :dotPosition="dotPosition"
                          arrows>
                    <div v-for="(color, index) in slideColors"
                         :key="index"
                         :class="[color, 'h-48 flex items-center justify-center text-white text-2xl font-bold rounded-lg']">
                        Slide {{ index + 1 }}
                    </div>
                </Carousel>
            </div>
        </DemoBlock>
    </div>
</template>