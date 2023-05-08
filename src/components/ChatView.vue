<template>
  <div class="chat-view">
    <div class="chat-messages">
      <div class="chat-message" v-for="message in chatMessages" :key="message.timestamp">
        <div class="chat-message-sender">{{ message.sender }}</div>
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
import { computed, ref } from 'vue'

const store = useStore()
const props = withDefaults(defineProps<{
  target: string,
  self: string
}>(), {
  self: ''
})

const chatMessages = computed(() => {
  return store.state.chat_messages.get(props.target) || []
})
const chatInput = ref('')
const sendChatMessage = () => {
  store.dispatch('sendChatMessage', { target: props.target, message: chatInput.value })
  chatInput.value = ''
}
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
}

.chat-message {
  display: flex;
  flex-direction: row;
  gap: 8px;
  align-items: center;
  justify-content: flex-start;
  padding: 8px;
  border-radius: 8px;
  background: rgba($color: #FFFFFF, $alpha: 0.5);
  backdrop-filter: blur(0px);
}

.chat-message-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.chat-message-sender {
  font-weight: bold;
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
