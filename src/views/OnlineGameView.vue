<template>
  <div class="game-container game-grid game-ongoing" v-if="store.state.uiState.status != GameStatus.NOT_PREPARED">
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
        <GameChessboard :width="400" :height="400" :chesses="chessboard" :disabled-position="disabledPosition"
          @chess-clicked="onChessClicked"></GameChessboard>
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
      <div class="game-actions">
        <button class="game-action-btn fill" @click="giveUp" :disabled="!isOurPlayerPlaying">认输</button>
      </div>
      <div class="game-chat-container">
        <ChatView class="game-chat" v-if="store.state.uiState.game"
          :target="store.state.uiState.game.metadata.player_opposing.name" />
      </div>
    </div>
  </div>
  <div class="game-result" :class="showGameResult ? ['show'] : ['hide']">
    <div class="game-result-content">
      <h3>Game Over!</h3>
      <p>{{ winnerName }}获胜</p>
      <p v-if="false">原因：{{ winReasonText }}</p>
      <div class="game-actions">
        <button class="game-action-btn" @click="showRestartDialog = true">再来一局</button>
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
import { Chess, GameStatus, OpCode, PlayerType, WinType } from '@/const'
import { computed, watch, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const showRestartDialog = ref(false)

const store = useStore()
const router = useRouter()

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

const giveUp = () => {
  if (store.state.uiState.game != null && store.state.uiState.status === GameStatus.ON_GOING && isOurPlayerPlaying.value) {
    const chess = store.state.uiState.game.now_playing === store.state.uiState.game.metadata.player_our.chess_type ? store.state.uiState.game.metadata.player_our.chess_type : store.state.uiState.game.metadata.player_opposing.chess_type
    const role = chess === Chess.Black ? 'b' : 'w'
    window.electronAPI.sendData(OpCode.GIVEUP_OP, role)
  }
}

const timeout = computed(() => store.state.uiState.game?.metadata.timeout || 30)
const timerRunning = computed(() => store.state.timer.running)
const timerProgress = computed(() => 100 - store.getters.timerProgress)
const shouldStartTimer = computed(() => store.state.uiState.status === GameStatus.ON_GOING && store.state.uiState.game?.move_count)

const chessboard = computed(() => store.getters.chessboard)
const disabledPosition = computed(() => store.state.uiState.game?.disabled_positions || [])
const nowPlayer = computed(() => {
  if (!store.state.uiState.game) return null
  return store.state.uiState.game.now_playing === store.state.uiState.game.metadata.player_our.chess_type ? store.state.uiState.game.metadata.player_our : store.state.uiState.game.metadata.player_opposing
})
const isOurPlayerPlaying = computed(() => store.state.uiState.game?.now_playing === store.state.uiState.game?.metadata.player_our.chess_type)

const showGameResult = computed(() => store.state.uiState.status === GameStatus.GAME_OVER && store.state.uiState.game_result.winner !== Chess.None)
const winnerName = computed(() => {
  if (store.state.uiState.game == null) return ''
  const winner = store.state.uiState.game_result.winner
  if (winner === Chess.None) return ''
  const winnerChessText = winner === Chess.Black ? '黑方' : '白方'
  const winnerPlayer = winner === store.state.uiState.game.metadata.player_our.chess_type ? store.state.uiState.game.metadata.player_our : store.state.uiState.game.metadata.player_opposing
  return `${winnerChessText}（${winnerPlayer.name}）`
})
const loserName = computed(() => {
  const loser = -store.state.uiState.game_result.winner
  if (loser === Chess.Black) {
    return '黑方'
  } else if (loser === Chess.White) {
    return '白方'
  } else {
    return ''
  }
})
const winReasonText = computed(() => {
  const reason = store.state.uiState.game_result.win_type
  if (reason === WinType.GIVEUP) {
    return `${loserName.value}认输`
  } else if (reason === WinType.TIMEOUT) {
    return `${loserName.value}超时`
  } else if (reason === WinType.SUICIDE) {
    return `${loserName.value}吃掉了${winnerName.value}的棋子`
  } else {
    return ''
  }
})

watch(nowPlayer, () => {
  if (shouldStartTimer.value) {
    store.dispatch('startTimer', { duration: timeout.value })
  }
})

onMounted(() => {
  if (nowPlayer.value != null && shouldStartTimer.value) store.dispatch('startTimer', { duration: timeout.value })
})
</script>

<style scoped lang="scss">
.timer {
  transition: opacity ease-in-out .3s;
  padding: 0px 16px;
}

.game-ongoing {
  z-index: 1;
}

.game-result {
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  transition: all 0.3s ease;
  backdrop-filter: blur(16px);

  &.show {
    z-index: 999;
    opacity: 1;
    backdrop-filter: blur(16px);
  }

  &.hide {
    z-index: 0;
    opacity: 0;
    backdrop-filter: blur(0px);
  }

  .game-result-content {
    padding: 32px;
    background: rgba($color: #FFFFFF, $alpha: 0.5);
    border-radius: 16px;
    display: inline;
    text-align: center;
  }
}

.player-container {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.game-chessboard {
  padding: 16px;
  background: rgba($color: #FFFFFF, $alpha: 0.5);
  border-radius: 32px;
  backdrop-filter: blur(0px);
  display: inline-block;
}
</style>
