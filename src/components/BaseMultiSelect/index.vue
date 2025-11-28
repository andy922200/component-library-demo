<script setup lang="ts">
import { onClickOutside, useEventListener } from '@vueuse/core'
import { computed, nextTick, onMounted, ref, watch } from 'vue'

import type { SelectOption } from './type'

defineOptions({
  name: 'BaseMultiSelect',
})

const props = withDefaults(
  defineProps<{
    options: SelectOption[]
    placeholder?: string
    searchable?: boolean
  }>(),
  {
    placeholder: '請選擇一個或多個項目',
  },
)

const isDropdownOpen = defineModel<boolean>('open', {
  default: false,
})
const selectedValues = defineModel<(string | number)[]>({
  default: () => [],
})
const searchText = ref('')
const highlightedIndex = ref(-1)

/** 選項相關 Start */
const checkIsSelected = (value: string | number): boolean => selectedValues.value.includes(value)
const toggleSelection = (value: string | number) => {
  selectedValues.value = checkIsSelected(value)
    ? selectedValues.value.filter((v) => v !== value)
    : [...selectedValues.value, value]
}
const removeSelection = (value: string | number) => {
  selectedValues.value = selectedValues.value.filter((v) => v !== value)
}
const getLabelByValue = (value: string | number): string => {
  const option = props.options.find((opt) => opt.value === value)
  return option ? option.label : value.toString()
}
const filteredOptions = computed(() => {
  if (!searchText.value) return props.options
  const query = searchText.value.toLowerCase().trim()
  return props.options.filter((option) => option.label.toLowerCase().includes(query))
})
const hasFilteredOptions = computed(() => filteredOptions.value.length > 0)
/** 選項相關 End */

/** 下拉選單相關 Start */
const rootRef = ref<HTMLElement | null>(null)
const dropdownRef = ref<HTMLElement | null>(null)
const searchInputElementRef = ref<HTMLInputElement | null>(null)
const position = ref({ top: 0, left: 0, width: 0 })

const dropdownStyle = computed(() => ({
  top: `${position.value.top}px`,
  left: `${position.value.left}px`,
  width: `${position.value.width}px`,
  zIndex: 1000,
}))

const updatePosition = () => {
  if (rootRef.value) {
    const rect = rootRef.value.getBoundingClientRect()
    // 計算位置：
    // top: 選擇器底部 + 捲動偏移量
    const top = rect.bottom + window.scrollY + 4
    // left: 選擇器左邊緣 + 捲動偏移量
    const left = rect.left + window.scrollX

    position.value = {
      top,
      left,
      width: rect.width, // 保持與選擇器主體相同的寬度
    }
  }
}

useEventListener(window, 'resize', updatePosition)
useEventListener(window, 'scroll', updatePosition)
onClickOutside(
  rootRef,
  () => {
    if (isDropdownOpen.value) {
      isDropdownOpen.value = false
    }
  },
  {
    ignore: [dropdownRef], // 忽略點擊 Teleport 出去的下拉選單
  },
)
/** 下拉選單相關 End */

/** 鍵盤操作下拉選單相關 Start */
const selectFirstFilteredOption = () => {
  if (filteredOptions.value.length > 0) {
    const firstOption = filteredOptions.value[0]
    if (!checkIsSelected(firstOption.value)) {
      toggleSelection(firstOption.value)
    }
  }

  rootRef.value?.focus()
}

const handleKeydown = (event: KeyboardEvent) => {
  const isFocusingSearch = searchInputElementRef.value === document.activeElement

  if (!isDropdownOpen.value) {
    // 如果選單關閉，但使用者按了向下箭頭或 Enter，則開啟選單
    if (event.key === 'ArrowDown' || event.key === 'Enter') {
      isDropdownOpen.value = true
      event.preventDefault() // 阻止頁面捲動
    }
    return
  }

  // 如果焦點在搜尋框，且按了方向鍵，則將焦點移到 rootRef
  if (isFocusingSearch && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
    rootRef.value?.focus()
  }

  // 阻止頁面捲動
  event.preventDefault()

  const optionsCount = filteredOptions.value.length

  if (optionsCount === 0) return

  switch (event.key) {
    case 'ArrowDown': {
      highlightedIndex.value =
        highlightedIndex.value === -1 ? 0 : (highlightedIndex.value + 1) % optionsCount
      break
    }
    case 'ArrowUp': {
      highlightedIndex.value =
        highlightedIndex.value === -1
          ? optionsCount - 1
          : (highlightedIndex.value - 1 + optionsCount) % optionsCount
      break
    }
    case 'Enter': {
      if (highlightedIndex.value !== -1) {
        const selectedOption = filteredOptions.value[highlightedIndex.value]
        toggleSelection(selectedOption.value)
      }
      break
    }
    case 'Escape': {
      isDropdownOpen.value = false
      break
    }
  }
}

const handleSearchInputKeydown = (event: KeyboardEvent) => {
  if (['ArrowDown', 'ArrowUp', 'Enter'].includes(event.key)) {
    event.preventDefault() // 阻止瀏覽器預設行為 (如輸入框光標移動)

    if (event.key === 'Enter') {
      const selectedOption = filteredOptions.value[highlightedIndex.value]
      if (highlightedIndex.value !== -1 && selectedOption) {
        toggleSelection(selectedOption.value)
        rootRef.value?.focus() // 選完後將焦點移回 rootRef
        return
      }
    }

    // 如果是方向鍵，強制將焦點移回 rootRef，並讓事件繼續傳播，讓 rootRef 上的 handleKeydown 處理移動邏輯
    rootRef.value?.focus()
  }
}

const scrollToHighlightedItem = async () => {
  await nextTick()

  if (dropdownRef.value && highlightedIndex.value !== -1) {
    const item = dropdownRef.value.querySelector(
      `[data-index="${highlightedIndex.value}"]`,
    ) as HTMLElement | null

    if (item) {
      item.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }
}
/** 鍵盤操作下拉選單相關 End */

onMounted(() => {
  updatePosition()
})

watch(
  selectedValues,
  async () => {
    if (isDropdownOpen.value) {
      await nextTick() /** 確保 DOM 更新完成 */
      updatePosition()
    }
  },
  { deep: true },
)

watch(isDropdownOpen, async (isOpen) => {
  if (isOpen) {
    updatePosition()
    highlightedIndex.value = -1

    await nextTick() // 確保 DOM 渲染完畢
    if (props.searchable) {
      // 如果有搜尋框，將焦點移到搜尋框
      searchInputElementRef.value?.focus()
    } else {
      // 如果沒有搜尋框，將焦點移到 rootRef (使用者可以直接用上下鍵導航)
      rootRef.value?.focus()
    }
  } else {
    // 關閉時清除狀態
    searchText.value = ''
    highlightedIndex.value = -1
  }
})

watch(searchText, async () => {
  // 確保 DOM 已經根據最新的 searchText 渲染完畢
  await nextTick()
  highlightedIndex.value = -1
})

watch(highlightedIndex, async (newIndex) => {
  if (newIndex !== -1 && isDropdownOpen.value) {
    scrollToHighlightedItem()
  }
})
</script>

<template>
  <div ref="rootRef" class="relative w-full max-w-sm" tabindex="0" @keydown="handleKeydown">
    <div
      class="min-h-10 cursor-pointer rounded-lg border border-gray-300 bg-white p-2 shadow-sm transition duration-150"
      @click="isDropdownOpen = !isDropdownOpen"
    >
      <div v-if="selectedValues.length > 0" class="flex flex-wrap gap-1 pr-4">
        <div
          v-for="value in selectedValues"
          :key="value.toString()"
          class="flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium whitespace-nowrap text-blue-800"
        >
          {{ getLabelByValue(value) }}
          <button
            type="button"
            class="ml-1 text-blue-600 transition-colors hover:text-blue-900"
            @click.stop="removeSelection(value)"
          >
            <svg
              class="h-3 w-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>
        </div>
      </div>
      <div v-else class="text-gray-400 select-none">
        {{ placeholder }}
      </div>

      <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
        <svg
          class="h-4 w-4 text-gray-400 transition-transform"
          :class="{ 'rotate-180': isDropdownOpen }"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 9l-7 7-7-7"
          ></path>
        </svg>
      </div>
    </div>

    <Teleport to="body">
      <div
        v-if="isDropdownOpen"
        ref="dropdownRef"
        :style="dropdownStyle"
        class="scrollbar-none absolute max-h-50 overflow-y-auto rounded-lg border border-gray-300 bg-white shadow-xl"
      >
        <div v-if="searchable" class="sticky top-0 z-10 border-b border-gray-200 bg-white p-2">
          <input
            ref="searchInputElementRef"
            v-model="searchText"
            type="text"
            placeholder="輸入關鍵字搜尋..."
            class="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:ring-0"
            @click.stop
            @keydown.enter.prevent="selectFirstFilteredOption"
            @keydown="handleSearchInputKeydown"
          />
        </div>

        <template v-if="options.length === 0">
          <div class="px-4 py-2 text-gray-500">沒有可用的選項</div>
        </template>
        <template v-else>
          <ul v-if="hasFilteredOptions" class="p-2">
            <li
              v-for="(option, index) in filteredOptions"
              :key="option.value.toString()"
              class="cursor-pointer px-4 py-2 transition-colors"
              :data-index="index"
              :class="{
                // --- 1. 鍵盤高亮狀態 ---
                // 無論是否被選中，鍵盤高亮時都使用一個獨特的背景色
                'bg-blue-200': index === highlightedIndex && !checkIsSelected(option.value),
                'text-gray-900': index === highlightedIndex && !checkIsSelected(option.value),

                // 如果鍵盤高亮且已選中，給予更深的藍色，文字設為白色
                'bg-blue-600': index === highlightedIndex && checkIsSelected(option.value),
                'text-white': index === highlightedIndex,

                // --- 2. 已選中狀態 (基礎樣式) ---
                // 如果已選中，且不是當前高亮項目 (讓高亮優先顯示)
                'bg-blue-500 text-white':
                  checkIsSelected(option.value) && index !== highlightedIndex,

                // --- 3. 滑鼠懸停狀態 (最低優先級) ---
                // 只有在未選中且不是高亮時才顯示懸停效果
                'hover:bg-gray-100': !checkIsSelected(option.value) && index !== highlightedIndex,
                // 如果已選中，懸停時給予深色 (但避開高亮)
                'hover:bg-blue-700': checkIsSelected(option.value) && index !== highlightedIndex,
              }"
              @click.stop="toggleSelection(option.value)"
              @mouseenter="highlightedIndex = index"
              @mouseleave="highlightedIndex = -1"
            >
              {{ option.label }}
            </li>
          </ul>

          <div v-if="searchable && !hasFilteredOptions" class="px-4 py-2 text-gray-500">
            找不到符合 " {{ searchText }} " 的結果
          </div>
        </template>
      </div>
    </Teleport>
  </div>
</template>
