import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import ImageUpload from '@/components/ImageUpload/index.vue'

const createFile = (name: string, sizeInMB: number, type = 'image/png') => {
  const blob = new Blob(['a'.repeat(sizeInMB * 1024 * 1024)], { type })
  return new File([blob], name, { type })
}

const setInputFileAndTriggerChange = async (inputEl: HTMLInputElement, file: File) => {
  Object.defineProperty(inputEl, 'files', {
    value: [file],
    writable: false,
  })

  const event = new Event('change', { bubbles: true })
  inputEl.dispatchEvent(event)
}

describe('ImageUpload.vue', () => {
  it('should emit upload when the file is not oversized', async () => {
    const wrapper = mount(ImageUpload, {
      props: {
        maxSizeInMB: 1,
      },
    })

    const file = createFile('valid.png', 0.5)
    const inputEl = wrapper.find('input[type="file"]').element as HTMLInputElement

    await setInputFileAndTriggerChange(inputEl, file)

    const uploadEvents = wrapper.emitted('upload')
    expect(uploadEvents).toBeTruthy()
    expect(uploadEvents?.[0][0]).toMatchObject({
      name: 'valid.png',
      isOverSize: false,
    })
  })

  it('should emit fail when the file is oversized', async () => {
    const wrapper = mount(ImageUpload, {
      props: {
        maxSizeInMB: 1,
      },
    })

    const bigFile = createFile('large.png', 2)
    const inputEl = wrapper.find('input[type="file"]').element as HTMLInputElement

    await setInputFileAndTriggerChange(inputEl, bigFile)

    const uploadEvents = wrapper.emitted('upload')
    expect(uploadEvents).toBeTruthy()
    expect(uploadEvents?.[0][0]).toMatchObject({
      name: 'large.png',
      isOverSize: true,
      previewUrl: '',
    })
  })

  it('should trigger input click when upload area is clicked', async () => {
    const wrapper = mount(ImageUpload)
    const inputEl = wrapper.find('input[type="file"]').element as HTMLInputElement
    const clickSpy = vi.spyOn(inputEl, 'click')

    await wrapper.find('.image-upload').trigger('click')

    expect(clickSpy).toHaveBeenCalledOnce()
  })

  it('should emit upload when a file is dropped', async () => {
    const wrapper = mount(ImageUpload, {
      props: { maxSizeInMB: 1 },
    })

    const file = new File(['mock'], 'drop.png', { type: 'image/png' })

    // 模擬 DragEvent 並手動加上 dataTransfer.files
    const dropZone = wrapper.find('.image-upload')
    const dropEvent = new Event('drop', { bubbles: true }) as DragEvent
    Object.defineProperty(dropEvent, 'dataTransfer', {
      value: {
        files: [file],
      },
    })

    dropZone.element.dispatchEvent(dropEvent)

    await wrapper.vm.$nextTick() // 更新 transformHeic2jpg 結果

    const uploadEvents = wrapper.emitted('upload')
    expect(uploadEvents).toBeTruthy()
    expect(uploadEvents?.[0][0]).toMatchObject({
      name: 'drop.png',
      isOverSize: false,
    })
  })

  it('should use acceptTypes prop correctly', () => {
    const wrapper = mount(ImageUpload, {
      props: {
        acceptImgTypes: ['png', 'jpeg'],
      },
    })
    const inputEl = wrapper.find('input[type="file"]')
    expect(inputEl.attributes('accept')).toBe('jpeg,png')
  })

  it('should fallback to image/* when acceptImgTypes is empty or ["*"]', () => {
    const wrapper1 = mount(ImageUpload, {
      props: { acceptImgTypes: [] },
    })
    const wrapper2 = mount(ImageUpload, {
      props: { acceptImgTypes: ['*'] },
    })
    expect(wrapper1.find('input[type="file"]').attributes('accept')).toBe('image/*')
    expect(wrapper2.find('input[type="file"]').attributes('accept')).toBe('image/*')
  })

  it('should skip file if not in acceptImgTypes', async () => {
    const wrapper = mount(ImageUpload, {
      props: {
        acceptImgTypes: ['png'],
        maxSizeInMB: 1,
      },
    })
    const file = new File(['mock'], 'not-allowed.gif', { type: 'image/gif' })

    const inputEl = wrapper.find('input[type="file"]').element as HTMLInputElement
    Object.defineProperty(inputEl, 'files', {
      value: [file],
      writable: false,
    })

    inputEl.dispatchEvent(new Event('change', { bubbles: true }))
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('upload')).toBeFalsy()
  })

  it('should convert heic/heif file to jpeg and emit upload', async () => {
    const wrapper = mount(ImageUpload, {
      props: { maxSizeInMB: 1 },
    })

    vi.mock('heic-convert/browser', () => ({
      default: vi.fn().mockResolvedValue(new Blob(['mock'], { type: 'image/jpeg' })),
    }))

    const heicFile = new File(['mock content for heic'], 'test.heic', { type: 'image/heic' })
    Object.defineProperty(heicFile, 'arrayBuffer', {
      value: async () => new ArrayBuffer(8),
      writable: true,
      configurable: true,
    })

    const inputEl = wrapper.find('input[type="file"]').element as HTMLInputElement
    Object.defineProperty(inputEl, 'files', {
      value: [heicFile],
      writable: false,
    })
    inputEl.dispatchEvent(new Event('change', { bubbles: true }))

    await wrapper.vm.$nextTick()
    await flushPromises()

    const uploadEvents = wrapper.emitted('upload')

    expect(uploadEvents?.[0][0]).toMatchObject({
      name: 'test.jpg',
      type: 'image/jpeg',
      isOverSize: false,
    })
  })

  it('should emit remove and reset file state', async () => {
    const wrapper = mount(ImageUpload, {
      props: {
        modelValue: createFile('remove.png', 0.1),
        showImage: true,
      },
    })

    const removeBtn = wrapper.find('button')
    await removeBtn.trigger('click')

    expect(wrapper.emitted('remove')).toBeTruthy()
    expect(wrapper.emitted('upload')).toContainEqual([null])
  })

  it('should render custom initial-msg slot', () => {
    const wrapper = mount(ImageUpload, {
      slots: {
        'initial-msg': '<div class="custom-msg">自定義提示文字</div>',
      },
    })

    expect(wrapper.find('.custom-msg').exists()).toBe(true)
    expect(wrapper.text()).toContain('自定義提示文字')
  })

  it('should render custom img-preview slot when showImage is true and file exists', () => {
    const mockFile = new File(['mock'], 'preview.png', { type: 'image/png' })
    const wrapper = mount(ImageUpload, {
      props: {
        modelValue: mockFile,
        showImage: true,
      },
      slots: {
        'img-preview': '<div class="custom-preview">圖片插槽內容</div>',
      },
    })

    expect(wrapper.find('.custom-preview').exists()).toBe(true)
    expect(wrapper.text()).toContain('圖片插槽內容')
  })

  it('should render custom file-name-preview slot when showImage is false and file exists', () => {
    const mockFile = new File(['mock'], 'preview.png', { type: 'image/png' })
    const wrapper = mount(ImageUpload, {
      props: {
        modelValue: mockFile,
        showImage: false,
      },
      slots: {
        'file-name-preview': '<div class="custom-name">檔名插槽</div>',
      },
    })

    expect(wrapper.find('.custom-name').exists()).toBe(true)
    expect(wrapper.text()).toContain('檔名插槽')
  })
})
