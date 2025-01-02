import { Dayjs } from 'dayjs'

export interface TimeSlot {
  startTime: string
  endTime: string
  isDisabled: boolean
}

export interface ScheduleCell {
  date: string
  timeSlots: TimeSlot[]
  dayjsObj: Dayjs
  isDisabled: boolean
}
