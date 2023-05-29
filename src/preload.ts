import { contextBridge, ipcRenderer } from 'electron'
import { OpCode } from './const'
import { NetworkData } from './network/data'
import { SavedGame } from './state'

const dataListeners: Array<(event: Electron.IpcRendererEvent, data: NetworkData) => void> = []

contextBridge.exposeInMainWorld('electronAPI', {
  onData: (listener: (opCode: number, data1: string | undefined, data2: string | undefined) => void) => {
    const dataListener = (_: Electron.IpcRendererEvent, data: NetworkData) => {
      listener(data.op, data.data1, data.data2)
    }
    const listenerId = dataListeners.length
    dataListeners.push(dataListener)
    ipcRenderer.on('data', dataListener)
    return listenerId
  },
  removeOnDataListener: (listenerId: number) => {
    ipcRenderer.removeListener('data', dataListeners[listenerId])
  },
  onReceiveOp: (opCode: number, listener: (data1: string | undefined, data2: string | undefined) => void) => {
    const dataListener = (_: Electron.IpcRendererEvent, data: NetworkData) => {
      if (data.op === opCode) {
        listener(data.data1, data.data2)
      }
    }
    const listenerId = dataListeners.length
    dataListeners.push(dataListener)
    ipcRenderer.on('data', dataListener)
    return listenerId
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  send: (channel: string, ...args: any[]) => {
    ipcRenderer.send(channel, ...args)
  },
  sendData: (opCode: OpCode, data1: string | undefined, data2: string | undefined) => {
    ipcRenderer.send('sendData', opCode, data1 || '', data2 || '')
  },
  sendDataAsync: (opCode: OpCode, data1: string | undefined, data2: string | undefined) => {
    return ipcRenderer.invoke('net:sendData', opCode, data1 || '', data2 || '')
  },
  exit: () => {
    ipcRenderer.send('exit')
  },
  restart: () => {
    ipcRenderer.send('restart')
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onLog: (listener: (...args: any[]) => void) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ipcRenderer.on('log', (_, ...args: any[]) => {
      listener(...args)
    })
  },
  setBgmFile: (path: Array<string>) => {
    ipcRenderer.send('setBgmFile', path)
  },
  onSetBgmFile: (listener: (path: Array<string>) => void) => {
    ipcRenderer.on('setBgmFile', (_, path: Array<string>) => {
      listener(path)
    })
  },
  saveGame: (data: SavedGame) => {
    ipcRenderer.send('saveGame', data)
  },
  getSavedGames: () => ipcRenderer.invoke('getSavedGames'),
  deleteSavedGame: (id: string) => ipcRenderer.send('deleteSavedGame', id),
  getSavedGame: (id: string) => ipcRenderer.invoke('getSavedGame', id),
  getLocalIpAddresses: () => ipcRenderer.invoke('net:getLocalIpAddresses'),
  getOnlinePort: () => ipcRenderer.invoke('net:getOnlinePort'),
  setOnlinePort: (port: number) => ipcRenderer.send('net:setOnlinePort', port),
  getRealOnlinePort: () => ipcRenderer.invoke('net:getRealOnlinePort')
})
