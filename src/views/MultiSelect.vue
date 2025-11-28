<script setup lang="ts">
import { ref } from 'vue'

import BaseMultiSelect from '@/components/BaseMultiSelect/index.vue'

defineOptions({
  name: 'DemoMultiSelect',
})

const selectedLanguages = ref<(string | number)[]>(['vue', 'ts'])
const languageOptions = [
  { label: 'Vue.js', value: 'vue' },
  { label: 'TypeScript', value: 'ts' },
  { label: 'JavaScript', value: 'js' },
  { label: 'Tailwind CSS', value: 'tailwind' },
  { label: 'Node.js', value: 'node' },
  { label: 'Python', value: 'python' },
]
</script>

<template>
  <div class="w-full">
    <h1 class="text-center text-lg">MultiSelect 多選下拉</h1>

    <div class="flex items-center justify-center">
      <BaseMultiSelect
        v-model="selectedLanguages"
        :options="languageOptions"
        :searchable="true"
        placeholder="選擇您會的程式語言"
      />
    </div>
  </div>
</template>
