import { Chess, GameStatus, PlayerType, RemoteGameRequestResult, WinType } from './const'

export interface Player {
  name: string,
  avatar?: string,
  type: PlayerType,
  chess_type: Chess
}

export interface Position {
  x: number,
  y: number
}

export interface GameMetadata {
  size: 9 | 11 | 13,
  player_opposing: Player,
  player_our: Player,
  timeout: number
}

export interface DynamicStatistics {
  id: string,
  name: string,
  value: string
}

export interface GameState {
  chessboard: Array<Array<Chess>>,
  now_playing: Chess,
  move_count: number,
  disabled_positions: Array<Position>,
  last_move?: Position,
  metadata: GameMetadata,
  statistics: Array<DynamicStatistics>,
  start_time: number,
  end_time: number,
  encoded: string,
  is_replaying: boolean
}

export interface TimerState {
  running: boolean,
  current_timestamp: number,
  start_timestamp: number,
  end_timestamp: number,
  timer_interval: number | null,
  timer_timeout: number | null
}

export interface GameResult {
  winner: Chess,
  win_type: WinType
}

export interface UiState {
  is_gaming: boolean,
  status: GameStatus,
  game?: GameState,
  game_result: GameResult
}

export class RemoteGameRequest {
  static counter = 0

  id: number
  username: string
  sendTo?: string
  chess: Chess
  timestamp: number
  result: RemoteGameRequestResult

  constructor(username: string, chess: Chess, sendTo?: string, timestamp: number = Date.now(), result: RemoteGameRequestResult = RemoteGameRequestResult.WAITING) {
    this.id = RemoteGameRequest.counter++
    this.username = username
    this.sendTo = sendTo
    this.chess = chess
    this.timestamp = timestamp
    this.result = result
  }
}

export interface RemoteConnectState {
  is_connected: boolean,
  is_connecting: boolean,
  is_connecting_failed: boolean,
  failed_message?: string,
  remote_ip?: string,
  remote_port?: number,
  connected_username: string,
  my_request?: RemoteGameRequest | null,
  received_requests: Array<RemoteGameRequest>
}

export interface ChatMessage {
  sender: string,
  content: string,
  timestamp: number
}

export interface SavedGame {
  id: string,
  name: string,
  timestamp: number,
  encoded: string,
}
