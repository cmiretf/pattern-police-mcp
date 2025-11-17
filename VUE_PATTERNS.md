# Vue.js Pattern Detection - Pattern Police

Este documento describe todos los patrones de diseño Vue.js que Pattern Police puede detectar.

**Versiones Soportadas:** Vue 2 y Vue 3 con detección automática de versión

## 📋 Catálogo Completo de Patrones (40+)

### 🔍 Detección Automática de Versión

Pattern Police detecta automáticamente si tu componente usa **Vue 2** o **Vue 3** basándose en:
- Sintaxis de Composition API (Vue 3)
- `<script setup>` (Vue 3)
- `defineProps`/`defineEmits` (Vue 3)
- `beforeDestroy`/`destroyed` lifecycle hooks (Vue 2)
- Filters (Vue 2)
- Options API puro sin Composition API (Vue 2)

**Patrones específicos de versión:**
- **Mixins**: Patrón válido en Vue 2, anti-pattern en Vue 3
- **Filters**: Patrón válido en Vue 2, removido en Vue 3

### 🧩 Composables Patterns (5 patrones)

#### 1. Composable Naming Convention
**Descripción:** Funciones composable deben usar el prefijo "use"  
**Severidad:** Warning  
**Detecta:**
- Funciones que empiezan con `use` seguido de mayúscula
- Funciones exportadas que siguen la convención de composables

**Ejemplo:**
```javascript
export function useCounter() {
  const count = ref(0)
  return { count }
}
```

#### 2. Composable Options Object
**Descripción:** Composables configurables deben usar objeto de opciones  
**Severidad:** Warning  
**Detecta:**
- Parámetros llamados `options`, `config`, o `params`
- Uso de desestructuración de opciones

**Ejemplo:**
```javascript
export function useFetch(options = {}) {
  const { immediate = true, refetch = false } = options
  // ...
}
```

#### 3. Composable Return Reactive
**Descripción:** Composables deben retornar valores reactivos  
**Severidad:** Warning  
**Detecta:**
- Return statements con `ref`, `reactive`, `computed`, `readonly`

**Ejemplo:**
```javascript
export function useMouse() {
  const x = ref(0)
  const y = ref(0)
  return { x, y }
}
```

#### 4. Composable Flexible Arguments
**Descripción:** Aceptar tanto refs como valores planos  
**Severidad:** Info  
**Detecta:**
- Uso de `unref`, `toRef`, `toRefs` para normalizar argumentos

**Ejemplo:**
```javascript
export function useFetch(url) {
  const urlRef = ref(url) // Acepta string o Ref
  // ...
}
```

#### 5. Composable Lifecycle Hooks
**Descripción:** Uso de lifecycle hooks en composables  
**Severidad:** Info  
**Detecta:**
- `onMounted`, `onUnmounted`, `onBeforeMount`, etc.

---

### 🧱 Component Patterns (6 patrones)

#### 6. Smart/Dumb Components
**Descripción:** Separación de componentes con lógica vs presentacionales  
**Severidad:** Warning  
**Detecta:**
- **Smart:** Componentes con lógica de negocio (computed, ref, reactive)
- **Dumb:** Componentes solo con props (presentacionales)

**Ejemplo Smart:**
```vue
<script setup>
const data = ref([])
const filteredData = computed(() => /* lógica */)
</script>
```

**Ejemplo Dumb:**
```vue
<script setup>
const props = defineProps<{ items: Item[] }>()
</script>
<template>
  <div v-for="item in props.items">{{ item.name }}</div>
</template>
```

#### 7. List/Item Pattern
**Descripción:** Separar componente de lista del componente de item  
**Severidad:** Info

#### 8. Renderless Component
**Descripción:** Componentes que solo proveen lógica sin UI  
**Severidad:** Info  
**Detecta:**
- Template que solo contiene `<slot>`
- Script con lógica reutilizable

**Ejemplo:**
```vue
<template>
  <slot :x="x" :y="y" />
</template>

<script setup>
const x = ref(0)
const y = ref(0)
// lógica de tracking del mouse
</script>
```

#### 9. Scoped Slots
**Descripción:** Slots que exponen datos al componente padre  
**Severidad:** Info  
**Detecta:**
- `<slot :propName="value">` o `<slot v-bind="object">`

#### 10. Named Slots
**Descripción:** Múltiples slots con nombres específicos  
**Severidad:** Info  
**Detecta:**
- `<slot name="header">`, `<slot name="footer">`, etc.

#### 11. Provide/Inject Pattern
**Descripción:** Compartir estado entre componentes sin props drilling  
**Severidad:** Info

---

### ⚠️  Anti-Patterns (6 patrones)

#### 12. Mixin Usage (Anti-pattern)
**Descripción:** Uso de mixins (deprecado en Vue 3)  
**Severidad:** Warning  
**Detecta:**
- `mixins: [...]` en Options API

**Solución:** Migrar a composables con Composition API

#### 13. v-if with v-for (Anti-pattern)
**Descripción:** v-if y v-for en el mismo elemento  
**Severidad:** Warning  
**Detecta:**
- `<div v-for="..." v-if="...">`

**Solución:**
```vue
<!-- ❌ Mal -->
<div v-for="item in items" v-if="item.active">

<!-- ✅ Bien -->
<div v-for="item in activeItems">
<!-- O -->
<template v-for="item in items">
  <div v-if="item.active">
</template>
```

#### 14. Prop Mutation (Anti-pattern)
**Descripción:** Mutación directa de props  
**Severidad:** Error  
**Detecta:**
- Asignaciones a props: `propName.value = ...` o `propName = ...`

**Solución:** Emitir evento para actualizar en el padre

#### 15. $parent Access (Anti-pattern)
**Descripción:** Acceso a $parent, $children, $root  
**Severidad:** Warning  
**Detecta:**
- `this.$parent`, `this.$children`, `this.$root`

**Solución:** Usar props, emits, o provide/inject

#### 16. God Component (Anti-pattern)
**Descripción:** Componentes muy grandes (>300 líneas)  
**Severidad:** Warning  
**Configurable:** `maxComponentSize` en config

**Solución:** Dividir en componentes más pequeños, extraer lógica a composables

#### 17. Missing v-for Key (Anti-pattern)
**Descripción:** v-for sin :key  
**Severidad:** Warning  
**Detecta:**
- `v-for` sin `:key` o `v-bind:key`

**Solución:** Siempre usar `:key` único

---

### ✅ Best Practices (6 patrones)

#### 18. Prop Validation
**Descripción:** Validación de tipos en props  
**Severidad:** Info  
**Detecta:**
- `defineProps<Type>` (TypeScript)
- `type: String/Number/Boolean/Array/Object` (runtime validation)

**Ejemplo:**
```typescript
// TypeScript
interface Props {
  name: string
  age?: number
}
const props = defineProps<Props>()

// Runtime
defineProps({
  name: { type: String, required: true },
  age: { type: Number, default: 0 }
})
```

#### 19. Computed vs Methods
**Descripción:** Preferir computed para valores derivados  
**Severidad:** Info

#### 20. Event Naming Convention
**Descripción:** Nombres de eventos en kebab-case  
**Severidad:** Info  
**Detecta:**
- Eventos que no usan kebab-case

**Ejemplo:**
```javascript
// ❌ Mal: camelCase
emit('updateValue', value)

// ✅ Bien: kebab-case
emit('update-value', value)
```

#### 21. Script Setup Usage
**Descripción:** Uso de `<script setup>` en Vue 3  
**Severidad:** Info  
**Beneficios:**
- Menos boilerplate
- Mejor performance
- Mejor TypeScript support

#### 22. TypeScript Usage
**Descripción:** Uso de TypeScript en componentes  
**Severidad:** Info  
**Detecta:**
- `<script setup lang="ts">` o `<script lang="ts">`

#### 23. defineProps/defineEmits Pattern
**Descripción:** Uso correcto de defineProps y defineEmits  
**Severidad:** Info

---

### 📄 Template Patterns (5 patrones)

#### 24. Pass-Through Pattern
**Descripción:** Usar slots en lugar de props para contenido  
**Severidad:** Info

**Ejemplo:**
```vue
<!-- ❌ Mal -->
<AppButton label="Click Me" />

<!-- ✅ Bien -->
<AppButton>
  <Icon name="check" />
  Click Me
</AppButton>
```

#### 25. Conditional Rendering
**Descripción:** Uso correcto de v-if vs v-show  
**Severidad:** Info
- `v-if`: Rendering condicional (destruye/crea DOM)
- `v-show`: Display condicional (solo CSS)

#### 26. Teleport Usage
**Descripción:** Renderizado en diferente parte del DOM  
**Severidad:** Info

#### 27. Suspense Pattern
**Descripción:** Manejo de componentes asíncronos  
**Severidad:** Info

#### 28. v-for Key Pattern
**Descripción:** Uso obligatorio de :key con v-for  
**Severidad:** Warning

---

### 🔄 Additional Patterns (2 patrones)

#### 29. Ref vs Reactive
**Descripción:** Uso adecuado de ref vs reactive  
**Severidad:** Info
- `ref`: Valores primitivos y objetos simples
- `reactive`: Objetos complejos

#### 30. Watch vs WatchEffect
**Descripción:** Uso correcto de watchers  
**Severidad:** Info
- `watch`: Cuando necesitas valor anterior
- `watchEffect`: Auto-tracking de dependencias

---

## 🎯 Configuración

Archivo: `vue-patterns.config.json`

```json
{
  "rules": {
    "composables": {
      "enabled": true,
      "severity": "warning",
      "enforceNaming": true,
      "enforceOptionsObject": true,
      "enforceReturnReactive": true
    },
    "components": {
      "enabled": true,
      "severity": "warning",
      "maxComponentSize": 300
    },
    "antiPatterns": {
      "enabled": true,
      "severity": "error",
      "detectMixins": true,
      "detectVIfVFor": true,
      "detectPropMutation": true
    },
    "bestPractices": {
      "enabled": true,
      "severity": "info",
      "enforcePropValidation": true,
      "enforceEventNaming": true,
      "enforceScriptSetup": true
    },
    "template": {
      "enabled": true,
      "severity": "warning",
      "enforceVForKey": true
    }
  }
}
```

## 📦 Uso con MCP

### Herramientas Disponibles

1. **validate_vue_code** - Valida código Vue.js en memoria
2. **validate_vue_file** - Valida archivo .vue del sistema
3. **list_vue_patterns** - Lista todos los patrones configurados

### Ejemplo con Claude Desktop

```javascript
// Claude usa automáticamente las herramientas MCP
Usuario: "Valida este componente Vue.js con Pattern Police"
Claude: *usa validate_vue_code tool*
```

## 🧪 Testing

```bash
npm run build
npx tsx test-vue-patterns.ts
```

## 📚 Referencias

- [Vue.js Official Guide - Composables](https://vuejs.org/guide/reusability/composables.html)
- [Vue.js Style Guide](https://vuejs.org/style-guide/)
- [Vue.js 3 Design Patterns and Best Practices](https://www.packtpub.com/product/vuejs-3-design-patterns-and-best-practices/9781803238074)
