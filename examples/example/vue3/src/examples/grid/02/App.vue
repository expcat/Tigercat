<script setup lang="ts">
import { Row } from '@expcat/tigercat-vue/Row'
import { Col } from '@expcat/tigercat-vue/Col'
import { ConfigProvider } from '@expcat/tigercat-vue/ConfigProvider'
</script>

<template>
  <div class="space-y-3">
    <Row :gutter="16">
      <Col :span="{ xs: 24, md: 12, lg: 8 }">
        <div
          class="rounded bg-[var(--tiger-primary)] p-4 text-center text-[var(--tiger-primary-foreground,#fff)]">
          xs-24 md-12 lg-8 · 数字 gutter 只开横缝
        </div>
      </Col>
      <Col :span="{ xs: 24, md: 12, lg: 16 }" :offset="{ md: 0 }">
        <div class="rounded bg-[var(--tiger-secondary,#0d9488)] p-4 text-center text-white">
          xs-24 md-12 lg-16
        </div>
      </Col>
    </Row>
    <Row :gutter="[16, 0]">
      <Col :span="6" :offset="2">
        <div class="rounded border border-[var(--tiger-border)] p-3 text-sm">offset 2</div>
      </Col>
      <Col :span="{ xs: 0, md: 8 }">
        <div class="rounded border border-[var(--tiger-border)] p-3 text-sm">
          xs 隐藏，md 起 span 8
        </div>
      </Col>
    </Row>
    <ConfigProvider direction="rtl">
      <Row :gutter="16" dir="rtl">
        <Col :span="8" :offset="4">
          <div class="rounded border border-[var(--tiger-border)] p-3 text-sm">
            RTL offset 加在 inline-start
          </div>
        </Col>
        <Col :span="8">
          <div class="rounded border border-[var(--tiger-border)] p-3 text-sm">span 8</div>
        </Col>
      </Row>
    </ConfigProvider>
  </div>
</template>
