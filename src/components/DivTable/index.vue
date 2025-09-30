<script setup lang="ts" generic="T extends { [key: string]: any }, K extends HeaderItem">
import { useWindowSize } from '@vueuse/core'
import { PropType } from 'vue'

import { HeaderItem } from './type'

defineOptions({
  name: 'DivTable',
})

const props = defineProps({
  header: {
    type: Array as PropType<K[]>,
    default: () => [],
  },
  data: {
    type: Array as PropType<T[]>,
    default: () => [],
  },
})

const { width: windowWidth } = useWindowSize()
</script>

<template>
  <div class="div-table text-gray-500">
    <div class="div-table__header hidden lg:flex lg:border-b lg:border-b-[#e0e0e0]">
      <div
        v-for="headerItem in props.header"
        :key="headerItem.paramKey"
        class="div-table__header-item flex flex-1 p-2 font-[bold]"
      >
        <slot :name="`header-${headerItem.paramKey}`" :header-item="headerItem">
          {{ headerItem.titleKey }}
        </slot>
      </div>
    </div>

    <div class="div-table__body lg:flex lg:flex-col">
      <template v-if="windowWidth < 1024">
        <div
          v-for="(dataItem, index) in props.data"
          :key="index"
          class="div-table__row--mobile relative my-2 rounded-md border border-gray-200 pt-2 shadow"
        >
          <div
            v-for="headerItem in props.header"
            :key="`${index}-${headerItem.paramKey}`"
            class="div-table__cell--mobile mb-2 flex items-center px-2"
          >
            <span
              class="color-[#333] mx-2 inline-block w-20 font-bold break-all whitespace-pre-wrap"
            >
              {{ headerItem.titleKey }}
            </span>
            <slot :name="`body-${headerItem.paramKey}`" :data-item="dataItem">
              <div class="flex-1">{{ dataItem[headerItem.paramKey] }}</div>
            </slot>
          </div>
        </div>
      </template>

      <template v-else>
        <div
          v-for="(dataItem, index) in props.data"
          :key="index"
          class="div-table__row relative flex flex-wrap border-b border-b-[#e0e0e0]"
        >
          <div
            v-for="headerItem in props.header"
            :key="`${index}-${headerItem.paramKey}`"
            class="div-table__cell mb-0 flex flex-1 items-center p-2"
          >
            <slot :name="`body-${headerItem.paramKey}`" :data-item="dataItem">
              <div class="flex-1">{{ dataItem[headerItem.paramKey] }}</div>
            </slot>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
