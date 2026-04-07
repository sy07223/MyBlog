<script setup>
import { ref, onMounted } from 'vue'

const petals = ref([])

onMounted(() => {
  petals.value = Array.from({ length: 22 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 10}s`,
    duration: `${10 + Math.random() * 12}s`,
    size: `${6 + Math.random() * 10}px`,
  }))
})
</script>

<template>
  <div class="sakura-container" aria-hidden="true">
    <span
      v-for="p in petals"
      :key="p.id"
      class="sakura"
      :style="{
        left: p.left,
        width: p.size,
        height: p.size,
        animationDelay: p.delay,
        animationDuration: p.duration,
      }"
    />
  </div>
</template>

<style scoped>
.sakura-container {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}
.sakura {
  position: absolute;
  top: -12px;
  background-image: radial-gradient(circle, #ffafbd 20%, #ffc3a0 70%);
  border-radius: 50% 50% 50% 0;
  transform: rotate(45deg);
  opacity: 0.75;
  box-shadow: 0 0 5px #ffafbd;
  animation-name: falling;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
}
@keyframes falling {
  0% {
    transform: translateZ(0) rotate(0deg);
    opacity: 0.75;
  }
  100% {
    transform: translate3d(20px, 110vh, 0) rotate(360deg);
    opacity: 0;
  }
}
:global(html.dark) .sakura {
  background-image: radial-gradient(circle, #5d4037 20%, #795548 70%);
  box-shadow: 0 0 5px #5d4037;
  opacity: 0.5;
}
</style>
