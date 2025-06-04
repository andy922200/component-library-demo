import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import ColorPicker from '@/components/ColorPicker/index.vue'

describe('ColorPicker', () => {
  it('renders label and initial color', () => {
    const wrapper = mount(ColorPicker, {
      props: {
        modelValue: '#ff0000',
        label: '顏色',
      },
    })
    expect(wrapper.find('span').text()).toBe('顏色')
    const colorDiv = wrapper.find('.color-picker div')
    expect(colorDiv.attributes('style')).toContain('background-color: rgb(255, 0, 0)')
  })

  it('emits update:modelValue when color changes', async () => {
    const wrapper = mount(ColorPicker, {
      props: {
        modelValue: '#00ff00',
      },
    })
    const input = wrapper.find('input[type="color"]')
    await input.setValue('#0000ff')
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')![0]).toEqual(['#0000ff'])
  })

  it('applies background color style', () => {
    const wrapper = mount(ColorPicker, {
      props: {
        modelValue: '#123456',
      },
    })
    const colorDiv = wrapper.find('div[style]')
    expect(colorDiv.attributes('style')).toContain('background-color: rgb(18, 52, 86)')
  })
})
