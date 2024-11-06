<script setup lang="ts">
import {
  CalendarApi,
  CalendarOptions,
  DateSelectArg,
  DatesSetArg,
  EventApi,
  EventClickArg,
  EventInput,
  EventMountArg,
} from '@fullcalendar/core'
import allLocales from '@fullcalendar/core/locales-all'
import dayGridPlugin from '@fullcalendar/daygrid'
import FullCalendar from '@fullcalendar/vue3'
import { useWindowSize } from '@vueuse/core'
import dayjs from 'dayjs'
import { computed, ref, watch, watchEffect } from 'vue'

import FullCalendarTooltip from './FullCalendarTooltip.vue'

const fullCalendarInstance = ref<typeof FullCalendar | null>(null)
const { width: windowWidth } = useWindowSize()

const props = withDefaults(
  defineProps<{
    currentEvents?: EventInput[] | undefined
    options?: Omit<CalendarOptions, 'locale'>
    defaultLocale?: string
    tooltipState: {
      visible: boolean
      position: {
        x: number
        y: number
      }
      content?: Record<string, any>
    }
  }>(),
  {
    currentEvents: undefined,
    defaultLocale: 'en',
    options: () => ({}),
    tooltipState: () => ({
      visible: false,
      position: {
        x: 0,
        y: 0,
      },
    }),
  },
)

const emits = defineEmits<{
  'update:currentEvents': [value: EventInput[] | undefined]
  'update:tooltipState': [value: Record<string, any>]
  'update:handleEventClick': [value: EventClickArg]
  'update:handleDateSelect': [value: { original: DateSelectArg; calendarApi: CalendarApi }]
  'update:handleDatesSet': [value: { info: DatesSetArg; calendarApi: CalendarApi }]
}>()

const calendarLang = computed(() => props.defaultLocale)
const isControlled = computed(() => props.currentEvents !== undefined)
const localValue = ref<EventInput[] | undefined>([])

const internalValue = computed({
  get: () => (isControlled.value ? props.currentEvents : localValue.value),
  set: (value) => {
    isControlled.value ? emits('update:currentEvents', value) : (localValue.value = value)
  },
})

const internalTooltipValue = computed({
  get: () => props.tooltipState,
  set: (value) => {
    emits('update:tooltipState', value)
  },
})

const handleDateSelect = (selectInfo: DateSelectArg) => {
  const calendarApi = selectInfo.view.calendar
  emits('update:handleDateSelect', { original: selectInfo, calendarApi })
  calendarApi.unselect() // clear date select after trigger
}

const handleEventClick = (clickInfo: EventClickArg) => {
  emits('update:handleEventClick', clickInfo)
}

const handleEventDidMount = (info: EventMountArg) => {
  addToggleTooltip({
    eventData: info.event,
    referenceEl: info.el,
    viewMode: info.view.type,
  })
}

const handleDatesSetTrigger = (info: DatesSetArg) => {
  const calendarApi = info.view.calendar
  emits('update:handleDatesSet', { info, calendarApi })
}

const closeTooltip = () => {
  internalTooltipValue.value.visible = false
}

const addToggleTooltip = ({
  eventData,
  referenceEl,
  viewMode,
}: {
  eventData: EventApi
  referenceEl: HTMLElement
  viewMode: string
}) => {
  if (viewMode !== 'dayGridMonth') return

  const toggleTooltip = () => {
    const rect = referenceEl.getBoundingClientRect()
    const { extendedProps, ...cleanedExtendedProps } = eventData?.toPlainObject() || {}

    internalTooltipValue.value.content = {
      ...cleanedExtendedProps,
      ...extendedProps,
    }

    let tooltipX = rect.left + window.scrollX
    let tooltipY = rect.top + window.scrollY - 24

    // 若 more popover 開啟，則觸發關閉，並調整 tooltip 位置
    const morePopoverDOM = document.querySelector('.fc-more-popover')
    const morePopoverCloseBtn = document.querySelector('.fc-popover-close') as HTMLElement
    const eventStartDateStr = dayjs(eventData.start).format('YYYY-MM-DD')
    const eventStartDateDom = document.querySelector(`td[data-date="${eventStartDateStr}"]`)

    if (morePopoverDOM && morePopoverCloseBtn) {
      morePopoverCloseBtn.click()
      tooltipX = Number(eventStartDateDom?.getBoundingClientRect().x) + window.scrollX + 4
      tooltipY = Number(eventStartDateDom?.getBoundingClientRect().y) + window.scrollY + 8
    }

    const tooltipWidth = 280 // tooltip 固定寬度
    const screenWidth = window.innerWidth

    if (tooltipX + tooltipWidth > screenWidth) {
      tooltipX = screenWidth - tooltipWidth - 16 // 調整到螢幕內，並留一點邊距
    }

    internalTooltipValue.value.position.x = tooltipX
    internalTooltipValue.value.position.y = tooltipY
    internalTooltipValue.value.visible = true
    referenceEl.blur()
  }

  referenceEl.addEventListener('click', toggleTooltip)
}

const handleEvents = (events: EventApi[]) => {
  internalValue.value = events.map((event) => event.toPlainObject())
}

const calendarOptions = ref<CalendarOptions>({
  plugins: [dayGridPlugin],
  locales: allLocales,
  locale: calendarLang.value,
  aspectRatio: 1.35,
  ...props.options,
  select: handleDateSelect,
  eventClick: handleEventClick,
  eventsSet: handleEvents,
  eventDidMount: handleEventDidMount,
  datesSet: handleDatesSetTrigger,
})

watchEffect(() => {
  calendarOptions.value.locale = calendarLang.value
})

watch(
  () => internalValue.value,
  async (newVal) => {
    // 當事件變動且獲得的值 > 0時，重新渲染，否則會無限循環
    if (newVal && newVal.length > 0) {
      const calendarApi = fullCalendarInstance.value?.getApi()

      // 移除所有事件後，再重新加入
      if (calendarApi) {
        calendarApi.removeAllEvents()
        newVal.forEach((event) => calendarApi.addEvent(event))
      }
    }
  },
)

watch(
  () => windowWidth.value,
  (newVal) => {
    // 當視窗寬度變動時，關閉 tooltip
    if (newVal) {
      closeTooltip()
    }
  },
)
</script>

<template>
  <div class="full-calendar flex size-full items-center px-2 text-sm">
    <FullCalendar ref="fullCalendarInstance" :options="calendarOptions">
      <template #eventContent="arg">
        <div class="flex w-full items-center px-1">
          <span
            class="custom-dot inline-block size-2 min-w-2 rounded-full"
            :style="{ backgroundColor: arg.backgroundColor }"
          />
          <p class="grow truncate px-1">
            {{
              arg.event.allDay
                ? `${arg.event.title}`
                : `${dayjs(arg.event.start).format('HH:mm')} ${arg.event.title}`
            }}
          </p>
        </div>
      </template>
    </FullCalendar>

    <FullCalendarTooltip
      v-model:visible="internalTooltipValue.visible"
      :x="internalTooltipValue.position.x"
      :y="internalTooltipValue.position.y"
    >
      <slot name="tooltip-content" />
    </FullCalendarTooltip>
  </div>
</template>

<style lang="scss" scoped>
/* full-calendar root */
.fc {
  width: 100%;

  :deep(.fc-header-toolbar):nth-child(1) {
    margin-bottom: 1rem;
    flex-wrap: wrap;

    @media screen and (width >= 768px) {
      flex-wrap: nowrap;
    }
  }

  :deep(.fc-toolbar-chunk):nth-child(1) {
    order: 1;

    @media screen and (width >= 768px) {
      width: auto;
    }
  }

  :deep(.fc-toolbar-chunk):nth-child(2) {
    order: 2;

    div {
      display: flex;
      align-items: center;
    }

    .fc-toolbar-title {
      margin: 0 1rem;
    }
  }

  :deep(.fc-toolbar-chunk):nth-child(3) {
    order: 3;
    width: 0;
  }
}
</style>
