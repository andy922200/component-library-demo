interface FetchDataParams {
  url: string
  params: Record<string, string>
  method: 'get' | 'post'
}

interface FetchDataResult<T> {
  result: T[]
}

export async function mockFetch<T>(params: FetchDataParams): Promise<FetchDataResult<T>> {
  // 模擬 1 秒延遲
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // 根據優惠券代碼回傳不同類型的模擬資料
  const couponCode = params.params.COUPON?.toUpperCase() || ''

  // 定義各種優惠券類型的模擬回傳
  const mockCoupons: Record<string, unknown> = {
    // Type 0: 免費優惠 (Free)
    FREE: {
      type: '0',
      content: '0',
      quantity: '1',
      repeatable: '0',
      phone: '0',
      duration: { start: '00:00', end: '24:00' },
    },
    FREE2024: {
      type: '0',
      content: '0',
      quantity: 'None',
      repeatable: '0',
      phone: '0',
      duration: { start: '00:00', end: '24:00' },
    },

    // Type 1: 折扣優惠 (Discount)
    DISCOUNT85: {
      type: '1',
      content: '85',
      quantity: '10',
      repeatable: '0',
      phone: '0',
      duration: { start: '00:00', end: '24:00' },
    },
    SALE50: {
      type: '1',
      content: '5',
      quantity: '3',
      repeatable: '0',
      phone: '1', // 需要綁定電話
      duration: { start: '09:00', end: '18:00' },
    },
    VIP70: {
      type: '1',
      content: '7',
      quantity: 'None',
      repeatable: '0',
      phone: '0',
      duration: 'None',
    },

    // Type 2: 折價優惠 (Reduce Price)
    REDUCE100: {
      type: '2',
      content: '100',
      quantity: '15',
      repeatable: '1',
      phone: '0',
      duration: { start: '00:00', end: '24:00' },
    },
    SUMMER200: {
      type: '2',
      content: '200',
      quantity: '3',
      repeatable: '1',
      phone: '0',
      duration: { start: '00:00', end: '24:00' },
    },
    WELCOME50: {
      type: '2',
      content: '50',
      quantity: 'None',
      repeatable: '0',
      phone: '1',
      duration: 'None',
    },

    // Type 3: 折抵時數 (Reduce Hours)
    HALFHOUR: {
      type: '3',
      content: '5', // 5/10 = 0.5 小時
      quantity: '999',
      repeatable: '1',
      phone: '0',
      duration: { start: '00:00', end: '24:00' },
    },
    HOUR1: {
      type: '3',
      content: '10', // 10/10 = 1 小時
      quantity: '999',
      repeatable: '1',
      phone: '0',
      duration: { start: '00:00', end: '24:00' },
    },
    FREETIME2: {
      type: '3',
      content: '20', // 20/10 = 2 小時
      quantity: '999',
      repeatable: '1',
      phone: '0',
      duration: { start: '00:00', end: '24:00' },
    },
    FREETIME3: {
      type: '3',
      content: '30', // 30/10 = 3 小時
      quantity: '999',
      repeatable: '1',
      phone: '0',
      duration: { start: '00:00', end: '24:00' },
    },
    HALFDAY: {
      type: '3',
      content: '40', // 40/10 = 4 小時
      quantity: '3',
      repeatable: '0',
      phone: '1',
      duration: { start: '10:00', end: '15:00' },
    },

    // 錯誤狀態模擬
    USED2024: 'used',
    EXPIRED: 'wrong',
    NEEDPHONE: 'nophone',
    LIMIT: 'limited',
    BLOCKED: 'blocked',
  }

  // 查找對應的優惠券，如果找不到則回傳 'wrong'
  const mockResponse = (mockCoupons[couponCode] || 'wrong') as T

  return {
    result: [mockResponse],
  }
}
