import { createStore, Store, useStore as baseUseStore } from 'vuex'
import { GlobalState } from './type'
import { InjectionKey, reactive } from 'vue'
import { Chess, GameStatus, LocalGameType, OpCode, PlayerType, WinType } from '@/const'
import { UiState } from '@/state'
import { DEFAULT_CONFIG, getConfigFromLocalStorage, NoGoConfig, NoGoConfigDiff } from '@/config'

export const key: InjectionKey<Store<GlobalState>> = Symbol('globalState')

export const store = createStore<GlobalState>({
  state: {
    config: getConfigFromLocalStorage(),
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
      end_timestamp: 0,
      timer_interval: null,
      timer_timeout: null
    }
  },
  getters: {
    timerEnd (state) {
      return state.timer.current_timestamp >= state.timer.end_timestamp
    },
    timerProgress (state) {
      if (!state.timer.running) return 0
      return (state.timer.current_timestamp - state.timer.start_timestamp) / (state.timer.end_timestamp - state.timer.start_timestamp) * 100
    },
    chessboard (state) {
      if (state.uiState.game) {
        return state.uiState.game.chessboard
      }
      return new Array(...((() => {
        const arr: Array<Array<Chess>> = []
        for (let i = 0; i < 13; i++) {
          const arr2: Array<Chess> = []
          for (let j = 0; j < 13; j++) {
            arr2.push(Chess.None)
          }
          arr.push(arr2)
        }
        return arr
      })()))
    }
  },
  mutations: {
    startLocalGame (state) {
      state.uiState.status = GameStatus.NOT_PREPARED
    },
    startTimer (state, payload: { duration: number, interval: number, timeout: number }) {
      state.timer.running = true
      state.timer.start_timestamp = new Date().getTime()
      state.timer.end_timestamp = new Date().getTime() + payload.duration * 1000
      state.timer.timer_interval = payload.interval
      state.timer.timer_timeout = payload.timeout
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
        if (state.uiState.game.chessboard[payload.x] == null) state.uiState.game.chessboard[payload.x] = []
        state.uiState.game.chessboard[payload.x][payload.y] = payload.chess
        state.uiState.game.is_our_player_playing = !state.uiState.game.is_our_player_playing
      }
    },
    updateConfig (state, payload: NoGoConfig) {
      state.config = payload
    }
  },
  actions: {
    startLocalGame ({ commit }, payload: { type: LocalGameType, size: 9|11|13, timeout: number }) {
      commit('startLocalGame')
      window.electronAPI.sendData(OpCode.START_LOCAL_GAME_OP, `${payload.type}`, `${payload.size}`)
    },
    startTimer ({ commit, state }, payload: { duration: number }) {
      if (state.timer.running) {
        commit('endTimer')
        if (state.timer.timer_interval) {
          clearInterval(state.timer.timer_interval)
        }
        if (state.timer.timer_timeout) {
          clearTimeout(state.timer.timer_timeout)
        }
      }
      const interval = setInterval(() => {
        commit('doTimer', new Date().getTime())
      }, 100)
      const timeout = setTimeout(() => {
        commit('endTimer')
        clearInterval(interval)
      }, (payload.duration + 1) * 1000)
      commit('startTimer', {
        duration: payload.duration,
        interval,
        timeout
      })
    },
    doMove ({ commit, state }, payload: { x: number, y: number }) {
      if (state.uiState.game) {
        const nowChess = (state.uiState.game.chessboard[payload.x] || [])[payload.y] || Chess.None
        if (nowChess === Chess.None) {
          const chess = state.uiState.game.is_our_player_playing ? state.uiState.game.metadata.player_our.chess_type : state.uiState.game.metadata.player_opposing.chess_type
          commit('doMove', { x: payload.x, y: payload.y, chess })
          const role = chess === Chess.Black ? 'b' : 'w'
          window.electronAPI.sendData(OpCode.MOVE_OP, `${'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[payload.x]}${payload.y + 1}`, role)
        }
      }
    },
    timeout ({ state }) {
      if (state.uiState.game) {
        const nowPlayer = state.uiState.game.is_our_player_playing ? state.uiState.game.metadata.player_our : state.uiState.game.metadata.player_opposing
        const nowPlayerChess = nowPlayer.chess_type === Chess.Black ? 'b' : 'w'
        window.electronAPI.sendData(OpCode.LOCAL_GAME_TIMEOUT_OP, nowPlayerChess)
      }
    },
    updateConfig ({ commit, state }, payload: NoGoConfigDiff) {
      console.log('update config diff', payload)
      const newConfig: NoGoConfig = {
        ...DEFAULT_CONFIG,
        ...state.config,
        ...payload
      }
      commit('updateConfig', newConfig)
      console.log('update config', newConfig)
      window.localStorage.setItem('config', JSON.stringify(newConfig))
    }
  },
  modules: {
  }
})

export function useStore () {
  return baseUseStore(key)
}
