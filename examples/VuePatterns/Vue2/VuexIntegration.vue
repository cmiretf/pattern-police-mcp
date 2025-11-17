
<template>
  <div class="vuex-integration">
    <h2>Vuex Integration (Vue 2)</h2>
    <p>Count: {{ count }}</p>
    <p>Double: {{ doubleCount }}</p>
    <button @click="increment">Increment</button>
    <button @click="incrementByAmount(5)">Increment by 5</button>
    
    <div v-if="user">
      <h3>User: {{ user.name }}</h3>
      <p>Email: {{ user.email }}</p>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex';

export default {
  name: 'VuexIntegration',
  
  computed: {
    ...mapState(['count', 'user']),
    ...mapGetters(['doubleCount', 'isAuthenticated'])
  },
  
  methods: {
    ...mapMutations(['increment']),
    ...mapActions(['incrementByAmount', 'fetchUser'])
  },
  
  async created() {
    await this.fetchUser();
  }
};
</script>

<style scoped>
.vuex-integration {
  padding: 20px;
  background: #f5f5f5;
}
</style>
