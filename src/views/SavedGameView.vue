<template>
  <div class="game-view">
    <TitleBar title="对局回放" @back="router.back" />
    <div class="saved-games-list">
      <template v-if="savedGames.length">
        <div class="saved-game" v-for="game in savedGames" :key="game.id"
          @click="router.push({ name: 'replay', params: { id: game.id } })">
          <div class="saved-game-name">{{ game.name }}</div>
          <div class="saved-game-time">{{ formatDateTime(game.timestamp) }}</div>
          <div class="saved-game-actions">
            <button class="saved-game-action-btn game-action-btn fill" @click.stop="exportGame(game)">导出</button>
            <button class="saved-game-action-btn game-action-btn fill" @click.stop="deleteGame(game)">删除</button>
          </div>
        </div>
      </template>
      <template v-else>
        <div class="no-saved-game">暂无保存的对局</div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import TitleBar from '@/components/TitleBar.vue'
import { Alert } from '@/components/alert/alert'
import { SavedGame } from '@/types'
import dayjs from 'dayjs'
import { Ref, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const savedGames: Ref<Array<SavedGame>> = ref([])

const formatDateTime = (timestamp: number) => dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss')

const exportGame = (game: SavedGame) => {
  navigator.clipboard.writeText(game.encoded).then(() => {
    Alert({
      title: '导出成功',
      content: '已将对局记录复制到剪贴板',
      timeout: 2000
    })
  }).catch(err => {
    Alert({
      title: '导出失败',
      content: '复制对局记录到剪贴板时出错：' + err.message,
      timeout: 2000
    })
  })
}

const deleteGame = (game: SavedGame) => {
  window.electronAPI.deleteSavedGame(game.id)
  savedGames.value = savedGames.value.filter(g => g.id !== game.id)
}

onMounted(async () => {
  savedGames.value = await window.electronAPI.getSavedGames()
})
</script>

<style scoped lang="scss">
.saved-games-list {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding: 16px 0;

  .saved-game {
    padding: 16px;
    border-radius: 8px;
    background-color: rgba($color: #fff, $alpha: 0.35);
    cursor: pointer;
    transition: all .2s ease-in-out;

    &:hover {
      background-color: rgba($color: #fff, $alpha: 0.5);
    }

    &:active {
      background-color: rgba($color: #fff, $alpha: 0.65);
      transform: scale(0.98);
    }

    &+.saved-game {
      margin-top: 16px;
    }

    .saved-game-name {
      font-size: 20px;
      font-weight: bold;
      color: #000;
    }

    .saved-game-time {
      font-size: 14px;
      color: #666;
    }

    .saved-game-actions {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: flex-end;
      margin-top: 8px;

      .saved-game-action-btn {
        margin-left: 8px;
      }
    }
  }
}
</style>
