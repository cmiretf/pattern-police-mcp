import { VuePatternValidator } from './src/validators/VuePatternValidator';
import type { VuePatternConfig } from './src/types-vue';
import * as fs from 'fs';
import * as path from 'path';

const config: VuePatternConfig = {
  rules: {
    composables: { enabled: true },
    components: { enabled: true },
    antiPatterns: { enabled: true, detectMixins: true, detectVIfVFor: true, detectPropMutation: true },
    bestPractices: { enabled: true },
    template: { enabled: true }
  }
};

const validator = new VuePatternValidator(config);

console.log('🧪 Testing Vue 2 Pattern Detection\n');
console.log('='.repeat(80));

const vue2Examples = [
  'examples/VuePatterns/Vue2/OptionsAPIComponent.vue',
  'examples/VuePatterns/Vue2/ComplexVue2Component.vue'
];

vue2Examples.forEach(filePath => {
  if (!fs.existsSync(filePath)) {
    console.log(`\n❌ File not found: ${filePath}`);
    return;
  }

  console.log(`\n📄 Testing: ${path.basename(filePath)}`);
  console.log('-'.repeat(80));

  const code = fs.readFileSync(filePath, 'utf-8');
  const result = validator.validate(code, filePath);

  console.log(`\n📊 Results:`);
  console.log(`   Patterns detected: ${result.detections.length}`);
  console.log(`   Violations found:  ${result.violations.length}`);

  if (result.detections.length > 0) {
    console.log('\n✅ Patterns Detected:');
    result.detections.forEach((detection, index) => {
      console.log(`   ${index + 1}. ${detection.pattern} (${detection.category})`);
      console.log(`      Confidence: ${detection.confidence}`);
      console.log(`      Evidence:`);
      detection.evidence.forEach(e => console.log(`        - ${e}`));
      if (detection.suggestions && detection.suggestions.length > 0) {
        console.log(`      Suggestions:`);
        detection.suggestions.forEach(s => console.log(`        💡 ${s}`));
      }
    });
  }

  if (result.violations.length > 0) {
    console.log('\n⚠️  Violations/Warnings:');
    result.violations.forEach((violation, index) => {
      console.log(`   ${index + 1}. ${violation.rule} [${violation.severity}]`);
      console.log(`      ${violation.message}`);
      if (violation.suggestion) {
        console.log(`      💡 ${violation.suggestion}`);
      }
    });
  }
});

console.log('\n' + '='.repeat(80));
console.log('\n✨ Vue 2 Pattern Detection Test Complete\n');

console.log('📝 Expected Patterns for Vue 2:');
console.log('   1. Options API Structure (optionsAPI)');
console.log('   2. Mixin Usage (Vue 2 Pattern) - NOT anti-pattern in Vue 2');
console.log('   3. Filter Usage (Vue 2 Pattern) - NOT deprecated in Vue 2');
console.log('   4. Watch Pattern (optionsAPI)');
console.log('   5. Prop Validation (bestPractices)');
console.log('\n   ⚠️  Filters should NOT be marked as deprecated in Vue 2 components');
console.log('   ⚠️  Mixins should NOT be marked as anti-pattern in Vue 2 components');
