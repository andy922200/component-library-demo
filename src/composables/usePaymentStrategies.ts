import type { Ref } from 'vue'
import { computed, ref, watch } from 'vue'

import type { IPaymentStrategy } from '@/constants/paymentStrategies'
import {
  canUseApplePay,
  canUseCreditCard,
  canUseCvsPay,
  canUseJkoPay,
  canUseLinePay,
  canUsePointPay,
  canUseTransfer,
  checkHasPaymentMode,
  isApplePayActive,
  isCreditCardActive,
  isCvsActive,
  isJkoPayActive,
  isLinePayActive,
  isMemberBookingByEmailActive,
  isPointPayActive,
  isTransferActive,
  PaymentMode,
  PaymentScenario,
  PaymentStrategyValue,
} from '@/constants/paymentStrategies'

export const getPaymentScenario = ({
  price,
  payment,
  linepay,
  jkopay,
  cvs,
  applepay,
  pointEnabled,
  enableMemberBookingByEmail,
}: IPaymentStrategy) => {
  const hasMoneyScenario =
    payment !== PaymentMode.NO_PAYMENT ||
    isLinePayActive(linepay) ||
    isJkoPayActive(jkopay) ||
    isCvsActive(cvs) ||
    isApplePayActive(applepay)
  const hasPointScenario = isPointPayActive(pointEnabled)
  const isFree = price === 0

  if (isMemberBookingByEmailActive(enableMemberBookingByEmail))
    return PaymentScenario.FREE_OR_COUPON
  if (isFree) return PaymentScenario.FREE_OR_COUPON
  if (hasMoneyScenario && hasPointScenario) return PaymentScenario.MONEY_AND_POINT
  if (hasPointScenario) return PaymentScenario.POINT_ONLY
  if (hasMoneyScenario) return PaymentScenario.MONEY_ONLY

  return PaymentScenario.FREE_OR_COUPON
}

export const paymentStrategies = [
  {
    text: '請選擇付款方式 Please Select',
    value: '',
    isAvailable: () => true,
    isDisabled: () => true,
  },
  {
    text: '信用卡付款 Credit Card',
    value: PaymentStrategyValue.CREDIT_CARD,
    isAvailable: (config: IPaymentStrategy) => {
      const { enableMemberBookingByEmail } = config
      if (isMemberBookingByEmailActive(enableMemberBookingByEmail)) return false
      return isCreditCardActive(config.payment)
    },
    isDisabled: (config: IPaymentStrategy) => {
      const { orderDate, payment, price } = config
      const hasPaymentMode = checkHasPaymentMode(payment)
      return !canUseCreditCard({ orderDate, payment, price }).state || !hasPaymentMode
    },
  },
  {
    text: '銀行轉帳 Transfer',
    value: PaymentStrategyValue.TRANSFER,
    isAvailable: (config: IPaymentStrategy) => {
      const { enableMemberBookingByEmail } = config
      if (isMemberBookingByEmailActive(enableMemberBookingByEmail)) return false
      return isTransferActive(config.transfer) && !isPointPayActive(config.pointEnabled)
    },
    isDisabled: (config: IPaymentStrategy) => {
      const { transfer, bookStartTime, isBookingRightNow, enableMemberBookingByEmail } = config
      if (isMemberBookingByEmailActive(enableMemberBookingByEmail)) return false

      return !canUseTransfer({ transfer, bookStartTime, isBookingRightNow, price: config.price })
        .state
    },
  },
  {
    text: 'LINE Pay',
    value: PaymentStrategyValue.LINEPAY,
    isAvailable: (config: IPaymentStrategy) => {
      const { payment, enableMemberBookingByEmail } = config
      if (isMemberBookingByEmailActive(enableMemberBookingByEmail)) return false

      const hasPaymentMode = checkHasPaymentMode(payment)
      return isLinePayActive(config.linepay) && hasPaymentMode
    },
    isDisabled: (config: IPaymentStrategy) => {
      const { linepay, price, cycleTimes, orderDate } = config
      return !canUseLinePay({ linepay, price, cycleTimes, orderDate }).state
    },
  },
  {
    text: '街口支付 JKOPAY',
    value: PaymentStrategyValue.JKOPAY,
    isAvailable: (config: IPaymentStrategy) => {
      const { payment, enableMemberBookingByEmail } = config
      if (isMemberBookingByEmailActive(enableMemberBookingByEmail)) return false

      const hasPaymentMode = checkHasPaymentMode(payment)
      return isJkoPayActive(config.jkopay) && hasPaymentMode
    },
    isDisabled: (config: IPaymentStrategy) => {
      const { jkopay, orderDate } = config
      return !canUseJkoPay({ jkopay, orderDate, price: config.price }).state
    },
  },
  {
    text: '超商代碼付款 CVS',
    value: PaymentStrategyValue.CVS,
    isAvailable: (config: IPaymentStrategy) => {
      const { payment, enableMemberBookingByEmail } = config
      if (isMemberBookingByEmailActive(enableMemberBookingByEmail)) return false

      const hasPaymentMode = checkHasPaymentMode(payment)
      return isCvsActive(config.cvs) && hasPaymentMode
    },
    isDisabled: (config: IPaymentStrategy) => {
      const { cvs, price, isBookingRightNow } = config
      return !canUseCvsPay({ cvs, price, isBookingRightNow }).state
    },
  },
  {
    text: 'Apple Pay',
    value: 'APPLEPAY',
    isAvailable: (config: IPaymentStrategy) => {
      const { payment, applepay, enableMemberBookingByEmail } = config
      if (isMemberBookingByEmailActive(enableMemberBookingByEmail)) return false

      const hasPaymentMode = checkHasPaymentMode(payment)
      return isApplePayActive(applepay) && hasPaymentMode
    },
    isDisabled: (config: IPaymentStrategy) => {
      const { applepay } = config
      return !canUseApplePay({ applepay, price: config.price }).state
    },
  },
  {
    text: '點數付款 Point',
    value: PaymentStrategyValue.POINT,
    isAvailable: (config: IPaymentStrategy) => {
      const { pointEnabled, payment, enableMemberBookingByEmail } = config
      if (isMemberBookingByEmailActive(enableMemberBookingByEmail)) return false

      return isPointPayActive(pointEnabled) && !checkHasPaymentMode(payment)
    },
    isDisabled: (config: IPaymentStrategy) => {
      const { pointEnabled, hasPointMemberData } = config
      return !canUsePointPay(pointEnabled, Boolean(+hasPointMemberData), config.point).state
    },
  },
  {
    text: '優惠代碼付款 Coupon',
    value: PaymentStrategyValue.COUPON,
    isAvailable: (config: IPaymentStrategy) => {
      const { price, pointEnabled, enableMemberBookingByEmail } = config
      const isZeroPrice = price === 0

      if (isMemberBookingByEmailActive(enableMemberBookingByEmail)) return false

      return isZeroPrice && (!isPointPayActive(pointEnabled) || checkHasPaymentMode(config.payment))
    },
    isDisabled: () => false,
  },
  {
    text: '會員代碼付款 Member',
    value: PaymentStrategyValue.MEMBER_BOOKING_BY_EMAIL,
    isAvailable: (config: IPaymentStrategy) => {
      const { enableMemberBookingByEmail } = config
      return isMemberBookingByEmailActive(enableMemberBookingByEmail)
    },
    isDisabled: () => false,
  },
]

/**
 * @description 一個響應式的 Composable，用來根據動態的設定計算可用的付款選項。
 * @description - 當金流和點數付款二者皆啟用時，僅顯示金流
 * @param {Ref<IPaymentStrategy>} config - 一個包含所有計算所需參數的 ref 或 computed 物件。
 * @returns {{
 * paymentOptions: ComputedRef<Array<{text: string, value: string, disabled: boolean}>>,
 * selectedPaymentType: Ref<string>
 * }}
 */
export function usePaymentStrategies(config: Ref<IPaymentStrategy>) {
  const selectedPaymentType = ref<string>('')
  const currentScenario = computed(() => getPaymentScenario(config.value))

  const paymentOptions = computed(() => {
    return paymentStrategies
      .filter((strategy) => strategy.isAvailable(config.value))
      .map((strategy) => {
        const value =
          strategy.value === PaymentStrategyValue.CREDIT_CARD
            ? config.value.payment // 如果是信用卡，動態給予後端對應的金流字串
            : strategy.value

        return {
          text: strategy.text,
          value,
          disabled: strategy.isDisabled(config.value),
        }
      })
  })

  watch(
    paymentOptions,
    (newOptions) => {
      const validOptions = newOptions.filter((opt) => !opt.disabled)

      if (validOptions.length === 0) {
        selectedPaymentType.value = ''
        return
      }

      const currentSelectionIsValid = validOptions.some(
        (opt) => opt.value === selectedPaymentType.value,
      )

      if (!currentSelectionIsValid) {
        selectedPaymentType.value = validOptions[0].value ?? ''
      }
    },
    { immediate: true, deep: true },
  )

  return {
    paymentOptions,
    selectedPaymentType,
    currentScenario,
  }
}
