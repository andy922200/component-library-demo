<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'

import dayjs from '@/plugins/dayjs'

import { ScheduleCell, TimeSlot } from './type'

defineOptions({
  name: 'ScrollableDateTable',
})

const props = withDefaults(
  defineProps<{
    startDate: string
    endDate: string
    timeSlotDateMap: Record<string, TimeSlot[]>
    separator?: string
    daysOfWeekStrArr?: string[]
    firstDayOfWeek?: number
    headerBorderColor?: string
    activeBgCellColor?: string
    inActiveBgCellColor?: string
    dateFormat?: string
    maxTableHeight?: number
  }>(),
  {
    startDate: '',
    endDate: '',
    timeSlotDateMap: () => ({}),
    separator: '~',
    daysOfWeekStrArr: () => ['週日', '週一', '週二', '週三', '週四', '週五', '週六'],
    firstDayOfWeek: () => 0,
    headerBorderColor: 'bg-[#FBAD1D]',
    activeBgCellColor: 'bg-[#FBCE7A66]',
    inActiveBgCellColor: 'bg-transparent',
    dateFormat: 'YYYY-MM-DD',
    maxTableHeight: undefined,
  },
)

const headerBorderWidthAdjust = 15 // scrollbar 寬度
const currentYear = dayjs().get('year')
const headerBorderRef = ref<HTMLDivElement | null>(null)
const scrollableDateTableRef = ref<HTMLTableElement | null>(null)
const dynamicTableHeight = ref<string>('')
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
  timeSlotDateMap: Record<string, TimeSlot[]>
  firstDayOfWeek: number
}): ScheduleCell[][] => {
  let currentDate = dayjs(startDate)
  const weeklySchedule: ScheduleCell[][] = []

  while (currentDate.isSameOrBefore(dayjs(endDate))) {
    const weekRow: ScheduleCell[] = Array(7).fill(null)

    // 計算當週的起始空白日數
    let startDayIndex = (currentDate.day() - firstDayOfWeek) % 7

    // 填充當週的日期和時間段
    for (let i = startDayIndex; i < 7 && currentDate.isSameOrBefore(endDate); i++) {
      const dateStr = currentDate.format(props.dateFormat)
      const timeSlots = timeSlotDateMap[dateStr]

      weekRow[i] = {
        date: dateStr,
        timeSlots: timeSlots,
        dayjsObj: currentDate,
      }

      // 日期加一天
      currentDate = currentDate.add(1, 'day')
    }

    weeklySchedule.push(weekRow)
  }

  return weeklySchedule
}

const syncBorderWidth = () => {
  if (!headerBorderRef.value || !scrollableDateTableRef.value) return
  // 使用 table 的 offsetWidth
  const tableWidth = scrollableDateTableRef.value.offsetWidth
  headerBorderRef.value.style.width = `${tableWidth - headerBorderWidthAdjust}px`
}

const applyMaxHeightToCells = () => {
  const cells = document.querySelectorAll('.scrollable-date-table__cell')
  if (cells.length === 0) return

  const maxHeight = Math.max(...Array.from(cells).map((cell) => (cell as HTMLElement).offsetHeight))

  cells.forEach((cell) => {
    ;(cell as HTMLElement).style.height = `${maxHeight}px`
  })
}

const setDynamicTableHeight = () => {
  if (!props.maxTableHeight || !scrollableDateTableRef.value) {
    dynamicTableHeight.value = ''
    return
  }

  dynamicTableHeight.value =
    scrollableDateTableRef.value.offsetHeight > props.maxTableHeight
      ? `${props.maxTableHeight}px`
      : ''
}

watch(schedule, () => {
  nextTick(() => {
    applyMaxHeightToCells()
    setDynamicTableHeight()
  })
})

watch(
  () => props.maxTableHeight,
  () => {
    nextTick(() => {
      applyMaxHeightToCells()
      setDynamicTableHeight()
    })
  },
)

onMounted(() => {
  nextTick(() => {
    applyMaxHeightToCells()
    setDynamicTableHeight()
  })

  if (scrollableDateTableRef.value && headerBorderRef.value) {
    // 初始化邊線寬度
    syncBorderWidth()
    // 監聽尺寸變化
    window.addEventListener('resize', syncBorderWidth)
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', syncBorderWidth)
})
</script>

<template>
  <div
    class="scrollable-date-table__wrapper w-full overflow-hidden rounded"
    :style="{ height: dynamicTableHeight }"
  >
    <div class="size-full overflow-auto">
      <!-- Header 下邊線，需浮動以避免被 scroll 內容擋住 -->
      <div
        ref="headerBorderRef"
        class="scrollable-date-table__header-border sticky left-1.5 top-10 z-20 h-px w-full"
        :class="[props.headerBorderColor]"
      />

      <table
        ref="scrollableDateTableRef"
        class="scrollable-date-table h-fit w-full table-fixed border-collapse"
      >
        <thead>
          <tr class="scrollable-date-table__header-row">
            <th
              v-for="day in daysOfWeekStrDisplayOrder"
              :key="day"
              class="scrollable-date-table__header-cell sticky top-0 break-all bg-white text-center align-top"
            >
              <div class="py-2 min-[500px]:px-2">
                {{ day }}
              </div>
            </th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="(week, weekIndex) in schedule"
            :key="weekIndex"
            class="scrollable-date-table__row h-full"
          >
            <td
              v-for="(cell, cellIndex) in week"
              :key="cellIndex"
              class="scrollable-date-table__cell break-all rounded align-top"
              :data-date="cell?.date"
            >
              <div
                class="scrollable-date-table__div flex h-full flex-col items-center overflow-hidden whitespace-normal p-1 text-center"
              >
                <div
                  class="size-full break-all rounded p-0.5 md:p-2 xl:p-4"
                  :class="[
                    cell?.timeSlots?.length > 0
                      ? props.activeBgCellColor
                      : `border border-dashed ${props.inActiveBgCellColor}`,
                  ]"
                >
                  <div
                    v-if="cell?.timeSlots?.length > 0"
                    class="mb-2 text-right text-xs md:text-sm"
                  >
                    <slot
                      name="date"
                      :date="cell.date"
                      :current-year="currentYear"
                      :dayjs-obj="cell.dayjsObj"
                    >
                      {{ cell.date }}
                    </slot>
                  </div>
                  <div class="w-full">
                    <template v-if="cell?.timeSlots?.length > 0">
                      <div
                        v-for="(timeSlot, timeIndex) in cell.timeSlots"
                        :key="timeIndex"
                        class="w-full text-right text-xs md:text-sm"
                        :class="[timeIndex !== cell.timeSlots.length - 1 ? 'mb-1' : '']"
                        :data-date="`${cell.dayjsObj.format(dateFormat)}`"
                        :data-start-time="timeSlot.startTime"
                        :data-end-time="timeSlot.endTime"
                        :style="{ wordBreak: 'break-word' }"
                      >
                        <slot
                          name="timeSlot"
                          :date="cell?.date"
                          :dayjs-obj="cell.dayjsObj"
                          :start-time="timeSlot.startTime"
                          :end-time="timeSlot.endTime"
                        >
                          {{ timeSlot.startTime }} {{ separator }} {{ timeSlot.endTime }}
                        </slot>
                      </div>
                    </template>
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
