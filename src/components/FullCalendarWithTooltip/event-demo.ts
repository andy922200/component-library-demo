import { EventInput } from '@fullcalendar/core'
import dayjs from 'dayjs'

const today = dayjs()
const firstDayCurrentMonth = today.startOf('month')
const fifteenthDayCurrentMonth = today.startOf('month').add(14, 'days')
const lastDayCurrentMonth = today.endOf('month')

interface CustomEventInput extends EventInput {
  [key: string]: any
}

export const INITIAL_EVENTS: CustomEventInput[] = [
  {
    id: '1',
    title: '板橋鄉民活動中心1',
    start: firstDayCurrentMonth.format('YYYY-MM-DD HH:mm:ss'),
    end: firstDayCurrentMonth.add(1, 'hours').format('YYYY-MM-DD HH:mm:ss'),
    backgroundColor: '#27AE60',
    borderColor: '#27AE60',
    mobile: '0912345678',
    orderNumber: 'order#1',
  },
  {
    id: '2',
    title: '板橋警民活動中心2',
    start: firstDayCurrentMonth.add(1, 'hours').format('YYYY-MM-DD HH:mm:ss'),
    end: firstDayCurrentMonth.add(2, 'hours').format('YYYY-MM-DD HH:mm:ss'),
    backgroundColor: '#2F80ED',
    borderColor: '#2F80ED',
    mobile: '0912345678',
    orderNumber: 'order#2',
  },
  {
    id: '3',
    title: '板橋警民活動中心3',
    start: firstDayCurrentMonth.add(3, 'hours').format('YYYY-MM-DD HH:mm:ss'),
    end: firstDayCurrentMonth.add(4, 'hours').format('YYYY-MM-DD HH:mm:ss'),
    backgroundColor: '#2F80ED',
    borderColor: '#2F80ED',
    mobile: '0912345678',
    orderNumber: 'order#3',
  },
  {
    id: '4',
    title: '板橋警民活動中心4',
    start: firstDayCurrentMonth.add(6, 'hours').format('YYYY-MM-DD HH:mm:ss'),
    end: firstDayCurrentMonth.add(7, 'hours').format('YYYY-MM-DD HH:mm:ss'),
    backgroundColor: '#2F80ED',
    borderColor: '#2F80ED',
    mobile: '0912345678',
    orderNumber: 'order#4',
  },
  {
    id: '5-1',
    title: '板橋警民活動中心5-1',
    start: today.startOf('month').format('YYYY-MM-DD HH:mm:ss'),
    end: today.startOf('month').add(1, 'hours').format('YYYY-MM-DD HH:mm:ss'),
    backgroundColor: '#2F80ED',
    borderColor: '#2F80ED',
    mobile: '0912345678',
    orderNumber: 'order#5-1',
  },
  {
    id: '5-2',
    title: '板橋警民活動中心5-2',
    start: fifteenthDayCurrentMonth.add(3, 'hours').format('YYYY-MM-DD HH:mm:ss'),
    end: fifteenthDayCurrentMonth.add(4, 'hours').format('YYYY-MM-DD HH:mm:ss'),
    backgroundColor: '#2F80ED',
    borderColor: '#2F80ED',
    mobile: '0912345678',
    orderNumber: 'order#5-2',
  },
  {
    id: '6',
    title: '板橋警民活動中心6',
    start: fifteenthDayCurrentMonth.add(5, 'hours').format('YYYY-MM-DD HH:mm:ss'),
    end: fifteenthDayCurrentMonth.add(6, 'hours').format('YYYY-MM-DD HH:mm:ss'),
    backgroundColor: '#2F80ED',
    borderColor: '#2F80ED',
    orderNumber: 'order#6',
  },
  {
    id: '7',
    title: '板橋警民活動中心7',
    start: fifteenthDayCurrentMonth.add(6, 'hours').format('YYYY-MM-DD HH:mm:ss'),
    end: fifteenthDayCurrentMonth.add(7, 'hours').format('YYYY-MM-DD HH:mm:ss'),
    backgroundColor: '#2F80ED',
    borderColor: '#2F80ED',
    mobile: '0912345678',
    orderNumber: 'order#7',
  },
  {
    id: '8',
    title: '板橋警民活動中心8',
    start: fifteenthDayCurrentMonth.add(15, 'hours').format('YYYY-MM-DD HH:mm:ss'),
    end: fifteenthDayCurrentMonth.add(16, 'hours').format('YYYY-MM-DD HH:mm:ss'),
    backgroundColor: '#2F80ED',
    borderColor: '#2F80ED',
    mobile: '0912345678',
    orderNumber: 'order#8',
  },
  {
    id: '9',
    title: '新莊鄉民活動中心9',
    start: lastDayCurrentMonth.startOf('day').format('YYYY-MM-DD HH:mm:ss'),
    end: lastDayCurrentMonth.startOf('day').add(1, 'hours').format('YYYY-MM-DD HH:mm:ss'),
    backgroundColor: '#EB6615',
    borderColor: '#EB6615',
    mobile: '0912345678',
    orderNumber: 'order#9',
  },
]
