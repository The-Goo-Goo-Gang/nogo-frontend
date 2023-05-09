<template>
  <div class="game-container game-grid" style="align-items: stretch; align-self: center; align-content: center;">
    <div class="game-left-container">
      <div class="game-view">
        <TitleBar title="多人游戏" @back="back" />
        <div class="game-view-form">
          <div class="game-view-item">
            <div class="game-view-item-title">我的昵称</div>
            <div class="game-view-item-content">
              <div class="game-view-item-content-form" style="flex: 1">
                <label class="game-view-item-content-form-label" data-error-text="昵称不能为空">
                  <input type="text" v-model.lazy="onlineUsername" placeholder="昵称" required />
                </label>
              </div>
            </div>
          </div>
          <template v-if="onlineUsername">
            <div class="game-view-item">
              <div class="game-view-item-title">本机局域网地址</div>
              <div class="game-view-item-content">
                <div v-if="realOnlinePort != -1">
                  <p v-for="addr in ipAddresses" :key="addr">{{ addr }}:{{ realOnlinePort }}</p>
                </div>
              </div>
            </div>
            <div class="game-view-item">
              <div class="game-view-item-title">连接到另一个玩家</div>
              <template v-if="store.state.remote.is_connected">
                <template v-if="!!store.state.remote.my_request">
                  <template v-if="store.state.remote.my_request.result === RemoteGameRequestResult.WAITING">
                    <div class="game-view-item-content"
                      style="justify-content: flex-start; gap: 8px; align-items: center;">
                      <ProgressCircular />
                      等待对方接受申请...
                    </div>
                    <div class="game-view-item-actions">
                      <button class="game-action-btn fill" @click="store.dispatch('leaveOnlineGame')">取消</button>
                    </div>
                  </template>
                  <template v-else-if="store.state.remote.my_request.result === RemoteGameRequestResult.ACCEPTED">
                    <div class="game-view-item-content">
                      对方已接受申请，即将进入游戏
                    </div>
                  </template>
                  <template v-else-if="store.state.remote.my_request.result === RemoteGameRequestResult.REJECTED">
                    <div class="game-view-item-content">
                      对方已拒绝申请
                    </div>
                    <div class="game-view-item-actions">
                      <button class="game-action-btn fill"
                        @click="store.dispatch('requestRemoteGame', { chessType: store.state.remote.my_request.chess })">再次申请</button>
                      <button class="game-action-btn" v-if="store.state.remote.my_request.sendTo"
                        @click="openChat(store.state.remote.my_request.sendTo)">聊天</button>
                      <button class="game-action-btn" @click="store.dispatch('leaveOnlineGame')">断开连接</button>
                    </div>
                  </template>
                </template>
                <template v-else>
                  <div class="game-view-item-content">
                    已连接到 {{ store.state.remote.connected_remote_username }}
                  </div>
                  <div class="game-view-item-actions">
                    <button class="game-action-btn fill" @click="store.dispatch('leaveOnlineGame')">断开连接</button>
                    <button class="game-action-btn"
                      @click="openChat(store.state.remote.connected_remote_username)">聊天</button>
                  </div>
                </template>
              </template>
              <template v-else-if="store.state.remote.is_connecting">
                <div class="game-view-item-content">
                  正在连接到 {{ store.state.remote.remote_ip }}:{{ store.state.remote.remote_port }}...
                </div>
                <div class="game-view-item-actions">
                  <button class="game-action-btn fill" @click="store.dispatch('leaveOnlineGame')">取消</button>
                </div>
              </template>
              <template v-else-if="store.state.remote.is_connecting_failed">
                <div class="game-view-item-content">
                  连接 {{ store.state.remote.remote_ip }}:{{ store.state.remote.remote_port }} 失败
                </div>
                <div class="game-view-item-actions">
                  <button class="game-action-btn fill">重试</button>
                </div>
              </template>
              <template v-else>
                <div class="game-view-item-content">
                  <div class="game-view-item-content-form remote-address-inputs">
                    <label class="game-view-item-content-form-label remote-host-input">
                      <input type="text" v-model.lazy="remoteHost" placeholder="IP 地址" />
                    </label>
                    <label class="game-view-item-content-form-label remote-port-input">
                      <input type="text" v-model.lazy="remotePort" placeholder="端口" />
                    </label>
                  </div>
                </div>
                <div class="game-view-item-actions">
                  <button class="game-action-btn fill" @click="requestRemoteGame(Chess.Black)">申请执黑对局</button>
                  <button class="game-action-btn fill" @click="requestRemoteGame(Chess.White)">申请执白对局</button>
                </div>
              </template>
            </div>
          </template>
        </div>
      </div>
    </div>
    <div class="game-right-container grid-right">
      <div class="remote-waiting-request-list">
        <div class="remote-waiting-request-list-title">待处理的申请</div>
        <template v-if="waitingRemoteRequests.length">
          <div class="remote-waiting-request" v-for="request in waitingRemoteRequests" :key="request.id">
            <div class="remote-waiting-request-title">来自 {{ request.username }} 的申请</div>
            <div class="remote-waiting-request-time">{{ formatDateTime(request.timestamp) }}</div>
            <div class="remote-waiting-request-content">
              对方申请执{{ request.chess === Chess.Black ? '黑' : '白' }}对局
            </div>
            <div class="remote-waiting-request-actions">
              <button class="game-action-btn fill" @click="store.dispatch('acceptRemoteRequest', request)">接受</button>
              <button class="game-action-btn fill" @click="store.dispatch('rejectRemoteRequest', request)">拒绝</button>
            </div>
          </div>
        </template>
        <template v-else>
          <div class="remote-waiting-request-list-empty">
            暂无申请
          </div>
        </template>
      </div>
    </div>
  </div>
  <div class="chat-list-btn" @click="openChatList">
    <ChatIcon />
  </div>
</template>

<script setup lang="ts">
import TitleBar from '@/components/TitleBar.vue'
import ChatIcon from 'vue-material-design-icons/Message.vue'
import { Chess, RemoteGameRequestResult } from '@/const'
import { useQuickRouter } from '@/router/quick'
import { useStore } from '@/store'
import { ref, onMounted, watch, computed, nextTick, inject } from 'vue'
import { useStringConfig } from '@/config'
import { openChatListKey, openChatKey } from '@/keys'
import ProgressCircular from '@/components/ProgressCircular.vue'
import dayjs from 'dayjs'

const { value: onlineUsername } = useStringConfig('onlineUsername')
const { back } = useQuickRouter()
const ipAddresses = ref([] as string[])
const realOnlinePort = ref(-1)
const store = useStore()

// eslint-disable-next-line @typescript-eslint/no-empty-function
const openChatList = inject(openChatListKey, () => { })
// eslint-disable-next-line @typescript-eslint/no-empty-function
const openChat = inject(openChatKey, (target: string) => { })
const waitingRemoteRequests = computed(() => store.getters.receivedWaitingRequests)

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

const formatDateTime = (timestamp: number) => dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss')

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
</script>

<style lang="scss" scoped>
.game-view-item-actions,
.remote-waiting-request-actions {
  display: flex;
  flex-direction: row-reverse;
  justify-content: flex-start;
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

.remote-waiting-request-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  background-color: rgba($color: #FFF, $alpha: 0.35);
  backdrop-filter: blur(16px);
  border-radius: 8px;
  padding: 32px;
  height: 100%;
}

.remote-waiting-request-list-title {
  font-size: 18px;
  font-weight: bold;
  color: #000;
  margin-bottom: 16px;
}

.remote-waiting-request-list-empty {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  font-size: 16px;
  color: #666;
}

.remote-waiting-request {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
  border-radius: 8px;
  background-color: rgba($color: #FFF, $alpha: 0.35);
  backdrop-filter: blur(16px);
  transition: all 0.2s ease-in-out;

  &:hover {
    background-color: rgba($color: #000, $alpha: 0.05);
  }

  &:active {
    background-color: rgba($color: #000, $alpha: 0.1);
    transform: scale(0.98);
  }

  .remote-waiting-request-title {
    font-size: 16px;
    font-weight: bold;
    color: #000;
  }

  .remote-waiting-request-time {
    font-size: 12px;
    opacity: 0.5;
  }

  .remote-waiting-request-content {
    font-size: 14px;
    color: #000;
  }
}
</style>
