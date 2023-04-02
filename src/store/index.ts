import { createStore, Store, useStore as baseUseStore } from 'vuex'
import { GlobalState } from './type'
import { InjectionKey, reactive } from 'vue'
import { Chess, GameStatus, OpCode, PlayerType, WinType } from '@/const'
import { UiState } from '@/state'

export const key: InjectionKey<Store<GlobalState>> = Symbol('globalState')

export const store = createStore<GlobalState>({
  state: {
    uiState: {
      is_gaming: false,
      status: GameStatus.NOT_PREPARED,
      game: {
        chessboard: [[]],
        is_our_player_playing: true,
        metadata: {
          size: 9,
          player_opposing: {
            name: 'Player 2',
            type: PlayerType.LocalHumanPlayer,
            chess_type: Chess.White
          },
          player_our: {
            name: 'Player 1',
            type: PlayerType.LocalHumanPlayer,
            chess_type: Chess.Black
          },
          turn_timeout: 60
        },
        statistics: []
      },
      game_result: {
        winner: Chess.None,
        win_type: WinType.NONE
      }
    },
    timer: {
      running: false,
      current_timestamp: 0,
      start_timestamp: 0,
      end_timestamp: 0
    }
  },
  getters: {
    timerEnd (state) {
      return state.timer.current_timestamp >= state.timer.end_timestamp
    },
    timerProgress (state) {
      if (!state.timer.running) return 0
      return (state.timer.current_timestamp - state.timer.start_timestamp) / (state.timer.end_timestamp - state.timer.start_timestamp) * 100
    }
  },
  mutations: {
    startTimer (state, duration: number) {
      state.timer.running = true
      state.timer.start_timestamp = new Date().getTime()
      state.timer.end_timestamp = new Date().getTime() + duration * 1000
    },
    doTimer (state, timestamp: number) {
      if (timestamp < state.timer.start_timestamp) {
        state.timer.current_timestamp = state.timer.start_timestamp
      } else if (timestamp > state.timer.end_timestamp) {
        state.timer.current_timestamp = state.timer.end_timestamp
      } else {
        state.timer.current_timestamp = timestamp
      }
    },
    endTimer (state) {
      state.timer.running = false
    },
    updateState (state, newState: UiState) {
      state.uiState = reactive(newState)
    },
    doMove (state, payload: { x: number, y: number, chess: Chess }) {
      if (state.uiState.game) {
        if (!state.uiState.game.chess_board[payload.x]) state.uiState.game.chess_board[payload.x] = []
        state.uiState.game.chess_board[payload.x][payload.y] = payload.chess
        state.uiState.game.is_our_player_playing = !state.uiState.game.is_our_player_playing
      }
    }
  },
  actions: {
    startTimer ({ commit }, payload: { duration: number }) {
      commit('startTimer', payload.duration)
      const interval = setInterval(() => {
        commit('doTimer', new Date().getTime())
      }, 100)
      setTimeout(() => {
        commit('endTimer')
        clearInterval(interval)
      }, (payload.duration + 1) * 1000)
    },
    doMove ({ commit, state }, payload: { x: number, y: number }) {
      if (state.uiState.game) {
        const nowChess = (state.uiState.game.chess_board[payload.x] || [])[payload.y] || Chess.None
        if (nowChess === Chess.None) {
          const chess = state.uiState.game.is_our_player_playing ? state.uiState.game.metadata.player_our.chess_type : state.uiState.game.metadata.player_opposing.chess_type
          commit('doMove', { x: payload.x, y: payload.y, chess })
          window.electronAPI.sendData(OpCode.MOVE_OP, `${'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[payload.x]}${payload.y}`)
        }
      }
    }
  },
  modules: {
  }
})

export function useStore () {
  return baseUseStore(key)
}
