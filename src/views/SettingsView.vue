<template>
  <div class="game-settings game-view">
    <TitleBar title="设置" @back="back" />
    <div class="game-view-form">
      <!-- 背景音乐 -->
      <div class="game-view-item">
        <div class="game-view-item-title">背景音乐</div>
        <div class="game-view-item-content">
          <div class="game-view-item-content-form">
            <label class="game-view-item-content-form-label">
              <input type="radio" name="bgm" :value="true" v-model="playBgm" />
              开启
            </label>
          </div>
          <div class="game-view-item-content-form">
            <label class="game-view-item-content-form-label">
              <input type="radio" name="bgm" :value="false" v-model="playBgm" />
              关闭
            </label>
          </div>
        </div>
      </div>
      <div class="game-view-item" v-if="playBgm">
        <div class="game-view-item-title">背景音乐音量</div>
        <div class="game-view-item-content full-width">
          <div class="game-view-item-content-form">
            <label class="game-view-item-content-form-label">
              <input type="range" name="bgmVolume" :min="0" :max="1" :step="0.01" v-model="bgmVolume" />
              <span class="volume-value">{{ Math.floor(bgmVolume * 100) }}</span>
            </label>
          </div>
        </div>
      </div>
      <div class="game-view-item" v-if="playBgm">
        <div class="game-view-item-title">背景音乐来源</div>
        <div class="game-view-item-content">
          <div class="game-view-item-content-form">
            <label class="game-view-item-content-form-label">
              <input type="radio" name="bgmType" :value="BackgroundMusicType.LOCAL" v-model="bgmType" />
              本地
            </label>
          </div>
          <div class="game-view-item-content-form">
            <label class="game-view-item-content-form-label">
              <input type="radio" name="bgmType" :value="BackgroundMusicType.NETEASE" v-model="bgmType" />
              网易云
            </label>
          </div>
        </div>
      </div>
      <div class="game-view-item" v-if="playBgm && bgmType === BackgroundMusicType.LOCAL">
        <div class="game-view-item-title">本地音乐文件</div>
        <div class="game-view-item-content full-width">
          <FileSelector class="game-view-item-content-form" v-model:file="file" accept="audio/*" :multiple="true" />
        </div>
      </div>
      <div class="game-view-item" v-else-if="playBgm && bgmType === BackgroundMusicType.NETEASE">
        <div class="game-view-item-title">网易云音乐 ID（多首歌曲用,分割）</div>
        <div class="game-view-item-content full-width">
          <div class="game-view-item-content-form">
            <label class="game-view-item-content-form-label">
              <input type="text" name="bgmSongsId" v-model="bgmSongsId" />
            </label>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import TitleBar from '@/components/TitleBar.vue'
import FileSelector from '@/components/FileSelector.vue'
import { useBooleanConfig, useNumberConfig, useStringConfig } from '@/config'
import { BackgroundMusicType } from '@/const'
import { useQuickRouter } from '@/router/quick'
import { Ref, ref, watch } from 'vue'

const file: Ref<Array<File>> = ref([])
const { back } = useQuickRouter()
const [playBgm] = useBooleanConfig('bgm')
const { value: bgmVolume } = useNumberConfig('bgmVolume')
const { value: bgmType } = useNumberConfig('bgmType')
const { value: bgmSongsId } = useStringConfig('bgmSongsId')

watch(file, (newVal) => {
  console.log(newVal)
  if (newVal && newVal.length > 0) {
    window.electronAPI.setBgmFile(newVal.map((f) => f.path))
  }
})
</script>

<style>
.volume-value {
  width: 3ch;
  text-align: end;
}
</style>
