<script setup lang="ts">
import { computed, ref, SelectHTMLAttributes, useAttrs } from 'vue'

import { isCustomEmpty } from '@/helpers'

import { BaseSelectOption, SelectedValue } from './type'

const props = withDefaults(
  defineProps<{
    id: string
    multiple?: boolean
    labelNameKey?: string
    isRequired?: boolean
    isError?: boolean
    modelValue?: SelectedValue<BaseSelectOption | BaseSelectOption['value']>
    options: BaseSelectOption[]
    returnObject?: boolean
    disabled?: boolean
    wrapperClass?: string
    selectClass?: string
    optionClass?: string
  }>(),
  {
    labelNameKey: '',
    multiple: false,
    isRequired: false,
    isError: false,
    modelValue: undefined,
    returnObject: false,
    disabled: false,
    wrapperClass: '',
    selectClass: '',
    optionClass: '',
  },
)

const emits = defineEmits<{
  'update:modelValue': [value: SelectedValue<BaseSelectOption | BaseSelectOption['value']>]
  change: [value: SelectedValue<BaseSelectOption | BaseSelectOption['value']>]
}>()

const attrs = useAttrs() as SelectHTMLAttributes
const isControlled = computed(() => props.modelValue !== undefined)
const localValue = ref<SelectedValue<BaseSelectOption | BaseSelectOption['value']>>(
  props.multiple ? [] : undefined,
)

const internalValue = computed({
  get: () => (isControlled.value ? props.modelValue : localValue.value),
  set: (value: SelectedValue<BaseSelectOption | BaseSelectOption['value']>) => {
    isControlled.value ? emits('update:modelValue', value) : (localValue.value = value)
    emits('change', value)
  },
})

const selectedSelectNull = computed(() => {
  return isControlled.value ? isCustomEmpty(props.modelValue) : isCustomEmpty(localValue.value)
})
const selectedSelectNullStyleActive = computed(() => props.disabled || selectedSelectNull.value)

defineOptions({
  name: 'BaseSelect',
  inheritAttrs: false,
})
</script>

<template>
  <div class="base-select__wrapper" :class="wrapperClass">
    <div class="label__wrapper my-1 flex items-center">
      <label :for="props.id">{{ props.labelNameKey }}</label>
      <span v-if="props.isRequired" class="mx-1 text-red-500">*</span>
    </div>
    <select
      :id="props.id"
      v-model="internalValue"
      :multiple="props.multiple"
      class="base-select w-full truncate rounded border border-[#ccc] py-2 pr-8 pl-2 focus:border-blue-300 focus:ring-blue-300"
      :class="`${selectedSelectNullStyleActive ? 'text-normal-gray' : ''} ${props.isError ? '!border-red-500' : ''} ${selectClass}`"
      v-bind="attrs"
    >
      <option
        v-for="(option, index) in options"
        :key="`${option.label}-${index}`"
        :value="props.returnObject ? option : option.value"
        :class="optionClass"
        :disabled="option.disabled"
        class="base-select__option"
      >
        {{ option.label }}
      </option>
    </select>
  </div>
</template>
