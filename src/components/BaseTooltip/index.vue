<script setup lang="ts">
import {
  arrow,
  autoUpdate,
  computePosition,
  flip,
  offset,
  Placement,
  shift,
} from '@floating-ui/dom'
import { nextTick, onMounted, ref } from 'vue'

import { isMobileAgent } from '@/helpers'

const props = withDefaults(
  defineProps<{
    offsetValue?: number
    text?: { triggerArea: string; content: string }
    placement?: Placement
    className?: { triggerItem?: string; floatingDom?: string }
    tooltipBgColor?: string
    tooltipTextColor?: string
    arrowBorderColor?: string
  }>(),
  {
    offsetValue: 8,
    text: () => ({
      triggerArea: 'Trigger Text',
      content: 'Content Text',
    }),
    placement: 'right',
    className: () => ({
      triggerItem: '',
      floatingDom: '',
    }),
    tooltipBgColor: 'bg-gray-800',
    tooltipTextColor: 'text-black',
    arrowBorderColor: '',
  },
)

const triggerItem = ref()
const floatingDom = ref()
const floatingArrow = ref()
const displayTooltip = ref(false)
const position = ref({
  x: 0,
  y: 0,
})

const middleware = [offset(props.offsetValue), flip(), shift()]
const setFloating = async () => {
  autoUpdate(triggerItem.value, floatingDom.value, async () => {
    if (!triggerItem.value || !floatingDom.value || !floatingArrow.value) return
    const { x, y, placement, middlewareData } = await computePosition(
      triggerItem.value,
      floatingDom.value,
      {
        placement: props.placement,
        middleware: [...middleware, arrow({ element: floatingArrow.value })],
      },
    )

    const staticSideMap: Record<string, string> = {
      top: 'bottom',
      right: 'left',
      bottom: 'top',
      left: 'right',
    }
    const staticSide = staticSideMap[placement.split('-')[0]]

    Object.assign(floatingDom.value.style, {
      left: `${x}px`,
      top: `${y}px`,
    })

    const { x: arrowX, y: arrowY } = middlewareData.arrow || {}

    Object.assign(floatingArrow.value.style, {
      left: arrowX !== undefined ? `${arrowX}px` : '',
      top: arrowY !== undefined ? `${arrowY}px` : '',
      right: '',
      bottom: '',
      [staticSide]: '-4px',
    })
  })
}

onMounted(async () => {
  await nextTick()
  setFloating()
})

const getArrowClass = (placement: string) => {
  const side = placement.split('-')[0]
  const baseClass = 'floating-arrow absolute size-2 rotate-45'
  const borderColor = props.arrowBorderColor || props.tooltipBgColor.replace('bg-', 'border-')

  switch (side) {
    case 'top':
      return `${baseClass} border-b border-r ${borderColor}`
    case 'bottom':
      return `${baseClass} border-t border-l ${borderColor}`
    case 'left':
      return `${baseClass} border-t border-r ${borderColor}`
    case 'right':
      return `${baseClass} border-b border-l ${borderColor}`
    default:
      return `${baseClass} ${borderColor}`
  }
}

const showTooltip = (value: boolean, type: string) => {
  if (isMobileAgent()) {
    if (['mouse-enter'].includes(type)) return
  }
  displayTooltip.value = value
}

defineExpose({
  getArrowClass,
})
</script>

<template>
  <div class="base-tooltip relative w-fit text-sm/5">
    <div
      ref="triggerItem"
      class="trigger-item relative flex w-fit items-center"
      :class="className.triggerItem"
      @touchstart="showTooltip(true, 'touch-start')"
      @touchend="showTooltip(false, 'touch-end')"
      @mouseenter="showTooltip(true, 'mouse-enter')"
      @mouseleave="showTooltip(false, 'mouse-leave')"
    >
      <slot name="trigger">
        <span class="inline-block">{{ text.triggerArea }}</span>
      </slot>
    </div>

    <div
      v-show="displayTooltip"
      ref="floatingDom"
      :style="{
        top: `${position.x}px`,
        left: `${position.y}px`,
        width: 'max-content',
      }"
      class="floating-dom absolute left-0 top-0 z-20 w-max rounded-sm p-2"
      :class="[className.floatingDom, tooltipBgColor, tooltipTextColor]"
    >
      <slot name="content">
        {{ text.content }}
      </slot>
      <div ref="floatingArrow" :class="[tooltipBgColor, getArrowClass(props.placement)]" />
    </div>
  </div>
</template>
