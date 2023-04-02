export enum PlayerType {
  LocalHumanPlayer = 0,
  OnlineHumanPlayer,
  BotPlayer
}

export enum GameStatus {
  NOT_PREPARED,
  ON_GOING,
  GAME_OVER
}

export enum WinType {
  NONE,
  TIMEOUT,
  SUICIDE,
  GIVEUP
}

export enum Chess {
  None = 0,
  Black = 1,
  White = -1
}

export enum LocalGameType {
  PVP = 0,
  PVE
}

export enum OpCode {
  READY_OP = 200000,
  REJECT_OP,
  MOVE_OP,
  GIVEUP_OP,
  TIMEOUT_END_OP,
  SUICIDE_END_OP,
  GIVEUP_END_OP,
  LEAVE_OP,
  CHAT_OP,
  START_LOCAL_GAME_OP = 100000,
  UPDATE_UI_STATE_OP,
  LOCAL_GAME_TIMEOUT_OP
}
