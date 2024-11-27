import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { nextTick } from 'vue'

import ScrollableDateTable from '@/components/ScrollableDateTable/index.vue'

describe('ScrollableDateTable', () => {
  const mockTimeSlotDateMap = {
    '2024/11/08': [
      { startTime: '08:00', endTime: '08:30' },
      { startTime: '18:00', endTime: '19:00' },
    ],
    '2024/11/14': [
      { startTime: '08:00', endTime: '08:30' },
      { startTime: '15:00', endTime: '16:00' },
      { startTime: '16:00', endTime: '16:30' },
    ],
  }

  it('renders correct headers based on the provided start and end date', () => {
    const wrapper = mount(ScrollableDateTable, {
      props: {
        startDate: '2024/11/08',
        endDate: '2024/11/14',
        timeSlotDateMap: mockTimeSlotDateMap,
        dateFormat: 'YYYY/MM/DD',
      },
    })

    const headers = wrapper.findAll('.scrollable-date-table__header-cell')
    expect(headers).toHaveLength(7)

    const headerTexts = headers.map((header) => header.text())
    expect(headerTexts).toEqual(['週日', '週一', '週二', '週三', '週四', '週五', '週六'])
  })

  it('generates correct schedule cells with time slots', () => {
    const wrapper = mount(ScrollableDateTable, {
      props: {
        startDate: '2024/11/08',
        endDate: '2024/11/14',
        timeSlotDateMap: mockTimeSlotDateMap,
        dateFormat: 'YYYY/MM/DD',
      },
    })

    const rows = wrapper.findAll('.scrollable-date-table__row')
    expect(rows).toHaveLength(2) // 因為跨越兩週

    const firstRowCells = rows[0].findAll('.scrollable-date-table__cell')
    expect(firstRowCells[5].attributes('data-date')).toBe('2024/11/08')
    expect(firstRowCells[5].findAll('[data-start-time]')).toHaveLength(2)
  })

  it('applies active background color to cells with time slots', () => {
    const wrapper = mount(ScrollableDateTable, {
      props: {
        startDate: '2024/11/08',
        endDate: '2024/11/14',
        timeSlotDateMap: mockTimeSlotDateMap,
        activeBgCellColor: 'bg-active',
        dateFormat: 'YYYY/MM/DD',
      },
    })

    const activeCell = wrapper.find('[data-date="2024/11/08"] .bg-active')
    expect(activeCell.exists()).toBe(true)
  })

  it('does not apply background color to empty cells', () => {
    const wrapper = mount(ScrollableDateTable, {
      props: {
        startDate: '2024/11/08',
        endDate: '2024/11/14',
        timeSlotDateMap: mockTimeSlotDateMap,
        inActiveBgCellColor: 'bg-inactive',
        dateFormat: 'YYYY/MM/DD',
      },
    })

    const emptyCell = wrapper.find('[data-date="2024/11/09"] .bg-inactive')
    expect(emptyCell.exists()).toBe(true)
  })

  it('renders custom slot content for dates and time slots', () => {
    const wrapper = mount(ScrollableDateTable, {
      props: {
        startDate: '2024/11/08',
        endDate: '2024/11/14',
        timeSlotDateMap: mockTimeSlotDateMap,
        dateFormat: 'YYYY/MM/DD',
      },
      slots: {
        date: ({ dayjsObj }) => `<span class="custom-date">${dayjsObj.format('MM/DD')}</span>`,
        timeSlot: ({ startTime, endTime }) =>
          `<span class="custom-time-slot">${startTime} - ${endTime}</span>`,
      },
    })

    const customDateHtml = wrapper.find('[data-date="2024/11/08"]').html()
    const decodedCustomDateHtml = customDateHtml.replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    expect(decodedCustomDateHtml).toContain('<span class="custom-date">11/08</span>')

    const customTimeSlotHtml = wrapper.find('[data-date="2024/11/08"]').html()
    const decodedCustomTimeSlotHtml = customTimeSlotHtml.replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    expect(decodedCustomTimeSlotHtml).toContain(
      '<span class="custom-time-slot">08:00 - 08:30</span>',
    )
  })

  it('syncs header border width on resize', async () => {
    const wrapper = mount(ScrollableDateTable, {
      props: {
        startDate: '2024/11/08',
        endDate: '2024/11/14',
        timeSlotDateMap: mockTimeSlotDateMap,
        dateFormat: 'YYYY/MM/DD',
      },
    })

    const table = wrapper.find('table').element as HTMLElement
    const headerBorder = wrapper.find('.scrollable-date-table__header-border')
      .element as HTMLElement

    // 使用 Object.defineProperty 模擬 offsetWidth
    Object.defineProperty(table, 'offsetWidth', {
      value: 100,
      configurable: true, // 必須設為 true 以便後續可以修改
    })

    window.dispatchEvent(new Event('resize'))

    await nextTick()
    expect(headerBorder.style.width).toBe('84px')
  })
})
