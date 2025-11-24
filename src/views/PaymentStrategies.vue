<script setup lang="ts">
import { computed, ref } from 'vue'

import { usePaymentStrategies } from '@/composables/usePaymentStrategies'
import { PaymentMode, paymentModeMap, type TPaymentMode } from '@/constants/paymentStrategies'
import dayjs from '@/plugins/dayjs'

defineOptions({
  name: 'DemoPaymentStrategies',
})

const todayObj = dayjs()
const paymentConfigAtStore = ref<{
  price: number
  point: number
  orderDate: string
  bookingStartTime: string
  isBookingRightNow: boolean
  cycleTimes: number
  payment: TPaymentMode
  transfer: {
    accept: '0' | '1'
    hour: string
    startTime: string
    endTime: string
  }
  linepay: '0' | '1'
  jkopay: '0' | '1'
  cvs: '0' | '1'
  applepay: '0' | '1'
  point_enabled: '0' | '1'
  has_point_member_data: '0' | '1'
  enable_member_booking: '0' | '1'
}>({
  price: 100,
  point: 10,
  orderDate: todayObj.format('YYYY-MM-DD'),
  bookingStartTime: todayObj.add(4, 'day').format('HH:mm'),
  isBookingRightNow: false,
  cycleTimes: 1,
  payment: paymentModeMap['-1'],
  transfer: { accept: '1', hour: '2', startTime: '00:00', endTime: '24:00' },
  linepay: '0',
  jkopay: '0',
  cvs: '0',
  applepay: '0',
  point_enabled: '0',
  has_point_member_data: '1',
  enable_member_booking: '0',
})

const paymentConfig = computed(() => ({
  price: paymentConfigAtStore.value.price,
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
  pointEnabled: paymentConfigAtStore.value.point_enabled,
  hasPointMemberData: paymentConfigAtStore.value.has_point_member_data,
  enableMemberBookingByEmail: paymentConfigAtStore.value.enable_member_booking,
}))

const usePoint = computed(() => paymentConfigAtStore.value.point_enabled === '1')
const usePrice = computed(() => !usePoint.value)
const hasPayment = computed(() => paymentConfigAtStore.value.payment !== PaymentMode.NO_PAYMENT)
const enableMemberBookingByEmail = computed(
  () => paymentConfigAtStore.value.enable_member_booking === '1',
)

const { paymentOptions, selectedPaymentType, currentScenario } = usePaymentStrategies(paymentConfig)

const applyCoupon = ({ value, type }: { value: number; type: 'price' | 'point' }) => {
  if (type === 'point') {
    paymentConfigAtStore.value.point = value
    return
  }

  if (type === 'price') {
    paymentConfigAtStore.value.price = value
    return
  }
}

const togglePaymentOption = (
  option: 'linepay' | 'jkopay' | 'cvs' | 'applepay' | 'point_enabled' | 'enable_member_booking',
) => {
  paymentConfigAtStore.value[option] = paymentConfigAtStore.value[option] === '0' ? '1' : '0'
}

const setPaymentMode = (modeKey: '-1' | '0' | '1' | '2' | '3') => {
  paymentConfigAtStore.value.payment = paymentModeMap[modeKey]
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
            {{ option.text }} <span v-if="option.disabled"></span>
          </option>
        </select>
      </div>
      <p class="mx-2">使用點數: {{ usePoint }}</p>
      <p class="mx-2">使用價格: {{ usePrice }}</p>
      <p class="mx-2">有可用金流: {{ hasPayment }}</p>
      <p class="mx-2">是否開啟會員 Email 預約: {{ enableMemberBookingByEmail }}</p>
      <p class="mx-2">當前情境：{{ currentScenario }}</p>
      <p class="mx-2">當前選擇: {{ selectedPaymentType }}</p>
      <p class="mx-2">目前價格: {{ paymentConfig.price }} 元</p>
      <p class="mx-2">目前點數: {{ paymentConfig.point }} 點</p>

      <div class="flex w-full justify-center space-x-2">
        <button
          class="rounded border border-gray-300 p-2 hover:bg-slate-600 hover:text-white"
          @click="applyCoupon({ value: 0, type: 'price' })"
        >
          使用優惠券讓價格變為 0 元
        </button>
        <button
          class="rounded border border-gray-300 p-2 hover:bg-slate-600 hover:text-white"
          @click="applyCoupon({ value: 20, type: 'price' })"
        >
          使用優惠券讓價格變為 20 元
        </button>
        <button
          class="rounded border border-gray-300 p-2 hover:bg-slate-600 hover:text-white"
          @click="applyCoupon({ value: 500, type: 'price' })"
        >
          使用優惠券讓價格變為 500 元
        </button>

        <button
          class="rounded border border-gray-300 p-2 hover:bg-slate-600 hover:text-white"
          @click="applyCoupon({ value: 0, type: 'point' })"
        >
          使用優惠券讓點數變為 0 點
        </button>
        <button
          class="rounded border border-gray-300 p-2 hover:bg-slate-600 hover:text-white"
          @click="applyCoupon({ value: 3, type: 'point' })"
        >
          使用優惠券讓點數變為 3 點
        </button>
        <button
          class="rounded border border-gray-300 p-2 hover:bg-slate-600 hover:text-white"
          @click="applyCoupon({ value: 8, type: 'point' })"
        >
          使用優惠券讓點數變為 8 點
        </button>
      </div>

      <!-- Payment Mode Controls -->
      <div class="mt-4 w-full">
        <h2 class="text-md mb-2 text-center font-semibold">金流模式控制</h2>
        <div class="mb-4 flex flex-wrap justify-center gap-2">
          <button
            :class="[
              'rounded border p-2 transition-colors',
              paymentConfigAtStore.payment === paymentModeMap['-1']
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'border-gray-300 hover:bg-slate-600 hover:text-white',
            ]"
            @click="setPaymentMode('-1')"
          >
            無金流 (NO_PAYMENT)
          </button>

          <button
            :class="[
              'rounded border p-2 transition-colors',
              paymentConfigAtStore.payment === paymentModeMap['0']
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'border-gray-300 hover:bg-slate-600 hover:text-white',
            ]"
            @click="setPaymentMode('0')"
          >
            TAP PAY ZHI
          </button>

          <button
            :class="[
              'rounded border p-2 transition-colors',
              paymentConfigAtStore.payment === paymentModeMap['1']
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'border-gray-300 hover:bg-slate-600 hover:text-white',
            ]"
            @click="setPaymentMode('1')"
          >
            TAP PAY
          </button>

          <button
            :class="[
              'rounded border p-2 transition-colors',
              paymentConfigAtStore.payment === paymentModeMap['2']
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'border-gray-300 hover:bg-slate-600 hover:text-white',
            ]"
            @click="setPaymentMode('2')"
          >
            ECPAY
          </button>

          <button
            :class="[
              'rounded border p-2 transition-colors',
              paymentConfigAtStore.payment === paymentModeMap['3']
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'border-gray-300 hover:bg-slate-600 hover:text-white',
            ]"
            @click="setPaymentMode('3')"
          >
            NEWEBPAY
          </button>
        </div>
      </div>

      <!-- Payment Options Toggle Controls -->
      <div class="mt-4 w-full">
        <h2 class="text-md mb-2 text-center font-semibold">付款選項開關控制</h2>
        <div class="flex flex-wrap justify-center gap-2">
          <button
            :class="[
              'rounded border p-2 transition-colors',
              paymentConfigAtStore.linepay === '1'
                ? 'bg-green-500 text-white hover:bg-green-600'
                : 'border-gray-300 hover:bg-slate-600 hover:text-white',
            ]"
            @click="togglePaymentOption('linepay')"
          >
            LINE Pay: {{ paymentConfigAtStore.linepay === '1' ? '開啟' : '關閉' }}
          </button>

          <button
            :class="[
              'rounded border p-2 transition-colors',
              paymentConfigAtStore.jkopay === '1'
                ? 'bg-green-500 text-white hover:bg-green-600'
                : 'border-gray-300 hover:bg-slate-600 hover:text-white',
            ]"
            @click="togglePaymentOption('jkopay')"
          >
            街口支付: {{ paymentConfigAtStore.jkopay === '1' ? '開啟' : '關閉' }}
          </button>

          <button
            :class="[
              'rounded border p-2 transition-colors',
              paymentConfigAtStore.cvs === '1'
                ? 'bg-green-500 text-white hover:bg-green-600'
                : 'border-gray-300 hover:bg-slate-600 hover:text-white',
            ]"
            @click="togglePaymentOption('cvs')"
          >
            超商付款: {{ paymentConfigAtStore.cvs === '1' ? '開啟' : '關閉' }}
          </button>

          <button
            :class="[
              'rounded border p-2 transition-colors',
              paymentConfigAtStore.applepay === '1'
                ? 'bg-green-500 text-white hover:bg-green-600'
                : 'border-gray-300 hover:bg-slate-600 hover:text-white',
            ]"
            @click="togglePaymentOption('applepay')"
          >
            Apple Pay: {{ paymentConfigAtStore.applepay === '1' ? '開啟' : '關閉' }}
          </button>

          <button
            :class="[
              'rounded border p-2 transition-colors',
              paymentConfigAtStore.point_enabled === '1'
                ? 'bg-green-500 text-white hover:bg-green-600'
                : 'border-gray-300 hover:bg-slate-600 hover:text-white',
            ]"
            @click="togglePaymentOption('point_enabled')"
          >
            點數付款: {{ paymentConfigAtStore.point_enabled === '1' ? '開啟' : '關閉' }}
          </button>

          <button
            :class="[
              'rounded border p-2 transition-colors',
              paymentConfigAtStore.enable_member_booking === '1'
                ? 'bg-green-500 text-white hover:bg-green-600'
                : 'border-gray-300 hover:bg-slate-600 hover:text-white',
            ]"
            @click="togglePaymentOption('enable_member_booking')"
          >
            會員代碼預約: {{ paymentConfigAtStore.enable_member_booking === '1' ? '開啟' : '關閉' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
