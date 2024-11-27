import { Dayjs } from 'dayjs'

export interface TimeSlot {
  startTime: string
  endTime: string
}

export interface ScheduleCell {
  date: string
  timeSlots: TimeSlot[]
  dayjsObj: Dayjs
}
