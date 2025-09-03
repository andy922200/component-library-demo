import dayjs from '@/plugins/dayjs'

/* 金流模式 */
export enum PaymentMode {
  NO_PAYMENT = 'no_payment',
  TAP_PAY_ZHI = 'tap_pay_zhi',
  TAP_PAY = 'tap_pay',
  ECPAY = 'ecpay',
  NEWEBPAY = 'newebpay',
}
export type TPaymentMode = (typeof PaymentMode)[keyof typeof PaymentMode]

export const paymentModeMap = {
  '-1': PaymentMode.NO_PAYMENT,
  0: PaymentMode.TAP_PAY_ZHI,
  1: PaymentMode.TAP_PAY,
  2: PaymentMode.ECPAY,
  3: PaymentMode.NEWEBPAY,
}

export const checkHasPaymentMode = (mode: TPaymentMode) => mode !== PaymentMode.NO_PAYMENT

/* 付款情境 */
export enum paymentScenario {
  FREE_OR_COUPON = 'free_or_coupon',
  MONEY_ONLY = 'money_only',
  POINT_ONLY = 'point_only',
  MONEY_AND_POINT = 'money_and_point',
}

export const paymentScenarioMap = {
  '-1': paymentScenario.FREE_OR_COUPON,
  0: paymentScenario.MONEY_ONLY,
  1: paymentScenario.POINT_ONLY /** 點數付款一定要有 eilis 會員資料 */,
  2: paymentScenario.MONEY_AND_POINT,
}

/* 根據後台回傳值，檢查是否啟用 & 是否顯示選項 */
/**
 * 銀行轉帳
 */
interface ITransfer {
  accept: '0' | '1' | '2' /** 0: 無, 1: 有, 2: 忽略付款期限 */
  hour: string
  startTime: string
  endTime: string
}

export const isTransferActive = (transfer: ITransfer) => transfer.accept !== '0'
const getLimitDayObj = (now: dayjs.Dayjs, transferStart: string, transferEnd: string) => {
  const dateText = now.format('YYYY/MM/DD')
  const nextDateText = now.add(1, 'day').format('YYYY/MM/DD')

  // 匯款時間可能為0600~0200(隔日)，所以如果結束時間小於開始時間，則判為隔日
  if (dayjs(`${dateText} ${transferEnd}`).isBefore(dayjs(`${dateText} ${transferStart}`))) {
    return {
      limitStart: dayjs(`${dateText} ${transferStart}`),
      limitEnd: dayjs(`${nextDateText} ${transferEnd}`),
    }
  }

  return {
    limitStart: dayjs(`${dateText} ${transferStart}`),
    limitEnd: dayjs(`${dateText} ${transferEnd}`),
  }
}
export const canUseTransfer = ({
  transfer,
  bookStartTime,
  isBookingRightNow,
  price,
}: {
  transfer: ITransfer
  bookStartTime: string
  isBookingRightNow: boolean
  price: number
}) => {
  const { accept, hour, startTime, endTime } = transfer ?? {}
  const isAcceptTransfer = isTransferActive(transfer)
  const ignoreTransferDeadline = accept !== '1'
  const transferLimitHour = +hour || 0
  const transferStart = startTime || '00:00'
  const transferEnd = endTime || '24:00'
  const bookStartTimeObj = dayjs(bookStartTime)
  const now = dayjs()
  const isFree = price <= 0

  const isSameOrLessThenTransferLimitHour =
    isAcceptTransfer &&
    !ignoreTransferDeadline &&
    bookStartTimeObj.diff(now, 'minute') <= +transferLimitHour * 60

  const { limitStart, limitEnd } = getLimitDayObj(now, transferStart, transferEnd)
  const isBetweenTransferTime = now.isBetween(limitStart, limitEnd, 'minute', '[)')

  const errMsgArr = []
  if (isSameOrLessThenTransferLimitHour) {
    errMsgArr.push(`預約時間開始前 ${transferLimitHour} 小時不支援轉帳付款，請選擇其他付款方式`)
  }
  if (!isBetweenTransferTime) {
    errMsgArr.push(`轉帳期間為${transferStart}至${transferEnd}，請選擇其他付款方式`)
  }

  return {
    state:
      isAcceptTransfer &&
      isBetweenTransferTime &&
      !isSameOrLessThenTransferLimitHour &&
      !isBookingRightNow &&
      !isFree,
    errMsg: errMsgArr.join('\n'),
  }
}

/**
 * 信用卡付款
 */
export const isCreditCardActive = checkHasPaymentMode
export const canUseCreditCard = ({
  orderDate,
  payment,
  price,
}: {
  orderDate: string
  payment: TPaymentMode
  price: number
}) => {
  const isActive = isCreditCardActive(payment)
  const todayObj = dayjs()
  const isOrderInDuration = dayjs(orderDate).isBetween(
    todayObj,
    todayObj.add(canUseCreditCardPaymentDurationDays, 'day'),
    'day',
    '[]',
  )
  const isFree = price <= 0
  const errMsgArr = []

  if (!isActive) {
    errMsgArr.push('CreditCard is not active.')
  }

  if (!isOrderInDuration) {
    errMsgArr.push(
      `CreditCard is only available for orders within ${canUseCreditCardPaymentDurationDays} days from today.`,
    )
  }

  return {
    state: isActive && isOrderInDuration && !isFree,
    errMsg: errMsgArr.join('\n'),
  }
}

/**
 * LinePay
 */
export const isLinePayActive = (linepay: '0' | '1') => linepay === '1'
export const canUseLinePay = ({
  linepay,
  price,
  cycleTimes,
  orderDate,
}: {
  linepay: '0' | '1'
  price: number
  cycleTimes: number
  orderDate: string
}) => {
  const isActive = isLinePayActive(linepay)
  const isPriceOver10000 = price > 10000
  const isFree = price <= 0
  const isNotCycle = (cycleTimes || 0) <= 1
  const todayObj = dayjs()
  const isOrderInMonth = dayjs(orderDate).isBetween(todayObj, todayObj.add(1, 'month'), 'day', '[]')
  const errMsgArr = []

  if (!isActive) {
    errMsgArr.push('LinePay is not active.')
  }

  if (isPriceOver10000) {
    errMsgArr.push('LinePay is only available for orders under 10000.')
  }

  if (!isNotCycle) {
    errMsgArr.push('LinePay is not available for recurring payments.')
  }

  if (!isOrderInMonth) {
    errMsgArr.push('LinePay is only available for orders within the current month.')
  }

  return {
    state: isActive && !isFree && !isPriceOver10000 && isNotCycle && isOrderInMonth,
    errMsg: errMsgArr.join('\n'),
  }
}

/**
 * JKoPay
 */
export const canUseCreditCardPaymentDurationDays = 210
export const isJkoPayActive = (jkopay: '0' | '1') => jkopay === '1'
export const canUseJkoPay = ({
  jkopay,
  orderDate,
  price,
}: {
  jkopay: '0' | '1'
  orderDate: string
  price: number
}) => {
  const isActive = isJkoPayActive(jkopay)
  const todayObj = dayjs()
  const isOrderInDuration = dayjs(orderDate).isBetween(
    todayObj,
    todayObj.add(canUseCreditCardPaymentDurationDays, 'day'),
    'day',
    '[]',
  )
  const isFree = price <= 0
  const errMsgArr = []

  if (!isActive) {
    errMsgArr.push('JKoPay is not active.')
  }

  if (!isOrderInDuration) {
    errMsgArr.push(
      `JKoPay is only available for orders within ${canUseCreditCardPaymentDurationDays} days from today.`,
    )
  }

  return {
    state: isActive && isOrderInDuration && !isFree,
    errMsg: errMsgArr.join('\n'),
  }
}

/**
 * CVS 超商付款
 */
export const isCvsActive = (cvs: '0' | '1') => cvs === '1'
export const canUseCvsPay = ({
  cvs,
  price,
  isBookingRightNow,
}: {
  cvs: '0' | '1'
  price: number
  isBookingRightNow: boolean
}) => {
  const isActive = isCvsActive(cvs)
  const isPriceBelow30 = price < 30
  const errMsgArr = []

  if (!isActive) {
    errMsgArr.push('CvsPay is not active.')
  }

  if (isPriceBelow30) {
    errMsgArr.push('CvsPay is only available for orders above 30.')
  }

  return {
    state: isActive && !isPriceBelow30 && !isBookingRightNow,
    errMsg: errMsgArr.join('\n'),
  }
}

/**
 * ApplePay
 */
export const isApplePayActive = (applepay: '0' | '1') => applepay === '1'
export const canUseApplePay = ({ applepay, price }: { applepay: '0' | '1'; price: number }) => {
  const isActive = isApplePayActive(applepay)
  const isFree = price <= 0
  const errMsgArr = []

  if (!isActive) {
    errMsgArr.push('ApplePay is not active.')
  }

  return {
    state: isActive && !isFree,
    errMsg: errMsgArr.join('\n'),
  }
}

/**
 * 點數付款
 */
export const isPointPayActive = (enabled: '0' | '1') => enabled === '1'
export const canUsePointPay = (
  value: '0' | '1',
  hasMemberData: boolean = false,
  point: number | undefined,
) => {
  const isActive = isPointPayActive(value)
  const errMsgArr = []
  const hasPointPrice = point ? point > 0 : false

  if (!isActive) {
    errMsgArr.push('Point payment is not available.')
  }

  if (!hasMemberData) {
    errMsgArr.push('Point payment is only available for members.')
  }

  return {
    state: isActive && hasMemberData && hasPointPrice,
    errMsg: errMsgArr.join('\n'),
  }
}

export const getPaymentScenario = ({
  payment,
  linepay,
  jkopay,
  cvs,
  applepay,
  point_enabled,
}: {
  payment: TPaymentMode
  linepay: '0' | '1'
  jkopay: '0' | '1'
  cvs: '0' | '1'
  applepay: '0' | '1'
  point_enabled: '0' | '1'
}) => {
  const hasMoneyScenario =
    payment !== PaymentMode.NO_PAYMENT ||
    isLinePayActive(linepay) ||
    isJkoPayActive(jkopay) ||
    isCvsActive(cvs) ||
    isApplePayActive(applepay)
  const hasPointScenario = isPointPayActive(point_enabled)

  if (hasMoneyScenario && hasPointScenario) return paymentScenario.MONEY_AND_POINT
  if (hasPointScenario) return paymentScenario.POINT_ONLY
  if (hasMoneyScenario) return paymentScenario.MONEY_ONLY

  return paymentScenario.FREE_OR_COUPON
}

export interface IPaymentStrategy {
  // General
  payment: TPaymentMode
  orderDate: string
  price: number
  point: number | undefined
  isBookingRightNow: boolean
  bookStartTime: string
  cycleTimes: number
  // Transfer
  transfer: ITransfer
  // Third-party
  linepay: '0' | '1'
  jkopay: '0' | '1'
  cvs: '0' | '1'
  applepay: '0' | '1'
  // Point
  point_enabled: '0' | '1'
  hasMemberData: boolean
}

export const paymentStrategies = [
  {
    text: '信用卡付款 Credit Card',
    value: 'credit-card',
    isAvailable: (config: IPaymentStrategy) => isCreditCardActive(config.payment),
    isDisabled: (config: IPaymentStrategy) => {
      const { orderDate } = config
      const hasPaymentMode = checkHasPaymentMode(config.payment)
      return (
        !canUseCreditCard({ orderDate, payment: config.payment, price: config.price }).state ||
        !hasPaymentMode
      )
    },
  },
  {
    text: '銀行轉帳 Transfer',
    value: 'TRANSFER',
    isAvailable: (config: IPaymentStrategy) => isTransferActive(config.transfer),
    isDisabled: (config: IPaymentStrategy) => {
      const { transfer, bookStartTime, isBookingRightNow } = config
      const hasPaymentMode = checkHasPaymentMode(config.payment)
      return (
        !canUseTransfer({ transfer, bookStartTime, isBookingRightNow, price: config.price })
          .state || !hasPaymentMode
      )
    },
  },
  {
    text: 'LINE Pay',
    value: 'LINEPAY',
    isAvailable: (config: IPaymentStrategy) => isLinePayActive(config.linepay),
    isDisabled: (config: IPaymentStrategy) => {
      const { linepay, price, cycleTimes, orderDate } = config
      const hasPaymentMode = checkHasPaymentMode(config.payment)
      return !canUseLinePay({ linepay, price, cycleTimes, orderDate }).state || !hasPaymentMode
    },
  },
  {
    text: '街口支付 JKOPAY',
    value: 'JKPAY',
    isAvailable: (config: IPaymentStrategy) => isJkoPayActive(config.jkopay),
    isDisabled: (config: IPaymentStrategy) => {
      const { jkopay, orderDate } = config
      const hasPaymentMode = checkHasPaymentMode(config.payment)
      return !canUseJkoPay({ jkopay, orderDate, price: config.price }).state || !hasPaymentMode
    },
  },
  {
    text: '超商代碼付款 CVS',
    value: 'CVS',
    isAvailable: (config: IPaymentStrategy) => isCvsActive(config.cvs),
    isDisabled: (config: IPaymentStrategy) => {
      const { cvs, price, isBookingRightNow } = config
      const hasPaymentMode = checkHasPaymentMode(config.payment)
      return !canUseCvsPay({ cvs, price, isBookingRightNow }).state || !hasPaymentMode
    },
  },
  {
    text: 'Apple Pay',
    value: 'APPLEPAY',
    isAvailable: (config: IPaymentStrategy) => isApplePayActive(config.applepay),
    isDisabled: (config: IPaymentStrategy) => {
      const { applepay } = config
      const hasPaymentMode = checkHasPaymentMode(config.payment)
      return !canUseApplePay({ applepay, price: config.price }).state || !hasPaymentMode
    },
  },
  {
    text: '點數付款 Point',
    value: 'POINT',
    isAvailable: (config: IPaymentStrategy) => isPointPayActive(config.point_enabled),
    isDisabled: (config: IPaymentStrategy) => {
      const { point_enabled, hasMemberData, payment } = config
      const hasPaymentMode = checkHasPaymentMode(payment)
      return !canUsePointPay(point_enabled, hasMemberData, config.point).state || !hasPaymentMode
    },
  },
  {
    text: '優惠代碼付款 Coupon',
    value: 'COUPON',
    isAvailable: (config: IPaymentStrategy) => {
      const isNegativePrice = config.price < 0
      return !isNegativePrice
    },
    isDisabled: () => false,
  },
  {
    text: '免費 Free',
    value: 'FREE',
    isAvailable: (config: IPaymentStrategy) => {
      const isFree = config.price <= 0
      return isFree
    },
    isDisabled: () => false,
  },
]
