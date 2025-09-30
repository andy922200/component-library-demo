<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  modelValue: string
  label?: string
}>()

const emits = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const innerValue = computed({
  get: () => props.modelValue,
  set: (value: string) => emits('update:modelValue', value),
})

defineOptions({
  name: 'ColorPicker',
})
</script>

<template>
  <div class="color-picker flex items-center gap-4">
    <span class="w-20 text-gray-700">{{ label }}</span>
    <div
      class="relative h-8 w-10 cursor-pointer overflow-hidden rounded border border-[#CDD9ED]"
      :style="{ backgroundColor: innerValue }"
    >
      <input
        v-model="innerValue"
        type="color"
        list="colors"
        class="absolute top-0 left-0 size-full cursor-pointer opacity-0"
        tabindex="-1"
      />
    </div>
  </div>
</template>
