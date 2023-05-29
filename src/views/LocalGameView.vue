<template>
  <div class="game-container grid game-ongoing" v-if="store.state.uiState.status != GameStatus.NOT_PREPARED">
    <div class="game-left-container left">
      <div class="player-container">
        <PlayerIndicator
          :player="store.state.uiState.game?.metadata.player_opposing || { name: 'Player B', type: PlayerType.LocalHumanPlayer, chess_type: Chess.White }"
          :is-playing="!isOurPlayerPlaying" />
        <div class="timer" :style="{ opacity: (shouldStartTimer && timerRunning && !isOurPlayerPlaying) ? 1 : 0 }">
          <ProgressBar :progress="timerProgress" />
        </div>
      </div>
      <div class="game-chessboard">
        <GameChessboard :width="400" :height="400" :chesses="chessboard" :disabled-positions="disabledPositions"
          :highlight-positions="highlightPositions" @chess-clicked="onChessClicked" :size="chessboardSize">
        </GameChessboard>
      </div>
      <div class="player-container">
        <div class="timer" :style="{ opacity: shouldStartTimer && timerRunning && isOurPlayerPlaying ? 1 : 0 }">
          <ProgressBar :progress="timerProgress" />
        </div>
        <PlayerIndicator
          :player="store.state.uiState.game?.metadata.player_our || { name: 'Player A', type: PlayerType.LocalHumanPlayer, chess_type: Chess.Black }"
          :is-playing="isOurPlayerPlaying" :show-timer="isOurPlayerPlaying" :reverse="true" />
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
      <div class="game-right-actions">
        <button class="game-action-btn fill" @click="toggleBotHost">{{ isBotHosting ? '取消托管' : '托管' }}</button>
        <button class="game-action-btn fill" @click="giveUp">认输</button>
      </div>
    </div>
  </div>
  <div class="game-result" :class="showGameResult ? ['show'] : ['hide']">
    <div class="game-result-content">
      <h3>Game Over!</h3>
      <p>{{ winnerName }}获胜</p>
      <p v-if="false">原因：{{ winReasonText }}</p>
      <div class="game-actions">
        <button class="game-action-btn" @click="restartGame">再来一局</button>
        <button class="game-action-btn" @click="saveGame">保存游戏</button>
        <button class="game-action-btn" @click="returnHome">返回首页</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import PlayerIndicator from '@/components/PlayerIndicator.vue'
import GameChessboard from '@/components/GameChessboard.vue'
import ProgressBar from '@/components/ProgressBar.vue'
import { useStore } from '@/store'
import { Chess, GameStatus, LocalGameType, OpCode, PlayerType } from '@/const'
import { computed, inject, ref } from 'vue'
import { useRouter } from 'vue-router'
import dayjs from 'dayjs'
import { Alert } from '@/components/alert/alert'
import { nowTimestampKey } from '@/keys'
import { useGameResult, useGameTimer, useGameChessboard } from './gameView'

const store = useStore()
const router = useRouter()
const nowTimestamp = inject(nowTimestampKey, ref(0))

const restartGame = () => {
  store.dispatch('startLocalGame', {
    type: LocalGameType.PVP,
    size: store.state.uiState.game?.metadata.size || 9,
    timeout: timeout.value
  })
}

const onChessClicked = (x: number, y: number) => {
  if (store.state.uiState.status === GameStatus.ON_GOING) {
    store.dispatch('doLocalMove', { x, y })
  }
}

const returnHome = () => {
  router.push('/')
}

const isBotHosting = computed(() => {
  if (!store.state.uiState.game) return false
  return nowPlayer.value?.type === PlayerType.BotPlayer
})
const toggleBotHost = () => {
  if (!store.state.uiState.game) return
  const chess = store.state.uiState.game.now_playing
  const role = chess === Chess.Black ? 'b' : 'w'
  window.electronAPI.sendData(OpCode.BOT_HOSTING_OP, role)
}

const saveGame = () => {
  if (store.state.uiState.game) {
    const timestamp = store.state.uiState.game.end_time
    window.electronAPI.saveGame({
      id: `local-${timestamp}`,
      name: `本地对局-${dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss')}`,
      timestamp,
      encoded: store.state.uiState.game.encoded.trim()
    })
    Alert({
      title: '保存成功',
      content: '对局已保存到本地',
      timeout: 3000
    })
  }
}

const giveUp = () => {
  if (store.state.uiState.game != null && store.state.uiState.status === GameStatus.ON_GOING) {
    const chess = store.state.uiState.game.now_playing === store.state.uiState.game.metadata.player_our.chess_type ? store.state.uiState.game.metadata.player_our.chess_type : store.state.uiState.game.metadata.player_opposing.chess_type
    const role = chess === Chess.Black ? 'b' : 'w'
    window.electronAPI.sendData(OpCode.GIVEUP_OP, role)
  }
}

const nowPlayer = computed(() => {
  if (!store.state.uiState.game) return null
  return store.state.uiState.game.now_playing === store.state.uiState.game.metadata.player_our.chess_type ? store.state.uiState.game.metadata.player_our : store.state.uiState.game.metadata.player_opposing
})
const isOurPlayerPlaying = computed(() => store.state.uiState.game?.now_playing === store.state.uiState.game?.metadata.player_our.chess_type)

const {
  chessboard,
  chessboardSize,
  disabledPositions,
  highlightPositions
} = useGameChessboard()

const {
  timeout,
  timerRunning,
  timerProgress,
  shouldStartTimer
} = useGameTimer(nowPlayer)

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
