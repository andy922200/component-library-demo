// ============ Coupon Types ============
export interface CouponInfo {
  type: CouponType // 優惠券類型
  textKey: string // 多語系文字 Key
  params: number // 根據 type 決定的值
}

export interface CouponData extends CouponInfo {
  isRepeatable: boolean // 是否可重複使用
  remain: number // 仍有幾張可用
  maxUse: number // 最多可用幾張
  couponUse: number // 本次使用幾張
  isBindPhone: boolean // 是否綁定手機
}

export interface PriceListItem {
  price: number // 單價
  unit: number // 小時數或數量
  total: number // 小計
}

// ============ Enums ============
export enum CouponStateEnum {
  INITIAL = 'initial',
  CAN_APPLY = 'canApply',
  NO_PHONE = 'noPhone',
  NOT_FOUND = 'notFound',
  APPLIED = 'applied',
  INVALID = 'invalid',
}
export type CouponState = `${CouponStateEnum}`

export enum ValidateCouponRes {
  WRONG = 'wrong',
  USED = 'used',
  NO_PHONE = 'nophone',
  LIMITED = 'limited',
  BLOCKED = 'blocked',
}
export type ValidateCouponResult = `${ValidateCouponRes}`

export enum CouponTypeEnum {
  FREE = 'free', // 0
  DISCOUNT = 'discount', // 1
  REDUCE_PRICE = 'reducePrice', // 2
  REDUCE_HOURS = 'reduceHours', // 3
}
export type CouponType = `${CouponTypeEnum}` | ''

export const couponTypeNumberMap: Record<number, CouponTypeEnum> = {
  0: CouponTypeEnum.FREE,
  1: CouponTypeEnum.DISCOUNT,
  2: CouponTypeEnum.REDUCE_PRICE,
  3: CouponTypeEnum.REDUCE_HOURS,
}

export const couponTypeStringMap = Object.fromEntries(
  Object.entries(couponTypeNumberMap).map(([key, value]) => [value, Number(key)]),
) as Record<CouponTypeEnum, number>

// ============ Validation ============
export interface ValidationResult {
  isValid: boolean
  errorKey?: string
}
