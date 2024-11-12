<script setup lang="ts">
import dayjs from 'dayjs'
import { computed } from 'vue'

import { ScheduleCell } from './type'

defineOptions({
  name: 'ScrollableDateTable',
})

const props = withDefaults(
  defineProps<{
    startDate: string
    endDate: string
    timeSlotDateMap: Record<string, string[]>
    daysOfWeekStrArr?: string[]
    firstDayOfWeek?: number
  }>(),
  {
    startDate: '',
    endDate: '',
    timeSlotDateMap: () => ({}),
    daysOfWeekStrArr: () => ['週日', '週一', '週二', '週三', '週四', '週五', '週六'],
    firstDayOfWeek: () => 0,
  },
)

const daysOfWeekStrDisplayOrder = computed(() => {
  return props.daysOfWeekStrArr
    .slice(props.firstDayOfWeek)
    .concat(props.daysOfWeekStrArr.slice(0, props.firstDayOfWeek))
})

const schedule = computed(() => {
  return generateSchedule({
    startDate: props.startDate,
    endDate: props.endDate,
    timeSlotDateMap: props.timeSlotDateMap,
    firstDayOfWeek: props.firstDayOfWeek,
  })
})

const generateSchedule = ({
  startDate,
  endDate,
  timeSlotDateMap,
  firstDayOfWeek,
}: {
  startDate: string
  endDate: string
  timeSlotDateMap: Record<string, string[]>
  firstDayOfWeek: number
}): ScheduleCell[][] => {
  let currentDate = dayjs(startDate)
  const currentYear = dayjs().get('year')
  const weeklySchedule: ScheduleCell[][] = []

  while (currentDate.isBefore(dayjs(endDate))) {
    const weekRow: ScheduleCell[] = Array(7).fill(null)

    // 計算當週的起始空白日數
    let startDayIndex = (currentDate.day() - firstDayOfWeek) % 7

    // 填充當週的日期和時間段
    for (let i = startDayIndex; i < 7 && currentDate.isBefore(endDate); i++) {
      const dateStr = currentDate.format('YYYY-MM-DD')
      const timeSlots = timeSlotDateMap[dateStr] || ['03:00 ~ 04:00']

      weekRow[i] = {
        date:
          currentDate.get('year') === currentYear
            ? currentDate.format('MM/DD')
            : currentDate.format('YYYY/MM/DD'),
        timeSlots: timeSlots,
      }

      // 日期加一天
      currentDate = currentDate.add(1, 'day')
    }

    weeklySchedule.push(weekRow)
  }

  return weeklySchedule
}
</script>

<template>
  <div
    class="scrollable-date-table__wrapper h-[400px] w-full overflow-hidden rounded border border-[#ccc]"
  >
    <div class="size-full overflow-auto">
      <table class="scrollable-date-table w-full border-collapse">
        <thead>
          <tr class="scrollable-date-table__header-row">
            <th
              v-for="day in daysOfWeekStrDisplayOrder"
              :key="day"
              class="scrollable-date-table__header-cell sticky top-0 break-all border-b border-r border-[#ddd] bg-[#f2f2f2] p-2 text-center align-top"
            >
              {{ day }}
            </th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="(week, weekIndex) in schedule"
            :key="weekIndex"
            class="scrollable-date-table__row"
          >
            <td
              v-for="(cell, cellIndex) in week"
              :key="cellIndex"
              class="scrollable-date-table__cell break-all border-b border-r border-[#ddd] p-2 align-top"
              :data-date="cell?.date"
            >
              <div
                v-if="cell"
                class="scrollable-date-table__div flex h-fit flex-col items-center overflow-hidden whitespace-normal text-center"
              >
                <div class="text-sm text-[#ccc]">( {{ cell.date }} )</div>
                <div class="min-w-[120px]">
                  <div
                    v-for="(timeSlot, timeIndex) in cell.timeSlots"
                    :key="timeIndex"
                    class="w-full text-center"
                  >
                    {{ timeSlot }}
                  </div>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped lang="scss">
.scrollable-date-table__wrapper {
  .scrollable-date-table__div {
    word-wrap: break-word;
  }
}
</style>
