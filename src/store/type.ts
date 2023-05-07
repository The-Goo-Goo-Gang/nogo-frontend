import { NoGoConfig } from '@/config'
import { UiState, TimerState, RemoteConnectState } from '@/state'

export interface GlobalState {
  uiState: UiState,
  timer: TimerState,
  config: NoGoConfig,
  remote: RemoteConnectState
}
