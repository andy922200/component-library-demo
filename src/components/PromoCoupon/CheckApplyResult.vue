<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    code?: string
    text?: string
    isRepeatable?: boolean
    totalPrice?: number
    discountValue?: number
  }>(),
  {
    code: '',
    text: '',
    isRepeatable: false,
    totalPrice: 0,
    discountValue: 0,
  },
)

const usageCount = defineModel<number>('usage-count', {
  default: 0,
})
const finalPrice = computed(() => (props.totalPrice ?? 0) - (props.discountValue ?? 0))
</script>

<template>
  <div class="rounded-lg border-2 border-green-500 bg-green-50 p-6">
    <div class="mb-4 flex items-center gap-2">
      <svg class="h-6 w-6 text-green-600" fill="currentColor" viewBox="0 0 16 16">
        <path
          d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"
        />
      </svg>
      <h3 class="text-xl font-bold text-green-800">優惠券已套用 Coupon Applied</h3>
    </div>

    <div class="space-y-4">
      <!-- Coupon Code -->
      <div class="flex flex-col gap-1 md:flex-row md:items-center md:gap-4">
        <span class="font-semibold text-gray-700">優惠代碼 Code:</span>
        <span class="font-mono text-lg font-bold text-orange-600">{{ props.code }}</span>
      </div>

      <!-- Coupon Type -->
      <div class="flex flex-col gap-1 md:flex-row md:items-center md:gap-4">
        <span class="font-semibold text-gray-700">優惠類型 Type:</span>
        <span class="text-gray-900">{{ props.text ?? '' }}</span>
      </div>

      <!-- Usage Count -->
      <div
        v-if="props.isRepeatable"
        class="flex flex-col gap-1 md:flex-row md:items-center md:gap-4"
      >
        <span class="font-semibold text-gray-700">使用次數 Times:</span>
        <span class="text-gray-900">{{ usageCount }} 次</span>
      </div>

      <!-- Divider -->
      <div class="border-t-2 border-green-200"></div>

      <!-- Price Details -->
      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <span class="text-gray-700">原價 Original Price:</span>
          <span class="text-lg font-semibold text-gray-900"
            >NT$ {{ props.totalPrice.toLocaleString() }}</span
          >
        </div>

        <div class="flex items-center justify-between">
          <span class="text-green-700">折扣金額 Discount:</span>
          <span class="text-lg font-semibold text-green-600"
            >- NT$ {{ (props.discountValue ?? 0).toLocaleString() }}</span
          >
        </div>

        <div class="border-t-2 border-green-300 pt-2">
          <div class="flex items-center justify-between">
            <span class="text-lg font-bold text-gray-900">實付金額 Final Price:</span>
            <span class="text-2xl font-bold text-orange-600"
              >NT$ {{ finalPrice.toLocaleString() }}</span
            >
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
