import { NoGoConfig } from '@/config'
import { UiState, TimerState } from '@/state'

export interface GlobalState {
  uiState: UiState,
  timer: TimerState,
  config: NoGoConfig
}
