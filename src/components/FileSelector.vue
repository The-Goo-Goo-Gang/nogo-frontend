<template>
  <!-- 实现一个自定义样式的文件选择器 -->
  <label class="file-select">
    <div class="select-button">
      <span v-if="file">已选择文件</span>
      <span v-else>选择文件</span>
    </div>
    <input type="file" @change="handleFileChange" :accept="accept" :multiple="multiple" />
  </label>
</template>

<script setup lang="ts">
const emit = defineEmits(['update:file'])
const props = withDefaults(defineProps<{
  file?: Array<File> | File | null,
  accept?: string,
  multiple?: boolean
}>(), {
  accept: '*/*',
  multiple: false
})
const handleFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (props.multiple) {
    const files = []
    if (target.files) {
      for (let i = 0; i < target.files.length; i++) {
        files.push(target.files[i])
      }
    }
    emit('update:file', files)
  } else {
    const file = target.files?.[0]
    emit('update:file', file)
  }
}
</script>

<style lang="scss">
@import '../styles/variables.scss';

.file-select>.select-button {
  padding: 1rem;

  color: white;
  background-color: $theme-color;

  border-radius: .3rem;

  text-align: center;
  font-weight: bold;
}

/* Don't forget to hide the original file input! */
.file-select>input[type="file"] {
  display: none;
}
</style>
