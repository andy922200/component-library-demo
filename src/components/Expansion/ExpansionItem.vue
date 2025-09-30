<script setup lang="ts">
import { defineEmits, defineProps } from 'vue'

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  isFirst: {
    type: Boolean,
    required: false,
    default: false,
  },
  isLast: {
    type: Boolean,
    required: false,
    default: false,
  },
  isOpen: {
    type: Boolean,
    required: false,
    default: false,
  },
  single: {
    type: Boolean,
    required: false,
    default: false,
  },
  fullBorder: {
    type: Boolean,
    required: false,
    default: false,
  },
  headerClass: {
    type: String,
    required: false,
    default: '',
  },
  caretClass: {
    type: String,
    required: false,
    default: '',
  },
})

const emits = defineEmits(['toggle'])
</script>

<template>
  <div class="expansion-item" @click="() => emits('toggle')">
    <div
      class="expansion-item__wrapper cursor-pointer px-4 py-2 font-bold select-none"
      :class="{
        'rounded-t-lg': props.isFirst,
        'border-b border-b-gray-300': !props.fullBorder,
        'border border-gray-300': props.fullBorder,
      }"
    >
      <div class="expansion-item__header flex w-full" :class="`${headerClass}`">
        <slot name="header">
          {{ title }}
        </slot>

        <span
          class="mx-2 inline-block transition-transform duration-[0.3s] ease-[ease]"
          :class="`${caretClass} ${isOpen ? 'rotate-180' : ''}`"
        >
          <slot name="caret-icon"></slot>
        </span>
      </div>
    </div>
    <div
      v-show="isOpen"
      class="expansion-item__body px-4 py-2 transition-[max-height] duration-[0.2s] ease-[ease-out]"
      :class="{
        'border-b-0': props.isLast && !props.fullBorder,
        'border-b border-b-gray-300': !props.fullBorder,
        'border border-gray-300': props.fullBorder,
      }"
    >
      <slot name="expand-area" />
    </div>
  </div>
</template>
