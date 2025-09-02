import { mount, VueWrapper } from '@vue/test-utils'
import { beforeEach, describe, expect, it, MockedFunction, vi } from 'vitest'

import BaseTooltip from '@/components/BaseTooltip/index.vue'
import { isMobileAgent } from '@/helpers'

// Mock the isMobileAgent function
vi.mock('@/helpers', () => ({
  isMobileAgent: vi.fn(),
}))

const mockedIsMobileAgent = isMobileAgent as MockedFunction<typeof isMobileAgent>

describe('BaseTooltip.vue', () => {
  let wrapper: VueWrapper<any>

  beforeEach(() => {
    wrapper = mount(BaseTooltip, {
      props: {
        offsetValue: 8,
        text: { triggerArea: 'Trigger Text', content: 'Content Text' },
        placement: 'left',
        className: { triggerItem: '', floatingDom: '' },
        tooltipBgColor: 'bg-gray-800',
        tooltipTextColor: 'text-white',
        arrowBorderColor: 'border-gray-800',
      },
    })
  })

  it('renders trigger text correctly', () => {
    expect(wrapper.find('.trigger-item').text()).toBe('Trigger Text')
  })

  it('shows tooltip on mouseenter and hides on mouseleave when not mobile', async () => {
    mockedIsMobileAgent.mockReturnValue(false)

    await wrapper.find('.trigger-item').trigger('mouseenter')
    expect(wrapper.vm.displayTooltip).toBe(true)

    await wrapper.find('.trigger-item').trigger('mouseleave')
    expect(wrapper.vm.displayTooltip).toBe(false)
  })

  it('does not show tooltip on mouseenter when mobile', async () => {
    mockedIsMobileAgent.mockReturnValue(true)

    await wrapper.find('.trigger-item').trigger('mouseenter')
    expect(wrapper.vm.displayTooltip).toBe(false)
  })

  it('shows and hides tooltip on touch events', async () => {
    mockedIsMobileAgent.mockReturnValue(true)

    await wrapper.find('.trigger-item').trigger('touchstart')
    expect(wrapper.vm.displayTooltip).toBe(true)

    await wrapper.find('.trigger-item').trigger('touchend')
    expect(wrapper.vm.displayTooltip).toBe(false)
  })

  it('generates correct arrow classes for different placements', () => {
    const testCases = [
      {
        placement: 'top',
        expected: 'floating-arrow absolute size-2 rotate-45 border-b border-r border-gray-800',
      },
      {
        placement: 'bottom',
        expected: 'floating-arrow absolute size-2 rotate-45 border-t border-l border-gray-800',
      },
      {
        placement: 'left',
        expected: 'floating-arrow absolute size-2 rotate-45 border-t border-r border-gray-800',
      },
      {
        placement: 'right',
        expected: 'floating-arrow absolute size-2 rotate-45 border-b border-l border-gray-800',
      },
    ]

    testCases.forEach(({ placement, expected }) => {
      const result = wrapper.vm.getArrowClass(placement)
      expect(result).toBe(expected)
    })
  })

  it('uses custom arrow border color when provided', async () => {
    const customWrapper = mount(BaseTooltip, {
      props: {
        placement: 'top',
        arrowBorderColor: 'border-blue-500',
        tooltipBgColor: 'bg-red-500',
      },
    })

    const arrowClass = customWrapper.vm.getArrowClass('top')
    expect(arrowClass).toContain('border-blue-500')
    expect(arrowClass).not.toContain('border-red-500')
  })

  it('falls back to tooltip background color for arrow border when no custom color provided', async () => {
    const customWrapper = mount(BaseTooltip, {
      props: {
        placement: 'top',
        tooltipBgColor: 'bg-blue-500',
        arrowBorderColor: '',
      },
    })

    const arrowClass = customWrapper.vm.getArrowClass('top')
    expect(arrowClass).toContain('border-blue-500')
  })

  it('renders default slot content correctly', () => {
    const wrapperWithSlot = mount(BaseTooltip, {
      props: {
        offsetValue: 8,
        text: { triggerArea: 'Trigger Text', content: 'Content Text' },
        placement: 'right',
        className: { triggerItem: '', floatingDom: '' },
        tooltipBgColor: 'bg-gray-800',
        tooltipTextColor: 'text-white',
      },
      slots: {
        trigger: '<button class="custom-trigger">Custom Trigger</button>',
        content: '<div class="custom-content">Custom Content</div>',
      },
    })

    expect(wrapperWithSlot.find('.custom-trigger').exists()).toBe(true)
    expect(wrapperWithSlot.find('.custom-trigger').text()).toBe('Custom Trigger')
    expect(wrapperWithSlot.find('.custom-content').exists()).toBe(true)
    expect(wrapperWithSlot.find('.custom-content').text()).toBe('Custom Content')
  })

  it('applies correct CSS classes to tooltip elements', async () => {
    mockedIsMobileAgent.mockReturnValue(false)

    await wrapper.find('.trigger-item').trigger('mouseenter')

    const floatingDom = wrapper.find('.floating-dom')
    expect(floatingDom.classes()).toContain('bg-gray-800')
    expect(floatingDom.classes()).toContain('text-white')

    const arrow = wrapper.find('.floating-arrow')
    expect(arrow.classes()).toContain('rotate-45')
  })
})
