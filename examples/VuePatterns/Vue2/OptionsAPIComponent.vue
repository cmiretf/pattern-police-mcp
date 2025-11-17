<template>
  <div class="user-card">
    <h2>{{ fullName }}</h2>
    <p>Email: {{ email | lowercase }}</p>
    <p>Age: {{ age }}</p>
    <button @click="incrementAge">Increment Age</button>
  </div>
</template>

<script>
import FormattingMixin from './FormattingMixin.js';

export default {
  name: 'OptionsAPIComponent',
  
  mixins: [FormattingMixin],
  
  props: {
    firstName: {
      type: String,
      required: true
    },
    lastName: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    }
  },
  
  data() {
    return {
      age: 25,
      count: 0
    };
  },
  
  filters: {
    lowercase(value) {
      return value ? value.toLowerCase() : '';
    },
    uppercase(value) {
      return value ? value.toUpperCase() : '';
    }
  },
  
  computed: {
    fullName() {
      return `${this.firstName} ${this.lastName}`;
    },
    
    isAdult() {
      return this.age >= 18;
    }
  },
  
  watch: {
    age(newAge, oldAge) {
      console.log(`Age changed from ${oldAge} to ${newAge}`);
    }
  },
  
  methods: {
    incrementAge() {
      this.age++;
    },
    
    resetAge() {
      this.age = 25;
    }
  },
  
  created() {
    console.log('Component created');
  },
  
  beforeDestroy() {
    console.log('Component will be destroyed');
  }
};
</script>

<style scoped>
.user-card {
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
}
</style>
