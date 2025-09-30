import { computed, type Ref, ref } from 'vue'

import { TimeSlot, TimeSlotFromAPI } from '@/composables/useTimeSelector/type'
import { isInTimeSlotStrict } from '@/composables/useTimeSelector/util'
import dayjs from '@/plugins/dayjs'

export function useTimeSlots({
  targetDate,
  timeSector,
  usedTimeSlots,
  options = {},
}: {
  targetDate: Ref<string>
  timeSector: Ref<number>
  usedTimeSlots: Ref<TimeSlotFromAPI[]>
  options: {
    dateFormat?: string
    timeFormat?: string
  }
}) {
  const { dateFormat = 'YYYY-MM-DD', timeFormat = 'HH:mm' } = options
  const timeSlots = ref<TimeSlot[]>([])

  // 生成一天內的 15,30,60 分鐘區塊，從 00:00 到 24:00
  const generateTimeSlots = () => {
    const slots: TimeSlot[] = []
    let start = dayjs(`${targetDate.value} 00:00`, `${dateFormat} ${timeFormat}`)
    const end = dayjs(`${targetDate.value} 24:00`, `${dateFormat} ${timeFormat}`)

    while (start.isBefore(end)) {
      const slotEnd = start.add(timeSector.value, 'minute')
      slots.push({
        slotStart: start.format(timeFormat),
        slotEnd: slotEnd.format(timeFormat),
        isOverlap: false,
        isPast: false,
        date: targetDate.value,
      })
      start = slotEnd
    }

    timeSlots.value = slots
    checkOverlaps()
  }

  // 檢查每個 timeSlot 是否與時間段重疊
  const checkOverlaps = () => {
    const now = dayjs()

    timeSlots.value.forEach((slot) => {
      let hasOverlap = false

      usedTimeSlots.value.forEach(({ startTime, endTime, date }) => {
        if (
          isInTimeSlotStrict({
            startTime,
            endTime,
            date,
            slotStart: slot.slotStart,
            slotEnd: slot.slotEnd,
            slotDate: targetDate.value,
          })
        ) {
          hasOverlap = true
        }
      })

      slot.isOverlap = hasOverlap

      // 檢查是否已過去
      let slotEndDayjs = dayjs(`${targetDate.value} ${slot.slotEnd}`, `${dateFormat} ${timeFormat}`)
      if (slot.slotEnd === '00:00') {
        slotEndDayjs = slotEndDayjs.add(1, 'day')
      }
      slot.isPast = slotEndDayjs.isBefore(now)
    })
  }

  // 可用的時間段（未重疊且未過去）
  const availableTimeSlots = computed(() =>
    timeSlots.value.filter((slot) => !slot.isOverlap && !slot.isPast),
  )

  return {
    timeSlots,
    availableTimeSlots,
    generateTimeSlots,
    checkOverlaps,
  }
}
