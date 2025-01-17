import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import BaseCheckbox from '@/components/BaseCheckbox/index.vue'

describe('BaseCheckbox.vue', () => {
  it('renders correctly', async () => {
    const wrapper = mount(BaseCheckbox)
    expect(wrapper.html()).toContain('base-checkbox')
  })

  it('emits update:modelValue event when checkbox is clicked', async () => {
    const wrapper = mount(BaseCheckbox, {
      props: {
        modelValue: false,
      },
    })

    const checkbox = wrapper.find('input[type="checkbox"]')
    await checkbox.setValue(true)

    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')![0]).toEqual([true])
  })

  it('reflects modelValue prop', async () => {
    const wrapper = mount(BaseCheckbox, {
      props: {
        modelValue: true,
      },
    })

    const checkbox = wrapper.find('input[type="checkbox"]').element as HTMLInputElement
    expect(checkbox.checked).toBe(true)
  })

  it('manages state internally when modelValue is not provided', async () => {
    const wrapper = mount(BaseCheckbox)

    const checkbox = wrapper.find('input[type="checkbox"]').element as HTMLInputElement
    expect(checkbox.checked).toBe(false)

    await wrapper.find('input[type="checkbox"]').setValue(true)
    expect(checkbox.checked).toBe(true)
  })

  it('is disabled when the disabled prop is true', async () => {
    const wrapper = mount(BaseCheckbox, {
      props: {
        disabled: true,
      },
    })

    const checkbox = wrapper.find('input[type="checkbox"]').element as HTMLInputElement
    expect(checkbox.disabled).toBe(true)
    expect(wrapper.classes()).toContain('cursor-not-allowed')
  })

  it('renders slot content', async () => {
    const wrapper = mount(BaseCheckbox, {
      slots: {
        default: '<span class="slot-content">Slot Content</span>',
      },
    })

    expect(wrapper.find('.slot-content').exists()).toBe(true)
    expect(wrapper.html()).toContain('Slot Content')
  })
})
