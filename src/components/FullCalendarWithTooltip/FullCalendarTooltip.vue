<script setup lang="ts">
import { onClickOutside } from '@vueuse/core'
import { computed, defineProps, ref } from 'vue'

const props = defineProps<{
  x: number
  y: number
  visible: boolean
}>()
const emits = defineEmits(['update:visible'])

const fullCalendarTooltip = ref<HTMLElement | null>(null)
const internalVisible = computed({
  get: () => props.visible,
  set: (value) => {
    emits('update:visible', value)
  },
})

onClickOutside(fullCalendarTooltip, () => {
  internalVisible.value = false
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="internalVisible"
      ref="fullCalendarTooltip"
      :style="{ left: `${props.x}px`, top: `${props.y}px` }"
      class="full-calendar__tooltip absolute z-[10000] w-[280px] rounded-lg border border-gray-200 bg-white p-3 text-sm text-gray-800 shadow-lg"
    >
      <slot />
    </div>
  </Teleport>
</template>
