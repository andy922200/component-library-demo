import { computed, type Ref, ref } from 'vue'

import { StartTimeOption, TimeSlot, TimeSlotFromAPI } from '@/composables/useTimeSelector/type'
import { isInTimeSlotStrict } from '@/composables/useTimeSelector/util'
import dayjs from '@/plugins/dayjs'

export function useStartTimeOptions({
  timeSlots,
  targetDate,
  usedTimeSlots,
  timeSector,
  options = {},
}: {
  timeSlots: Ref<TimeSlot[]>
  targetDate: Ref<string>
  usedTimeSlots: Ref<TimeSlotFromAPI[]>
  timeSector: Ref<number>
  options: {
    isNowActive?: Ref<boolean>
    dateFormat?: string
    timeFormat?: string
    defaultOption?: {
      label: string
      value: string
    }
  }
}) {
  const {
    isNowActive = ref(true),
    dateFormat = 'YYYY-MM-DD',
    timeFormat = 'HH:mm',
    defaultOption = {
      label: 'please-select-start-time',
      value: '',
    },
  } = options

  const startTimeOptions = computed((): StartTimeOption[] => {
    const today = dayjs().format(dateFormat)
    const now = dayjs().second(0).startOf('second')

    // 預設選項
    const defaultStartOption: StartTimeOption = {
      originalObj: {
        slotStart: '',
        slotEnd: '',
        date: '',
      },
      label: defaultOption.label,
      value: defaultOption.value,
      isNow: false,
      fullString: '',
      disabled: true,
    }

    if (!targetDate.value || dayjs(targetDate.value).isBefore(now, 'day')) {
      return []
    }

    // 基本選項（排除重疊和過去的時間）
    const basicOptions = timeSlots.value
      .filter((slot) => {
        if (targetDate.value === today) {
          const slotStartDayjs = dayjs(
            `${targetDate.value} ${slot.slotStart}`,
            `${dateFormat} ${timeFormat}`,
          )
            .second(0)
            .startOf('second')
          return slotStartDayjs.isSameOrAfter(now)
        }
        return true
      })
      .filter((slot) => !slot.isOverlap)
      .map((slot) => ({
        originalObj: slot,
        label: slot.slotStart,
        value: slot.slotStart,
        isNow: false,
        fullString: `${slot.date}_${slot.slotStart}-${slot.slotEnd}`,
      }))

    // Now 選項邏輯: 用戶選擇開啟 && targetDate 是今天
    if (isNowActive.value && targetDate.value === today) {
      const nowFormatted = now.format(timeFormat)
      const nowMinutes = now.minute()
      const nowSlotEnd = now
        .add(timeSector.value - (nowMinutes % timeSector.value), 'minute')
        .second(0)
        .startOf('second')
        .format(timeFormat)

      // 檢查 Now 所在的時間區段是否被佔用
      const isNowOccupied = usedTimeSlots.value.some(({ startTime, endTime, date }) => {
        if (date === today) {
          return isInTimeSlotStrict({
            startTime,
            endTime,
            date,
            slotStart: nowFormatted,
            slotEnd: nowSlotEnd,
            slotDate: today,
          })
        }
        return false
      })
      // isNow 所代表的時間段是否已存在
      const isNowAlreadyInList = basicOptions.some((time) => time.value === nowFormatted)

      if (!isNowOccupied && !isNowAlreadyInList) {
        basicOptions.unshift({
          label: 'now',
          value: 'Now',
          originalObj: {
            slotStart: nowFormatted,
            slotEnd: nowSlotEnd,
            date: today,
          },
          isNow: true,
          fullString: `${today}_${nowFormatted}-${nowSlotEnd}`,
        })
      }
    }

    return [defaultStartOption, ...basicOptions]
  })

  return {
    startTimeOptions,
  }
}
