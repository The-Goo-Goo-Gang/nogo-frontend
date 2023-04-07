<template>
  <div class="game-view">
    <TitleBar title="单人游戏" @back="back" />
    <div class="game-view-form">
      <div class="game-view-form-item">
        <div class="game-view-form-item-title">游戏类型</div>
        <div class="game-view-form-item-content">
          <div class="game-view-form-item-content-item">
            <label class="game-view-form-item-content-item-label">
              <input type="radio" name="gameType" :value="LocalGameType.PVP" v-model="gameType" />
              PVP
            </label>
          </div>
          <div class="game-view-form-item-content-item">
            <label class="game-view-form-item-content-item-label">
              <input type="radio" name="gameType" :value="LocalGameType.PVE" v-model="gameType" disabled />
              PVE（在做了）
            </label>
          </div>
        </div>
      </div>
      <div class="game-view-form-item">
        <div class="game-view-form-item-title">棋盘大小</div>
        <div class="game-view-form-item-content">
          <div class="game-view-form-item-content-item">
            <label class="game-view-form-item-content-item-label">
              <input type="radio" name="boardSize" :value="9" v-model="boardSize" />
              9⨉9
            </label>
          </div>
          <div class="game-view-form-item-content-item">
            <label class="game-view-form-item-content-item-label">
              <input type="radio" name="boardSize" :value="11" v-model="boardSize" disabled />
              11⨉11（在做了）
            </label>
          </div>
          <div class="game-view-form-item-content-item">
            <label class="game-view-form-item-content-item-label">
              <input type="radio" name="boardSize" :value="13" v-model="boardSize" disabled />
              13⨉13（在做了）
            </label>
          </div>
        </div>
      </div>
      <div class="game-view-form-item">
        <div class="game-view-form-item-title">思考时间</div>
        <div class="game-view-form-item-content full-width">
          <div class="game-view-form-item-content-item">
            <label class="game-view-form-item-content-item-label">
              <input type="range" :min="10" :max="120" v-model="thinkingTime" />
              {{ thinkingTime }} 秒
            </label>
          </div>
        </div>
      </div>
      <button class="game-action-btn fill" @click="startLocalGame">开始游戏</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import TitleBar from '@/components/TitleBar.vue'
import { LocalGameType } from '@/const'
import { useQuickRouter } from '@/router/quick'
import { useStore } from '@/store'
import { Ref, ref } from 'vue'

const { back, push } = useQuickRouter()
const store = useStore()
const gameType = ref(LocalGameType.PVP)
const boardSize: Ref<9 | 11 | 13> = ref(9)
const thinkingTime = ref(30)

const startLocalGame = () => {
  store.dispatch(
    'startLocalGame',
    {
      type: gameType.value,
      size: boardSize.value,
      timeout: thinkingTime.value
    }
  )
  push('/game')
}
</script>
