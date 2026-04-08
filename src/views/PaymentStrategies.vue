<script setup lang="ts">
import { computed, ref } from 'vue'

import CreditCardInfo from '@/components/CreditCardInfo/index.vue'
import { usePaymentStrategies } from '@/composables/usePaymentStrategies'
import { PaymentMode, paymentModeMap } from '@/constants/paymentStrategies'
import dayjs from '@/plugins/dayjs'

defineOptions({
  name: 'DemoPaymentStrategies',
})

const todayObj = dayjs()
const paymentMethod = ref<'price' | 'point'>('price')
const paymentConfigAtStore = ref<{
  price: number
  point: number
  orderDate: string
  bookingStartTime: string
  isBookingRightNow: boolean
  cycleTimes: number
  payment: string
  transfer: {
    accept: '0' | '1' | '2'
    hour: string
    startTime: string
    endTime: string
  }
  linepay: '0' | '1'
  jkopay: '0' | '1'
  cvs: '0' | '1'
  applepay: '0' | '1'
  ipass_twqr: '0' | '1'
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
  ipass_twqr: '0',
  point_enabled: '0',
  has_point_member_data: '1',
  enable_member_booking: '0',
})

const paymentConfig = computed(() => ({
  price: paymentConfigAtStore.value.price,
  paymentMode: paymentConfigAtStore.value.payment,
  isAcceptTransfer: paymentConfigAtStore.value.transfer.accept !== '0',
  ignoreTransferDeadline: paymentConfigAtStore.value.transfer.accept === '2',
  transferStart: paymentConfigAtStore.value.transfer.startTime,
  transferEnd: paymentConfigAtStore.value.transfer.endTime,
  transferLimitHour: +(paymentConfigAtStore.value.transfer.hour || 0),
  enableMemberBookingByEmail: paymentConfigAtStore.value.enable_member_booking === '1',
  usePoint: paymentMethod.value === 'point' && paymentConfigAtStore.value.point_enabled === '1',
  hasMember: paymentConfigAtStore.value.has_point_member_data === '1',
  hasLinePay: paymentConfigAtStore.value.linepay === '1',
  hasJkoPay: paymentConfigAtStore.value.jkopay === '1',
  hasCvsCodePay: paymentConfigAtStore.value.cvs === '1',
  hasApplePay: paymentConfigAtStore.value.applepay === '1',
  hasIPassTWQR: paymentConfigAtStore.value.ipass_twqr === '1',
  cycleTimes: paymentConfigAtStore.value.cycleTimes,
}))

const usePoint = computed(() => paymentMethod.value === 'point')
const usePrice = computed(() => paymentMethod.value === 'price')
const hasPayment = computed(() => paymentConfigAtStore.value.payment !== PaymentMode.NO_PAYMENT)
const enableMemberBookingByEmail = computed(
  () => paymentConfigAtStore.value.enable_member_booking === '1',
)

const { paymentOptions, selectedPaymentType, PAYMENT_HINT_TEXTS } =
  usePaymentStrategies(paymentConfig)

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
  option:
    | 'linepay'
    | 'jkopay'
    | 'cvs'
    | 'applepay'
    | 'ipass_twqr'
    | 'point_enabled'
    | 'enable_member_booking',
) => {
  paymentConfigAtStore.value[option] = paymentConfigAtStore.value[option] === '0' ? '1' : '0'
}

const setPaymentMode = (modeKey: '-1' | '0' | '1' | '2' | '3') => {
  paymentConfigAtStore.value.payment = paymentModeMap[modeKey]
}

// 信用卡表單資料
const creditCardForm = ref({
  cardNumber: { val: '', isError: false, errMsg: '' },
  expiryYear: { val: '', isError: false, errMsg: '' },
  expiryMonth: { val: '', isError: false, errMsg: '' },
  cvv: { val: '', isError: false, errMsg: '' },
})

const showCreditCardForm = computed(() => {
  return (
    paymentConfigAtStore.value.payment === PaymentMode.NEWEBPAY &&
    selectedPaymentType.value === PaymentMode.NEWEBPAY
  )
})
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
      <div class="my-2 flex w-full justify-center space-x-4">
        <label> <input v-model="paymentMethod" type="radio" value="price" /> 使用價格 </label>
        <label> <input v-model="paymentMethod" type="radio" value="point" /> 使用點數 </label>
      </div>
      <p class="mx-2">使用點數: {{ usePoint }}</p>
      <p class="mx-2">使用價格: {{ usePrice }}</p>
      <p class="mx-2">有可用金流: {{ hasPayment }}</p>
      <p class="mx-2">是否開啟會員 Email 預約: {{ enableMemberBookingByEmail }}</p>
      <p class="mx-2">當前選擇: {{ selectedPaymentType }}</p>
      <p class="mx-2">目前價格: {{ paymentConfig.price }} 元</p>

      <!-- Payment Hint Texts -->
      <div v-if="PAYMENT_HINT_TEXTS.length > 0" class="w-full px-4">
        <h3 class="text-sm font-semibold">付款提示：</h3>
        <ul class="list-disc pl-6 text-sm text-gray-600">
          <li v-for="(hint, index) in PAYMENT_HINT_TEXTS" :key="index">{{ hint }}</li>
        </ul>
      </div>

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
              paymentConfigAtStore.ipass_twqr === '1'
                ? 'bg-green-500 text-white hover:bg-green-600'
                : 'border-gray-300 hover:bg-slate-600 hover:text-white',
            ]"
            @click="togglePaymentOption('ipass_twqr')"
          >
            iPASS TWQR: {{ paymentConfigAtStore.ipass_twqr === '1' ? '開啟' : '關閉' }}
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

      <!-- Credit Card Form -->
      <div v-if="showCreditCardForm" class="mt-6 w-full">
        <h2 class="text-md mb-4 text-center font-semibold">信用卡資訊 Credit Card Information</h2>

        <CreditCardInfo
          v-model:card-number="creditCardForm.cardNumber"
          v-model:expiry-month="creditCardForm.expiryMonth"
          v-model:expiry-year="creditCardForm.expiryYear"
          v-model:cvv="creditCardForm.cvv"
        />

        <div class="mt-4 flex flex-wrap justify-center space-x-4 rounded bg-gray-50 p-3 text-xs">
          <p><strong>卡號:</strong> {{ creditCardForm.cardNumber.val }}</p>
          <p><strong>有效年:</strong> {{ creditCardForm.expiryYear.val }}</p>
          <p><strong>有效月:</strong> {{ creditCardForm.expiryMonth.val }}</p>
          <p><strong>驗證碼:</strong> {{ creditCardForm.cvv.val }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
