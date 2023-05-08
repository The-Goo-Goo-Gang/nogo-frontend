<template>
  <div>
    <canvas ref="canvas" class="game-chessboard-canvas" id="chessboardCanvas" :width="width" :height="height"
      :style="canvasStyle" @click="canvasClicked" @pointermove="onPointerMove">
    </canvas>
  </div>
  <Teleport to="body">
    <div class="tip" :style="tipStyle" v-if="isHoverPositionDisabled" data-text="下在这里就输了~"></div>
  </Teleport>
</template>

<script setup lang="ts">
import { withDefaults, onMounted, ref, computed, watch } from 'vue'
import { Chess } from '@/const'
import { Position } from '@/state'

const LINE_WIDTH = 4

const props = withDefaults(defineProps<{
  width: number,
  height: number,
  chesses: Chess[][],
  size: number,
  disabledPosition?: Position[]
}>(), {
  size: 9
})

const emit = defineEmits(['chess-clicked'])

const canvas = ref<HTMLCanvasElement | null>(null)
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
const disabledPosition = computed(() => props.disabledPosition || [])

function clearCanvas() {
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

const calcChessPosition = (x: number, y: number): { x: number, y: number } => {
  return {
    x: Math.max(0, Math.min(props.size - 1, Math.floor((y - widthDiff.value / 2) / columnSize.value))),
    y: Math.max(0, Math.min(props.size - 1, Math.floor((x - heightDiff.value / 2) / rowSize.value)))
  }
}

function canvasClicked(e: MouseEvent) {
  if (canvas.value != null) {
    const { x, y } = calcChessPosition(e.offsetX, e.offsetY)
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

const hoverX = ref(-1)
const hoverY = ref(-1)
const hoverChessX = ref(-1)
const hoverChessY = ref(-1)

const onPointerMove = (e: PointerEvent) => {
  const { x, y } = calcChessPosition(e.offsetX, e.offsetY)
  hoverX.value = e.clientX
  hoverY.value = e.clientY
  hoverChessX.value = x
  hoverChessY.value = y
}

const isPositionDisabled = (x: number, y: number) => {
  return disabledPosition.value.some(p => p.x === x && p.y === y)
}

const isHoverPositionDisabled = computed(() => {
  return isPositionDisabled(hoverChessX.value, hoverChessY.value)
})

const canvasStyle = computed(() => {
  return {
    width: `${props.width}px`,
    height: `${props.height}px`,
    cursor: isHoverPositionDisabled.value ? 'not-allowed' : 'pointer'
  }
})
const tipStyle = computed(() => {
  return {
    left: `${hoverX.value}px`,
    top: `${hoverY.value}px`
  }
})

function drawChessboard() {
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

function drawChesses() {
  if (canvas.value != null) {
    console.log('drawChesses', chesses.value)
    const ctx = canvas.value.getContext('2d')
    if (ctx != null) {
      ctx.lineWidth = LINE_WIDTH
      chesses.value.forEach((row, rowIndex) => {
        row.forEach((column, columnIndex) => {
          const centerX = widthDiff.value + columnSize.value * columnIndex + columnSize.value / 2 - LINE_WIDTH / 2
          const centerY = heightDiff.value + rowSize.value * rowIndex + rowSize.value / 2 - LINE_WIDTH / 2
          if (hoverChessX.value === rowIndex && hoverChessY.value === columnIndex) {
            ctx.lineWidth = LINE_WIDTH * 0.5
            if (isPositionDisabled(rowIndex, columnIndex)) {
              ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)'
            } else {
              ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)'
            }
            ctx.beginPath()
            ctx.arc(centerX, centerY, Math.min(rowSize.value, columnSize.value) * 0.25 + LINE_WIDTH * 1, Math.PI / 8, Math.PI / 8 * 3, false)
            ctx.stroke()
            ctx.beginPath()
            ctx.arc(centerX, centerY, Math.min(rowSize.value, columnSize.value) * 0.25 + LINE_WIDTH * 1, Math.PI / 8 * 5, Math.PI / 8 * 7, false)
            ctx.stroke()
            ctx.beginPath()
            ctx.arc(centerX, centerY, Math.min(rowSize.value, columnSize.value) * 0.25 + LINE_WIDTH * 1, Math.PI / 8 * 9, Math.PI / 8 * 11, false)
            ctx.stroke()
            ctx.beginPath()
            ctx.arc(centerX, centerY, Math.min(rowSize.value, columnSize.value) * 0.25 + LINE_WIDTH * 1, Math.PI / 8 * 13, Math.PI / 8 * 15, false)
            ctx.stroke()
            ctx.lineWidth = 0
          }
          switch (column) {
            case Chess.None:
              break
            case Chess.Black:
              ctx.lineWidth = 0
              ctx.beginPath()
              ctx.arc(centerX, centerY, Math.min(rowSize.value, columnSize.value) * 0.25, 0, 2 * Math.PI, false)
              ctx.fillStyle = '#000000'
              ctx.fill()
              break
            case Chess.White:
              ctx.lineWidth = 0
              ctx.beginPath()
              ctx.arc(centerX, centerY, Math.min(rowSize.value, columnSize.value) * 0.25, 0, 2 * Math.PI, false)
              ctx.fillStyle = '#FFFFFF'
              ctx.fill()
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
watch(disabledPosition, () => {
  drawChessboard()
})
watch(hoverChessX, () => {
  drawChessboard()
})
watch(hoverChessY, () => {
  drawChessboard()
})

</script>

<style lang="scss">
.tip {
  position: fixed;
  z-index: 100;
  pointer-events: none;

  &::before {
    content: attr(data-text);
    background-color: rgba($color: #FFF, $alpha: 0.5);
    padding: 8px;
    border-radius: 8px;
    font-size: 12px;
    color: #000;
    position: absolute;
    top: 0;
    left: 0;
    margin: 0 auto;
    white-space: nowrap;
    opacity: 0.85;
    transform: translateY(-150%);
    transition: .1s;
  }
}
</style>
