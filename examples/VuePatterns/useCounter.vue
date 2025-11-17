<template>
  <div class="counter">
    <h1>Counter: {{ count }}</h1>
    <button @click="increment">+</button>
    <button @click="decrement">-</button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

export function useCounter(options = { initialValue: 0, step: 1 }) {
  const { initialValue, step } = options
  const count = ref(initialValue)
  const doubled = computed(() => count.value * 2)
  
  const increment = () => {
    count.value += step
  }
  
  const decrement = () => {
    count.value -= step
  }
  
  const reset = () => {
    count.value = initialValue
  }
  
  onMounted(() => {
    console.log('Counter composable mounted')
  })
  
  onUnmounted(() => {
    console.log('Counter composable unmounted')
  })
  
  return {
    count,
    doubled,
    increment,
    decrement,
    reset
  }
}

const { count, increment, decrement } = useCounter({ initialValue: 0, step: 1 })
</script>

<style scoped>
.counter {
  padding: 20px;
}

button {
  margin: 0 5px;
}
</style>
