export type VueVersion = '2' | '3' | 'unknown';

export type VuePatternCategory = 
  | 'composables'
  | 'components'
  | 'antiPatterns'
  | 'bestPractices'
  | 'template'
  | 'lifecycle'
  | 'optionsAPI'
  | 'migration';

export type VuePatternName =
  | 'Composable Naming Convention'
  | 'Composable Options Object'
  | 'Composable Return Reactive'
  | 'Composable Flexible Arguments'
  | 'Composable Lifecycle Hooks'
  | 'Smart/Dumb Components'
  | 'List/Item Pattern'
  | 'Renderless Component'
  | 'Scoped Slots'
  | 'Named Slots'
  | 'Provide/Inject Pattern'
  | 'Mixin Usage (Anti-pattern)'
  | 'Mixin Usage (Vue 2 Pattern)'
  | 'v-if with v-for (Anti-pattern)'
  | 'Prop Mutation (Anti-pattern)'
  | '$parent Access (Anti-pattern)'
  | 'God Component (Anti-pattern)'
  | 'Missing v-for Key (Anti-pattern)'
  | 'Prop Validation'
  | 'Computed vs Methods'
  | 'Event Naming Convention'
  | 'Script Setup Usage'
  | 'TypeScript Usage'
  | 'Pass-Through Pattern'
  | 'Conditional Rendering'
  | 'Teleport Usage'
  | 'Suspense Pattern'
  | 'defineEmits Pattern'
  | 'defineProps Pattern'
  | 'Ref vs Reactive'
  | 'Watch vs WatchEffect'
  | 'Options API Structure'
  | 'Filter Usage (Vue 2 Pattern)'
  | 'Filter Deprecated (Migration)'
  | 'Event Bus Pattern'
  | 'Vuex Pattern'
  | 'Data Function Pattern'
  | 'Methods Organization'
  | 'Computed Properties Pattern'
  | 'Watch Pattern'
  | 'Vue 2 Lifecycle Hooks'
  | 'Global Mixin (Anti-pattern)';

export interface VuePatternConfig {
  rules: {
    composables?: {
      enabled: boolean;
      severity: 'error' | 'warning' | 'info';
      enforceNaming?: boolean;
      enforceOptionsObject?: boolean;
      enforceReturnReactive?: boolean;
    };
    components?: {
      enabled: boolean;
      severity: 'error' | 'warning' | 'info';
      enforceSmartDumb?: boolean;
      enforceListItem?: boolean;
      maxComponentSize?: number;
    };
    antiPatterns?: {
      enabled: boolean;
      severity: 'error' | 'warning' | 'info';
      detectMixins?: boolean;
      detectVIfVFor?: boolean;
      detectPropMutation?: boolean;
      detectParentAccess?: boolean;
    };
    bestPractices?: {
      enabled: boolean;
      severity: 'error' | 'warning' | 'info';
      enforcePropValidation?: boolean;
      enforceComputedOverMethods?: boolean;
      enforceEventNaming?: boolean;
      enforceScriptSetup?: boolean;
    };
    template?: {
      enabled: boolean;
      severity: 'error' | 'warning' | 'info';
      enforceVForKey?: boolean;
      enforcePassThrough?: boolean;
    };
  };
}

export interface VuePatternDetection {
  pattern: VuePatternName;
  category: VuePatternCategory;
  componentName: string;
  location: {
    line: number;
    column?: number;
    block?: 'template' | 'script' | 'style';
  };
  confidence: 'high' | 'medium' | 'low';
  evidence: string[];
  antiPatterns?: string[];
  suggestions?: string[];
}

export interface VuePatternViolation {
  rule: VuePatternName;
  category: VuePatternCategory;
  severity: 'error' | 'warning' | 'info';
  message: string;
  location: {
    line: number;
    column?: number;
    block?: 'template' | 'script' | 'style';
  };
  suggestion?: string;
}

export interface VueComponentInfo {
  name: string;
  version: VueVersion;
  isScriptSetup: boolean;
  hasTypeScript: boolean;
  usesOptionsAPI: boolean;
  usesCompositionAPI: boolean;
  template?: {
    content: string;
    ast?: any;
  };
  script?: {
    content: string;
    lang?: string;
  };
  scriptSetup?: {
    content: string;
    lang?: string;
  };
  styles: Array<{
    content: string;
    scoped: boolean;
    lang?: string;
  }>;
  imports: string[];
  exports: string[];
  props: string[];
  emits: string[];
  composables: string[];
  mixins: string[];
  filters: string[];
  data: string[];
  methods: string[];
  computed: string[];
  watch: string[];
}
