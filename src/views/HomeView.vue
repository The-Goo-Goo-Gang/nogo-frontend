<template>
  <div class="game-home game-view">
    <h1 class="game-title">NoGo</h1>
    <div class="game-actions">
      <button class="game-action-btn" @click="startLocalGame">单人游戏</button>
      <button class="game-action-btn" @click="goToSettings">设置</button>
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

const goToSettings = () => {
  router.push('/settings')
}
</script>
