<template>
  <div class="game-container">
    <div class="game-chessboard">
      <GameChessboard :width="400" :height="400"></GameChessboard>
    </div>
  </div>
</template>

<script setup lang="ts">
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

.game-container {
  width: 96%;
  max-width: 1280px;
  @media (min-width: 600px) {
    width: 94%;
  }
  @media (min-width: 1024px) {
    width: 92%;
  }
}
</style>
