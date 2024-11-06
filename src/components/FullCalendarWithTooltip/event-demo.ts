import { EventInput } from '@fullcalendar/core'
import dayjs from 'dayjs'

interface CustomEventInput extends EventInput {
  [key: string]: any
}

export const titles = [
  '板橋鄉民活動中心1',
  '板橋警民活動中心2',
  '板橋警民活動中心3',
  '板橋警民活動中心4',
  '板橋警民活動中心5-1',
  '板橋警民活動中心5-2',
  '板橋警民活動中心6',
  '板橋警民活動中心7',
  '板橋警民活動中心8',
  '新莊鄉民活動中心9',
]
export const colors = ['#27AE60', '#2F80ED', '#EB6615']

export const generateEvents = ({
  count,
  startDate,
  endDate,
  titles,
  colors,
}: {
  count: number
  startDate: string
  endDate: string
  intervalHours: number
  titles: string[]
  colors: string[]
}): CustomEventInput[] => {
  const events: CustomEventInput[] = []
  const startDateDayjs = dayjs(startDate)
  const endDateDayjs = dayjs(endDate)

  // 計算事件之間的時間間隔（毫秒）
  const interval = endDateDayjs.diff(startDateDayjs) / count

  for (let i = 0; i < count; i++) {
    const start = startDateDayjs.add(i * interval * Math.random(), 'milliseconds')
    const end = start.add(1, 'hour') // 每個事件持續 1 小時
    const title = titles[i % titles.length]
    const color = colors[i % colors.length]

    events.push({
      id: `${i + 1}`,
      title: title,
      start: start.format('YYYY-MM-DD HH:mm:ss'),
      end: end.format('YYYY-MM-DD HH:mm:ss'),
      customDisplay: {
        startDate: start.format('YYYY-MM-DD'),
        endDate: end.format('YYYY-MM-DD'),
        startTime: start.format('HH:mm'),
        endTime: end.format('HH:mm'),
      },
      backgroundColor: color,
      borderColor: color,
      mobile: '0912345678',
      orderNumber: `order#${i + 1}`,
    })
  }

  return events
}
