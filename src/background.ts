/* eslint-disable @typescript-eslint/no-var-requires */
'use strict'

import { app, protocol, BrowserWindow, ipcMain } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS3_DEVTOOLS } from 'electron-devtools-installer'
import { ChildProcess, spawn } from 'child_process'
import { Socket } from 'net'
import path from 'path'
import { Stick } from './stick'
import { NetworkData } from './network/data'
import { OpCode } from './const'

const isDevelopment = process.env.NODE_ENV !== 'production'

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])

async function createWindow () {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 1280,
    height: 720,
    webPreferences: {
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    title: 'NoGo 不围棋',
    titleBarStyle: 'hidden',
    frame: false
  })

  ipcMain.on('exit', e => {
    const webContents = e.sender
    const window = BrowserWindow.fromWebContents(webContents)
    if (window) window.close()
  })

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL as string)
    if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    win.loadURL('app://./index.html')
  }

  return win
}

let serverProcess: ChildProcess | null = null
const runExec = (cmdStr: string, cmdPath: string, onSuccess: () => void) => {
  serverProcess = spawn(cmdStr, { cwd: cmdPath })

  if (serverProcess != null) {
    // 启动成功的输出
    if (serverProcess.stdout != null) {
      serverProcess.stdout.on('data', function (data: string) {
        console.log('启动服务器成功！ stdout:' + data)
        onSuccess()
      })
    }
    // 发生错误的输出
    if (serverProcess.stderr != null) {
      serverProcess.stderr.on('data', function (data: string) {
        console.log('stderr:' + data)
      })
    }
    // 退出后的输出
    serverProcess.on('close', function (code: string) {
      console.log('out code:' + code)
    })
  }
}
function startServer () {
  const cmdStr = 'server.exe'
  const cmdPath = './server'
  const promise = new Promise<boolean>((resolve, reject) => {
    runExec(cmdStr, cmdPath, () => resolve(true))
  })
  return promise
}

let client: Socket | null = null
const stick = new Stick()
function connectToBackend () {
  client = new Socket()
  client.connect(5000, '127.0.0.1', () => {
    console.log('connect success')
    if (client) {
      client.on('data', (data: Buffer) => {
        stick.pushData(data.toLocaleString())
      })
    }
    // client.destroy()
  })
  stick.onData(data => {
    console.log(data)
    try {
      const parsedData: NetworkData = JSON.parse(data)
      if (parsedData.op) {
        console.log(parsedData)
        BrowserWindow.getAllWindows().forEach(window => {
          window.webContents.send('data', parsedData)
        })
      }
    } catch (e) { }
  })
}

function disconnectFromBackend () {
  if (client) {
    client.destroy()
    client = null
  }
}

function stopServer () {
  if (serverProcess != null) {
    serverProcess.kill('SIGINT')
  }
}

app.on('quit', () => {
  disconnectFromBackend()
  stopServer()
})

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS3_DEVTOOLS)
    } catch (e) {
      console.error('Vue Devtools failed to install:', e)
    }
  }
  startServer()
  setTimeout(() => {
    connectToBackend()
    createWindow()
  }, 500)
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}