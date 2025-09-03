import type { Ref } from 'vue'
import { computed, ref, watch } from 'vue'

import type { IPaymentStrategy } from '@/constants/paymentStrategies'
import { paymentStrategies as allPaymentStrategies } from '@/constants/paymentStrategies'

/**
 * @description 一個響應式的 Composable，用來根據動態的設定計算可用的付款選項。
 * @param {Ref<IPaymentStrategy>} config - 一個包含所有計算所需參數的 ref 或 computed 物件。
 * @returns {{
 * paymentOptions: ComputedRef<Array<{text: string, value: string, disabled: boolean}>>,
 * selectedPaymentType: Ref<string | null>
 * }}
 */
export function usePaymentStrategies(config: Ref<IPaymentStrategy>) {
  const paymentOptions = computed(() => {
    return allPaymentStrategies
      .filter((strategy) => strategy.isAvailable(config.value))
      .map((strategy) => {
        const value =
          strategy.value === 'credit-card'
            ? config.value.payment // 如果是信用卡，動態給予後端對應的金流 value
            : strategy.value

        return {
          text: strategy.text,
          value,
          disabled: strategy.isDisabled(config.value),
        }
      })
  })

  const selectedPaymentType = ref<string | null>(null)

  watch(
    paymentOptions,
    (newOptions) => {
      const validOptions = newOptions.filter((opt) => !opt.disabled)

      if (validOptions.length === 0) {
        selectedPaymentType.value = null
        return
      }

      const currentSelectionIsValid = validOptions.some(
        (opt) => opt.value === selectedPaymentType.value,
      )

      if (!currentSelectionIsValid) {
        selectedPaymentType.value = validOptions[0].value
      }
    },
    { immediate: true, deep: true },
  )

  return {
    paymentOptions,
    selectedPaymentType,
  }
}
