import { OpCode } from '@/const'

declare interface ElectronAPI {
  onData: (listener: (opCode: OpCode, data1: string | undefined, data2: string | undefined) => void) => number,
  removeOnDataListener: (listenerId: number) => void,
  onReceiveOp: (opCode: OpCode, listener: (data1: string | undefined, data2: string | undefined) => void) => number,
  sendData: (opCode: OpCode, data1?: string | undefined, data2?: string | undefined) => void,
  sendDataAsync: (opCode: OpCode, data1?: string | undefined, data2?: string | undefined) => Promise<void>,
  send: (channel: string, ...args: any[]) => void,
  exit: () => void,
  onLog: (...args: any[]) => void,
  setBgmFile: (path: Array<string>) => void,
  onSetBgmFile: (listener: (path: Array<string>) => void) => void,
  getLocalIpAddresses: () => Promise<Array<string>>,
  getOnlinePort: () => Promise<number>,
  setOnlinePort: (port: number) => void,
  getRealOnlinePort: () => Promise<number>,
}

declare global {
  interface Window { electronAPI: ElectronAPI }
}

window.electronAPI = window.electronAPI || {}
