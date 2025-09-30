<script setup lang="ts">
import { computed, ref } from 'vue'

defineOptions({
  name: 'BaseTextarea',
})

const props = withDefaults(
  defineProps<{
    id: string
    modelValue?: string | number
    labelName?: string
    labelWrapperClass?: string
    isRequired?: boolean
    disabled?: boolean
    class?: string
    wrapperClass?: string
    textareaWrapperClass?: string
    isError?: boolean
    rows?: number
    placeholder?: string
    minLength?: number
    maxLength?: number
    hasAppend?: boolean
    showLabel?: boolean
  }>(),
  {
    modelValue: '',
    labelName: '',
    labelWrapperClass: '',
    isRequired: false,
    disabled: false,
    class: '',
    wrapperClass: '',
    textareaWrapperClass: '',
    isError: false,
    rows: 2,
    placeholder: '',
    minLength: undefined,
    maxLength: undefined,
    hasAppend: false,
    showLabel: true,
  },
)

const emits = defineEmits(['update:modelValue'])
const isControlled = computed(() => props.modelValue !== undefined)
const localValue = ref(props.modelValue)

const internalValue = computed({
  get: () => (isControlled.value ? props.modelValue : localValue.value),
  set: (value) => {
    isControlled.value ? emits('update:modelValue', value) : (localValue.value = value)
  },
})
</script>

<template>
  <div class="base-textarea__wrapper" :class="wrapperClass">
    <div v-if="props.showLabel" class="label__wrapper flex items-center" :class="labelWrapperClass">
      <label :for="props.id">{{ props.labelName }}</label>
      <span v-if="props.isRequired" class="mx-1 text-red-500">*</span>
      <slot name="append-label" />
    </div>

    <div class="base-textarea relative" :class="props.textareaWrapperClass">
      <textarea
        :id="props.id"
        v-model="internalValue"
        class="base-textarea rounded border-[#cccccc] px-4 py-2 focus:border-blue-300 focus:ring-0 focus:ring-blue-300 focus-visible:shadow-none focus-visible:outline-none"
        :class="[
          props.isError ? 'border-red-500' : 'border-[#cccccc]',
          props.hasAppend ? 'pr-10' : '',
          props.class,
        ]"
        :placeholder="props.placeholder"
        :rows="props.rows"
        :minlength="props.minLength"
        :maxlength="props.maxLength"
        :disabled="props.disabled"
      />

      <div v-if="props.hasAppend" class="base-textarea__append absolute top-2 right-1.5">
        <slot name="append" />
      </div>
    </div>
  </div>
</template>
