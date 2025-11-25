<script setup lang="ts">
import { ref } from 'vue'

import InvoiceInfo from '@/components/InvoiceInfo/index.vue'
import type { InvoiceData } from '@/components/InvoiceInfo/invoice-setting'

const invoiceInfoModel = ref<InvoiceData>({
  invType: {
    val: '',
    isError: false,
    isDisabled: false,
  },
  invCode: {
    val: '',
    isError: false,
    isDisabled: false,
  },
  invTitle: {
    val: '',
    isError: false,
    isDisabled: false,
  },
  invAddress: {
    val: '',
    isError: false,
    isDisabled: false,
  },
})

defineOptions({
  name: 'DemoInvoiceInfo',
})
</script>

<template>
  <div class="w-full">
    <h1 class="mb-2 text-center text-lg">Invoice Info 發票資訊</h1>

    <div class="flex items-center justify-center">
      <InvoiceInfo v-model="invoiceInfoModel" />
    </div>
  </div>
</template>
