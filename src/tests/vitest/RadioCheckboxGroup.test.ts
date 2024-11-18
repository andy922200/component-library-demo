import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import RadioCheckboxGroup from '@/components/RadioCheckboxGroup/index.vue' // 調整路徑到你的元件位置

describe('RadioCheckboxGroup', () => {
  it('renders the correct number of options', () => {
    const wrapper = mount(RadioCheckboxGroup, {
      props: {
        options: [
          { label: 'Option 1', value: 'option1' },
          { label: 'Option 2', value: 'option2' },
          { label: 'Option 3', value: 'option3' },
        ],
      },
    })

    const inputs = wrapper.findAll('input[type="checkbox"]')
    expect(inputs.length).toBe(3)
  })

  it('binds modelValue correctly as default', async () => {
    const wrapper = mount(RadioCheckboxGroup, {
      props: {
        modelValue: 'option2',
        options: [
          { label: 'Option 1', value: 'option1' },
          { label: 'Option 2', value: 'option2' },
          { label: 'Option 3', value: 'option3' },
        ],
      },
    })

    const checkedInput = wrapper.find('input:checked')
    expect(checkedInput.attributes('value')).toBe('option2')
  })

  it('binds modelValue correctly while clicking other option', async () => {
    const wrapper = mount(RadioCheckboxGroup, {
      props: {
        modelValue: 'option2',
        options: [
          { label: 'Option 1', value: 'option1' },
          { label: 'Option 2', value: 'option2' },
          { label: 'Option 3', value: 'option3' },
        ],
      },
    })

    // 模擬點擊其他選項
    const option1 = wrapper.find('input[value="option1"]')
    await option1.trigger('click')

    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')![0]).toEqual(['option1'])
  })

  it('prevents unchecking the selected option', async () => {
    const wrapper = mount(RadioCheckboxGroup, {
      props: {
        modelValue: 'option2',
        options: [
          { label: 'Option 1', value: 'option1' },
          { label: 'Option 2', value: 'option2' },
        ],
      },
    })

    const option2 = wrapper.find('input[value="option2"]')
    await option2.trigger('click')

    // 檢查是否阻止取消選中
    expect(wrapper.emitted('update:modelValue')).toBeFalsy()
    const checkedInput = wrapper.find('input:checked')
    expect(checkedInput.attributes('value')).toBe('option2')
  })

  it('applies custom classes from props', () => {
    const wrapper = mount(RadioCheckboxGroup, {
      props: {
        options: [
          { label: 'Option 1', value: 'option1' },
          { label: 'Option 2', value: 'option2' },
        ],
        groupWrapperClass: ['custom-wrapper-class'],
        optionClass: ['custom-option-class'],
        inputClass: ['custom-input-class'],
        labelClass: ['custom-label-class'],
      },
    })

    expect(wrapper.classes()).toContain('custom-wrapper-class')

    const options = wrapper.findAll('.radio-checkbox-wrapper')
    options.forEach((option) => {
      expect(option.classes()).toContain('custom-option-class')
    })

    const inputs = wrapper.findAll('input')
    inputs.forEach((input) => {
      expect(input.classes()).toContain('custom-input-class')
    })

    const labels = wrapper.findAll('label')
    labels.forEach((label) => {
      expect(label.classes()).toContain('custom-label-class')
    })
  })

  it('renders correctly with no options', () => {
    const wrapper = mount(RadioCheckboxGroup, {
      props: { options: [] },
    })

    expect(wrapper.findAll('input').length).toBe(0)
    expect(wrapper.text()).toBe('')
  })
})
