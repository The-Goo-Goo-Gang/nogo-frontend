import { BackgroundMusicType } from '@/const'
import { useStore } from '@/store'
import { ref, watch } from 'vue'

type NoGoConfigBooleanKey = 'bgm'
type NoGoConfigNumberKey = 'bgmVolume' | 'bgmType' | 'onlineTimeout'
type NoGoConfigStringKey = 'bgmSongsId' | 'bgmFilePath' | 'onlineUsername'

export interface NoGoConfig {
  bgm: boolean,
  bgmVolume: number,
  bgmType: BackgroundMusicType,
  bgmSongsId: string,
  bgmFilePath: string,
  onlineUsername: string,
  onlineTimeout: number
}

export interface NoGoConfigDiff {
  bgm?: boolean,
  bgmVolume?: number,
  bgmType?: BackgroundMusicType,
  bgmSongsId?: string,
  bgmFilePath?: string,
  onlineUsername?: string,
  onlineTimeout?: number
}

export const DEFAULT_CONFIG: NoGoConfig = {
  bgm: true,
  bgmVolume: 1,
  bgmType: 0,
  bgmSongsId: '1975987793',
  bgmFilePath: '',
  onlineUsername: 'Player',
  onlineTimeout: 30
}

const initConfig = () => {
  window.localStorage.setItem('config', JSON.stringify(DEFAULT_CONFIG))
}

export const getConfigFromLocalStorage = (): NoGoConfig => {
  const config = window.localStorage.getItem('config')
  if (!config) {
    initConfig()
    return DEFAULT_CONFIG
  }
  return {
    ...DEFAULT_CONFIG,
    ...JSON.parse(config)
  }
}

export const useNumberConfig = (key: NoGoConfigNumberKey) => {
  const store = useStore()
  const value = ref(store.state.config[key])
  const updateValue = (newValue: number) => {
    store.dispatch('updateConfig', { [key]: newValue })
  }
  watch(value, (newValue) => {
    updateValue(+newValue)
  })
  return { value, updateValue }
}

export const useBooleanConfig = (key: NoGoConfigBooleanKey) => {
  const store = useStore()
  const value = ref(store.state.config[key])
  const updateValue = (newValue: boolean) => {
    store.dispatch('updateConfig', { [key]: newValue })
  }
  watch(value, (newValue) => {
    updateValue(Boolean(newValue))
  })
  return [value, updateValue]
}

export const useStringConfig = (key: NoGoConfigStringKey) => {
  const store = useStore()
  const value = ref(store.state.config[key])
  const updateValue = (newValue: string) => {
    store.dispatch('updateConfig', { [key]: newValue })
  }
  watch(value, (newValue) => {
    updateValue(newValue)
  })
  return { value, updateValue }
}
