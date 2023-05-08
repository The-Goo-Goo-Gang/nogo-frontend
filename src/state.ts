import { Chess, GameStatus, PlayerType, WinType } from './const'

export interface Player {
  name: string,
  avatar?: string,
  type: PlayerType,
  chess_type: Chess
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
  metadata: GameMetadata,
  statistics: Array<DynamicStatistics>
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

export interface RemoteConnectState {
  is_connected: boolean,
  is_connecting: boolean,
  is_connecting_failed: boolean,
  failed_message?: string,
  remote_ip?: string,
  remote_port?: number,
  is_requesting: boolean,
  requesting_chess: Chess
}

export interface ChatMessage {
  sender: string,
  content: string,
  timestamp: number
}
