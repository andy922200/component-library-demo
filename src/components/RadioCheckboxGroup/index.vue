<script setup lang="ts">
import { computed } from 'vue'

defineOptions({
  name: 'RadioCheckboxGroup',
})

const props = withDefaults(
  defineProps<{
    modelValue?: string
    options?: { label: string; value: string }[]
    groupWrapperClass?: string[]
    optionClass?: string[]
    inputClass?: string[]
    labelClass?: string[]
  }>(),
  {
    modelValue: undefined,
    options: () => [],
    groupWrapperClass: () => [],
    optionClass: () => [],
    inputClass: () => [],
    labelClass: () => [],
  },
)
const emits = defineEmits(['update:modelValue'])

const selectedOption = computed({
  get: () => props.modelValue,
  set: (value: string | undefined) => {
    emits('update:modelValue', value)
  },
})

const triggerClick = (event: Event, value: string) => {
  if (value === selectedOption.value) {
    event.preventDefault()
    return
  }

  selectedOption.value = value
}
</script>

<template>
  <div
    class="radio-checkbox-group__wrapper flex w-full flex-wrap items-center"
    :class="props.groupWrapperClass"
  >
    <div
      v-for="option in props.options"
      :key="option.value"
      class="radio-checkbox__wrapper flex items-center"
      :class="props.optionClass"
    >
      <input
        :id="`${option.value}`"
        :modelValue="selectedOption"
        :checked="selectedOption === option.value"
        :value="option.value"
        type="checkbox"
        class="ring-0 focus:ring-0"
        :class="props.inputClass"
        @click.stop="triggerClick($event, option.value)"
      />
      <label class="mx-2" :class="props.labelClass" :for="option.value">
        <slot name="labelText">
          {{ option.label }}
        </slot>
      </label>
    </div>
  </div>
</template>
