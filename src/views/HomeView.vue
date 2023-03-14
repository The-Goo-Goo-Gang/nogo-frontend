<template>
  <div class="game-home">
    <h1 class="game-title">NoGo</h1>
    <div class="game-actions">
      <RouterLink to="/game">
        <button class="game-action-btn">Start Game</button>
      </RouterLink>
      <br>
      <button class="game-action-btn">Config</button>
      <br>
      <button class="game-action-btn">Exit</button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'HomeView',
  components: {}
})
</script>

<style lang="scss">
.game-home {
  text-align: center;
}

.game-actions {
  display: flex;
  flex-direction: column;
}

.game-action-btn {
  background: none;
  border: 0;

  &:hover {
    font-weight: bold;
  }
}
</style>
