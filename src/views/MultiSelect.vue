<script setup lang="ts">
import { ref } from 'vue'

import BaseMultiSelect from '@/components/BaseMultiSelect/index.vue'

defineOptions({
  name: 'DemoMultiSelect',
})

const selectedLanguages = ref<(string | number)[]>([])
const options = ref<{ label: string; value: string | number }[]>([])
const isLoading = ref(false)

// 處理搜尋事件
const handleSearch = async (query: string) => {
  try {
    if (!query && isLoading.value) return
    // 模擬 API 延遲
    await new Promise((resolve) => setTimeout(resolve, 500))

    // 模擬 API 回傳結果
    const searchResults = [
      { label: `${query} - Vue.js`, value: `${query}-vue` },
      { label: `${query} - React`, value: `${query}-react` },
      { label: `${query} - Angular`, value: `${query}-angular` },
    ]

    options.value = searchResults
    console.log('搜尋結果:', searchResults)
  } catch (error) {
    console.error('搜尋失敗:', error)
    options.value = []
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="w-full">
    <h1 class="text-center text-lg">MultiSelect 多選下拉</h1>

    <div class="flex items-center justify-center gap-4">
      <BaseMultiSelect
        v-model="selectedLanguages"
        v-model:remote-searching="isLoading"
        :options="options"
        :searchable="true"
        :deletable="true"
        :show-checkbox="true"
        :show-select-all="true"
        :remote="true"
        placeholder="選擇您會的程式語言"
        @search="handleSearch"
      />
    </div>
  </div>
</template>
