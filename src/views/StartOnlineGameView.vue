<template>
  <div class="game-view">
    <TitleBar title="多人游戏" @back="back" />
    <div class="game-view-form">
      <div class="game-view-form-item">
        <div class="game-view-form-item-title">我的昵称</div>
        <div class="game-view-form-item-content">
          <div class="game-view-form-item-content-item" style="flex: 1">
            <label class="game-view-form-item-content-item-label">
              <input type="text" v-model.lazy="onlineUsername" placeholder="昵称" />
            </label>
          </div>
        </div>
      </div>
      <div class="game-view-form-item">
        <div class="game-view-form-item-title">本机局域网地址</div>
        <div class="game-view-form-item-content">
          <div v-if="realOnlinePort != -1">
            <p v-for="addr in ipAddresses" :key="addr">{{ addr }}:{{ realOnlinePort }}</p>
          </div>
        </div>
      </div>
      <div class="game-view-form-item">
        <div class="game-view-form-item-title">连接到另一个玩家</div>
        <div class="game-view-form-item-content">
          <div class="game-view-form-item-content-item remote-address-inputs">
            <label class="game-view-form-item-content-item-label remote-host-input">
              <input type="text" v-model.lazy="remoteHost" placeholder="IP 地址" />
            </label>
            <label class="game-view-form-item-content-item-label remote-port-input">
              <input type="text" v-model.lazy="remotePort" placeholder="端口" />
            </label>
          </div>
        </div>
        <div class="game-view-form-item-actions">
          <button class="game-action-btn fill" @click="requestRemoteGame(Chess.Black)">申请执黑对局</button>
          <button class="game-action-btn fill" @click="requestRemoteGame(Chess.White)">申请执白对局</button>
        </div>
      </div>
    </div>
  </div>
  <Transition name="slide-into">
    <ChatListView class="chat-list" v-show="showChatList" />
  </Transition>
  <div class="chat-list-btn" @click="showChatList = !showChatList">
    <ChatIcon />
  </div>
</template>

<script setup lang="ts">
import TitleBar from '@/components/TitleBar.vue'
import ChatListView from '@/components/ChatListView.vue'
import ChatIcon from 'vue-material-design-icons/Message.vue'
import { Chess } from '@/const'
import { useQuickRouter } from '@/router/quick'
import { useStore } from '@/store'
import { ref, onMounted, watch, computed, nextTick } from 'vue'
import { useStringConfig } from '@/config'

const { value: onlineUsername } = useStringConfig('onlineUsername')
const { push, back } = useQuickRouter()
const ipAddresses = ref([] as string[])
const realOnlinePort = ref(-1)
const store = useStore()
const showChatList = ref(false)

const remoteHost = ref('')
const remotePort = ref('')
const waitingForConnect = ref(false)
const requestChessType = ref(Chess.None)
const requestRemoteGame = (chessType: Chess) => {
  requestChessType.value = chessType
  if (store.state.remote.is_connected) {
    if (store.state.remote.remote_ip === remoteHost.value && store.state.remote.remote_port === parseInt(remotePort.value)) {
      store.dispatch('requestRemoteGame', { username: onlineUsername.value, chessType: requestChessType.value })
    } else {
      store.dispatch('leaveOnlineGame').then(() => {
        store.dispatch('connectToRemote', {
          host: remoteHost.value,
          port: remotePort.value
        }).then(() => {
          waitingForConnect.value = true
        })
      })
    }
    return
  }
  store.dispatch('connectToRemote', {
    host: remoteHost.value,
    port: remotePort.value
  }).then(() => {
    waitingForConnect.value = true
  })
}

onMounted(() => {
  window.electronAPI.getLocalIpAddresses().then(result => {
    ipAddresses.value = result
  })
  window.electronAPI.getRealOnlinePort().then(result => {
    realOnlinePort.value = result
  })
})

watch(() => waitingForConnect.value && store.state.remote.is_connected, isConnected => {
  if (isConnected && requestChessType.value !== Chess.None) {
    store.dispatch('requestRemoteGame', { username: onlineUsername.value, chessType: requestChessType.value })
  }
})

watch(remoteHost, host => {
  if (host.split(':').length === 2) {
    nextTick(() => {
      remotePort.value = host.split(':')[1]
      remoteHost.value = host.split(':')[0]
    })
  }
})
watch(remotePort, port => {
  if (port.split(':').length === 2) {
    nextTick(() => {
      remotePort.value = port.split(':')[1]
      remoteHost.value = port.split(':')[0]
    })
  }
})

const isGaming = computed(() => store.getters.isGaming)

watch(isGaming, isGaming => {
  if (isGaming) {
    push('/game/online')
  }
})
</script>

<style lang="scss" scoped>
.game-view-form-item-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
  gap: 10px;
}

.remote-address-inputs {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  gap: 10px;

  .remote-host-input {
    flex: 3;
  }

  .remote-port-input {
    flex: 1;

    &>input {
      width: calc(5ch + 32px);
    }
  }
}

.chat-list {
  position: fixed;
  margin: 64px 16px 16px 16px;
  top: 0;
  right: 0;
  width: 300px;
  height: calc(100% - 64px - 16px - 10px);
  background-color: rgba($color: #FFF, $alpha: 0.35);
  backdrop-filter: blur(16px);
}

.chat-view {
  height: calc(100% - 48px);
  background: none;
}

.slide-into-enter-active,
.slide-into-leave-active {
  transition: transform 0.3s ease-in-out;
}

.slide-into-enter-from,
.slide-into-leave-to {
  transform: translateX(100%);
}

.slide-into-enter-to,
.slide-into-leave-from {
  opacity: 1;
}

.chat-list-btn {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: rgba($color: #FFF, $alpha: 0.75);
  backdrop-filter: blur(16px);
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.2);
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s ease-in-out;

  &:hover {
    background-color: rgba($color: #000, $alpha: 0.1);
  }

  &:active {
    background-color: rgba($color: #000, $alpha: 0.2);
    transform: scale(0.9);
  }
}
</style>
