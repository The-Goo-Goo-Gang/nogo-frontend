<template>
  <div>
    <canvas ref="canvas" class="game-chessboard-canvas" id="chessboardCanvas" :width="width" :height="height"
      :style="canvasStyle" @click="canvasClicked">
    </canvas>
  </div>
</template>

<script setup lang="ts">
import { defineProps, withDefaults, onMounted, ref, computed, watch, defineEmits, reactive } from 'vue'
import { Chess } from '@/const'

const LINE_WIDTH = 4

const props = withDefaults(defineProps<{
  width: number
  height: number
  chesses: Array<Array<Chess>>,
  size?: number
}>(), {
  size: 9
})

const emit = defineEmits(['chess-clicked'])

const canvas = ref<HTMLCanvasElement | null>(null)
const canvasStyle = computed(() => {
  return {
    width: `${props.width}px`,
    height: `${props.height}px`
  }
})
const rowSpace = computed(() => Math.floor((props.height - LINE_WIDTH * props.size) / (props.size)))
const columnSpace = computed(() => Math.floor((props.width - LINE_WIDTH * props.size) / (props.size)))
const drawWidth = computed(() => columnSpace.value * (props.size - 1) + LINE_WIDTH * props.size)
const drawHeight = computed(() => rowSpace.value * (props.size - 1) + LINE_WIDTH * props.size)
const boardWidth = computed(() => columnSpace.value * props.size + LINE_WIDTH * props.size)
const boardHeight = computed(() => rowSpace.value * props.size + LINE_WIDTH * props.size)
const widthDiff = computed(() => props.width - boardWidth.value)
const heightDiff = computed(() => props.height - boardHeight.value)
const rowPadding = computed(() => rowSpace.value / 2 + widthDiff.value / 2)
const columnPadding = computed(() => columnSpace.value / 2 + heightDiff.value / 2)
const rowSize = computed(() => LINE_WIDTH + rowSpace.value)
const columnSize = computed(() => LINE_WIDTH + columnSpace.value)

const chesses = computed(() => props.chesses)

function clearCanvas () {
  if (canvas.value != null) {
    const ctx = canvas.value.getContext('2d')
    if (ctx != null) {
      ctx.save()

      // 重置渲染上下文并清空画布
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.clearRect(0, 0, canvas.value.width, canvas.value.height)

      // 恢复先前渲染上下文所进行的变换
      ctx.restore()
    }
  }
}

function canvasClicked (e: MouseEvent) {
  if (canvas.value != null) {
    const x = Math.floor((e.offsetY - heightDiff.value / 2) / rowSize.value)
    const y = Math.floor((e.offsetX - widthDiff.value / 2) / columnSize.value)
    // console.log(x, y, chesses.value[x][y])
    emit('chess-clicked', x, y)
    // if (chesses.value[x][y] === Chess.None) {
    //   chesses.value[x][y] = Chess.Black
    // } else if (chesses.value[x][y] === Chess.Black) {
    //   chesses.value[x][y] = Chess.White
    // } else {
    //   chesses.value[x][y] = Chess.None
    // }
  }
}

function drawChessboard () {
  clearCanvas()
  if (canvas.value != null) {
    const ctx = canvas.value.getContext('2d')
    if (ctx != null) {
      ctx.lineWidth = LINE_WIDTH
      ctx.strokeStyle = '#000000'
      for (let i = 0; i < props.size; i++) {
        const y = columnPadding.value + LINE_WIDTH / 2 + i * (rowSpace.value + LINE_WIDTH)
        ctx.beginPath()
        ctx.moveTo(rowPadding.value, y)
        ctx.lineTo(rowPadding.value + drawWidth.value, y)
        ctx.stroke()
      }
      for (let i = 0; i < props.size; i++) {
        const x = rowPadding.value + LINE_WIDTH / 2 + i * (columnSpace.value + LINE_WIDTH)
        ctx.beginPath()
        ctx.moveTo(x, columnPadding.value)
        ctx.lineTo(x, columnPadding.value + drawHeight.value)
        ctx.stroke()
      }
    }
  }
  drawChesses()
}

function drawChesses () {
  if (canvas.value != null) {
    console.log('drawChesses', chesses.value)
    const ctx = canvas.value.getContext('2d')
    if (ctx != null) {
      ctx.lineWidth = LINE_WIDTH
      chesses.value.forEach((row, rowIndex) => {
        row.forEach((column, columnIndex) => {
          const y = heightDiff.value + rowSize.value * rowIndex + rowSize.value / 2 - LINE_WIDTH / 2
          const x = widthDiff.value + columnSize.value * columnIndex + columnSize.value / 2 - LINE_WIDTH / 2
          switch (column) {
            case Chess.None:
              break
            case Chess.Black:
              ctx.beginPath()
              ctx.arc(x, y, Math.min(rowSize.value, columnSize.value) * 0.25, 0, 2 * Math.PI, false)
              ctx.fillStyle = '#000000'
              ctx.fill()
              ctx.strokeStyle = '#000000'
              ctx.stroke()
              break
            case Chess.White:
              ctx.beginPath()
              ctx.arc(x, y, Math.min(rowSize.value, columnSize.value) * 0.25, 0, 2 * Math.PI, false)
              ctx.fillStyle = '#FFFFFF'
              ctx.fill()
              ctx.strokeStyle = '#FFFFFF'
              ctx.stroke()
              break
          }
        })
      })
    }
  }
}

onMounted(() => {
  drawChessboard()
})

watch(chesses, () => {
  drawChessboard()
})

</script>

<style lang="scss"></style>
