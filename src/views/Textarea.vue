<script setup lang="ts">
import { ref } from 'vue'

import BaseTextarea from '@/components/BaseTextarea/index.vue'

const textareaInput = ref({
  val: '',
  isError: false,
})

defineOptions({
  name: 'DemoTextarea',
})
</script>

<template>
  <div class="w-full">
    <h1 class="text-center text-lg">Textarea 多行文字輸入</h1>

    <div class="flex w-full justify-center">
      <BaseTextarea id="textarea" v-model="textareaInput.val" :rows="4" :max-length="200" />
    </div>
  </div>
</template>
