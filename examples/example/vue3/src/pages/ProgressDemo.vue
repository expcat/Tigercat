<script setup lang="ts">
import { ref } from 'vue'
import { Progress, Space, Divider, Button } from '@tigercat/vue'

const uploadProgress = ref(0)

const startUpload = () => {
  uploadProgress.value = 0
  const interval = setInterval(() => {
    uploadProgress.value += 10
    if (uploadProgress.value >= 100) {
      clearInterval(interval)
    }
  }, 500)
}
</script>

<template>
  <div class="max-w-5xl mx-auto p-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">Progress 进度条</h1>
      <p class="text-gray-600">用于展示操作进度的组件，支持线形和圆形两种展示方式。</p>
    </div>

    <!-- 基本用法 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">基本用法</h2>
      <p class="text-gray-600 mb-6">线形进度条，默认展示百分比文本。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Space direction="vertical"
               class="w-full">
          <Progress :percentage="0" />
          <Progress :percentage="50" />
          <Progress :percentage="100" />
        </Space>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 进度条变体 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">进度条变体</h2>
      <p class="text-gray-600 mb-6">支持六种颜色变体。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Space direction="vertical"
               class="w-full">
          <Progress variant="default"
                    :percentage="20" />
          <Progress variant="primary"
                    :percentage="40" />
          <Progress variant="success"
                    :percentage="60" />
          <Progress variant="warning"
                    :percentage="80" />
          <Progress variant="danger"
                    :percentage="90" />
          <Progress variant="info"
                    :percentage="70" />
        </Space>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 进度条状态 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">进度条状态</h2>
      <p class="text-gray-600 mb-6">通过状态显示不同的进度状态，状态会覆盖变体颜色。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Space direction="vertical"
               class="w-full">
          <Progress :percentage="100"
                    status="success" />
          <Progress :percentage="50"
                    status="exception" />
          <Progress :percentage="70"
                    status="paused" />
        </Space>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 进度条尺寸 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">进度条尺寸</h2>
      <p class="text-gray-600 mb-6">支持三种尺寸。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Space direction="vertical"
               class="w-full">
          <Progress size="sm"
                    :percentage="50" />
          <Progress size="md"
                    :percentage="50" />
          <Progress size="lg"
                    :percentage="50" />
        </Space>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 圆形进度条 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">圆形进度条</h2>
      <p class="text-gray-600 mb-6">通过设置 type="circle" 展示圆形进度条。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Space align="center">
          <Progress type="circle"
                    :percentage="0"
                    :show-text="true" />
          <Progress type="circle"
                    :percentage="25"
                    :show-text="true" />
          <Progress type="circle"
                    :percentage="75"
                    :show-text="true" />
          <Progress type="circle"
                    :percentage="100"
                    status="success"
                    :show-text="true" />
        </Space>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 圆形进度条尺寸 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">圆形进度条尺寸</h2>
      <p class="text-gray-600 mb-6">圆形进度条支持三种尺寸。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Space align="center">
          <Progress type="circle"
                    size="sm"
                    :percentage="75"
                    :show-text="true" />
          <Progress type="circle"
                    size="md"
                    :percentage="75"
                    :show-text="true" />
          <Progress type="circle"
                    size="lg"
                    :percentage="75"
                    :show-text="true" />
        </Space>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 自定义文本 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">自定义文本</h2>
      <p class="text-gray-600 mb-6">可以自定义进度条显示的文本。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Space direction="vertical"
               class="w-full">
          <Progress :percentage="50"
                    text="进行中" />
          <Progress :percentage="100"
                    text="已完成" />
          <Progress :percentage="50"
                    :format="(p) => `${p}个/100个`" />
        </Space>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 不显示文字 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">不显示文字</h2>
      <p class="text-gray-600 mb-6">可以隐藏进度条的文本显示。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Space direction="vertical"
               class="w-full">
          <Progress :percentage="50"
                    :show-text="false" />
          <Progress :percentage="100"
                    :show-text="false" />
        </Space>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 条纹进度条 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">条纹进度条</h2>
      <p class="text-gray-600 mb-6">线形进度条支持条纹样式和动画效果。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Space direction="vertical"
               class="w-full">
          <Progress :percentage="70"
                    :striped="true" />
          <Progress :percentage="70"
                    :striped="true"
                    :striped-animation="true" />
        </Space>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 文件上传示例 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">文件上传示例</h2>
      <p class="text-gray-600 mb-6">模拟文件上传进度。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Space direction="vertical"
               class="w-full">
          <Progress :percentage="uploadProgress" />
          <Button variant="primary"
                  @click="startUpload">开始上传</Button>
        </Space>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 仪表盘展示 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">仪表盘展示</h2>
      <p class="text-gray-600 mb-6">使用圆形进度条展示系统资源使用情况。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div class="text-center">
            <h4 class="mb-4 text-sm font-medium">CPU 使用率</h4>
            <Progress type="circle"
                      :percentage="75"
                      variant="primary"
                      :show-text="true" />
          </div>
          <div class="text-center">
            <h4 class="mb-4 text-sm font-medium">内存使用率</h4>
            <Progress type="circle"
                      :percentage="60"
                      variant="success"
                      :show-text="true" />
          </div>
          <div class="text-center">
            <h4 class="mb-4 text-sm font-medium">磁盘使用率</h4>
            <Progress type="circle"
                      :percentage="85"
                      status="paused"
                      :show-text="true" />
          </div>
          <div class="text-center">
            <h4 class="mb-4 text-sm font-medium">网络带宽</h4>
            <Progress type="circle"
                      :percentage="95"
                      status="exception"
                      :show-text="true" />
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
