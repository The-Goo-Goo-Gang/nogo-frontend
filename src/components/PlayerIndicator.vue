<template>
  <div class="player-indicator">
    <div class="player-indicator-content">
      <div class="player-indicator-avatar icon-2x">
        <AccountCircleIcon class="icon-2x" v-if="!player.avatar" />
        <img :src="player.avatar" v-else class="icon-2x" />
      </div>
      <div class="player-indicator-class">
        <Vue3Lottie class="player-indicator-hourglass" :animation-data="HourglassAnimJSON" height="1.5em" width="1.5em"
          v-if="isPlaying" />
        <AccountIcon class="player-indicator-type-icon" v-if="player.type == PlayerType.LocalHumanPlayer" />
        <NetworkIcon class="player-indicator-type-icon" v-else-if="player.type == PlayerType.OnlineHumanPlayer" />
        <RobotIcon class="player-indicator-type-icon" v-else-if="player.type == PlayerType.BotPlayer" />
        <span>{{ player.name }}</span>
      </div>
      <div class="player-indicator-chess-icon" :role="player.chess_type == Chess.Black ? 'black' : 'white'"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import AccountCircleIcon from 'vue-material-design-icons/AccountCircle.vue'
import AccountIcon from 'vue-material-design-icons/Account.vue'
import NetworkIcon from 'vue-material-design-icons/Network.vue'
import RobotIcon from 'vue-material-design-icons/Robot.vue'
import { Player } from '@/state'
import { defineProps } from 'vue'
import { Chess, PlayerType } from '@/const'
import HourglassAnimJSON from '@/assets/Hourglass_2.json'
import { Vue3Lottie } from 'vue3-lottie'

const props = withDefaults(defineProps<{
  player: Player,
  isPlaying?: boolean,
}>(), {
  isPlaying: false
})
</script>

<style lang="scss">
.player-indicator {
  padding: 8px 16px;
  background: rgba($color: #FFFFFF, $alpha: 0.5);
  border-radius: 32px;
  backdrop-filter: blur(0px);
  user-select: none;
}

.player-indicator-avatar {
  border-radius: 100%;

  >img {
    border-radius: 100%;
  }
}

.player-indicator-content {
  display: inline-flex;
  width: 100%;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  align-content: center;
}

.player-indicator-class {
  display: inline-flex;
  flex-direction: row;
  align-items: center;
  align-content: center;
  justify-content: center;
  gap: 8px;
}

.player-indicator-type-icon {
  opacity: 0.75;
}

.player-indicator-hourglass {
  position: relative;
  bottom: -0.125em;
  opacity: 0.5;
}

.player-indicator-chess-icon {
  height: 1em;
  width: 1em;
  border-radius: 50%;
  position: relative;
  bottom: -0.125em;

  &[role="black"] {
    background-color: black;
  }

  &[role="white"] {
    background-color: white;
  }
}
</style>
