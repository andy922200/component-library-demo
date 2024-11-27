<script setup lang="ts">
import ScrollableDateTable from '@/components/ScrollableDateTable/index.vue'

const timeSlotDateMap = {
  '2024/11/08': [
    { startTime: '08:00', endTime: '08:30' },
    { startTime: '18:00', endTime: '19:00' },
  ],
  '2024/11/14': [
    { startTime: '08:00', endTime: '08:30' },
    { startTime: '15:00', endTime: '16:00' },
    { startTime: '16:00', endTime: '16:30' },
    { startTime: '18:00', endTime: '19:00' },
  ],
  '2024/11/22': [
    { startTime: '08:00', endTime: '08:30' },
    { startTime: '15:00', endTime: '16:00' },
    { startTime: '19:00', endTime: '20:00' },
  ],
  '2025/01/22': [
    { startTime: '08:00', endTime: '08:30' },
    { startTime: '15:00', endTime: '16:00' },
    { startTime: '16:00', endTime: '16:30' },
  ],
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
    >
      <template #date="{ dayjsObj, currentYear }">
        <span class="custom-date">
          {{
            dayjsObj.get('year') === currentYear
              ? dayjsObj.format('MM/DD')
              : dayjsObj.format('YYYY/MM/DD')
          }}
        </span>
      </template>

      <template #timeSlot="{ date, startTime, endTime }">
        {{ date === '2024/11/08' ? 'Hoo~' : '' }} {{ startTime }} - {{ endTime }}
      </template>
    </ScrollableDateTable>
  </div>
</template>
