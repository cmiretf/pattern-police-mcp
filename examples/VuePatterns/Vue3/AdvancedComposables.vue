
<template>
  <div class="advanced-composables">
    <h2>Advanced Composables Patterns</h2>
    
    <!-- useFetch composable -->
    <div class="section">
      <h3>useFetch Example</h3>
      <button @click="refetchUser">Refetch User</button>
      <div v-if="userLoading">Loading user...</div>
      <div v-else-if="userError">Error: {{ userError }}</div>
      <div v-else-if="userData">
        <p>Name: {{ userData.name }}</p>
        <p>Email: {{ userData.email }}</p>
      </div>
    </div>
    
    <!-- useLocalStorage composable -->
    <div class="section">
      <h3>useLocalStorage Example</h3>
      <input v-model="storedValue" type="text" placeholder="Auto saved to localStorage" />
      <p>Stored value: {{ storedValue }}</p>
    </div>
    
    <!-- useDebounce composable -->
    <div class="section">
      <h3>useDebounce Example</h3>
      <input v-model="searchQuery" type="text" placeholder="Type to search (debounced)" />
      <p>Debounced value: {{ debouncedSearch }}</p>
    </div>
    
    <!-- useIntersectionObserver composable -->
    <div class="section">
      <h3>useIntersectionObserver Example</h3>
      <div ref="observedElement" class="observed-box">
        <p v-if="isVisible">This element is visible!</p>
        <p v-else>Scroll down to make this visible</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

// ==================== useFetch composable ====================
function useFetch<T>(url: string, options = { immediate: true }) {
  const data = ref<T | null>(null);
  const error = ref<string | null>(null);
  const loading = ref(false);
  
  const execute = async () => {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Network response was not ok');
      data.value = await response.json();
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error';
    } finally {
      loading.value = false;
    }
  };
  
  if (options.immediate) {
    execute();
  }
  
  return { data, error, loading, refetch: execute };
}

// ==================== useLocalStorage composable ====================
function useLocalStorage<T>(key: string, defaultValue: T) {
  const storedValue = ref<T>(defaultValue);
  
  // Load from localStorage
  const loadValue = () => {
    const item = localStorage.getItem(key);
    if (item) {
      try {
        storedValue.value = JSON.parse(item);
      } catch (e) {
        storedValue.value = defaultValue;
      }
    }
  };
  
  loadValue();
  
  // Watch and save to localStorage
  watch(storedValue, (newValue) => {
    localStorage.setItem(key, JSON.stringify(newValue));
  }, { deep: true });
  
  return storedValue;
}

// ==================== useDebounce composable ====================
function useDebounce<T>(value: Ref<T>, delay = 300) {
  const debouncedValue = ref(value.value) as Ref<T>;
  let timeout: NodeJS.Timeout;
  
  watch(value, (newValue) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      debouncedValue.value = newValue;
    }, delay);
  });
  
  return debouncedValue;
}

// ==================== useIntersectionObserver composable ====================
function useIntersectionObserver(
  elementRef: Ref<HTMLElement | null>,
  options = { threshold: 0.5 }
) {
  const isVisible = ref(false);
  
  watch(elementRef, (element) => {
    if (!element) return;
    
    const observer = new IntersectionObserver(([entry]) => {
      isVisible.value = entry.isIntersecting;
    }, options);
    
    observer.observe(element);
    
    return () => observer.disconnect();
  });
  
  return { isVisible };
}

// ==================== Component usage ====================
interface User {
  id: number;
  name: string;
  email: string;
}

const { data: userData, error: userError, loading: userLoading, refetch: refetchUser } = 
  useFetch<User>('https://jsonplaceholder.typicode.com/users/1');

const storedValue = useLocalStorage('myStoredValue', 'Default value');

const searchQuery = ref('');
const debouncedSearch = useDebounce(searchQuery, 500);

const observedElement = ref<HTMLElement | null>(null);
const { isVisible } = useIntersectionObserver(observedElement);
</script>

<style scoped>
.advanced-composables {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.section {
  margin: 30px 0;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
}

input {
  width: 100%;
  padding: 10px;
  margin: 10px 0;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.observed-box {
  height: 200px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  margin-top: 50vh;
}

button {
  padding: 8px 16px;
  background: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>
