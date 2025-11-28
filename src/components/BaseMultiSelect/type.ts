export enum MultiSelectMode {
  SINGLE = 'single',
  MULTI = 'multi',
}
export type MultiSelectModeType = `${MultiSelectMode}`

export interface SelectOption {
  label: string
  value: string | number
}

export enum KeyboardKey {
  ARROW_UP = 'ArrowUp',
  ARROW_DOWN = 'ArrowDown',
  ENTER = 'Enter',
  ESCAPE = 'Escape',
  TAB = 'Tab',
}

export type KeyboardType = `${KeyboardKey}`

export interface DropdownOptionStyleConfig {
  // 未選中 + highlight -> 鍵盤導航
  highlightedNotSelected?: string
  // 已選中 + highlight -> 鍵盤導航
  highlightedSelected?: string
  // 已選中 + noHighlight
  selected?: string
  // 未選中 + noHighlight + no-hover
  hoverNotSelected?: string
  // 已選中 + noHighlight + hover
  hoverSelected?: string
}
