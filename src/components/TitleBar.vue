<template>
  <div class="title-bar">
    <div v-if="showBack" class="title-bar-back-btn" @click="back">
      <slot name="back-icon">
        <BackIcon class="icon-2x" />
      </slot>
    </div>
    <h3 class="title-bar-title">{{ title }}</h3>
  </div>
</template>

<script setup lang="ts">
import BackIcon from 'vue-material-design-icons/ArrowLeft.vue'

withDefaults(defineProps<{
  title: string,
  showBack?: boolean
}>(), {
  showBack: true
})

const emit = defineEmits(['back'])

const back = () => {
  emit('back')
}
</script>

<style lang="scss">
.title-bar {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  padding-right: 16px;
  gap: 16px;
}

.title-bar-back-btn {
  border: 0;
  background: none;
  padding: 8px;
  border-radius: 8px;
  transition: background 0.3s ease, color 0.3s ease;

  &:hover {
    background: rgba(0, 0, 0, 0.1);
  }

  &:active {
    background: rgba(0, 0, 0, 0.2);
  }
}
</style>
