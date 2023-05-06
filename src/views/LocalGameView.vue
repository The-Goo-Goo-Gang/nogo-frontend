<template>
  <div class="game-container grid game-ongoing" v-if="store.state.uiState.status != GameStatus.NOT_PREPARED">
    <div class="game-left-container left">
      <div class="player-container">
        <PlayerIndicator
          :player="store.state.uiState.game?.metadata.player_opposing || { name: 'Player B', type: PlayerType.LocalHumanPlayer, chess_type: Chess.White }"
          :is-playing="!isOurPlayerPlaying" />
        <div class="timer" :style="{ opacity: (!isOurPlayerPlaying) ? 1 : 0 }">
          <ProgressBar :progress="timerProgress" />
        </div>
      </div>
      <div class="game-chessboard">
        <GameChessboard :width="400" :height="400" :chesses="chessboard" @chess-clicked="onChessClicked"></GameChessboard>
      </div>
      <div class="player-container">
        <div class="timer" :style="{ opacity: isOurPlayerPlaying ? 1 : 0 }">
          <ProgressBar :progress="timerProgress" />
        </div>
        <PlayerIndicator
          :player="store.state.uiState.game?.metadata.player_our || { name: 'Player A', type: PlayerType.LocalHumanPlayer, chess_type: Chess.Black }"
          :is-playing="isOurPlayerPlaying" :show-timer="isOurPlayerPlaying" :reverse="true" />
      </div>
    </div>
    <div class="game-right-container right">
      <div class="game-actions">
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
import { Chess, GameStatus, LocalGameType, OpCode, PlayerType, WinType } from '@/const'
import { computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const store = useStore()
const router = useRouter()

const restartGame = () => {
  store.dispatch('startLocalGame', { type: LocalGameType.PVP, size: 9 })
}

const onChessClicked = (x: number, y: number) => {
  if (store.state.uiState.status === GameStatus.ON_GOING) {
    console.log('onChessClicked', x, y, (store.state.uiState.game?.chessboard[x] || [])[y] || Chess.None)
    store.dispatch('doLocalMove', { x, y })
  }
}

const returnHome = () => {
  router.push('/')
}

const giveUp = () => {
  if (store.state.uiState.game != null && store.state.uiState.status === GameStatus.ON_GOING) {
    const chess = store.state.uiState.game.now_playing === store.state.uiState.game.metadata.player_our.chess_type ? store.state.uiState.game.metadata.player_our.chess_type : store.state.uiState.game.metadata.player_opposing.chess_type
    const role = chess === Chess.Black ? 'b' : 'w'
    window.electronAPI.sendData(OpCode.GIVEUP_OP, role)
  }
}

const showGameResult = computed(() => store.state.uiState.status === GameStatus.GAME_OVER && store.state.uiState.game_result.winner !== Chess.None)
const chessboard = computed(() => store.getters.chessboard)
const isOurPlayerPlaying = computed(() => store.state.uiState.game?.now_playing === store.state.uiState.game?.metadata.player_our.chess_type)
const nowPlayer = computed(() => {
  if (!store.state.uiState.game) return null
  return store.state.uiState.game.now_playing === store.state.uiState.game.metadata.player_our.chess_type ? store.state.uiState.game.metadata.player_our : store.state.uiState.game.metadata.player_opposing
})
const timerProgress = computed(() => store.getters.timerProgress)
const winnerName = computed(() => {
  const winner = store.state.uiState.game_result.winner
  if (winner === Chess.Black) {
    return '黑方'
  } else if (winner === Chess.White) {
    return '白方'
  } else {
    return ''
  }
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
const timeout = computed(() => store.state.uiState.game?.metadata.timeout || 30)

watch(nowPlayer, () => {
  if (store.state.uiState.status === GameStatus.ON_GOING) {
    store.dispatch('startTimer', { duration: timeout.value })
  }
})

onMounted(() => {
  if (nowPlayer.value != null) store.dispatch('startTimer', { duration: timeout.value })
})
</script>

<style lang="scss">
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

.game-left-container {
  padding: 16px;
  justify-content: space-between;
  display: inline-flex;
  flex-direction: column;
  gap: 16px;
}

.game-right-container {
  padding: 16px;
  display: inline-flex;
  flex-direction: column;
  justify-content: flex-end;
  // flex: 1;
}

.grid {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  padding: 0em;
  gap: 16px;
}

.game-container {
  height: 94%;
  width: 96%;
  max-width: 1280px;

  @media (min-width: 600px) {
    height: 92%;
    width: 94%;
  }

  @media (min-width: 1024px) {
    height: 90%;
    width: 92%;
  }
}
</style>
