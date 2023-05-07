import { app } from 'electron'
import path from 'path'
import fs from 'fs'

export const CONFIG_PATH = path.join(app.getPath('userData'), 'Config')
export const CONFIG_FILE_PATH = path.join(CONFIG_PATH, 'config.json')

export interface Config {
  port: number
}

export interface ConfigDiff {
  port?: number
}

export const DEFAULT_CONFIG: Config = {
  port: 6000
}

export const initConfig = () => {
  if (!fs.existsSync(CONFIG_PATH)) fs.mkdirSync(CONFIG_PATH)
  if (!fs.existsSync(CONFIG_FILE_PATH)) {
    fs.writeFileSync(CONFIG_FILE_PATH, JSON.stringify(DEFAULT_CONFIG))
  }
}

export const getConfig: () => Config = () => {
  initConfig()
  return { DEFAULT_CONFIG, ...JSON.parse(fs.readFileSync(CONFIG_FILE_PATH).toString()) }
}

export const saveConfig = (newConfig: Config) => {
  initConfig()
  fs.writeFileSync(CONFIG_FILE_PATH, JSON.stringify(newConfig))
}

export const setConfig = (newConfig: ConfigDiff) => {
  initConfig()
  const config = getConfig()
  saveConfig({ ...config, ...newConfig })
}
