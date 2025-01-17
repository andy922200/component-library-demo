import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import BaseTextarea from '@/components/BaseTextarea/index.vue'

describe('BaseTextarea.vue', () => {
  it('renders correctly with default props', () => {
    const wrapper = mount(BaseTextarea, {
      props: {
        id: 'test-textarea',
      },
    })

    expect(wrapper.find('textarea').exists()).toBe(true)
    expect(wrapper.find('label').exists()).toBe(true)
    expect(wrapper.find('textarea').attributes('id')).toBe('test-textarea')
    expect(wrapper.find('textarea').attributes('rows')).toBe('2') // Default rows
  })

  it('renders the label correctly when `labelName` is provided', () => {
    const wrapper = mount(BaseTextarea, {
      props: {
        id: 'test-textarea',
        labelName: 'Test Label',
      },
    })

    expect(wrapper.find('label').text()).toBe('Test Label')
  })

  it('hides the label when `showLabel` is false', () => {
    const wrapper = mount(BaseTextarea, {
      props: {
        id: 'test-textarea',
        showLabel: false,
      },
    })

    expect(wrapper.find('label').exists()).toBe(false)
  })

  it('renders the required asterisk when `isRequired` is true', () => {
    const wrapper = mount(BaseTextarea, {
      props: {
        id: 'test-textarea',
        isRequired: true,
      },
    })

    expect(wrapper.find('.text-red-500').exists()).toBe(true)
    expect(wrapper.find('.text-red-500').text()).toBe('*')
  })

  it('updates modelValue correctly using v-model', async () => {
    const wrapper = mount(BaseTextarea, {
      props: {
        id: 'test-textarea',
        modelValue: '',
      },
    })

    const textarea = wrapper.find('textarea')
    await textarea.setValue('New value')

    expect(wrapper.emitted('update:modelValue')).toHaveLength(1)
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['New value'])
  })

  it('disables the textarea when `disabled` is true', () => {
    const wrapper = mount(BaseTextarea, {
      props: {
        id: 'test-textarea',
        disabled: true,
      },
    })

    const textarea = wrapper.find('textarea')
    expect(textarea.attributes('disabled')).toBeDefined()
  })

  it('applies error styling when `isError` is true', () => {
    const wrapper = mount(BaseTextarea, {
      props: {
        id: 'test-textarea',
        isError: true,
      },
    })

    const textarea = wrapper.find('textarea')
    expect(textarea.classes()).toContain('border-red-500')
  })

  it('renders the append slot content when `hasAppend` is true', () => {
    const wrapper = mount(BaseTextarea, {
      props: {
        id: 'test-textarea',
        hasAppend: true,
      },
      slots: {
        append: '<span class="append-content">Append Content</span>',
      },
    })

    expect(wrapper.find('.append-content').exists()).toBe(true)
    expect(wrapper.find('.append-content').text()).toBe('Append Content')
  })

  it('applies custom classes from `class` and `textareaWrapperClass` props', () => {
    const wrapper = mount(BaseTextarea, {
      props: {
        id: 'test-textarea',
        class: 'custom-textarea-class',
        textareaWrapperClass: 'custom-wrapper-class',
      },
    })

    const textarea = wrapper.find('textarea')
    const wrapperDiv = wrapper.find('.base-textarea')

    expect(textarea.classes()).toContain('custom-textarea-class')
    expect(wrapperDiv.classes()).toContain('custom-wrapper-class')
  })
})
