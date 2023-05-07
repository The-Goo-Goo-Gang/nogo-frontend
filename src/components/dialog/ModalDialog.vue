<template>
  <teleport to="body">
    <!-- after-leave 组件动画结束时, 调用销毁组件(假如有的话) -->
    <transition name="dialog" @after-leave="vanish">
      <div class="base-model__mask" v-show="show">
        <div class="base-model__content">
          <div class="base-model__title">{{ title }}</div>
          <!-- 插入自定义插槽, 这里判断默认插槽有没有使用 -->
          <!-- 如果使用, 则渲染插槽, 如果没有, 则渲染 content -->
          <slot>{{ content }}</slot>
          <div class="base-model__actions">
            <slot name="actions">
              <button class="game-action-btn" @click="onConfirm">{{ positiveButtonText }}</button>
              <button class="game-action-btn" @click="close">{{ negativeButtonText }}</button>
            </slot>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
import { isRef, computed, nextTick } from 'vue'
import { props } from './props'

const mProps = defineProps(props)
const emit = defineEmits(['update:modelValue', 'close', 'confirm'])

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

defineExpose({
  show,
  close
})
</script>

<style lang="scss">
.dialog-enter-active,
.dialog-leave-active {
  transition: all 0.2s ease-in-out;
}

.dialog-enter-from,
.dialog-leave-to {
  opacity: 0;
  backdrop-filter: blur(16px);
}

.dialog-enter-to,
.dialog-leave-from {
  opacity: 1;
}

.base-model__mask {
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.4);
  z-index: 999;
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  justify-content: center;
  align-items: center;
}

.base-model__content {
  padding: 32px;
  background: rgba($color: #FFFFFF, $alpha: 0.5);
  backdrop-filter: blur(16px);
  border-radius: 16px;
  display: inline;
  text-align: center;
}

.base-model__title {
  font-size: 20px;
  font-weight: bold;
  color: #000000;
  margin-bottom: 16px;
}

.base-model__actions {
  display: flex;
  flex-wrap: nowrap;
  flex-direction: column;
  border-radius: 8px;
}
</style>
