export enum InvoiceCategory {
  MEMBER = 'member',
  MOBILE_BARCODE = 'mobile_barcode',
  DIGITAL_CERTIFICATE = 'digital_certificate',
  DONATE = 'donate',
  COMPANY_INVOICE = 'company_invoice',
  DUPLICATE_UNIFORM_INVOICE = 'duplicate_uniform_invoice',
  TRIPLICATE_UNIFORM_INVOICE = 'triplicate_uniform_invoice',
}

export type InvoiceType = `${InvoiceCategory}` | ''

export interface InvoiceData {
  invType: {
    val: InvoiceType
    isError: boolean
    isDisabled: boolean
  }
  invCode: {
    val: string
    isError: boolean
    isDisabled: boolean
  }
  invTitle: {
    val: string
    isError: boolean
    isDisabled: boolean
  }
  invAddress: {
    val: string
    isError: boolean
    isDisabled: boolean
  }
}

export const invoiceDataObj: InvoiceData = {
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
}

export const inputItemInfoMap: Record<
  string,
  { label?: string; placeholder?: string; validFunc?: (value: string) => boolean }
> = {
  carrierCode: {
    label: '載具號碼 Carrier Code',
    placeholder: '含 / 與7碼大寫英數字',
    validFunc: (value: string) => /^[/][0-9a-zA-Z+-.]{7}$/.test(value),
  },
  certificateNo: {
    label: '憑證號碼 Certificate No.',
    placeholder: '2碼大寫英文與14碼數字',
    validFunc: (value: string) => /^[A-Z]{2}[0-9]{14}$/.test(value),
  },
  companyName: {
    label: '公司抬頭 Company Title',
    placeholder: 'OO科技股份有限公司',
    validFunc: (value: string) => value.trim().length > 0,
  },
  taxId: {
    label: '統一編號 Tax ID',
    placeholder: '12345678',
    validFunc: (value: string) => /^[0-9]{8}$/.test(value) && value.trim().length === 8,
  },
  invoiceAddress: {
    label: '發票地址 Invoice Address',
    placeholder: '發票詳細地址',
    validFunc: (value: string) => value.trim().length > 0,
  },
}

export const invoiceCategoryMap: Partial<
  Record<
    InvoiceType,
    {
      code: string
      text: string
      param: InvoiceType
    }
  >
> = {
  [InvoiceCategory.MEMBER]: {
    code: '1',
    text: '會員載具 Member',
    param: InvoiceCategory.MEMBER,
  },
  [InvoiceCategory.MOBILE_BARCODE]: {
    code: '2',
    text: '手機載具 Mobile Barcode',
    param: InvoiceCategory.MOBILE_BARCODE,
  },
  [InvoiceCategory.DIGITAL_CERTIFICATE]: {
    code: '3',
    text: '自然人憑證 Digital Certificate',
    param: InvoiceCategory.DIGITAL_CERTIFICATE,
  },
  [InvoiceCategory.DONATE]: {
    code: '4',
    text: '發票捐贈 Donate',
    param: InvoiceCategory.DONATE,
  },
  [InvoiceCategory.COMPANY_INVOICE]: {
    code: '5',
    text: '公司發票 Company Invoice',
    param: InvoiceCategory.COMPANY_INVOICE,
  },
  [InvoiceCategory.DUPLICATE_UNIFORM_INVOICE]: {
    code: '6',
    text: '二聯式紙本發票 Duplicate Uniform Invoice',
    param: InvoiceCategory.DUPLICATE_UNIFORM_INVOICE,
  },
  [InvoiceCategory.TRIPLICATE_UNIFORM_INVOICE]: {
    code: '7',
    text: '三聯式紙本發票 Triplicate Uniform Invoice',
    param: InvoiceCategory.TRIPLICATE_UNIFORM_INVOICE,
  },
}

export const numberToInvoiceCategoryMap = Object.fromEntries(
  Object.entries(invoiceCategoryMap).map(([key, value]) => [value.code, key]),
) as Record<string, InvoiceType>

export interface InvoiceOption {
  text: string
  value: string
}

export const eInvoiceOptions: InvoiceOption[] = [
  InvoiceCategory.MEMBER,
  InvoiceCategory.MOBILE_BARCODE,
  InvoiceCategory.DIGITAL_CERTIFICATE,
  InvoiceCategory.DONATE,
  InvoiceCategory.COMPANY_INVOICE,
].map((category) => ({
  text: invoiceCategoryMap[category]?.text ?? '',
  value: category,
}))

export const manualInvoiceOptions: InvoiceOption[] = [
  InvoiceCategory.DUPLICATE_UNIFORM_INVOICE,
  InvoiceCategory.TRIPLICATE_UNIFORM_INVOICE,
].map((category) => ({
  text: invoiceCategoryMap[category]?.text ?? '',
  value: category,
}))

export const allInvoiceOptions: InvoiceOption[] = [...eInvoiceOptions, ...manualInvoiceOptions]
export const companyInvoiceCategories: InvoiceType[] = [
  InvoiceCategory.COMPANY_INVOICE,
  InvoiceCategory.TRIPLICATE_UNIFORM_INVOICE,
]
export const needAddressCategories: InvoiceType[] = [
  InvoiceCategory.COMPANY_INVOICE,
  InvoiceCategory.DUPLICATE_UNIFORM_INVOICE,
  InvoiceCategory.TRIPLICATE_UNIFORM_INVOICE,
]
