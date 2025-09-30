import dayjs from '@/plugins/dayjs'

export function parseTimeWithPrecision({
  dateStr,
  timeStr,
  dateFormat = 'YYYY-MM-DD',
  timeFormat = 'HH:mm',
}: {
  dateStr: string
  timeStr: string
  dateFormat?: string
  timeFormat?: string
}) {
  return dayjs(`${dateStr} ${timeStr}`, `${dateFormat} ${timeFormat}`).startOf('second')
}

// 判斷時間區間是否在指定的區塊內
export function isInTimeSlotStrict({
  startTime,
  endTime,
  date,
  slotStart,
  slotEnd,
  slotDate,
  dateFormat = 'YYYY-MM-DD',
  timeFormat = 'HH:mm',
}: {
  startTime: string
  endTime: string
  date: string
  slotStart: string
  slotEnd: string
  slotDate: string
  dateFormat?: string
  timeFormat?: string
}) {
  const start = dayjs(`${date} ${startTime}`, `${dateFormat} ${timeFormat}`)

  // 如果 endTime 是 "00:00"，並且開始時間在 00:00 之前，則認為是隔天的 00:00
  let end = dayjs(`${date} ${endTime}`, `${dateFormat} ${timeFormat}`)
  if (endTime === '00:00' && end.isBefore(start)) {
    end = end.add(1, 'day')
  }

  const slotStartDayjs = dayjs(`${slotDate} ${slotStart}`, `${dateFormat} ${timeFormat}`)

  let slotEndDayjs = dayjs(`${slotDate} ${slotEnd}`, `${dateFormat} ${timeFormat}`)

  if (slotEnd === '00:00' && slotEndDayjs.isBefore(slotStartDayjs)) {
    slotEndDayjs = slotEndDayjs.add(1, 'day')
  }

  return start.isBefore(slotEndDayjs) && end.isAfter(slotStartDayjs)
}
