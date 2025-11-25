<script setup lang="ts">
import isCreditCard from 'validator/es/lib/isCreditCard'
import { computed, ref, watchEffect } from 'vue'

const props = withDefaults(
  defineProps<{
    disabled?: boolean
    yearRange?: number
    cardNumberErrorMessage?: string
    cvvErrorMessage?: string
    showValidation?: boolean
  }>(),
  {
    disabled: false,
    yearRange: 10,
    cardNumberErrorMessage: '卡號格式不正確，請檢查卡號是否有效',
    cvvErrorMessage: 'CVV格式不正確，請輸入3-4位數字',
    showValidation: true,
  },
)

const cardInfo = defineModel<{
  cardNumber: {
    val: string
    isError: boolean
  }
  expiryMonth: {
    val: string
    isError: boolean
  }
  expiryYear: {
    val: string
    isError: boolean
  }
  cvv: {
    val: string
    isError: boolean
  }
}>({
  default: () => ({
    cardNumber: {
      val: '',
      isError: false,
    },
    expiryMonth: {
      val: '',
      isError: false,
    },
    expiryYear: {
      val: '',
      isError: false,
    },
    cvv: {
      val: '',
      isError: false,
    },
  }),
})

const cardNumberMaxLength = ref(23)
const cardNumberPlaceholder = ref('XXXX XXXX XXXX XXXX')

const yearOptions = computed(() => {
  const currentYear = new Date().getFullYear()
  return Array.from({ length: props.yearRange + 1 }, (_, i) => ({
    value: (currentYear + i).toString(),
    text: (currentYear + i).toString(),
  }))
})

const monthOptions = computed(() => {
  return Array.from({ length: 12 }, (_, i) => {
    const month = (i + 1).toString().padStart(2, '0')
    return {
      value: month,
      text: month,
    }
  })
})

interface CardFormat {
  type: string
  blocks: number[] // 例如: [4, 6, 5] 對應 XXXX XXXXXX XXXXX
  maxLength: number
}

const CARD_FORMATS: CardFormat[] = [
  {
    type: 'American Express',
    blocks: [4, 6, 5],
    maxLength: 15,
  }, // 15 位卡號
  {
    type: 'Diners Club',
    blocks: [4, 6, 4],
    maxLength: 14,
  }, // 14 位卡號
  {
    type: 'Standard 19-Digit',
    blocks: [4, 4, 4, 4, 3],
    maxLength: 19,
  }, // 19 位卡號 (例如部分 Visa)
  {
    type: 'Standard',
    blocks: [4, 4, 4, 4],
    maxLength: 16,
  }, // 13/16 位卡號 (Visa, MC, Discover, JCP)
]

/**
 * 根據卡號決定適用的格式規則
 * @param value 純數字卡號字串
 * @returns 格式塊陣列 (blocks) 和最大長度
 */
const getCardFormat = (value: string): CardFormat => {
  if (value.startsWith('34') || value.startsWith('37')) {
    return CARD_FORMATS.find((f) => f.type === 'American Express')!
  }
  if (value.startsWith('30') || value.startsWith('36') || value.startsWith('38')) {
    return CARD_FORMATS.find((f) => f.type === 'Diners Club')!
  }

  // 檢查 16 位時是否已經是合法卡號
  if (value.length === 16 && isCreditCard(value)) {
    return CARD_FORMATS.find((f) => f.type === 'Standard')!
  }

  // 處理非標準長度的 Standard 卡 (例如 19 位)
  if (value.length >= 16) {
    return CARD_FORMATS.find((f) => f.type === 'Standard 19-Digit')!
  }

  // 預設為標準 4-4-4-4 格式 (包含 13/16 位卡)
  return CARD_FORMATS.find((f) => f.type === 'Standard')!
}

const applyBlockFormat = (value: string, blocks: number[]): string => {
  let formatted = ''
  let index = 0

  for (const size of blocks) {
    if (index < value.length) {
      const block = value.substring(index, index + size)
      formatted += block
      index += size

      // 在塊後面添加空格，除非是最後一個塊或字串已經結束
      if (index < value.length) {
        formatted += ' '
      }
    } else {
      break // 字串已完全處理完畢
    }
  }
  return formatted
}

// 根據卡號類型決定空格位置
const formatCardNumber = (event: Event) => {
  const input = event.target as HTMLInputElement

  // 1. 清理輸入：只保留數字
  let value = input.value.replace(/\D/g, '')

  // 2. 獲取格式規則
  const { blocks, maxLength } = getCardFormat(value)

  // 3. 限制最大長度（純數字）
  if (value.length > maxLength) {
    value = value.substring(0, maxLength)
  }

  // 4. 應用格式
  const formattedValue = applyBlockFormat(value, blocks)

  // 5. 更新 maxlength（格式化後的長度，包含空格）
  cardNumberMaxLength.value = maxLength + blocks.length - 1

  // 6. 更新 placeholder
  cardNumberPlaceholder.value = applyBlockFormat('X'.repeat(maxLength), blocks)

  cardInfo.value.cardNumber.val = formattedValue
}

const formatCVV = (event: Event) => {
  const input = event.target as HTMLInputElement
  let value = input.value.replace(/\D/g, '') // 移除非數字字元
  if (value.length > 4) value = value.substring(0, 4) // 限制長度
  cardInfo.value.cvv.val = value
}

const isCardNumberValid = computed(() => {
  const cleanCardNumber = cardInfo.value.cardNumber.val.replace(/\s/g, '')
  return isCreditCard(cleanCardNumber)
})

const isCVVValid = computed(() => {
  const cvv = cardInfo.value.cvv.val
  return cvv.length >= 3 && cvv.length <= 4 && /^\d+$/.test(cvv)
})

const showCardNumberError = computed(() => {
  return (
    props.showValidation && cardInfo.value.cardNumber.val.length > 0 && !isCardNumberValid.value
  )
})

const showCVVError = computed(() => {
  return props.showValidation && cardInfo.value.cvv.val.length > 0 && !isCVVValid.value
})

watchEffect(() => {
  cardInfo.value.cardNumber.isError = showCardNumberError.value
})

watchEffect(() => {
  cardInfo.value.cvv.isError = showCVVError.value
})

defineOptions({
  name: 'CreditCardInfo',
})
</script>

<template>
  <div class="mx-auto max-w-md space-y-4">
    <!-- 卡號輸入框 -->
    <div>
      <label
        for="credit-card-info__card-number"
        class="mb-1 block text-sm font-medium text-gray-700"
      >
        卡號 Card Number *
      </label>
      <input
        id="credit-card-info__card-number"
        v-model="cardInfo.cardNumber.val"
        type="text"
        :placeholder="cardNumberPlaceholder"
        :maxlength="cardNumberMaxLength"
        :class="[
          'w-full rounded-md border px-3 py-2 text-sm focus:ring-1 focus:outline-none',
          showCardNumberError
            ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500',
        ]"
        :disabled="disabled"
        @input="formatCardNumber"
      />

      <p v-if="showCardNumberError" class="mt-1 text-sm text-red-600">
        {{ cardNumberErrorMessage }}
      </p>
    </div>

    <!-- 有效期限 -->
    <div class="flex gap-4">
      <div class="flex-1">
        <label
          for="credit-card-info__expiry-month"
          class="mb-1 block text-sm font-medium text-gray-700"
        >
          有效月 Month *
        </label>
        <select
          id="credit-card-info__expiry-month"
          v-model="cardInfo.expiryMonth.val"
          class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          :disabled="disabled"
        >
          <option value="" disabled>選擇月份</option>
          <option v-for="option in monthOptions" :key="option.value" :value="option.value">
            {{ option.text }}
          </option>
        </select>
      </div>

      <div class="flex-1">
        <label
          for="credit-card-info__expiry-year"
          class="mb-1 block text-sm font-medium text-gray-700"
        >
          有效年 Year *
        </label>
        <select
          id="credit-card-info__expiry-year"
          v-model="cardInfo.expiryYear.val"
          class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          :disabled="disabled"
        >
          <option value="" disabled>選擇年份</option>
          <option v-for="option in yearOptions" :key="option.value" :value="option.value">
            {{ option.text }}
          </option>
        </select>
      </div>
    </div>

    <!-- CVV 驗證碼 -->
    <div>
      <label for="credit-card-info__cvv" class="mb-1 block text-sm font-medium text-gray-700">
        驗證碼 CVV *
      </label>
      <input
        id="credit-card-info__cvv"
        v-model="cardInfo.cvv.val"
        type="text"
        placeholder="123"
        maxlength="4"
        :class="[
          'w-full rounded-md border px-3 py-2 text-sm focus:ring-1 focus:outline-none',
          showCVVError
            ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500',
        ]"
        :disabled="disabled"
        @input="formatCVV"
      />
      <!-- CVV錯誤訊息 -->
      <p v-if="showCVVError" class="mt-1 text-sm text-red-600">
        {{ cvvErrorMessage }}
      </p>
    </div>
  </div>
</template>
