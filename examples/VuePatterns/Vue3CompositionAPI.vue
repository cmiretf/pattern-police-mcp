<template>
  <div class="counter-card">
    <h2>{{ title }}</h2>
    <p>Count: {{ count }}</p>
    <p>Double: {{ doubleCount }}</p>
    <button @click="increment">Increment</button>
    <button @click="decrement">Decrement</button>
    <button @click="reset">Reset</button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';

interface Props {
  initialCount?: number;
  title?: string;
}

const props = withDefaults(defineProps<Props>(), {
  initialCount: 0,
  title: 'Counter Component'
});

const emit = defineEmits<{
  countChanged: [value: number];
  reset: [];
}>();

const count = ref(props.initialCount);

const doubleCount = computed(() => count.value * 2);

const increment = () => {
  count.value++;
  emit('countChanged', count.value);
};

const decrement = () => {
  count.value--;
  emit('countChanged', count.value);
};

const reset = () => {
  count.value = props.initialCount;
  emit('reset');
};

watch(count, (newValue, oldValue) => {
  console.log(`Count changed from ${oldValue} to ${newValue}`);
});

onMounted(() => {
  console.log('Counter component mounted');
});

onUnmounted(() => {
  console.log('Counter component unmounted');
});
</script>

<style scoped>
.counter-card {
  padding: 20px;
  border: 2px solid #42b983;
  border-radius: 8px;
  text-align: center;
}

button {
  margin: 5px;
  padding: 8px 16px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #35a372;
}
</style>
