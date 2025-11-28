<script setup lang="ts">
import { onClickOutside, useDebounceFn, useEventListener } from '@vueuse/core'
import { computed, nextTick, onMounted, ref, watch } from 'vue'

import Spinner from '@/components/Spinner/index.vue'

import type { DropdownOptionStyleConfig, MultiSelectModeType, SelectOption } from './type'
import { KeyboardKey, MultiSelectMode } from './type'

defineOptions({
  name: 'BaseMultiSelect',
})

const props = withDefaults(
  defineProps<{
    options: SelectOption[]
    placeholder?: string
    searchable?: boolean
    deletable?: boolean
    searchInputPlaceholder?: string
    maxVisible?: number
    dropdownOptionStyle?: DropdownOptionStyleConfig
    mode?: MultiSelectModeType
    showSelectAll?: boolean
    selectAllText?: string
    showCheckbox?: boolean
    remote?: boolean
    searchMs?: number
    minSearchLength?: number
  }>(),
  {
    placeholder: '請選擇一個或多個項目',
    searchable: false,
    deletable: false,
    searchInputPlaceholder: '輸入關鍵字搜尋...',
    maxVisible: 3,
    showSelectAll: false,
    showCheckbox: false,
    selectAllText: '全選',
    remote: false,
    searchMs: 300,
    minSearchLength: 2,
    dropdownOptionStyle: () => ({
      highlightedNotSelected: 'bg-blue-200 text-gray-900',
      highlightedSelected: 'bg-blue-600 text-white',
      selected: 'bg-blue-500 text-white',
      hoverNotSelected: 'hover:bg-gray-100',
      hoverSelected: 'hover:bg-blue-700',
    }),
    mode: MultiSelectMode.MULTI,
  },
)

const emits = defineEmits<{
  (e: 'search', query: string): void
}>()

const isDropdownOpen = defineModel<boolean>('open', {
  default: false,
})
const selectedValues = defineModel<(string | number)[]>({
  default: () => [],
})
const isRemoteSearching = defineModel<boolean>('remoteSearching', {
  default: false,
})

const searchText = ref('')
const highlightedIndex = ref(-1)
const isKeyboardNavigating = ref(false)
const allSeenOptions = ref<Map<string | number, SelectOption>>(new Map())

const getDropdownOptionClasses = (index: number, value: string | number) => {
  const isHighlighted = index === highlightedIndex.value
  const isSelected = checkIsSelected(value)
  const styles = props.dropdownOptionStyle

  return [
    // 高亮狀態 (最高優先級)
    isHighlighted && !isSelected && styles.highlightedNotSelected,
    isHighlighted && isSelected && styles.highlightedSelected,

    // 已選中狀態 (中優先級)
    isSelected && !isHighlighted && styles.selected,

    // hover 狀態 (最低優先級)
    !isSelected && !isHighlighted && styles.hoverNotSelected,
    isSelected && !isHighlighted && styles.hoverSelected,
  ].filter(Boolean)
}

/** 選項相關 Start */
const debouncedSearch = useDebounceFn(async (query: string) => {
  if (!props.remote) return

  if (query.length >= props.minSearchLength) {
    isRemoteSearching.value = true
    emits('search', query)
  } else {
    isRemoteSearching.value = false
  }
}, props.searchMs)
const checkIsSelected = (value: string | number): boolean => selectedValues.value.includes(value)
const toggleSelection = async (value: string | number) => {
  if (props.mode === MultiSelectMode.SINGLE) {
    selectedValues.value = [value]
    closeDropdown()
  } else {
    selectedValues.value = checkIsSelected(value)
      ? selectedValues.value.filter((v) => v !== value)
      : [...selectedValues.value, value]
  }

  await nextTick()
  if (isDropdownOpen.value) {
    rootRef.value?.focus()
  }
}
const removeSelection = (value: string | number) => {
  selectedValues.value =
    props.mode === MultiSelectMode.SINGLE ? [] : selectedValues.value.filter((v) => v !== value)
}
const getLabelByValue = (value: string | number): string => {
  const option = allSeenOptions.value.get(value)
  return option ? option.label : value.toString()
}
const filteredOptions = computed(() => {
  if (props.remote) {
    return searchText.value.trim() && searchText.value.length >= props.minSearchLength
      ? props.options // 正在搜尋：顯示當前搜尋結果
      : Array.from(allSeenOptions.value.values()) // 沒有搜尋：顯示所有見過的選項
  }
  if (!searchText.value) return props.options
  const query = searchText.value.toLowerCase().trim()
  return props.options.filter((option) => option.label.toLowerCase().includes(query))
})
const hasFilteredOptions = computed(() => filteredOptions.value.length > 0)

const visibleOptions = computed(() => {
  if (props.mode === MultiSelectMode.SINGLE) return selectedValues.value.slice(0, 1)
  if (props.maxVisible <= 0) return selectedValues.value.length
  return selectedValues.value.slice(0, props.maxVisible)
})
const hiddenOptionsCount = computed(() => {
  if (props.mode === MultiSelectMode.SINGLE) return 0
  return Math.max(0, selectedValues.value.length - props.maxVisible)
})

const isAllSelected = computed(() => {
  if (filteredOptions.value.length === 0) return false
  return filteredOptions.value.every((option) => checkIsSelected(option.value))
})
const isIndeterminate = computed(() => {
  const selectedCount = filteredOptions.value.filter((option) =>
    checkIsSelected(option.value),
  ).length
  return selectedCount > 0 && selectedCount < filteredOptions.value.length
})
const toggleSelectAll = () => {
  if (isAllSelected.value) {
    // 取消全選：移除所有 filteredOptions 中的選項
    const filteredValues = filteredOptions.value.map((opt) => opt.value)
    selectedValues.value = selectedValues.value.filter((v) => !filteredValues.includes(v))
  } else {
    // 全選：加入所有 filteredOptions 中未選中的選項
    const newValues = filteredOptions.value
      .filter((opt) => !checkIsSelected(opt.value))
      .map((opt) => opt.value)
    selectedValues.value = [...selectedValues.value, ...newValues]
  }
}
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
  zIndex: isDropdownOpen.value
    ? 1000 + (Date.now() % 1000) + Math.floor(Math.random() * 100)
    : 1000,
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

const closeDropdown = () => {
  isDropdownOpen.value = false
  rootRef.value?.blur()
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
  const isFocusingRoot = rootRef.value === document.activeElement

  // 如果選單關閉，但使用者按了向下箭頭或 Enter，則開啟選單
  if (!isDropdownOpen.value) {
    if (event.key === KeyboardKey.ARROW_DOWN || event.key === KeyboardKey.ENTER) {
      isDropdownOpen.value = true
      event.preventDefault() // 阻止頁面捲動
    }
    return
  }

  // 如果焦點在搜尋框，且按了方向鍵，則將焦點移到 rootRef
  if (
    isFocusingSearch &&
    (event.key === KeyboardKey.ARROW_DOWN || event.key === KeyboardKey.ARROW_UP)
  ) {
    rootRef.value?.focus()
  }

  // 阻止頁面捲動
  event.preventDefault()

  const optionsCount = filteredOptions.value.length

  if (optionsCount === 0) return

  // Ctrl + A / Cmd + A 全選邏輯
  if (isFocusingRoot) {
    if ((event.ctrlKey || event.metaKey) && event.key === 'a') {
      event.preventDefault()
      event.stopPropagation()
      if (props.showSelectAll && props.mode === MultiSelectMode.MULTI) {
        toggleSelectAll()
      }
      return
    }
  }

  switch (event.key) {
    case KeyboardKey.ARROW_DOWN: {
      isKeyboardNavigating.value = true
      highlightedIndex.value =
        highlightedIndex.value === -1 ? 0 : (highlightedIndex.value + 1) % optionsCount
      break
    }
    case KeyboardKey.ARROW_UP: {
      isKeyboardNavigating.value = true
      highlightedIndex.value =
        highlightedIndex.value === -1
          ? optionsCount - 1
          : (highlightedIndex.value - 1 + optionsCount) % optionsCount
      break
    }
    case KeyboardKey.ENTER: {
      if (highlightedIndex.value !== -1) {
        const selectedOption = filteredOptions.value[highlightedIndex.value]
        toggleSelection(selectedOption.value)
      }
      break
    }
    case KeyboardKey.ESCAPE: {
      isDropdownOpen.value = false
      break
    }
    case KeyboardKey.TAB: {
      isDropdownOpen.value = false
      break
    }
  }
}

const handleSearchInputKeydown = (event: KeyboardEvent) => {
  if (
    [KeyboardKey.ARROW_DOWN, KeyboardKey.ARROW_UP, KeyboardKey.ENTER].includes(
      event.key as KeyboardKey,
    )
  ) {
    event.preventDefault() // 阻止瀏覽器預設行為 (如輸入框光標移動)

    if (event.key === KeyboardKey.ENTER) {
      const selectedOption = filteredOptions.value[highlightedIndex.value]
      if (highlightedIndex.value !== -1 && selectedOption) {
        toggleSelection(selectedOption.value)
        rootRef.value?.focus() // 選完後將焦點移回 rootRef
        return
      }
    }

    // 如果是方向鍵，強制將焦點移回 rootRef，讓 rootRef 上的 handleKeydown 處理移動邏輯
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
/** 滑鼠操作下拉選單相關 Start */
const handleDropdownMouseEnter = (index: number) => {
  if (!isKeyboardNavigating.value) {
    highlightedIndex.value = index
  }
}
const handleDropdownMouseMove = () => {
  isKeyboardNavigating.value = false
}
const handleDropdownMouseLeave = () => {
  if (!isKeyboardNavigating.value) {
    highlightedIndex.value = -1
  }
}
/** 滑鼠操作下拉選單相關 End */

onMounted(() => {
  updatePosition()
  props.options.forEach((option) => {
    allSeenOptions.value.set(option.value, option)
  })
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
    isKeyboardNavigating.value = false

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
    isKeyboardNavigating.value = false
  }
})

watch(searchText, async (newValue) => {
  // 確保 DOM 已經根據最新的 searchText 渲染完畢
  await nextTick()
  highlightedIndex.value = -1

  if (props.remote) {
    debouncedSearch(newValue.trim())
  }
})

watch(
  () => props.options,
  async (newOptions) => {
    highlightedIndex.value = -1

    if (props.remote) {
      newOptions.forEach((option) => {
        allSeenOptions.value.set(option.value, option)
      })

      isRemoteSearching.value = false

      await nextTick()
      searchInputElementRef.value?.focus()
    } else {
      allSeenOptions.value.clear()
      newOptions.forEach((option) => {
        allSeenOptions.value.set(option.value, option)
      })
    }
  },
  { deep: true },
)

watch(highlightedIndex, async (newIndex) => {
  if (newIndex !== -1 && isDropdownOpen.value) {
    scrollToHighlightedItem()
  }
})
</script>

<template>
  <div
    ref="rootRef"
    data-testid="multiselect-root"
    class="relative w-full max-w-sm"
    tabindex="0"
    @keydown="handleKeydown"
  >
    <div
      class="min-h-10 cursor-pointer rounded-lg border border-gray-300 bg-white p-2 shadow-sm transition duration-150"
      data-testid="multiselect-trigger"
      @click="isDropdownOpen = !isDropdownOpen"
    >
      <div v-if="selectedValues.length > 0" class="flex flex-wrap gap-1 pr-4">
        <div
          v-for="value in visibleOptions"
          :key="value.toString()"
          class="flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs whitespace-nowrap text-blue-800"
          :data-testid="`tag-${value}`"
        >
          <slot name="selected-tag" :data="{ value }">{{ getLabelByValue(value) }}</slot>
          <slot name="remove-tag" :data="{ value, onRemove: removeSelection }">
            <button
              v-if="props.deletable"
              type="button"
              class="ml-1 text-blue-600 transition-colors hover:text-blue-900"
              :data-testid="`tag-delete-${value}`"
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
          </slot>
        </div>

        <div
          v-if="props.mode === MultiSelectMode.MULTI && hiddenOptionsCount > 0"
          class="flex items-center rounded-full bg-gray-200 px-2 py-1 text-xs whitespace-nowrap text-gray-600"
          data-testid="hidden-count"
        >
          <slot name="hidden-tags-count" :data="{ count: hiddenOptionsCount }">
            +{{ hiddenOptionsCount }}
          </slot>
        </div>
      </div>
      <div v-else class="text-gray-400 select-none">
        {{ placeholder }}
      </div>

      <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
        <slot name="dropdown-icon" :data="{ isDropdownOpen }">
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
        </slot>
      </div>
    </div>

    <Teleport to="body">
      <div
        v-if="isDropdownOpen"
        ref="dropdownRef"
        :style="dropdownStyle"
        class="absolute overflow-y-auto rounded-lg border border-gray-300 bg-white shadow-xl"
      >
        <div v-if="props.searchable" class="border-b border-gray-200">
          <div class="bg-white p-2">
            <input
              ref="searchInputElementRef"
              v-model="searchText"
              type="text"
              :placeholder="props.searchInputPlaceholder"
              class="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm placeholder:text-gray-400! focus:ring-0"
              :class="[isRemoteSearching ? 'cursor-not-allowed opacity-50' : '']"
              data-testid="search-input"
              :disabled="isRemoteSearching"
              @click.stop
              @keydown.enter.prevent="selectFirstFilteredOption"
              @keydown="handleSearchInputKeydown"
            />
          </div>
        </div>

        <div
          v-if="
            props.showSelectAll &&
            props.mode === MultiSelectMode.MULTI &&
            !isRemoteSearching &&
            hasFilteredOptions
          "
          class="border-b border-gray-200"
        >
          <div
            class="flex cursor-pointer items-center bg-white px-4 py-2 transition-colors hover:bg-gray-100"
            data-testid="select-all"
            @click.stop="toggleSelectAll"
          >
            <slot name="select-all-checkbox" :data="{ isAllSelected, isIndeterminate }">
              <input
                type="checkbox"
                :checked="isAllSelected"
                :indeterminate="isIndeterminate"
                class="mr-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                @click.stop
                @change.stop
              />
            </slot>
            <span class="font-medium text-gray-700 select-none">
              {{ props.selectAllText }}
            </span>
          </div>
        </div>

        <div class="scrollbar-none max-h-50 overflow-y-auto">
          <template v-if="isRemoteSearching">
            <slot name="is-remote-searching-loading">
              <div class="flex items-center justify-center">
                <Spinner color="#e623dd" />
              </div>
            </slot>
          </template>

          <template v-else-if="options.length === 0 && !isRemoteSearching">
            <slot name="no-options">
              <div class="px-4 py-2 text-gray-500">沒有可用的選項</div>
            </slot>
          </template>

          <template v-else>
            <ul v-if="!isRemoteSearching && hasFilteredOptions" class="p-2">
              <li
                v-for="(option, index) in filteredOptions"
                :key="option.value.toString()"
                class="cursor-pointer px-4 py-2 transition-colors"
                :data-index="index"
                :data-testid="`option-${option.value}`"
                :class="getDropdownOptionClasses(index, option.value)"
                @click.stop="toggleSelection(option.value)"
                @mouseenter="handleDropdownMouseEnter(index)"
                @mouseleave="handleDropdownMouseLeave"
                @mousemove="handleDropdownMouseMove"
              >
                <template v-if="props.showCheckbox">
                  <div class="flex items-center">
                    <slot
                      name="option-checkbox"
                      :data="{
                        option,
                        index,
                        isSelected: checkIsSelected(option.value),
                        isHighlighted: index === highlightedIndex,
                      }"
                    >
                      <input
                        type="checkbox"
                        :checked="checkIsSelected(option.value)"
                        tabIndex="-1"
                        class="mr-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        @click.stop
                        @change.stop
                      />
                    </slot>
                    <slot name="option-label" :data="{ option, index }">
                      <span>{{ option.label }}</span>
                    </slot>
                  </div>
                </template>
                <template v-else>
                  <slot name="option-label" :data="{ option, index }">
                    {{ option.label }}
                  </slot>
                </template>
              </li>
            </ul>
          </template>

          <slot name="no-search-result">
            <div
              v-if="searchable && !isRemoteSearching && !hasFilteredOptions"
              class="px-4 py-2 text-gray-500"
            >
              <template v-if="props.remote">
                {{
                  searchText.length < props.minSearchLength
                    ? `請輸入至少 ${props.minSearchLength} 個字元進行搜尋`
                    : `找不到符合 "${searchText}" 的結果`
                }}
              </template>
              <template v-else> 找不到符合 " {{ searchText }} " 的結果 </template>
            </div>
          </slot>
        </div>
      </div>
    </Teleport>
  </div>
</template>
