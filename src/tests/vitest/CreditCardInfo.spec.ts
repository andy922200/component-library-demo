import { mount, VueWrapper } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'

import CreditCardInfo from '@/components/CreditCardInfo/index.vue'

describe('CreditCardInfo', () => {
  let wrapper: VueWrapper<any>

  beforeEach(() => {
    wrapper = mount(CreditCardInfo, {
      props: {
        modelValue: {
          cardNumber: { val: '', isError: false },
          expiryMonth: { val: '', isError: false },
          expiryYear: { val: '', isError: false },
          cvv: { val: '', isError: false },
        },
      },
    })
  })

  describe('卡號格式化', () => {
    it('應該正確格式化標準 16 位卡號 (4-4-4-4)', async () => {
      const input = wrapper.find('#credit-card-info__card-number')
      await input.setValue('4111111111111111')

      expect(wrapper.vm.cardInfo.cardNumber.val).toBe('4111 1111 1111 1111')
    })

    it('應該正確格式化 American Express 15 位卡號 (4-6-5)', async () => {
      const input = wrapper.find('#credit-card-info__card-number')
      await input.setValue('378282246310005')

      expect(wrapper.vm.cardInfo.cardNumber.val).toBe('3782 822463 10005')
    })

    it('應該正確格式化 Diners Club 14 位卡號 (4-6-4)', async () => {
      const input = wrapper.find('#credit-card-info__card-number')
      await input.setValue('30569309025904')

      expect(wrapper.vm.cardInfo.cardNumber.val).toBe('3056 930902 5904')
    })

    it('應該正確格式化 19 位卡號 (4-4-4-4-3)', async () => {
      const input = wrapper.find('#credit-card-info__card-number')
      await input.setValue('1234567890123456789')

      expect(wrapper.vm.cardInfo.cardNumber.val).toBe('1234 5678 9012 3456 789')
    })

    it('應該移除非數字字元', async () => {
      const input = wrapper.find('#credit-card-info__card-number')
      await input.setValue('4111-1111-1111-1111')

      expect(wrapper.vm.cardInfo.cardNumber.val).toBe('4111 1111 1111 1111')
    })

    it('當 16 位是有效卡號時，應該限制在 16 位', async () => {
      const input = wrapper.find('#credit-card-info__card-number')
      await input.setValue('4311465606406131')

      expect(wrapper.vm.cardInfo.cardNumber.val).toBe('4311 4656 0640 6131')
    })
  })

  describe('卡號驗證', () => {
    it('應該驗證有效的 Visa 卡號', async () => {
      const input = wrapper.find('#credit-card-info__card-number')
      await input.setValue('4111111111111111')

      expect(wrapper.vm.isCardNumberValid).toBe(true)
      expect(wrapper.vm.showCardNumberError).toBe(false)
    })

    it('應該驗證有效的 MasterCard 卡號', async () => {
      const input = wrapper.find('#credit-card-info__card-number')
      await input.setValue('5555555555554444')

      expect(wrapper.vm.isCardNumberValid).toBe(true)
    })

    it('應該驗證有效的 American Express 卡號', async () => {
      const input = wrapper.find('#credit-card-info__card-number')
      await input.setValue('378282246310005')

      expect(wrapper.vm.isCardNumberValid).toBe(true)
    })

    it('應該拒絕無效的卡號', async () => {
      const input = wrapper.find('#credit-card-info__card-number')
      await input.setValue('1234567890123456')

      expect(wrapper.vm.isCardNumberValid).toBe(false)
    })

    it('當 showValidation 為 true 且卡號無效時，應該顯示錯誤訊息', async () => {
      await wrapper.setProps({ showValidation: true })
      const input = wrapper.find('#credit-card-info__card-number')
      await input.setValue('1234567890123456')

      expect(wrapper.vm.showCardNumberError).toBe(true)
      expect(wrapper.find('.text-red-600').text()).toBe('卡號格式不正確，請檢查卡號是否有效')
    })

    it('當 showValidation 為 false 時，不應該顯示錯誤訊息', async () => {
      await wrapper.setProps({ showValidation: false })
      const input = wrapper.find('#credit-card-info__card-number')
      await input.setValue('1234567890123456')

      expect(wrapper.vm.showCardNumberError).toBe(false)
    })
  })

  describe('CVV 驗證', () => {
    it('應該只接受數字', async () => {
      const input = wrapper.find('#credit-card-info__cvv')
      await input.setValue('12a3')

      expect(wrapper.vm.cardInfo.cvv.val).toBe('123')
    })

    it('應該限制最大長度為 4', async () => {
      const input = wrapper.find('#credit-card-info__cvv')
      await input.setValue('12345')

      expect(wrapper.vm.cardInfo.cvv.val).toBe('1234')
    })

    it('應該驗證有效的 3 位 CVV', async () => {
      const input = wrapper.find('#credit-card-info__cvv')
      await input.setValue('123')

      expect(wrapper.vm.isCVVValid).toBe(true)
    })

    it('應該驗證有效的 4 位 CVV', async () => {
      const input = wrapper.find('#credit-card-info__cvv')
      await input.setValue('1234')

      expect(wrapper.vm.isCVVValid).toBe(true)
    })

    it('應該拒絕少於 3 位的 CVV', async () => {
      const input = wrapper.find('#credit-card-info__cvv')
      await input.setValue('12')

      expect(wrapper.vm.isCVVValid).toBe(false)
    })

    it('當 CVV 無效時，應該顯示錯誤訊息', async () => {
      await wrapper.setProps({ showValidation: true })
      const input = wrapper.find('#credit-card-info__cvv')
      await input.setValue('12')

      expect(wrapper.vm.showCVVError).toBe(true)
    })
  })

  describe('有效期限', () => {
    it('應該生成正確的月份選項 (01-12)', () => {
      const monthSelect = wrapper.find('#credit-card-info__expiry-month')
      const options = monthSelect.findAll('option')

      // 包含 "選擇月份" 選項
      expect(options).toHaveLength(13)
      expect(options[1].text()).toBe('01')
      expect(options[12].text()).toBe('12')
    })

    it('應該生成正確的年份選項 (當前年份 + yearRange)', async () => {
      const currentYear = new Date().getFullYear()
      await wrapper.setProps({ yearRange: 10 })

      const yearSelect = wrapper.find('#credit-card-info__expiry-year')
      const options = yearSelect.findAll('option')

      // 包含 "選擇年份" 選項
      expect(options).toHaveLength(12) // 1 預設選項 + 11 年份 (當前年 + 10年)
      expect(options[1].text()).toBe(currentYear.toString())
      expect(options[11].text()).toBe((currentYear + 10).toString())
    })

    it('應該能選擇月份', async () => {
      const monthSelect = wrapper.find('#credit-card-info__expiry-month')
      await monthSelect.setValue('05')

      expect(wrapper.vm.cardInfo.expiryMonth.val).toBe('05')
    })

    it('應該能選擇年份', async () => {
      const currentYear = new Date().getFullYear()
      const yearSelect = wrapper.find('#credit-card-info__expiry-year')
      await yearSelect.setValue(currentYear.toString())

      expect(wrapper.vm.cardInfo.expiryYear.val).toBe(currentYear.toString())
    })
  })

  describe('Disabled 狀態', () => {
    it('當 disabled 為 true 時，所有輸入框應該被禁用', async () => {
      await wrapper.setProps({ disabled: true })

      const cardNumberInput = wrapper.find('#credit-card-info__card-number')
      const cvvInput = wrapper.find('#credit-card-info__cvv')
      const monthSelect = wrapper.find('#credit-card-info__expiry-month')
      const yearSelect = wrapper.find('#credit-card-info__expiry-year')

      expect(cardNumberInput.attributes('disabled')).toBeDefined()
      expect(cvvInput.attributes('disabled')).toBeDefined()
      expect(monthSelect.attributes('disabled')).toBeDefined()
      expect(yearSelect.attributes('disabled')).toBeDefined()
    })
  })

  describe('動態 maxLength 和 placeholder', () => {
    it('標準卡號的 maxLength 應該是 19 (16 + 3 空格)', async () => {
      const input = wrapper.find('#credit-card-info__card-number')
      await input.setValue('4111')

      expect(wrapper.vm.cardNumberMaxLength).toBe(19)
    })

    it('American Express 的 maxLength 應該是 17 (15 + 2 空格)', async () => {
      const input = wrapper.find('#credit-card-info__card-number')
      await input.setValue('3782')

      expect(wrapper.vm.cardNumberMaxLength).toBe(17)
    })

    it('placeholder 應該隨卡號類型動態更新', async () => {
      const input = wrapper.find('#credit-card-info__card-number')

      // American Express
      await input.setValue('3782')
      expect(wrapper.vm.cardNumberPlaceholder).toBe('XXXX XXXXXX XXXXX')

      // 標準卡號
      await input.setValue('4111')
      expect(wrapper.vm.cardNumberPlaceholder).toBe('XXXX XXXX XXXX XXXX')
    })
  })

  describe('自訂錯誤訊息', () => {
    it('應該顯示自訂的卡號錯誤訊息', async () => {
      const customMessage = '自訂的卡號錯誤訊息'
      await wrapper.setProps({
        showValidation: true,
        cardNumberErrorMessage: customMessage,
      })

      const input = wrapper.find('#credit-card-info__card-number')
      await input.setValue('1234567890123456')

      expect(wrapper.find('.text-red-600').text()).toBe(customMessage)
    })

    it('應該顯示自訂的 CVV 錯誤訊息', async () => {
      const customMessage = '自訂的 CVV 錯誤訊息'
      await wrapper.setProps({
        showValidation: true,
        cvvErrorMessage: customMessage,
      })

      const input = wrapper.find('#credit-card-info__cvv')
      await input.setValue('12')

      const errorMessages = wrapper.findAll('.text-red-600')
      expect(errorMessages[errorMessages.length - 1].text()).toBe(customMessage)
    })
  })
})
