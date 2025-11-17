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

console.log('🧪 Testing Vue 3 Options API with Mixins (Regression Test)\n');
console.log('='.repeat(80));

const vue3OptionsAPIWithMixins = `<template>
  <div>{{ message }}</div>
</template>

<script>
export default {
  name: 'Vue3OptionsAPI',
  
  mixins: [LoggingMixin],
  
  data() {
    return {
      message: 'Hello Vue 3'
    };
  },
  
  methods: {
    greet() {
      console.log(this.message);
    }
  }
};
</script>`;

console.log('\n📄 Test: Vue 3 component using Options API + Mixins');
console.log('Expected: Should detect mixins as ANTI-PATTERN (not Vue 2 pattern)');
console.log('-'.repeat(80));

const result = validator.validate(vue3OptionsAPIWithMixins, 'Vue3OptionsAPI.vue');

console.log(`\n📊 Results:`);
console.log(`   Patterns detected: ${result.detections.length}`);
console.log(`   Violations found:  ${result.violations.length}`);

if (result.detections.length > 0) {
  console.log('\n✅ Patterns Detected:');
  result.detections.forEach((detection, index) => {
    console.log(`   ${index + 1}. ${detection.pattern} (${detection.category})`);
  });
}

if (result.violations.length > 0) {
  console.log('\n⚠️  Violations (EXPECTED):');
  result.violations.forEach((violation, index) => {
    console.log(`   ${index + 1}. ${violation.rule} [${violation.severity}]`);
    console.log(`      ${violation.message}`);
    if (violation.suggestion) {
      console.log(`      💡 ${violation.suggestion}`);
    }
  });
} else {
  console.log('\n❌ NO VIOLATIONS FOUND - BUG! Mixins should be anti-pattern');
}

console.log('\n' + '='.repeat(80));

const hasMixinAntiPattern = result.violations.some(v => v.rule === 'Mixin Usage (Anti-pattern)');
if (hasMixinAntiPattern) {
  console.log('✅ PASS: Mixins correctly detected as anti-pattern in Vue 3');
} else {
  console.log('❌ FAIL: Mixins NOT detected as anti-pattern (regression bug)');
}
