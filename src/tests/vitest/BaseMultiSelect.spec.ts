import { mount, VueWrapper } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'

import BaseMultiSelect from '@/components/BaseMultiSelect/index.vue'
import type { SelectOption } from '@/components/BaseMultiSelect/type'
import { KeyboardKey, MultiSelectMode } from '@/components/BaseMultiSelect/type'

const mockOptions: SelectOption[] = [
  { label: 'Vue.js', value: 'vue' },
  { label: 'React', value: 'react' },
  { label: 'Angular', value: 'angular' },
  { label: 'Svelte', value: 'svelte' },
]

vi.mock('@vueuse/core', () => ({
  onClickOutside: vi.fn((target, handler) => {
    const mockClickOutside = () => handler({ target: document.body })
    ;(globalThis as any).mockClickOutside = mockClickOutside
  }),
  useEventListener: vi.fn(),
  useDebounceFn: vi.fn((fn) => fn),
}))

vi.mock('@/components/Spinner/index.vue', () => ({
  default: {
    name: 'Spinner',
    template: '<div data-testid="loading">Loading...</div>',
  },
}))

Element.prototype.scrollIntoView = vi.fn()

describe('BaseMultiSelect', () => {
  let wrapper: VueWrapper<any>

  const waitForDropdown = async () => {
    await nextTick()
    await new Promise((resolve) => setTimeout(resolve, 100))
  }

  beforeEach(async () => {
    vi.clearAllMocks()

    wrapper = mount(BaseMultiSelect, {
      props: {
        options: mockOptions,
        placeholder: '請選擇項目',
        open: false,
      },
      global: {
        stubs: {
          Teleport: {
            template: '<div class="teleport-stub"><slot /></div>',
          },
        },
      },
    })

    await nextTick()
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  describe('基礎功能', () => {
    it('應該正確渲染組件', () => {
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.text()).toContain('請選擇項目')
    })

    it('應該顯示 placeholder 當沒有選中項目時', () => {
      expect(wrapper.text()).toContain('請選擇項目')
    })

    it('應該能開啟下拉選單', async () => {
      const trigger = wrapper.find('[data-testid="multiselect-trigger"]')
      expect(trigger.exists()).toBe(true)

      await trigger.trigger('click')
      await nextTick()

      expect(wrapper.emitted('update:open')).toBeTruthy()
    })
  })

  describe('選項選擇', () => {
    beforeEach(async () => {
      // 開啟下拉選單
      await wrapper.setProps({ open: true })
      await waitForDropdown()
    })

    it('應該能選中選項', async () => {
      const options = wrapper.findAll('[data-testid^="option-"]')
      expect(options.length).toBeGreaterThan(0)

      await options[0].trigger('click')
      await nextTick()

      const modelEvents = wrapper.emitted('update:modelValue')
      expect(modelEvents).toBeTruthy()
      expect(modelEvents![0]).toEqual([['vue']])
    })

    it('應該能取消選中的選項', async () => {
      await wrapper.setProps({ modelValue: ['vue'] })
      await nextTick()

      const options = wrapper.findAll('[data-testid^="option-"]')
      expect(options.length).toBeGreaterThan(0)

      await options[0].trigger('click')
      await nextTick()

      const modelEvents = wrapper.emitted('update:modelValue')
      expect(modelEvents![modelEvents!.length - 1]).toEqual([[]])
    })

    it('應該能多選', async () => {
      const options = wrapper.findAll('[data-testid^="option-"]')

      await options[0].trigger('click')
      await nextTick()
      await options[1].trigger('click')
      await nextTick()

      const modelEvents = wrapper.emitted('update:modelValue')
      expect(modelEvents![modelEvents!.length - 1]).toEqual([['vue', 'react']])
    })
  })

  describe('單選模式', () => {
    beforeEach(async () => {
      await wrapper.setProps({
        mode: 'single',
        open: true,
      })
      await waitForDropdown()
    })

    it('單選模式下只能選擇一個選項', async () => {
      const options = wrapper.findAll('[data-testid^="option-"]')

      await options[0].trigger('click')
      await nextTick()
      await options[1].trigger('click')
      await nextTick()

      const modelEvents = wrapper.emitted('update:modelValue')
      expect(modelEvents![modelEvents!.length - 1]).toEqual([['react']])
    })
  })

  describe('搜尋功能', () => {
    beforeEach(async () => {
      await wrapper.setProps({
        searchable: true,
        open: true,
      })
      await waitForDropdown()
    })

    it('應該顯示搜尋輸入框', () => {
      const searchInput = wrapper.find('[data-testid="search-input"]')
      expect(searchInput.exists()).toBe(true)
    })

    it('應該能過濾選項', async () => {
      const searchInput = wrapper.find('[data-testid="search-input"]')
      await searchInput.setValue('vue')
      await nextTick()

      const options = wrapper.findAll('[data-testid^="option-"]')
      expect(options.length).toBe(1)
      expect(options[0].text()).toContain('Vue.js')
    })
  })

  describe('遠端搜尋功能', () => {
    beforeEach(async () => {
      await wrapper.setProps({
        remote: true,
        searchable: true,
        minSearchLength: 2,
        open: true,
      })
      await waitForDropdown()
    })

    it('應該在輸入達到最小長度時觸發搜尋事件', async () => {
      const searchInput = wrapper.find('[data-testid="search-input"]')
      await searchInput.setValue('vue')
      await nextTick()

      expect(wrapper.emitted('search')).toBeTruthy()
      expect(wrapper.emitted('search')![0]).toEqual(['vue'])
    })

    it('應該顯示載入狀態', async () => {
      await wrapper.setProps({ remoteSearching: true })
      await nextTick()

      const loadingElement = wrapper.find('[data-testid="loading"]')
      expect(loadingElement.exists()).toBe(true)
    })
  })

  describe('全選功能', () => {
    beforeEach(async () => {
      await wrapper.setProps({
        showSelectAll: true,
        open: true,
      })
      await waitForDropdown()
    })

    it('應該顯示全選選項', () => {
      const selectAll = wrapper.find('[data-testid="select-all"]')
      expect(selectAll.exists()).toBe(true)
    })

    it('點擊全選應該選中所有選項', async () => {
      const selectAll = wrapper.find('[data-testid="select-all"]')
      await selectAll.trigger('click')
      await nextTick()

      const modelEvents = wrapper.emitted('update:modelValue')
      expect(modelEvents![modelEvents!.length - 1]).toEqual([['vue', 'react', 'angular', 'svelte']])
    })
  })

  describe('標籤顯示和刪除', () => {
    beforeEach(async () => {
      await wrapper.setProps({
        modelValue: ['vue', 'react'],
        deletable: true,
      })
      await nextTick()
    })

    it('應該顯示已選中項目的標籤', () => {
      const tags = wrapper.findAll('[data-testid^="tag-"]:not([data-testid*="delete"])')
      expect(tags.length).toBe(2)
      expect(tags[0].text()).toContain('Vue.js')
      expect(tags[1].text()).toContain('React')
    })

    it('點擊刪除按鈕應該移除標籤', async () => {
      const deleteButton = wrapper.find('[data-testid="tag-delete-vue"]')
      expect(deleteButton.exists()).toBe(true)

      await deleteButton.trigger('click')
      await nextTick()

      const modelEvents = wrapper.emitted('update:modelValue')
      expect(modelEvents![modelEvents!.length - 1]).toEqual([['react']])
    })
  })

  describe('Checkbox 模式', () => {
    beforeEach(async () => {
      await wrapper.setProps({
        showCheckbox: true,
        open: true,
      })
      await waitForDropdown()
    })

    it('應該顯示 checkbox', () => {
      const checkboxes = wrapper.findAll('input[type="checkbox"]')
      expect(checkboxes.length).toBeGreaterThan(0)
    })

    it('已選中的選項的 checkbox 應該被選中', async () => {
      await wrapper.setProps({ modelValue: ['vue'] })
      await nextTick()

      const checkboxes = wrapper.findAll('input[type="checkbox"]')
      const vueCheckbox = checkboxes.find((cb) => {
        const li = cb.element.closest('li')
        return li?.dataset.testid === 'option-vue'
      }) as VueWrapper<HTMLInputElement> | undefined

      expect(vueCheckbox?.element.checked).toBe(true)
    })
  })

  describe('鍵盤導航', () => {
    beforeEach(async () => {
      await wrapper.setProps({ open: true })
      await waitForDropdown()
    })

    it('應該定義正確的鍵盤鍵值', () => {
      expect(KeyboardKey.ARROW_DOWN).toBe('ArrowDown')
      expect(KeyboardKey.ARROW_UP).toBe('ArrowUp')
      expect(KeyboardKey.ENTER).toBe('Enter')
      expect(KeyboardKey.ESCAPE).toBe('Escape')
    })

    it('應該定義正確的選擇模式', () => {
      expect(MultiSelectMode.SINGLE).toBe('single')
      expect(MultiSelectMode.MULTI).toBe('multi')
    })

    it('按下箭頭鍵應該高亮選項', async () => {
      const rootElement = wrapper.find('[data-testid="multiselect-root"]')
      await rootElement.trigger('keydown', { key: 'ArrowDown' })
      await nextTick()

      const highlightedOption = wrapper.find('.bg-blue-200')
      expect(highlightedOption.exists()).toBe(true)
    })

    it('按 ArrowUp 應該向上導航', async () => {
      const rootElement = wrapper.find('[data-testid="multiselect-root"]')

      // 先向下移動到第二個選項
      await rootElement.trigger('keydown', { key: 'ArrowDown' })
      await nextTick()
      await rootElement.trigger('keydown', { key: 'ArrowDown' })
      await nextTick()

      // 再向上移動
      await rootElement.trigger('keydown', { key: 'ArrowUp' })
      await nextTick()

      expect(Element.prototype.scrollIntoView).toHaveBeenCalled()
    })

    it('在最後一個選項時按 ArrowDown 應該循環到第一個', async () => {
      const rootElement = wrapper.find('[data-testid="multiselect-root"]')

      // 移動到最後一個選項 (4個選項，需要按3次)
      for (let i = 0; i < mockOptions.length; i++) {
        await rootElement.trigger('keydown', { key: 'ArrowDown' })
        await nextTick()
      }

      // 再按一次應該回到第一個
      await rootElement.trigger('keydown', { key: 'ArrowDown' })
      await nextTick()

      expect(Element.prototype.scrollIntoView).toHaveBeenCalledTimes(mockOptions.length + 1)
    })

    it('在第一個選項時按 ArrowUp 應該循環到最後一個', async () => {
      const rootElement = wrapper.find('[data-testid="multiselect-root"]')

      // 先移動到第一個選項
      await rootElement.trigger('keydown', { key: 'ArrowDown' })
      await nextTick()

      // 按 ArrowUp 應該到最後一個
      await rootElement.trigger('keydown', { key: 'ArrowUp' })
      await nextTick()

      expect(Element.prototype.scrollIntoView).toHaveBeenCalled()
    })

    it('按 Enter 應該選中高亮的選項', async () => {
      const rootElement = wrapper.find('[data-testid="multiselect-root"]')

      await rootElement.trigger('keydown', { key: 'ArrowDown' })
      await nextTick()

      await rootElement.trigger('keydown', { key: 'Enter' })
      await nextTick()

      const modelEvents = wrapper.emitted('update:modelValue')
      expect(modelEvents![modelEvents!.length - 1]).toEqual([['vue']])
    })

    it('按 Escape 應該關閉下拉選單', async () => {
      const rootElement = wrapper.find('[data-testid="multiselect-root"]')
      await rootElement.trigger('keydown', { key: 'Escape' })
      await nextTick()

      const openEvents = wrapper.emitted('update:open')
      expect(openEvents![openEvents!.length - 1]).toEqual([false])
    })

    it('按 Tab 應該關閉下拉選單並移動焦點', async () => {
      const rootElement = wrapper.find('[data-testid="multiselect-root"]')
      await rootElement.trigger('keydown', { key: 'Tab' })
      await nextTick()

      const openEvents = wrapper.emitted('update:open')
      expect(openEvents).toBeTruthy() // 先確保有事件
      expect(openEvents![openEvents!.length - 1]).toEqual([false])
    })
  })
})
