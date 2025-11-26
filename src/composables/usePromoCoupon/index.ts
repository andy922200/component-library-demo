import { reactive, readonly, ref } from 'vue'

import type { CouponData, PriceListItem } from '@/composables/usePromoCoupon/types'

export interface OrderInfo {
  totalPrice: number
  priceList: PriceListItem[]
  unit: number
}

// ============ Core Composable ============
/**
 * 核心優惠券邏輯 - 只處理優惠券的狀態管理和折扣計算
 * @param orderInfo 訂單資訊（用於計算折扣）
 */
export function usePromoCoupon() {
  const coupon = reactive<CouponData>({
    type: '',
    textKey: '',
    params: 0,
    isRepeatable: false,
    remain: 0,
    maxUse: 0,
    couponUse: 0,
    isBindPhone: false,
  })
  const usageCount = ref(1)

  function setCoupon(data: CouponData) {
    Object.assign(coupon, data)
    usageCount.value = data.couponUse
  }

  function clear() {
    Object.assign(coupon, {})
    usageCount.value = 1
  }

  function increment() {
    if (!coupon.type) return
    if (usageCount.value >= coupon.maxUse) return
    usageCount.value++
  }

  function decrement() {
    if (!coupon.type) return
    if (usageCount.value <= 1) return
    usageCount.value--
  }

  return {
    coupon: readonly(coupon),
    usageCount,
    setCoupon,
    clear,
    increment,
    decrement,
  }
}
