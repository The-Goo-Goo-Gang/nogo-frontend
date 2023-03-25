import { OpCode } from '@/const'

declare interface ElectronAPI {
  onData: (listener: (opCode: OpCode, data1: string | null, data2: string | null) => void) => void,
  send: (channel: string, ...args: any[]) => void,
  exit: () => void
}

declare global {
  interface Window { electronAPI: ElectronAPI }
}

window.electronAPI = window.electronAPI || {}
