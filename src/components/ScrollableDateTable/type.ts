import { Dayjs } from 'dayjs'
export interface ScheduleCell {
  date: string
  timeSlots: string[]
  dayjsObj: Dayjs
}
