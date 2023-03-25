import { contextBridge, ipcRenderer } from 'electron'
import { NetworkData } from './network/data'

contextBridge.exposeInMainWorld('electronAPI', {
  onData: (listener: (opCode: number, data1: string | null, data2: string | null) => void) => {
    ipcRenderer.on('data', (_, data: NetworkData) => {
      listener(data.op, data.data1, data.data2)
    })
  },
  send: (channel: string, ...args: any[]) => {
    ipcRenderer.send(channel, ...args)
  },
  exit: () => {
    ipcRenderer.send('exit')
  }
})
