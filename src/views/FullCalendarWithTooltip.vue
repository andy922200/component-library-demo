<script setup lang="ts">
import { CalendarApi, DatesSetArg, EventClickArg } from '@fullcalendar/core'
import { ref } from 'vue'

import { INITIAL_EVENTS } from '@/components/FullCalendarWithTooltip/event-demo'
import FullCalendarWithTooltip from '@/components/FullCalendarWithTooltip/index.vue'

const eventCollection = ref(INITIAL_EVENTS)

const triggerEventClick = (clickInfo: EventClickArg) => {
  console.log('triggerDateSelect', clickInfo)
}

const triggerPrevNextToday = async ({
  info,
  calendarApi,
}: {
  info: DatesSetArg
  calendarApi: CalendarApi
}) => {
  const startTime = info.startStr
  const endTime = info.endStr
  console.log('triggerPrevNextToday', info, calendarApi)
  console.log('startTime', startTime, 'endTime', endTime)
}
</script>

<template>
  <div class="w-full">
    <h1 class="text-center text-lg">FullCalendar 加上 Tooltip 應用</h1>

    <div class="h-[50rem]">
      <FullCalendarWithTooltip
        v-model:current-events="eventCollection"
        default-locale="zh-tw"
        :options="{
          height: 'calc(100% - 0.5rem)',
          headerToolbar: {
            left: 'today',
            center: 'prev,title,next',
            right: '',
          },
          selectable: true,
          dayMaxEvents: true,
        }"
        @update:handle-event-click="triggerEventClick"
        @update:handle-dates-set="triggerPrevNextToday"
      />
    </div>
  </div>
</template>
