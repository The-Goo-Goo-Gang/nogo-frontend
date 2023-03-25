export enum PlayerType {
  LocalHumanPlayer = 0,
  OnlineHumanPlayer,
  BotPlayer
}

export enum Chess {
  None = 0,
  Black,
  White
}

export enum OpCode {
  PING_OP = 1,
  READY_OP = 200000,
  REJECT_OP,
  MOVE_OP,
  GIVEUP_OP,
  TIMEOUT_END_OP,
  SUICIDE_END_OP,
  GIVEUP_END_OP,
  LEAVE_OP,
  CHAT_OP,
  START_LOCAL_GAME_OP,
  UPDATE_UI_STATE_OP
}
