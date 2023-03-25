<template>
  <div class="game-container grid">
    <div class="game-left-container left">
      <PlayerIndicator :player="{name: 'Player 1', type: 0}" :is-playing="true" />
      <div class="game-chessboard">
        <GameChessboard :width="400" :height="400"></GameChessboard>
      </div>
      <PlayerIndicator :player="{name: 'Player 2', type: 0}" />
    </div>
    <div class="game-right-container right">
    </div>
  </div>
</template>

<script setup lang="ts">
import PlayerIndicator from '@/components/PlayerIndicator.vue'
import GameChessboard from '@/components/GameChessboard.vue'
</script>

<style lang="scss">
.game-chessboard {
  padding: 16px;
  background: rgba($color: #FFFFFF, $alpha: 0.5);
  border-radius: 32px;
  backdrop-filter: blur(0px);
  display: inline-block;
}

.game-left-container {
  padding: 16px;
  justify-content: space-between;
  display: inline-flex;
  flex-direction: column;
  gap: 16px;
}

.game-right-container {
  padding: 16px;
  display: inline-flex;
  flex-direction: column;
  justify-content: flex-end;
  flex: 1;
}

.grid {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: stretch;
  justify-content: space-around;
  padding: 0em;
}

.game-container {
  height: 94%;
  width: 96%;
  max-width: 1280px;

  @media (min-width: 600px) {
    height: 92%;
    width: 94%;
  }

  @media (min-width: 1024px) {
    height: 90%;
    width: 92%;
  }
}
</style>
