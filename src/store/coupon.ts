import { cloneDeep } from 'lodash-es'
import { acceptHMRUpdate, defineStore } from 'pinia'
import { ref } from 'vue'

import { useLanguage } from '@/composables/useLanguage'
import { usePromoCoupon } from '@/composables/usePromoCoupon'
import { useCouponAPI } from '@/composables/usePromoCoupon/api'
import {
  CouponStateEnum,
  type CouponType,
  CouponTypeEnum,
} from '@/composables/usePromoCoupon/types'
import {
  couponProcessor,
  couponResValidator,
  getCouponDiscount,
} from '@/composables/usePromoCoupon/utils'
import i18n from '@/plugins/i18n/entry'

const orderInfoObj = cloneDeep({
  planId: '',
  roomId: '',
  ownerCode: '',
  totalPrice: 0,
  bookedUnit: 0,
  priceList: [] as { price: number; unit: number; total: number }[],
  bookingMode: '' as 'seat' | 'event' | 'room',
  bookedTimeSlots: [] as {
    startDateTime: string
    endDateTime: string
    isCrossDay: boolean
  }[],
})

const paymentInfoObj = cloneDeep({
  paymentPhone: '',
  paymentType: '' as 'credit' | 'point' | 'coupon',
  payWay: '',
  isPaymentPersonFilled: true,
})

const passCouponInfo = cloneDeep({
  state: 'initial',
  isLoading: false,
})

const getCouponContentText = ({
  type,
  textKey: rawTextKey,
  params,
  isInfo = false,
  isTwOrCn = true,
}: {
  type: CouponType
  textKey: string
  params: number
  isInfo?: boolean
  isTwOrCn?: boolean
}) => {
  const { t } = i18n.global
  const textKey = isInfo ? `coupon-info.${rawTextKey}` : `coupon-type.${rawTextKey}`

  switch (type) {
    case CouponTypeEnum.DISCOUNT:
      return t(textKey, {
        value: isTwOrCn ? ((params * 10) % 10 === 0 ? params : params * 10) : 100 - params * 10,
      })
    case CouponTypeEnum.REDUCE_PRICE:
    case CouponTypeEnum.REDUCE_HOURS:
      return t(textKey, {
        value: params,
      })
    default:
      return t(textKey)
  }
}

export const useCouponStore = defineStore('coupon', {
  state: () => {
    const step = ref<1 | 2 | 3>(1)
    const isLoading = ref(false)
    const code = ref('')
    const noCoupon = ref(false)
    const warnTextKey = ref('')
    const promoCodeValidation = ref({ isValid: true, errMsg: '' })

    // 初始化 orderInfo
    const orderInfo = cloneDeep(orderInfoObj)

    // 初始化 promoCouponCore
    const promoCouponCore = usePromoCoupon()

    return {
      step,
      isLoading,
      code,
      noCoupon,
      warnTextKey,
      promoCodeValidation,
      promoCouponCore,
      /** 其餘有關資料 */
      orderInfo,
      paymentInfo: cloneDeep(paymentInfoObj),
      bookingMode: '' as 'seat' | 'event' | 'room',
      passCouponInfo: cloneDeep(passCouponInfo),
    }
  },
  getters: {
    IS_PAY_BY_POINT(state) {
      return state.paymentInfo.paymentType === 'point' || state.paymentInfo.payWay === '1'
    },
    USED_COUPON_INFO(state) {
      // 直接從 state 讀取最新的 orderInfo 來計算折扣
      const discountValue = getCouponDiscount({
        type: state.promoCouponCore.coupon?.type ?? '',
        params: state.promoCouponCore.coupon?.params ?? 0,
        couponUse: state.promoCouponCore.usageCount,
        totalPrice: state.orderInfo.totalPrice,
        bookedPriceList: state.orderInfo.priceList,
        bookedUnit: state.orderInfo.bookedUnit,
      })

      return {
        ...(state.promoCouponCore.coupon ?? {}),
        discountValue,
      }
    },
    PROMO_COUPON_STATE(state): CouponStateEnum {
      if (state.step === 2 && state.promoCouponCore.coupon !== null)
        return CouponStateEnum.CAN_APPLY
      if (
        state.step === 2 &&
        state.promoCouponCore.coupon === null &&
        state.warnTextKey === 'noPhone'
      ) {
        return CouponStateEnum.NO_PHONE
      }
      if (state.step === 2 && state.promoCouponCore.coupon === null)
        return CouponStateEnum.NOT_FOUND
      if (state.step === 3) return CouponStateEnum.APPLIED
      if (state.passCouponInfo.isLoading) return CouponStateEnum.INVALID

      return CouponStateEnum.INITIAL
    },
    CURRENT_USED_COUPON_TYPE(state) {
      const { IS_ZHTW_OR_ZHCN } = useLanguage()

      return getCouponContentText({
        type: state.promoCouponCore.coupon.type,
        textKey: state.promoCouponCore.coupon.textKey,
        params: state.promoCouponCore.coupon.params,
        isInfo: false,
        isTwOrCn: IS_ZHTW_OR_ZHCN.value,
      })
    },
    CURRENT_USED_COUPON_CONTENT(state) {
      const { IS_ZHTW_OR_ZHCN } = useLanguage()

      return getCouponContentText({
        type: state.promoCouponCore.coupon.type,
        textKey: state.promoCouponCore.coupon.textKey,
        params: state.promoCouponCore.coupon.params,
        isInfo: true,
        isTwOrCn: IS_ZHTW_OR_ZHCN.value,
      })
    },
    CAN_SEARCH(state): boolean {
      if (
        state.passCouponInfo.state !== CouponStateEnum.INITIAL ||
        this.PROMO_COUPON_STATE === CouponStateEnum.INVALID
      ) {
        return false
      }

      return !(
        (this.PROMO_COUPON_STATE === CouponStateEnum.NO_PHONE &&
          !state.paymentInfo.isPaymentPersonFilled) ||
        this.IS_PAY_BY_POINT
      )
    },
    SHOW_SEARCH_BUTTON(): boolean {
      return [CouponStateEnum.INITIAL, CouponStateEnum.NO_PHONE, CouponStateEnum.INVALID].includes(
        this.PROMO_COUPON_STATE,
      )
    },
    SHOW_CANCEL_BUTTON(): boolean {
      return [
        CouponStateEnum.CAN_APPLY,
        CouponStateEnum.NOT_FOUND,
        CouponStateEnum.APPLIED,
      ].includes(this.PROMO_COUPON_STATE)
    },
    SHOW_COUPON_DETAIL(state): boolean {
      return state.promoCouponCore.coupon !== null && !state.noCoupon
    },
    IS_INCREMENT_BTN_DISABLED(state): boolean {
      return (
        state.promoCouponCore.usageCount === state.promoCouponCore.coupon?.maxUse ||
        !state.promoCouponCore.coupon?.isRepeatable
      )
    },
    IS_DECREMENT_BTN_DISABLED(state): boolean {
      return state.promoCouponCore.usageCount <= 1 || !state.promoCouponCore.coupon?.isRepeatable
    },
  },
  actions: {
    initDemo() {
      this.getOrderInfo()
      this.getPaymentInfo()
      this.getBookingMode()
      this.getPassCouponInfo()
    },
    getOrderInfo() {
      this.orderInfo = {
        planId: 'PLAN001',
        roomId: 'ROOM001',
        ownerCode: 'OWNER001',
        totalPrice: 1000,
        bookedUnit: 4,
        bookingMode: 'room',
        priceList: [
          { price: 300, unit: 2, total: 600 },
          { price: 200, unit: 2, total: 400 },
        ],
        bookedTimeSlots: [
          { startDateTime: '2024-11-26 10:00', endDateTime: '2024-11-26 14:00', isCrossDay: false },
        ],
      }
    },
    getPaymentInfo() {
      this.paymentInfo = {
        paymentPhone: '0912345678',
        paymentType: 'credit',
        payWay: '0',
        isPaymentPersonFilled: true,
      }
    },
    getBookingMode() {
      this.bookingMode = 'room'
    },
    getPassCouponInfo() {
      this.passCouponInfo = {
        state: CouponStateEnum.INITIAL,
        isLoading: false,
      }
    },
    async searchCoupon() {
      if (!this.code || !this.CAN_SEARCH) return

      this.isLoading = true

      try {
        const couponAPI = useCouponAPI()

        // 1. 呼叫 API
        const rawRes = await couponAPI.fetchCoupon({
          code: this.code,
          ownerCode: this.orderInfo.ownerCode,
          roomId: this.orderInfo.roomId,
          planId: this.orderInfo.planId,
          phone: this.paymentInfo.paymentPhone,
          dates: this.orderInfo.bookedTimeSlots.map((dayObj) => dayObj.startDateTime.split(' ')[0]),
        })

        // 2. 驗證
        const validationResult = couponResValidator({
          couponRes: rawRes,
          bookingMode: this.orderInfo.bookingMode,
          startDatetime: this.orderInfo.bookedTimeSlots[0].startDateTime,
          endDatetime: this.orderInfo.bookedTimeSlots[0].endDateTime,
        })

        this.promoCodeValidation = {
          isValid: validationResult.isValid,
          errMsg: validationResult.isValid ? '' : validationResult.errorKey || '',
        }

        // 3. 處理結果
        if (validationResult.isValid && typeof rawRes === 'object' && rawRes) {
          const couponData = couponProcessor({
            type: rawRes.type,
            content: rawRes.content ?? '',
            quantity: rawRes.quantity ?? '',
            repeatable: rawRes.repeatable ?? '',
            phone: rawRes.phone ?? '',
            totalPrice: this.orderInfo.totalPrice,
            bookedUnit: this.orderInfo.bookedUnit,
          })

          this.promoCouponCore.setCoupon(couponData)
          this.warnTextKey = ''
          this.noCoupon = false
        } else {
          this.warnTextKey = validationResult.errorKey || 'unknown-error'
          this.noCoupon = true
        }
      } catch (err) {
        console.error(err)
        this.warnTextKey = 'error-while-querying'
        this.noCoupon = true
      } finally {
        setTimeout(() => {
          this.step = 2
          this.isLoading = false
        }, 500)
      }
    },
    applyCoupon() {
      if (!this.promoCouponCore.coupon) return

      console.log('優惠券已套用:', {
        code: this.code,
        data: this.promoCouponCore.coupon,
      })

      this.step = 3
    },
    deleteCoupon() {
      this.step = 1
      this.code = ''
      this.promoCouponCore.clear()
      this.noCoupon = true
      this.warnTextKey = ''
      this.promoCodeValidation = { isValid: true, errMsg: '' }
      console.log('優惠券已刪除')
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useCouponStore, import.meta.hot))
}
