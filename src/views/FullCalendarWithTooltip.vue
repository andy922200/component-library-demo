<script setup lang="ts">
import { CalendarApi, DatesSetArg, EventClickArg } from '@fullcalendar/core'
import dayjs from 'dayjs'
import { reactive, ref, watch } from 'vue'

import { colors, generateEvents, titles } from '@/components/FullCalendarWithTooltip/event-demo'
import FullCalendarWithTooltip from '@/components/FullCalendarWithTooltip/index.vue'
const eventCollection = ref()

let tooltipState = reactive({
  visible: false,
  position: {
    x: 0,
    y: 0,
  },
  content: {} as Record<string, any>,
})

const resetTooltipContent = () => {
  const contentKeys = Object.keys(tooltipState.content)
  contentKeys.forEach((key) => {
    tooltipState.content[key] = ''
  })
}

const triggerCloseTooltip = () => {
  tooltipState.visible = false
  resetTooltipContent()
}

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
  const startTime = info.view.currentStart
  const endTime = info.view.currentEnd

  if (!calendarApi) return

  calendarApi.removeAllEvents()

  await new Promise((resolve) => setTimeout(resolve, 500))

  eventCollection.value = generateEvents({
    count: 10,
    startDate: dayjs(startTime).format('YYYY-MM-DD'),
    endDate: dayjs(endTime).format('YYYY-MM-DD'),
    intervalHours: 8,
    titles,
    colors,
  })
}

watch(
  () => tooltipState.visible,
  (newVal) => {
    if (!newVal) {
      resetTooltipContent()
    }
  },
)
</script>

<template>
  <div class="w-full">
    <h1 class="text-center text-lg">FullCalendar 加上 Tooltip 應用</h1>

    <div class="h-[50rem]">
      <FullCalendarWithTooltip
        v-model:tooltip-state="tooltipState"
        :current-events="eventCollection"
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
      >
        <template #tooltip-content>
          <div class="mb-2 flex items-center justify-between font-bold">
            <span>{{ tooltipState.content?.title }}</span>
            <span
              class="cursor-pointer text-gray-400 hover:text-gray-600"
              @click.self="triggerCloseTooltip"
            >
              &times;
            </span>
          </div>
          <div class="mb-2 leading-relaxed">
            <p>
              時間：{{ tooltipState.content?.customDisplay?.startDate }}
              {{ tooltipState.content?.customDisplay?.startTime }} -
              {{ tooltipState.content?.customDisplay?.endTime }}
            </p>
            <p>訂單編號：{{ tooltipState.content?.orderNumber }}</p>
          </div>
        </template>
      </FullCalendarWithTooltip>
    </div>
  </div>
</template>
