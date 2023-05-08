<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <Teleport to="#alert-container">
    <transition name="slide-fade" @after-leave="vanish">
      <div class="alert" v-show="show">
        <div class="alert-title">{{ title }}</div>
        <div class="alert-content">
          <!-- 插入自定义插槽, 这里判断默认插槽有没有使用 -->
          <!-- 如果使用, 则渲染插槽, 如果没有, 则渲染 content -->
          <slot v-if="$slots['default']" />
          <template v-else>{{ content }}</template>
        </div>
        <div class="alert-actions" v-if="showActions">
          <button class="game-action-btn fill" @click="onConfirm">{{ positiveButtonText }}</button>
          <button class="game-action-btn" @click="onNeutralClicked" v-if="!!neutralButtonText">{{ neutralButtonText
          }}</button>
          <button class="game-action-btn" @click="close">{{ negativeButtonText }}</button>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup lang="ts">
import { isRef, computed, nextTick } from 'vue'
import { props } from './props'

const mProps = defineProps(props)
const emit = defineEmits(['update:modelValue', 'close', 'confirm', 'neutralClicked'])

const modelValue = computed({
  get: () => mProps.modelValue,
  set: () => emit('update:modelValue')
})

const showActions = computed(() => mProps.negativeButtonText || mProps.positiveButtonText)
const show = isRef(mProps.modelValue) ? mProps.modelValue : modelValue

if (show.value) {
  show.value = false
  nextTick(() => {
    show.value = true
  })
}

const onNeutralClicked = () => {
  emit('neutralClicked')
  show.value = false
}

const close = () => {
  props.reject?.()
  emit('close')
  show.value = false
}

// 确定事件, 调用 resolve, 为了兼容模板上直接使用组件, 还要在调用一次 confirm 事件
const onConfirm = () => {
  props.resolve?.()
  emit('confirm')
  show.value = false
}

if (mProps.timeout) {
  setTimeout(() => {
    close()
  }, mProps.timeout)
}

defineExpose({
  show,
  close
})
</script>

<style lang="scss">
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.2s ease-in-out;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

.slide-fade-enter-to,
.slide-fade-leave-from {
  opacity: 1;
}

.alert {
  margin: 16px;
  padding: 16px;
  background-color: rgba(255, 255, 255, 0.7);
  border-radius: 8px;
  backdrop-filter: blur(16px);

  .alert-title {
    padding: 10px 0;
    font-size: 18px;
    font-weight: bold;
  }

  .alert-content {
    padding: 10px 0;
    font-size: 15px;
    opacity: 0.85;
  }

  .alert-actions {
    display: flex;
    justify-content: end;
    cursor: pointer;
    flex-direction: row-reverse;
    gap: 8px;
  }
}
</style>
