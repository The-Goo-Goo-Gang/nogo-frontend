import { Chess, GameStatus, WinType } from '@/const'
import { Player } from '@/state'
import { useStore } from '@/store'
import { Ref, computed, onMounted, watch } from 'vue'

export const useGameTimer = (nowPlayer: Ref<Player | null>) => {
  const store = useStore()

  const timeout = computed(() => {
    if (store.state.uiState.game) return store.state.uiState.game.metadata.turn_timeout
    else return 0
  })
  const timerRunning = computed(() => store.state.timer.running)
  const timerProgress = computed(() => 100 - store.getters.timerProgress)
  const shouldStartTimer = computed(() => store.state.uiState.game && store.state.uiState.status === GameStatus.ON_GOING && store.state.uiState.game.move_count > 0)

  watch(() => nowPlayer.value?.chess_type, () => {
    if (store.state.uiState.status === GameStatus.ON_GOING && shouldStartTimer.value) {
      store.dispatch('startTimer', { duration: timeout.value })
    }
  })
  watch(shouldStartTimer, (newVal) => {
    if (newVal) {
      store.dispatch('startTimer', { duration: timeout.value })
    }
  })

  onMounted(() => {
    if (nowPlayer.value != null && shouldStartTimer.value) store.dispatch('startTimer', { duration: timeout.value })
  })

  return {
    timeout,
    timerRunning,
    timerProgress,
    shouldStartTimer
  }
}

export const useGameResult = () => {
  const store = useStore()

  const getChessPlayerText = (chess: Chess) => {
    const chessPlayer = chess === store.state.uiState.game?.metadata.player_our.chess_type ? store.state.uiState.game.metadata.player_our : store.state.uiState.game?.metadata.player_opposing
    const chessText = chess === Chess.Black ? '黑方' : chess === Chess.White ? '白方' : ''
    const chessDefaultUsername = chess === Chess.Black ? 'Black' : chess === Chess.White ? 'White' : ''
    if (chessPlayer && chessPlayer.name !== chessDefaultUsername) {
      return `${chessText}（${chessPlayer.name}）`
    } else {
      return chessText
    }
  }

  const showGameResult = computed(() => store.state.uiState.status === GameStatus.GAME_OVER && store.state.uiState.game_result.winner !== Chess.None)
  const winner = computed(() => store.state.uiState.game_result.winner)
  const loser = computed(() => -winner.value)
  const winnerName = computed(() => getChessPlayerText(winner.value))
  const loserName = computed(() => getChessPlayerText(loser.value))
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

  return {
    showGameResult,
    winner,
    loser,
    winnerName,
    loserName,
    winReasonText
  }
}

export const useGameChessboard = () => {
  const store = useStore()

  const chessboardSize = computed(() => store.state.uiState.game?.metadata.size || 9)
  const chessboard = computed(() => store.getters.chessboard)
  const disabledPositions = computed(() => store.state.uiState.game?.disabled_positions || [])
  const highlightPositions = computed(() => store.state.uiState.game?.last_move ? [store.state.uiState.game.last_move] : [])

  return {
    chessboard,
    chessboardSize,
    disabledPositions,
    highlightPositions
  }
}
