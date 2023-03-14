<template>
  <div class="game-background"></div>
  <div class="game">
    <router-view />
  </div>
</template>

<style lang="scss">
@import '~normalize.css';

#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.game {
  z-index: 1;
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
}

.game-background {
  z-index: 0;
  width: 100%;
  height: 100%;
  position: absolute;
  background: url("~@/assets/background.jpeg");
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  filter: blur(16px);
}
</style>
