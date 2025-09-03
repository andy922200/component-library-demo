<script setup lang="ts">
import { computed, ref } from 'vue'

import { usePaymentStrategies } from '@/composables/usePaymentStrategies'
import { paymentModeMap } from '@/constants/paymentStrategies'
import dayjs from '@/plugins/dayjs'

defineOptions({
  name: 'DemoPaymentStrategies',
})

const todayObj = dayjs()
const paymentConfigAtStore = ref({
  priceAfterCoupon: 100,
  point: 0,
  orderDate: todayObj.format('YYYY-MM-DD'),
  bookingStartTime: todayObj.add(4, 'day').format('HH:mm'),
  isBookingRightNow: false,
  cycleTimes: 1,
  payment: paymentModeMap['1'],
  transfer: { accept: '1' as const, hour: '2', startTime: '00:00', endTime: '24:00' },
  linepay: '1' as const,
  jkopay: '1' as const,
  cvs: '1' as const,
  applepay: '1' as const,
  point_enabled: '1' as const,
})

const paymentConfig = computed(() => ({
  price: paymentConfigAtStore.value.priceAfterCoupon,
  point: paymentConfigAtStore.value.point,
  orderDate: paymentConfigAtStore.value.orderDate,
  bookStartTime: paymentConfigAtStore.value.bookingStartTime,
  isBookingRightNow: paymentConfigAtStore.value.isBookingRightNow,
  cycleTimes: paymentConfigAtStore.value.cycleTimes,
  payment: paymentConfigAtStore.value.payment,
  transfer: paymentConfigAtStore.value.transfer,
  linepay: paymentConfigAtStore.value.linepay,
  jkopay: paymentConfigAtStore.value.jkopay,
  cvs: paymentConfigAtStore.value.cvs,
  applepay: paymentConfigAtStore.value.applepay,
  point_enabled: paymentConfigAtStore.value.point_enabled,
  hasMemberData: true,
}))

const { paymentOptions, selectedPaymentType } = usePaymentStrategies(paymentConfig)

const applyPriceCoupon = (price: number) => {
  paymentConfigAtStore.value.priceAfterCoupon = price
}
</script>

<template>
  <div class="w-full">
    <h1 class="mb-2 text-center text-lg">Payment Strategies 付款方式選擇</h1>

    <div class="flex flex-wrap justify-center space-y-2">
      <div class="flex w-full justify-center">
        <select v-model="selectedPaymentType" class="mx-auto">
          <option
            v-for="option in paymentOptions"
            :key="option.value"
            :value="option.value"
            :disabled="option.disabled"
          >
            {{ option.text }} <span v-if="option.disabled">(不可使用)</span>
          </option>
        </select>
      </div>
      <p class="mx-2">當前選擇: {{ selectedPaymentType }}</p>
      <p class="mx-2">目前價格: {{ paymentConfig.price }}</p>

      <div class="flex w-full justify-center space-x-2">
        <button
          class="rounded border border-gray-300 p-2 hover:bg-slate-600 hover:text-white"
          @click="applyPriceCoupon(0)"
        >
          使用優惠券讓價格變為 0 元
        </button>
        <button
          class="rounded border border-gray-300 p-2 hover:bg-slate-600 hover:text-white"
          @click="applyPriceCoupon(20)"
        >
          使用優惠券讓價格變為 20 元
        </button>
        <button
          class="rounded border border-gray-300 p-2 hover:bg-slate-600 hover:text-white"
          @click="applyPriceCoupon(500)"
        >
          使用優惠券讓價格變為 500 元
        </button>
      </div>
    </div>
  </div>
</template>
