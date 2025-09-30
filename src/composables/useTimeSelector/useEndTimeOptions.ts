import { computed, type Ref, ref } from 'vue'

import { EndTimeOption, TimeSlot, TimeSlotFromAPI } from '@/composables/useTimeSelector/type'
import { parseTimeWithPrecision } from '@/composables/useTimeSelector/util'
import dayjs from '@/plugins/dayjs'

const parseStartTime = ({
  isNow,
  targetDate,
  timeSector,
  nowDayjs,
  startTime,
}: {
  isNow: boolean
  targetDate: string
  timeSector: number
  nowDayjs: dayjs.Dayjs
  startTime: string
}) => {
  if (isNow) {
    // 處理 "Now" 的選項，並精確到最近的 timeSector
    const minutes = nowDayjs.minute()
    const diff = minutes % timeSector
    return nowDayjs.subtract(diff, 'minute').second(0).startOf('second')
  } else {
    // 處理一般選項
    return parseTimeWithPrecision({
      dateStr: targetDate,
      timeStr: startTime,
    })
  }
}

const generateSameDayOptions = ({
  allTimeSlots,
  targetDate,
  startTimeDayjs,
  nextDayHintKey,
}: {
  allTimeSlots: TimeSlot[]
  targetDate: string
  startTimeDayjs: dayjs.Dayjs
  nextDayHintKey: string
}) => {
  const endTimeOptions: EndTimeOption[] = []
  let sameDayBreak = false // 記錄是否因重疊而停止生成

  for (const slot of allTimeSlots) {
    let slotStartDayjs = parseTimeWithPrecision({
      dateStr: targetDate,
      timeStr: slot.slotStart,
    })

    if (slot.slotEnd === '00:00') {
      slotStartDayjs = slotStartDayjs.add(1, 'day')
    }

    // 只選在 startTime 之後的區段
    if (slotStartDayjs.isSameOrAfter(startTimeDayjs)) {
      if (slot.isOverlap) {
        sameDayBreak = true
        break
      }

      endTimeOptions.push({
        originalObj: slot,
        label: slot.slotEnd === '00:00' ? `00:00_${nextDayHintKey}` : slot.slotEnd,
        value: slot.slotEnd,
      })
    }
  }
  return { endTimeOptions, sameDayBreak }
}

const generateNextDayOptions = ({
  startTimeDayjs,
  maxUsageHours,
  usedTimeSlots,
  timeSector,
  targetDate,
  nextDayHintKey,
  dateFormat = 'YYYY-MM-DD',
  timeFormat = 'HH:mm',
}: {
  startTimeDayjs: dayjs.Dayjs
  maxUsageHours: number
  usedTimeSlots: TimeSlotFromAPI[]
  timeSector: number
  targetDate: string
  nextDayHintKey: string
  dateFormat?: string
  timeFormat?: string
}) => {
  const endTimeOptions: EndTimeOption[] = []
  const nextDay = dayjs(targetDate).add(1, 'day').format(`${dateFormat}`)
  const nextDayUsedTimeSlots = usedTimeSlots.filter((range) => range.date === nextDay)
  const maxEndTime = startTimeDayjs.add(maxUsageHours, 'hour')

  let nextDayStart = dayjs(`${nextDay} 00:00`, `${dateFormat} ${timeFormat}`)
  const nextDayEndLimit =
    nextDayUsedTimeSlots.length > 0
      ? nextDayUsedTimeSlots.reduce(
          (earliest, range) => {
            const rangeStartTime = parseTimeWithPrecision({
              dateStr: nextDay,
              timeStr: range.startTime,
            })

            // 將 usedTimeSlots 的 startTime 對齊到最近的 timeSector
            const adjustedStartTime = rangeStartTime
              .minute(Math.floor(rangeStartTime.minute() / timeSector) * timeSector)
              .second(0)

            return adjustedStartTime.isBefore(earliest) ? adjustedStartTime : earliest
          },
          dayjs(`${nextDay} 24:00`, `${dateFormat} ${timeFormat}`),
        )
      : dayjs(`${nextDay} 24:00`, `${dateFormat} ${timeFormat}`)

  const actualNextDayEndLimit = nextDayEndLimit.isBefore(maxEndTime) ? nextDayEndLimit : maxEndTime

  while (nextDayStart.isBefore(actualNextDayEndLimit)) {
    const slotEnd = nextDayStart.add(timeSector, 'minute')
    endTimeOptions.push({
      originalObj: {
        slotStart: nextDayStart.format(`${timeFormat}`),
        slotEnd: slotEnd.format(`${timeFormat}`),
        date: nextDay,
      },
      label: `${slotEnd.format(`${timeFormat}`)}_${nextDayHintKey}`,
      value: slotEnd.format(`${timeFormat}`),
    })
    nextDayStart = slotEnd
  }

  return endTimeOptions
}

const filterEndTimeOptions = ({
  endTimeOptions,
  startTimeDayjs,
  minUsageHours,
  maxUsageHours,
  isNow = false,
  nowDayjs,
  dateFormat = 'YYYY-MM-DD',
  timeFormat = 'HH:mm',
}: {
  endTimeOptions: EndTimeOption[]
  startTimeDayjs: dayjs.Dayjs
  minUsageHours: number
  maxUsageHours: number
  isNow: boolean
  nowDayjs: dayjs.Dayjs
  dateFormat?: string
  timeFormat?: string
}) => {
  const filterByDuration = (endTimeDayjs: dayjs.Dayjs, referenceTime: dayjs.Dayjs) => {
    const durationInMinutes = endTimeDayjs.diff(referenceTime, 'minute')
    const durationInHours = durationInMinutes / 60
    return durationInHours >= minUsageHours && durationInHours <= maxUsageHours
  }

  return endTimeOptions.filter((option) => {
    let endTimeDayjs = dayjs(
      `${option.originalObj.date} ${option.value}`,
      `${dateFormat} ${timeFormat}`,
    )

    if (option.originalObj.slotEnd === '00:00') {
      endTimeDayjs = endTimeDayjs.add(1, 'day')
    }

    // 根據是否為 "Now" 來決定參照時間
    const referenceTime = isNow ? nowDayjs : startTimeDayjs

    return filterByDuration(endTimeDayjs, referenceTime)
  })
}

export function useEndTimeOptions({
  timeSlots,
  targetDate,
  startTime,
  usedTimeSlots,
  timeSector,
  options = {},
}: {
  timeSlots: Ref<TimeSlot[]>
  targetDate: Ref<string>
  startTime: Ref<string>
  usedTimeSlots: Ref<TimeSlotFromAPI[]>
  timeSector: Ref<number>
  options: {
    maxUsageHours?: Ref<number>
    minUsageHours?: Ref<number>
    generateCrossDay?: Ref<boolean>
    nextDayHintKey?: string
    dateFormat?: string
    timeFormat?: string
    defaultOption?: {
      label: string
      value: string
    }
  }
}) {
  const {
    maxUsageHours = ref(24),
    minUsageHours = ref(0),
    generateCrossDay = ref(true),
    nextDayHintKey = 'next-day',
    dateFormat = 'YYYY-MM-DD',
    timeFormat = 'HH:mm',
    defaultOption = {
      label: 'please-select-end-time',
      value: '',
    },
  } = options

  const endTimeOptions = computed((): EndTimeOption[] => {
    const now = dayjs()
    const isNow = startTime.value === 'Now'
    const defaultEndOption: EndTimeOption = {
      originalObj: {
        slotStart: '',
        slotEnd: '',
        date: '',
      },
      label: defaultOption.label,
      value: defaultOption.value,
      disabled: true,
    }

    if (
      !targetDate.value ||
      !startTime.value ||
      dayjs(targetDate.value).isBefore(now, 'day') ||
      (dayjs(targetDate.value).isAfter(now, 'day') && isNow)
    ) {
      return []
    }

    const startTimeDayjs = parseStartTime({
      isNow,
      targetDate: targetDate.value,
      timeSector: timeSector.value,
      nowDayjs: now,
      startTime: startTime.value,
    })

    // 當日選項
    const { endTimeOptions: daytimeOptions, sameDayBreak } = generateSameDayOptions({
      allTimeSlots: timeSlots.value,
      targetDate: targetDate.value,
      startTimeDayjs,
      nextDayHintKey,
    })

    // 跨日選項
    if (generateCrossDay.value && !sameDayBreak) {
      const nextDayOptions = generateNextDayOptions({
        startTimeDayjs,
        maxUsageHours: maxUsageHours.value,
        usedTimeSlots: usedTimeSlots.value,
        timeSector: timeSector.value,
        targetDate: targetDate.value,
        nextDayHintKey,
        dateFormat,
        timeFormat,
      })
      daytimeOptions.push(...nextDayOptions)
    }

    // 過濾時長限制
    const filteredOptions = filterEndTimeOptions({
      endTimeOptions: daytimeOptions,
      startTimeDayjs,
      minUsageHours: minUsageHours.value,
      maxUsageHours: maxUsageHours.value,
      isNow: startTime.value === 'Now',
      nowDayjs: now,
      dateFormat,
      timeFormat,
    })

    return [defaultEndOption, ...filteredOptions]
  })

  return {
    endTimeOptions,
  }
}
