<script setup lang="ts">
import { isEmpty } from 'lodash-es'
import { computed, ref, withDefaults } from 'vue'

import dayjs from '@/plugins/dayjs'
import PhCaretLeftLight from '~icons/ph/caret-left-light'
import PhCaretRightLight from '~icons/ph/caret-right-light'

import CalendarCell from './CalendarCell.vue'
import { weekdayTextLang } from './lang'

defineOptions({
  name: 'BaseCalendar',
})

const props = withDefaults(
  defineProps<{
    modelValue?: string
    minDate?: Date
    maxDate?: Date
    defaultMaxYearToRender?: number
    holidayList?: string[]
    showBarList?: string[]
    dateStrFormat?: string
    weekdayTextList?: { full: string; brief: string }[]
    calendarHeaderText?: string
    holidayColor?: string
    showBarColor?: string
    startOfWeek?: number
  }>(),
  {
    modelValue: undefined,
    minDate: undefined,
    maxDate: undefined,
    defaultMaxYearToRender: 1,
    holidayList: () => [],
    showBarList: () => [],
    dateStrFormat: 'YYYY/MM/DD',
    weekdayTextList: () => weekdayTextLang.en,
    calendarHeaderText: 'YYYY / MM',
    holidayColor: '#ff9600',
    showBarColor: '#aabbcc',
    startOfWeek: 0,
  },
)

const ROWS_PER_VIEW = 7 * 6

const todayObj = props.minDate
  ? dayjs(props.minDate)
  : isEmpty(props.modelValue)
    ? dayjs()
    : dayjs(props.modelValue)
let firstDayInView = ref(todayObj.startOf('month'))

const minDateObj = props.minDate
  ? todayObj
  : todayObj.subtract(props.defaultMaxYearToRender, 'year')
const maxDateObj = props.maxDate
  ? dayjs(props.maxDate)
  : todayObj.add(props.defaultMaxYearToRender, 'year')

// 如果没有提供 minDate，而 maxDate 小於今天，則拋出錯誤
if (!props.minDate && maxDateObj.isBefore(todayObj.startOf('day'))) {
  throw new Error('maxDate should not be earlier than today if minDate is not provided.')
}

// 檢查 maxDate 是否小於 minDate
if (maxDateObj.isBefore(minDateObj)) {
  throw new Error('maxDate should be greater than minDate. Please check your props.')
}

const isControlled = computed(() => props.modelValue !== undefined)
const localValue = ref(todayObj.format(props.dateStrFormat))

const emits = defineEmits(['update:modelValue'])
const internalValue = computed({
  get: () =>
    isControlled.value
      ? props.modelValue || todayObj.format(props.dateStrFormat)
      : localValue.value,
  set: (value: string) => {
    isControlled.value ? emits('update:modelValue', value) : (localValue.value = value)
  },
})

if (isControlled.value && isEmpty(props.modelValue)) {
  emits('update:modelValue', internalValue.value)
}

const CALENDAR_HEADER_TEXT = computed(() => firstDayInView.value.format(props.calendarHeaderText))
const CALENDAR_DATE_ARR = computed(() => {
  return [...new Array(ROWS_PER_VIEW)].map((_, idx) => {
    const dayOffset = (firstDayInView.value.day() - props.startOfWeek + 7) % 7
    const idxDiff = idx - dayOffset
    const dayObj = firstDayInView.value.add(idxDiff, 'day')
    const fullDateText = dayObj.format(props.dateStrFormat)
    const isInView =
      dayObj.isSameOrAfter(minDateObj, 'day') &&
      dayObj.isSame(firstDayInView.value, 'month') &&
      dayObj.isSameOrBefore(maxDateObj)
    const isThisDayHoliday = props.holidayList.filter((i) => dayjs(i).isSame(dayObj)).length > 0
    const isThisDayShouldShowBar =
      props.showBarList.filter((i) => dayjs(i).isSame(dayObj)).length > 0

    return {
      fullDateText,
      briefDateText: `${dayObj.date()}`,
      isInView,
      isHoliday: isThisDayHoliday,
      shouldShowBar: isInView && isThisDayShouldShowBar,
    }
  })
})
const adjustedWeekdayTextList = computed(() => {
  return props.weekdayTextList
    .slice(props.startOfWeek)
    .concat(props.weekdayTextList.slice(0, props.startOfWeek))
})
const isPrevBtnDisabled = computed(() => firstDayInView.value.isSame(minDateObj, 'month'))
const isNextBtnDisabled = computed(() => firstDayInView.value.isSame(maxDateObj, 'month'))

// 往前一個月
const goNext = () => {
  if (firstDayInView.value.isSame(maxDateObj, 'month')) return

  firstDayInView.value = firstDayInView.value.add(1, 'month')
  internalValue.value = firstDayInView.value.format(props.dateStrFormat)
}

// 往後一個月
const goPrev = () => {
  if (firstDayInView.value.isSame(minDateObj, 'month')) return

  firstDayInView.value = firstDayInView.value.subtract(1, 'month')

  if (firstDayInView.value.isSame(minDateObj, 'month')) {
    internalValue.value = minDateObj.format(props.dateStrFormat)
    return
  }

  internalValue.value = firstDayInView.value.format(props.dateStrFormat)
}
</script>

<template>
  <div class="mb-4 w-full overflow-hidden rounded-md shadow-md select-none md:mb-0">
    <div
      class="calender-header flex min-h-[3.2rem] w-full items-center justify-between bg-[#80808014] px-3 text-lg"
    >
      <button
        class="prev-btn"
        :class="{ 'pointer-events-none opacity-0': isPrevBtnDisabled }"
        @click="goPrev"
      >
        <PhCaretLeftLight width="20" height="20" />
      </button>
      <span>{{ CALENDAR_HEADER_TEXT }}</span>
      <button
        class="next-btn"
        :class="{ 'pointer-events-none opacity-0': isNextBtnDisabled }"
        @click="goNext"
      >
        <PhCaretRightLight width="20" height="20" />
      </button>
    </div>
    <div class="p-1">
      <div class="flex flex-wrap">
        <!-- 星期欄位 -->
        <div
          v-for="{ full, brief } in adjustedWeekdayTextList"
          :key="full"
          :data-full="full"
          :data-brief="brief"
          class="flex w-1/7 items-center justify-center py-3 text-center text-[0.85rem] text-gray-400 select-none before:content-[attr(data-brief)] md:before:content-[attr(data-full)]"
        />
      </div>
      <div class="relative flex flex-wrap">
        <!-- 日期數字欄位 -->
        <CalendarCell
          v-for="num in 42"
          :key="num"
          :date-obj="CALENDAR_DATE_ARR[num - 1]"
          :selected-date="internalValue"
          :holiday-color="props.holidayColor"
          :show-bar-color="props.showBarColor"
          @date-select="
            (value: string) => {
              internalValue = value
            }
          "
        />
      </div>
    </div>
  </div>
</template>
