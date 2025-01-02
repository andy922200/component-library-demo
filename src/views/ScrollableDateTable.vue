<script setup lang="ts">
import ScrollableDateTable from '@/components/ScrollableDateTable/index.vue'
import { ScheduleCell } from '@/components/ScrollableDateTable/type'

const timeSlotDateMap = {
  '2024/11/08': [
    { startTime: '08:00', endTime: '08:30', isDisabled: true },
    { startTime: '18:00', endTime: '19:00', isDisabled: true },
  ],
  '2024/11/14': [
    { startTime: '08:00', endTime: '08:30', isDisabled: true },
    { startTime: '15:00', endTime: '16:00', isDisabled: true },
    { startTime: '16:00', endTime: '16:30', isDisabled: true },
    { startTime: '18:00', endTime: '19:00', isDisabled: true },
  ],
  '2025/01/17': [
    { startTime: '08:00', endTime: '08:30', isDisabled: false },
    { startTime: '15:00', endTime: '16:00', isDisabled: false },
    { startTime: '19:00', endTime: '20:00', isDisabled: false },
  ],
  '2025/01/22': [
    { startTime: '08:00', endTime: '08:30', isDisabled: false },
    { startTime: '15:00', endTime: '16:00', isDisabled: false },
    { startTime: '16:00', endTime: '16:30', isDisabled: false },
  ],
}

const handleCellClick = (cell: ScheduleCell) => {
  console.log(cell)
}

defineOptions({
  name: 'DemoScrollableDateTable',
})
</script>

<template>
  <div class="w-full p-2">
    <ScrollableDateTable
      start-date="2024-11-08"
      end-date="2025-01-24"
      :time-slot-date-map="timeSlotDateMap"
      :first-day-of-week="0"
      :max-table-height="400"
      date-format="YYYY/MM/DD"
      :active-click-cell="true"
      @click-cell="handleCellClick"
    >
      <template #date="{ dayjsObj, currentYear }">
        <div class="w-full">
          <span
            class="custom-full-date-year w-full md:w-auto"
            :class="[dayjsObj.get('year') === currentYear ? 'hidden' : 'inline-block']"
          >
            {{ dayjsObj.get('year') === currentYear ? '' : dayjsObj.format('YYYY') }}
          </span>
          <span
            class="hidden"
            :class="[dayjsObj.get('year') === currentYear ? '' : 'md:inline-block']"
            >/</span
          >
          <span>{{ dayjsObj.format('MM/DD') }}</span>
        </div>
      </template>

      <template #timeSlot="{ date, startTime, endTime }">
        <span class="hidden md:inline-block">
          {{ date === '2024/11/08' ? 'Hoo~' : '' }} {{ startTime }} - {{ endTime }}
        </span>
      </template>
    </ScrollableDateTable>
  </div>
</template>
