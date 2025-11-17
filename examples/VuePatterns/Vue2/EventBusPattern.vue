
<template>
  <div class="event-bus-example">
    <h2>Event Bus Pattern (Vue 2)</h2>
    <button @click="sendMessage">Send Global Message</button>
    <p>Messages received: {{ messagesCount }}</p>
  </div>
</template>

<script>
import Vue from 'vue';

// Event Bus global
export const EventBus = new Vue();

export default {
  name: 'EventBusPattern',
  
  data() {
    return {
      messagesCount: 0
    };
  },
  
  methods: {
    sendMessage() {
      EventBus.$emit('global-message', {
        text: 'Hello from EventBus',
        timestamp: Date.now()
      });
    },
    
    handleGlobalMessage(payload) {
      console.log('Received:', payload);
      this.messagesCount++;
    }
  },
  
  created() {
    EventBus.$on('global-message', this.handleGlobalMessage);
  },
  
  beforeDestroy() {
    EventBus.$off('global-message', this.handleGlobalMessage);
  }
};
</script>

<style scoped>
.event-bus-example {
  padding: 20px;
  border: 2px solid #42b983;
}
</style>
