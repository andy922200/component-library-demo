import { mount, VueWrapper } from '@vue/test-utils'
import { describe, expect, it, MockedFunction, vi } from 'vitest'

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
        className: { triggerItem: '', floatingDom: '', arrowColor: '' },
      },
    })
  })

  it('tooltip is hidden by default', () => {
    expect(wrapper.vm.displayTooltip).toBe(false)
    expect(wrapper.find('.floating-dom').isVisible()).toBe(false)
  })

  it('renders trigger text correctly', () => {
    expect(wrapper.find('.trigger-item').text()).toBe('Trigger Text')
  })

  it('shows tooltip on mouseenter and hides on mouseleave when not mobile', async () => {
    mockedIsMobileAgent.mockReturnValue(false)

    const floatingDom = wrapper.find('.floating-dom').element as HTMLElement

    await wrapper.find('.trigger-item').trigger('mouseenter')
    expect(floatingDom.style.display).not.toBe('none')

    await wrapper.find('.trigger-item').trigger('mouseleave')
    expect(floatingDom.style.display).toBe('none')
  })

  it('does not show tooltip on mouseenter when mobile', async () => {
    mockedIsMobileAgent.mockReturnValue(true)

    await wrapper.find('.trigger-item').trigger('mouseenter')
    expect(wrapper.find('.floating-dom').isVisible()).toBe(false)
  })

  it('shows and hides tooltip on touch events', async () => {
    mockedIsMobileAgent.mockReturnValue(true)

    const floatingDom = wrapper.find('.floating-dom').element as HTMLElement

    await wrapper.find('.trigger-item').trigger('touchstart')
    expect(floatingDom.style.display).not.toBe('none')

    await wrapper.find('.trigger-item').trigger('touchend')
    expect(floatingDom.style.display).toBe('none')
  })

  it('positions the tooltip correctly', async () => {
    mockedIsMobileAgent.mockReturnValue(false)

    await wrapper.find('.trigger-item').trigger('mouseenter')
    await wrapper.vm.setFloating()
    await new Promise((resolve) => setTimeout(resolve, 0))

    const floatingDom = wrapper.find('.floating-dom')

    expect(floatingDom.attributes('style')).toContain('left: -8px')
    expect(floatingDom.attributes('style')).toContain('top: 0px')
  })

  it('applies custom className correctly', () => {
    const customWrapper = mount(BaseTooltip, {
      props: {
        className: {
          triggerItem: 'custom-trigger',
          floatingDom: 'custom-floating',
          arrowColor: 'custom-arrow',
        },
      },
    })

    expect(customWrapper.find('.trigger-item').classes()).toContain('custom-trigger')
    expect(customWrapper.find('.floating-dom').classes()).toContain('custom-floating')
    expect(customWrapper.find('.floating-arrow').classes()).toContain('custom-arrow')
  })

  it('renders default slot content correctly', () => {
    const wrapperWithSlot = mount(BaseTooltip, {
      props: {
        offsetValue: 8,
        text: { triggerArea: 'Trigger Text', content: 'Content Text' },
        placement: 'right',
        className: { triggerItem: '', floatingDom: '', arrowColor: 'bg-green-300' },
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
})
