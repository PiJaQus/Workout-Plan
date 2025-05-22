<template>
  <div class="home-container">
    <h1 class="title">Welcome to MuscleWorkHolicSite</h1>
    <div>Choose Gender ⇓</div>
    <div
        class="wheel"
        @touchstart="startTouch"
        @touchmove="moveTouch"
        @touchend="endTouch"
    >
      <div class="wheel-window">
        <div class="wheel-item" :class="{ rotate: isRotating }">
          {{ selectedOption }}
        </div>
      </div>
    </div>

    <button class="continue-button" @click="goToSelected">
      Move on
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const options = ['Woman', 'Man']
const index = ref(0)
const selectedOption = ref(options[index.value])

let startY = 0
let touchMoveY = 0

const isRotating = ref(false)

function animateRotation(direction: 'up' | 'down') {
  isRotating.value = true
  setTimeout(() => {
    isRotating.value = false
  }, 300)

  if (direction === 'up') {
    next()
  } else {
    previous()
  }
}

function startTouch(event: TouchEvent) {
  startY = event.touches[0].clientY
}

function moveTouch(event: TouchEvent) {
  touchMoveY = startY - event.touches[0].clientY
}

function endTouch() {
  if (touchMoveY > 30) {
    animateRotation('up')
  } else if (touchMoveY < -30) {
    animateRotation('down')
  }
}

function next() {
  index.value = (index.value + 1) % options.length
  selectedOption.value = options[index.value]
}

function previous() {
  index.value = (index.value - 1 + options.length) % options.length
  selectedOption.value = options[index.value]
}

function goToSelected() {
  router.push('/' + selectedOption.value.toLowerCase())
}
</script>

<style scoped>
.home-container {
  background: #000;
  color: #1dd267;
  height: 50vh;
  padding: 3rem 1rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  gap: 2rem;
}

.title {
  font-size: 2.5rem;
  font-weight: bold;
  color: #1dd267;
}

.wheel {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 80%;
  height: 200px;
  background: #222;
  border-radius: 20px;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.5);
  overflow: hidden;
  cursor: pointer;
}

.wheel-window {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.wheel-item {
  font-size: 3rem;
  color: #1dd267;
  font-weight: bold;
  transition: transform 0.3s ease-in-out, opacity 0.3s ease-in-out;
}

.wheel-item.rotate {
  animation: spin 0.3s ease-in-out;
}

@keyframes spin {
  0% {
    transform: rotateX(0deg);
    opacity: 1;
  }
  50% {
    transform: rotateX(90deg);
    opacity: 0;
  }
  100% {
    transform: rotateX(0deg);
    opacity: 1;
  }
}
.continue-button {
  background: #1dd267;
  color: #fff;
  font-size: 1.5rem;
  padding: 1rem 2rem;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.continue-button:hover {
  background-color: #17b957;
}
</style>