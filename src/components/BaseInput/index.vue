<script setup lang="ts">
import { computed, ref } from 'vue'

defineOptions({
  name: 'BaseInput',
})

const props = withDefaults(
  defineProps<{
    id: string
    modelValue?: string | number
    labelName?: string
    isRequired?: boolean
    disabled?: boolean
    class?: string
    wrapperClass?: string
    isError?: boolean
    type?: string
    placeholder?: string
    max?: number
    maxLength?: number
    hasAppend?: boolean
    validateFunc?: (value: string) => boolean
  }>(),
  {
    modelValue: '',
    labelName: '',
    isRequired: false,
    disabled: false,
    class: '',
    wrapperClass: '',
    isError: false,
    type: 'text',
    placeholder: '',
    max: undefined,
    maxLength: undefined,
    hasAppend: false,
    validateFunc: undefined,
  },
)

const emits = defineEmits(['update:modelValue', 'validate'])
const isControlled = computed(() => props.modelValue !== undefined)
const localValue = ref(props.modelValue)

const internalValue = computed({
  get: () => (isControlled.value ? props.modelValue : localValue.value),
  set: (value) => {
    isControlled.value ? emits('update:modelValue', value) : (localValue.value = value)
    emits('update:modelValue', value)
  },
})

const handleBlur = () => {
  if (props.validateFunc) {
    const isValid = props.validateFunc(String(internalValue.value))
    emits('validate', isValid)
  }
}
</script>

<template>
  <div class="base-input__wrapper" :class="wrapperClass">
    <div class="label__wrapper my-1 flex items-center">
      <label :for="props.id">{{ props.labelName }}</label>
      <span v-if="props.isRequired" class="mx-1 text-red-500">*</span>
      <slot name="append-label" />
    </div>

    <div class="base-input relative">
      <input
        :id="props.id"
        v-model="internalValue"
        :class="`${props.isError ? 'border-red-500' : 'border-gray-300'} ${props.hasAppend ? 'pr-10' : ''} ${props.class}`"
        :type="props.type"
        :placeholder="props.placeholder"
        :maxlength="props.maxLength ? props.maxLength : undefined"
        :max="props.max"
        :disabled="props.disabled"
        class="base-input w-full rounded border px-2 focus:border-blue-300 focus:ring-0 focus:ring-blue-300"
        @change="handleBlur"
      />

      <div v-if="props.hasAppend" class="base-input__append absolute top-2 right-1.5">
        <slot name="append" />
      </div>
    </div>
  </div>
</template>
