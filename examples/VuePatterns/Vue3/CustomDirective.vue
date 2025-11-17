
<template>
  <div class="custom-directive-example">
    <h2>Custom Directives Example</h2>
    
    <!-- v-focus directive -->
    <input v-focus type="text" placeholder="Auto focused on mount" />
    
    <!-- v-click-outside directive -->
    <div v-click-outside="handleClickOutside" class="dropdown">
      <button @click="isOpen = !isOpen">Toggle Dropdown</button>
      <ul v-if="isOpen" class="dropdown-menu">
        <li>Option 1</li>
        <li>Option 2</li>
        <li>Option 3</li>
      </ul>
    </div>
    
    <!-- v-tooltip directive -->
    <button v-tooltip="'This is a tooltip'">Hover me</button>
    
    <p v-if="clickedOutside">You clicked outside the dropdown!</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { Directive } from 'vue';

const isOpen = ref(false);
const clickedOutside = ref(false);

// Custom directive: v-focus
const vFocus: Directive = {
  mounted(el) {
    el.focus();
  }
};

// Custom directive: v-click-outside
const vClickOutside: Directive = {
  mounted(el, binding) {
    el.clickOutsideEvent = (event: Event) => {
      if (!(el === event.target || el.contains(event.target as Node))) {
        binding.value(event);
      }
    };
    document.addEventListener('click', el.clickOutsideEvent);
  },
  unmounted(el) {
    document.removeEventListener('click', el.clickOutsideEvent);
  }
};

// Custom directive: v-tooltip
const vTooltip: Directive = {
  mounted(el, binding) {
    el.style.position = 'relative';
    
    const tooltip = document.createElement('div');
    tooltip.textContent = binding.value;
    tooltip.className = 'tooltip';
    tooltip.style.cssText = `
      position: absolute;
      bottom: 100%;
      left: 50%;
      transform: translateX(-50%);
      background: #333;
      color: white;
      padding: 5px 10px;
      border-radius: 4px;
      font-size: 12px;
      white-space: nowrap;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.3s;
    `;
    
    el.appendChild(tooltip);
    
    el.addEventListener('mouseenter', () => {
      tooltip.style.opacity = '1';
    });
    
    el.addEventListener('mouseleave', () => {
      tooltip.style.opacity = '0';
    });
  }
};

const handleClickOutside = () => {
  clickedOutside.value = true;
  isOpen.value = false;
  setTimeout(() => {
    clickedOutside.value = false;
  }, 2000);
};
</script>

<style scoped>
.custom-directive-example {
  padding: 20px;
  max-width: 600px;
}

input {
  width: 100%;
  padding: 10px;
  margin: 10px 0;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.dropdown {
  margin: 20px 0;
  position: relative;
  display: inline-block;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  list-style: none;
  padding: 0;
  margin: 5px 0;
  min-width: 150px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.dropdown-menu li {
  padding: 10px 15px;
  cursor: pointer;
}

.dropdown-menu li:hover {
  background: #f5f5f5;
}

button {
  padding: 8px 16px;
  margin: 10px 5px;
  background: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>
