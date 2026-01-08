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
  describe('Basic Rendering', () => {
    let wrapper: VueWrapper<any>

    beforeEach(() => {
      wrapper = mount(BaseTooltip, {
        props: {
          text: { triggerArea: 'Trigger Text', content: 'Content Text' },
          tooltipBgColor: 'bg-gray-800',
          tooltipTextColor: 'text-white',
        },
      })
    })

    it('renders trigger text correctly', () => {
      expect(wrapper.find('.trigger-item').text()).toBe('Trigger Text')
    })

    it('renders custom slot content correctly', () => {
      const wrapperWithSlot = mount(BaseTooltip, {
        slots: {
          trigger: '<button class="custom-trigger">Custom Trigger</button>',
          content: '<div class="custom-content">Custom Content</div>',
        },
      })

      expect(wrapperWithSlot.find('.custom-trigger').text()).toBe('Custom Trigger')
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

  describe('Arrow Styling', () => {
    let wrapper: VueWrapper<any>

    beforeEach(() => {
      wrapper = mount(BaseTooltip, {
        props: {
          arrowBorderColor: 'border-gray-800',
        },
      })
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

    it('uses custom arrow border color when provided', () => {
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

    it('falls back to tooltip background color for arrow border', () => {
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
  })

  describe('Hover Trigger Mode (Default)', () => {
    let wrapper: VueWrapper<any>

    beforeEach(() => {
      wrapper = mount(BaseTooltip, {
        props: {
          text: { triggerArea: 'Trigger Text', content: 'Content Text' },
        },
      })
    })

    it('uses hover as default trigger type', () => {
      expect(wrapper.props('triggerEventType')).toBe('hover')
    })

    describe('Desktop Behavior', () => {
      beforeEach(() => {
        mockedIsMobileAgent.mockReturnValue(false)
      })

      it('shows tooltip on mouseenter and hides on mouseleave', async () => {
        await wrapper.find('.trigger-item').trigger('mouseenter')
        expect(wrapper.vm.displayTooltip).toBe(true)

        await wrapper.find('.trigger-item').trigger('mouseleave')
        expect(wrapper.vm.displayTooltip).toBe(false)
      })
    })

    describe('Mobile Behavior', () => {
      beforeEach(() => {
        mockedIsMobileAgent.mockReturnValue(true)
      })

      it('does not show tooltip on mouseenter', async () => {
        await wrapper.find('.trigger-item').trigger('mouseenter')
        expect(wrapper.vm.displayTooltip).toBe(false)
      })

      it('shows and hides tooltip on touch events', async () => {
        await wrapper.find('.trigger-item').trigger('touchstart')
        expect(wrapper.vm.displayTooltip).toBe(true)

        await wrapper.find('.trigger-item').trigger('touchend')
        expect(wrapper.vm.displayTooltip).toBe(false)
      })
    })
  })

  describe('Click Trigger Mode', () => {
    let wrapper: VueWrapper<any>

    beforeEach(() => {
      wrapper = mount(BaseTooltip, {
        props: {
          triggerEventType: 'click',
          text: { triggerArea: 'Click Me', content: 'Click Content' },
        },
      })
    })

    it('toggles tooltip on click', async () => {
      await wrapper.find('.trigger-item').trigger('click')
      expect(wrapper.vm.displayTooltip).toBe(true)

      await wrapper.find('.trigger-item').trigger('click')
      expect(wrapper.vm.displayTooltip).toBe(false)
    })

    it('does not respond to hover events', async () => {
      mockedIsMobileAgent.mockReturnValue(false)

      await wrapper.find('.trigger-item').trigger('mouseenter')
      expect(wrapper.vm.displayTooltip).toBe(false)

      await wrapper.find('.trigger-item').trigger('mouseleave')
      expect(wrapper.vm.displayTooltip).toBe(false)
    })

    it('does not respond to touch events', async () => {
      await wrapper.find('.trigger-item').trigger('touchstart')
      expect(wrapper.vm.displayTooltip).toBe(false)

      await wrapper.find('.trigger-item').trigger('touchend')
      expect(wrapper.vm.displayTooltip).toBe(false)
    })

    describe('Click Outside Behavior', () => {
      it('closes tooltip when clicking outside', async () => {
        await wrapper.find('.trigger-item').trigger('click')
        expect(wrapper.vm.displayTooltip).toBe(true)

        document.body.click()
        await wrapper.vm.$nextTick()
        expect(wrapper.vm.displayTooltip).toBe(false)
      })

      it('does not close when clicking on tooltip content', async () => {
        await wrapper.find('.trigger-item').trigger('click')
        expect(wrapper.vm.displayTooltip).toBe(true)

        await wrapper.find('.floating-dom').trigger('click')
        expect(wrapper.vm.displayTooltip).toBe(true)
      })
    })
  })
})
