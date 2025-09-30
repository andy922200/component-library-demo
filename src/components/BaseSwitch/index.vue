<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  value: {
    type: Boolean,
    default: false,
  },
  width: {
    type: Number,
    default: 40,
  },
  offSideStr: {
    type: String,
    default: '',
  },
  onSideStr: {
    type: String,
    default: '',
  },
  activeStrColor: {
    type: String,
    default: '#333333',
  },
  inactiveStrColor: {
    type: String,
    default: '#d6d6d6',
  },
  switchOffColor: {
    type: String,
    default: '#d6d6d6',
  },
  switchOnColor: {
    type: String,
    default: '#00b300',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})
const emits = defineEmits(['update:value'])

const isBaseSwitchOn = computed({
  get: () => props.value,
  set: (value) => {
    if (props.disabled) return
    emits('update:value', value)
  },
})

// Function to generate a random ID
const generateRandomId = () => {
  return `switch-${Math.random().toString(36).slice(2, 9)}`
}
const switchId = generateRandomId()

defineExpose({ isBaseSwitchOn })
defineOptions({
  name: 'BaseSwitch',
})
</script>

<template>
  <div class="base-switch inline-flex items-center p-1">
    <span
      v-if="props.offSideStr"
      class="off mx-1 my-0 max-w-[120px] min-w-[60px] truncate text-center text-sm text-[#cccccc]"
      :style="{ color: isBaseSwitchOn ? inactiveStrColor : activeStrColor }"
    >
      {{ $t(offSideStr) }}
    </span>
    <div class="relative mx-2 flex items-center justify-end">
      <input
        :id="switchId"
        v-model="isBaseSwitchOn"
        :disabled="props.disabled"
        type="checkbox"
        class="switch-checkbox hidden"
      />
      <label
        class="switch-background relative m-0 flex h-3 items-center justify-start rounded-[1em] border border-solid border-[#ccc] bg-[#cccccc] px-0 py-[0.1em] transition-all duration-[0.3s] ease-[ease]"
        :for="switchId"
        :class="[props.disabled ? 'cursor-not-allowed' : 'cursor-pointer']"
        :style="{
          width: `${width}px`,
          background: isBaseSwitchOn ? switchOnColor : switchOffColor,
        }"
      />
      <div
        class="circle absolute -left-2 size-5 rounded-[100%] border border-solid border-[#d6d6d6] bg-white transition-all duration-[0.3s] ease-[ease]"
        :style="{ transform: `translateX(${isBaseSwitchOn ? width : 0}px)` }"
      />
    </div>
    <span
      v-if="props.onSideStr"
      class="on mx-3 my-0 max-w-[120px] min-w-[60px] truncate text-center text-sm text-[#cccccc]"
      :style="{ color: isBaseSwitchOn ? activeStrColor : inactiveStrColor }"
    >
      {{ $t(onSideStr) }}
    </span>
  </div>
</template>
