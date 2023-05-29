<template>
  <div class="game-container game-grid game-replay">
    <div class="game-left-container left">
      <div class="player-container">
        <PlayerIndicator :player="playerWhite"
          :is-playing="replayProgress != replayProgressMax && replayProgress % 2 === 1" />
      </div>
      <div class="game-chessboard">
        <GameChessboard :width="400" :height="400" :chesses="chessboard" :disabled-positions="disabledPositions"
          :highlight-positions="highlightPositions" @chess-clicked="onChessClicked" :size="9" :only-read="!isReplaying">
        </GameChessboard>
      </div>
      <div class="player-container">
        <PlayerIndicator :player="playerBlack"
          :is-playing="replayProgress != replayProgressMax && replayProgress % 2 === 0" />
      </div>
    </div>
    <div class="game-right-container right">
      <div class="game-replay-exit">
        <button class="game-replay-exit-button" @click="exitReplay">
          <ExitToAppIcon class="icon-1p5x" />
        </button>
      </div>
      <div class="game-replay-result"
        v-if="replayProgress === replayProgressMax || (isReplaying && store.state.uiState.game_result.win_type !== WinType.NONE)">
        <div class="game-replay-result-winner">{{ winnerName }}获胜</div>
        <div class="game-replay-result-reason">原因：{{ winReasonText }}</div>
      </div>
      <div style="position: relative;">
        <div class="game-replay-control">
          <div class="game-replay-control-buttons">
            <button class="game-replay-control-button" @click="previousStep" :disabled="replayProgress === 0">
              <PreviousIcon />
            </button>
            <button class="game-replay-control-button" @click="startReplay" v-if="!isPlaying">
              <PlayIcon />
            </button>
            <button class="game-replay-control-button" @click="pauseReplay" v-else>
              <PauseIcon />
            </button>
            <button class="game-replay-control-button" @click="nextStep" :disabled="replayProgress === replayProgressMax">
              <NextIcon />
            </button>
            <button class="game-replay-control-button" @click="stopReplay">
              <StopIcon />
            </button>
            <button class="game-replay-control-button" @click="togglePlaySpeed" :title="`${playSpeed}X`">
              <SpeedometerSlowIcon v-if="playSpeed === 1" />
              <SpeedometerMediumIcon v-else-if="playSpeed === 2" />
              <SpeedometerIcon v-if="playSpeed === 3" />
            </button>
          </div>
          <div class="game-replay-control-slider">
            <input type="range" :min="0" :max="replayProgressMax" :step="1" v-model.number="replayProgress" />
            <span class="game-replay-control-slider-label">{{ replayProgress }} / {{ replayProgressMax }}</span>
          </div>
        </div>
        <div class="game-replay-control-replaying" :class="{ replaying: isReplaying }" @click="stopMoving">
          <div class="game-replay-control-replaying-title">正在重玩……</div>
          <div class="game-replay-control-replaying-message">点击重置对局</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Ref, computed, onMounted, reactive, ref, watch } from 'vue'
import { useStore } from '@/store'
import ExitToAppIcon from 'vue-material-design-icons/ExitToApp.vue'
import PlayIcon from 'vue-material-design-icons/Play.vue'
import PauseIcon from 'vue-material-design-icons/Pause.vue'
import StopIcon from 'vue-material-design-icons/Stop.vue'
import SpeedometerIcon from 'vue-material-design-icons/Speedometer.vue'
import SpeedometerSlowIcon from 'vue-material-design-icons/SpeedometerSlow.vue'
import SpeedometerMediumIcon from 'vue-material-design-icons/SpeedometerMedium.vue'
import PreviousIcon from 'vue-material-design-icons/ChevronLeft.vue'
import NextIcon from 'vue-material-design-icons/ChevronRight.vue'
import PlayerIndicator from '@/components/PlayerIndicator.vue'
import GameChessboard from '@/components/GameChessboard.vue'
import { Player } from '@/state'
import { Chess, GameStatus, OpCode, PlayerType, WinType } from '@/const'
import { positionToString, stringToPosition } from '@/utils/nogo'
import { useRoute, useRouter } from 'vue-router'
import { Alert } from '@/components/alert/alert'

const store = useStore()
const route = useRoute()
const router = useRouter()
const playSpeed: Ref<1 | 2 | 3> = ref(1)
const replayProgress = ref(0)
const replayGame = ref('')
const isPlaying = ref(false)

onMounted(async () => {
  const id = route.params.id as string
  if (id) {
    const savedGame = await window.electronAPI.getSavedGame(id)
    if (savedGame) {
      replayGame.value = savedGame.encoded
    }
  }
})

const isReplaying = computed(() => store.state.uiState.status !== GameStatus.NOT_PREPARED && store.state.uiState.game?.is_replaying)
const replayGameSteps = computed(() => replayGame.value.split(' '))
const replayGameWinType = computed(() => {
  if (!replayGameSteps.value.length) return WinType.NONE
  switch (replayGameSteps.value[replayGameSteps.value.length - 1]) {
    case 'T':
      return WinType.TIMEOUT
    case 'G':
      return WinType.GIVEUP
    default:
      return WinType.SUICIDE
  }
})
const replayProgressMax = computed(() => replayGameSteps.value.length)

const replayGameCurrent = computed(() => replayGameSteps.value.slice(0, replayProgress.value).filter(step => step.length > 1).map(step => stringToPosition(step)))

const chessboard = computed(() => {
  if (isReplaying.value && store.state.uiState.game) return store.state.uiState.game.chessboard
  const board = Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => Chess.None))
  replayGameCurrent.value.forEach(({ x, y }, i) => {
    const chess = i % 2 === 0 ? Chess.Black : Chess.White
    board[x][y] = chess
  })
  return board
})

const disabledPositions = computed(() => isReplaying.value ? store.state.uiState.game?.disabled_positions || [] : [])

const highlightPositions = computed(() => {
  if (isReplaying.value) return store.state.uiState.game?.last_move ? [store.state.uiState.game.last_move] : []
  if (replayGameCurrent.value.length > 0) {
    return [replayGameCurrent.value[replayGameCurrent.value.length - 1]]
  }
  return []
})

const winner = computed(() => {
  if (isReplaying.value) return store.state.uiState.game_result.winner
  return replayGameSteps.value.length % 2 === 0 ? Chess.Black : Chess.White
})
const winType = computed(() => {
  if (isReplaying.value) return store.state.uiState.game_result.win_type
  return replayGameWinType.value
})

const winnerName = computed(() => winner.value === Chess.Black ? '黑方' : winner.value === Chess.White ? '白方' : '')
const loserName = computed(() => -winner.value === Chess.Black ? '黑方' : -winner.value === Chess.White ? '白方' : '')
const winReasonText = computed(() => {
  if (winType.value === WinType.GIVEUP) {
    return `${loserName.value}认输`
  } else if (winType.value === WinType.TIMEOUT) {
    return `${loserName.value}超时`
  } else if (winType.value === WinType.SUICIDE) {
    return `${loserName.value}吃掉了${winnerName.value}的棋子`
  } else {
    return ''
  }
})

const playerBlack: Player = reactive({
  name: 'Black',
  type: PlayerType.LocalHumanPlayer,
  chess_type: Chess.Black
})

const playerWhite: Player = reactive({
  name: 'White',
  type: PlayerType.LocalHumanPlayer,
  chess_type: Chess.White
})

const onChessClicked = (x: number, y: number) => {
  if (!isReplaying.value) {
    startMoving()
  } else {
    const nowChess = chessboard.value[x][y]
    if (store.state.uiState.status === GameStatus.ON_GOING && nowChess === Chess.None) {
      window.electronAPI.sendData(OpCode.REPLAY_MOVE_OP, positionToString(x, y))
    }
  }
}

const startMoving = () => {
  if (replayProgress.value === replayProgressMax.value && replayGameWinType.value === WinType.SUICIDE) {
    Alert({
      title: '现在不能重玩',
      content: '已经结束嘞！',
      timeout: 2000
    })
    return
  }
  pauseReplay()
  window.electronAPI.sendData(OpCode.REPLAY_START_MOVE_OP, replayGameCurrent.value.map(({ x, y }) => positionToString(x, y)).join(' '))
}

const stopMoving = () => {
  window.electronAPI.sendData(OpCode.REPLAY_STOP_MOVE_OP)
}

const startReplay = () => {
  isPlaying.value = true
}

const pauseReplay = () => {
  isPlaying.value = false
}

const stopReplay = () => {
  isPlaying.value = false
  replayProgress.value = 0
}

const previousStep = () => {
  if (replayProgress.value > 0) {
    replayProgress.value--
  }
}

const nextStep = () => {
  if (replayProgress.value < replayProgressMax.value) {
    replayProgress.value++
  }
}

const exitReplay = () => {
  router.back()
}

const togglePlaySpeed = () => {
  if (playSpeed.value === 1 || playSpeed.value === 2) playSpeed.value++
  else playSpeed.value = 1
}

let interval = 0
const resetInterval = () => {
  if (interval) clearInterval(interval)
  interval = +setInterval(() => {
    if (replayProgress.value < replayProgressMax.value) {
      replayProgress.value++
      if (replayProgress.value === replayProgressMax.value) {
        isPlaying.value = false
      }
    } else {
      isPlaying.value = false
    }
  }, 3000 / playSpeed.value)
}

watch(isPlaying, (value) => {
  if (value) {
    resetInterval()
  } else {
    if (interval) clearInterval(interval)
  }
})

watch(playSpeed, () => {
  if (isPlaying.value) {
    resetInterval()
  }
})
</script>

<style scoped lang="scss">
@import '../styles/variables.scss';

.game-replay {
  z-index: 1;
  align-items: stretch;
}

.right {
  align-items: stretch;
  justify-content: space-between;
}

.game-replay-control-slider {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0;
  padding: 0;
  border: none;
  background: none;
  cursor: pointer;

  input[type="range"] {
    appearance: none;
    height: 0.5rem;
    background: #d3d3d3;
    outline: none;
    width: 180px;
    border-radius: 0.5rem;
    margin-top: 0.5rem;
    margin-bottom: 1rem;

    //滑块样式（蓝色）
    &::-webkit-slider-thumb {
      appearance: none;
      width: 1rem;
      height: 1rem;
      border-radius: 50%;
      background: $theme-color;
      cursor: pointer;
      transition: transform 0.2s, background .2s;

      //按下时加一个变小动画和颜色变深（有过渡）
      &:active {
        transform: scale(0.9);
        background: adjust-color($color: $theme-color, $lightness: -10%);
      }

      &:hover {
        background: adjust-color($color: $theme-color, $lightness: -5%);
      }
    }
  }

  span {
    position: absolute;
    top: 1.2rem;
    left: 0;
    width: 100%;
    text-align: center;
    font-size: 0.8rem;
    color: rgba($color: #000, $alpha: 0.5);
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
  border-radius: 16px;
  backdrop-filter: blur(0px);
  display: inline-block;
}

.game-replay-control-replaying {
  padding: 16px;
  border-radius: 8px;
  text-align: center;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  z-index: 0;
  opacity: 0;
  user-select: none;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  pointer-events: none;

  &.replaying {
    opacity: 1;
    backdrop-filter: blur(8px);
    z-index: 2;
    pointer-events: all;
  }

  .game-replay-control-replaying-title {
    font-weight: bold;
  }

  .game-replay-control-replaying-message {
    font-size: 0.8rem;
    color: rgba($color: #000, $alpha: 0.5);
  }
}

.game-replay-control {
  background: rgba($color: #FFFFFF, $alpha: 0.35);
  padding: 16px;
  border-radius: 8px;
  z-index: 1;

  .game-replay-control-buttons {
    display: flex;
    flex-direction: row;
    gap: 4px;
    align-items: center;
    justify-content: center;
    margin-bottom: 16px;

    .game-replay-control-button {
      appearance: none;
      border: none;
      background: none;
      width: 2rem;
      height: 2rem;
      cursor: pointer;
      border-radius: 50%;
      transition: transform 0.2s;

      &:active {
        transform: scale(0.9);
      }

      &:hover {
        background: rgba($color: #FFFFFF, $alpha: 0.5);
      }
    }
  }
}

.game-replay-result {
  background: rgba($color: #FFFFFF, $alpha: 0.35);
  padding: 16px;
  border-radius: 8px;
  text-align: center;

  .game-replay-result-winner {
    font-size: 1rem;
    font-weight: bold;
    margin-bottom: 8px;
  }

  .game-replay-result-reason {
    font-size: 0.8rem;
    color: rgba($color: #000, $alpha: 0.5);
  }
}

.game-replay-exit {
  display: flex;
  flex-direction: row;
  justify-content: end;

  .game-replay-exit-button {
    appearance: none;
    border: none;
    background: rgba($color: #FFFFFF, $alpha: 0.35);
    width: 3rem;
    height: 3rem;
    cursor: pointer;
    border-radius: 8px;
    transition: all 0.2s $bezier;
    display: flex;
    align-items: center;
    justify-content: center;

    .material-design-icon__svg {
      bottom: 0;
    }

    &:active {
      transform: scale(0.95);
    }

    &:hover {
      background: rgba($color: #FFFFFF, $alpha: 0.5);
    }
  }
}

.reset-game-btn {
  text-align: center;
}
</style>
