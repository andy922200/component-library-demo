<script setup lang="ts">
const props = defineProps<{
  selectedDate: string
  dateObj: Record<string, any>
  holidayColor: string
  showBarColor: string
}>()

const emits = defineEmits<{
  'date-select': [value: string]
}>()

const dateSelectHandler = (e: MouseEvent, isInView: boolean) => {
  const target = e.currentTarget as HTMLElement | null

  if (target && isInView) {
    emits('date-select', `${target.dataset.date}`)
  }
}
</script>

<template>
  <div
    class="date-col relative h-0 w-1/7 pt-[calc(100%/6)] text-gray-300 select-none md:pt-[calc(100%/10)]"
    :data-date="props.dateObj.fullDateText"
    :class="{
      'in-view': props.dateObj.isInView,
      'date-selected': props.selectedDate === props.dateObj.fullDateText,
    }"
    @click="(e: MouseEvent) => dateSelectHandler(e, props.dateObj.isInView)"
  >
    <div
      class="date-content"
      :class="[{ 'show-bar': props.dateObj.shouldShowBar }, { holiday: props.dateObj.isHoliday }]"
      :style="{
        '--base-cal_holiday-color': props.holidayColor,
        '--base-cal_show-bar-color': props.showBarColor,
      }"
    >
      {{ props.dateObj.briefDateText }}
    </div>
  </div>
</template>

<style scoped lang="scss">
.in-view {
  cursor: pointer;
  color: #000;
}

.date-content {
  position: absolute;
  top: 50%;
  left: 50%;
  display: flex;
  height: 100%;
  max-height: 2.2rem;
  width: 100%;
  max-width: 2.2rem;
  transform: translate(-50%, -50%);
  align-items: center;
  justify-content: center;
  border-radius: 0.5rem;

  @media (width >= 768px) {
    max-height: 3rem;
    max-width: 3rem;
  }
}

.in-view > .date-content {
  &:hover {
    background-color: #f1f5f9; // slate-100
  }
}

.in-view > .date-content.holiday::before {
  content: '';
  position: absolute;
  top: 5%;
  left: 50%;
  height: 6px;
  width: 6px;
  transform: translateX(-50%);
  border-radius: 50%;
  background-color: var(--base-cal_holiday-color);

  @media (width >= 768px) {
    top: 10%;
  }
}

.in-view > .date-content.show-bar::after {
  content: '';
  position: absolute;
  bottom: 15%;
  left: 50%;
  width: 1rem; // w-4
  transform: translateX(-50%);
  border-radius: 0.125rem;
  border-bottom: 0.2rem solid;
  border-bottom-color: var(--base-cal_show-bar-color);

  @media (width >= 768px) {
    bottom: 18%;
    width: 1.25rem; // w-5
  }
}

.in-view.date-selected > .date-content {
  pointer-events: none;
  background-color: rgb(128 128 128 / 85%); // #808080D9
  color: #fff;
}
</style>
