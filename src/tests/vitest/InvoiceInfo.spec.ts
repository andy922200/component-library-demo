import { mount, VueWrapper } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'

import BaseInput from '@/components/BaseInput/index.vue'
import InvoiceInfo from '@/components/InvoiceInfo/index.vue'
import type { InvoiceData } from '@/components/InvoiceInfo/invoice-setting'
import { InvoiceCategory } from '@/components/InvoiceInfo/invoice-setting'

describe('InvoiceInfo', () => {
  let wrapper: VueWrapper<any>

  const defaultProps = {
    price: 100,
    hasEInvoice: true,
    hasManualInvoice: true,
    isDisabled: false,
  }

  beforeEach(() => {
    wrapper = mount(InvoiceInfo, {
      props: defaultProps,
    })
  })

  describe('基本渲染', () => {
    it('應該正確渲染發票類型選擇器', () => {
      const select = wrapper.find('#invoice-type')
      expect(select.exists()).toBe(true)

      const options = wrapper.findAll('option')
      expect(options.length).toBeGreaterThan(0)
    })

    it('當 noInvoice 為 true 時應該顯示免開發票', async () => {
      await wrapper.setProps({ hasEInvoice: false, hasManualInvoice: false })

      expect(wrapper.text()).toContain('免開發票 No Invoice')
    })
  })

  describe('發票類型切換', () => {
    it('選擇會員載具時應該顯示說明文字', async () => {
      const select = wrapper.find('#invoice-type')
      await select.setValue(InvoiceCategory.MEMBER)

      expect(wrapper.text()).toContain('系統將自動發信至信箱')
    })

    it('選擇捐贈時應該顯示捐贈說明', async () => {
      const select = wrapper.find('#invoice-type')
      await select.setValue(InvoiceCategory.DONATE)

      expect(wrapper.text()).toContain('將捐贈給協會')
    })

    it('選擇手機載具時應該顯示載具號碼輸入欄', async () => {
      const select = wrapper.find('#invoice-type')
      await select.setValue(InvoiceCategory.MOBILE_BARCODE)

      const mobileInput = wrapper.find('#mobile-id')
      expect(mobileInput.exists()).toBe(true)
    })

    it('選擇自然人憑證時應該顯示憑證號碼輸入欄', async () => {
      const select = wrapper.find('#invoice-type')
      await select.setValue(InvoiceCategory.DIGITAL_CERTIFICATE)

      const certificateInput = wrapper.find('#citizen-id')
      expect(certificateInput.exists()).toBe(true)
    })

    it('選擇公司發票時應該顯示公司名稱和統編輸入欄', async () => {
      const select = wrapper.find('#invoice-type')
      await select.setValue(InvoiceCategory.COMPANY_INVOICE)

      const companyNameInput = wrapper.find('#company-name')
      const companyIdInput = wrapper.find('#company-id')

      expect(companyNameInput.exists()).toBe(true)
      expect(companyIdInput.exists()).toBe(true)
    })

    it('選擇需要地址的發票類型時應該顯示地址輸入欄', async () => {
      const select = wrapper.find('#invoice-type')
      await select.setValue(InvoiceCategory.TRIPLICATE_UNIFORM_INVOICE)

      const addressInput = wrapper.find('#address')
      expect(addressInput.exists()).toBe(true)
    })
  })

  describe('Props 測試', () => {
    it('當 hasEInvoice 為 false 時應該只顯示紙本發票選項', async () => {
      await wrapper.setProps({ hasEInvoice: false, hasManualInvoice: true })

      const options = wrapper.findAll('option')

      const optionTexts = options.map((option: any) => option.text())

      expect(optionTexts.some((text) => text.includes('二聯式紙本發票'))).toBe(true)
      expect(optionTexts.some((text) => text.includes('三聯式紙本發票'))).toBe(true)
      expect(optionTexts.some((text) => text.includes('會員載具'))).toBe(false)
    })

    it('當 hasManualInvoice 為 false 時應該只顯示電子發票選項', async () => {
      await wrapper.setProps({ hasEInvoice: true, hasManualInvoice: false })

      const options = wrapper.findAll('option')
      const optionTexts = options.map((option: any) => option.text())

      expect(optionTexts.some((text) => text.includes('會員載具'))).toBe(true)
      expect(optionTexts.some((text) => text.includes('二聯式紙本發票'))).toBe(false)
    })

    it('當 isDisabled 為 true 時選擇器應該被禁用', async () => {
      await wrapper.setProps({ isDisabled: true })

      const select = wrapper.find('#invoice-type')
      expect(select.classes()).toContain('disabled')
    })
  })

  describe('v-model 測試', () => {
    it('應該正確接收初始 modelValue', () => {
      const testData: InvoiceData = {
        invType: { val: InvoiceCategory.MEMBER, isError: false, isDisabled: false },
        invCode: { val: 'test', isError: false, isDisabled: false },
        invTitle: { val: 'test title', isError: false, isDisabled: false },
        invAddress: { val: 'test address', isError: false, isDisabled: false },
      }

      const testWrapper = mount(InvoiceInfo, {
        props: {
          ...defaultProps,
          modelValue: testData,
          'onUpdate:modelValue': () => {},
        },
      })

      expect(testWrapper.vm.invoiceData.invType.val).toBe(InvoiceCategory.MEMBER)
      expect(testWrapper.vm.invoiceData.invCode.val).toBe('test')
    })

    it('應該在發票類型改變時重置資料', async () => {
      const select = wrapper.find('#invoice-type')

      // 先切換到手機載具
      await select.setValue(InvoiceCategory.MOBILE_BARCODE)
      await nextTick()

      // 模擬用戶輸入
      const mobileInput = wrapper.find('#mobile-id')
      await mobileInput.setValue('/ABC1234')
      await nextTick()

      // 驗證資料已輸入
      expect(wrapper.vm.invoiceData.invCode.val).toBe('/ABC1234')

      // 切換發票類型到會員載具
      await select.setValue(InvoiceCategory.MEMBER)
      await nextTick()

      // 資料應該被重置
      expect(wrapper.vm.invoiceData.invCode.val).toBe('')
    })

    it('應該能夠更新 v-model 資料', async () => {
      const select = wrapper.find('#invoice-type')
      await select.setValue(InvoiceCategory.MOBILE_BARCODE)
      await nextTick()

      const mobileInput = wrapper.find('#mobile-id')
      await mobileInput.setValue('/TEST123')

      expect(wrapper.vm.invoiceData.invCode.val).toBe('/TEST123')
    })
  })

  describe('驗證功能測試', () => {
    it('應該在驗證失敗時設置錯誤狀態', async () => {
      const select = wrapper.find('#invoice-type')
      await select.setValue(InvoiceCategory.MOBILE_BARCODE)
      await nextTick()

      const baseInputs = wrapper.findAllComponents(BaseInput)
      const mobileInput = baseInputs.find((input) => input.props('id') === 'mobile-id')

      // 觸發驗證失敗
      mobileInput?.vm.$emit('validate', false)
      await nextTick()

      expect(wrapper.vm.invoiceData.invCode.isError).toBe(true)
    })

    it('應該在驗證成功時清除錯誤狀態', async () => {
      const select = wrapper.find('#invoice-type')
      await select.setValue(InvoiceCategory.MOBILE_BARCODE)
      await nextTick()

      // 先設置錯誤狀態
      wrapper.vm.invoiceData.invCode.isError = true

      const baseInputs = wrapper.findAllComponents(BaseInput)
      const mobileInput = baseInputs.find((input) => input.props('id') === 'mobile-id')

      // 觸發驗證成功
      mobileInput?.vm.$emit('validate', true)
      await nextTick()

      expect(wrapper.vm.invoiceData.invCode.isError).toBe(false)
    })
  })

  describe('計算屬性測試', () => {
    it('isFree 應該在 price 為 0 時返回 true', async () => {
      await wrapper.setProps({ price: 0 })
      expect(wrapper.vm.isFree).toBe(true)

      await wrapper.setProps({ price: 100 })
      expect(wrapper.vm.isFree).toBe(false)
    })

    it('noInvoice 應該在沒有發票選項時返回 true', async () => {
      await wrapper.setProps({ hasEInvoice: false, hasManualInvoice: false })
      expect(wrapper.vm.noInvoice).toBe(true)

      await wrapper.setProps({ hasEInvoice: true, hasManualInvoice: false })
      expect(wrapper.vm.noInvoice).toBe(false)
    })

    it('optionList 應該根據 props 返回正確的選項', async () => {
      // 測試兩種發票都有的情況
      await wrapper.setProps({ hasEInvoice: true, hasManualInvoice: true })
      expect(wrapper.vm.optionList.length).toBeGreaterThan(5)

      // 測試只有電子發票的情況
      await wrapper.setProps({ hasEInvoice: true, hasManualInvoice: false })
      const eInvoiceOptions = wrapper.vm.optionList
      expect(eInvoiceOptions.every((option: any) => !option.text.includes('紙本發票'))).toBe(true)
    })
  })

  describe('生命週期測試', () => {
    it('onMounted 時應該設置預設的發票類型', () => {
      const newWrapper = mount(InvoiceInfo, {
        props: { ...defaultProps, hasEInvoice: true },
      })

      expect(newWrapper.vm.invoiceData.invType.val).toBe(InvoiceCategory.MEMBER)
    })

    it('當 price 變為 0 時應該重置發票資料', async () => {
      const select = wrapper.find('#invoice-type')
      await select.setValue(InvoiceCategory.MOBILE_BARCODE)
      await nextTick()

      // 輸入一些資料
      const mobileInput = wrapper.find('#mobile-id')
      await mobileInput.setValue('/TEST123')
      expect(wrapper.vm.invoiceData.invCode.val).toBe('/TEST123')

      // 設置價格為 0，觸發 watch
      await wrapper.setProps({ price: 0 })
      await nextTick()

      expect(wrapper.vm.invoiceData.invCode.val).toBe('')
    })
  })
})
