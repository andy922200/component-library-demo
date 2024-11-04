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
import { computed, reactive, ref, watch, watchEffect } from 'vue'

import FullCalendarTooltip from './FullCalendarTooltip.vue'

const { width: windowWidth } = useWindowSize()

const tooltipState = reactive({
  visible: false,
  position: {
    x: 0,
    y: 0,
  },
  content: {
    title: '',
    start: null as Date | null,
    end: null as Date | null,
    mobile: '',
    orderNumber: '',
  } as Record<string, any>,
})

const props = withDefaults(
  defineProps<{
    currentEvents?: EventInput[] | undefined
    options?: Omit<CalendarOptions, 'locale'>
    defaultLocale?: string
  }>(),
  {
    currentEvents: undefined,
    defaultLocale: 'en',
    options: () => ({}),
  },
)

const emits = defineEmits<{
  'update:currentEvents': [value: EventInput[] | undefined]
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
  tooltipState.visible = false
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
    const { title, extendedProps, start, end } = eventData || {}
    tooltipState.content = {
      title,
      startDate: dayjs(start).format('YYYY-MM-DD'),
      endDate: dayjs(end).format('YYYY-MM-DD'),
      startTime: dayjs(start).format('HH:mm'),
      endTime: dayjs(end).format('HH:mm'),
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

    tooltipState.position.x = tooltipX
    tooltipState.position.y = tooltipY
    tooltipState.visible = true
    referenceEl.blur()
  }

  referenceEl.addEventListener('click', toggleTooltip)
}

const handleEvents = (events: EventApi[]) => {
  internalValue.value = events.map((event) => event.toPlainObject())
}

const calendarOptions = ref<CalendarOptions>({
  plugins: [dayGridPlugin],
  initialEvents: internalValue.value,
  locales: allLocales,
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
    <FullCalendar :options="calendarOptions">
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
      v-model:visible="tooltipState.visible"
      :x="tooltipState.position.x"
      :y="tooltipState.position.y"
    >
      <div class="mb-2 flex items-center justify-between font-bold">
        <span>{{ tooltipState.content?.title }}</span>
        <span class="cursor-pointer text-gray-400 hover:text-gray-600" @click.self="closeTooltip">
          &times;
        </span>
      </div>
      <div class="mb-2 leading-relaxed">
        <p>
          時間：{{ tooltipState.content?.startDate }} {{ tooltipState.content?.startTime }} -
          {{ tooltipState.content?.endTime }}
        </p>
        <p>訂單編號：{{ tooltipState.content?.orderNumber }}</p>
      </div>
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

    @media screen and (min-width: 768px) {
      flex-wrap: nowrap;
    }
  }

  :deep(.fc-toolbar-chunk):nth-child(1) {
    order: 1;

    @media screen and (min-width: 768px) {
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
    width: 0px;
  }
}
</style>
