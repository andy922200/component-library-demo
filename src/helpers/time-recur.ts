import { RecurTimeSelectorEmitItem } from '@/components/RecurTimeSelector/type'
import { isInTimeSlotStrict, TimeSlotFromAPI } from '@/helpers/time-selector'
import dayjs from '@/plugins/dayjs'

interface RecurTimeOption {
  date: string
  label: string
  value: string
  disabled?: boolean
}

interface ExpiredItem extends RecurTimeSelectorEmitItem {
  date: string
}

interface ValidItem {
  date: string
  selectedStartTime: string
  selectedEndTime: string
  text: string
  weekday: string
}

interface ConflictItem {
  isValid: boolean
  selectedStartTime: string
  selectedEndTime: string
  text: string
  weekday: string
  conflictDate: string
  usedSlot: TimeSlotFromAPI[]
  conflictSlot: TimeSlotFromAPI[]
  startOptions: RecurTimeOption[]
  endOptions: RecurTimeOption[]
  endOptionsRaw: { [key: string]: RecurTimeOption[] }
  finalSelectedStartTime: string
  finalSelectedEndTime: string
}

const checkConflicts = async ({
  selectedStartDate,
  selectedEndDate,
  dateFormatStr = 'YYYY-MM-DD',
  selectedRecurTimeResult = [],
  usedTimeSlots = [],
}: {
  selectedStartDate: string
  selectedEndDate: string
  dateFormatStr?: string
  selectedRecurTimeResult?: RecurTimeSelectorEmitItem[]
  usedTimeSlots: TimeSlotFromAPI[]
}) => {
  const selectedStartDateDayjs = dayjs(selectedStartDate, dateFormatStr)
  const selectedEndDateDayjs = dayjs(selectedEndDate, dateFormatStr)
  const today = dayjs().startOf('day')
  const validList: ValidItem[] = []
  const conflictList: ConflictItem[] = []
  const expiredList: ExpiredItem[] = []
  let hasSelectionExpired = false

  // 建立已預約時間段的快取表
  const usedTimeSlotsMap: Record<string, TimeSlotFromAPI[]> = usedTimeSlots.reduce(
    (map, slot) => {
      const slotDate = dayjs(slot.date).format(dateFormatStr)
      if (!map[slotDate]) {
        map[slotDate] = []
      }
      map[slotDate].push(slot)
      return map
    },
    {} as Record<string, TimeSlotFromAPI[]>,
  )

  for (
    let date = selectedStartDateDayjs;
    date.isSameOrBefore(selectedEndDateDayjs);
    date = date.add(1, 'day')
  ) {
    const currentWeekday = date.day() // 0: Sunday, 1: Monday, ..., 6: Saturday
    const currentFormattedDate = date.format(dateFormatStr)

    // 找到當前日期對應的星期幾是否有被選取
    const selectedRecurTimeItem = selectedRecurTimeResult.find(
      (booking) => parseInt(booking.weekday) === currentWeekday,
    )

    if (!selectedRecurTimeItem) continue

    // 如果選取時間已過去，跳過該日期
    const startTime = dayjs(
      `${currentFormattedDate} ${selectedRecurTimeItem.selectedStartTime}`,
      `${dateFormatStr} HH:mm`,
    )
    if (startTime.isBefore(dayjs(), 'minute')) {
      hasSelectionExpired = true
      const result = {
        ...selectedRecurTimeItem,
        date: currentFormattedDate,
      }
      expiredList.push(result)
      continue
    }

    // 抓出當前日期相關的已預約時間段
    let usedSlotsForDay = usedTimeSlotsMap[currentFormattedDate] || []

    // 若當前日期為今天，則過濾掉已經過去的時間段
    if (date.isSame(today)) {
      const currentTime = dayjs()
      usedSlotsForDay = usedSlotsForDay.filter((usedSlot) => {
        const slotEndTime = dayjs(`${usedSlot.date} ${usedSlot.endTime}`, `${dateFormatStr} HH:mm`)
        return slotEndTime.isSameOrAfter(currentTime)
      })
    }

    let isConflictItem = false
    const itemTemplate = {
      selectedStartTime: selectedRecurTimeItem.selectedStartTime,
      selectedEndTime: selectedRecurTimeItem.selectedEndTime,
      text: selectedRecurTimeItem.text,
      weekday: selectedRecurTimeItem.weekday,
      isValid: selectedRecurTimeItem.isValid,
    }
    const validItem: ValidItem = {
      ...itemTemplate,
      date: currentFormattedDate,
    }
    const conflictItem: ConflictItem = {
      ...itemTemplate,
      conflictDate: currentFormattedDate,
      usedSlot: usedSlotsForDay,
      conflictSlot: [],
      startOptions: [],
      endOptions: [],
      endOptionsRaw: {},
      finalSelectedStartTime: '',
      finalSelectedEndTime: '',
    }

    // 檢查已選取的時間段是否與已預約的時間段有衝突
    usedSlotsForDay.forEach((usedSlot) => {
      if (
        isInTimeSlotStrict({
          startTime: selectedRecurTimeItem.selectedStartTime,
          endTime: selectedRecurTimeItem.selectedEndTime,
          date: date.format(dateFormatStr),
          slotStart: usedSlot.startTime,
          slotEnd: usedSlot.endTime,
          slotDate: usedSlot.date,
        })
      ) {
        isConflictItem = true
        conflictItem.conflictSlot?.push(usedSlot)
      }
    })

    // 如有衝突，將新記錄添加到衝突列表，否則添加到有效列表
    isConflictItem ? conflictList.push(conflictItem) : validList.push(validItem)
  }

  return {
    hasConflict: conflictList.length > 0,
    hasSelectionExpired,
    conflictList,
    expiredList,
    validList,
  }
}

const generateStartAndEndOptions = ({
  conflictItem,
  timeSlotDuration = 30,
  dateFormat = 'YYYY-MM-DD',
}: {
  conflictItem: ConflictItem
  timeSlotDuration: number
  dateFormat?: string
}) => {
  let availableStartTimes: RecurTimeOption[] = []
  const availableEndTimes: { [key: string]: RecurTimeOption[] } = {}
  const todayDayjs = dayjs()
  const conflictDateIsToday =
    dayjs(conflictItem.conflictDate).format(dateFormat) === todayDayjs.format(dateFormat)

  let currentStartTime = dayjs(`${conflictItem.conflictDate} 00:00`, `${dateFormat} HH:mm`)
  const conflictEndTime = dayjs(`${conflictItem.conflictDate} 24:00`, `${dateFormat} HH:mm`)

  // 生成可用的開始時間
  while (currentStartTime.isBefore(conflictEndTime)) {
    const overlap = conflictItem.usedSlot.some((slot) =>
      isInTimeSlotStrict({
        startTime: currentStartTime.format('HH:mm'),
        endTime: currentStartTime.add(timeSlotDuration, 'minute').format('HH:mm'),
        date: conflictItem.conflictDate,
        slotStart: slot.startTime,
        slotEnd: slot.endTime,
        slotDate: slot.date,
      }),
    )

    if (!overlap) {
      availableStartTimes.push({
        date: conflictItem.conflictDate,
        label: currentStartTime.format('HH:mm'),
        value: currentStartTime.format('HH:mm'),
      })
    }

    currentStartTime = currentStartTime.add(timeSlotDuration, 'minute')
  }

  if (conflictDateIsToday) {
    // 如果衝突日期是今天，過濾掉今天已經過去的時間
    availableStartTimes = availableStartTimes.filter((item) => {
      return dayjs(`${item.date} ${item.value}`, `${dateFormat} HH:mm`).isSameOrAfter(
        todayDayjs,
        'minute',
      )
    })
  }

  // 生成每個開始時間對應的可用結束時間
  availableStartTimes.forEach((startTime) => {
    let currentEndTime = dayjs(
      `${conflictItem.conflictDate} ${startTime.value}`,
      `${dateFormat} HH:mm`,
    ).add(timeSlotDuration, 'minute')

    const validEndTimes = []
    while (currentEndTime.isSameOrBefore(conflictEndTime)) {
      const overlap = conflictItem.usedSlot.some((slot) =>
        isInTimeSlotStrict({
          startTime: startTime.value,
          endTime: currentEndTime.format('HH:mm'),
          date: conflictItem.conflictDate,
          slotStart: slot.startTime,
          slotEnd: slot.endTime,
          slotDate: slot.date,
        }),
      )

      if (!overlap) {
        validEndTimes.push({
          date: conflictItem.conflictDate,
          label:
            // 如果是 00:00，顯示為 24:00
            currentEndTime.format('HH:mm') === '00:00' ? '24:00' : currentEndTime.format('HH:mm'),
          value: currentEndTime.format('HH:mm'),
        })
      }

      currentEndTime = currentEndTime.add(timeSlotDuration, 'minute')
    }

    availableEndTimes[startTime.value] =
      validEndTimes.length > 0
        ? [{ label: '結束', disabled: true, value: '', date: '' }, ...validEndTimes]
        : []
  })

  // 在開始選項的頭兩個加入「開始」和「不預約」
  availableStartTimes.unshift(
    { label: '開始', disabled: true, value: '', date: '' },
    { label: '不預約', value: 'no-booked', date: '' },
  )

  return {
    availableStartTimes,
    availableEndTimes,
  }
}

export {
  checkConflicts,
  ConflictItem,
  generateStartAndEndOptions,
  isInTimeSlotStrict,
  RecurTimeOption,
}
