import { NoGoConfig } from '@/config'
import { UiState, TimerState, RemoteConnectState, ChatMessage } from '@/state'

export interface GlobalState {
  uiState: UiState,
  timer: TimerState,
  config: NoGoConfig,
  remote: RemoteConnectState,
  chat_messages: Map<string, Array<ChatMessage>>
}
