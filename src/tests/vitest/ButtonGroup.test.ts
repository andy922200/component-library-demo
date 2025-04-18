import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import ButtonGroup from '@/components/ButtonGroup/index.vue'

describe('ButtonGroup.vue', () => {
  const baseOptions = [
    { label: 'Option A', value: 'A' },
    { label: 'Option B', value: 'B', disabled: true },
    { label: 'Option C', value: 'C' },
  ]

  it('renders all options', () => {
    const wrapper = mount(ButtonGroup, {
      props: {
        options: baseOptions,
        modelValue: 'A',
      },
    })
    const buttons = wrapper.findAll('button')
    expect(buttons.length).toBe(3)
    expect(buttons[0].text()).toBe('Option A')
    expect(buttons[1].text()).toBe('Option B')
    expect(buttons[2].text()).toBe('Option C')
  })

  it('emits update:modelValue on click', async () => {
    const wrapper = mount(ButtonGroup, {
      props: {
        options: baseOptions,
        modelValue: 'A',
      },
    })
    const buttons = wrapper.findAll('button')
    await buttons[2].trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')![0]).toEqual(['C'])
  })

  it('disables button when option.disabled is true', () => {
    const wrapper = mount(ButtonGroup, {
      props: {
        options: baseOptions,
        modelValue: 'A',
      },
    })
    const buttons = wrapper.findAll('button')
    expect(buttons[1].attributes('disabled')).toBeDefined()
    expect(buttons[0].attributes('disabled')).toBeUndefined()
  })

  it('applies active class to selected value', () => {
    const wrapper = mount(ButtonGroup, {
      props: {
        options: baseOptions,
        modelValue: 'C',
      },
    })
    const buttons = wrapper.findAll('button')
    expect(buttons[2].classes()).toContain('bg-[#484848]')
  })

  it('renders slot content when provided', () => {
    const wrapper = mount(ButtonGroup, {
      props: {
        options: baseOptions,
        modelValue: 'A',
      },
      slots: {
        label: ({ option }: any) => `<span>Label: ${option.label}</span>`,
      },
    })
    const buttons = wrapper.findAll('button')
    expect(buttons[0].html()).toContain('Label: Option A')
  })
})
