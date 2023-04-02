import { contextBridge, ipcRenderer } from 'electron'
import { OpCode } from './const'
import { NetworkData } from './network/data'

contextBridge.exposeInMainWorld('electronAPI', {
  onData: (listener: (opCode: number, data1: string | undefined, data2: string | undefined) => void) => {
    ipcRenderer.on('data', (_, data: NetworkData) => {
      listener(data.op, data.data1, data.data2)
    })
  },
  send: (channel: string, ...args: any[]) => {
    ipcRenderer.send(channel, ...args)
  },
  sendData: (opCode: OpCode, data1: string | undefined, data2: string | undefined) => {
    ipcRenderer.send('sendData', opCode, data1 || '', data2 || '')
  },
  exit: () => {
    ipcRenderer.send('exit')
  }
})
