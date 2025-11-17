
<template>
  <div class="teleport-suspense-example">
    <h2>Teleport & Suspense Pattern</h2>
    
    <!-- Modal usando Teleport -->
    <button @click="showModal = true">Open Modal</button>
    
    <Teleport to="body">
      <div v-if="showModal" class="modal-overlay" @click="showModal = false">
        <div class="modal-content" @click.stop>
          <h3>Modal Title</h3>
          <p>This modal is teleported to body element</p>
          <button @click="showModal = false">Close</button>
        </div>
      </div>
    </Teleport>
    
    <!-- Suspense para componentes async -->
    <Suspense>
      <template #default>
        <AsyncComponent />
      </template>
      
      <template #fallback>
        <div class="loading">
          <p>Loading async component...</p>
        </div>
      </template>
    </Suspense>
  </div>
</template>

<script setup lang="ts">
import { ref, defineAsyncComponent } from 'vue';

const showModal = ref(false);

// Componente asíncrono
const AsyncComponent = defineAsyncComponent(async () => {
  // Simular delay de carga
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  return {
    template: `
      <div class="async-content">
        <h3>Async Component Loaded</h3>
        <p>This component was loaded asynchronously</p>
      </div>
    `
  };
});
</script>

<style scoped>
.teleport-suspense-example {
  padding: 20px;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.modal-content {
  background: white;
  padding: 30px;
  border-radius: 8px;
  max-width: 500px;
  width: 90%;
}

.loading {
  padding: 20px;
  text-align: center;
  color: #666;
  font-style: italic;
}

.async-content {
  margin-top: 20px;
  padding: 15px;
  border: 1px solid #42b983;
  border-radius: 8px;
}
</style>
