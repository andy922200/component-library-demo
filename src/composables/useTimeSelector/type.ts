export interface TimeSlot {
  slotStart: string
  slotEnd: string
  isOverlap?: boolean
  isPast?: boolean
  date: string
}

export interface TimeSlotFromAPI {
  startTime: string
  endTime: string
  date: string
}

export interface StartTimeOption {
  label: string
  value: string
  originalObj: TimeSlot
  isNow: boolean
  fullString: string
  disabled?: boolean
}

export interface EndTimeOption {
  label: string
  value: string
  originalObj: TimeSlot
  disabled?: boolean
}
