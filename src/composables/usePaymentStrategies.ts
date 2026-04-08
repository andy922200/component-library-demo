import type { MaybeRefOrGetter } from 'vue'
import { computed, ref, toValue, watch } from 'vue'

import type { ITransfer, TPaymentMode } from '@/constants/paymentStrategies'
import {
  canUseApplePay,
  canUseCreditCard,
  canUseCvsPay,
  canUseIPassTWQR,
  canUseJkoPay,
  canUseLinePay,
  canUseMemberBookingByEmail,
  canUsePointPay,
  canUseTransfer,
  isCouponPayActive,
  PaymentMode,
  PaymentStrategyValue,
} from '@/constants/paymentStrategies'
import dayjs from '@/plugins/dayjs'

export type PaymentConfig = {
  price: number
  bookingCoreItems?: { slots: { startDatetime: string }[] }[]
  paymentMode?: string
  isAcceptTransfer: boolean
  ignoreTransferDeadline: boolean
  transferStart: string
  transferEnd: string
  transferLimitHour: number
  enableMemberBookingByEmail: boolean
  memberBookingByEmailVisitorMode?: boolean
  usePoint: boolean
  hasMember: boolean
  hasLinePay: boolean
  hasJkoPay: boolean
  hasCvsCodePay: boolean
  hasApplePay: boolean
  hasIPassTWQR: boolean
  cycleTimes: number
  allowedPaymentMethods?: string[]
}

// 策略介面
export interface PaymentStrategy {
  id: PaymentStrategyValue
  evaluate: (
    config: PaymentConfig,
    bookingTimes: ReturnType<typeof getAllBookingStartTime>,
  ) => { text: string; value: string; disabled: boolean } | null
}

const getAllBookingStartTime = (config: PaymentConfig) =>
  config.bookingCoreItems?.map((i) => ({ dayObj: dayjs(i.slots[0]?.startDatetime) })) ?? []

// --- 具體策略實作 ---
export const pointStrategy: PaymentStrategy = {
  id: PaymentStrategyValue.POINT,
  evaluate(config) {
    const { state } = canUsePointPay(config.usePoint ? '1' : '0', config.hasMember, config.price)
    if (config.usePoint && state) {
      return { text: '點數付款 Point', value: PaymentStrategyValue.POINT, disabled: false }
    }
    return null
  },
}

export const memberBookingByEmailStrategy: PaymentStrategy = {
  id: PaymentStrategyValue.MEMBER_BOOKING_BY_EMAIL,
  evaluate(config) {
    const { state } = canUseMemberBookingByEmail(config.enableMemberBookingByEmail ? '1' : '0')
    if (!state || config.memberBookingByEmailVisitorMode) return null
    return {
      text: '會員代碼付款 Member',
      value: PaymentStrategyValue.MEMBER_BOOKING_BY_EMAIL,
      disabled: false,
    }
  },
}

export const couponStrategy: PaymentStrategy = {
  id: PaymentStrategyValue.COUPON,
  evaluate(config) {
    const paymentMode = (config.paymentMode ?? PaymentMode.NO_PAYMENT) as TPaymentMode
    const isActive = isCouponPayActive(paymentMode) || config.memberBookingByEmailVisitorMode
    if (!isActive) return null
    return { text: '優惠代碼付款 Coupon', value: PaymentStrategyValue.COUPON, disabled: false }
  },
}

export const creditCardStrategy: PaymentStrategy = {
  id: PaymentStrategyValue.CREDIT_CARD,
  evaluate(config, bookingTimes) {
    if (config.paymentMode === PaymentMode.NO_PAYMENT) return null
    const paymentMode = config.paymentMode ?? PaymentMode.NO_PAYMENT
    const maxDateStr =
      bookingTimes.length > 0 ? (bookingTimes[0]?.dayObj.format() ?? '') : dayjs().format()

    const { state } = canUseCreditCard({
      orderDate: maxDateStr,
      payment: paymentMode as TPaymentMode,
      price: config.price || 0,
    })

    return {
      text: '信用卡付款 Credit Card',
      value: paymentMode,
      disabled: !state,
    }
  },
}

export const linePayStrategy: PaymentStrategy = {
  id: PaymentStrategyValue.LINEPAY,
  evaluate(config, bookingTimes) {
    if (!config.hasLinePay) return null
    const maxDateStr =
      bookingTimes.length > 0 ? (bookingTimes[0]?.dayObj.format() ?? '') : dayjs().format()

    const { state } = canUseLinePay({
      linepay: config.hasLinePay ? '1' : '0',
      price: config.price || 0,
      cycleTimes: config.cycleTimes,
      orderDate: maxDateStr,
    })

    return { text: 'LINE Pay', value: PaymentStrategyValue.LINEPAY, disabled: !state }
  },
}

export const jkoPayStrategy: PaymentStrategy = {
  id: PaymentStrategyValue.JKOPAY,
  evaluate(config, bookingTimes) {
    if (!config.hasJkoPay) return null
    const maxDateStr =
      bookingTimes.length > 0 ? (bookingTimes[0]?.dayObj.format() ?? '') : dayjs().format()

    const { state } = canUseJkoPay({
      jkopay: config.hasJkoPay ? '1' : '0',
      price: config.price || 0,
      orderDate: maxDateStr,
    })

    return { text: '街口支付 JKOPAY', value: PaymentStrategyValue.JKOPAY, disabled: !state }
  },
}

export const applePayStrategy: PaymentStrategy = {
  id: PaymentStrategyValue.APPLEPAY,
  evaluate(config) {
    if (!config.hasApplePay) return null
    const { state } = canUseApplePay({
      applepay: config.hasApplePay ? '1' : '0',
      price: config.price || 0,
    })
    return { text: 'Apple Pay', value: PaymentStrategyValue.APPLEPAY, disabled: !state }
  },
}

export const transferStrategy: PaymentStrategy = {
  id: PaymentStrategyValue.TRANSFER,
  evaluate(config, bookingTimes) {
    if (!config.isAcceptTransfer) return null

    const transferConfig: ITransfer = {
      accept: config.ignoreTransferDeadline ? '2' : '1',
      hour: String(config.transferLimitHour || 0),
      startTime: config.transferStart,
      endTime: config.transferEnd,
    }

    const maxDateStr =
      bookingTimes.length > 0 ? (bookingTimes[0]?.dayObj.format() ?? '') : dayjs().format()

    const isBookingRightNow = bookingTimes.some((i) => {
      const bookingDateTime = i.dayObj
      return bookingDateTime.isSameOrBefore(dayjs(), 'minute')
    })

    const { state } = canUseTransfer({
      transfer: transferConfig,
      bookStartTime: maxDateStr,
      isBookingRightNow: !!isBookingRightNow,
      price: config.price || 0,
    })

    return { text: '銀行轉帳 Transfer', value: PaymentStrategyValue.TRANSFER, disabled: !state }
  },
}

export const iPassTWQRStrategy: PaymentStrategy = {
  id: PaymentStrategyValue.IPASS_TWQR,
  evaluate(config, bookingTimes) {
    if (!config.hasIPassTWQR) return null
    const maxDateStr =
      bookingTimes.length > 0 ? (bookingTimes[0]?.dayObj.format() ?? '') : dayjs().format()

    const { state } = canUseIPassTWQR({
      ipassTWQR: config.hasIPassTWQR ? '1' : '0',
      price: config.price || 0,
      cycleTimes: config.cycleTimes,
      orderDate: maxDateStr,
    })

    return {
      text: 'iPASS MONEY / TWQR',
      value: PaymentStrategyValue.IPASS_TWQR,
      disabled: !state,
    }
  },
}

export const cvsStrategy: PaymentStrategy = {
  id: PaymentStrategyValue.CVS,
  evaluate(config, bookingTimes) {
    if (!config.hasCvsCodePay) return null

    const isBookingRightNow = bookingTimes.some((i) => {
      const bookingDateTime = i.dayObj
      return bookingDateTime.isSameOrBefore(dayjs(), 'minute')
    })

    const { state } = canUseCvsPay({
      cvs: config.hasCvsCodePay ? '1' : '0',
      price: config.price || 0,
      isBookingRightNow: !!isBookingRightNow,
    })

    return {
      text: '超商代碼付款 CVS',
      value: PaymentStrategyValue.CVS,
      disabled: !state,
    }
  },
}

const strategies: PaymentStrategy[] = [
  pointStrategy,
  memberBookingByEmailStrategy,
  couponStrategy,
  creditCardStrategy,
  linePayStrategy,
  jkoPayStrategy,
  transferStrategy,
  cvsStrategy,
  applePayStrategy,
  iPassTWQRStrategy,
]

export const usePaymentStrategies = (paymentConfig: MaybeRefOrGetter<PaymentConfig>) => {
  const selectedPaymentType = ref<string>('')

  const paymentOptions = computed(() => {
    const config = toValue(paymentConfig)

    const filterByAllowed = (options: { text: string; value: string; disabled: boolean }[]) => {
      if (!config.allowedPaymentMethods?.length) return options
      return options.filter((o) => config.allowedPaymentMethods!.includes(o.value))
    }

    // 若可使用點數付款，直接回傳點數付款選項
    if (config.usePoint) {
      const pointResult = pointStrategy.evaluate(config, [])
      return filterByAllowed(pointResult ? [pointResult] : [])
    }

    // 若可使用會員代碼付款，直接回傳會員代碼付款選項
    if (config.enableMemberBookingByEmail) {
      const memberResult = memberBookingByEmailStrategy.evaluate(config, [])
      return filterByAllowed(memberResult ? [memberResult] : [])
    }

    const bookingTimes = getAllBookingStartTime(config)

    // 排除已在上方處理的特殊策略，使用 flatMap 簡化邏輯
    const options = strategies
      .filter(
        (strategy) =>
          ![PaymentStrategyValue.POINT, PaymentStrategyValue.MEMBER_BOOKING_BY_EMAIL].includes(
            strategy.id,
          ),
      )
      .flatMap((strategy) => {
        const res = strategy.evaluate(config, bookingTimes)
        return res ? [res] : []
      })

    return filterByAllowed(options)
  })

  const PAYMENT_HINT_TEXTS = computed(() => {
    const config = toValue(paymentConfig)
    const availableValues = new Set(paymentOptions.value.map((o) => o.value))
    const hasOption = (value: string) => availableValues.has(value)

    // 定義提示規則：陣列順序 = 顯示順序
    const hintRules = [
      {
        condition: () => selectedPaymentType.value === PaymentStrategyValue.COUPON,
        getText: () => '僅限使用優惠代碼付款',
      },
      {
        condition: () =>
          hasOption(PaymentStrategyValue.TRANSFER) &&
          selectedPaymentType.value === PaymentStrategyValue.TRANSFER &&
          !config.ignoreTransferDeadline,
        getText: () =>
          `提醒：預約時間開始前 ${config.transferLimitHour} 小時不支援轉帳付款，逾期將自動取消訂單`,
      },
      {
        condition: () =>
          hasOption(PaymentStrategyValue.TRANSFER) &&
          selectedPaymentType.value === PaymentStrategyValue.TRANSFER &&
          config.ignoreTransferDeadline,
        getText: () => '提醒：請於活動開始前完成轉帳，逾期將自動取消訂單',
      },
      {
        condition: () =>
          hasOption(PaymentMode.ECPAY) && selectedPaymentType.value === PaymentMode.ECPAY,
        getText: () => '將跳轉至綠界金流頁面進行付款',
      },
      {
        condition: () =>
          hasOption(PaymentStrategyValue.TRANSFER) && !config.usePoint && config.isAcceptTransfer,
        getText: () => `預約時間開始前 ${config.transferLimitHour} 小時不適用銀行轉帳付款`,
      },
      {
        condition: () => hasOption(PaymentStrategyValue.TRANSFER) && config.isAcceptTransfer,
        getText: () => {
          const transferStart = config.transferStart
          const transferEnd = config.transferEnd
          const dateText = dayjs().format('YYYY/MM/DD')
          const isEndNextDay = dayjs(`${dateText} ${transferEnd}`).isBefore(
            dayjs(`${dateText} ${transferStart}`),
          )

          return `銀行轉帳開放時間為 ${transferStart} 至 ${transferEnd}${isEndNextDay ? '(隔日)' : ''}`
        },
      },
      {
        condition: () =>
          hasOption(PaymentStrategyValue.TRANSFER) || hasOption(PaymentStrategyValue.COUPON),
        getText: () => '超過信用卡可刷卡天數限制時，僅提供銀行轉帳或優惠代碼付款',
      },
      {
        condition: () => hasOption(PaymentStrategyValue.LINEPAY),
        getText: () => 'LINE Pay 單筆上限 10,000 元，且不適用於週期性付款',
      },
      {
        condition: () => hasOption(PaymentStrategyValue.IPASS_TWQR),
        getText: () => 'iPASS MONEY / TWQR 單筆上限 10,000 元，且不適用於週期性付款',
      },
      {
        condition: () => hasOption(PaymentStrategyValue.CVS),
        getText: () => '超商代碼付款不適用於即時預約',
      },
    ]

    return hintRules.filter((rule) => rule.condition()).map((rule) => rule.getText())
  })

  watch(
    () => paymentOptions.value,
    (newOptions) => {
      const validOptions = newOptions.filter((o) => !o.disabled)
      if (
        validOptions.length > 0 &&
        (!selectedPaymentType.value ||
          !newOptions.find((o) => o.value === selectedPaymentType.value && !o.disabled))
      ) {
        selectedPaymentType.value = validOptions[0]?.value ?? ''
      }
    },
    { immediate: true },
  )

  return {
    paymentOptions,
    selectedPaymentType,
    PAYMENT_HINT_TEXTS,
  }
}
