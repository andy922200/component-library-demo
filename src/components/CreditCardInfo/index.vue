<script setup lang="ts">
import isCreditCard from 'validator/es/lib/isCreditCard'
import { computed, ref, watch, watchEffect } from 'vue'

import type { CardFormat } from '@/components/CreditCardInfo/type'
import { AVAILABLE_CARD_FORMATS } from '@/components/CreditCardInfo/type'

const props = withDefaults(
  defineProps<{
    disabled?: boolean
    yearRange?: number
    cardNumberErrorMessage?: string
    cvvErrorMessage?: string
    showValidation?: boolean
    allowedCardFormats?: CardFormat[]
    bypassCardNumbers?: string[]
  }>(),
  {
    disabled: false,
    yearRange: 10,
    cardNumberErrorMessage: '卡號格式不正確，請檢查卡號是否有效',
    cvvErrorMessage: 'CVV格式不正確',
    showValidation: true,
    allowedCardFormats: () => [AVAILABLE_CARD_FORMATS.STANDARD],
    bypassCardNumbers: () => [],
  },
)

const cardNumber = defineModel<{
  val: string
  isError: boolean
  errMsg: string
}>('cardNumber', {
  required: true,
  default: () => ({ val: '', isError: false, errMsg: '' }),
})

const expiryMonth = defineModel<{
  val: string
  isError: boolean
  errMsg: string
}>('expiryMonth', {
  required: true,
  default: () => ({ val: '', isError: false, errMsg: '' }),
})

const expiryYear = defineModel<{
  val: string
  isError: boolean
  errMsg: string
}>('expiryYear', {
  required: true,
  default: () => ({ val: '', isError: false, errMsg: '' }),
})

const cvv = defineModel<{
  val: string
  isError: boolean
  errMsg: string
}>('cvv', {
  required: true,
  default: () => ({ val: '', isError: false, errMsg: '' }),
})

const currentCardFormat = ref<CardFormat>(
  props.allowedCardFormats[0] ?? AVAILABLE_CARD_FORMATS.STANDARD,
)
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

const getCardFormat = (value: string): CardFormat => {
  const formats = props.allowedCardFormats

  // American Express (34xx, 37xx)
  if (value.startsWith('34') || value.startsWith('37')) {
    const amex = formats.find((f) => f.type === 'American Express')
    if (amex) return amex
  }

  // Diners Club (30xx, 36xx, 38xx)
  if (value.startsWith('30') || value.startsWith('36') || value.startsWith('38')) {
    const diners = formats.find((f) => f.type === 'Diners Club')
    if (diners) return diners
  }

  // Standard 16-digit
  if (value.length === 16 && isCreditCard(value)) {
    const standard = formats.find((f) => f.type === 'Standard')
    if (standard) return standard
  }

  // Standard 19-digit
  if (value.length >= 16) {
    const standard19 = formats.find((f) => f.type === 'Standard 19-Digit')
    if (standard19) return standard19
  }

  return formats[0] ?? AVAILABLE_CARD_FORMATS.STANDARD
}

const applyBlockFormat = (value: string, blocks: number[]): string => {
  let formatted = ''
  let index = 0
  for (const size of blocks) {
    if (index < value.length) {
      const block = value.substring(index, index + size)
      formatted += block
      index += size
      if (index < value.length) {
        formatted += ' '
      }
    } else {
      break
    }
  }
  return formatted
}

const formatCardNumber = (event: Event) => {
  const input = event.target as HTMLInputElement
  let value = input.value.replace(/\D/g, '')

  const cardFormat = getCardFormat(value)
  currentCardFormat.value = cardFormat

  const { blocks, maxLength } = cardFormat
  if (value.length > maxLength) {
    value = value.substring(0, maxLength)
  }
  const formattedValue = applyBlockFormat(value, blocks)

  cardNumberMaxLength.value = maxLength + blocks.length - 1
  cardNumberPlaceholder.value = applyBlockFormat('X'.repeat(maxLength), blocks)
  cardNumber.value.val = formattedValue
}

const cvvMaxLength = computed(() => currentCardFormat.value.cvvLength)
const cvvPlaceholder = computed(() => currentCardFormat.value.cvvPlaceholder || '123')

const formatCVV = (event: Event) => {
  const input = event.target as HTMLInputElement
  let value = input.value.replace(/\D/g, '')
  if (value.length > cvvMaxLength.value) value = value.substring(0, cvvMaxLength.value)
  cvv.value.val = value
}

const isCardNumberBypassed = computed(() => {
  const cleanCardNumber = cardNumber.value.val.replace(/\s/g, '')
  return props.bypassCardNumbers.includes(cleanCardNumber)
})

const isCardNumberValid = computed(() => {
  if (isCardNumberBypassed.value) return true
  const cleanCardNumber = cardNumber.value.val.replace(/\s/g, '')
  return isCreditCard(cleanCardNumber)
})

const isCVVValid = computed(() => {
  const cvvValue = cvv.value.val
  const expectedLength = cvvMaxLength.value
  return cvvValue.length === expectedLength && /^\d+$/.test(cvvValue)
})

const showCardNumberError = computed(() => {
  // 如果為空但外部標記錯誤，那就顯示
  if (cardNumber.value.val.length === 0 && cardNumber.value.isError) {
    return true
  }
  // 有輸入，檢查格式
  return props.showValidation && cardNumber.value.val.length > 0 && !isCardNumberValid.value
})

const showCVVError = computed(() => {
  // 如果為空但外部標記錯誤，那就顯示
  if (cvv.value.val.length === 0 && cvv.value.isError) {
    return true
  }
  // 有輸入，檢查格式
  return props.showValidation && cvv.value.val.length > 0 && !isCVVValid.value
})

watchEffect(() => {
  cardNumber.value.isError = showCardNumberError.value
  if (!showCardNumberError.value) {
    cardNumber.value.errMsg = ''
  }
})

watchEffect(() => {
  cvv.value.isError = showCVVError.value
  if (!showCVVError.value) {
    cvv.value.errMsg = ''
  }
})

// 當用戶選擇月份時，清除該欄位的錯誤
watch(
  () => expiryMonth.value.val,
  (val) => {
    if (val !== '') {
      expiryMonth.value.isError = false
      expiryMonth.value.errMsg = ''
    }
  },
)

// 當用戶選擇年份時，清除該欄位的錯誤
watch(
  () => expiryYear.value.val,
  (val) => {
    if (val !== '') {
      expiryYear.value.isError = false
      expiryYear.value.errMsg = ''
    }
  },
)

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
        v-model="cardNumber.val"
        type="text"
        inputmode="numeric"
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
          v-model="expiryMonth.val"
          :class="[
            'w-full rounded-md border px-3 py-2 text-sm focus:ring-1 focus:outline-none',
            expiryMonth.isError
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500',
          ]"
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
          v-model="expiryYear.val"
          :class="[
            'w-full rounded-md border px-3 py-2 text-sm focus:ring-1 focus:outline-none',
            expiryYear.isError
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500',
          ]"
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
        v-model="cvv.val"
        type="text"
        inputmode="numeric"
        :placeholder="cvvPlaceholder"
        :maxlength="cvvMaxLength"
        :class="[
          'w-full rounded-md border px-3 py-2 text-sm focus:ring-1 focus:outline-none',
          showCVVError
            ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500',
        ]"
        :disabled="disabled"
        @input="formatCVV"
      />
      <p v-if="showCVVError" class="mt-1 text-sm text-red-600">
        {{ cvvErrorMessage }}
      </p>
    </div>
  </div>
</template>
