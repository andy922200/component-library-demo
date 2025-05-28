<script setup lang="ts">
import { ref } from 'vue'

import ImageUpload from '@/components/ImageUpload/index.vue'

const demoFile = ref<File | null>(null)
const demo2File = ref<File | null>(null)

const handleUpload = (
  payload: {
    name: string
    size: number
    type: string
    previewUrl: string
    raw: File
    isOverSize?: boolean
  } | null,
) => {
  if (payload && payload.isOverSize) {
    console.log('File is Over Size', payload.size)
    return
  }

  payload ? console.log('Upload successful:', payload) : console.log('Upload failed or cancelled')
}

defineOptions({
  name: 'DemoImageUpload',
})
</script>

<template>
  <div class="w-full">
    <h1 class="text-center text-lg">Image Upload 圖片上傳</h1>

    <div class="mx-auto my-2 w-60 space-y-4">
      <ImageUpload v-model="demoFile" show-image @upload="handleUpload" />
      <ImageUpload v-model="demo2File" @upload="handleUpload" />
    </div>
  </div>
</template>
