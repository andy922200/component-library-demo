import { merge } from 'lodash-es'

import { mockFetch } from '@/composables/usePromoCoupon/mockFetch'
import type { CouponType, ValidateCouponResult } from '@/composables/usePromoCoupon/types'
import { couponTypeNumberMap } from '@/composables/usePromoCoupon/types'

// ============ API Types ============
export interface FetchCouponParams {
  code: string
  ownerCode: string
  roomId: string
  planId: string
  phone: string
  dates: string[]
}

export interface CouponResponse {
  type?: string
  content?: string
  quantity?: string
  repeatable?: string
  ticket?: string
  phone?: string
  duration?:
    | {
        start: string
        end: string
      }
    | string
}

// ============ API Composable ============
/**
 * 優惠券 API 處理 - 負責與後端溝通
 */
export function useCouponAPI() {
  async function fetchCoupon(
    params: FetchCouponParams,
  ): Promise<(CouponResponse & { type: CouponType }) | ValidateCouponResult> {
    const {
      result: [rawRes],
    } = await mockFetch<CouponResponse | ValidateCouponResult>({
      url: './coupon',
      params: {
        OWNER: params.ownerCode,
        ID: params.roomId,
        COUPON: params.code,
        PHONENUM: params.phone,
        PLANID: params.planId,
        DATE: params.dates.join('='),
      },
      method: 'get',
    })

    // 如果是字串，直接返回(錯誤訊息)
    if (typeof rawRes === 'string') {
      return rawRes as ValidateCouponResult
    }

    // 轉換 type 為字串格式
    return merge({}, rawRes, {
      type: couponTypeNumberMap[Number(rawRes.type)],
    }) as CouponResponse & { type: CouponType }
  }

  return {
    fetchCoupon,
  }
}
