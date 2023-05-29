<template>
  <div class="game-view">
    <TitleBar title="单人游戏" @back="back" />
    <div class="game-view-form">
      <div class="game-view-item">
        <div class="game-view-item-title">游戏类型</div>
        <div class="game-view-item-content">
          <div class="game-view-item-content-form">
            <label class="game-view-item-content-form-label">
              <input type="radio" name="gameType" :value="LocalGameType.PVP" v-model.number="gameType" />
              PVP
            </label>
          </div>
          <div class="game-view-item-content-form">
            <label class="game-view-item-content-form-label">
              <input type="radio" name="gameType" :value="LocalGameType.PVE" v-model.number="gameType" />
              PVE
            </label>
          </div>
          <div class="game-view-item-content-form">
            <label class="game-view-item-content-form-label">
              <input type="radio" name="gameType" :value="LocalGameType.EVE" v-model.number="gameType" />
              EVE
            </label>
          </div>
        </div>
      </div>
      <div class="game-view-item">
        <div class="game-view-item-title">棋盘大小</div>
        <div class="game-view-item-content">
          <div class="game-view-item-content-form">
            <label class="game-view-item-content-form-label">
              <input type="radio" name="boardSize" :value="9" v-model.number="boardSize" />
              9⨉9
            </label>
          </div>
          <div class="game-view-item-content-form">
            <label class="game-view-item-content-form-label">
              <input type="radio" name="boardSize" :value="11" v-model.number="boardSize" />
              11⨉11
            </label>
          </div>
          <div class="game-view-item-content-form">
            <label class="game-view-item-content-form-label">
              <input type="radio" name="boardSize" :value="13" v-model.number="boardSize" />
              13⨉13
            </label>
          </div>
        </div>
      </div>
      <div class="game-view-item">
        <div class="game-view-item-title">思考时间</div>
        <div class="game-view-item-content full-width">
          <div class="game-view-item-content-form">
            <label class="game-view-item-content-form-label">
              <input type="range" :min="3" :max="120" v-model="thinkingTime" />
              {{ thinkingTime }} 秒
            </label>
          </div>
        </div>
      </div>
      <div class="game-view-actions">
        <template v-if="gameType === LocalGameType.PVE">
          <button class="game-action-btn fill" @click="startLocalGame(LocalGameType.EVP)">开始游戏（机器先手）</button>
          <button class="game-action-btn fill" @click="startLocalGame(LocalGameType.PVE)">开始游戏（人类先手）</button>
        </template>
        <template v-else>
          <button class="game-action-btn fill" @click="startLocalGame()">开始游戏</button>
        </template>
      </div>
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

const startLocalGame = (type: LocalGameType = gameType.value) => {
  store.dispatch(
    'startLocalGame',
    {
      type,
      size: boardSize.value,
      timeout: thinkingTime.value
    }
  )
  push('/game')
}
</script>

<style scoped lang="scss">
.game-view-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 8px;

  .game-action-btn {
    margin-top: 8px;
  }
}
</style>
