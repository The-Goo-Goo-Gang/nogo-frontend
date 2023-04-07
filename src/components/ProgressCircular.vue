<template>
  <div class="loader" :style="computedStyle">
    <svg class="circular" viewBox="0 0 50 50">
      <circle cx="25" cy="25" r="20" fill="none" stroke="#106CFA" stroke-width="5%" stroke-linecap="round" />
    </svg>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  size?: string
}>(), {
  size: '1em'
})

const computedStyle = computed(() => {
  return {
    width: props.size,
    height: props.size
  }
})
</script>

<style lang="scss">
.loader {
  position: relative;

  &:before {
    content: '';
    display: block;
    padding-top: 100%;
  }

  .circular {
    position: absolute;
    top: 0;
    left: 0;
    animation: rotate 2s linear infinite;
  }

  circle {
    animation: circle-dash 1.5s ease-in-out infinite;
  }
}

@keyframes circle-dash {
  0% {
    stroke-dasharray: 1, 125;
    stroke-dashoffset: 0;
  }

  50% {
    stroke-dasharray: 100, 125;
    stroke-dashoffset: -25px;
  }

  100% {
    stroke-dasharray: 100, 125;
    stroke-dashoffset: -125px;
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}</style>
