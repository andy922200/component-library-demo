<script setup lang="ts">
import { ButtonGroupOption } from './type'

const props = withDefaults(
  defineProps<{
    options: ButtonGroupOption[]
    modelValue: string | number
    buttonStyle?: {
      base?: string
      active?: string
      inactive?: string
      disabled?: string
    }
  }>(),
  {
    buttonStyle: () => ({
      base: 'border px-2 md:px-4 py-0.5 border-[#ccc]',
      active: 'bg-[#484848] text-white',
      inactive: 'bg-white text-black hover:bg-[#cccccc30]',
      disabled: 'cursor-not-allowed border-[#ccc] bg-[#cccccc50] !text-[#ccc] pointer-events-none',
    }),
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', val: string | number): void
}>()

const getClass = ({
  option,
  val,
  index,
}: {
  option: ButtonGroupOption
  val: string | number
  index: number
}) => {
  const isFirst = index === 0
  const isLast = index === props.options.length - 1
  const isActive = val === props.modelValue

  return [
    isFirst ? 'rounded-l border-r-0' : '',
    isLast ? 'rounded-r' : index !== props.options.length - 1 ? 'border-r-0' : '',
    props.buttonStyle.base,
    option.disabled ? props.buttonStyle.disabled : '',
    isActive ? props.buttonStyle.active : props.buttonStyle.inactive,
  ]
}
</script>

<template>
  <div class="button-group flex">
    <button
      v-for="(option, index) in options"
      :key="option.value"
      :class="getClass({ option, val: option.value, index })"
      :disabled="option.disabled"
      @click="emit('update:modelValue', option.value)"
    >
      <slot name="label" :option="option">
        {{ option.label }}
      </slot>
    </button>
  </div>
</template>
