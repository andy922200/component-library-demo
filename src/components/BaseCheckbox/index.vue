<script setup lang="ts">
import { computed, PropType, ref } from 'vue'

defineOptions({
  name: 'BaseCheckbox',
})

const props = defineProps({
  modelValue: {
    type: Boolean as PropType<boolean>,
    default: undefined,
  },
  bgColor: {
    type: String as PropType<string>,
    default: '#eeeeee',
  },
  borderColor: {
    type: String as PropType<string>,
    default: '#cccccc',
  },
  checkedBgColor: {
    type: String as PropType<string>,
    default: '#ffffff',
  },
  checkedBorderColor: {
    type: String as PropType<string>,
    default: '#cccccc',
  },
  defaultMarkIconColor: {
    type: String as PropType<string>,
    default: '#484848',
  },
  disabled: {
    type: Boolean as PropType<boolean>,
    default: false,
  },
})

const emits = defineEmits<{
  'update:modelValue': [value: boolean]
  change: [value: boolean]
}>()
const isControlled = computed(() => props.modelValue !== undefined)
const localValue = ref(false)

const internalValue = computed({
  get: () => (isControlled.value ? props.modelValue : localValue.value),
  set: (value) => {
    isControlled.value
      ? emits('update:modelValue', Boolean(value))
      : (localValue.value = Boolean(value))

    emits('change', Boolean(value))
  },
})
</script>

<template>
  <label
    class="base-checkbox flex items-center text-sm select-none"
    :class="{
      'cursor-not-allowed opacity-60': disabled,
      'cursor-pointer': !disabled,
    }"
  >
    <input
      v-model="internalValue"
      type="checkbox"
      class="absolute opacity-0"
      :class="{
        'cursor-pointer': !disabled,
        'cursor-not-allowed': disabled,
      }"
      :disabled="disabled"
    />

    <span
      class="base-checkbox__mark relative left-0 mr-1.5 size-5 rounded border"
      :style="{
        backgroundColor: disabled ? '#eeeeee' : internalValue ? checkedBgColor : bgColor,
        borderColor: disabled ? '#cccccc' : internalValue ? checkedBorderColor : borderColor,
      }"
    >
      <span v-if="internalValue && !disabled" class="base-checkbox__mark-wrapper">
        <slot name="mark-icon">
          <span
            class="base-checkbox__mark-icon"
            :style="{
              borderColor: defaultMarkIconColor,
            }"
          />
        </slot>
      </span>
    </span>

    <span class="inline-block flex-1"><slot /></span>
  </label>
</template>

<style scoped lang="scss">
.base-checkbox {
  .base-checkbox__mark {
    .base-checkbox__mark-wrapper {
      display: none;
    }

    .base-checkbox__mark-icon {
      position: absolute;
      left: 0.375rem;
      top: 0.1237rem;
      width: 0.375rem;
      height: 0.75rem;
      border: solid;
      border-width: 0 0.125rem 0.125rem 0;
      transform: rotate(45deg);
    }
  }

  input:checked ~ .base-checkbox__mark {
    .base-checkbox__mark-wrapper {
      display: block;
    }
  }
}
</style>
