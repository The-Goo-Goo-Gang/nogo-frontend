## START_LOCAL_GAME_OP

开始一局本地对战

`data1`: 游戏类型（0 = PVP，1 = PVE）

`data2`: 棋盘大小（9/11/13，若为空则默认大小为 9）

## UPDATE_UI_STATE_OP

（仅后端向前端发送）更新当前游戏状态

`data1`: 时间戳

`data2`: 游戏状态 JSON

### 游戏状态 JSON

#### UiState
`is_gaming`: `Boolean` 是否正在游戏中

`status`: `GameStatus` 当前游戏状态

`game`: `Game|null` 当前正在进行的游戏状态。若不在游戏中，为 `null`

`game_result`: `GameResult|null` 游戏结果

#### `Enum` GameStatus
`NOT_PREPARED`, `ON_GOING`, `GAME_OVER`

#### GameResult
`winner`: `Chess` 执哪种棋的一方获胜

`win_type`: `WinType` 获胜原因

#### `Enum` WinType
`NONE = 0` 未获胜

`TIMEOUT` 超时

`SUICIDE` 自杀

`GIVEUP` 认输

#### Game
`chessboard`: `Array<Array<Chess>>` 当前的棋盘状态（第一维是行，第二维是列）

`is_our_player_playing`: `Boolean` 是否为我方玩家正在下棋

`metadata`: `GameMetadata` 当前游戏信息

`statistics`: `Array<DynamicStatistics>` 要显示的统计数据

#### GameMetadata
`size`: `Int` 棋盘大小（9/11/13）

`player_opposing`: `Player` 对方玩家信息

`player_our`: `Player` 我方玩家信息

`turn_timeout`: `Int` 限时

#### Player
`name`: `String` 玩家名称

`avatar`: `String|null` 玩家头像（如果没有，为 `null`）

`type`: `PlayerType` 玩家类型

`chess_type`: `Int` 玩家执黑/白（黑 = 1，白 = -1）

#### `Enum` PlayerType
`LocalHumanPlayer` = 0

`OnlineHumanPlayer` = 1

`BotPlayer` = 2


#### DynamicStatistics
`id`: `String` ID

`name`: `String` 数据名称

`value`: `String` 值