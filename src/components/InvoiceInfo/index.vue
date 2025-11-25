<script setup lang="ts">
import { cloneDeep, merge } from 'lodash-es'
import { computed, onMounted, watch } from 'vue'

import BasicInput from '@/components/BaseInput/index.vue'
import type { InvoiceData, InvoiceOption } from '@/components/InvoiceInfo/invoice-setting'
import {
  allInvoiceOptions,
  companyInvoiceCategories,
  eInvoiceOptions,
  inputItemInfoMap,
  InvoiceCategory,
  invoiceDataObj,
  manualInvoiceOptions,
  needAddressCategories,
} from '@/components/InvoiceInfo/invoice-setting'

const invoiceData = defineModel<InvoiceData>({
  default: () => cloneDeep(invoiceDataObj),
})

const props = withDefaults(
  defineProps<{
    price?: number
    hasEInvoice?: boolean
    hasManualInvoice?: boolean
    isDisabled?: boolean
  }>(),
  {
    price: 0,
    hasEInvoice: true,
    hasManualInvoice: true,
    isDisabled: false,
  },
)

/** 給 Unit Test 使用 */
defineExpose({
  invoiceData,
})

const isFree = computed(() => props.price === 0)
const noInvoice = computed(() => !props.hasEInvoice && !props.hasManualInvoice)

const optionList = computed<InvoiceOption[]>(() => {
  if (props.hasEInvoice && props.hasManualInvoice) return allInvoiceOptions
  if (props.hasEInvoice) return eInvoiceOptions

  return manualInvoiceOptions
})

const detailText = computed(() => {
  if (invoiceData.value.invType.val === InvoiceCategory.MEMBER)
    return "系統將自動發信至信箱 System will send invoice to payer's email"
  if (invoiceData.value.invType.val === InvoiceCategory.DONATE)
    return '將捐贈給協會 Donate to charity'

  return ''
})

const inputFieldConfigs = computed(() => {
  const configs = []

  // 手機載具
  if (invoiceData.value.invType.val === InvoiceCategory.MOBILE_BARCODE) {
    configs.push({
      id: 'mobile-id',
      field: 'invCode' as keyof InvoiceData,
      maxLength: 8,
      ...inputItemInfoMap.carrierCode,
    })
  }

  // 自然人憑證
  if (invoiceData.value.invType.val === InvoiceCategory.DIGITAL_CERTIFICATE) {
    configs.push({
      id: 'citizen-id',
      field: 'invCode' as keyof InvoiceData,
      maxLength: 16,
      ...inputItemInfoMap.certificateNo,
    })
  }

  // 公司發票相關欄位
  if (companyInvoiceCategories.includes(invoiceData.value.invType.val)) {
    configs.push(
      {
        id: 'company-name',
        field: 'invTitle' as keyof InvoiceData,
        maxLength: Infinity,
        ...inputItemInfoMap.companyName,
      },
      {
        id: 'company-id',
        field: 'invCode' as keyof InvoiceData,
        maxLength: 8,
        ...inputItemInfoMap.taxId,
      },
    )
  }

  // 需要地址的發票類型
  if (needAddressCategories.includes(invoiceData.value.invType.val)) {
    configs.push({
      id: 'address',
      field: 'invAddress' as keyof InvoiceData,
      maxLength: 100,
      ...inputItemInfoMap.invoiceAddress,
    })
  }

  return configs
})

const typeSelectHandler = (event: Event) => {
  const target = event.target as HTMLSelectElement
  invoiceData.value = merge({}, cloneDeep(invoiceDataObj), { invType: { val: target.value } })
}

const handleValidation = (field: keyof InvoiceData, isValid: boolean) => {
  invoiceData.value[field].isError = !isValid
}

watch(isFree, (nVal) => {
  if (nVal) {
    invoiceData.value = cloneDeep(invoiceDataObj)
  }
})

onMounted(() => {
  invoiceData.value = merge({}, cloneDeep(invoiceDataObj), {
    invType: {
      val: props.hasEInvoice ? InvoiceCategory.MEMBER : InvoiceCategory.DUPLICATE_UNIFORM_INVOICE,
    },
  })
})
</script>

<template>
  <div class="invoice-info">
    <div v-if="noInvoice" class="pt-2 text-gray-400 md:mt-3">免開發票 No Invoice</div>
    <div v-else>
      <div class="mb-4 w-full md:mb-3 md:flex md:items-center">
        <label for="invoice-type" class="mb-1 block md:mb-0 md:w-5/12"> 發票類型 Invoice </label>
        <div class="w-full">
          <select
            id="invoice-type"
            :value="invoiceData.invType.val"
            name="invoice-type"
            class="select-picker"
            :class="{ disabled: isDisabled }"
            @change="typeSelectHandler"
          >
            <option v-for="option in optionList" :key="option.value" :value="option.value">
              {{ option.text }}
            </option>
          </select>
        </div>
      </div>
      <div class="w-full md:min-h-[90px]">
        <div
          v-if="
            [InvoiceCategory.MEMBER, InvoiceCategory.DONATE, ''].includes(invoiceData.invType.val)
          "
          class="md: pt-2 text-sm text-gray-400"
        >
          {{ detailText }}
        </div>
        <BasicInput
          v-for="config in inputFieldConfigs"
          :id="config.id"
          :key="config.id"
          v-model="invoiceData[config.field].val"
          :is-error="invoiceData[config.field].isError"
          :label-name="config.label"
          :placeholder="config.placeholder"
          :disabled="invoiceData[config.field].isDisabled || props.isDisabled"
          :max-length="config.maxLength"
          :validate-func="config.validFunc"
          @validate="(isValid) => handleValidation(config.field, isValid)"
        />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.select-picker {
  width: 100%;
  cursor: pointer;
  border-radius: 0.375rem;
  border-color: #d1d5db;
  padding: 0.375rem 2rem 0.375rem 0.75rem;
  color: #374151;

  &:focus {
    border-color: var(--var-text);
    outline: 0;
    box-shadow: none;
  }

  &.text-center {
    padding-right: 1.5rem;
  }

  &.disabled {
    pointer-events: none;
    user-select: none;
    border-color: transparent;
    background-color: rgb(0 0 0 / 10%);
    opacity: 0.4;
  }

  &.is-extend {
    pointer-events: none;
    user-select: none;
    border-color: transparent;
    background-color: rgb(0 0 0 / 5%);
  }
}
</style>
