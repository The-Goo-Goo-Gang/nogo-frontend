<template>
  <div class="game-view">
    <TitleBar title="多人游戏" @back="back" />
    <div class="game-view-form">
      <div class="game-view-form-item">
        <div class="game-view-form-item-title">我的昵称</div>
        <div class="game-view-form-item-content">
          <div class="game-view-form-item-content-item">
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
          <button class="game-action-btn fill" @click="connectToRemote">连接</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import TitleBar from '@/components/TitleBar.vue'
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

const remoteHost = ref('')
const remotePort = ref('')
const waitingForConnect = ref(false)
const connectToRemote = () => {
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
  if (isConnected) {
    store.dispatch('requestRemoteGame', { username: onlineUsername.value, chessType: Chess.Black })
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

watch(isGaming, (isGaming, oldVal) => {
  console.log('watch isGaming', isGaming, oldVal)
  if (isGaming) {
    push('/game/online')
  }
})
</script>

<style lang="scss">
.game-view-form-item-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
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
</style>
