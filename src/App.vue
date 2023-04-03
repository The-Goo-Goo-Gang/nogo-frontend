<template>
  <div class="game-background" style="background-image: url('/img/background.jpeg');"></div>
  <div class="game">
    <router-view />
  </div>
  <div id="title-bar">
    <div class="title-bar-content">
      <div class="side-spacer"></div>
      <span class="title-text">NoGo 不围棋</span>
      <div class="spacer"></div>
      <div class="title-bar-btns">
        <div class="title-bar-btn title-bar-btn-info" @click="minimize">
          <WindowMinimizeIcon />
        </div>
        <div class="title-bar-btn title-bar-btn-warning" @click="exit">
          <WindowCloseIcon />
        </div>
      </div>
      <div class="side-spacer"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import WindowMinimizeIcon from 'vue-material-design-icons/WindowMinimize.vue'
import WindowCloseIcon from 'vue-material-design-icons/WindowClose.vue'
import { onMounted } from 'vue'
import { OpCode } from './const'
import { useStore } from './store'

const store = useStore()

onMounted(() => {
  window.electronAPI.onData((opCode, data1, data2) => {
    if (opCode === OpCode.UPDATE_UI_STATE_OP && data1 && data2) {
      store.commit('updateState', JSON.parse(data2))
    }
  })
})

const exit = () => {
  window.electronAPI.send('exit')
}

const minimize = () => {
  window.electronAPI.send('minimize')
}
</script>

<style lang="scss">
@import '~normalize.css';
@import 'vue-material-design-icons/styles.css';

#title-bar {
  user-select: none;
  -webkit-app-region: drag;
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  z-index: 9;
  width: 100%;

  .title-bar-content {
    display: flex;
    justify-content: space-between;
    flex-direction: row;
    padding: 16px 0;
  }

  .title-bar-btns {
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

  .title-bar-btns {
    -webkit-app-region: no-drag;
  }

  .title-bar-btn {
    cursor: pointer;
    transition: background 0.3s ease, color 0.3s ease;
    position: relative;
    height: 1em;
    border-radius: 50%;

    & > .material-design-icon {
      height: 1em;
      bottom: 0.125em;
    }

    &.title-bar-btn-warning:hover {
      background-color: #D50000;
      color: white;
    }

    &.title-bar-btn-info:hover {
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
  height: 2em;
  width: 2em;

  .material-design-icon__svg {
    height: 2em;
    width: 2em;
  }
}

.icon-3x {
  height: 3em;
  width: 3em;

  .material-design-icon__svg {
    height: 3em;
    width: 3em;
  }
}
</style>
