import { RecurTimeSelectorEmitItem } from '@/components/RecurTimeSelector/type'
import { isInTimeSlotStrict, TimeSlotFromAPI } from '@/helpers/time-selector'
import dayjs from '@/plugins/dayjs'

interface RecurTimeOption {
  date: string
  label: string
  value: string
  disabled?: boolean
}

interface ConflictItem {
  conflictDate: string
  usedSlot: TimeSlotFromAPI[]
  conflictSlot: TimeSlotFromAPI[]
  isValid: boolean
  selectedStartTime: string
  selectedEndTime: string
  text: string
  weekday: string
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
  const conflictList: ConflictItem[] = []
  let allInPast = false

  for (
    let date = selectedStartDateDayjs;
    date.isSameOrBefore(selectedEndDateDayjs);
    date = date.add(1, 'day')
  ) {
    const currentWeekday = date.day() // 0: Sunday, 1: Monday, ..., 6: Saturday
    const today = dayjs().startOf('day')

    // 挑出與當前 weekday 相同的已選取時間段
    const selectedRecurTimeItem = selectedRecurTimeResult.find(
      (booking) => parseInt(booking.weekday) === currentWeekday,
    )

    // 篩選出與當前日期相同的已預約時間段
    const usedSlotsForDay = usedTimeSlots.filter((usedSlot) => {
      const slotDate = dayjs(usedSlot.date).format(dateFormatStr)
      // 如果日期是今天，檢查時間段是否已經過去
      if (date.isSame(today)) {
        const slotEndTime = dayjs(`${usedSlot.date} ${usedSlot.endTime}`, `${dateFormatStr} HH:mm`)
        if (slotEndTime.isBefore(dayjs())) {
          return false // 跳過已經過去的時間段
        }
      }
      return slotDate === date.format(dateFormatStr)
    })

    if (selectedRecurTimeItem) {
      if (
        dayjs(
          `${date.format(dateFormatStr)} ${selectedRecurTimeItem.selectedStartTime}`,
          `${dateFormatStr} HH:mm`,
        ).isBefore(dayjs(), 'minute')
      ) {
        allInPast = true
        break
      }

      // 先行建立一筆可能的衝突記錄物件
      const newConflict: ConflictItem = {
        ...selectedRecurTimeItem,
        conflictDate: date.format(dateFormatStr),
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
          newConflict.conflictSlot.push(usedSlot)
        }
      })

      // 如果有衝突才將新記錄添加到衝突列表中
      if (newConflict.conflictSlot.length > 0) {
        conflictList.push(newConflict)
      }
    }
  }

  return {
    hasConflict: conflictList.length > 0,
    conflictList,
    allInPast,
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
