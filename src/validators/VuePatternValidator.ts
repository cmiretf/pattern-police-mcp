import * as compiler from '@vue/compiler-sfc';
import {
  VuePatternConfig,
  VuePatternDetection,
  VuePatternViolation,
  VueComponentInfo,
  VuePatternCategory,
  VuePatternName,
  VueVersion
} from '../types-vue.js';

export class VuePatternValidator {
  private config: VuePatternConfig;

  constructor(config: VuePatternConfig) {
    this.config = config;
  }

  private parseSFC(code: string, filename: string = 'Component.vue'): compiler.SFCDescriptor | null {
    try {
      const { descriptor, errors } = compiler.parse(code, {
        filename,
        sourceMap: false
      });

      if (errors.length > 0) {
        console.error('Parse errors:', errors);
        return null;
      }

      return descriptor;
    } catch (error) {
      console.error('Failed to parse SFC:', error);
      return null;
    }
  }

  private extractComponentInfo(descriptor: compiler.SFCDescriptor): VueComponentInfo {
    const scriptContent = descriptor.script?.content || '';
    const scriptSetupContent = descriptor.scriptSetup?.content || '';
    
    const info: VueComponentInfo = {
      name: descriptor.filename.replace(/\.vue$/, '').split('/').pop() || 'Unknown',
      version: 'unknown',
      isScriptSetup: !!descriptor.scriptSetup,
      hasTypeScript: descriptor.script?.lang === 'ts' || descriptor.scriptSetup?.lang === 'ts',
      usesOptionsAPI: false,
      usesCompositionAPI: false,
      imports: [],
      exports: [],
      props: [],
      emits: [],
      composables: [],
      mixins: [],
      filters: [],
      data: [],
      methods: [],
      computed: [],
      watch: [],
      styles: descriptor.styles.map(style => ({
        content: style.content,
        scoped: style.scoped || false,
        lang: style.lang
      }))
    };

    if (descriptor.template) {
      info.template = {
        content: descriptor.template.content,
        ast: descriptor.template.ast
      };
    }

    if (descriptor.script) {
      info.script = {
        content: descriptor.script.content,
        lang: descriptor.script.lang
      };
      this.extractScriptInfo(descriptor.script.content, info);
      this.extractOptionsAPIInfo(descriptor.script.content, info);
    }

    if (descriptor.scriptSetup) {
      info.scriptSetup = {
        content: descriptor.scriptSetup.content,
        lang: descriptor.scriptSetup.lang
      };
      this.extractScriptInfo(descriptor.scriptSetup.content, info);
    }

    info.version = this.detectVueVersion(info, scriptContent, scriptSetupContent);
    info.usesOptionsAPI = this.usesOptionsAPI(scriptContent);
    info.usesCompositionAPI = this.usesCompositionAPI(scriptContent, scriptSetupContent);

    return info;
  }

  private detectVueVersion(info: VueComponentInfo, scriptContent: string, scriptSetupContent: string): VueVersion {
    if (info.isScriptSetup) {
      return '3';
    }
    
    if (/defineProps|defineEmits|defineExpose/.test(scriptContent + scriptSetupContent)) {
      return '3';
    }
    
    if (/<Teleport|<Suspense/.test(info.template?.content || '')) {
      return '3';
    }
    
    if (/import\s+{\s*[^}]*(ref|reactive|computed|onMounted|onUnmounted|watch|watchEffect|toRefs?|unref)[^}]*}\s+from\s+['"]vue['"]/.test(scriptContent)) {
      return '3';
    }
    
    if (/setup\s*\(\s*\)\s*{/.test(scriptContent)) {
      return '3';
    }
    
    if (info.filters.length > 0) {
      return '2';
    }
    
    if (/beforeDestroy|destroyed/.test(scriptContent)) {
      return '2';
    }
    
    if (info.usesOptionsAPI && !info.usesCompositionAPI) {
      return '2';
    }
    
    return 'unknown';
  }

  private hasVue3CompositionAPISyntax(content: string): boolean {
    return /setup\s*\(\s*\)\s*{/.test(content) || 
           /onBeforeUnmount|onUnmounted/.test(content);
  }

  private usesOptionsAPI(scriptContent: string): boolean {
    return /data\s*\(\s*\)\s*{|methods\s*:|computed\s*:|watch\s*:|mixins\s*:|filters\s*:/.test(scriptContent);
  }

  private usesCompositionAPI(scriptContent: string, scriptSetupContent: string): boolean {
    return /setup\s*\(\s*\)\s*{/.test(scriptContent) ||
           scriptSetupContent.length > 0 ||
           /import\s+{\s*[^}]*(ref|reactive|computed|onMounted)[^}]*}\s+from\s+['"]vue['"]/.test(scriptContent);
  }

  private extractOptionsAPIInfo(scriptContent: string, info: VueComponentInfo): void {
    const exportMatch = scriptContent.match(/export\s+default\s+{([\s\S]+)};?\s*$/);
    if (!exportMatch) {
      return;
    }

    const optionsContent = exportMatch[1];

    const mixinsMatch = optionsContent.match(/mixins\s*:\s*\[([\s\S]*?)\]/);
    if (mixinsMatch) {
      const mixinNames = mixinsMatch[1].match(/\w+/g);
      if (mixinNames) {
        info.mixins.push(...mixinNames);
      }
    }

    const filtersMatch = optionsContent.match(/filters\s*:\s*{([\s\S]*?)(?=,\s*(?:data|methods|computed|watch|props|mounted|created|}\s*$))/);
    if (filtersMatch) {
      const filterNames = filtersMatch[1].match(/^\s*(\w+)\s*\(/gm);
      if (filterNames) {
        info.filters.push(...filterNames.map(f => f.trim().replace(/\s*\($/, '')));
      }
    }

    const dataMatch = optionsContent.match(/data\s*\(\s*\)\s*{[\s\S]*?return\s*{([\s\S]*?)}/);
    if (dataMatch) {
      const dataNames = dataMatch[1].match(/(\w+)\s*:/g);
      if (dataNames) {
        info.data.push(...dataNames.map(d => d.replace(/\s*:$/, '')));
      }
    }

    const methodsMatch = optionsContent.match(/methods\s*:\s*{([\s\S]*?)(?=,\s*(?:computed|watch|mounted|created|beforeDestroy|}\s*$))/);
    if (methodsMatch) {
      const methodNames = methodsMatch[1].match(/(\w+)\s*\(/g);
      if (methodNames) {
        info.methods.push(...methodNames.map(m => m.replace(/\s*\($/, '')));
      }
    }

    const computedMatch = optionsContent.match(/computed\s*:\s*{([\s\S]*?)(?=,\s*(?:watch|methods|mounted|created|}\s*$))/);
    if (computedMatch) {
      const computedNames = computedMatch[1].match(/(\w+)\s*\(\s*\)\s*{|(\w+)\s*:/g);
      if (computedNames) {
        info.computed.push(...computedNames.map(c => c.replace(/\s*(\(|\:).*$/, '')));
      }
    }

    const watchMatch = optionsContent.match(/watch\s*:\s*{([\s\S]*?)(?=,\s*(?:computed|methods|mounted|created|}\s*$))/);
    if (watchMatch) {
      const watchNames = watchMatch[1].match(/['"]?(\w+)['"]?\s*\(/g);
      if (watchNames) {
        info.watch.push(...watchNames.map(w => w.replace(/['"]/g, '').replace(/\s*\($/, '')));
      }
    }

    const propsMatch = optionsContent.match(/props\s*:\s*(?:{([\s\S]*?)}|\[([\s\S]*?)\])/);
    if (propsMatch && info.props.length === 0) {
      if (propsMatch[1]) {
        const propNames = propsMatch[1].match(/(\w+)\s*:/g);
        if (propNames) {
          info.props.push(...propNames.map(p => p.replace(/\s*:$/, '')));
        }
      } else if (propsMatch[2]) {
        const propNames = propsMatch[2].match(/['"](\w+)['"]/g);
        if (propNames) {
          info.props.push(...propNames.map(p => p.replace(/['"]/g, '')));
        }
      }
    }
  }

  private extractScriptInfo(scriptContent: string, info: VueComponentInfo): void {
    const importRegex = /import\s+(?:{[^}]+}|[\w]+)\s+from\s+['"]([^'"]+)['"]/g;
    let match;
    while ((match = importRegex.exec(scriptContent)) !== null) {
      info.imports.push(match[1]);
      if (match[0].includes('use') && match[0].includes('{')) {
        const composableMatch = match[0].match(/use\w+/g);
        if (composableMatch) {
          info.composables.push(...composableMatch);
        }
      }
    }

    const definePropsRegex = /defineProps\s*<\s*([^>]+)\s*>\s*\(\)|defineProps\s*<\s*([^>]+)\s*>|defineProps\s*\(\s*{([^}]+)}/gs;
    while ((match = definePropsRegex.exec(scriptContent)) !== null) {
      const propsTypeName = match[1] || match[2];
      if (propsTypeName && propsTypeName.trim().length < 50) {
        const interfaceRegex = new RegExp(`interface\\s+${propsTypeName.trim()}\\s*{([^}]+)}`, 's');
        const interfaceMatch = scriptContent.match(interfaceRegex);
        if (interfaceMatch) {
          const propNames = interfaceMatch[1].match(/(\w+)(?=\s*:|\s*\?)/g);
          if (propNames) {
            info.props.push(...propNames);
          }
        } else {
          info.props.push('props');
        }
      } else if (match[3]) {
        const propNames = match[3].match(/(\w+)(?=\s*:|\s*\?)/g);
        if (propNames) {
          info.props.push(...propNames);
        }
      }
    }

    const defineEmitsRegex = /defineEmits\s*<\s*{([^}]+)}\s*>|defineEmits\s*\(\s*\[([^\]]+)\]/gs;
    while ((match = defineEmitsRegex.exec(scriptContent)) !== null) {
      const emitsContent = match[1] || match[2];
      if (emitsContent) {
        const eventNames = emitsContent.match(/['"]([^'"]+)['"]/g);
        if (eventNames) {
          info.emits.push(...eventNames.map(e => e.replace(/['"]/g, '')));
        }
      }
    }
  }

  public validate(code: string, filename: string = 'Component.vue'): {
    detections: VuePatternDetection[];
    violations: VuePatternViolation[];
  } {
    const detections: VuePatternDetection[] = [];
    const violations: VuePatternViolation[] = [];

    const descriptor = this.parseSFC(code, filename);
    if (!descriptor) {
      violations.push({
        rule: 'Mixin Usage (Anti-pattern)',
        category: 'antiPatterns',
        severity: 'error',
        message: 'Failed to parse Vue component',
        location: { line: 1, column: 1 }
      });
      return { detections, violations };
    }

    const componentInfo = this.extractComponentInfo(descriptor);

    if (this.config.rules.composables?.enabled) {
      detections.push(...this.detectComposablePatterns(componentInfo, descriptor));
    }

    if (this.config.rules.components?.enabled) {
      detections.push(...this.detectComponentPatterns(componentInfo, descriptor));
    }

    if (componentInfo.usesOptionsAPI && componentInfo.version === '2') {
      detections.push(...this.detectOptionsAPIPatterns(componentInfo));
    }

    if (this.config.rules.antiPatterns?.enabled) {
      violations.push(...this.detectAntiPatterns(componentInfo, descriptor));
    }

    if (this.config.rules.bestPractices?.enabled) {
      violations.push(...this.detectBestPractices(componentInfo, descriptor));
    }

    if (this.config.rules.template?.enabled) {
      violations.push(...this.detectTemplatePatterns(componentInfo, descriptor));
    }

    return { detections, violations };
  }

  private detectComposablePatterns(info: VueComponentInfo, descriptor: compiler.SFCDescriptor): VuePatternDetection[] {
    const detections: VuePatternDetection[] = [];
    const scriptContent = info.scriptSetup?.content || info.script?.content || '';

    const composableFunctionRegex = /(?:export\s+)?function\s+(use[A-Z]\w*)\s*\(/g;
    let match;
    while ((match = composableFunctionRegex.exec(scriptContent)) !== null) {
      const composableName = match[1];
      const evidence: string[] = [];
      const antiPatterns: string[] = [];
      const suggestions: string[] = [];

      evidence.push(`Función composable: ${composableName}`);

      if (/^use[A-Z]/.test(composableName)) {
        evidence.push('Sigue convención de naming (use prefix)');
      } else {
        antiPatterns.push('No usa prefijo "use"');
      }

      const functionBody = this.extractFunctionBody(scriptContent, match.index);
      
      if (this.hasReactiveReturn(functionBody)) {
        evidence.push('Retorna valores reactivos (ref, reactive, computed)');
      } else {
        suggestions.push('Considerar retornar valores reactivos');
      }

      if (this.hasOptionsParameter(functionBody)) {
        evidence.push('Usa patrón options object para configuración');
      }

      if (this.hasFlexibleArguments(functionBody)) {
        evidence.push('Acepta argumentos flexibles (ref/unref)');
      }

      if (this.hasLifecycleHooks(functionBody)) {
        evidence.push('Usa lifecycle hooks (onMounted, onUnmounted, etc.)');
      }

      detections.push({
        pattern: 'Composable Naming Convention',
        category: 'composables',
        componentName: composableName,
        location: { line: this.getLineNumber(scriptContent, match.index), block: 'script' },
        confidence: antiPatterns.length === 0 ? 'high' : 'medium',
        evidence,
        antiPatterns: antiPatterns.length > 0 ? antiPatterns : undefined,
        suggestions: suggestions.length > 0 ? suggestions : undefined
      });
    }

    return detections;
  }

  private detectComponentPatterns(info: VueComponentInfo, descriptor: compiler.SFCDescriptor): VuePatternDetection[] {
    const detections: VuePatternDetection[] = [];

    if (info.isScriptSetup) {
      const evidence: string[] = ['Usa <script setup> (Composition API)'];
      
      if (info.props.length > 0) {
        evidence.push(`Define ${info.props.length} prop(s) con defineProps`);
      }
      
      if (info.emits.length > 0) {
        evidence.push(`Define ${info.emits.length} evento(s) con defineEmits`);
      }

      const scriptContent = info.scriptSetup?.content || '';
      const hasBusinessLogic = /(?:const|let|var)\s+\w+\s*=\s*(?:computed|ref|reactive|watch)/.test(scriptContent);
      const hasTemplateRefs = /(?:const|let)\s+\w+\s*=\s*ref<HTML/.test(scriptContent);

      if (hasBusinessLogic && info.props.length > 0) {
        detections.push({
          pattern: 'Smart/Dumb Components',
          category: 'components',
          componentName: info.name,
          location: { line: 1, block: 'script' },
          confidence: 'medium',
          evidence: [
            'Componente Smart (contiene lógica de negocio)',
            ...evidence
          ],
          suggestions: ['Considerar separar lógica en composable si crece mucho']
        });
      } else if (info.props.length > 0 && !hasBusinessLogic) {
        detections.push({
          pattern: 'Smart/Dumb Components',
          category: 'components',
          componentName: info.name,
          location: { line: 1, block: 'script' },
          confidence: 'high',
          evidence: [
            'Componente Dumb/Presentacional (solo recibe props)',
            ...evidence
          ]
        });
      }
    }

    if (descriptor.template) {
      const templateContent = descriptor.template.content;
      
      if (this.hasSlots(templateContent)) {
        const slotTypes: string[] = [];
        if (/<slot\s+name=/.test(templateContent)) {
          slotTypes.push('Named slots detectados');
        }
        if (/<slot\s+[^>]*:/.test(templateContent) || /<slot\s+v-bind/.test(templateContent)) {
          slotTypes.push('Scoped slots detectados');
        }

        if (slotTypes.length > 0) {
          detections.push({
            pattern: 'Scoped Slots',
            category: 'components',
            componentName: info.name,
            location: { line: 1, block: 'template' },
            confidence: 'high',
            evidence: slotTypes
          });
        }
      }

      if (this.isRenderlessComponent(info, templateContent)) {
        detections.push({
          pattern: 'Renderless Component',
          category: 'components',
          componentName: info.name,
          location: { line: 1, block: 'template' },
          confidence: 'high',
          evidence: [
            'Template contiene solo <slot>',
            'Proporciona lógica sin UI (render props pattern)'
          ]
        });
      }
    }

    return detections;
  }

  private detectOptionsAPIPatterns(info: VueComponentInfo): VuePatternDetection[] {
    const detections: VuePatternDetection[] = [];

    if (info.data.length > 0 || info.methods.length > 0 || info.computed.length > 0) {
      const evidence: string[] = ['Usa Options API (Vue 2 style)'];
      
      if (info.data.length > 0) {
        evidence.push(`Define ${info.data.length} propiedades en data()`);
      }
      
      if (info.methods.length > 0) {
        evidence.push(`Define ${info.methods.length} método(s)`);
      }
      
      if (info.computed.length > 0) {
        evidence.push(`Define ${info.computed.length} computed propert(y/ies)`);
      }
      
      if (info.watch.length > 0) {
        evidence.push(`Define ${info.watch.length} watcher(s)`);
      }

      detections.push({
        pattern: 'Options API Structure',
        category: 'optionsAPI',
        componentName: info.name,
        location: { line: 1, block: 'script' },
        confidence: 'high',
        evidence
      });
    }

    if (info.mixins.length > 0 && info.version === '2') {
      detections.push({
        pattern: 'Mixin Usage (Vue 2 Pattern)',
        category: 'optionsAPI',
        componentName: info.name,
        location: { line: 1, block: 'script' },
        confidence: 'high',
        evidence: [
          `Usa ${info.mixins.length} mixin(s): ${info.mixins.join(', ')}`,
          'Patrón válido en Vue 2 para reutilización de código'
        ],
        suggestions: ['Al migrar a Vue 3, considerar convertir a composables']
      });
    }

    if (info.filters.length > 0 && info.version === '2') {
      detections.push({
        pattern: 'Filter Usage (Vue 2 Pattern)',
        category: 'optionsAPI',
        componentName: info.name,
        location: { line: 1, block: 'script' },
        confidence: 'high',
        evidence: [
          `Define ${info.filters.length} filter(s): ${info.filters.join(', ')}`,
          'Patrón válido en Vue 2 para formatear datos en templates'
        ],
        suggestions: ['Al migrar a Vue 3, convertir a computed properties o métodos']
      });
    }

    if (info.watch.length > 0) {
      detections.push({
        pattern: 'Watch Pattern',
        category: 'optionsAPI',
        componentName: info.name,
        location: { line: 1, block: 'script' },
        confidence: 'high',
        evidence: [
          `Define ${info.watch.length} watcher(s) para propiedades reactivas`,
          `Watchers: ${info.watch.join(', ')}`
        ]
      });
    }

    return detections;
  }

  private detectAntiPatterns(info: VueComponentInfo, descriptor: compiler.SFCDescriptor): VuePatternViolation[] {
    const violations: VuePatternViolation[] = [];
    const scriptContent = info.script?.content || '';

    if (this.config.rules.antiPatterns?.detectMixins && info.mixins.length > 0) {
      if (info.version === '3') {
        violations.push({
          rule: 'Mixin Usage (Anti-pattern)',
          category: 'antiPatterns',
          severity: 'warning',
          message: 'Uso de mixins detectado. En Vue 3, preferir composables',
          location: { line: this.getLineNumber(scriptContent, scriptContent.indexOf('mixins')), block: 'script' },
          suggestion: 'Migrar a composables usando Composition API'
        });
      }
    }
    
    if (info.version === '3' && info.filters.length > 0) {
      violations.push({
        rule: 'Filter Deprecated (Migration)',
        category: 'migration',
        severity: 'warning',
        message: 'Filters han sido removidos en Vue 3',
        location: { line: this.getLineNumber(scriptContent, scriptContent.indexOf('filters')), block: 'script' },
        suggestion: 'Usar computed properties o métodos en su lugar'
      });
    }

    if (descriptor.template && this.config.rules.antiPatterns?.detectVIfVFor) {
      const templateContent = descriptor.template.content;
      const vIfVForRegex = /<\w+[^>]*v-for[^>]*v-if|<\w+[^>]*v-if[^>]*v-for/g;
      let match;
      while ((match = vIfVForRegex.exec(templateContent)) !== null) {
        violations.push({
          rule: 'v-if with v-for (Anti-pattern)',
          category: 'antiPatterns',
          severity: 'warning',
          message: 'v-if y v-for en el mismo elemento es un anti-patrón',
          location: { line: this.getLineNumber(templateContent, match.index), block: 'template' },
          suggestion: 'Usar computed property para filtrar la lista, o envolver en template'
        });
      }
    }

    if (this.config.rules.antiPatterns?.detectPropMutation) {
      const scriptContent = info.scriptSetup?.content || info.script?.content || '';
      if (info.props.length > 0) {
        info.props.forEach(prop => {
          const mutationRegex = new RegExp(`${prop}(?:\\.value)?\\s*=`, 'g');
          if (mutationRegex.test(scriptContent)) {
            violations.push({
              rule: 'Prop Mutation (Anti-pattern)',
              category: 'antiPatterns',
              severity: 'error',
              message: `Mutación directa de prop "${prop}" detectada`,
              location: { line: this.getLineNumber(scriptContent, scriptContent.search(mutationRegex)), block: 'script' },
              suggestion: 'Emitir evento para que el componente padre actualice el valor'
            });
          }
        });
      }
    }

    if (this.config.rules.antiPatterns?.detectParentAccess) {
      const scriptContent = info.scriptSetup?.content || info.script?.content || '';
      if (/\$parent|\$children|\$root/.test(scriptContent)) {
        violations.push({
          rule: '$parent Access (Anti-pattern)',
          category: 'antiPatterns',
          severity: 'warning',
          message: 'Acceso a $parent, $children o $root detectado',
          location: { line: 1, block: 'script' },
          suggestion: 'Usar props, eventos o provide/inject en su lugar'
        });
      }
    }

    const maxSize = this.config.rules.components?.maxComponentSize || 300;
    const totalLines = (info.scriptSetup?.content || info.script?.content || '').split('\n').length;
    if (totalLines > maxSize) {
      violations.push({
        rule: 'God Component (Anti-pattern)',
        category: 'antiPatterns',
        severity: 'warning',
        message: `Componente muy grande (${totalLines} líneas, máximo recomendado: ${maxSize})`,
        location: { line: 1, block: 'script' },
        suggestion: 'Extraer lógica a composables o dividir en componentes más pequeños'
      });
    }

    return violations;
  }

  private detectBestPractices(info: VueComponentInfo, descriptor: compiler.SFCDescriptor): VuePatternViolation[] {
    const violations: VuePatternViolation[] = [];

    if (this.config.rules.bestPractices?.enforcePropValidation && info.props.length > 0) {
      const scriptContent = info.scriptSetup?.content || info.script?.content || '';
      const hasValidation = /defineProps</.test(scriptContent) || /type:\s*(?:String|Number|Boolean|Array|Object|Function)/.test(scriptContent);
      
      if (!hasValidation) {
        violations.push({
          rule: 'Prop Validation',
          category: 'bestPractices',
          severity: 'info',
          message: 'Props sin validación de tipos detectadas',
          location: { line: 1, block: 'script' },
          suggestion: 'Agregar tipos a las props usando TypeScript o runtime validation'
        });
      }
    }

    if (this.config.rules.bestPractices?.enforceEventNaming && info.emits.length > 0) {
      info.emits.forEach(event => {
        if (!/^[a-z]+(-[a-z]+)*$/.test(event)) {
          violations.push({
            rule: 'Event Naming Convention',
            category: 'bestPractices',
            severity: 'info',
            message: `Evento "${event}" no usa kebab-case`,
            location: { line: 1, block: 'script' },
            suggestion: 'Usar kebab-case para nombres de eventos (ej: "update-value")'
          });
        }
      });
    }

    if (this.config.rules.bestPractices?.enforceScriptSetup && !info.isScriptSetup && descriptor.script) {
      violations.push({
        rule: 'Script Setup Usage',
        category: 'bestPractices',
        severity: 'info',
        message: 'Componente no usa <script setup>',
        location: { line: 1, block: 'script' },
        suggestion: 'Considerar migrar a <script setup> para mejor DX y performance'
      });
    }

    return violations;
  }

  private detectTemplatePatterns(info: VueComponentInfo, descriptor: compiler.SFCDescriptor): VuePatternViolation[] {
    const violations: VuePatternViolation[] = [];

    if (descriptor.template && this.config.rules.template?.enforceVForKey) {
      const templateContent = descriptor.template.content;
      const vForWithoutKey = /<\w+[^>]*v-for(?![^>]*:key)(?![^>]*v-bind:key)/g;
      let match;
      while ((match = vForWithoutKey.exec(templateContent)) !== null) {
        violations.push({
          rule: 'Missing v-for Key (Anti-pattern)',
          category: 'template',
          severity: 'warning',
          message: 'v-for sin :key detectado',
          location: { line: this.getLineNumber(templateContent, match.index), block: 'template' },
          suggestion: 'Siempre usar :key con v-for para performance y correctitud'
        });
      }
    }

    return violations;
  }

  private extractFunctionBody(content: string, startIndex: number): string {
    let braceCount = 0;
    let inFunction = false;
    let body = '';

    for (let i = startIndex; i < content.length; i++) {
      const char = content[i];
      
      if (char === '{') {
        braceCount++;
        inFunction = true;
      } else if (char === '}') {
        braceCount--;
        if (braceCount === 0 && inFunction) {
          body += char;
          break;
        }
      }
      
      if (inFunction) {
        body += char;
      }
    }

    return body;
  }

  private hasReactiveReturn(functionBody: string): boolean {
    return /return\s*{[^}]*(?:ref|reactive|computed|readonly)/.test(functionBody);
  }

  private hasOptionsParameter(functionBody: string): boolean {
    return /function\s+\w+\s*\(\s*(?:options|config|params)\s*[=:]/.test(functionBody) ||
           /\(\s*(?:options|config|params)\s*[=:]/.test(functionBody);
  }

  private hasFlexibleArguments(functionBody: string): boolean {
    return /(?:unref|toRef|toRefs)\s*\(/.test(functionBody);
  }

  private hasLifecycleHooks(functionBody: string): boolean {
    return /(?:onMounted|onUnmounted|onBeforeMount|onBeforeUnmount|onUpdated|onBeforeUpdate)\s*\(/.test(functionBody);
  }

  private hasSlots(templateContent: string): boolean {
    return /<slot[\s>]/.test(templateContent);
  }

  private isRenderlessComponent(info: VueComponentInfo, templateContent: string): boolean {
    const cleanTemplate = templateContent.replace(/<!--[\s\S]*?-->/g, '').trim();
    return /^<slot[\s/>]/.test(cleanTemplate) && 
           (info.scriptSetup !== undefined || info.script !== undefined) &&
           !/<\w+(?:\s+[^>]*)?>(?!<slot)/.test(cleanTemplate);
  }

  private getLineNumber(content: string, index: number): number {
    return content.substring(0, index).split('\n').length;
  }
}
