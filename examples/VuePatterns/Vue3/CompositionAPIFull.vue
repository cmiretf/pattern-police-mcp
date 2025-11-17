
<template>
  <div class="composition-api-example">
    <h2>{{ title }}</h2>
    
    <div class="counter">
      <p>Count: {{ count }}</p>
      <p>Double: {{ doubleCount }}</p>
      <button @click="increment">+1</button>
      <button @click="decrement">-1</button>
      <button @click="reset">Reset</button>
    </div>
    
    <div class="mouse-tracker">
      <p>Mouse Position: x={{ x }}, y={{ y }}</p>
    </div>
    
    <div class="user-data" v-if="userData">
      <h3>{{ userData.name }}</h3>
      <p>{{ userData.email }}</p>
    </div>
    
    <div v-if="loading">Loading...</div>
    <div v-if="error" class="error">{{ error }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';

interface User {
  id: number;
  name: string;
  email: string;
}

// Props con TypeScript
interface Props {
  initialCount?: number;
  title?: string;
}

const props = withDefaults(defineProps<Props>(), {
  initialCount: 0,
  title: 'Composition API Full Example'
});

// Emits con TypeScript
const emit = defineEmits<{
  countChanged: [value: number];
  reset: [];
}>();

// Estado reactivo
const count = ref(props.initialCount);
const x = ref(0);
const y = ref(0);
const userData = ref<User | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);

// Computed properties
const doubleCount = computed(() => count.value * 2);

// Methods
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

const updateMousePosition = (event: MouseEvent) => {
  x.value = event.clientX;
  y.value = event.clientY;
};

const fetchUserData = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    const response = await fetch('https://jsonplaceholder.typicode.com/users/1');
    userData.value = await response.json();
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unknown error';
  } finally {
    loading.value = false;
  }
};

// Watchers
watch(count, (newValue, oldValue) => {
  console.log(`Count changed from ${oldValue} to ${newValue}`);
});

// Lifecycle hooks
onMounted(() => {
  window.addEventListener('mousemove', updateMousePosition);
  fetchUserData();
});

onUnmounted(() => {
  window.removeEventListener('mousemove', updateMousePosition);
});
</script>

<style scoped>
.composition-api-example {
  padding: 20px;
  max-width: 600px;
  margin: 0 auto;
}

.counter, .mouse-tracker, .user-data {
  margin: 20px 0;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
}

button {
  margin: 0 5px;
  padding: 8px 16px;
  background: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background: #35a372;
}

.error {
  color: #ff4444;
  padding: 10px;
  background: #ffe6e6;
  border-radius: 4px;
}
</style>
