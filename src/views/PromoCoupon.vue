<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed, onMounted } from 'vue'

import CheckApplyResult from '@/components/PromoCoupon/CheckApplyResult.vue'
import CouponDetails from '@/components/PromoCoupon/CouponDetails.vue'
import DebugInfo from '@/components/PromoCoupon/DebugInfo.vue'
import Logo from '@/components/PromoCoupon/Logo.vue'
import WarningArea from '@/components/PromoCoupon/WarningArea.vue'
import Spinner from '@/components/Spinner/index.vue'
import { useCouponStore } from '@/store/coupon'

const storeCoupon = useCouponStore()
const {
  code,
  promoCodeValidation,
  promoCouponCore,
  paymentInfo,
  isLoading,
  step,
  warnTextKey,
  orderInfo,
  bookingMode,
  passCouponInfo,
  SHOW_COUPON_DETAIL,
  SHOW_SEARCH_BUTTON,
  SHOW_CANCEL_BUTTON,
  IS_INCREMENT_BTN_DISABLED,
  IS_DECREMENT_BTN_DISABLED,
  CAN_SEARCH,
  PROMO_COUPON_STATE,
  USED_COUPON_INFO,
  CURRENT_USED_COUPON_CONTENT,
  CURRENT_USED_COUPON_TYPE,
} = storeToRefs(storeCoupon)

const inputPlaceholder = computed(() => {
  if (paymentInfo.value.payWay === '1' || paymentInfo.value.paymentType === 'point')
    return '無優惠代碼 No Code'
  return '優惠代碼 Coupon'
})

const handleSearch = () => {
  if (CAN_SEARCH.value) {
    storeCoupon.searchCoupon()
  }
}

const handleCancel = () => {
  storeCoupon.deleteCoupon()
}

const handleApply = () => {
  storeCoupon.applyCoupon()
}

onMounted(() => {
  storeCoupon.initDemo()
})
</script>

<template>
  <div class="space-4 px-4">
    <div class="mx-5 max-w-4xl rounded-lg border-2 bg-white p-6 shadow-lg lg:mx-auto">
      <div class="mb-6 flex items-center gap-3">
        <Logo />
        <h2 class="text-2xl font-bold text-gray-800">
          <span>優惠代碼 Coupon</span>
          <span v-if="paymentInfo.paymentType === 'coupon'" class="ml-2 text-sm text-red-500"
            >*</span
          >
        </h2>
      </div>

      <div class="my-6">
        <div class="rounded-lg bg-orange-50 p-4">
          <h4 class="mb-3 font-semibold text-orange-900">📝 測試優惠碼</h4>
          <div class="grid gap-2 text-sm md:grid-cols-2">
            <div>
              <p class="font-semibold text-gray-700">免費優惠：</p>
              <p class="text-gray-600">FREE, FREE2024</p>
            </div>
            <div>
              <p class="font-semibold text-gray-700">折扣優惠：</p>
              <p class="text-gray-600">DISCOUNT85, SALE50, VIP70</p>
            </div>
            <div>
              <p class="font-semibold text-gray-700">折價優惠：</p>
              <p class="text-gray-600">REDUCE100, SUMMER200, WELCOME50</p>
            </div>
            <div>
              <p class="font-semibold text-gray-700">折抵時數：</p>
              <p class="text-gray-600">HALFHOUR, HOUR1, FREETIME2, FREETIME3, HALFDAY</p>
            </div>
            <div>
              <p class="font-semibold text-gray-700">錯誤狀態：</p>
              <p class="text-gray-600">USED2024, EXPIRED, NEEDPHONE, LIMIT, BLOCKED</p>
            </div>
          </div>
        </div>
      </div>

      <div class="flex flex-col gap-4 md:flex-row md:items-start">
        <label for="coupon" class="shrink-0 text-lg font-medium text-gray-700 md:w-40">
          優惠代碼
          <br class="hidden md:block" />
          Coupon
        </label>

        <div class="flex flex-1 flex-col gap-3 md:flex-row md:items-center">
          <div class="relative flex-1">
            <input
              id="coupon"
              v-model="code"
              type="text"
              :placeholder="inputPlaceholder"
              :readonly="PROMO_COUPON_STATE !== 'initial'"
              :disabled="!CAN_SEARCH"
              :tabindex="PROMO_COUPON_STATE !== 'initial' ? -1 : 0"
              :class="[
                PROMO_COUPON_STATE !== 'initial'
                  ? 'pointer-events-none border-transparent bg-black/5 select-none'
                  : '',
                !promoCodeValidation.isValid ? 'border-red-500' : '',
              ]"
              class="w-full rounded-lg border-2 border-gray-300 px-4 py-3 text-base transition-colors focus:ring-0 focus:outline-none disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-100 disabled:text-gray-400"
            />
          </div>

          <div class="flex gap-3">
            <button
              v-show="SHOW_SEARCH_BUTTON"
              type="button"
              :disabled="!CAN_SEARCH"
              class="rounded-lg bg-orange-500 px-6 py-3 font-semibold text-white shadow-md transition-all hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500"
              @click="handleSearch"
            >
              Search
            </button>

            <button
              v-show="SHOW_CANCEL_BUTTON"
              type="button"
              :disabled="step === 1 && code === ''"
              class="rounded-lg bg-gray-500 px-6 py-3 font-semibold text-white shadow-md transition-all hover:bg-gray-600 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500"
              @click="handleCancel"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      <div v-if="isLoading" class="mt-6 flex justify-center p-3">
        <Spinner color="#ff6900" />
      </div>

      <div v-if="step === 2 && !isLoading" class="mt-6">
        <CouponDetails
          v-if="SHOW_COUPON_DETAIL"
          v-model:usage-count="promoCouponCore.usageCount"
          class="rounded-lg bg-orange-50 p-6"
          :is-apply-btn-disabled="step === 1 && code === ''"
          :is-decrement-btn-disabled="IS_DECREMENT_BTN_DISABLED"
          :is-increment-btn-disabled="IS_INCREMENT_BTN_DISABLED"
          :on-click-decrement="promoCouponCore.decrement"
          :on-click-increment="promoCouponCore.increment"
          :on-click-apply="handleApply"
          :text="CURRENT_USED_COUPON_CONTENT"
          :is-bind-phone="promoCouponCore.coupon?.isBindPhone"
          :is-repeatable="promoCouponCore.coupon?.isRepeatable"
          :remain="promoCouponCore.coupon?.remain"
        />

        <WarningArea v-else :warn-text="warnTextKey ? $t(`coupon-warn-text.${warnTextKey}`) : ''" />
      </div>

      <!-- Applied Coupon Info -->
      <div v-if="step === 3 && !isLoading" class="mt-6">
        <CheckApplyResult
          v-model:usage-count="promoCouponCore.usageCount"
          :code="code"
          :text="CURRENT_USED_COUPON_TYPE"
          :is-repeatable="USED_COUPON_INFO?.isRepeatable"
          :total-price="orderInfo.totalPrice"
          :discount-value="USED_COUPON_INFO?.discountValue"
        />
      </div>
    </div>

    <div class="my-6">
      <DebugInfo
        :order-info="orderInfo"
        :payment-info="paymentInfo"
        :booking-mode="bookingMode"
        :pass-coupon-info="passCouponInfo"
      />
    </div>
  </div>
</template>
