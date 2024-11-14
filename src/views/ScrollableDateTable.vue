<script setup lang="ts">
import ScrollableDateTable from '@/components/ScrollableDateTable/index.vue'

const timeSlotDateMap = {
  '2024/11/08': ['08:00 ~ 08:30', '18:00 ~ 19:00'],
  '2024/11/14': ['08:00 ~ 08:30', '15:00 ~ 16:00', '16:00 ~ 16:30', '18:00 ~ 19:00'],
  '2024/11/22': ['08:00 ~ 08:30', '15:00 ~ 16:00', '19:00 ~ 20:00'],
  '2025/01/22': ['08:00 ~ 08:30', '15:00 ~ 16:00', '16:00 ~ 16:30'],
}

defineOptions({
  name: 'DemoScrollableDateTable',
})
</script>

<template>
  <div class="w-full p-2">
    <ScrollableDateTable
      start-date="2024-11-08"
      end-date="2024-11-30"
      :time-slot-date-map="timeSlotDateMap"
      :first-day-of-week="1"
      :max-table-height="400"
      date-format="YYYY/MM/DD"
    />
  </div>
</template>
