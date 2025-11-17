# Vue 2 Pattern Examples

Este directorio contiene ejemplos de componentes Vue 2 que demuestran patrones comunes y válidos en Vue 2.

## Componentes de Ejemplo

### 1. OptionsAPIComponent.vue
Demuestra la estructura básica del Options API en Vue 2:
- **data()**: Define estado reactivo
- **props**: Recibe datos del padre con validación
- **computed**: Propiedades calculadas
- **watch**: Observadores de cambios
- **methods**: Métodos del componente
- **filters**: Filtros para formatear datos (característico de Vue 2)
- **mixins**: Reutilización de código (patrón válido en Vue 2)
- **Lifecycle hooks**: beforeDestroy, destroyed (Vue 2 específico)

### 2. ComplexVue2Component.vue
Ejemplo más complejo que incluye:
- **Múltiples mixins**: VuexMixin, LoggingMixin
- **Watchers avanzados**: Con `immediate` y `deep`
- **Filters múltiples**: capitalize, currency
- **Async methods**: fetchProducts con manejo de loading/error
- **Array methods**: Manipulación de listas
- **Vue 2 lifecycle**: created, beforeDestroy, destroyed

## Patrones Detectados

Pattern Police debería detectar los siguientes patrones en estos componentes:

### ✅ Patrones Válidos (Vue 2)
1. **Options API Structure**: data, methods, computed, watch
2. **Mixin Usage (Vue 2 Pattern)**: Patrón válido para reutilización de código
3. **Filter Usage (Vue 2 Pattern)**: Patrón válido para formatear datos
4. **Watch Pattern**: Observadores de propiedades reactivas
5. **Prop Validation**: Validación de tipos y required

### ⚠️ Notas de Migración
Al migrar a Vue 3:
- **Mixins** → Convertir a **composables**
- **Filters** → Usar **computed properties** o **methods**
- **beforeDestroy/destroyed** → **beforeUnmount/unmounted**
- **Event Bus** → Usar bibliotecas como **mitt**

## Diferencias Vue 2 vs Vue 3

| Característica | Vue 2 | Vue 3 |
|----------------|-------|-------|
| API principal | Options API | Composition API (preferida) |
| Mixins | ✅ Patrón válido | ⚠️ Deprecado (usar composables) |
| Filters | ✅ Soportado | ❌ Removido |
| Lifecycle | beforeDestroy, destroyed | beforeUnmount, unmounted |
| Event Bus | ✅ Común ($on, $off) | ❌ Removido (usar mitt/tiny-emitter) |
| Template | Single root | ✅ Múltiples root (fragments) |
