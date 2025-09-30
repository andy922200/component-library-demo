<script setup lang="ts">
import { computed, ref, watch, withDefaults } from 'vue'

import BaseSwitch from '@/components/BaseSwitch/index.vue'
import { generateDailyTimeSlots } from '@/helpers/utils'

import { RecurTimeSelectorEmitItem, WeekDayItem, weekDayLocale } from './type'

const props = withDefaults(
  defineProps<{
    closeAllSelector?: boolean
    weekStartDay?: number
    timeSlotDuration?: number
    disabledDays?: number[]
    locale?: 'en' | 'zh_tw' | 'zh_cn'
    isAbbrText?: boolean
    selectClass?: string
    optionClass?: string
  }>(),
  {
    closeAllSelector: false,
    weekStartDay: 0,
    timeSlotDuration: 30,
    disabledDays: () => [],
    locale: 'zh_tw',
    isAbbrText: false,
    selectClass:
      'w-full truncate rounded border border-[#ccc] py-2 pl-2 pr-8 focus:border-blue-300 focus:ring-blue-300 min-w-32',
    optionClass: '',
  },
)

const emits = defineEmits<{
  change: [value: RecurTimeSelectorEmitItem[]]
}>()

const weekDaysRaw = ref<WeekDayItem[]>([])
const dynamicWeekDayArray = computed(() => {
  const startIndex = props.weekStartDay
  return [...weekDaysRaw.value.slice(startIndex), ...weekDaysRaw.value.slice(0, startIndex)]
})

const updateWeekDays = () => {
  weekDaysRaw.value = Array.from({ length: 7 }, (_, weekday) => {
    const isDisableDay = props.disabledDays.includes(weekday)

    return {
      selectedStartTime: '',
      selectedEndTime: '',
      value: weekday.toString(),
      text: props.isAbbrText
        ? weekDayLocale[props.locale]?.[weekday].abbr
        : weekDayLocale[props.locale]?.[weekday].full,
      isToggle: false,
      isDisableDay,
      startTimeOptions: isDisableDay
        ? []
        : [
            { start: '', end: '', weekday: '' },
            ...generateDailyTimeSlots({
              timeSlotDuration: props.timeSlotDuration,
              weekday: weekday.toString(),
            }),
          ],
      endTimeOptions: isDisableDay ? [] : [{ start: '', end: '', weekday: '' }],
    }
  })
}

const setupStartTimeWatchers = () => {
  // 監聽每一天的開始時間，並單獨更新其結束時間選單
  dynamicWeekDayArray.value.forEach((item) => {
    watch(
      () => item.selectedStartTime,
      () => {
        item.selectedEndTime = ''
        item.endTimeOptions = [
          { start: '', end: '', weekday: '' },
          ...item.startTimeOptions.filter((option) => {
            if (!item.selectedStartTime) return false
            return option.start >= item.selectedStartTime
          }),
        ]
      },
      { deep: true },
    )
  })
}

// 監聽 disabledDays 的變化，並更新 weekDaysRaw 和重新設定 startTime 的 watch
watch(
  () => props.disabledDays,
  () => {
    updateWeekDays()
    setupStartTimeWatchers()
  },
  { deep: true, immediate: true },
)

watch(
  () => dynamicWeekDayArray.value,
  (newVal) => {
    const toggleResult: RecurTimeSelectorEmitItem[] = newVal
      .filter((item) => item.isToggle)
      .map((item) => ({
        selectedStartTime: item.selectedStartTime,
        selectedEndTime: item.selectedEndTime,
        weekday: item.value,
        text: item.text,
        isValid: !!item.selectedStartTime && !!item.selectedEndTime,
      }))
    emits('change', toggleResult)
  },
  { deep: true },
)

defineOptions({
  name: 'RecurTimeSelector',
})
</script>

<template>
  <div class="recur-time-selector flex flex-wrap">
    <div
      v-for="(item, index) in dynamicWeekDayArray"
      :key="index"
      class="my-4 flex w-full flex-wrap items-center px-4 lg:my-2 lg:justify-center lg:px-0"
    >
      <div class="label__wrapper mr-2 mb-2 w-full lg:mb-0 lg:w-auto">
        <label :for="`toggle-${index}`" class="mx-2">{{ item.text }}</label>
        <span v-if="item.isDisableDay" class="inline-block w-20 text-center">
          <slot name="disable-day-text">無適用時段</slot>
        </span>
        <BaseSwitch
          v-else
          :id="`toggle-${index}`"
          v-model:value="item.isToggle"
          :disabled="closeAllSelector"
          class="w-20"
          switch-on-color="#3A7DC9"
        />
      </div>

      <div class="start-options__wrapper w-1/2 px-2 lg:w-auto" :class="{ hidden: !item.isToggle }">
        <select
          :id="`start-${index}`"
          v-model="item.selectedStartTime"
          :disabled="!item.isToggle || closeAllSelector"
          :class="[props.selectClass, item.selectedStartTime.length === 0 ? 'border-red-500' : '']"
        >
          <option
            v-for="(option, optionIndex) in item.startTimeOptions"
            :key="`start-${index}-${optionIndex}`"
            :value="option.start"
            :class="[props.optionClass]"
            :disabled="option.start === ''"
          >
            {{ option.start === '' ? $t('please-select-start-time') : option.start }}
          </option>
        </select>
      </div>

      <div class="end-options__wrapper w-1/2 pl-2 lg:w-auto" :class="{ hidden: !item.isToggle }">
        <select
          :id="`end-${index}`"
          v-model="item.selectedEndTime"
          :disabled="!item.isToggle || closeAllSelector"
          :class="[props.selectClass, item.selectedEndTime.length === 0 ? 'border-red-500' : '']"
        >
          <option
            v-for="(option, optionIndex) in item.endTimeOptions"
            :key="`end-${index}-${optionIndex}`"
            :value="option.end"
            :class="[props.optionClass]"
            :disabled="option.end === ''"
          >
            {{ option.end === '' ? $t('please-select-end-time') : option.end }}
          </option>
        </select>
      </div>
    </div>
  </div>
</template>
