<script setup lang="ts">
interface OrderInfo {
  planId: string
  roomId: string
  ownerCode: string
  totalPrice: number
  bookedUnit: number
  priceList: { price: number; unit: number; total: number }[]
  bookingMode: 'seat' | 'event' | 'room'
  bookedTimeSlots: {
    startDateTime: string
    endDateTime: string
    isCrossDay: boolean
  }[]
}

interface PaymentInfo {
  paymentPhone: string
  paymentType: 'credit' | 'point' | 'coupon'
  payWay: string
  isPaymentPersonFilled: boolean
}

interface PassCouponInfo {
  state: string
  isLoading: boolean
}

defineProps<{
  orderInfo: OrderInfo
  paymentInfo: PaymentInfo
  bookingMode: 'seat' | 'event' | 'room'
  passCouponInfo: PassCouponInfo
}>()

const getPaymentTypeText = (type: string) => {
  const mapping: Record<string, string> = {
    credit: '信用卡 Credit Card',
    point: '點數 Points',
    coupon: '優惠券 Coupon',
  }
  return mapping[type] || type
}

const getBookingModeText = (mode: string) => {
  const mapping: Record<string, string> = {
    seat: '座位 Seat',
    event: '活動 Event',
    room: '房間 Room',
  }
  return mapping[mode] || mode
}
</script>

<template>
  <div class="debug-info-container rounded-lg border-2 border-blue-300 bg-blue-50 p-6">
    <div class="mb-4 flex items-center gap-2">
      <svg class="h-6 w-6 text-blue-600" fill="currentColor" viewBox="0 0 16 16">
        <path
          d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"
        />
      </svg>
      <h3 class="text-xl font-bold text-blue-800">除錯資訊 Debug Info</h3>
    </div>

    <div class="space-y-6">
      <!-- Order Info Section -->
      <div class="rounded-lg bg-white p-4 shadow-sm">
        <h4 class="mb-3 text-lg font-semibold text-gray-800">📦 訂單資訊 Order Info</h4>
        <div class="grid gap-3 md:grid-cols-2">
          <div class="flex flex-col gap-1">
            <span class="text-sm font-medium text-gray-600">方案 ID Plan ID:</span>
            <span class="font-mono text-gray-900">{{ orderInfo.planId || '-' }}</span>
          </div>
          <div class="flex flex-col gap-1">
            <span class="text-sm font-medium text-gray-600">房間 ID Room ID:</span>
            <span class="font-mono text-gray-900">{{ orderInfo.roomId || '-' }}</span>
          </div>
          <div class="flex flex-col gap-1">
            <span class="text-sm font-medium text-gray-600">擁有者代碼 Owner Code:</span>
            <span class="font-mono text-gray-900">{{ orderInfo.ownerCode || '-' }}</span>
          </div>
          <div class="flex flex-col gap-1">
            <span class="text-sm font-medium text-gray-600">總價 Total Price:</span>
            <span class="font-semibold text-orange-600"
              >NT$ {{ orderInfo.totalPrice.toLocaleString() }}</span
            >
          </div>
          <div class="flex flex-col gap-1">
            <span class="text-sm font-medium text-gray-600">預訂單位 Booked Unit:</span>
            <span class="text-gray-900">{{ orderInfo.bookedUnit }} 小時</span>
          </div>
          <div class="flex flex-col gap-1">
            <span class="text-sm font-medium text-gray-600">預訂模式 Booking Mode:</span>
            <span class="text-gray-900">{{ getBookingModeText(orderInfo.bookingMode) }}</span>
          </div>
        </div>

        <!-- Price List -->
        <div v-if="orderInfo.priceList.length > 0" class="mt-4">
          <span class="mb-2 block text-sm font-medium text-gray-600">價格清單 Price List:</span>
          <div class="space-y-2">
            <div
              v-for="(item, index) in orderInfo.priceList"
              :key="index"
              class="flex items-center justify-between rounded bg-gray-50 px-3 py-2"
            >
              <span class="text-sm text-gray-700"
                >單價 NT$ {{ item.price }} × {{ item.unit }} 小時</span
              >
              <span class="font-semibold text-gray-900">NT$ {{ item.total.toLocaleString() }}</span>
            </div>
          </div>
        </div>

        <!-- Time Slots -->
        <div v-if="orderInfo.bookedTimeSlots.length > 0" class="mt-4">
          <span class="mb-2 block text-sm font-medium text-gray-600">預訂時段 Time Slots:</span>
          <div class="space-y-2">
            <div
              v-for="(slot, index) in orderInfo.bookedTimeSlots"
              :key="index"
              class="rounded bg-gray-50 px-3 py-2"
            >
              <div class="flex items-center gap-2 text-sm text-gray-700">
                <span>{{ slot.startDateTime }}</span>
                <span>→</span>
                <span>{{ slot.endDateTime }}</span>
                <span
                  v-if="slot.isCrossDay"
                  class="ml-2 rounded bg-orange-100 px-2 py-0.5 text-xs text-orange-700"
                >
                  跨日 Cross Day
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Payment Info Section -->
      <div class="rounded-lg bg-white p-4 shadow-sm">
        <h4 class="mb-3 text-lg font-semibold text-gray-800">💳 付款資訊 Payment Info</h4>
        <div class="grid gap-3 md:grid-cols-2">
          <div class="flex flex-col gap-1">
            <span class="text-sm font-medium text-gray-600">付款電話 Payment Phone:</span>
            <span class="font-mono text-gray-900">{{ paymentInfo.paymentPhone || '-' }}</span>
          </div>
          <div class="flex flex-col gap-1">
            <span class="text-sm font-medium text-gray-600">付款類型 Payment Type:</span>
            <span class="text-gray-900">{{ getPaymentTypeText(paymentInfo.paymentType) }}</span>
          </div>
          <div class="flex flex-col gap-1">
            <span class="text-sm font-medium text-gray-600">付款方式 Pay Way:</span>
            <span class="font-mono text-gray-900">{{ paymentInfo.payWay }}</span>
          </div>
          <div class="flex flex-col gap-1">
            <span class="text-sm font-medium text-gray-600">付款人資訊已填寫:</span>
            <span
              :class="[
                'inline-flex w-fit items-center gap-1 rounded px-2 py-1 text-sm font-semibold',
                paymentInfo.isPaymentPersonFilled
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700',
              ]"
            >
              <svg
                v-if="paymentInfo.isPaymentPersonFilled"
                class="h-4 w-4"
                fill="currentColor"
                viewBox="0 0 16 16"
              >
                <path
                  d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"
                />
              </svg>
              <svg v-else class="h-4 w-4" fill="currentColor" viewBox="0 0 16 16">
                <path
                  d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293 5.354 4.646z"
                />
              </svg>
              {{ paymentInfo.isPaymentPersonFilled ? '是 Yes' : '否 No' }}
            </span>
          </div>
        </div>
      </div>

      <!-- Booking Mode Section -->
      <div class="rounded-lg bg-white p-4 shadow-sm">
        <h4 class="mb-3 text-lg font-semibold text-gray-800">🎯 預訂模式 Booking Mode</h4>
        <div class="flex items-center gap-2">
          <span
            class="inline-flex items-center gap-2 rounded-lg bg-blue-100 px-4 py-2 text-lg font-semibold text-blue-700"
          >
            <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 16 16">
              <path
                d="M1 2.5A1.5 1.5 0 0 1 2.5 1h3A1.5 1.5 0 0 1 7 2.5v3A1.5 1.5 0 0 1 5.5 7h-3A1.5 1.5 0 0 1 1 5.5v-3zM2.5 2a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3zm6.5.5A1.5 1.5 0 0 1 10.5 1h3A1.5 1.5 0 0 1 15 2.5v3A1.5 1.5 0 0 1 13.5 7h-3A1.5 1.5 0 0 1 9 5.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3zM1 10.5A1.5 1.5 0 0 1 2.5 9h3A1.5 1.5 0 0 1 7 10.5v3A1.5 1.5 0 0 1 5.5 15h-3A1.5 1.5 0 0 1 1 13.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3zm6.5.5A1.5 1.5 0 0 1 10.5 9h3a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5h-3A1.5 1.5 0 0 1 9 13.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3z"
              />
            </svg>
            {{ getBookingModeText(bookingMode) }}
          </span>
        </div>
      </div>

      <!-- Pass Coupon Info Section -->
      <div class="rounded-lg bg-white p-4 shadow-sm">
        <h4 class="mb-3 text-lg font-semibold text-gray-800">🎫 套票狀態 Coupon State</h4>
        <div class="grid gap-3 md:grid-cols-2">
          <div class="flex flex-col gap-1">
            <span class="text-sm font-medium text-gray-600">狀態 State:</span>
            <span class="font-mono text-gray-900">{{ passCouponInfo.state }}</span>
          </div>
          <div class="flex flex-col gap-1">
            <span class="text-sm font-medium text-gray-600">載入中 Loading:</span>
            <span
              :class="[
                'inline-flex w-fit items-center gap-1 rounded px-2 py-1 text-sm font-semibold',
                passCouponInfo.isLoading
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-gray-100 text-gray-700',
              ]"
            >
              {{ passCouponInfo.isLoading ? '是 Yes' : '否 No' }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
