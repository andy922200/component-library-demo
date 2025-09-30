<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'

import { useTimeSelector } from '@/composables/useTimeSelector'
import type { TimeSlotFromAPI } from '@/composables/useTimeSelector/type'
import dayjs from '@/plugins/dayjs'

defineOptions({
  name: 'DemoTimeSelector',
})

// 常數和初始化
const dateFormatStr = 'YYYY-MM-DD'
const todayDayjs = dayjs()
const yesterdayDayjs = todayDayjs.subtract(1, 'day')
const tomorrowDayjs = todayDayjs.add(1, 'day')
const selectedDateRef = ref(todayDayjs.format(dateFormatStr))
const selectedStartTimeRef = ref('')
const selectedEndDateTimeRef = ref('')

const {
  usedTimeSlots,
  selectedEndObj,
  timeSector,
  maxUsageHours,
  minUsageHours,
  generateCrossDay,
  isNowActive,
  startTimeOptions,
  endTimeOptions,
  updateUsedTimeSlots,
  resetStartTime,
  resetEndTime,
} = useTimeSelector([], {
  timeSector: 30,
  maxUsageHours: 24,
  minUsageHours: 0.5,
  generateCrossDay: true,
  isNowActive: true,
  externalRefs: {
    selectedDate: selectedDateRef,
    selectedStartTime: selectedStartTimeRef,
    selectedEndDateTime: selectedEndDateTimeRef,
  },
  defaultOptions: {
    startTime: {
      label: 'please-select-start-time',
      value: '',
    },
    endTime: {
      label: 'please-select-end-time',
      value: '',
    },
  },
})

// 選項配置
const maxUsageHoursOptions = Array.from({ length: 24 }, (_, i) => i + 1)
const minUsageHoursOptions = computed(() => {
  const maxHours = 1
  return Array.from(
    { length: maxHours / (timeSector.value / 60) },
    (_, i) => (i + 1) * (timeSector.value / 60),
  )
})
const timeSectorOptions = [15, 30, 60]

// 模擬 API 請求
const fetchUsedTimeSlots = async (): Promise<TimeSlotFromAPI[]> => {
  await new Promise((r) => setTimeout(r, 500))
  return [
    { startTime: '21:00', endTime: '22:30', date: yesterdayDayjs.format(dateFormatStr) },
    { startTime: '08:00', endTime: '08:30', date: todayDayjs.format(dateFormatStr) },
    { startTime: '23:00', endTime: '23:30', date: todayDayjs.format(dateFormatStr) },
    { startTime: '00:00', endTime: '00:50', date: tomorrowDayjs.format(dateFormatStr) },
    { startTime: '20:30', endTime: '23:30', date: tomorrowDayjs.format(dateFormatStr) },
  ]
}

// 載入初始資料
onMounted(async () => {
  // 設定初始日期
  selectedDateRef.value = todayDayjs.format(dateFormatStr)

  // 載入已佔用的時間段
  const mockUsedTimeSlots = await fetchUsedTimeSlots()
  updateUsedTimeSlots({
    newUsedTimeSlots: mockUsedTimeSlots,
  })
})

// 事件處理器
const handleMinHourChange = () => {
  resetEndTime()
}

const handleMaxHourChange = () => {
  resetEndTime()
}

const handleTimeSectorChange = () => {
  // 檢查當前的 minUsageHours 是否還有效
  if (!minUsageHoursOptions.value.includes(minUsageHours.value)) {
    minUsageHours.value = minUsageHoursOptions.value[0]
  }

  resetStartTime()
}

const handleGenerateCrossDayChange = () => {
  resetEndTime()
}

const handleIsNowActiveChange = () => {
  resetStartTime()
}

// 監聽配置變化來重置相關選項
watch([generateCrossDay], () => {
  resetEndTime()
})

watch([isNowActive], () => {
  resetStartTime()
})

watch([minUsageHours, maxUsageHours], () => {
  resetEndTime()
})
</script>

<template>
  <div class="w-full">
    <h1 class="text-center text-lg">Time Selector 選擇器</h1>

    <!-- 顯示已佔用的時間段 -->
    <div class="flex items-center justify-center">
      <h3 class="m-2">{{ $t('used-time-slots') }}</h3>
      <ul>
        <li v-for="slot in usedTimeSlots" :key="slot.startTime">
          <p>{{ slot.date }} {{ slot.startTime }} ~ {{ slot.endTime }}</p>
        </li>
      </ul>
    </div>

    <!-- 配置選項 -->
    <div class="flex flex-wrap items-center justify-center">
      <div class="m-2 flex flex-wrap">
        <div class="mx-2">
          <label for="generate-cross-day">{{ $t('generate-cross-day') }}：</label>
          <input
            id="generate-cross-day"
            v-model="generateCrossDay"
            type="checkbox"
            @change="handleGenerateCrossDayChange"
          />
        </div>

        <div class="mx-2">
          <label for="is-now-active">{{ $t('is-now-active') }}：</label>
          <input
            id="is-now-active"
            v-model="isNowActive"
            type="checkbox"
            @change="handleIsNowActiveChange"
          />
        </div>
      </div>
    </div>

    <!-- 時間配置選項 -->
    <div class="flex flex-wrap items-center justify-center">
      <div class="m-2">
        <label for="time-sector">{{ $t('time-sector') }}：</label>
        <select
          id="time-sector"
          v-model="timeSector"
          class="min-w-32"
          @change="handleTimeSectorChange"
        >
          <option v-for="item in timeSectorOptions" :key="item" :value="item">
            {{ item }} {{ $t('minutes') }}
          </option>
        </select>
      </div>

      <div class="m-2">
        <label for="min-usage-hours">{{ $t('min-usage-hours') }}：</label>
        <select
          id="min-usage-hours"
          v-model="minUsageHours"
          class="min-w-32"
          @change="handleMinHourChange"
        >
          <option v-for="hours in minUsageHoursOptions" :key="hours" :value="hours">
            {{ hours }} {{ $t('hours') }}
          </option>
        </select>
      </div>

      <div class="m-2">
        <label for="max-usage-hours">{{ $t('max-usage-hours') }}：</label>
        <select
          id="max-usage-hours"
          v-model="maxUsageHours"
          class="min-w-32"
          @change="handleMaxHourChange"
        >
          <option v-for="hours in maxUsageHoursOptions" :key="hours" :value="hours">
            {{ hours }} {{ $t('hours') }}
          </option>
        </select>
      </div>
    </div>

    <!-- 時間選擇器 -->
    <div class="flex flex-wrap items-center justify-center">
      <div class="m-2">
        <label for="date-picker">{{ $t('date') }}：</label>
        <input id="date-picker" v-model="selectedDateRef" type="date" />
      </div>

      <div class="m-2">
        <label for="start-time-picker">{{ $t('start-time') }}：</label>
        <select
          id="start-time-picker"
          v-model="selectedStartTimeRef"
          :disabled="startTimeOptions.length === 0"
          class="min-w-32"
        >
          <option
            v-for="option in startTimeOptions"
            :key="option.value"
            :value="option.value"
            :disabled="option.disabled"
          >
            {{
              option.value === 'Now'
                ? $t('now')
                : option.value === ''
                  ? $t(option.label)
                  : option.label
            }}
          </option>
        </select>
      </div>

      <div class="m-2">
        <label for="end-time-picker">{{ $t('end-time') }}：</label>
        <select
          id="end-time-picker"
          v-model="selectedEndObj"
          :disabled="endTimeOptions.length === 0"
          class="min-w-32"
        >
          <option
            v-for="option in endTimeOptions"
            :key="option.value"
            :value="option"
            :disabled="option.disabled"
          >
            {{
              option.value === ''
                ? $t(option.label)
                : option.label.includes('next-day')
                  ? `${option.label.split('_')[0]} ${$t(`${option.label.split('_')[1]}`)}`
                  : option.label
            }}
          </option>
        </select>
      </div>
    </div>

    <!-- 顯示選擇結果 -->
    <div class="flex flex-wrap items-center justify-center">
      <p class="my-2 w-full text-center">
        {{ $t('selected-start-dateTime') }}： {{ selectedDateRef }}
        {{ selectedStartTimeRef === 'Now' ? $t('now') : selectedStartTimeRef }}
      </p>
      <p class="my-2 w-full text-center">
        {{ $t('selected-end-dateTime') }}： {{ selectedEndDateTimeRef }}
      </p>
    </div>

    <!-- 除錯資訊 -->
    <div class="mt-8 flex justify-center text-sm text-gray-600">
      <details>
        <summary>除錯資訊</summary>
        <div class="mt-2">
          <p>可用開始時間選項數量: {{ startTimeOptions.length }}</p>
          <p>可用結束時間選項數量: {{ endTimeOptions.length }}</p>
          <p>選中的開始時間: {{ selectedStartTimeRef }}</p>
          <p>選中的結束時間物件: {{ selectedEndObj?.value }}</p>
          <p>格式化後的結束時間: {{ selectedEndDateTimeRef }}</p>
        </div>
      </details>
    </div>
  </div>
</template>
