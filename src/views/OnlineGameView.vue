<template>
  <div class="game-container grid game-ongoing" v-if="store.state.uiState.status != GameStatus.NOT_PREPARED">
    <div class="game-left-container left">
      <div class="player-container">
        <PlayerIndicator v-if="store.state.uiState.game?.metadata.player_opposing"
          :player="store.state.uiState.game?.metadata.player_opposing" :is-playing="!isOurPlayerPlaying" />
        <div class="timer" :style="{ opacity: (shouldStartTimer && timerRunning && !isOurPlayerPlaying) ? 1 : 0 }">
          <ProgressBar :progress="timerProgress" />
        </div>
      </div>
      <div class="game-chessboard">
        <GameChessboard :width="400" :height="400" :chesses="chessboard" :disabled-positions="disabledPositions"
          :size="chessboardSize" :highlight-positions="highlightPositions" @chess-clicked="onChessClicked">
        </GameChessboard>
      </div>
      <div class="player-container">
        <div class="timer" :style="{ opacity: shouldStartTimer && timerRunning && isOurPlayerPlaying ? 1 : 0 }">
          <ProgressBar :progress="timerProgress" />
        </div>
        <PlayerIndicator v-if="store.state.uiState.game?.metadata.player_our"
          :player="store.state.uiState.game?.metadata.player_our" :is-playing="isOurPlayerPlaying"
          :show-timer="isOurPlayerPlaying" :reverse="true" />
      </div>
    </div>
    <div class="game-right-container right">
      <div class="game-stats">
        <div class="game-stat-item">
          <div class="game-stat-item-title">用时</div>
          <div class="game-stat-item-value">{{ gameUsedTimeText }}</div>
        </div>
        <div class="game-stat-item">
          <div class="game-stat-item-title">步数</div>
          <div class="game-stat-item-value">{{ store.state.uiState.game?.move_count }}</div>
        </div>
      </div>
      <div class="game-giveup-tip" v-if="store.state.uiState.game?.should_giveup">无棋可下了！考虑认输？</div>
      <div class="game-right-actions">
        <button class="game-action-btn fill" @click="toggleBotHost">{{ isBotHosting ? '取消托管' : '托管' }}</button>
        <button class="game-action-btn fill give-up-btn" @click="giveUp" :disabled="!isOurPlayerPlaying">认输</button>
      </div>
      <div class="game-chat-container">
        <ChatView class="game-chat" v-if="store.state.uiState.game" ref="chat"
          :target="store.state.uiState.game.metadata.player_opposing.name" />
      </div>
    </div>
  </div>
  <div class="game-result" :class="showGameResult ? ['show'] : ['hide']">
    <div class="game-result-content">
      <h3>Game Over!</h3>
      <p>{{ winnerName }}获胜</p>
      <p v-if="false">原因：{{ winReasonText }}</p>
      <p>用时：{{ gameUsedTimeText }}</p>
      <p>步数：{{ store.state.uiState.game?.move_count }}</p>
      <div class="game-actions">
        <button class="game-action-btn" @click="showRestartDialog = true">再来一局</button>
        <button class="game-action-btn" @click="saveGame">保存对局</button>
        <button class="game-action-btn" @click="exitOnlineGame">退出游戏</button>
      </div>
    </div>
  </div>
  <ModalDialog title="你想要执黑还是执白？" v-model="showRestartDialog">
    <template #actions>
      <button class="game-action-btn" @click="restartOnlineGame(Chess.Black)">黑</button>
      <button class="game-action-btn" @click="restartOnlineGame(Chess.White)">白</button>
      <button class="game-action-btn" @click="showRestartDialog = !showRestartDialog">取消</button>
    </template>
  </ModalDialog>
</template>

<script setup lang="ts">
import ModalDialog from '@/components/dialog/ModalDialog.vue'
import PlayerIndicator from '@/components/PlayerIndicator.vue'
import GameChessboard from '@/components/GameChessboard.vue'
import ProgressBar from '@/components/ProgressBar.vue'
import ChatView from '@/components/ChatView.vue'
import { useStore } from '@/store'
import { Chess, GameStatus, OpCode, PlayerType } from '@/const'
import { computed, ref, inject } from 'vue'
import { useRouter } from 'vue-router'
import { nowTimestampKey } from '@/keys'
import { Alert } from '@/components/alert/alert'
import dayjs from 'dayjs'
import { useGameChessboard, useGameResult, useGameTimer } from './gameView'

const showRestartDialog = ref(false)
const chat = ref<InstanceType<typeof ChatView> | null>(null)

const store = useStore()
const router = useRouter()
const nowTimestamp = inject(nowTimestampKey, ref(0))

const restartOnlineGame = (chessType: Chess) => {
  showRestartDialog.value = false
  store.dispatch('requestRemoteGame', { chessType })
  router.replace('/start/online')
}

const onChessClicked = (x: number, y: number) => {
  if (store.state.uiState.status === GameStatus.ON_GOING && isOurPlayerPlaying.value) {
    console.log('onChessClicked', x, y, (store.state.uiState.game?.chessboard[x] || [])[y] || Chess.None)
    store.dispatch('doMove', { x, y })
  }
}

const exitOnlineGame = () => {
  store.dispatch('leaveOnlineGame')
  router.replace('/')
}

const saveGame = () => {
  if (store.state.uiState.game != null) {
    window.electronAPI.saveGame({
      id: `online-${store.state.uiState.game.end_time}`,
      name: `${store.state.uiState.game.metadata.player_our.name} VS ${store.state.uiState.game.metadata.player_opposing.name}`,
      timestamp: store.state.uiState.game.end_time,
      encoded: store.state.uiState.game.encoded.trim()
    })
    Alert({
      title: '保存成功',
      content: '对局已保存到本地',
      timeout: 3000
    })
  }
}

const isBotHosting = computed(() => store.state.uiState.game?.metadata.player_our.type === PlayerType.BotPlayer)
const toggleBotHost = () => {
  if (!store.state.uiState.game) return
  window.electronAPI.sendData(OpCode.BOT_HOSTING_OP)
}
const giveUp = () => {
  if (store.state.uiState.game != null && store.state.uiState.status === GameStatus.ON_GOING && isOurPlayerPlaying.value) {
    window.electronAPI.sendData(OpCode.GIVEUP_OP, store.state.config.onlineUsername)
  }
}

const nowPlayer = computed(() => {
  if (!store.state.uiState.game) return null
  return store.state.uiState.game.now_playing === store.state.uiState.game.metadata.player_our.chess_type ? store.state.uiState.game.metadata.player_our : store.state.uiState.game.metadata.player_opposing
})
const isOurPlayerPlaying = computed(() => store.state.uiState.game?.now_playing === store.state.uiState.game?.metadata.player_our.chess_type)

const {
  timerRunning,
  timerProgress,
  shouldStartTimer
} = useGameTimer(nowPlayer)

const {
  chessboard,
  chessboardSize,
  disabledPositions,
  highlightPositions
} = useGameChessboard()

const {
  showGameResult,
  winnerName,
  winReasonText
} = useGameResult()

const gameUsedTimeText = computed(() => {
  if (!store.state.uiState.game || store.state.uiState.status === GameStatus.NOT_PREPARED) return ''
  const milliseconds = Math.max(
    0,
    ((store.state.uiState.status === GameStatus.GAME_OVER ? store.state.uiState.game.end_time : nowTimestamp.value) - store.state.uiState.game.start_time)
  )
  return dayjs.duration(milliseconds).format('HH:mm:ss')
})
</script>
