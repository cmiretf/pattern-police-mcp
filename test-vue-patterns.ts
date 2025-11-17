import { VuePatternValidator } from './src/validators/VuePatternValidator.js';
import { VuePatternConfig } from './src/types-vue.js';
import { readFileSync } from 'fs';

const config: VuePatternConfig = JSON.parse(
  readFileSync('vue-patterns.config.json', 'utf-8')
);

const validator = new VuePatternValidator(config);

console.log('=== PATTERN POLICE VUE.JS - TEST SUITE ===\n');

console.log('=== TEST 1: Composable Pattern (useCounter) ===');
const composableCode = readFileSync('examples/VuePatterns/useCounter.vue', 'utf-8');
const composableResult = validator.validate(composableCode, 'useCounter.vue');
console.log(`✨ Patrones detectados: ${composableResult.detections.length}`);
console.log(`⚠️  Violaciones: ${composableResult.violations.length}`);
if (composableResult.detections.length > 0) {
  console.log('\n📋 Patrones encontrados:');
  composableResult.detections.forEach((d, idx) => {
    console.log(`${idx + 1}. ${d.pattern} (${d.category})`);
    console.log(`   Confianza: ${d.confidence}`);
    if (d.evidence) {
      console.log(`   Evidencia: ${d.evidence.join(', ')}`);
    }
  });
}
if (composableResult.violations.length > 0) {
  console.log('\n⚠️  Violaciones:');
  composableResult.violations.forEach((v, idx) => {
    console.log(`${idx + 1}. ${v.rule} (${v.severity}): ${v.message}`);
  });
}
console.log('\n');

console.log('=== TEST 2: Smart Component Pattern (UserList) ===');
const smartComponentCode = readFileSync('examples/VuePatterns/UserList.vue', 'utf-8');
const smartResult = validator.validate(smartComponentCode, 'UserList.vue');
console.log(`✨ Patrones detectados: ${smartResult.detections.length}`);
console.log(`⚠️  Violaciones: ${smartResult.violations.length}`);
if (smartResult.detections.length > 0) {
  console.log('\n📋 Patrones encontrados:');
  smartResult.detections.forEach((d, idx) => {
    console.log(`${idx + 1}. ${d.pattern} (${d.category})`);
    console.log(`   Confianza: ${d.confidence}`);
    if (d.evidence) {
      console.log(`   Evidencia: ${d.evidence.join(', ')}`);
    }
  });
}
if (smartResult.violations.length > 0) {
  console.log('\n⚠️  Violaciones:');
  smartResult.violations.forEach((v, idx) => {
    console.log(`${idx + 1}. ${v.rule} (${v.severity}): ${v.message}`);
  });
}
console.log('\n');

console.log('=== TEST 3: Anti-Patterns Detection ===');
const antiPatternsCode = readFileSync('examples/VuePatterns/AntiPatterns.vue', 'utf-8');
const antiResult = validator.validate(antiPatternsCode, 'AntiPatterns.vue');
console.log(`✨ Patrones detectados: ${antiResult.detections.length}`);
console.log(`⚠️  Violaciones: ${antiResult.violations.length}`);
if (antiResult.detections.length > 0) {
  console.log('\n📋 Patrones encontrados:');
  antiResult.detections.forEach((d, idx) => {
    console.log(`${idx + 1}. ${d.pattern} (${d.category})`);
  });
}
if (antiResult.violations.length > 0) {
  console.log('\n⚠️  Violaciones detectadas:');
  antiResult.violations.forEach((v, idx) => {
    console.log(`${idx + 1}. ${v.rule} (${v.severity})`);
    console.log(`   ${v.message}`);
    if (v.suggestion) {
      console.log(`   💡 ${v.suggestion}`);
    }
  });
}
console.log('\n');

const totalDetections = composableResult.detections.length + smartResult.detections.length + antiResult.detections.length;
const totalViolations = composableResult.violations.length + smartResult.violations.length + antiResult.violations.length;

console.log('=== RESUMEN FINAL ===');
console.log(`✅ Total de patrones detectados: ${totalDetections}`);
console.log(`⚠️  Total de violaciones encontradas: ${totalViolations}`);

if (totalDetections > 0 && totalViolations > 0) {
  console.log('\n✅✅✅ ALL TESTS COMPLETED SUCCESSFULLY ✅✅✅\n');
  console.log('🎉 Vue.js Pattern Detection está funcionando perfectamente!');
} else {
  console.log('\n❌ Tests failed - No detections or violations found');
  process.exit(1);
}
