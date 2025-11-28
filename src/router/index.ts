import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'index',
    component: () => import('../views/TimeSelector.vue'),
  },
  {
    path: '/calendar',
    name: 'calendar',
    component: () => import('../views/Calendar.vue'),
  },
  {
    path: '/selector',
    name: 'selector',
    component: () => import('../views/Selector.vue'),
  },
  {
    path: '/checkbox',
    name: 'checkbox',
    component: () => import('../views/Checkbox.vue'),
  },
  {
    path: '/checkbox-group',
    name: 'checkbox-group',
    component: () => import('../views/CheckboxGroup.vue'),
  },
  {
    path: '/radio-checkbox-group',
    name: 'radio-checkbox-group',
    component: () => import('../views/RadioCheckboxGroup.vue'),
  },
  {
    path: '/input',
    name: 'input',
    component: () => import('../views/Input.vue'),
  },
  {
    path: '/tooltip',
    name: 'tooltip',
    component: () => import('../views/Tooltip.vue'),
  },
  {
    path: '/spinner',
    name: 'spinner',
    component: () => import('../views/Spinner.vue'),
  },
  {
    path: '/backdrop',
    name: 'backdrop',
    component: () => import('../views/Backdrop.vue'),
  },
  {
    path: '/pagination-buttons',
    name: 'pagination-buttons',
    component: () => import('../views/PaginationButtons.vue'),
  },
  {
    path: '/pagination-info',
    name: 'pagination-info',
    component: () => import('../views/PaginationInfo.vue'),
  },
  {
    path: '/div-table',
    name: 'div-table',
    component: () => import('../views/DivTable.vue'),
  },
  {
    path: '/switch',
    name: 'switch',
    component: () => import('../views/Switch.vue'),
  },
  {
    path: '/tag',
    name: 'tag',
    component: () => import('../views/Tag.vue'),
  },
  {
    path: '/tree-view',
    name: 'tree-view',
    component: () => import('../views/TreeView.vue'),
  },
  {
    path: '/expansion',
    name: 'expansion',
    component: () => import('../views/Expansion.vue'),
  },
  {
    path: '/time-slots',
    name: 'time-slots',
    component: () => import('../views/TimeSlots.vue'),
  },
  {
    path: '/radio-group',
    name: 'radio-group',
    component: () => import('../views/RadioGroup.vue'),
  },
  {
    path: '/recur-time-selector',
    name: 'recur-time-selector',
    component: () => import('../views/RecurTimeSelector.vue'),
  },
  {
    path: '/swiper',
    name: 'swiper',
    component: () => import('../views/Swiper.vue'),
  },
  {
    path: '/full-calendar-with-tooltip',
    name: 'full-calendar-with-tooltip',
    component: () => import('../views/FullCalendarWithTooltip.vue'),
  },
  {
    path: '/scrollable-date-table',
    name: 'scrollable-date-table',
    component: () => import('../views/ScrollableDateTable.vue'),
  },
  {
    path: '/textarea',
    name: 'textarea',
    component: () => import('../views/Textarea.vue'),
  },
  {
    path: '/button-group',
    name: 'button-group',
    component: () => import('../views/ButtonGroup.vue'),
  },
  {
    path: '/image-upload',
    name: 'image-upload',
    component: () => import('../views/ImageUpload.vue'),
  },
  {
    path: '/color-picker',
    name: 'color-picker',
    component: () => import('../views/ColorPicker.vue'),
  },
  {
    path: '/payment-strategies',
    name: 'payment-strategies',
    component: () => import('../views/PaymentStrategies.vue'),
  },
  {
    path: '/invoice-info',
    name: 'invoice-info',
    component: () => import('../views/InvoiceInfo.vue'),
  },
  {
    path: '/promo-coupon',
    name: 'promo-coupon',
    component: () => import('../views/PromoCoupon.vue'),
  },
  {
    path: '/multi-select',
    name: 'multi-select',
    component: () => import('../views/MultiSelect.vue'),
  },
]

const baseURL = process.env.NODE_ENV === 'production' ? '/component-library-demo/' : ''
const Router = createRouter({
  history: createWebHashHistory(baseURL),
  linkExactActiveClass: 'active',
  routes,
})

export default Router
