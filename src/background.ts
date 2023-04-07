/* eslint-disable @typescript-eslint/no-var-requires */
'use strict'

import { app, protocol, BrowserWindow, ipcMain } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS3_DEVTOOLS } from 'electron-devtools-installer'
import { ChildProcess, spawn } from 'child_process'
import { Socket } from 'net'
import path from 'path'
import fs from 'fs'
import { Stick } from './stick'
import { NetworkData } from './network/data'
import { OpCode } from './const'
import { changeFileName } from './utils/file'
import { getPortPromise } from 'portfinder'

const isDevelopment = process.env.NODE_ENV !== 'production'

const log = (...args: any[]) => {
  console.log(...args)
  BrowserWindow.getAllWindows().forEach(window => {
    window.webContents.send('log', ...args)
  })
}

app.setPath('userData', path.join(app.getPath('appData'), 'NoGo'))
app.setPath('sessionData', path.join(app.getPath('userData'), 'Session Data'))

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
    frame: false,
    icon: './public/favicon.ico'
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
const runExec = (cmdStr: string, cmdPath: string, args: Array<string> = [], onSuccess: () => void) => {
  serverProcess = spawn(cmdStr, args, { cwd: cmdPath })

  if (serverProcess != null) {
    // 启动成功的输出
    if (serverProcess.stdout != null) {
      log('launch server success')
      onSuccess()
      serverProcess.stdout.on('data', function (data: string) {
        log('stdout: ' + data)
      })
    }
    // 发生错误的输出
    if (serverProcess.stderr != null) {
      serverProcess.stderr.on('data', function (data: string) {
        log('stderr: ' + data)
      })
    }
    // 退出后的输出
    serverProcess.on('close', function (code: string) {
      log('out code: ' + code)
    })
  }
}
function startServer (port = 5000) {
  const cmdStr = './nogo-server'
  const cmdPath = './server'
  const promise = new Promise<boolean>(resolve => {
    runExec(cmdStr, cmdPath, [`${port}`], () => resolve(true))
  })
  return promise
}

let client: Socket | null = null
const stick = new Stick()
function connectToBackend (onSuccess: () => void, port = 5000, ipAddress = '127.0.0.1') {
  client = new Socket()
  client.connect(port, ipAddress, () => {
    if (client) {
      log('connect success')
      onSuccess()
      client.on('data', (data: Buffer) => {
        const str = data.toLocaleString()
        // log('onData raw', str)
        stick.pushData(str)
      })
    }
    // client.destroy()
  })
  stick.onData(data => {
    log('onData', data)
    try {
      const parsedData: NetworkData = JSON.parse(data)
      if (parsedData.op) {
        BrowserWindow.getAllWindows().forEach(window => {
          window.webContents.send('data', parsedData)
        })
      }
    } catch (e) { }
  })
}

function disconnectFromBackend () {
  if (client) {
    client.end()
    client.destroy()
    client = null
  }
}

function stopServer () {
  if (serverProcess != null) {
    serverProcess.kill('SIGINT')
  }
}

app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required')

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
app.whenReady().then(async () => {
  protocol.registerFileProtocol('nogo', (request, callback) => {
    const url = request.url.substring(7)
    callback(path.join(app.getPath('userData'), decodeURI(path.normalize(url))))
  })

  ipcMain.on('exit', e => {
    const webContents = e.sender
    const window = BrowserWindow.fromWebContents(webContents)
    if (window) window.close()
  })
  ipcMain.on('minimize', e => {
    const webContents = e.sender
    const window = BrowserWindow.fromWebContents(webContents)
    if (window) window.minimize()
  })
  ipcMain.on('setBgmFile', (e, filePaths: Array<string>) => {
    const backgroundMusicFolder = path.join(app.getPath('userData'), 'background-music')
    if (!fs.existsSync(backgroundMusicFolder)) {
      fs.mkdirSync(backgroundMusicFolder)
    }
    filePaths.forEach((filePath, index) => {
      const fileName = changeFileName(path.basename(filePath), `${index}`)
      fs.copyFile(filePath, path.join(backgroundMusicFolder, fileName), (err) => {
        if (err) {
          log('copy file error', err)
          return
        }
        log('copy file success')
      })
    })
    e.sender.send('setBgmFile', filePaths.map((filePath, index) => encodeURI(`nogo://background-music/${changeFileName(path.basename(filePath), `${index}`)}`)))
  })
  ipcMain.on('sendData', (e, opCode: OpCode, data1: string | undefined, data2: string | undefined) => {
    const data = JSON.stringify(new NetworkData(opCode, data1, data2)) + '\n'
    if (client) {
      log('sendData', data)
      client.write(data)
    }
  })

  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension('nhdogjmejiglipccpnnnanhbledajbpd')
    } catch (e) {
      console.error('Vue Devtools failed to install:', e)
    }
  }
  const port = await getPortPromise({ port: 5000 })
  log('start server at port', port)
  await startServer(port)
  setTimeout(() => {
    connectToBackend(() => {
      createWindow()
    }, port)
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
