<template>
  <div class="product-list">
    <h1>{{ pageTitle | capitalize }}</h1>
    
    <div v-for="product in products" :key="product.id">
      <h3>{{ product.name }}</h3>
      <p>{{ product.price | currency }}</p>
    </div>
    
    <p>Total: {{ totalPrice | currency }}</p>
  </div>
</template>

<script>
import VuexMixin from './VuexMixin.js';
import LoggingMixin from './LoggingMixin.js';

export default {
  name: 'ComplexVue2Component',
  
  mixins: [VuexMixin, LoggingMixin],
  
  props: ['initialProducts'],
  
  data() {
    return {
      pageTitle: 'products catalog',
      products: [],
      loading: false,
      error: null
    };
  },
  
  filters: {
    capitalize(value) {
      if (!value) return '';
      value = value.toString();
      return value.charAt(0).toUpperCase() + value.slice(1);
    },
    
    currency(value) {
      return `$${parseFloat(value).toFixed(2)}`;
    }
  },
  
  computed: {
    totalPrice() {
      return this.products.reduce((sum, p) => sum + p.price, 0);
    },
    
    productCount() {
      return this.products.length;
    }
  },
  
  watch: {
    initialProducts: {
      handler(newProducts) {
        this.products = [...newProducts];
      },
      immediate: true,
      deep: true
    },
    
    loading(isLoading) {
      if (isLoading) {
        this.error = null;
      }
    }
  },
  
  methods: {
    async fetchProducts() {
      this.loading = true;
      try {
        const response = await fetch('/api/products');
        this.products = await response.json();
      } catch (err) {
        this.error = err.message;
      } finally {
        this.loading = false;
      }
    },
    
    addProduct(product) {
      this.products.push(product);
    },
    
    removeProduct(id) {
      this.products = this.products.filter(p => p.id !== id);
    }
  },
  
  created() {
    this.fetchProducts();
  },
  
  beforeDestroy() {
    this.products = [];
  },
  
  destroyed() {
    console.log('Component destroyed');
  }
};
</script>

<style scoped>
.product-list {
  padding: 20px;
}
</style>
