<template>
  <div class="chat-view">
    <div class="chat-messages" ref="messages">
      <div class="chat-message" v-for="message in chatMessages" :key="message.timestamp">
        <span class="chat-message-sender">{{ message.sender }}</span>
        <div class="chat-message-content">{{ message.content }}</div>
      </div>
    </div>
    <div class="chat-input">
      <input type="text" class="chat-input-input" placeholder="输入聊天内容" v-model="chatInput"
        @keyup.enter="sendChatMessage" />
      <button class="game-action-btn chat-input-send-btn" @click="sendChatMessage">发送</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useStore } from '@/store'
import { computed, nextTick, reactive, ref, watch } from 'vue'
import { Alert } from './alert/alert'

const store = useStore()
const messages = ref<HTMLDivElement | null>(null)
const props = withDefaults(defineProps<{
  target: string,
  self: string
}>(), {
  self: ''
})

const scrollToBottom = () => {
  if (messages.value) {
    messages.value.scrollTop = messages.value.scrollHeight
  }
}
const animateScrollToBottom = () => {
  if (messages.value) {
    messages.value.scrollTo({
      top: messages.value.scrollHeight,
      behavior: 'smooth'
    })
  }
}

const chatMessages = computed(() => {
  return reactive(store.state.chat_messages.get(props.target) || [])
})
const chatInput = ref('')
const sendChatMessage = () => {
  if (!chatInput.value) {
    Alert({ title: '发送失败', content: '消息不能为空', timeout: 2000 })
    return
  }
  store.dispatch('sendChatMessage', { target: props.target, message: chatInput.value })
  chatInput.value = ''
}

watch(() => chatMessages.value.length, () => {
  console.log('chatMessages changed')
  nextTick(() => {
    animateScrollToBottom()
  })
})

defineExpose({ scrollToBottom, animateScrollToBottom })
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.chat-view {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
  background: rgba($color: #FFFFFF, $alpha: 0.5);
  border-radius: 16px;
  backdrop-filter: blur(16px);
  min-width: 200px;
  overflow-y: auto;
}

.chat-messages {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-start;
  justify-content: flex-start;
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;

  &::-webkit-scrollbar {
    width: 4px;
    transition: all .3s ease-in-out;
    /**/
  }

  &::-webkit-scrollbar-track {
    background-color: 0;
    transition: all .3s ease-in-out;
  }

  &::-webkit-scrollbar-thumb {
    background-color: rgba($color: #000, $alpha: 0.1);
    border-radius: 2px;
    transition: all .3s ease-in-out;
  }

  &::-webkit-scrollbar-thumb:hover {
    background-color: rgba($color: #000, $alpha: 0.25);
    transition: all .3s ease-in-out;
  }

  &::-webkit-scrollbar-corner {
    background-color: 0;
    transition: all .3s ease-in-out;
  }
}

.chat-message {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-start;
  justify-content: flex-start;
  padding: 8px;
  border-radius: 8px;
  background: rgba($color: #FFFFFF, $alpha: 0.5);
  max-width: calc(100% - 32px);
}

.chat-message-content {
  word-break: break-all;
  overflow-wrap: break-word;
  width: 100%;
}

.chat-message-sender {
  font-weight: bold;
  word-break: keep-all;
}

.chat-input {
  display: flex;
  flex-direction: row;
  gap: 8px;
  align-items: center;
  justify-content: flex-start;
  padding: 8px;
  border-radius: 8px;
  background: rgba($color: #FFFFFF, $alpha: 0.5);
  backdrop-filter: blur(0px);

  input[type='text'] {
    border: 1px solid #d3d3d3;
    border-radius: 4px;
    padding: 0.5rem;
    width: 100%;
    transition: all .2s ease;
    outline: none;

    &:focus {
      border-color: $theme-color;
      box-shadow: 0 0 0 2px rgba($color: $theme-color, $alpha: 0.2);
    }
  }

  .chat-input-input {
    flex: 1;
  }
}

.chat-input-send-btn {
  width: 64px;
}
</style>
