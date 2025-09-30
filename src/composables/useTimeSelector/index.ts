import type { Ref } from 'vue'
import { ref, watch } from 'vue'

import type { EndTimeOption, TimeSlotFromAPI } from '@/composables/useTimeSelector/type'
import { useEndTimeOptions } from '@/composables/useTimeSelector/useEndTimeOptions'
import { useStartTimeOptions } from '@/composables/useTimeSelector/useStartTimeOptions'
import { useTimeSlots } from '@/composables/useTimeSelector/useTimeSlots'
import dayjs from '@/plugins/dayjs'

export function useTimeSelector(
  usedTimeSlots: TimeSlotFromAPI[],
  options: {
    timeSector?: number
    maxUsageHours?: number
    minUsageHours?: number
    generateCrossDay?: boolean
    isNowActive?: boolean
    dateFormat?: string
    timeFormat?: string
    externalRefs?: {
      selectedDate?: Ref<string>
      selectedStartTime?: Ref<string>
      selectedEndDateTime?: Ref<string>
    }
    defaultOptions?: {
      startTime?: {
        label: string
        value: string
      }
      endTime?: {
        label: string
        value: string
      }
    }
  } = {},
) {
  const {
    timeSector: initialTimeSector = 30,
    maxUsageHours: initialMaxUsageHours = 24,
    minUsageHours: initialMinUsageHours = 0.5,
    generateCrossDay: initialGenerateCrossDay = true,
    isNowActive: initialIsNowActive = true,
    dateFormat = 'YYYY-MM-DD',
    timeFormat = 'HH:mm',
    externalRefs,
    defaultOptions = {
      startTime: {
        label: 'please-select-start-time',
        value: '',
      },
      endTime: {
        label: 'please-select-end-time',
        value: '',
      },
    },
  } = options

  // 響應式狀態
  const selectedDate = externalRefs?.selectedDate ?? ref('')
  const selectedStartTime = externalRefs?.selectedStartTime ?? ref('')
  const selectedEndDateTime = externalRefs?.selectedEndDateTime ?? ref('')
  const selectedEndObj = ref<EndTimeOption | null>(null)
  const timeSector = ref(initialTimeSector)
  const maxUsageHours = ref(initialMaxUsageHours)
  const minUsageHours = ref(initialMinUsageHours)
  const generateCrossDay = ref(initialGenerateCrossDay)
  const isNowActive = ref(initialIsNowActive)
  const usedTimeSlotsRef = ref(usedTimeSlots)

  const { timeSlots, generateTimeSlots } = useTimeSlots({
    targetDate: selectedDate,
    timeSector,
    usedTimeSlots: usedTimeSlotsRef,
    options: { dateFormat, timeFormat },
  })

  const { startTimeOptions } = useStartTimeOptions({
    timeSlots,
    targetDate: selectedDate,
    usedTimeSlots: usedTimeSlotsRef,
    timeSector,
    options: {
      isNowActive,
      dateFormat,
      timeFormat,
      defaultOption: defaultOptions.startTime,
    },
  })

  const { endTimeOptions } = useEndTimeOptions({
    timeSlots,
    targetDate: selectedDate,
    startTime: selectedStartTime,
    usedTimeSlots: usedTimeSlotsRef,
    timeSector,
    options: {
      maxUsageHours,
      minUsageHours,
      generateCrossDay,
      nextDayHintKey: 'next-day',
      dateFormat,
      timeFormat,
      defaultOption: defaultOptions.endTime,
    },
  })

  // 監聽變化
  watch([selectedDate, timeSector], () => {
    generateTimeSlots()
    selectedStartTime.value = ''
    selectedEndObj.value = null
    selectedEndDateTime.value = ''
  })

  watch(selectedStartTime, () => {
    selectedEndObj.value = null
    selectedEndDateTime.value = ''
  })

  watch(selectedEndObj, (newEndObj) => {
    if (!newEndObj) return

    const [time, nextDayStr] = newEndObj.label.split('_')
    selectedEndDateTime.value =
      nextDayStr === 'next-day'
        ? `${dayjs(selectedDate.value).add(1, 'day').format(dateFormat)} ${time}`
        : `${selectedDate.value} ${time}`
  })

  // 重置方法
  const resetStartTime = () => {
    selectedStartTime.value = ''
    selectedEndObj.value = null
    selectedEndDateTime.value = ''
  }

  const resetEndTime = () => {
    selectedEndObj.value = null
    selectedEndDateTime.value = ''
  }

  return {
    // 狀態
    selectedDate,
    selectedStartTime,
    selectedEndObj,
    selectedEndDateTime,
    timeSector,
    maxUsageHours,
    minUsageHours,
    generateCrossDay,
    isNowActive,
    usedTimeSlots: usedTimeSlotsRef,

    // 選項
    startTimeOptions,
    endTimeOptions,
    timeSlots,

    // 方法
    resetStartTime,
    resetEndTime,

    // 更新 used time slots
    updateUsedTimeSlots: ({
      newUsedTimeSlots,
      ignoreUsedSlots = false,
    }: {
      newUsedTimeSlots: TimeSlotFromAPI[]
      ignoreUsedSlots?: boolean
    }) => {
      usedTimeSlotsRef.value = ignoreUsedSlots ? [] : newUsedTimeSlots
      generateTimeSlots()
    },
  }
}
