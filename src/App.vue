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
</template>

<script setup lang="ts">
import WindowMinimizeIcon from 'vue-material-design-icons/WindowMinimize.vue'
import WindowCloseIcon from 'vue-material-design-icons/WindowClose.vue'
import ChevronRightIcon from 'vue-material-design-icons/ChevronRight.vue'
import MusicPlayer from './components/player/MusicPlayer.vue'
import { computed, onMounted, Ref, ref, watch } from 'vue'
import { BackgroundMusicType, OpCode } from './const'
import { useStore } from './store'
import { SongData } from './components/player/data'
import { Alert } from './components/alert/alert'
import { useRouter } from 'vue-router'

const router = useRouter()
const store = useStore()

const playBgm = ref(false)
const bgmPlaylist: Ref<Array<SongData>> = ref([])
const shouldPlayBgm = computed(() => {
  return playBgm.value && bgmPlaylist.value.length > 0
})

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

onMounted(() => {
  window.electronAPI.onData((opCode, data1, data2) => {
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
      case OpCode.READY_OP:
        store.dispatch('receiveReady', { data1, data2 })
        break
      case OpCode.REJECT_OP:
        store.dispatch('receiveReject', { data1, data2 })
        break
      case OpCode.LEAVE_OP:
        Alert({ title: '对方已离开', content: '对方已离开游戏', timeout: 3000 })
        router.push('/')
        store.dispatch('receiveLeave')
        break
      case OpCode.CHAT_RECEIVE_MESSAGE_OP:
        Alert({ title: `收到来自${data2}的消息`, content: data1, timeout: 3000 })
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
