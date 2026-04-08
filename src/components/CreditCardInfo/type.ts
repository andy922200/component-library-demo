export interface CardFormat {
  type: string
  blocks: number[]
  maxLength: number
  cvvLength: number
  cvvPlaceholder?: string
}

export const AVAILABLE_CARD_FORMATS: Record<
  'STANDARD' | 'STANDARD_19' | 'AMERICAN_EXPRESS' | 'DINERS_CLUB',
  CardFormat
> = {
  STANDARD: {
    type: 'Standard',
    blocks: [4, 4, 4, 4],
    maxLength: 16,
    cvvLength: 3,
    cvvPlaceholder: '123',
  },
  STANDARD_19: {
    type: 'Standard 19-Digit',
    blocks: [4, 4, 4, 4, 3],
    maxLength: 19,
    cvvLength: 3,
    cvvPlaceholder: '123',
  },
  AMERICAN_EXPRESS: {
    type: 'American Express',
    blocks: [4, 6, 5],
    maxLength: 15,
    cvvLength: 4,
    cvvPlaceholder: '1234',
  },
  DINERS_CLUB: {
    type: 'Diners Club',
    blocks: [4, 6, 4],
    maxLength: 14,
    cvvLength: 3,
    cvvPlaceholder: '123',
  },
}
