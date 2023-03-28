import { OpCode } from '@/const'

declare interface ElectronAPI {
  onData: (listener: (opCode: OpCode, data1: string | undefined, data2: string | undefined) => void) => void,
  sendData: (opCode: OpCode, data1?: string | undefined, data2?: string | undefined) => void,
  send: (channel: string, ...args: any[]) => void,
  exit: () => void
}

declare global {
  interface Window { electronAPI: ElectronAPI }
}

window.electronAPI = window.electronAPI || {}
