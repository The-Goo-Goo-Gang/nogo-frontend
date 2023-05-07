<template>
  <div class="progress">
    <div class="progress-content" :style="progressStyle"></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  progress: number,
  min?: number,
  max?: number,
}>(), {
  min: 0,
  max: 100
})

const progressStyle = computed(() => {
  return {
    maxWidth: `${(props.progress - props.min) / (props.max - props.min) * 100}%`
  }
})
</script>

<style lang="scss">
.progress {
  height: 4px;
  background-color: rgba($color: #FFFFFF, $alpha: 0.25);
  border-radius: 2px;
}

.progress-content {
  // transition: max-width ease .3s;
  height: 100%;
  background-color: #FFFFFF;
  border-radius: 2px;
}
</style>
