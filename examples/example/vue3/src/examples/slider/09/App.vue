<script setup lang="ts">
import { Space } from '@expcat/tigercat-vue/Space'
import { Text } from '@expcat/tigercat-vue/Text'
import { ref } from 'vue'
import { Slider } from '@expcat/tigercat-vue/Slider'

const basicValue = ref(50)

const rangeMinMaxDefaultValue = ref(50)
const rangeMinMaxWideValue = ref(30)

const stepValue = ref(30)

const rangeValue = ref<[number, number]>([20, 80])

const marksValue = ref(25)
const marks = {
  0: '0°C',
  25: '25°C',
  50: '50°C',
  75: '75°C',
  100: '100°C'
}

const tooltipOffValue = ref(50)
const tooltipOnValue = ref(50)

const disabledValue = ref(75)

const sizeSm = ref(30)
const sizeMd = ref(50)
const sizeLg = ref(70)
</script>

<template>
  <div class="min-w-0">
    <Space direction="vertical" class="w-full max-w-md">
      <div class="flex items-center gap-4 w-full">
        <Slider :default-value="60" :min="0" :max="100" aria-label="默认值数值" class="flex-1" />
      </div>
    </Space>
  </div>
</template>
