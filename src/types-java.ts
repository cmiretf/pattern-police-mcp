export type JavaPatternCategory =
  | "creational"       // GoF Creational Patterns
  | "structural"       // GoF Structural Patterns
  | "behavioral"       // GoF Behavioral Patterns
  | "enterprise"       // J2EE/Enterprise Patterns
  | "architectural"    // Architectural Patterns (MVC, etc)
  | "modern";          // Modern patterns (DI, Circuit Breaker, etc)

export type JavaPatternName =
  // Creational (5)
  | "singleton"
  | "factory-method"
  | "abstract-factory"
  | "builder"
  | "prototype"
  // Structural (7)
  | "adapter"
  | "bridge"
  | "composite"
  | "decorator"
  | "facade"
  | "flyweight"
  | "proxy"
  // Behavioral (11)
  | "chain-of-responsibility"
  | "command"
  | "interpreter"
  | "iterator"
  | "mediator"
  | "memento"
  | "observer"
  | "state"
  | "strategy"
  | "template-method"
  | "visitor"
  // Enterprise/J2EE (15)
  | "dao"
  | "repository"
  | "dto"
  | "service-layer"
  | "factory"
  | "mvc"
  | "front-controller"
  | "business-delegate"
  | "session-facade"
  | "service-locator"
  | "transfer-object-assembler"
  | "composite-entity"
  | "value-object"
  | "data-mapper"
  | "active-record"
  // Modern (6)
  | "dependency-injection"
  | "circuit-breaker"
  | "saga"
  | "cqrs"
  | "event-sourcing"
  | "unit-of-work";

export interface JavaPatternDetection {
  pattern: JavaPatternName;
  category: JavaPatternCategory;
  detected: boolean;
  confidence: "low" | "medium" | "high";
  location?: {
    className?: string;
    methodName?: string;
    line?: number;
  };
  evidence: string[];
  antipatterns?: string[];
}

export interface JavaPatternRule {
  enabled: boolean;
  severity: "error" | "warning" | "info";
  detectAntipatterns?: boolean;
  confidence?: "low" | "medium" | "high";
}

export interface JavaPatternConfig {
  rules: {
    // Creational Patterns
    creational?: {
      singleton?: JavaPatternRule;
      factoryMethod?: JavaPatternRule;
      abstractFactory?: JavaPatternRule;
      builder?: JavaPatternRule;
      prototype?: JavaPatternRule;
    };
    // Structural Patterns
    structural?: {
      adapter?: JavaPatternRule;
      bridge?: JavaPatternRule;
      composite?: JavaPatternRule;
      decorator?: JavaPatternRule;
      facade?: JavaPatternRule;
      flyweight?: JavaPatternRule;
      proxy?: JavaPatternRule;
    };
    // Behavioral Patterns
    behavioral?: {
      chainOfResponsibility?: JavaPatternRule;
      command?: JavaPatternRule;
      interpreter?: JavaPatternRule;
      iterator?: JavaPatternRule;
      mediator?: JavaPatternRule;
      memento?: JavaPatternRule;
      observer?: JavaPatternRule;
      state?: JavaPatternRule;
      strategy?: JavaPatternRule;
      templateMethod?: JavaPatternRule;
      visitor?: JavaPatternRule;
    };
    // Enterprise Patterns
    enterprise?: {
      dao?: JavaPatternRule;
      repository?: JavaPatternRule;
      dto?: JavaPatternRule;
      serviceLayer?: JavaPatternRule;
      factory?: JavaPatternRule;
      dataMapper?: JavaPatternRule;
      activeRecord?: JavaPatternRule;
      valueObject?: JavaPatternRule;
    };
    // Architectural Patterns
    architectural?: {
      mvc?: JavaPatternRule;
      frontController?: JavaPatternRule;
      businessDelegate?: JavaPatternRule;
      sessionFacade?: JavaPatternRule;
      serviceLocator?: JavaPatternRule;
      transferObjectAssembler?: JavaPatternRule;
      compositeEntity?: JavaPatternRule;
    };
    // Modern Patterns
    modern?: {
      dependencyInjection?: JavaPatternRule;
      circuitBreaker?: JavaPatternRule;
      saga?: JavaPatternRule;
      cqrs?: JavaPatternRule;
      eventSourcing?: JavaPatternRule;
      unitOfWork?: JavaPatternRule;
    };
  };
}

export interface JavaPatternViolation {
  rule: string;
  pattern: JavaPatternName;
  category: JavaPatternCategory;
  severity: "error" | "warning" | "info";
  message: string;
  line?: number;
  column?: number;
  className?: string;
  methodName?: string;
  suggestion?: string;
  evidence?: string[];
}
