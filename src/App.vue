<template>
  <div class="game-background" style="background-image: url('/img/background.jpeg');"></div>
  <div class="game">
    <router-view />
  </div>
  <div id="app-title-bar">
    <div class="app-title-bar-content">
      <div class="side-spacer"></div>
      <span class="title-text">NoGo 不围棋</span>
      <div class="spacer"></div>
      <div class="app-title-bar-btns">
        <div class="app-title-bar-btn app-title-bar-btn-info" @click="minimize">
          <WindowMinimizeIcon />
        </div>
        <div class="app-title-bar-btn app-title-bar-btn-warning" @click="exit">
          <WindowCloseIcon />
        </div>
      </div>
      <div class="side-spacer"></div>
    </div>
  </div>
  <div class="bgm-player-container" v-if="shouldPlayBgm">
    <div class="bgm-player-content">
      <MusicPlayer background-color="rgba(255, 255, 255, 0.6)" :volume="store.state.config.bgmVolume" autoplay
        class="bgm-player" :songs="bgmPlaylist" />
    </div>
    <div class="bgm-player-indicator">
      <span>BGM</span>
      <ChevronRightIcon class="bgm-player-indicator-icon" />
    </div>
  </div>
  <div id="alert-container"></div>
  <Transition name="slide-into">
    <ChatListView class="chat-list" v-show="showChatList" @close="showChatList = !showChatList" ref="chat" />
  </Transition>
</template>

<script setup lang="ts">
import WindowMinimizeIcon from 'vue-material-design-icons/WindowMinimize.vue'
import WindowCloseIcon from 'vue-material-design-icons/WindowClose.vue'
import ChevronRightIcon from 'vue-material-design-icons/ChevronRight.vue'
import MusicPlayer from './components/player/MusicPlayer.vue'
import ChatListView from './components/ChatListView.vue'
import { computed, onMounted, onUnmounted, provide, Ref, ref, watch } from 'vue'
import { BackgroundMusicType, OpCode, RemoteGameRequestResult, Chess } from './const'
import { useStore } from './store'
import { SongData } from './components/player/data'
import { Alert } from './components/alert/alert'
import { useRoute, useRouter } from 'vue-router'
import { nowTimestampKey, openChatKey, openChatListKey } from './keys'
import { RemoteGameRequest } from './state'
import dayjs from 'dayjs'

const router = useRouter()
const route = useRoute()
const store = useStore()

const chat = ref<InstanceType<typeof ChatListView> | null>(null)
const listenerId = ref(-1)
const showChatList = ref(false)
const playBgm = ref(false)
const bgmPlaylist: Ref<Array<SongData>> = ref([])
const shouldPlayBgm = computed(() => {
  return playBgm.value && bgmPlaylist.value.length > 0
})

const openChatList = () => {
  showChatList.value = true
}

const openChat = (target: string) => {
  showChatList.value = true
  chat.value?.openChat(target)
}

const nowTimestamp = ref(Date.now())
setInterval(() => {
  nowTimestamp.value = Date.now()
}, 1000)

provide(openChatListKey, openChatList)
provide(openChatKey, openChat)
provide(nowTimestampKey, nowTimestamp)

const fetchPlaylist = () => {
  if (store.state.config.bgmType === BackgroundMusicType.LOCAL && store.state.config.bgmFilePath) {
    try {
      const bgmFiles: Array<string> = JSON.parse(store.state.config.bgmFilePath)
      if (bgmFiles.length === 0) {
        return
      }
      bgmPlaylist.value = bgmFiles.map((path) => {
        return {
          name: '本地音乐',
          src: path
        }
      })
    } catch (err) {
      console.error(err)
    }
    return
  }
  fetch(`https://server.huanchengfly.top/api/nogo/music/songs?ids=${store.state.config.bgmSongsId}`)
    .then(res => res.json())
    .then(res => {
      if (!res.success) {
        throw new Error(res.error)
      }
      return res
    })
    .then(res => {
      bgmPlaylist.value = res.songs
    })
    .catch(err => {
      console.error(err)
    })
}

const startPlayBgm = () => {
  playBgm.value = true
  if (bgmPlaylist.value.length === 0) {
    fetchPlaylist()
  }
}

const stopPlayBgm = () => {
  playBgm.value = false
}

const isValidUsername = (username: string) => {
  return username && /^\w+$/g.test(username)
}
watch(() => store.state.config.onlineUsername, (newUsername) => {
  if (isValidUsername(newUsername)) {
    window.electronAPI.sendData(OpCode.UPDATE_USERNAME_OP, newUsername)
  }
}, { immediate: true })

onMounted(() => {
  listenerId.value = window.electronAPI.onData((opCode, data1, data2) => {
    switch (opCode) {
      case OpCode.UPDATE_UI_STATE_OP:
        if (data1 && data2) store.commit('updateState', JSON.parse(data2))
        break
      case OpCode.CONNECT_RESULT_OP:
        if (data1 && data2) {
          const success = data1 === 'success'
          if (success) {
            const address = data2
            const host = address.split(':')[0]
            const port = address.split(':')[1]
            store.commit('connectToRemoteResult', {
              success,
              host,
              port
            })
          } else {
            store.commit('connectToRemoteResult', {
              success,
              message: data2
            })
          }
        }
        break
      case OpCode.RECEIVE_REQUEST_OP: {
        if (!data1 || !data2) break
        const contestRequest = new RemoteGameRequest(data1, data2 === 'b' ? Chess.Black : Chess.White)
        store.commit('receiveRequest', contestRequest)
        console.log(route.name?.toString())
        if (route.name !== 'startOnlineGame') {
          Alert({
            title: '收到对局申请',
            content: `玩家 ${data1} 申请执${data2 === 'b' ? '黑' : '白'}棋与你进行对局，是否同意？\n${dayjs(contestRequest.timestamp).format('YYYY-MM-DD HH:mm:ss')}`,
            positiveButtonText: '同意',
            negativeButtonText: '拒绝',
            onConfirm: () => {
              store.dispatch('acceptRemoteRequest', contestRequest)
            },
            onClose: () => {
              store.dispatch('rejectRemoteRequest', contestRequest)
            }
          })
        }
        if (route.name === 'gameOnline') {
          router.replace('/')
        }
        break
      }
      case OpCode.RECEIVE_REQUEST_RESULT_OP:
        if (!data1 || !data2) break
        if (store.state.remote.is_connected && store.state.remote.my_request?.result === RemoteGameRequestResult.WAITING) {
          store.commit('receiveRequestResult', { result: data1 === 'accepted' ? RemoteGameRequestResult.ACCEPTED : RemoteGameRequestResult.REJECTED, username: data2 })
        }
        break
      case OpCode.READY_OP:
        if (!data1) break
        if (store.state.remote.is_connected && store.state.remote.my_request?.result === RemoteGameRequestResult.WAITING) {
          store.commit('receiveRequestResult', { result: RemoteGameRequestResult.ACCEPTED, username: data1 })
        } else {
          if (!data2) break
          const request = new RemoteGameRequest(data1, data2 === 'b' ? Chess.Black : Chess.White)
          store.commit('receiveRequest', request)
          console.log(route.name?.toString())
          if (route.name !== 'startOnlineGame') {
            Alert({
              title: '收到对局申请',
              content: `玩家 ${data1} 申请执${data2 === 'b' ? '黑' : '白'}棋与你进行对局，是否同意？\n${dayjs(request.timestamp).format('YYYY-MM-DD HH:mm:ss')}`,
              positiveButtonText: '同意',
              negativeButtonText: '拒绝',
              onConfirm: () => {
                store.dispatch('acceptRemoteRequest', request)
              },
              onClose: () => {
                store.dispatch('rejectRemoteRequest', request)
              }
            })
          }
          if (route.name === 'gameOnline') {
            router.replace('/')
          }
        }
        break
      case OpCode.REJECT_OP:
        if (!data1) break
        if (store.state.remote.is_connected && store.state.remote.my_request?.result === RemoteGameRequestResult.WAITING) {
          store.commit('receiveRequestResult', { result: RemoteGameRequestResult.REJECTED, username: data1 })
          if (route.name !== 'startOnlineGame') {
            Alert({
              title: `${data1} 拒绝了你的对局申请`,
              content: '你可以再次申请对局或断开连接',
              positiveButtonText: '再次申请',
              neutralButtonText: '聊天',
              negativeButtonText: '断开连接',
              onConfirm: () => {
                store.dispatch('requestRemoteGame', { username: store.state.config.onlineUsername, chessType: store.state.remote.my_request?.chess })
              },
              onClose: () => {
                store.dispatch('leaveOnlineGame')
              },
              onNeutralClicked: () => {
                openChat(data1)
              }
            })
          }
        }
        break
      case OpCode.LEAVE_OP:
        if (store.state.remote.is_connected) {
          Alert({ title: '对方已离开', content: '对方已离开游戏', timeout: 3000 })
          router.push('/')
        }
        store.dispatch('receiveLeave', data1)
        break
      case OpCode.CHAT_RECEIVE_MESSAGE_OP:
        if (!data1 || !data2) break
        if (chat.value?.currentChatTarget !== data2 && (route.name !== 'gameOnline' || store.state.uiState.game?.metadata.player_opposing.name !== data2)) {
          Alert({
            title: `${data2} 给你发来了一条消息`,
            content: data1,
            positiveButtonText: '回复',
            negativeButtonText: '忽略',
            onConfirm: () => {
              openChat(data2)
            }
          })
        }
        store.commit('receiveChatMessage', { message: data1, username: data2 })
        break
      case OpCode.CHAT_USERNAME_UPDATE_OP:
        store.commit('updateChatUsername', { oldUsername: data1, newUSername: data2 })
        break
    }
  })
  window.electronAPI.onSetBgmFile(path => {
    store.dispatch('updateConfig', { bgmFilePath: JSON.stringify(path) })
  })
  if (store.state.config.bgm) {
    startPlayBgm()
  }
})

onUnmounted(() => {
  window.electronAPI.removeOnDataListener(listenerId.value)
})

watch(
  () => store.state.config.bgm,
  (val) => {
    if (val) startPlayBgm()
    else stopPlayBgm()
  }
)

watch(
  () => store.state.config.bgmSongsId,
  () => fetchPlaylist()
)

watch(
  () => store.state.config.bgmType,
  () => fetchPlaylist()
)

watch(
  () => store.state.config.bgmFilePath,
  () => fetchPlaylist()
)

const exit = () => {
  window.electronAPI.send('exit')
}

const minimize = () => {
  window.electronAPI.send('minimize')
}

const hasAcceptedRequest = computed(() => store.getters.hasAcceptedRequest)
const isGaming = computed(() => store.getters.isGaming)

watch(() => hasAcceptedRequest.value && isGaming.value, isGaming => {
  if (isGaming) {
    router.push('/game/online')
  }
})
</script>

<style lang="scss">
#app-title-bar {
  user-select: none;
  -webkit-app-region: drag;
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  z-index: 9999;
  width: 100%;

  .app-title-bar-content {
    display: flex;
    justify-content: space-between;
    flex-direction: row;
    padding: 16px 0;
  }

  .app-title-bar-btns {
    display: inline-flex;
    gap: 8px;
    flex-direction: row;
  }

  .title-text {
    font-weight: bold;
    font-size: 14px;
  }

  .spacer {
    flex: 1;
  }

  .side-spacer {
    width: 16px;
  }

  .app-title-bar-btns {
    -webkit-app-region: no-drag;
  }

  .app-title-bar-btn {
    cursor: pointer;
    transition: background 0.3s ease, color 0.3s ease;
    position: relative;
    height: 1em;
    border-radius: 50%;

    &>.material-design-icon {
      height: 1em;
      bottom: 0.125em;
    }

    &.app-title-bar-btn-warning:hover {
      background-color: #D50000;
      color: white;
    }

    &.app-title-bar-btn-info:hover {
      background-color: #0091EA;
      color: white;
    }
  }
}

#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.game {
  z-index: 1;
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
}

.game-background {
  z-index: 0;
  width: 100%;
  height: 100%;
  position: absolute;
  // background: url("~@/assets/background.jpeg");
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  filter: blur(16px);
}

.icon-2x {
  height: 2em !important;
  width: 2em !important;

  .material-design-icon__svg {
    height: 2em !important;
    width: 2em !important;
  }
}

.icon-3x {
  height: 3em !important;
  width: 3em !important;

  .material-design-icon__svg {
    height: 3em !important;
    width: 3em !important;
  }
}

.bgm-player {
  backdrop-filter: blur(16px);
}

.bgm-player-container {
  z-index: 5;
  position: fixed !important;
  bottom: 0;
  left: 0;
  display: flex;
  flex-direction: row;
  align-items: center;
  align-content: center;
  justify-content: center;
  transition: transform .2s ease;

  .bgm-player-indicator {
    display: inline-flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    align-content: center;
    background-color: rgba($color: #FFFFFF, $alpha: 0.6);
    opacity: 1;
    color: rgba($color: #000000, $alpha: 0.7);
    border-radius: 0 8px 8px 0;

    >span {
      width: 3em;
      text-align: center;
    }

    .bgm-player-indicator-icon {
      transition: transform .2s ease;
      transform: rotate(0deg);
      height: 1em;
      width: 1em;
    }

    .material-design-icon__svg {
      bottom: 0;
    }
  }

  &:not(:hover) {
    transform: translate(calc(-100% + 1em + 3em), calc(50% - 1em));
  }

  &:hover .bgm-player-indicator-icon {
    transform: rotate(180deg);
  }
}

#alert-container {
  position: fixed;
  padding-top: 48px;
  top: 0;
  right: 0;
  z-index: 999;
  display: flex;
  flex-direction: column;
}
</style>

<style lang="scss" scoped>
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
</style>
