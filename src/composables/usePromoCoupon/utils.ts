import Big from 'big.js'
import type { Dayjs } from 'dayjs'
import { cloneDeep } from 'lodash-es'

import { CouponResponse } from '@/composables/usePromoCoupon/api'
import type {
  CouponData,
  CouponInfo,
  CouponType,
  PriceListItem,
  ValidateCouponResult,
  ValidationResult,
} from '@/composables/usePromoCoupon/types'
import { CouponTypeEnum, ValidateCouponRes } from '@/composables/usePromoCoupon/types'
import dayjs from '@/plugins/dayjs'

// ============ Validation ============
export const isWithinDuration = ({
  startDatetime,
  endDatetime,
  duration,
}: {
  startDatetime: string // YYYY-MM-DD HH:mm
  endDatetime: string // YYYY-MM-DD HH:mm
  duration: { start: string; end: string } // HH:mm
}): boolean => {
  if (!startDatetime || !endDatetime || !duration || !duration.start || !duration.end) return false

  const { start, end } = duration
  const startDatetimeObj = dayjs(startDatetime)
  const endDatetimeObj = dayjs(endDatetime)
  const isCrossDay = endDatetimeObj.isAfter(startDatetimeObj, 'day')
  const isTimeBetween = (time: Dayjs, start: Dayjs, end: Dayjs): boolean =>
    time.isBetween(start, end, 'minute', '[]')

  // 取得開始日期，格式化為 YYYY/MM/DD
  const startDate = startDatetimeObj.format('YYYY/MM/DD')

  // 建立當天的時段範圍
  const [startOfDay, endOfDay] = [dayjs(`${startDate} ${start}`), dayjs(`${startDate} ${end}`)]

  // 建立隔天的時段範圍
  const [startOfNextDay, endOfNextDay] = [
    dayjs(`${startDate} ${start}`).add(1, 'day'),
    dayjs(`${startDate} ${end}`).add(1, 'day'),
  ]

  if (isCrossDay) {
    // 跨日情況：檢查開始時間是否在當天時段內，結束時間是否在隔天時段內
    const startsWithinToday = isTimeBetween(startDatetimeObj, startOfDay, endOfDay)
    const endsWithinNextDay = isTimeBetween(endDatetimeObj, startOfNextDay, endOfNextDay)

    // 全天時段特殊處理
    const isAllDay = start === '00:00' && end === '24:00'

    // 檢查是否有重疊（非全天且時段跨越當天結束到隔天開始）
    const overlap =
      !isAllDay &&
      startDatetimeObj.isSameOrBefore(endOfDay) &&
      endDatetimeObj.isSameOrAfter(startOfNextDay)

    return startsWithinToday && endsWithinNextDay && !overlap
  } else {
    // 同日情況：開始和結束時間都必須在當天時段內
    return (
      isTimeBetween(startDatetimeObj, startOfDay, endOfDay) &&
      isTimeBetween(endDatetimeObj, startOfDay, endOfDay)
    )
  }
}

export const couponResValidator = ({
  couponRes,
  bookingMode,
  startDatetime,
  endDatetime,
}: {
  couponRes: CouponResponse | ValidateCouponResult | null
  bookingMode: 'seat' | 'event' | 'room'
  startDatetime: string // YYYY-MM-DD HH:mm
  endDatetime: string // YYYY-MM-DD HH:mm
}): ValidationResult => {
  console.log('couponRes', couponRes)
  if (!couponRes || couponRes === ValidateCouponRes.WRONG) {
    return {
      isValid: false,
      errorKey: ValidateCouponRes.WRONG,
    }
  }

  if (couponRes === ValidateCouponRes.USED) {
    return {
      isValid: false,
      errorKey: ValidateCouponRes.USED,
    }
  }

  if (couponRes === ValidateCouponRes.NO_PHONE) {
    return {
      isValid: false,
      errorKey: 'noPhone',
    }
  }

  if (couponRes === ValidateCouponRes.LIMITED) {
    return {
      isValid: false,
      errorKey: ValidateCouponRes.LIMITED,
    }
  }

  if (couponRes === ValidateCouponRes.BLOCKED) {
    return {
      isValid: false,
      errorKey: ValidateCouponRes.BLOCKED,
    }
  }

  // 折時數優惠券不適用於座位和活動模式
  if (
    typeof couponRes === 'object' &&
    couponRes.type === CouponTypeEnum.REDUCE_HOURS &&
    ['seat', 'event'].includes(bookingMode)
  ) {
    return {
      isValid: false,
      errorKey: 'not-available-at-seat-or-event',
    }
  }

  // 時段檢查
  if (typeof couponRes === 'object' && couponRes.duration && couponRes.duration !== 'None') {
    const isBetweenDuration = isWithinDuration({
      startDatetime,
      endDatetime,
      duration:
        typeof couponRes.duration === 'string' ? { start: '', end: '' } : couponRes.duration,
    })

    if (!isBetweenDuration) {
      return {
        isValid: false,
        errorKey: 'not-available',
      }
    }
  }

  return { isValid: true }
}

// ============ Discount Calculation ============
export function getCouponDiscount({
  type,
  params,
  couponUse,
  totalPrice,
  bookedPriceList,
  bookedUnit,
}: {
  type: CouponType
  params: number
  couponUse: number
  totalPrice: number
  bookedPriceList: PriceListItem[]
  bookedUnit: number
}): number {
  if (type === CouponTypeEnum.FREE) return totalPrice

  if (type === CouponTypeEnum.DISCOUNT) {
    const totalPriceBig = Big(totalPrice)
    const discount = Big(params).div(10)
    return Math.floor(Number(totalPriceBig.times(Big(1).sub(discount)).valueOf()))
  }

  if (type === CouponTypeEnum.REDUCE_PRICE) return +params * +couponUse

  if (type === CouponTypeEnum.REDUCE_HOURS) {
    const discountTotalUnit = params * couponUse
    const sortedPriceList = cloneDeep(bookedPriceList).sort(
      (a: PriceListItem, b: PriceListItem) => a.price - b.price,
    )

    if (bookedUnit <= discountTotalUnit) {
      return bookedPriceList.reduce(
        (acc: number, cur: PriceListItem) => acc + cur.total,
        0,
      ) /* 僅折抵掉方案費用*/
    }

    const unitStairs = sortedPriceList.map(
      (item: PriceListItem, idx: number, arr: PriceListItem[]) => {
        const sum = arr
          .map((item: PriceListItem) => +item.unit)
          .slice(0, idx + 1)
          .reduce((acc: number, cur: number) => acc + cur, 0)
        const last = sum - couponUse * params
        return {
          ...item,
          last,
          sum,
        }
      },
    )

    let discountPrice = 0
    let remainingDiscountUnits = discountTotalUnit

    for (let i = 0; i < unitStairs.length; i++) {
      const item = unitStairs[i]

      if (remainingDiscountUnits <= 0) break

      const currentDiscountUnit = Math.min(remainingDiscountUnits, item.unit)
      remainingDiscountUnits -= currentDiscountUnit
      discountPrice += currentDiscountUnit * item.price
    }

    return discountPrice
  }

  return totalPrice
}

// ============ Coupon Info Processing ============
export function getCouponInfo(type: CouponType, content: string | number = 0): CouponInfo {
  switch (type) {
    case CouponTypeEnum.FREE:
      return {
        type: CouponTypeEnum.FREE,
        textKey: 'free',
        params: 0,
      }
    case CouponTypeEnum.DISCOUNT: {
      const contentStr = String(content)
      return {
        type: CouponTypeEnum.DISCOUNT,
        textKey: 'discount',
        params: +contentStr.padEnd(2, '0') / 10,
      }
    }
    case CouponTypeEnum.REDUCE_PRICE:
      return {
        type: CouponTypeEnum.REDUCE_PRICE,
        textKey: 'reduce-price',
        params: +content,
      }
    case CouponTypeEnum.REDUCE_HOURS:
      return {
        type: CouponTypeEnum.REDUCE_HOURS,
        textKey: 'reduce-hours',
        params: +content / 10,
      }
    default:
      return {
        type: '',
        textKey: '',
        params: 0,
      }
  }
}

export function getCouponMaxUse({
  couponInfo,
  totalPrice,
  bookedUnit,
  remain,
  isRepeatable,
}: {
  couponInfo: CouponInfo
  totalPrice: number
  bookedUnit: number
  remain: number
  isRepeatable: boolean
}): number {
  if (!isRepeatable) return 1

  const { type, params } = couponInfo

  // 折價(可多次使用)
  if (type === CouponTypeEnum.REDUCE_PRICE) {
    const max = Math.ceil(totalPrice / params)
    return max < remain ? max : remain
  }

  // 折時數(可多次使用)
  if (type === CouponTypeEnum.REDUCE_HOURS) {
    const max = Math.ceil(+bookedUnit.toFixed(5) / params)
    return max < remain ? max : remain
  }

  // 整單免費 & 打折 & 折價(不可多次使用)
  return 1
}

export function couponProcessor({
  type,
  content,
  quantity,
  repeatable,
  phone,
  totalPrice,
  bookedUnit,
}: {
  type: CouponType
  content: string
  quantity: string
  repeatable: string
  phone?: string
  totalPrice: number
  bookedUnit: number
}): CouponData {
  const couponInfo = getCouponInfo(type, content)
  const remain = quantity === 'None' ? 9999999 : +quantity
  const isRepeatable = repeatable === '1'
  const maxUse = getCouponMaxUse({
    couponInfo,
    totalPrice,
    bookedUnit,
    remain,
    isRepeatable,
  })

  return {
    ...couponInfo,
    maxUse,
    isRepeatable,
    couponUse: maxUse,
    remain: remain || 1,
    isBindPhone: phone === '1',
  }
}
