<script setup lang="ts">
const props = defineProps({
  color: {
    type: String,
    default: 'green',
  },
})

defineOptions({
  name: 'Spinner',
})
</script>

<template>
  <div class="lds-spinner" :style="{ '--spinner-color': props.color }">
    <div />
    <div />
    <div />
    <div />
    <div />
    <div />
    <div />
    <div />
    <div />
    <div />
    <div />
    <div />
  </div>
</template>

<style scoped lang="scss">
@keyframes lds-spinner {
  0% {
    opacity: 1;
  }

  100% {
    opacity: 0;
  }
}

.lds-spinner {
  position: relative;
  display: inline-block;
  width: 80px;
  height: 80px;

  div {
    animation: lds-spinner 1.2s linear infinite;
    transform-origin: 40px 40px;

    &:after {
      position: absolute;
      top: 3px;
      left: 37px;
      display: block;
      width: 6px;
      height: 18px;
      border-radius: 20%;
      background: var(--spinner-color);
      content: ' ';
    }

    &:nth-child(1) {
      animation-delay: -1.1s;
      transform: rotate(0deg);
    }

    &:nth-child(2) {
      animation-delay: -1s;
      transform: rotate(30deg);
    }

    &:nth-child(3) {
      animation-delay: -0.9s;
      transform: rotate(60deg);
    }

    &:nth-child(4) {
      animation-delay: -0.8s;
      transform: rotate(90deg);
    }

    &:nth-child(5) {
      animation-delay: -0.7s;
      transform: rotate(120deg);
    }

    &:nth-child(6) {
      animation-delay: -0.6s;
      transform: rotate(150deg);
    }

    &:nth-child(7) {
      animation-delay: -0.5s;
      transform: rotate(180deg);
    }

    &:nth-child(8) {
      animation-delay: -0.4s;
      transform: rotate(210deg);
    }

    &:nth-child(9) {
      animation-delay: -0.3s;
      transform: rotate(240deg);
    }

    &:nth-child(10) {
      animation-delay: -0.2s;
      transform: rotate(270deg);
    }

    &:nth-child(11) {
      animation-delay: -0.1s;
      transform: rotate(300deg);
    }

    &:nth-child(12) {
      animation-delay: 0s;
      transform: rotate(330deg);
    }
  }
}
</style>
