<template>
  <div class="player" :style="computedStyle">
    <div class="player-song-info">
      <div class="player-song-title">{{ nowPlaying.name }}</div>
      <div class="player-song-artist" v-if="nowPlaying.artist">{{ nowPlaying.artist }}</div>
      <div class="player-song-progress">
        <span class="player-song-progress-text">
          <span>{{ currentTimeFormated }}</span>
          <span>/</span>
          <span>{{ durationFormated }}</span>
        </span>
      </div>
    </div>
    <div class="player-controllers">
      <button class="player-controller-btn" @click="prev">
        <SkipPreviousIcon />
      </button>
      <button class="player-controller-btn toggle-play-btn" @click="togglePlay" :loading="isLoading ? true : null">
        <ProgressCircular v-if="isLoading" />
        <PauseIcon v-else-if="isPlaying" />
        <PlayIcon v-else />
      </button>
      <button class="player-controller-btn" @click="next">
        <SkipNextIcon />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import SkipNextIcon from 'vue-material-design-icons/SkipNext.vue'
import SkipPreviousIcon from 'vue-material-design-icons/SkipPrevious.vue'
import PauseIcon from 'vue-material-design-icons/Pause.vue'
import PlayIcon from 'vue-material-design-icons/Play.vue'
import ProgressCircular from '@/components/ProgressCircular.vue'
import { ref, computed, onMounted, watch, onUnmounted } from 'vue'
import { SongData } from './data'

const props = withDefaults(defineProps<{
  songs: Array<SongData>,
  volume?: number,
  autoplay?: boolean,
  backgroundColor?: string
}>(), {
  volume: 1,
  autoplay: false,
  backgroundColor: '#fff'
})

const audio = new Audio()

const computedStyle = computed(() => {
  return {
    '--player-background-color': props.backgroundColor
  }
})

const currentIndex = ref(0)
const currentTime = ref(0)
const duration = ref(0)
const isPlaying = ref(false)
const isLoading = ref(false)
const loadProgress = ref(0)

const playListLength = computed(() => props.songs.length)
const currentTimeFormated = computed(() => {
  const minutes = Math.floor(currentTime.value / 60)
  const seconds = Math.floor(currentTime.value % 60)
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
})
const durationFormated = computed(() => {
  const minutes = Math.floor(duration.value / 60)
  const seconds = Math.floor(duration.value % 60)
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
})

const playUrl = (url: string) => {
  if (!audio.paused) {
    audio.pause()
    audio.currentTime = 0
  }
  if (audio.src !== url) {
    audio.src = url
  }
  audio.play()
}

const playSong = (index: number) => {
  stop()
  if (currentIndex.value !== index) currentIndex.value = index
  else playUrl(props.songs[index].src)
}

const play = () => {
  if (!audio.src) playUrl(nowPlaying.value.src)
  else if (audio.paused) audio.play()
}

const pause = () => {
  if (!audio.paused) audio.pause()
}

const togglePlay = () => {
  if (isPlaying.value) pause()
  else play()
}

const stop = () => {
  if (!audio.paused) audio.pause()
  audio.currentTime = 0
}

const next = () => {
  if (playListLength.value === 1) {
    playSong(0)
  }
  currentIndex.value = (currentIndex.value + 1) % props.songs.length
}

const prev = () => {
  if (playListLength.value === 1) {
    playSong(0)
  }
  currentIndex.value = (currentIndex.value - 1 + props.songs.length) % props.songs.length
}

const startFromFirst = () => {
  playSong(0)
}

const nowPlaying = computed(() => props.songs[currentIndex.value])

const onEnded = () => {
  next()
}
const onPlay = () => {
  isPlaying.value = true
}
const onPause = () => {
  isPlaying.value = false
}
const onTimeUpdate = () => {
  currentTime.value = audio.currentTime
}
const onDurationChange = () => {
  duration.value = audio.duration
}
const onCanplay = () => {
  isLoading.value = false
}
const onWaiting = () => {
  isLoading.value = true
}
const onError = () => {
  isLoading.value = false
}
const onProgress = () => {
  if (audio.buffered.length > 0) {
    loadProgress.value = audio.buffered.end(audio.buffered.length - 1) / audio.duration
  }
}

onMounted(() => {
  audio.volume = props.volume
  audio.addEventListener('ended', onEnded)
  audio.addEventListener('play', onPlay)
  audio.addEventListener('pause', onPause)
  audio.addEventListener('timeupdate', onTimeUpdate)
  audio.addEventListener('durationchange', onDurationChange)
  audio.addEventListener('canplay', onCanplay)
  audio.addEventListener('canplaythrough', onCanplay)
  audio.addEventListener('waiting', onWaiting)
  audio.addEventListener('error', onError)
  audio.addEventListener('progress', onProgress)
  if (props.autoplay) startFromFirst()
})

onUnmounted(() => {
  audio.removeEventListener('ended', onEnded)
  audio.removeEventListener('play', onPlay)
  audio.removeEventListener('pause', onPause)
  audio.removeEventListener('timeupdate', onTimeUpdate)
  audio.removeEventListener('durationchange', onDurationChange)
  audio.removeEventListener('canplay', onCanplay)
  audio.removeEventListener('canplaythrough', onCanplay)
  audio.removeEventListener('waiting', onWaiting)
  audio.removeEventListener('error', onError)
  audio.removeEventListener('progress', onProgress)
  stop()
})

watch(() => props.volume, (volume) => {
  audio.volume = volume
})

watch(() => props.songs, (songs) => {
  if (songs.length > 0) {
    playUrl(songs[0].src)
  }
})

watch(() => nowPlaying.value, (song) => {
  if (song) {
    playUrl(song.src)
  }
})

defineExpose({
  playSong,
  play,
  pause,
  next,
  prev,
  nowPlaying,
  isPlaying,
  currentIndex
})
</script>

<script lang="ts">
</script>

<style lang="scss">
.player-controllers {
  display: inline-flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 16px;
}

.player {
  position: relative;
  display: inline-block;
  padding: 16px;
  background-color: var(--player-background-color);
  border-radius: 8px;
}

.player-controller-btn {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: #fff;
  border: 1px solid #ccc;
  cursor: pointer;
  transition: all 0.2s ease;

  .material-design-icon__svg {
    bottom: 0!important;
  }

  &:hover {
    background-color: #eee;
  }

  &:active {
    background-color: #ddd;
    transform: scale(0.9);
  }

  &:disabled {
    cursor: not-allowed;
    background-color: #ccc;
  }
}

.player-song-info {
  margin: 0 0 16px 0;
  text-align: center;
}

.player-song-title {
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0 0 4px 0;
}

.player-song-artist {
  font-size: 0.85rem;
  font-weight: 400;
  margin: 0;
}

.player-song-progress-text {
  font-size: 0.75rem;
  font-weight: 400;
}
</style>
