<script setup lang="ts">
import { useWindowSize } from '@vueuse/core'

import BaseTooltip from '@/components/BaseTooltip/index.vue'

const { width: windowWidth } = useWindowSize()

defineOptions({
  name: 'DemoTooltip',
})
</script>

<template>
  <div class="w-full">
    <h1 class="text-center text-lg">Tooltip 工具提示框</h1>

    <div class="flex items-center justify-center">
      <BaseTooltip
        :offset-value="4"
        :placement="windowWidth < 768 ? 'top' : 'right'"
        :class-name="{
          floatingDom: 'border border-green-300 text-[#484848]',
          arrowColor: 'bg-green-300',
        }"
      >
        <template #trigger>
          <button class="inline-block rounded border bg-gray-100 p-4">Here</button>
        </template>

        <template #content>
          <span>Content in Tooltip</span>
        </template>
      </BaseTooltip>
    </div>
  </div>
</template>
