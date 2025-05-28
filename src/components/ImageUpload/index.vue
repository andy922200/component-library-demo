<script setup lang="ts">
import heicConvert from 'heic-convert/browser'
import { computed, onBeforeUnmount, ref } from 'vue'

const props = withDefaults(
  defineProps<{
    modelValue?: File | null
    showImage?: boolean
    imageAltStr?: string
    wrapperClass?: string
    defaultMsg?: string
    maxSizeInMB?: number
    acceptImgTypes?: string[]
  }>(),
  {
    modelValue: null,
    showImage: false,
    imageAltStr: 'preview',
    wrapperClass: '',
    defaultMsg: 'Drag or Click here',
    maxSizeInMB: 2,
    acceptImgTypes: () => ['*'],
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', file: File | undefined | null): void
  (
    e: 'upload',
    payload: {
      name: string
      size: number
      type: string
      previewUrl: string
      raw: File
      isOverSize: boolean
    } | null,
  ): void
  (e: 'remove'): void
}>()

const file = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})
const maxSizeInBytes = computed(() => props.maxSizeInMB * 1024 * 1024)
const acceptTypes = computed(() => {
  if (props.acceptImgTypes.length === 0 || props.acceptImgTypes.includes('*')) return 'image/*'

  const validImgTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg', 'heic', 'heif']

  return validImgTypes.filter((i) => props.acceptImgTypes.includes(i)).join(',')
})

const fileInput = ref<HTMLInputElement | null>(null)
const previewUrl = ref('')
const isUploading = ref(false)
const hintMsg = ref(props.defaultMsg)

const triggerInput = () => {
  fileInput.value?.click()
}

const resetHintMsg = () => {
  hintMsg.value = props.defaultMsg
}

const handleFileChange = async (e: Event) => {
  const input = e.target as HTMLInputElement
  const selectedFile = input.files?.[0]
  if (selectedFile) {
    await loadFile(selectedFile)
  }
}

const handleDrop = async (e: DragEvent) => {
  const dropped = e.dataTransfer?.files?.[0]
  if (dropped) {
    await loadFile(dropped)
  }
}

const triggerPreviewUrl = ({
  file,
  isReset = false,
}: {
  file?: File | null | undefined
  isReset?: boolean
}) => {
  if (isReset) {
    URL.revokeObjectURL(previewUrl.value)
    previewUrl.value = ''
    return ''
  }

  if (!file) return ''

  return URL.createObjectURL(file)
}

const checkFileIsOversized = (targetFile: File) => {
  if (targetFile.size > maxSizeInBytes.value) {
    emit('upload', {
      name: targetFile.name,
      size: targetFile.size,
      type: targetFile.type,
      previewUrl: '',
      raw: targetFile,
      isOverSize: true,
    })
    return true
  }
  return false
}

const transformHeic2jpg = async (targetFile: File) => {
  let convertedFile: File | null = null

  if (targetFile.type === 'image/heic' || targetFile.type === 'image/heif') {
    try {
      const arrayBuffer = await targetFile.arrayBuffer()
      const blob = await heicConvert({
        buffer: arrayBuffer,
        format: 'JPEG',
        quality: 1,
      })

      if (blob instanceof Blob) {
        convertedFile = new File([blob], targetFile.name.replace(/\.heic|\.heif$/i, '.jpg'), {
          type: 'image/jpeg',
          lastModified: targetFile.lastModified,
        })
      } else {
        console.error('HEIC/HEIF conversion failed: Unexpected result')
      }
    } catch (error) {
      console.error('HEIC/HEIF conversion failed:', error)
    }
  }

  return convertedFile ?? targetFile
}

const loadFile = async (selected: File) => {
  const isFileTypeAccepted = acceptTypes.value.split(',').some((type) => {
    if (type === 'image/*') return true
    return selected.type.split('/')[1] === type
  })

  if (!isFileTypeAccepted) return false

  let convertedFile: File = await transformHeic2jpg(selected)

  const isOverSize = checkFileIsOversized(convertedFile)

  if (isOverSize) {
    isUploading.value = false
    hintMsg.value = `File size exceeds ${props.maxSizeInMB} MB`

    await new Promise((resolve) => setTimeout(resolve, 3000))
    resetHintMsg()
    return true
  }

  isUploading.value = true
  triggerPreviewUrl({ isReset: true })

  file.value = convertedFile

  const url = triggerPreviewUrl({ file: convertedFile })
  previewUrl.value = url

  emit('upload', {
    name: convertedFile.name,
    size: convertedFile.size,
    type: convertedFile.type,
    previewUrl: url,
    raw: convertedFile,
    isOverSize: false,
  })

  isUploading.value = false
  return true
}

const remove = async () => {
  triggerPreviewUrl({ isReset: true })
  file.value = null
  emit('upload', null)
  emit('remove')
}

onBeforeUnmount(() => {
  if (file.value) {
    triggerPreviewUrl({ isReset: true })
  }
})
</script>

<template>
  <div
    class="image-upload cursor-pointer border border-dashed text-center"
    :class="[wrapperClass]"
    @click="triggerInput"
    @dragover.prevent
    @drop.prevent="handleDrop"
  >
    <input
      ref="fileInput"
      type="file"
      :accept="acceptTypes"
      class="hidden"
      @click.stop
      @change="handleFileChange"
    />

    <div v-if="isUploading" class="p-6">
      <slot name="uploading">
        <p class="text-gray-500">Uploading...</p>
      </slot>
    </div>

    <div v-if="!file && !isUploading" class="p-6">
      <slot name="initial-msg">
        {{ hintMsg }}
      </slot>
    </div>

    <div v-if="file && !isUploading" class="relative p-6">
      <button class="absolute right-0 top-0 px-2 py-1 text-red-500" @click.stop="remove">X</button>

      <div class="p-1">
        <slot name="img-preview">
          <div v-if="showImage" class="mx-auto">
            <img :src="previewUrl" :alt="imageAltStr" class="h-auto max-w-full" />
          </div>
        </slot>
      </div>

      <slot name="file-name-preview">
        <div v-if="!showImage" class="mx-auto">
          <p>{{ file.name }}</p>
        </div>
      </slot>
    </div>
  </div>
</template>
