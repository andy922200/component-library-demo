<script setup lang="ts">
import { ref } from 'vue'

import ButtonGroup from '@/components/ButtonGroup/index.vue'

const baseOptions = [
  { label: 'Option A', value: 'A' },
  { label: 'Option B', value: 'B', disabled: true },
  { label: 'Option C', value: 'C' },
]
const selectedValue = ref('')

defineOptions({
  name: 'DemoButtonGroup',
})
</script>

<template>
  <div class="w-full">
    <h1 class="text-center text-lg">ButtonGroup 按鈕群</h1>

    <div class="flex items-center justify-center">
      <ButtonGroup v-model="selectedValue" :options="baseOptions" />
    </div>
  </div>
</template>
