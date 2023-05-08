import { createStore, Store, useStore as baseUseStore } from 'vuex'
import { GlobalState } from './type'
import { InjectionKey, reactive } from 'vue'
import { Chess, GameStatus, LocalGameType, OpCode, PlayerType, WinType } from '@/const'
import { ChatMessage, UiState } from '@/state'
import { DEFAULT_CONFIG, getConfigFromLocalStorage, NoGoConfig, NoGoConfigDiff } from '@/config'
import { Alert } from '@/components/alert/alert'

export const key: InjectionKey<Store<GlobalState>> = Symbol('globalState')

export const store = createStore<GlobalState>({
  state: {
    config: getConfigFromLocalStorage(),
    uiState: {
      is_gaming: false,
      status: GameStatus.NOT_PREPARED,
      game: {
        chessboard: [[]],
        now_playing: Chess.None,
        move_count: 0,
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
          timeout: 60
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
    },
    remote: {
      is_connected: false,
      is_connecting: false,
      is_connecting_failed: false,
      is_requesting: false,
      requesting_chess: Chess.None
    },
    chat_messages: new Map()
  },
  getters: {
    isGaming(state) {
      return state.uiState.is_gaming
    },
    timerEnd(state) {
      return state.timer.current_timestamp >= state.timer.end_timestamp
    },
    timerProgress(state) {
      if (!state.timer.running) return 0
      return (state.timer.current_timestamp - state.timer.start_timestamp) / (state.timer.end_timestamp - state.timer.start_timestamp) * 100
    },
    chessboard(state) {
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
    startLocalGame(state) {
      state.uiState.status = GameStatus.NOT_PREPARED
    },
    startTimer(state, payload: { duration: number, interval: number, timeout: number }) {
      state.timer.running = true
      state.timer.start_timestamp = new Date().getTime()
      state.timer.end_timestamp = new Date().getTime() + payload.duration * 1000
      state.timer.timer_interval = payload.interval
      state.timer.timer_timeout = payload.timeout
    },
    doTimer(state, timestamp: number) {
      if (timestamp < state.timer.start_timestamp) {
        state.timer.current_timestamp = state.timer.start_timestamp
      } else if (timestamp > state.timer.end_timestamp) {
        state.timer.current_timestamp = state.timer.end_timestamp
      } else {
        state.timer.current_timestamp = timestamp
      }
    },
    endTimer(state) {
      state.timer.running = false
    },
    updateState(state, newState: UiState) {
      state.uiState = reactive(newState)
    },
    doMove(state, payload: { x: number, y: number, chess: Chess }) {
      if (state.uiState.game) {
        if (state.uiState.game.chessboard[payload.x] == null) state.uiState.game.chessboard[payload.x] = []
        state.uiState.game.chessboard[payload.x][payload.y] = payload.chess
        state.uiState.game.now_playing = -state.uiState.game.now_playing
      }
    },
    updateConfig(state, payload: NoGoConfig) {
      state.config = payload
    },
    connectToRemote(state, payload: { host: string, port: number }) {
      state.remote.is_connected = false
      state.remote.is_connecting = true
      state.remote.is_connecting_failed = false
      state.remote.remote_ip = payload.host
      state.remote.remote_port = payload.port
    },
    connectToRemoteResult(state, payload: { success: boolean, message?: string, host?: string, port?: number }) {
      state.remote.is_connecting = false
      state.remote.is_connecting_failed = !payload.success
      if (payload.success) {
        state.remote.is_connected = true
        state.remote.remote_ip = payload.host
        state.remote.remote_port = payload.port
      } else {
        state.remote.is_connected = false
        state.remote.failed_message = payload.message
      }
    },
    requestRemoteGame(state, payload: { chessType: Chess }) {
      state.remote.is_requesting = true
      state.remote.requesting_chess = payload.chessType
    },
    receiveAccept(state) {
      state.remote.is_requesting = false
    },
    acceptRequest(state) {
      state.remote.is_connected = true
    },
    leaveOnlineGame(state) {
      state.uiState.status = GameStatus.NOT_PREPARED
      state.uiState.is_gaming = false
      delete state.uiState.game

      state.remote.is_connected = false
      state.remote.is_connecting = false
      state.remote.is_connecting_failed = false
      state.remote.is_requesting = false
    },
    receiveChatMessage(state, payload: { username: string, message: string }) {
      if (!state.chat_messages.has(payload.username)) {
        state.chat_messages.set(payload.username, new Array<ChatMessage>())
      }
      state.chat_messages.get(payload.username)?.push({ sender: payload.username, content: payload.message, timestamp: new Date().getTime() })
    },
    sendChatMessage(state, payload: { target: string, message: string }) {
      if (!state.chat_messages.has(payload.target)) {
        state.chat_messages.set(payload.target, new Array<ChatMessage>())
      }
      state.chat_messages.get(payload.target)?.push({ sender: state.config.onlineUsername, content: payload.message, timestamp: new Date().getTime() })
    },
    updateChatUsername(state, payload: { oldUsername: string, newUsername: string }) {
      if (state.chat_messages.has(payload.oldUsername)) {
        state.chat_messages.set(payload.newUsername, state.chat_messages.get(payload.oldUsername) || [])
        state.chat_messages.delete(payload.oldUsername)
      }
    }
  },
  actions: {
    async startLocalGame({ commit }, payload: { type: LocalGameType, size: 9 | 11 | 13, timeout: number }) {
      commit('startLocalGame')
      await window.electronAPI.sendDataAsync(OpCode.START_LOCAL_GAME_OP, `${payload.timeout}`, `${payload.size}`)
    },
    startTimer({ commit, state }, payload: { duration: number }) {
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
    async doMove({ commit, state }, payload: { x: number, y: number }) {
      if (state.uiState.game) {
        const nowChess = (state.uiState.game.chessboard[payload.x] || [])[payload.y] || Chess.None
        if (nowChess === Chess.None) {
          const chess = state.uiState.game.now_playing === state.uiState.game.metadata.player_our.chess_type ? state.uiState.game.metadata.player_our.chess_type : state.uiState.game.metadata.player_opposing.chess_type
          commit('doMove', { x: payload.x, y: payload.y, chess })
          await window.electronAPI.sendDataAsync(OpCode.MOVE_OP, `${'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[payload.x]}${payload.y + 1}`, `${new Date().getTime()}`)
        }
      }
    },
    async doLocalMove({ commit, state }, payload: { x: number, y: number }) {
      if (state.uiState.game) {
        const nowChess = (state.uiState.game.chessboard[payload.x] || [])[payload.y] || Chess.None
        if (nowChess === Chess.None) {
          const chess = state.uiState.game.now_playing === state.uiState.game.metadata.player_our.chess_type ? state.uiState.game.metadata.player_our.chess_type : state.uiState.game.metadata.player_opposing.chess_type
          commit('doMove', { x: payload.x, y: payload.y, chess })
          const role = chess === Chess.Black ? 'b' : 'w'
          await window.electronAPI.sendDataAsync(OpCode.LOCAL_GAME_MOVE_OP, `${'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[payload.x]}${payload.y + 1}`, role)
        }
      }
    },
    updateConfig({ commit, state }, payload: NoGoConfigDiff) {
      console.log('update config diff', payload)
      const newConfig: NoGoConfig = {
        ...DEFAULT_CONFIG,
        ...state.config,
        ...payload
      }
      commit('updateConfig', newConfig)
      console.log('update config', newConfig)
      window.localStorage.setItem('config', JSON.stringify(newConfig))
    },
    async connectToRemote({ commit }, payload: { host: string, port: number }) {
      commit('connectToRemote', payload)
      await window.electronAPI.sendDataAsync(OpCode.CONNECT_TO_REMOTE_OP, payload.host, `${payload.port}`)
    },
    async requestRemoteGame({ commit, state }, payload: { chessType: Chess }) {
      if (state.remote.is_connected) {
        const chess = payload.chessType === Chess.Black ? 'b' : 'w'
        await window.electronAPI.sendDataAsync(OpCode.READY_OP, state.config.onlineUsername, chess)
        commit('requestRemoteGame', payload)
      }
    },
    receiveReady({ commit, state }, payload: { data1: string, data2: string | undefined }) {
      const { data1, data2 } = payload
      if (state.remote.is_connected && state.remote.is_requesting) {
        commit('receiveAccept')
      } else {
        Alert({
          title: `玩家 ${data1} 申请执${data2 === 'b' ? '黑' : '白'}棋与你进行对局`,
          content: '是否同意？',
          positiveButtonText: '同意',
          negativeButtonText: '拒绝',
          onConfirm: () => {
            const myChess = data2 === 'b' ? 'w' : 'b'
            window.electronAPI.sendDataAsync(OpCode.READY_OP, state.config.onlineUsername, myChess)
              .then(() => {
                commit('acceptRequest')
              })
          },
          onClose: () => {
            window.electronAPI.sendData(OpCode.REJECT_OP)
          }
        })
      }
    },
    receiveReject({ commit, dispatch, state }) {
      if (state.remote.is_connected && state.remote.is_requesting) {
        commit('receiveReject')
        Alert({
          title: '对方拒绝了你的对局申请',
          content: '你可以再次申请对局或断开连接',
          positiveButtonText: '再次申请',
          negativeButtonText: '断开连接',
          onConfirm: () => {
            dispatch('requestRemoteGame', { username: state.config.onlineUsername, chessType: state.remote.requesting_chess })
          },
          onClose: () => {
            dispatch('leaveOnlineGame')
          }
        })
      }
    },
    async leaveOnlineGame({ commit, state }) {
      if (state.remote.is_connected) {
        await window.electronAPI.sendDataAsync(OpCode.LEAVE_OP)
      }
      commit('leaveOnlineGame')
    },
    receiveLeave({ commit }) {
      commit('leaveOnlineGame')
    },
    async sendChatMessage({ commit }, payload: { target: string, message: string }) {
      await window.electronAPI.sendDataAsync(OpCode.CHAT_SEND_MESSAGE_OP, payload.message, payload.target)
      commit('sendChatMessage', payload)
    }
  },
  modules: {
  }
})

export function useStore() {
  return baseUseStore(key)
}
