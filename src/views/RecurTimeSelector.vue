<script setup lang="ts">
import { Dayjs } from 'dayjs'
import { computed, onMounted, ref, watch } from 'vue'

import RecurTimeSelector from '@/components/RecurTimeSelector/index.vue'
import { RecurTimeSelectorEmitItem } from '@/components/RecurTimeSelector/type'
import { checkConflicts, ConflictItem, generateStartAndEndOptions } from '@/helpers/time-recur'
import { TimeSlotFromAPI } from '@/helpers/time-selector'
import { checkWeekdaysInRange, generateRandomTimeRange } from '@/helpers/utils'
import dayjs from '@/plugins/dayjs'

const dateFormatStr = 'YYYY-MM-DD'
const todayDayjs = dayjs()
const yesterdayDayjs = todayDayjs.subtract(1, 'day')
const tomorrowDayjs = todayDayjs.add(1, 'day')
const afterOneMonthDayjs = todayDayjs.add(1, 'month')
const timeSlotDuration = 30
const freezeRecurTimeSelector = ref(false)
const conflictListArray = ref<ConflictItem[]>([])
const hasCheckedConflict = ref(false)
const errorMsg = ref('')

const usedTimeSlots = ref<TimeSlotFromAPI[]>([])
const fetchUsedTimeSlots = async () => {
  await new Promise((r) => setTimeout(r, 500))

  const result: { date: string; start: string; end: string; type: string }[] = []

  const addTimeRange = (dayjsDate: Dayjs) => {
    const existingRanges = result.filter(
      (record) => record.date === dayjsDate.format(dateFormatStr),
    )
    const { start, end } = generateRandomTimeRange(existingRanges)
    result.push({
      date: dayjsDate.format(dateFormatStr),
      start,
      end,
      type: 'used',
    })
  }

  addTimeRange(yesterdayDayjs)

  for (let i = 0; i < 2; i++) {
    addTimeRange(todayDayjs)
  }
  for (let i = 0; i < 2; i++) {
    addTimeRange(tomorrowDayjs)
  }
  for (let i = 0; i < 3; i++) {
    addTimeRange(afterOneMonthDayjs)
  }

  return result
    .map((i) => ({ startTime: i.start, endTime: i.end, date: i.date }))
    .sort((a, b) => {
      const dateA = a.date
      const dateB = b.date

      if (dateA !== dateB) {
        return dateA.localeCompare(dateB) // 比較日期
      }

      // 若日期相同，則比較 start 時間
      return a.startTime.localeCompare(b.startTime)
    })
}

const selectedStartDate = ref(todayDayjs.format(dateFormatStr))
const selectedEndDate = ref(todayDayjs.format(dateFormatStr))
const selectedRecurTimeResult = ref<RecurTimeSelectorEmitItem[]>([])
const isValidRecurTimeResult = computed(() => {
  return selectedRecurTimeResult.value.every((item) => item.isValid)
})
const disableDays = computed(() => {
  return (
    checkWeekdaysInRange({
      startDate: selectedStartDate.value,
      endDate: selectedEndDate.value,
    })?.exclude || []
  )
})

const handleRecurTimeChange = (result: RecurTimeSelectorEmitItem[]) => {
  selectedRecurTimeResult.value = result
}
const handleStartDateChange = () => {
  freezeRecurTimeSelector.value = false
  hasCheckedConflict.value = false
  errorMsg.value = ''
  resetConflictListArray()
}
const handleEndDateChange = () => {
  freezeRecurTimeSelector.value = false
  hasCheckedConflict.value = false
  errorMsg.value = ''
  resetConflictListArray()
}

const resetConflictListArray = () => {
  conflictListArray.value = []
}

const triggerSendForm = async () => {
  freezeRecurTimeSelector.value = false

  if (selectedRecurTimeResult.value.length === 0) return alert('請檢查是否有選擇內容')

  const isValidRecurTimeResult = selectedRecurTimeResult.value.every(
    (item) => item.isValid === true,
  )

  if (!isValidRecurTimeResult) return alert('請檢查內容是否有誤')
  if (dayjs(selectedStartDate.value, dateFormatStr).isBefore(todayDayjs, 'day')) {
    return alert('開始日期不可早於今天')
  }

  const { hasSelectionExpired, conflictList } = await checkConflicts({
    selectedStartDate: selectedStartDate.value,
    selectedEndDate: selectedEndDate.value,
    selectedRecurTimeResult: selectedRecurTimeResult.value,
    usedTimeSlots: usedTimeSlots.value,
    dateFormatStr,
  })

  if (hasSelectionExpired) {
    errorMsg.value = '開始時間有包含過去的時間段'
    hasCheckedConflict.value = true
    return
  } else {
    errorMsg.value = ''
  }

  for (let i = 0; i < conflictList.length; i++) {
    const conflictItem = conflictList[i]

    const { availableStartTimes, availableEndTimes } = generateStartAndEndOptions({
      conflictItem,
      timeSlotDuration,
      dateFormat: dateFormatStr,
    })

    conflictList[i].startOptions = availableStartTimes
    conflictList[i].endOptionsRaw = availableEndTimes
  }

  conflictListArray.value = conflictList
  setupConflictArrayWatchers()

  freezeRecurTimeSelector.value = true
  hasCheckedConflict.value = true
}

const setupConflictArrayWatchers = () => {
  // 監聽每個項目的 finalSelectedStartTime，並根據它來更新 endOptions
  conflictListArray.value.forEach((item) => {
    watch(
      () => item.finalSelectedStartTime,
      (newStartTime) => {
        item.finalSelectedEndTime = ''
        item.endOptions = item.endOptionsRaw[newStartTime] || []
      },
      { deep: true },
    )
  })
}

onMounted(async () => {
  const mockUsedTimeSlots = await fetchUsedTimeSlots()

  usedTimeSlots.value = mockUsedTimeSlots
})

// 監聽 selectedStartDate 的變化
watch(selectedStartDate, (newVal) => {
  if (newVal) {
    handleStartDateChange()
  }
})

// 監聽 selectedEndDate 的變化
watch(selectedEndDate, (newVal) => {
  if (newVal) {
    handleEndDateChange()
  }
})
</script>

<template>
  <div class="mx-auto w-full">
    <div class="flex items-center justify-center">
      <h3 class="m-2">{{ $t('used-time-slots') }}</h3>
      <ul>
        <li v-for="slot in usedTimeSlots" :key="slot.startTime">
          <p>{{ slot.date }} {{ slot.startTime }} ~ {{ slot.endTime }}</p>
        </li>
      </ul>
    </div>

    <div class="my-1 flex flex-wrap justify-center">
      <p class="mb-2 w-full text-center">選取的週期時間</p>
      <p
        v-for="item in selectedRecurTimeResult"
        :key="item.weekday"
        class="mb-2 w-full text-center"
        :class="{ 'text-red-500': !item.isValid }"
      >
        {{ item.weekday }}: {{ item.selectedStartTime }} ~ {{ item.selectedEndTime }}
      </p>
    </div>

    <div class="my-1 flex flex-wrap justify-center">
      <p class="mb-2 w-full text-center">限制選取日: {{ disableDays }}</p>
      <p class="mb-2 w-full text-center">0: Sun, 1: Mon, ...etc.</p>
      <p class="mb-2 w-full text-center">選取內容無漏填: {{ isValidRecurTimeResult }}</p>
    </div>

    <div class="flex items-center justify-center">
      <div class="m-2">
        <label for="start-date-picker" class="mx-2">開始日期</label>
        <input
          id="start-date-picker"
          v-model="selectedStartDate"
          type="date"
          @change="handleStartDateChange"
        />

        <label for="end-date-picker" class="mx-2">結束日期</label>
        <input
          id="end-date-picker"
          v-model="selectedEndDate"
          type="date"
          @change="handleEndDateChange"
        />
      </div>
    </div>

    <RecurTimeSelector
      :close-all-selector="
        selectedStartDate === '' || selectedEndDate === '' || freezeRecurTimeSelector
      "
      :week-start-day="1"
      :disabled-days="disableDays"
      :time-slot-duration="timeSlotDuration"
      class="flex justify-center"
      @change="handleRecurTimeChange"
    />

    <div class="my-1 flex flex-wrap justify-center">
      <button
        class="send-form rounded bg-black px-4 py-2 text-white"
        :disabled="freezeRecurTimeSelector"
        @click="triggerSendForm"
      >
        送出
      </button>
    </div>

    <div class="my-1 flex flex-wrap justify-center">
      <!-- 無檢查結果 -->
      <template v-if="!hasCheckedConflict && (selectedStartDate === '' || selectedEndDate === '')">
        <p class="w-full text-center">無檢查結果</p>
      </template>

      <!-- 有選擇結果的情況 -->
      <template v-else>
        <!-- 已檢查結果 -->
        <template v-if="hasCheckedConflict">
          <template v-if="conflictListArray.length === 0">
            <p v-if="!errorMsg" class="w-full text-center">無衝突，可打 api</p>
            <p v-else class="w-full text-center">{{ errorMsg }}</p>
          </template>

          <!-- 有衝突的情況 -->
          <template v-else>
            <p class="w-full text-center">有衝突，請檢查以下選項</p>
            <p
              v-for="item in conflictListArray"
              :key="item.weekday"
              class="mb-2 w-full text-center"
            >
              {{ item.conflictDate }} - {{ item.weekday }}: {{ item.selectedStartTime }} ~
              {{ item.selectedEndTime }}
              <select v-model="item.finalSelectedStartTime">
                <option
                  v-for="(option, optionIndex) in item.startOptions"
                  :key="`start-${item.weekday}-${optionIndex}`"
                  :value="option.value"
                  :disabled="option.disabled"
                >
                  {{ option.label }}
                </option>
              </select>
              <select v-model="item.finalSelectedEndTime">
                <option
                  v-for="(option, optionIndex) in item.endOptions"
                  :key="`end-${item.weekday}-${optionIndex}`"
                  :value="option.value"
                  :disabled="option.disabled"
                >
                  {{ option.label }}
                </option>
              </select>
            </p>
          </template>
        </template>

        <!-- 未檢查 -->
        <template v-else>
          <p v-if="selectedRecurTimeResult.length === 0" class="w-full text-center">尚無選擇結果</p>

          <p
            v-else-if="selectedRecurTimeResult.some((item) => item.isValid === false)"
            class="w-full text-center"
          >
            請檢查選取內容是否都已選取
          </p>

          <p v-else class="w-full text-center">請點選「送出」來檢查</p>
        </template>
      </template>
    </div>
  </div>
</template>
