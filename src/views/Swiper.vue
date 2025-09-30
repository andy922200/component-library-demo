<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'

import { useSwiper } from '@/composables/useSwiper'

const slides = ref<Record<string, any>[]>([])

const { initSwiper, updateSwiper } = useSwiper({
  dom: '.swiper-container',
})

onMounted(async () => {
  initSwiper()

  await new Promise((resolve) => setTimeout(resolve, 200))

  slides.value = [
    { id: 1, src: 'https://picsum.photos/1024/576?random=1', title: 'Slide 1' },
    { id: 2, src: 'https://picsum.photos/1024/576?random=2', title: 'Slide 2' },
    { id: 3, src: 'https://picsum.photos/1024/576?random=3', title: 'Slide 3' },
    { id: 4, src: 'https://picsum.photos/1024/576?random=4', title: 'Slide 4' },
  ]
})

watch(slides, () => {
  updateSwiper()
})
</script>

<template>
  <div class="swiper-container relative h-auto w-full overflow-hidden rounded-md lg:max-w-[800px]">
    <div class="swiper-wrapper">
      <div
        v-for="slide in slides"
        :key="slide.id"
        class="swiper-slide flex items-center justify-center"
      >
        <img
          :src="slide.src"
          :alt="slide.title"
          class="mx-auto my-0 block aspect-video h-auto w-full object-cover"
        />
      </div>
    </div>
    <div class="swiper-button-next !text-green-500" />
    <div class="swiper-button-prev !text-green-500" />
  </div>
</template>
