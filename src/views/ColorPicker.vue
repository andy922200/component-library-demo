<script setup lang="ts">
import { ref } from 'vue'

import ColorPicker from '@/components/ColorPicker/index.vue'

const mainColor = ref('#ff00ff')

defineOptions({
  name: 'DemoColorPicker',
})
</script>

<template>
  <div class="w-full">
    <h1 class="w-full text-center text-lg">Color Picker 顏色挑選</h1>

    <ColorPicker v-model="mainColor" label="主色調" class="my-2 justify-center" />
  </div>
</template>
