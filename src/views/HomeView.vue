<template>
  <div class="game-home">
    <h1 class="game-title">NoGo</h1>
    <div class="game-actions">
      <button class="game-action-btn" @click="startLocalGame">单人游戏</button>
      <button class="game-action-btn">设置</button>
      <button class="game-action-btn" @click="exit">退出</button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { LocalGameType } from '@/const'
import { useStore } from '@/store'
import { useRouter } from 'vue-router'

const store = useStore()
const router = useRouter()

const exit = () => {
  window.electronAPI.exit()
}

const startLocalGame = () => {
  store.dispatch('startLocalGame', { type: LocalGameType.PVP, size: 9 })
  router.push('/game')
}
</script>

<style lang="scss">
$theme-color: #2080f0;
$bezier: cubic-bezier(0.4, 0, 0.2, 1);

.game-home {
  text-align: center;
  background: rgba(255, 255, 255, 0.35);
  padding: 32px;
  border-radius: 8px;
}

.game-title {
  margin-top: 0;
  -webkit-background-clip: text;
  background-clip: text;
  background-image: linear-gradient(252deg, rgba($color: $theme-color, $alpha: 0.6) 0%, $theme-color 100%);
  -webkit-text-fill-color: transparent;
}

.game-actions {
  display: inline-flex;
  flex-wrap: nowrap;
  flex-direction: column;
  border-radius: 8px;
}

.game-action-btn {
  border-radius: 8px;
  padding: 8px;
  background: none;
  border: 0;
  transition: color 0.3s $bezier, background .3s $bezier;

  &:hover {
    color: white;
    background-color: rgba($color: $theme-color, $alpha: 0.75)!important;
  }

  &:active {
    background-color: $theme-color!important;
  }

  &.fill {
    background-color: rgba($color: #FFFFFF, $alpha: 0.5);
  }
}
</style>
