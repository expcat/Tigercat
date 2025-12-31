<script setup lang="ts">
import { Avatar, Space, Divider, Badge } from '@tigercat/vue'
</script>

<template>
  <div class="max-w-5xl mx-auto p-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">Avatar 头像</h1>
      <p class="text-gray-600">用于展示用户或实体的头像组件，支持图片、文字、图标等多种展示形式。</p>
    </div>

    <!-- 基本用法 - 图片头像 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">图片头像</h2>
      <p class="text-gray-600 mb-6">使用 src 属性显示图片头像。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Space>
          <Avatar src="https://i.pravatar.cc/150?img=1" alt="User 1" />
          <Avatar src="https://i.pravatar.cc/150?img=2" alt="User 2" />
          <Avatar src="https://i.pravatar.cc/150?img=3" alt="User 3" />
        </Space>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 文字头像 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">文字头像</h2>
      <p class="text-gray-600 mb-6">使用 text 属性显示文字头像，组件会自动提取首字母或缩写。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Space>
          <Avatar text="Alice" />
          <Avatar text="Bob Smith" />
          <Avatar text="John Doe" />
          <Avatar text="张三" />
          <Avatar text="李明华" />
        </Space>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 图标头像 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">图标头像</h2>
      <p class="text-gray-600 mb-6">通过插槽传入图标内容。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Space>
          <Avatar>
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </Avatar>
          <Avatar>
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </Avatar>
          <Avatar>
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </Avatar>
        </Space>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 头像尺寸 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">头像尺寸</h2>
      <p class="text-gray-600 mb-6">头像有四种尺寸：小、中、大、超大。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Space align="center">
          <Avatar size="sm" text="SM" />
          <Avatar size="md" text="MD" />
          <Avatar size="lg" text="LG" />
          <Avatar size="xl" text="XL" />
        </Space>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 头像形状 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">头像形状</h2>
      <p class="text-gray-600 mb-6">头像支持圆形和方形两种形状。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Space>
          <div>
            <p class="text-sm text-gray-600 mb-2 text-center">圆形</p>
            <Avatar shape="circle" text="圆形" />
          </div>
          <div>
            <p class="text-sm text-gray-600 mb-2 text-center">方形</p>
            <Avatar shape="square" text="方形" />
          </div>
        </Space>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 自定义颜色 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">自定义颜色</h2>
      <p class="text-gray-600 mb-6">可以通过 bgColor 和 textColor 属性自定义文字/图标头像的背景色和文字色。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Space>
          <Avatar text="AB" bg-color="bg-blue-500" text-color="text-white" />
          <Avatar text="CD" bg-color="bg-green-500" text-color="text-white" />
          <Avatar text="EF" bg-color="bg-purple-500" text-color="text-white" />
          <Avatar text="GH" bg-color="bg-pink-500" text-color="text-white" />
          <Avatar text="IJ" bg-color="bg-orange-500" text-color="text-white" />
        </Space>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 实际应用示例 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">实际应用示例</h2>
      <p class="text-gray-600 mb-6">模拟真实的使用场景。</p>
      
      <!-- 用户列表 -->
      <div class="mb-6">
        <h3 class="text-lg font-semibold mb-3">用户列表</h3>
        <div class="p-6 bg-gray-50 rounded-lg">
          <div class="space-y-4">
            <div class="flex items-center gap-3">
              <Avatar src="https://i.pravatar.cc/150?img=11" alt="Alice Johnson" />
              <div>
                <div class="font-medium">Alice Johnson</div>
                <div class="text-sm text-gray-500">alice@example.com</div>
              </div>
            </div>
            
            <div class="flex items-center gap-3">
              <Avatar text="Bob Smith" bg-color="bg-blue-500" text-color="text-white" />
              <div>
                <div class="font-medium">Bob Smith</div>
                <div class="text-sm text-gray-500">bob@example.com</div>
              </div>
            </div>
            
            <div class="flex items-center gap-3">
              <Avatar text="张三" bg-color="bg-green-500" text-color="text-white" />
              <div>
                <div class="font-medium">张三</div>
                <div class="text-sm text-gray-500">zhangsan@example.com</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 头像组 -->
      <div class="mb-6">
        <h3 class="text-lg font-semibold mb-3">团队成员（头像组）</h3>
        <div class="p-6 bg-gray-50 rounded-lg">
          <div class="flex -space-x-2">
            <Avatar 
              src="https://i.pravatar.cc/150?img=21" 
              alt="Member 1"
              size="md"
              class="ring-2 ring-white"
            />
            <Avatar 
              src="https://i.pravatar.cc/150?img=22" 
              alt="Member 2"
              size="md"
              class="ring-2 ring-white"
            />
            <Avatar 
              text="Charlie"
              bg-color="bg-purple-500"
              text-color="text-white"
              size="md"
              class="ring-2 ring-white"
            />
            <Avatar 
              text="David"
              bg-color="bg-orange-500"
              text-color="text-white"
              size="md"
              class="ring-2 ring-white"
            />
            <Avatar 
              text="+5"
              bg-color="bg-gray-400"
              text-color="text-white"
              size="md"
              class="ring-2 ring-white"
            />
          </div>
        </div>
      </div>

      <!-- 在线状态 -->
      <div class="mb-6">
        <h3 class="text-lg font-semibold mb-3">在线状态指示</h3>
        <div class="p-6 bg-gray-50 rounded-lg">
          <Space wrap>
            <div class="flex items-center gap-3">
              <Badge type="dot" variant="success" :standalone="false" position="bottom-right">
                <Avatar src="https://i.pravatar.cc/150?img=31" alt="Online User" size="lg" />
              </Badge>
              <span class="text-green-600 font-medium">在线</span>
            </div>
            
            <div class="flex items-center gap-3">
              <Badge type="dot" variant="warning" :standalone="false" position="bottom-right">
                <Avatar text="忙碌" bg-color="bg-yellow-500" text-color="text-white" size="lg" />
              </Badge>
              <span class="text-yellow-600 font-medium">忙碌</span>
            </div>
            
            <div class="flex items-center gap-3">
              <Badge type="dot" variant="default" :standalone="false" position="bottom-right">
                <Avatar text="离线" bg-color="bg-gray-400" text-color="text-white" size="lg" />
              </Badge>
              <span class="text-gray-500">离线</span>
            </div>
          </Space>
        </div>
      </div>

      <!-- 评论列表 -->
      <div>
        <h3 class="text-lg font-semibold mb-3">评论列表</h3>
        <div class="p-6 bg-gray-50 rounded-lg">
          <div class="space-y-4">
            <div class="flex gap-3">
              <Avatar src="https://i.pravatar.cc/150?img=41" alt="User" size="md" />
              <div class="flex-1">
                <div class="font-medium mb-1">Alice Johnson</div>
                <div class="text-gray-600 text-sm">这是一条评论内容，用于展示头像在评论列表中的应用。</div>
                <div class="text-gray-400 text-xs mt-1">2小时前</div>
              </div>
            </div>
            
            <div class="flex gap-3">
              <Avatar text="Bob" bg-color="bg-blue-500" text-color="text-white" size="md" />
              <div class="flex-1">
                <div class="font-medium mb-1">Bob Smith</div>
                <div class="text-gray-600 text-sm">另一条评论内容，展示文字头像的使用效果。</div>
                <div class="text-gray-400 text-xs mt-1">5小时前</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
