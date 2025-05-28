<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import { LayoutLanguages, Locales } from './plugins/i18n/config/locales'
import { useMainStore } from './store/modules/main'

const mainStore = useMainStore()
const { locale } = useI18n()
const selectedLanguageModel = computed({
  get() {
    return mainStore.selectedLanguage
  },
  set(value: Locales) {
    locale.value = value
    mainStore.setLanguage(value)
  },
})
</script>

<template>
  <div class="flex items-center justify-center">
    <img alt="Vue logo" src="./assets/logo.png" class="size-20" />
  </div>

  <div class="my-2 flex items-center justify-center">
    <p class="mx-2">語言選擇 Language Select</p>
    <select v-model="selectedLanguageModel">
      <option v-for="list in LayoutLanguages" :key="list.param" :value="list.param">
        {{ list.title }}
      </option>
    </select>
  </div>

  <div class="w-full">
    <div class="my-2 flex w-full flex-wrap items-center justify-center">
      <router-link :to="{ name: 'index' }" class="m-2">Time Selector 時間選擇</router-link>
      <router-link :to="{ name: 'calendar' }" class="m-2">Calendar 日曆</router-link>
      <router-link :to="{ name: 'selector' }" class="m-2">Selector 選擇器</router-link>
      <router-link :to="{ name: 'checkbox' }" class="m-2">Checkbox 核取方塊</router-link>
      <router-link :to="{ name: 'checkbox-group' }" class="m-2">
        CheckboxGroup 核取方塊群
      </router-link>
      <router-link :to="{ name: 'radio-checkbox-group' }" class="m-2">
        RadioCheckboxGroup 單選按鈕 Checkbox 樣式
      </router-link>
      <router-link :to="{ name: 'input' }" class="m-2">Input 輸入框</router-link>
      <router-link :to="{ name: 'tooltip' }" class="m-2">Tooltip 工具提示框</router-link>
      <router-link :to="{ name: 'spinner' }" class="m-2">Spinner 讀取圖示</router-link>
      <router-link :to="{ name: 'backdrop' }" class="m-2">Backdrop 背景板</router-link>
      <router-link :to="{ name: 'pagination-buttons' }" class="m-2">
        Pagination Buttons 分頁按鈕
      </router-link>
      <router-link :to="{ name: 'pagination-info' }" class="m-2"> Pagination 分頁資訊 </router-link>
      <router-link :to="{ name: 'div-table' }" class="m-2"> DIV Table 表格 </router-link>
      <router-link :to="{ name: 'switch' }" class="m-2"> Switch 切換按鈕 </router-link>
      <router-link :to="{ name: 'tag' }" class="m-2"> Tag 標籤 </router-link>
      <router-link :to="{ name: 'tree-view' }" class="m-2"> TreeView 樹狀結構 </router-link>
      <router-link :to="{ name: 'expansion' }" class="m-2"> Expansion 展開元件 </router-link>
      <router-link :to="{ name: 'time-slots' }" class="m-2"> TimeSlots 時間間隔顯示 </router-link>
      <router-link :to="{ name: 'radio-group' }" class="m-2"> RadioGroup 單選按鈕組 </router-link>
      <router-link :to="{ name: 'recur-time-selector' }" class="m-2">
        RecurTimeSelector 週期預約時間選擇器
      </router-link>
      <router-link :to="{ name: 'swiper' }" class="m-2"> Swiper 圖片輪播 </router-link>
      <router-link :to="{ name: 'full-calendar-with-tooltip' }" class="m-2">
        FullCalendar 加上 Tooltip
      </router-link>
      <router-link :to="{ name: 'scrollable-date-table' }" class="m-2">
        Scrollable Table 可滾動的日期顯示表格
      </router-link>
      <router-link :to="{ name: 'textarea' }" class="m-2"> Textarea 多行文字輸入 </router-link>
      <router-link :to="{ name: 'button-group' }" class="m-2"> ButtonGroup 按鈕組 </router-link>
      <router-link :to="{ name: 'image-upload' }" class="m-2"> Image Upload 圖片上傳 </router-link>
    </div>
  </div>

  <!-- render route here -->
  <router-view></router-view>
</template>
