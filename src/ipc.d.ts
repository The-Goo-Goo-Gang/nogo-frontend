import { OpCode } from '@/const'
import { SavedGame } from '@/state'

declare interface ElectronAPI {
  onData: (listener: (opCode: OpCode, data1: string | undefined, data2: string | undefined) => void) => number,
  removeOnDataListener: (listenerId: number) => void,
  onReceiveOp: (opCode: OpCode, listener: (data1: string | undefined, data2: string | undefined) => void) => number,
  sendData: (opCode: OpCode, data1?: string | undefined, data2?: string | undefined) => void,
  sendDataAsync: (opCode: OpCode, data1?: string | undefined, data2?: string | undefined) => Promise<void>,
  send: (channel: string, ...args: any[]) => void,
  exit: () => void,
  restart: () => void,
  onLog: (...args: any[]) => void,
  setBgmFile: (path: Array<string>) => void,
  onSetBgmFile: (listener: (path: Array<string>) => void) => void,
  saveGame: (data: SavedGame) => void,
  getSavedGames: () => Promise<Array<SavedGame>>,
  deleteSavedGame: (id: string) => void,
  getSavedGame: (id: string) => Promise<SavedGame | null | undefined>,
  getLocalIpAddresses: () => Promise<Array<string>>,
  getOnlinePort: () => Promise<number>,
  setOnlinePort: (port: number) => void,
  getRealOnlinePort: () => Promise<number>,
}

declare global {
  interface Window { electronAPI: ElectronAPI }
}

window.electronAPI = window.electronAPI || {}
