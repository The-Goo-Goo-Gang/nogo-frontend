<template>
  <div class="game-background" style="background: url('/img/background.jpeg');"></div>
  <div class="game">
    <router-view />
  </div>
  <div id="title-bar">
    <span class="title-text">NoGo 不围棋</span>
  </div>
</template>

<script setup lang="ts">
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
</script>

<style lang="scss">
@import '~normalize.css';
@import 'vue-material-design-icons/styles.css';

#title-bar {
  user-select: none;
  -webkit-app-region: drag;
  padding: 16px;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 9;
  width: 100%;
  display: flex;
  flex-direction: row;

  .title-text {
    font-weight: bold;
    font-size: 14px;
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
