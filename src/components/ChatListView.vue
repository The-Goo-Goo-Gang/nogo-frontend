<template>
  <div class="chat-list">
    <TitleBar :title="currentChatTarget ? currentChatTarget : '聊天'" @back="chatBack">
      <template #back-icon v-if="!currentChatTarget">
        <CloseIcon class="icon-2x" />
      </template>
    </TitleBar>
    <div class="chat-list-content">
      <template v-if="!currentChatTarget">
        <template v-if="store.state.chat_messages.size">
          <div class="chat-list-content-item" v-for="([target, messages]) in store.state.chat_messages" :key="target"
            @click="currentChatTarget = target">
            <div class="chat-list-content-item-title">{{ target }}</div>
            <div class="chat-list-content-item-content">
              {{ messages[0]?.content || '暂无消息' }}
            </div>
          </div>
        </template>
        <template v-else>
          <div class="chat-list-empty">
            暂无聊天
          </div>
        </template>
      </template>
      <template v-else>
        <ChatView class="chat-view" :target="currentChatTarget" ref="chatView" />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import TitleBar from '@/components/TitleBar.vue'
import ChatView from '@/components/ChatView.vue'
import CloseIcon from 'vue-material-design-icons/Close.vue'
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useStore } from '@/store'
import { OpCode } from '@/const'

const store = useStore()
const emit = defineEmits(['close'])
const chatView = ref<InstanceType<typeof ChatView> | null>(null)

const listenerId = ref(-1)
const currentChatTarget = ref('')
const chatBack = () => {
  if (currentChatTarget.value) {
    currentChatTarget.value = ''
  } else {
    emit('close')
  }
}

const openChat = (target: string, scrollToBottom = true) => {
  currentChatTarget.value = target
  if (scrollToBottom) {
    nextTick(() => {
      chatView.value?.scrollToBottom()
    })
  }
}

onMounted(() => {
  listenerId.value = window.electronAPI.onReceiveOp(OpCode.CHAT_USERNAME_UPDATE_OP, (oldUsername?: string, newUsername?: string) => {
    if (oldUsername && newUsername && oldUsername === currentChatTarget.value) {
      currentChatTarget.value = newUsername
    }
  })
})
onUnmounted(() => {
  if (listenerId.value !== -1) window.electronAPI.removeOnDataListener(listenerId.value)
})

defineExpose({ openChat, currentChatTarget })
</script>

<style lang="scss">
@import '@/styles/utils.scss';

.chat-list {
  padding: 2px 8px 8px 8px;
  background: #fff;
  border-radius: 16px;
  z-index: 100;
  transition: transform 0.2s ease-in-out;

  .chat-list-title {
    height: 50px;
    line-height: 50px;
    text-align: center;
    font-size: 20px;
    font-weight: bold;
    border-bottom: 1px solid #eee;
  }

  .chat-list-content {
    height: calc(100% - 50px);
    overflow-y: auto;
    padding: 0 8px;
    @include scrollbar-style;
  }

  .chat-list-empty {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    font-size: 16px;
    color: #666;
  }

  .chat-list-content-item {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    padding: 8px;
    transition: all 0.2s ease-in-out;
    border-radius: 8px;
    cursor: pointer;

    &:hover {
      background-color: rgba(0, 0, 0, 0.1);
    }

    &:active {
      background-color: rgba(0, 0, 0, 0.2);
      transform: scale(0.98);
    }

    &::after {
      content: '';
      display: block;
      position: relative;
      top: 9px;
      width: 100%;
      height: 1px;
      background-color: #eee;
    }

    &:last-child::after {
      display: none;
    }

    &:not(:first-child) {
      margin-top: 1px;
    }

    .chat-list-content-item-title {
      font-size: 16px;
      font-weight: bold;
    }

    .chat-list-content-item-content {
      margin-top: 5px;
      font-size: 14px;
      color: #666;
    }
  }
}
</style>

<style lang="scss" scoped>
.chat-view {
  height: calc(100% - 48px);
  background: none;
}
</style>
