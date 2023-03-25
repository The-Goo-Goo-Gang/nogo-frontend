import { Chess, PlayerType } from './const'

export interface Player {
  name: string,
  avatar?: string,
  type: PlayerType
}

export interface GameMetadata {
  size: 9 | 11 | 13,
  player_opposing: Player,
  player_our: Player,
  turn_timeout: number
}

export interface DynamicStatistics {
  id: string,
  name: string,
  value: string
}

export interface GameState {
  chess_board: Array<Array<Chess>>,
  metadata: GameMetadata,
  statistics: Array<DynamicStatistics>
}

export interface UiState {
  is_gaming: boolean,
  game?: GameState
}
