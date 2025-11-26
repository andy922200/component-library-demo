<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    text?: string
    isRepeatable?: boolean
    isBindPhone?: boolean
    remain?: number
    isDecrementBtnDisabled?: boolean
    isIncrementBtnDisabled?: boolean
    isApplyBtnDisabled?: boolean
    onClickDecrement?: () => void
    onClickIncrement?: () => void
    onClickApply?: () => void
  }>(),
  {
    text: '',
    isRepeatable: false,
    isBindPhone: false,
    remain: 0,
    isDecrementBtnDisabled: false,
    isIncrementBtnDisabled: false,
    isApplyBtnDisabled: false,
    onClickDecrement: () => {},
    onClickIncrement: () => {},
    onClickApply: () => {},
  },
)

const usageCount = defineModel<number>('usage-count', {
  default: 0,
})
</script>

<template>
  <div class="coupon-details-area">
    <!-- Coupon Content -->
    <div class="mb-6 flex flex-col gap-2 md:flex-row md:items-start">
      <span class="shrink-0 font-semibold text-gray-700"> 優惠內容 Content </span>
      <div class="md:ml-4">
        <p class="text-lg font-medium text-gray-900">{{ props.text }}</p>
      </div>
    </div>

    <!-- Usage Counter -->
    <div class="flex flex-wrap items-center gap-4">
      <span class="shrink-0 font-semibold text-gray-700">使用次數 Times</span>

      <div class="flex items-center gap-2">
        <button
          type="button"
          :disabled="props.isDecrementBtnDisabled"
          class="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500 text-white transition-all hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-gray-300"
          @click="props.onClickDecrement"
        >
          <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 16 16">
            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
            <path d="M4 8a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7A.5.5 0 0 1 4 8z" />
          </svg>
        </button>

        <input
          v-model.number="usageCount"
          type="text"
          readonly
          class="w-16 rounded-lg border-0 bg-white py-2 text-center text-lg font-semibold text-gray-900"
        />

        <button
          type="button"
          :disabled="props.isIncrementBtnDisabled"
          class="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500 text-white transition-all hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-gray-300"
          @click="props.onClickIncrement"
        >
          <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 16 16">
            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
            <path
              d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"
            />
          </svg>
        </button>
      </div>

      <div v-show="props.isRepeatable && !props.isBindPhone" class="text-sm text-gray-600">
        剩 {{ (props.remain ?? 0) - usageCount }} 次 Remain
      </div>

      <button
        type="button"
        :disabled="props.isApplyBtnDisabled"
        class="ml-auto rounded-lg bg-orange-500 px-8 py-3 font-semibold text-white shadow-md transition-all hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500"
        @click="props.onClickApply"
      >
        Apply
      </button>
    </div>
  </div>
</template>
