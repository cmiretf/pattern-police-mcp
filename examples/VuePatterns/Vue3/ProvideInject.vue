
<template>
  <div class="provide-inject-parent">
    <h2>Provide/Inject Pattern</h2>
    <button @click="updateTheme">Toggle Theme</button>
    <p>Current Theme: {{ theme }}</p>
    
    <ChildComponent />
  </div>
</template>

<script setup lang="ts">
import { ref, provide, readonly } from 'vue';
import type { InjectionKey, Ref } from 'vue';

// Define injection key para type safety
export const themeKey = Symbol() as InjectionKey<{
  theme: Readonly<Ref<string>>;
  updateTheme: () => void;
}>;

const theme = ref('light');

const updateTheme = () => {
  theme.value = theme.value === 'light' ? 'dark' : 'light';
};

// Provide con readonly para prevenir mutaciones desde hijos
provide(themeKey, {
  theme: readonly(theme),
  updateTheme
});
</script>

<script lang="ts">
import { defineComponent } from 'vue';

// Child Component
export const ChildComponent = defineComponent({
  name: 'ChildComponent',
  
  setup() {
    const themeContext = inject(themeKey);
    
    return {
      theme: themeContext?.theme,
      updateTheme: themeContext?.updateTheme
    };
  },
  
  template: `
    <div :class="['child', theme]">
      <h3>Child Component</h3>
      <p>Inherited theme: {{ theme }}</p>
      <button @click="updateTheme">Change Theme from Child</button>
    </div>
  `
});
</script>

<style scoped>
.provide-inject-parent {
  padding: 20px;
}

.child {
  margin-top: 20px;
  padding: 15px;
  border: 2px solid #42b983;
}

.child.dark {
  background: #333;
  color: white;
}

.child.light {
  background: white;
  color: #333;
}
</style>
