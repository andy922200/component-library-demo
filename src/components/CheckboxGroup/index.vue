<script setup lang="ts">
import { computed, PropType } from 'vue'

import BaseCheckbox from '@/components/BaseCheckbox/index.vue'

import { CheckboxGroupOption, CheckboxGroupOptionMap, CheckboxGroupStyle } from './type'

const props = defineProps({
  optionMap: {
    type: Object as PropType<CheckboxGroupOptionMap>,
    default: () => ({
      id: '',
      data: [],
    }),
  },
  optionStyle: {
    type: Object as PropType<CheckboxGroupStyle>,
    default: () => ({
      bgColor: '',
      checkedBgColor: '',
      checkedBorderColor: '',
      defaultMarkIconColor: '',
    }),
  },
  groupWrapperClass: {
    type: String as PropType<string>,
    default: '',
  },
  fatherClass: {
    type: String as PropType<string>,
    default: '',
  },
  childrenAreaClass: {
    type: String as PropType<string>,
    default: '',
  },
  childrenClass: {
    type: String as PropType<string>,
    default: '',
  },
  isOriginalChecked: {
    type: Boolean as PropType<boolean>,
    default: false,
  },
})

const emits = defineEmits<{
  'update:father-option-change': [value: { checked: boolean; options: CheckboxGroupOption }]
  'update:children-option-change': [
    value: {
      fatherOption: CheckboxGroupOption
      options: CheckboxGroupOption[]
      checkedOptions: CheckboxGroupOption[]
    },
  ]
}>()

const { bgColor, checkedBgColor, checkedBorderColor, defaultMarkIconColor } = props.optionStyle

const fatherOption = computed(() =>
  props.optionMap.data.filter((option: CheckboxGroupOption) => option.isFather),
)

const childrenOptions = computed(() =>
  props.optionMap.data.filter((option: CheckboxGroupOption) => !option.isFather),
)

const fatherOptionChange = (value: boolean) => {
  childrenOptions.value.forEach((item) => {
    item.checked = value
  })
  emits('update:father-option-change', {
    checked: fatherOption.value[0].checked,
    options: fatherOption.value[0],
  })
}

const childrenOptionChange = () => {
  fatherOption.value[0].checked = childrenOptions.value.some((item) => item.checked)
  emits('update:children-option-change', {
    fatherOption: fatherOption.value[0],
    options: childrenOptions.value,
    checkedOptions: childrenOptions.value.filter((item) => item.checked),
  })
}

defineOptions({
  name: 'CheckboxGroup',
})
</script>

<template>
  <div class="checkbox-group__wrapper flex flex-wrap" :class="groupWrapperClass">
    <div class="checkbox-group__father w-full" :class="fatherClass">
      <template v-if="props.isOriginalChecked">
        <div class="base-original-checkbox__wrapper flex">
          <input
            :id="fatherOption[0]?.value"
            v-model="fatherOption[0].checked"
            type="checkbox"
            class="mr-2 cursor-pointer rounded p-2 focus:outline-0 focus:ring-0 focus:ring-offset-0"
            @change="() => fatherOptionChange(fatherOption[0].checked)"
          />
          <label :for="fatherOption[0]?.value" class="cursor-pointer">
            {{ fatherOption[0]?.name }}
          </label>
        </div>
      </template>

      <template v-else>
        <BaseCheckbox
          v-model="fatherOption[0].checked"
          :bg-color="bgColor"
          :checked-bg-color="checkedBgColor"
          :checked-border-color="checkedBorderColor"
          :default-mark-icon-color="defaultMarkIconColor"
          :data-value="fatherOption[0].value"
          @change="fatherOptionChange"
        >
          {{ fatherOption[0]?.name }}
        </BaseCheckbox>
      </template>
    </div>
    <div
      class="checkbox-group__children-area disabled flex w-full flex-wrap"
      :class="childrenAreaClass"
    >
      <div
        v-for="item in childrenOptions"
        :key="item.id"
        class="checkbox-group__child"
        :class="childrenClass"
      >
        <template v-if="props.isOriginalChecked">
          <div class="base-original-checkbox__wrapper flex">
            <input
              :id="item.id"
              v-model="item.checked"
              type="checkbox"
              class="mr-2 rounded p-2 focus:outline-0 focus:ring-0 focus:ring-offset-0"
              :class="{
                'cursor-not-allowed border-[#ddd] bg-[#eee] opacity-60': !fatherOption[0].checked,
                'cursor-pointer': fatherOption[0].checked,
              }"
              :disabled="!fatherOption[0].checked"
              @change="childrenOptionChange"
            />
            <label
              :for="item.id"
              :class="{
                'cursor-not-allowed opacity-60': !fatherOption[0].checked,
                'cursor-pointer': fatherOption[0].checked,
              }"
            >
              {{ item.name }}
            </label>
          </div>
        </template>

        <template v-else>
          <BaseCheckbox
            v-model="item.checked"
            :bg-color="bgColor"
            :checked-bg-color="checkedBgColor"
            :checked-border-color="checkedBorderColor"
            :default-mark-icon-color="defaultMarkIconColor"
            :disabled="!fatherOption[0].checked"
            :data-value="item.value"
            @change="childrenOptionChange"
          >
            {{ item.name }}
          </BaseCheckbox>
        </template>
      </div>
    </div>
  </div>
</template>
