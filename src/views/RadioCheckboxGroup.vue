<script setup lang="ts">
import { ref } from 'vue'

import RadioCheckboxGroup from '@/components/RadioCheckboxGroup/index.vue'

const radioOptions = [
  { label: 'Option 1', value: 'option1' },
  { label: 'Option 2', value: 'option2' },
  { label: 'Option 3', value: 'option3' },
]
const selectedOption = ref('option3')

defineOptions({
  name: 'RadioCheckboxGroup',
})
</script>

<template>
  <div class="w-full">
    <h1 class="text-center text-lg">RadioCheckboxGroup 單選按鈕 Checkbox 樣式</h1>

    <div class="my-2 flex items-center justify-center">
      <div class="mx-auto w-fit">
        <RadioCheckboxGroup v-model="selectedOption" :options="radioOptions" />
      </div>
    </div>

    <div class="flex items-center justify-center">
      <span class="mr-2">Selected Option:</span>
      <span>{{ selectedOption }}</span>
    </div>
  </div>
</template>
