import { VuePatternValidator } from './src/validators/VuePatternValidator';
import type { VuePatternConfig } from './src/types-vue';

const config: VuePatternConfig = {
  rules: {
    composables: { enabled: true },
    components: { enabled: true },
    antiPatterns: { enabled: true, detectMixins: true },
    bestPractices: { enabled: true },
    template: { enabled: true }
  }
};

const validator = new VuePatternValidator(config);

const simpleVue2Component = `<template>
  <div>{{ message }}</div>
</template>

<script>
export default {
  name: 'SimpleVue2',
  
  mixins: [MyMixin],
  
  data() {
    return {
      message: 'Hello'
    };
  },
  
  filters: {
    uppercase(value) {
      return value.toUpperCase();
    }
  },
  
  computed: {
    uppercaseMessage() {
      return this.message.toUpperCase();
    }
  },
  
  methods: {
    greet() {
      console.log(this.message);
    }
  }
};
</script>`;

console.log('🔍 Debugging Vue 2 Component Parsing\n');

const result = validator.validate(simpleVue2Component, 'SimpleVue2.vue');

console.log('Detections:', result.detections.length);
console.log('Violations:', result.violations.length);

console.log('\nDetections:');
result.detections.forEach(d => {
  console.log(`  - ${d.pattern} (${d.category})`);
  console.log(`    Evidence:`, d.evidence);
});

console.log('\nViolations:');
result.violations.forEach(v => {
  console.log(`  - ${v.rule} [${v.severity}]: ${v.message}`);
});
