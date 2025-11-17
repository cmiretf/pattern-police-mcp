import { parse, BaseJavaCstVisitorWithDefaults } from "java-parser";
import type {
  JavaPatternConfig,
  JavaPatternViolation,
  JavaPatternDetection,
  JavaPatternName,
  JavaPatternCategory,
} from "../types-java.js";

interface ClassInfo {
  name: string;
  isInterface: boolean;
  isAbstract: boolean;
  methods: MethodInfo[];
  fields: FieldInfo[];
  implements: string[];
  extends: string | null;
  annotations: string[];
  modifiers: string[];
}

interface MethodInfo {
  name: string;
  isAbstract: boolean;
  isStatic: boolean;
  isPrivate: boolean;
  isPublic: boolean;
  returnType: string | null;
  parameters: ParameterInfo[];
  annotations: string[];
}

interface FieldInfo {
  name: string;
  type: string;
  isStatic: boolean;
  isFinal: boolean;
  isPrivate: boolean;
  modifiers: string[];
}

interface ParameterInfo {
  name: string;
  type: string;
}

export class JavaPatternValidator {
  private config: JavaPatternConfig;
  private classes: ClassInfo[] = [];
  private detections: JavaPatternDetection[] = [];

  constructor(config: JavaPatternConfig) {
    this.config = config;
  }

  validateCode(code: string, filename: string = "source.java"): JavaPatternViolation[] {
    try {
      const cst = parse(code);
      this.extractClassInfo(cst);
      this.detectAllPatterns();
      return this.generateViolations(filename);
    } catch (error) {
      return [{
        rule: "parse-error",
        pattern: "singleton" as JavaPatternName,
        category: "creational" as JavaPatternCategory,
        severity: "error",
        message: `Error al parsear código Java: ${error instanceof Error ? error.message : String(error)}`,
      }];
    }
  }

  private extractClassInfo(cst: any): void {
    this.classes = [];
    
    const visitor = new class extends BaseJavaCstVisitorWithDefaults {
      classes: ClassInfo[] = [];
      currentClass: ClassInfo | null = null;

      normalClassDeclaration(ctx: any) {
        const className = this.extractIdentifier(ctx.typeIdentifier);
        const classInfo: ClassInfo = {
          name: className,
          isInterface: false,
          isAbstract: this.hasModifier(ctx, "abstract"),
          methods: [],
          fields: [],
          implements: this.extractImplements(ctx),
          extends: this.extractExtends(ctx),
          annotations: this.extractAnnotations(ctx),
          modifiers: this.extractModifiers(ctx),
        };

        this.currentClass = classInfo;
        super.normalClassDeclaration(ctx);
        this.classes.push(classInfo);
        this.currentClass = null;
      }

      interfaceDeclaration(ctx: any) {
        const interfaceName = this.extractIdentifier(ctx.typeIdentifier);
        const interfaceInfo: ClassInfo = {
          name: interfaceName,
          isInterface: true,
          isAbstract: false,
          methods: [],
          fields: [],
          implements: [],
          extends: this.extractExtendsInterface(ctx),
          annotations: this.extractAnnotations(ctx),
          modifiers: [],
        };

        this.currentClass = interfaceInfo;
        super.interfaceDeclaration(ctx);
        this.classes.push(interfaceInfo);
        this.currentClass = null;
      }

      methodDeclaration(ctx: any) {
        if (this.currentClass) {
          const methodName = this.extractIdentifier(ctx.methodHeader?.[0]?.children?.methodDeclarator?.[0]?.children?.Identifier);
          const method: MethodInfo = {
            name: methodName,
            isAbstract: this.hasModifier(ctx, "abstract"),
            isStatic: this.hasModifier(ctx, "static"),
            isPrivate: this.hasModifier(ctx, "private"),
            isPublic: this.hasModifier(ctx, "public"),
            returnType: this.extractReturnType(ctx),
            parameters: this.extractParameters(ctx),
            annotations: this.extractMethodAnnotations(ctx),
          };
          this.currentClass.methods.push(method);
        }
        super.methodDeclaration(ctx);
      }

      constructorDeclaration(ctx: any) {
        if (this.currentClass) {
          const constructorName = this.currentClass.name;
          const isPrivate = ctx.constructorModifier?.some((m: any) => 
            m.children?.Private?.[0]?.image === "private"
          ) || false;
          const isPublic = ctx.constructorModifier?.some((m: any) => 
            m.children?.Public?.[0]?.image === "public"
          ) || false;
          
          const constructor: MethodInfo = {
            name: constructorName,
            isAbstract: false,
            isStatic: false,
            isPrivate: isPrivate,
            isPublic: isPublic,
            returnType: null,
            parameters: this.extractConstructorParameters(ctx),
            annotations: [],
          };
          this.currentClass.methods.push(constructor);
        }
        super.constructorDeclaration(ctx);
      }

      fieldDeclaration(ctx: any) {
        if (this.currentClass) {
          const fields = this.extractFieldDeclarations(ctx);
          this.currentClass.fields.push(...fields);
        }
        super.fieldDeclaration(ctx);
      }

      private extractIdentifier(node: any): string {
        if (!node) return "Unknown";
        if (Array.isArray(node) && node[0]?.children?.Identifier) {
          return node[0].children.Identifier[0].image;
        }
        if (node.children?.Identifier) {
          return node.children.Identifier[0].image;
        }
        if (node.image) return node.image;
        if (Array.isArray(node) && node[0]?.image) {
          return node[0].image;
        }
        return "Unknown";
      }

      private hasModifier(ctx: any, modifier: string): boolean {
        const modifiers = ctx.classModifier || ctx.methodModifier || ctx.fieldModifier || [];
        return modifiers.some((m: any) => {
          return Object.keys(m.children || {}).some(key => {
            if (key.toLowerCase() === modifier.toLowerCase() && m.children[key]?.[0]?.image) {
              return true;
            }
            return false;
          });
        });
      }

      private extractModifiers(ctx: any): string[] {
        const modifiers: string[] = [];
        const modifierList = ctx.classModifier || [];
        modifierList.forEach((m: any) => {
          Object.keys(m.children || {}).forEach(key => {
            if (m.children[key]?.[0]?.image) {
              modifiers.push(key.toLowerCase());
            }
          });
        });
        return modifiers;
      }

      private extractAnnotations(ctx: any): string[] {
        const annotations: string[] = [];
        const annotationList = ctx.classModifier || [];
        annotationList.forEach((m: any) => {
          if (m.children?.annotation) {
            m.children.annotation.forEach((ann: any) => {
              const name = this.extractIdentifier(ann.children?.typeName);
              if (name !== "Unknown") annotations.push(name);
            });
          }
        });
        return annotations;
      }

      private extractMethodAnnotations(ctx: any): string[] {
        const annotations: string[] = [];
        const modifiers = ctx.methodModifier || [];
        modifiers.forEach((m: any) => {
          if (m.children?.annotation) {
            m.children.annotation.forEach((ann: any) => {
              const name = this.extractIdentifier(ann.children?.typeName);
              if (name !== "Unknown") annotations.push(name);
            });
          }
        });
        return annotations;
      }

      private extractImplements(ctx: any): string[] {
        const result: string[] = [];
        const superInterfaces = ctx.classExtends?.[0]?.children?.superinterfaces;
        if (superInterfaces) {
          const typeList = superInterfaces[0]?.children?.interfaceTypeList;
          if (typeList) {
            typeList.forEach((type: any) => {
              const name = this.extractIdentifier(type.children?.classType?.[0]?.children?.typeIdentifier);
              if (name !== "Unknown") result.push(name);
            });
          }
        }
        return result;
      }

      private extractExtends(ctx: any): string | null {
        const superclass = ctx.classExtends?.[0]?.children?.superclass;
        if (superclass) {
          const name = this.extractIdentifier(superclass[0]?.children?.classType?.[0]?.children?.typeIdentifier);
          return name !== "Unknown" ? name : null;
        }
        return null;
      }

      private extractExtendsInterface(ctx: any): string | null {
        const extendsInterfaces = ctx.extendsInterfaces;
        if (extendsInterfaces && extendsInterfaces[0]?.children?.interfaceTypeList) {
          const typeList = extendsInterfaces[0].children.interfaceTypeList;
          if (typeList.length > 0) {
            const name = this.extractIdentifier(typeList[0].children?.classType?.[0]?.children?.typeIdentifier);
            return name !== "Unknown" ? name : null;
          }
        }
        return null;
      }

      private extractReturnType(ctx: any): string | null {
        const result = ctx.methodHeader?.[0]?.children?.result;
        if (result) {
          if (result[0]?.children?.Void) return "void";
          if (result[0]?.children?.unannType) {
            const type = result[0].children.unannType[0];
            return this.extractTypeName(type);
          }
        }
        return null;
      }

      private extractTypeName(typeNode: any): string {
        if (typeNode?.children?.primitiveType) {
          return Object.keys(typeNode.children.primitiveType[0]?.children || {})[0] || "unknown";
        }
        if (typeNode?.children?.classOrInterfaceType) {
          const identifier = typeNode.children.classOrInterfaceType[0]?.children?.typeIdentifier;
          return this.extractIdentifier(identifier);
        }
        if (typeNode?.children?.unannReferenceType) {
          const refType = typeNode.children.unannReferenceType[0];
          const unannClassOrInterfaceType = refType?.children?.unannClassOrInterfaceType?.[0];
          if (unannClassOrInterfaceType) {
            const unannClassType = unannClassOrInterfaceType.children?.unannClassType?.[0];
            if (unannClassType?.children?.Identifier) {
              return unannClassType.children.Identifier[0].image;
            }
          }
          if (refType?.children?.classOrInterfaceType) {
            const identifier = refType.children.classOrInterfaceType[0]?.children?.typeIdentifier;
            return this.extractIdentifier(identifier);
          }
        }
        return "unknown";
      }

      private extractParameters(ctx: any): ParameterInfo[] {
        const params: ParameterInfo[] = [];
        const formalParams = ctx.methodHeader?.[0]?.children?.methodDeclarator?.[0]?.children?.formalParameterList;
        
        if (formalParams) {
          const paramList = formalParams[0]?.children?.formalParameter || [];
          paramList.forEach((param: any) => {
            const paramName = this.extractIdentifier(param.children?.variableDeclaratorId?.[0]?.children?.Identifier);
            const paramType = this.extractTypeName(param.children?.unannType?.[0]);
            if (paramName !== "Unknown") {
              params.push({ name: paramName, type: paramType });
            }
          });
        }

        return params;
      }

      private extractConstructorParameters(ctx: any): ParameterInfo[] {
        const params: ParameterInfo[] = [];
        const formalParams = ctx.constructorDeclarator?.[0]?.children?.formalParameterList;
        
        if (formalParams) {
          const paramList = formalParams[0]?.children?.formalParameter || [];
          paramList.forEach((param: any) => {
            const paramName = this.extractIdentifier(param.children?.variableDeclaratorId?.[0]?.children?.Identifier);
            const paramType = this.extractTypeName(param.children?.unannType?.[0]);
            if (paramName !== "Unknown") {
              params.push({ name: paramName, type: paramType });
            }
          });
        }

        return params;
      }

      private extractFieldDeclarations(ctx: any): FieldInfo[] {
        const fields: FieldInfo[] = [];
        const varDeclarators = ctx.variableDeclaratorList?.[0]?.children?.variableDeclarator || [];
        const fieldType = this.extractTypeName(ctx.unannType?.[0]);
        const modifiers = this.extractFieldModifiers(ctx);

        varDeclarators.forEach((declarator: any) => {
          const fieldName = this.extractIdentifier(declarator.children?.variableDeclaratorId?.[0]?.children?.Identifier);
          if (fieldName !== "Unknown") {
            fields.push({
              name: fieldName,
              type: fieldType,
              isStatic: modifiers.includes("static"),
              isFinal: modifiers.includes("final"),
              isPrivate: modifiers.includes("private"),
              modifiers,
            });
          }
        });

        return fields;
      }

      private extractFieldModifiers(ctx: any): string[] {
        const modifiers: string[] = [];
        const modifierList = ctx.fieldModifier || [];
        modifierList.forEach((m: any) => {
          Object.keys(m.children || {}).forEach(key => {
            if (m.children[key]?.[0]?.image) {
              modifiers.push(key.toLowerCase());
            }
          });
        });
        return modifiers;
      }
    };

    visitor.visit(cst);
    this.classes = visitor.classes;
  }

  private detectAllPatterns(): void {
    this.detections = [];

    this.detectCreationalPatterns();
    this.detectStructuralPatterns();
    this.detectBehavioralPatterns();
    this.detectEnterprisePatterns();
    this.detectArchitecturalPatterns();
    this.detectModernPatterns();
  }

  private detectCreationalPatterns(): void {
    this.classes.forEach(cls => {
      this.detectSingleton(cls);
      this.detectBuilder(cls);
      this.detectFactoryMethod(cls);
      this.detectAbstractFactory(cls);
      this.detectPrototype(cls);
    });
  }

  private detectSingleton(cls: ClassInfo): void {
    if (!this.config.rules.creational?.singleton?.enabled) return;

    const hasPrivateConstructor = cls.methods.some(m => m.name === cls.name && m.isPrivate);
    const hasStaticInstance = cls.fields.some(f => f.isStatic && f.isFinal && f.type === cls.name);
    const hasGetInstanceMethod = cls.methods.some(m => 
      (m.name.toLowerCase().includes("instance") || m.name.toLowerCase().includes("getinstance")) && 
      m.isStatic && 
      m.isPublic
    );

    if (hasPrivateConstructor && (hasStaticInstance || hasGetInstanceMethod)) {
      this.detections.push({
        pattern: "singleton",
        category: "creational",
        detected: true,
        confidence: "high",
        location: { className: cls.name },
        evidence: [
          "Constructor privado",
          hasStaticInstance ? "Campo estático de tipo propio" : "",
          hasGetInstanceMethod ? "Método getInstance() estático" : "",
        ].filter(Boolean),
        antipatterns: this.detectSingletonAntipatterns(cls),
      });
    }
  }

  private detectSingletonAntipatterns(cls: ClassInfo): string[] | undefined {
    if (!this.config.rules.creational?.singleton?.detectAntipatterns) return undefined;

    const antipatterns: string[] = [];
    
    const staticInstance = cls.fields.find(f => f.isStatic && f.type === cls.name);
    if (staticInstance && !staticInstance.isFinal) {
      antipatterns.push("Instancia estática no es final (no thread-safe)");
    }

    const hasCloneMethod = cls.methods.some(m => m.name === "clone");
    if (!hasCloneMethod) {
      antipatterns.push("Debería override clone() para prevenir clonación");
    }

    const hasSerializable = cls.implements.includes("Serializable");
    const hasReadResolve = cls.methods.some(m => m.name === "readResolve");
    if (hasSerializable && !hasReadResolve) {
      antipatterns.push("Serializable sin readResolve() puede romper singleton");
    }

    return antipatterns.length > 0 ? antipatterns : undefined;
  }

  private detectBuilder(cls: ClassInfo): void {
    if (!this.config.rules.creational?.builder?.enabled) return;

    const hasBuilderInnerClass = cls.name.includes("Builder") || 
      this.classes.some(c => c.name === `${cls.name}Builder` || c.name.includes(`${cls.name}.Builder`));
    
    const hasBuildMethod = cls.methods.some(m => m.name === "build" && m.returnType !== "void");
    const hasFluentMethods = cls.methods.filter(m => 
      m.returnType === cls.name && 
      m.name.startsWith("with") || m.name.startsWith("set")
    ).length >= 2;

    if ((hasBuilderInnerClass || hasBuildMethod) && hasFluentMethods) {
      this.detections.push({
        pattern: "builder",
        category: "creational",
        detected: true,
        confidence: "high",
        location: { className: cls.name },
        evidence: [
          hasBuilderInnerClass ? "Clase Builder interna/externa" : "",
          hasBuildMethod ? "Método build()" : "",
          hasFluentMethods ? "Métodos fluent (with/set que retornan this)" : "",
        ].filter(Boolean),
      });
    }
  }

  private detectFactoryMethod(cls: ClassInfo): void {
    if (!this.config.rules.creational?.factoryMethod?.enabled) return;

    const factoryMethods = cls.methods.filter(m => 
      m.isStatic && 
      m.isPublic &&
      m.returnType !== "void" &&
      (m.name.toLowerCase().includes("create") || 
       m.name.toLowerCase().includes("factory") ||
       m.name.toLowerCase().includes("new") ||
       m.name.toLowerCase().includes("get"))
    );

    if (factoryMethods.length > 0) {
      this.detections.push({
        pattern: "factory-method",
        category: "creational",
        detected: true,
        confidence: "medium",
        location: { className: cls.name },
        evidence: [
          `${factoryMethods.length} método(s) factory estático(s)`,
          `Métodos: ${factoryMethods.map(m => m.name).join(", ")}`,
        ],
      });
    }
  }

  private detectAbstractFactory(cls: ClassInfo): void {
    if (!this.config.rules.creational?.abstractFactory?.enabled) return;

    if (cls.isInterface || cls.isAbstract) {
      const createMethods = cls.methods.filter(m => 
        m.name.toLowerCase().includes("create") && m.returnType !== "void"
      );

      if (createMethods.length >= 2) {
        this.detections.push({
          pattern: "abstract-factory",
          category: "creational",
          detected: true,
          confidence: "medium",
          location: { className: cls.name },
          evidence: [
            cls.isInterface ? "Interface" : "Clase abstracta",
            `${createMethods.length} métodos create()`,
            `Crea diferentes tipos de objetos relacionados`,
          ],
        });
      }
    }
  }

  private detectPrototype(cls: ClassInfo): void {
    if (!this.config.rules.creational?.prototype?.enabled) return;

    const implementsCloneable = cls.implements.includes("Cloneable");
    const hasCloneMethod = cls.methods.some(m => m.name === "clone" && m.isPublic);

    if (implementsCloneable && hasCloneMethod) {
      this.detections.push({
        pattern: "prototype",
        category: "creational",
        detected: true,
        confidence: "high",
        location: { className: cls.name },
        evidence: [
          "Implementa Cloneable",
          "Método clone() público",
        ],
      });
    }
  }

  private detectStructuralPatterns(): void {
    this.classes.forEach(cls => {
      this.detectAdapter(cls);
      this.detectDecorator(cls);
      this.detectFacade(cls);
      this.detectProxy(cls);
      this.detectComposite(cls);
      this.detectBridge(cls);
      this.detectFlyweight(cls);
    });
  }

  private detectAdapter(cls: ClassInfo): void {
    if (!this.config.rules.structural?.adapter?.enabled) return;

    const hasAdapter = cls.name.toLowerCase().includes("adapter") || 
      cls.name.toLowerCase().includes("wrapper");
    
    const hasComposition = cls.fields.length > 0;
    const implementsInterface = cls.implements.length > 0;

    if (hasAdapter && hasComposition && implementsInterface) {
      this.detections.push({
        pattern: "adapter",
        category: "structural",
        detected: true,
        confidence: "high",
        location: { className: cls.name },
        evidence: [
          "Nombre incluye 'Adapter' o 'Wrapper'",
          "Implementa interfaz(es)",
          "Usa composición para adaptee",
        ],
      });
    }
  }

  private detectDecorator(cls: ClassInfo): void {
    if (!this.config.rules.structural?.decorator?.enabled) return;

    const hasDecorator = cls.name.toLowerCase().includes("decorator");
    const extendsBase = cls.extends !== null;
    const hasComponentField = cls.fields.some(f => !f.isStatic);

    if ((hasDecorator || (extendsBase && hasComponentField)) && cls.implements.length === 0) {
      this.detections.push({
        pattern: "decorator",
        category: "structural",
        detected: true,
        confidence: "medium",
        location: { className: cls.name },
        evidence: [
          hasDecorator ? "Nombre incluye 'Decorator'" : "",
          extendsBase ? `Extiende clase base` : "",
          hasComponentField ? "Campo componente envuelto" : "",
        ].filter(Boolean),
      });
    }
  }

  private detectFacade(cls: ClassInfo): void {
    if (!this.config.rules.structural?.facade?.enabled) return;

    const hasFacade = cls.name.toLowerCase().includes("facade");
    const hasMultipleFields = cls.fields.filter(f => !f.isStatic).length >= 2;
    const hasPublicMethods = cls.methods.filter(m => m.isPublic && !m.isStatic).length >= 2;

    if (hasFacade || (hasMultipleFields && hasPublicMethods)) {
      this.detections.push({
        pattern: "facade",
        category: "structural",
        detected: true,
        confidence: hasFacade ? "high" : "medium",
        location: { className: cls.name },
        evidence: [
          hasFacade ? "Nombre incluye 'Facade'" : "",
          `${cls.fields.length} subsistemas encapsulados`,
          `${hasPublicMethods} métodos públicos simplificados`,
        ].filter(Boolean),
      });
    }
  }

  private detectProxy(cls: ClassInfo): void {
    if (!this.config.rules.structural?.proxy?.enabled) return;

    const hasProxy = cls.name.toLowerCase().includes("proxy");
    const implementsInterface = cls.implements.length > 0;
    const hasRealSubjectField = cls.fields.some(f => !f.isStatic && f.isPrivate);

    if (hasProxy && implementsInterface && hasRealSubjectField) {
      this.detections.push({
        pattern: "proxy",
        category: "structural",
        detected: true,
        confidence: "high",
        location: { className: cls.name },
        evidence: [
          "Nombre incluye 'Proxy'",
          "Implementa misma interfaz que real subject",
          "Campo privado para real subject",
        ],
      });
    }
  }

  private detectComposite(cls: ClassInfo): void {
    if (!this.config.rules.structural?.composite?.enabled) return;

    const hasCollectionField = cls.fields.some(f => 
      f.type.includes("List") || f.type.includes("Set") || f.type.includes("Collection")
    );
    const hasAddMethod = cls.methods.some(m => m.name.toLowerCase().includes("add"));
    const hasRemoveMethod = cls.methods.some(m => m.name.toLowerCase().includes("remove"));

    if (hasCollectionField && hasAddMethod && hasRemoveMethod) {
      this.detections.push({
        pattern: "composite",
        category: "structural",
        detected: true,
        confidence: "medium",
        location: { className: cls.name },
        evidence: [
          "Campo colección de hijos",
          "Métodos add/remove para gestión jerárquica",
        ],
      });
    }
  }

  private detectBridge(cls: ClassInfo): void {
    if (!this.config.rules.structural?.bridge?.enabled) return;

    const hasImplementationField = cls.fields.some(f => 
      f.type.toLowerCase().includes("impl") || f.type.toLowerCase().includes("implementation")
    );
    
    if (cls.isAbstract && hasImplementationField) {
      this.detections.push({
        pattern: "bridge",
        category: "structural",
        detected: true,
        confidence: "low",
        location: { className: cls.name },
        evidence: [
          "Clase abstracta",
          "Campo de implementación",
          "Separa abstracción de implementación",
        ],
      });
    }
  }

  private detectFlyweight(cls: ClassInfo): void {
    if (!this.config.rules.structural?.flyweight?.enabled) return;

    const hasStaticCache = cls.fields.some(f => 
      f.isStatic && (f.type.includes("Map") || f.type.includes("HashMap") || f.type.includes("Cache"))
    );
    const hasGetMethod = cls.methods.some(m => 
      m.isStatic && m.name.toLowerCase().includes("get")
    );

    if (hasStaticCache && hasGetMethod) {
      this.detections.push({
        pattern: "flyweight",
        category: "structural",
        detected: true,
        confidence: "low",
        location: { className: cls.name },
        evidence: [
          "Caché estático (Map/HashMap)",
          "Método get estático para reutilización",
        ],
      });
    }
  }

  private detectBehavioralPatterns(): void {
    this.classes.forEach(cls => {
      this.detectObserver(cls);
      this.detectStrategy(cls);
      this.detectTemplateMethod(cls);
      this.detectCommand(cls);
      this.detectState(cls);
      this.detectIterator(cls);
      this.detectChainOfResponsibility(cls);
      this.detectMediator(cls);
      this.detectMemento(cls);
      this.detectVisitor(cls);
      this.detectInterpreter(cls);
    });
  }

  private detectObserver(cls: ClassInfo): void {
    if (!this.config.rules.behavioral?.observer?.enabled) return;

    const hasObserversList = cls.fields.some(f => 
      (f.type.includes("List") || f.type.includes("Set")) && 
      (f.name.toLowerCase().includes("observer") || f.name.toLowerCase().includes("listener"))
    );
    const hasNotifyMethod = cls.methods.some(m => 
      m.name.toLowerCase().includes("notify") || m.name.toLowerCase().includes("update")
    );
    const hasAddObserver = cls.methods.some(m => 
      m.name.toLowerCase().includes("add") && 
      (m.name.toLowerCase().includes("observer") || m.name.toLowerCase().includes("listener"))
    );

    if (hasObserversList && hasNotifyMethod && hasAddObserver) {
      this.detections.push({
        pattern: "observer",
        category: "behavioral",
        detected: true,
        confidence: "high",
        location: { className: cls.name },
        evidence: [
          "Lista de observers/listeners",
          "Método notify/update",
          "Método add observer/listener",
        ],
      });
    }
  }

  private detectStrategy(cls: ClassInfo): void {
    if (!this.config.rules.behavioral?.strategy?.enabled) return;

    const isStrategyInterface = cls.isInterface && cls.methods.length > 0;
    const hasStrategyField = cls.fields.some(f => 
      f.type.toLowerCase().includes("strategy") || f.type.toLowerCase().includes("algorithm")
    );
    const hasExecuteMethod = cls.methods.some(m => 
      m.name.toLowerCase().includes("execute") || 
      m.name.toLowerCase().includes("perform") ||
      m.name.toLowerCase().includes("calculate")
    );

    if (isStrategyInterface || (hasStrategyField && hasExecuteMethod)) {
      this.detections.push({
        pattern: "strategy",
        category: "behavioral",
        detected: true,
        confidence: isStrategyInterface ? "high" : "medium",
        location: { className: cls.name },
        evidence: [
          isStrategyInterface ? "Interface de estrategia" : "",
          hasStrategyField ? "Campo de estrategia" : "",
          hasExecuteMethod ? "Método execute/perform" : "",
        ].filter(Boolean),
      });
    }
  }

  private detectTemplateMethod(cls: ClassInfo): void {
    if (!this.config.rules.behavioral?.templateMethod?.enabled) return;

    const abstractMethods = cls.methods.filter(m => m.isAbstract);
    const templateMethod = cls.methods.find(m => 
      !m.isAbstract && 
      m.isPublic && 
      (m.name.toLowerCase().includes("template") || m.name.toLowerCase().includes("execute") || m.name.toLowerCase().includes("run"))
    );

    if (cls.isAbstract && abstractMethods.length > 0 && templateMethod) {
      this.detections.push({
        pattern: "template-method",
        category: "behavioral",
        detected: true,
        confidence: "high",
        location: { className: cls.name, methodName: templateMethod.name },
        evidence: [
          "Clase abstracta",
          `${abstractMethods.length} método(s) abstracto(s)`,
          `Método template: ${templateMethod.name}`,
        ],
      });
    }
  }

  private detectCommand(cls: ClassInfo): void {
    if (!this.config.rules.behavioral?.command?.enabled) return;

    const hasExecuteMethod = cls.methods.some(m => m.name === "execute");
    const hasUndoMethod = cls.methods.some(m => m.name === "undo");
    const isCommand = cls.name.toLowerCase().includes("command");

    if (hasExecuteMethod && (isCommand || hasUndoMethod)) {
      this.detections.push({
        pattern: "command",
        category: "behavioral",
        detected: true,
        confidence: "high",
        location: { className: cls.name },
        evidence: [
          "Método execute()",
          hasUndoMethod ? "Método undo()" : "",
          isCommand ? "Nombre incluye 'Command'" : "",
        ].filter(Boolean),
      });
    }
  }

  private detectState(cls: ClassInfo): void {
    if (!this.config.rules.behavioral?.state?.enabled) return;

    const hasStateField = cls.fields.some(f => 
      f.type.toLowerCase().includes("state")
    );
    const hasChangeStateMethod = cls.methods.some(m => 
      m.name.toLowerCase().includes("state") || m.name.toLowerCase().includes("transition")
    );
    const isStateInterface = cls.isInterface && cls.name.toLowerCase().includes("state");

    if (isStateInterface || (hasStateField && hasChangeStateMethod)) {
      this.detections.push({
        pattern: "state",
        category: "behavioral",
        detected: true,
        confidence: "medium",
        location: { className: cls.name },
        evidence: [
          isStateInterface ? "Interface State" : "",
          hasStateField ? "Campo de estado" : "",
          hasChangeStateMethod ? "Método de transición de estado" : "",
        ].filter(Boolean),
      });
    }
  }

  private detectIterator(cls: ClassInfo): void {
    if (!this.config.rules.behavioral?.iterator?.enabled) return;

    const implementsIterator = cls.implements.some(i => i === "Iterator");
    const hasNextMethod = cls.methods.some(m => m.name === "next");
    const hasHasNextMethod = cls.methods.some(m => m.name === "hasNext");

    if (implementsIterator || (hasNextMethod && hasHasNextMethod)) {
      this.detections.push({
        pattern: "iterator",
        category: "behavioral",
        detected: true,
        confidence: "high",
        location: { className: cls.name },
        evidence: [
          implementsIterator ? "Implementa Iterator" : "",
          "Métodos next() y hasNext()",
        ].filter(Boolean),
      });
    }
  }

  private detectChainOfResponsibility(cls: ClassInfo): void {
    if (!this.config.rules.behavioral?.chainOfResponsibility?.enabled) return;

    const hasNextHandler = cls.fields.some(f => 
      f.type.toLowerCase().includes("handler") || f.name.toLowerCase().includes("next")
    );
    const hasHandleMethod = cls.methods.some(m => 
      m.name.toLowerCase().includes("handle") || m.name.toLowerCase().includes("process")
    );

    if (hasNextHandler && hasHandleMethod) {
      this.detections.push({
        pattern: "chain-of-responsibility",
        category: "behavioral",
        detected: true,
        confidence: "medium",
        location: { className: cls.name },
        evidence: [
          "Campo next handler",
          "Método handle/process",
        ],
      });
    }
  }

  private detectMediator(cls: ClassInfo): void {
    if (!this.config.rules.behavioral?.mediator?.enabled) return;

    const isMediator = cls.name.toLowerCase().includes("mediator");
    const hasColleaguesList = cls.fields.some(f => 
      f.type.includes("List") || f.type.includes("Set") || f.type.includes("Collection")
    );
    const hasNotifyMethod = cls.methods.some(m => 
      m.name.toLowerCase().includes("notify") || m.name.toLowerCase().includes("mediate")
    );

    if (isMediator && hasColleaguesList && hasNotifyMethod) {
      this.detections.push({
        pattern: "mediator",
        category: "behavioral",
        detected: true,
        confidence: "medium",
        location: { className: cls.name },
        evidence: [
          "Nombre incluye 'Mediator'",
          "Lista de colegas",
          "Método notify/mediate",
        ],
      });
    }
  }

  private detectMemento(cls: ClassInfo): void {
    if (!this.config.rules.behavioral?.memento?.enabled) return;

    const isMemento = cls.name.toLowerCase().includes("memento");
    const hasStateFields = cls.fields.filter(f => f.isPrivate && f.isFinal).length > 0;
    const hasCaretaker = this.classes.some(c => c.name.toLowerCase().includes("caretaker"));

    if (isMemento && hasStateFields) {
      this.detections.push({
        pattern: "memento",
        category: "behavioral",
        detected: true,
        confidence: "medium",
        location: { className: cls.name },
        evidence: [
          "Nombre incluye 'Memento'",
          "Campos private final para estado",
          hasCaretaker ? "Existe Caretaker" : "",
        ].filter(Boolean),
      });
    }
  }

  private detectVisitor(cls: ClassInfo): void {
    if (!this.config.rules.behavioral?.visitor?.enabled) return;

    const isVisitor = cls.name.toLowerCase().includes("visitor");
    const hasVisitMethods = cls.methods.filter(m => m.name.startsWith("visit")).length >= 2;
    const hasAcceptMethod = cls.methods.some(m => m.name === "accept");

    if ((isVisitor && hasVisitMethods) || hasAcceptMethod) {
      this.detections.push({
        pattern: "visitor",
        category: "behavioral",
        detected: true,
        confidence: "low",
        location: { className: cls.name },
        evidence: [
          isVisitor ? "Nombre incluye 'Visitor'" : "",
          hasVisitMethods ? `${cls.methods.filter(m => m.name.startsWith("visit")).length} métodos visit()` : "",
          hasAcceptMethod ? "Método accept()" : "",
        ].filter(Boolean),
      });
    }
  }

  private detectInterpreter(cls: ClassInfo): void {
    if (!this.config.rules.behavioral?.interpreter?.enabled) return;

    const hasInterpretMethod = cls.methods.some(m => 
      m.name.toLowerCase().includes("interpret") || m.name.toLowerCase().includes("evaluate")
    );
    const isExpression = cls.name.toLowerCase().includes("expression");

    if (hasInterpretMethod && isExpression) {
      this.detections.push({
        pattern: "interpreter",
        category: "behavioral",
        detected: true,
        confidence: "low",
        location: { className: cls.name },
        evidence: [
          "Método interpret/evaluate",
          "Nombre incluye 'Expression'",
        ],
      });
    }
  }

  private detectEnterprisePatterns(): void {
    this.classes.forEach(cls => {
      this.detectDAO(cls);
      this.detectRepository(cls);
      this.detectDTO(cls);
      this.detectServiceLayer(cls);
      this.detectValueObject(cls);
      this.detectDataMapper(cls);
      this.detectActiveRecord(cls);
    });
  }

  private detectDAO(cls: ClassInfo): void {
    if (!this.config.rules.enterprise?.dao?.enabled) return;

    const isDAO = cls.name.toLowerCase().includes("dao") || cls.name.toLowerCase().includes("dataaccess");
    const hasCRUDMethods = this.hasCRUDMethods(cls);
    const hasEntityField = cls.fields.length > 0 || cls.methods.some(m => m.returnType !== "void");

    if (isDAO && hasCRUDMethods >= 3) {
      const antipatterns: string[] = [];
      if (this.config.rules.enterprise?.dao?.detectAntipatterns) {
        if (!cls.isInterface) {
          antipatterns.push("DAO debería ser una interfaz");
        }
      }

      this.detections.push({
        pattern: "dao",
        category: "enterprise",
        detected: true,
        confidence: "high",
        location: { className: cls.name },
        evidence: [
          "Nombre incluye 'DAO'",
          `${hasCRUDMethods} operaciones CRUD`,
          "Abstracción de acceso a datos",
        ],
        antipatterns: antipatterns.length > 0 ? antipatterns : undefined,
      });
    }
  }

  private detectRepository(cls: ClassInfo): void {
    if (!this.config.rules.enterprise?.repository?.enabled) return;

    const isRepository = cls.name.toLowerCase().includes("repository");
    const hasSpringDataRepo = cls.extends !== null && cls.extends.includes("Repository");
    const hasDomainMethods = cls.methods.some(m => 
      m.name.startsWith("findBy") || m.name.startsWith("getBy") || m.name === "save" || m.name === "delete"
    );

    if (isRepository || hasSpringDataRepo) {
      const antipatterns: string[] = [];
      if (this.config.rules.enterprise?.repository?.detectAntipatterns) {
        if (!cls.isInterface && !hasSpringDataRepo) {
          antipatterns.push("Repository debería ser una interfaz");
        }
      }

      this.detections.push({
        pattern: "repository",
        category: "enterprise",
        detected: true,
        confidence: "high",
        location: { className: cls.name },
        evidence: [
          isRepository ? "Nombre incluye 'Repository'" : "",
          hasSpringDataRepo ? "Extiende JpaRepository/CrudRepository" : "",
          hasDomainMethods ? "Métodos de dominio (findBy, save)" : "",
        ].filter(Boolean),
        antipatterns: antipatterns.length > 0 ? antipatterns : undefined,
      });
    }
  }

  private detectDTO(cls: ClassInfo): void {
    if (!this.config.rules.enterprise?.dto?.enabled) return;

    const isDTO = cls.name.toLowerCase().includes("dto") || cls.name.toLowerCase().includes("data");
    const hasOnlyGettersSetters = cls.methods.every(m => 
      m.name.startsWith("get") || m.name.startsWith("set") || m.name.startsWith("is")
    );
    const hasMultipleFields = cls.fields.length >= 2;
    const hasNoBusinessLogic = !cls.methods.some(m => 
      !m.name.startsWith("get") && !m.name.startsWith("set") && !m.name.startsWith("is") && m.name !== "toString" && m.name !== "hashCode" && m.name !== "equals"
    );

    if ((isDTO || (hasOnlyGettersSetters && hasMultipleFields && hasNoBusinessLogic)) && cls.fields.length > 0) {
      const antipatterns: string[] = [];
      if (this.config.rules.enterprise?.dto?.detectAntipatterns) {
        const hasBusinessMethod = cls.methods.some(m => 
          !m.name.startsWith("get") && !m.name.startsWith("set") && !m.name.startsWith("is") && 
          m.name !== "toString" && m.name !== "hashCode" && m.name !== "equals"
        );
        if (hasBusinessMethod) {
          antipatterns.push("DTO no debería contener lógica de negocio");
        }
      }

      this.detections.push({
        pattern: "dto",
        category: "enterprise",
        detected: true,
        confidence: "high",
        location: { className: cls.name },
        evidence: [
          isDTO ? "Nombre incluye 'DTO'" : "",
          "Solo getters/setters",
          `${cls.fields.length} campos de datos`,
          "Sin lógica de negocio",
        ].filter(Boolean),
        antipatterns: antipatterns.length > 0 ? antipatterns : undefined,
      });
    }
  }

  private detectServiceLayer(cls: ClassInfo): void {
    if (!this.config.rules.enterprise?.serviceLayer?.enabled) return;

    const isService = cls.name.toLowerCase().includes("service") || cls.annotations.includes("Service");
    const hasBusinessMethods = cls.methods.filter(m => m.isPublic && !m.isStatic).length >= 2;
    const hasDependencies = cls.fields.filter(f => !f.isStatic).length >= 1;

    if (isService && hasBusinessMethods) {
      const antipatterns: string[] = [];
      if (this.config.rules.enterprise?.serviceLayer?.detectAntipatterns) {
        if (cls.fields.filter(f => !f.isFinal && !f.isStatic).length > 0) {
          antipatterns.push("Dependencias deberían ser final (inmutables)");
        }
        const hasDAOInName = cls.fields.some(f => f.type.toLowerCase().includes("dao"));
        if (hasDAOInName) {
          antipatterns.push("Service Layer debería depender de Repository, no DAO directamente");
        }
      }

      this.detections.push({
        pattern: "service-layer",
        category: "enterprise",
        detected: true,
        confidence: "high",
        location: { className: cls.name },
        evidence: [
          isService ? "Nombre incluye 'Service' o @Service" : "",
          `${hasBusinessMethods} métodos de negocio`,
          hasDependencies ? "Orquesta múltiples dependencias" : "",
        ].filter(Boolean),
        antipatterns: antipatterns.length > 0 ? antipatterns : undefined,
      });
    }
  }

  private detectValueObject(cls: ClassInfo): void {
    if (!this.config.rules.enterprise?.valueObject?.enabled) return;

    const allFieldsFinal = cls.fields.every(f => f.isFinal || f.isStatic);
    const hasEqualsHashCode = cls.methods.some(m => m.name === "equals") && 
                               cls.methods.some(m => m.name === "hashCode");
    const noSetters = !cls.methods.some(m => m.name.startsWith("set"));

    if (allFieldsFinal && hasEqualsHashCode && noSetters && cls.fields.length > 0) {
      this.detections.push({
        pattern: "value-object",
        category: "enterprise",
        detected: true,
        confidence: "high",
        location: { className: cls.name },
        evidence: [
          "Todos los campos son final (inmutable)",
          "Implementa equals/hashCode",
          "Sin setters",
        ],
      });
    }
  }

  private detectDataMapper(cls: ClassInfo): void {
    if (!this.config.rules.enterprise?.dataMapper?.enabled) return;

    const isMapper = cls.name.toLowerCase().includes("mapper");
    const hasMapMethods = cls.methods.filter(m => 
      m.name.toLowerCase().includes("map") || 
      m.name.toLowerCase().includes("to") ||
      m.name.toLowerCase().includes("from")
    ).length >= 2;

    if (isMapper && hasMapMethods) {
      this.detections.push({
        pattern: "data-mapper",
        category: "enterprise",
        detected: true,
        confidence: "medium",
        location: { className: cls.name },
        evidence: [
          "Nombre incluye 'Mapper'",
          `${hasMapMethods} métodos de mapeo`,
        ],
      });
    }
  }

  private detectActiveRecord(cls: ClassInfo): void {
    if (!this.config.rules.enterprise?.activeRecord?.enabled) return;

    const hasCRUDMethods = this.hasCRUDMethods(cls);
    const hasFields = cls.fields.length > 0;
    const hasSaveMethod = cls.methods.some(m => m.name === "save" && !m.isStatic);

    if (hasCRUDMethods >= 2 && hasFields && hasSaveMethod) {
      this.detections.push({
        pattern: "active-record",
        category: "enterprise",
        detected: true,
        confidence: "medium",
        location: { className: cls.name },
        evidence: [
          "Contiene datos del dominio",
          "Métodos CRUD como parte del objeto",
          "Método save() no estático",
        ],
      });
    }
  }

  private hasCRUDMethods(cls: ClassInfo): number {
    let count = 0;
    if (cls.methods.some(m => m.name.toLowerCase().includes("create") || m.name.toLowerCase().includes("insert") || m.name === "save")) count++;
    if (cls.methods.some(m => m.name.toLowerCase().includes("read") || m.name.toLowerCase().includes("find") || m.name.toLowerCase().includes("get"))) count++;
    if (cls.methods.some(m => m.name.toLowerCase().includes("update") || m.name === "save")) count++;
    if (cls.methods.some(m => m.name.toLowerCase().includes("delete") || m.name.toLowerCase().includes("remove"))) count++;
    return count;
  }

  private detectArchitecturalPatterns(): void {
    this.detectMVC();
    this.detectFrontController();
    this.detectServiceLocator();
  }

  private detectMVC(): void {
    if (!this.config.rules.architectural?.mvc?.enabled) return;

    const controllers = this.classes.filter(c => 
      c.name.toLowerCase().includes("controller") || c.annotations.includes("Controller") || c.annotations.includes("RestController")
    );
    const models = this.classes.filter(c => 
      c.name.toLowerCase().includes("model") || c.annotations.includes("Entity")
    );
    const views = this.classes.filter(c => 
      c.name.toLowerCase().includes("view")
    );

    if (controllers.length > 0 && models.length > 0) {
      this.detections.push({
        pattern: "mvc",
        category: "architectural",
        detected: true,
        confidence: "high",
        location: {},
        evidence: [
          `${controllers.length} Controller(s)`,
          `${models.length} Model(s)`,
          views.length > 0 ? `${views.length} View(s)` : "Views (templates/JSP/Thymeleaf)",
        ],
      });
    }
  }

  private detectFrontController(): void {
    if (!this.config.rules.architectural?.frontController?.enabled) return;

    const frontControllers = this.classes.filter(c => 
      c.annotations.includes("ControllerAdvice") || 
      c.annotations.includes("WebFilter") ||
      c.name.toLowerCase().includes("dispatcherservlet") ||
      c.name.toLowerCase().includes("frontcontroller")
    );

    if (frontControllers.length > 0) {
      frontControllers.forEach(fc => {
        this.detections.push({
          pattern: "front-controller",
          category: "architectural",
          detected: true,
          confidence: "high",
          location: { className: fc.name },
          evidence: [
            fc.annotations.length > 0 ? `Anotaciones: ${fc.annotations.join(", ")}` : "",
            "Punto de entrada centralizado para requests",
          ].filter(Boolean),
        });
      });
    }
  }

  private detectServiceLocator(): void {
    if (!this.config.rules.architectural?.serviceLocator?.enabled) return;

    const serviceLocators = this.classes.filter(c => 
      c.name.toLowerCase().includes("servicelocator") || c.name.toLowerCase().includes("servicefactory")
    );

    serviceLocators.forEach(sl => {
      const antipatterns: string[] = [];
      if (this.config.rules.architectural?.serviceLocator?.detectAntipatterns) {
        antipatterns.push("Service Locator es anti-patrón en Java moderno - usar Dependency Injection");
      }

      this.detections.push({
        pattern: "service-locator",
        category: "architectural",
        detected: true,
        confidence: "medium",
        location: { className: sl.name },
        evidence: [
          "Nombre incluye 'ServiceLocator'",
          "Centraliza lookup de servicios",
        ],
        antipatterns: antipatterns.length > 0 ? antipatterns : undefined,
      });
    });
  }

  private detectModernPatterns(): void {
    this.classes.forEach(cls => {
      this.detectDependencyInjection(cls);
      this.detectCircuitBreaker(cls);
      this.detectEventSourcing(cls);
      this.detectCQRS(cls);
    });
  }

  private detectDependencyInjection(cls: ClassInfo): void {
    if (!this.config.rules.modern?.dependencyInjection?.enabled) return;

    const hasAutowired = cls.fields.some(f => f.modifiers.includes("Autowired")) ||
                         cls.annotations.includes("Autowired");
    const hasInject = cls.annotations.includes("Inject");
    const hasConstructorInjection = cls.methods.some(m => 
      m.name === cls.name && m.parameters.length > 0
    ) && cls.fields.filter(f => f.isFinal).length > 0;

    if (hasAutowired || hasInject || hasConstructorInjection) {
      const antipatterns: string[] = [];
      if (this.config.rules.modern?.dependencyInjection?.detectAntipatterns) {
        if (hasAutowired && !hasConstructorInjection) {
          antipatterns.push("Preferir constructor injection sobre field injection (@Autowired en campos)");
        }
      }

      this.detections.push({
        pattern: "dependency-injection",
        category: "modern",
        detected: true,
        confidence: "high",
        location: { className: cls.name },
        evidence: [
          hasAutowired ? "@Autowired" : "",
          hasInject ? "@Inject" : "",
          hasConstructorInjection ? "Constructor injection con campos final" : "",
        ].filter(Boolean),
        antipatterns: antipatterns.length > 0 ? antipatterns : undefined,
      });
    }
  }

  private detectCircuitBreaker(cls: ClassInfo): void {
    if (!this.config.rules.modern?.circuitBreaker?.enabled) return;

    const hasCircuitBreakerAnnotation = cls.annotations.includes("CircuitBreaker") || 
                                        cls.annotations.includes("HystrixCommand");
    const hasCircuitBreakerName = cls.name.toLowerCase().includes("circuitbreaker");
    const hasStateField = cls.fields.some(f => 
      f.type.toLowerCase().includes("state") && 
      (f.type.includes("OPEN") || f.type.includes("CLOSED") || f.type.includes("HALF_OPEN"))
    );

    if (hasCircuitBreakerAnnotation || hasCircuitBreakerName || hasStateField) {
      this.detections.push({
        pattern: "circuit-breaker",
        category: "modern",
        detected: true,
        confidence: "high",
        location: { className: cls.name },
        evidence: [
          hasCircuitBreakerAnnotation ? "Anotación @CircuitBreaker o @HystrixCommand" : "",
          hasCircuitBreakerName ? "Nombre incluye 'CircuitBreaker'" : "",
          hasStateField ? "Estados OPEN/CLOSED/HALF_OPEN" : "",
        ].filter(Boolean),
      });
    }
  }

  private detectEventSourcing(cls: ClassInfo): void {
    if (!this.config.rules.modern?.eventSourcing?.enabled) return;

    const isEvent = cls.name.toLowerCase().includes("event");
    const hasEventStore = cls.name.toLowerCase().includes("eventstore");
    const hasApplyMethod = cls.methods.some(m => m.name.toLowerCase().includes("apply"));

    if ((isEvent || hasEventStore) && hasApplyMethod) {
      this.detections.push({
        pattern: "event-sourcing",
        category: "modern",
        detected: true,
        confidence: "medium",
        location: { className: cls.name },
        evidence: [
          isEvent ? "Clase Event" : "",
          hasEventStore ? "EventStore" : "",
          hasApplyMethod ? "Método apply() para reconstruir estado" : "",
        ].filter(Boolean),
      });
    }
  }

  private detectCQRS(cls: ClassInfo): void {
    if (!this.config.rules.modern?.cqrs?.enabled) return;

    const isCommand = cls.name.toLowerCase().includes("command") && 
                      !cls.methods.some(m => m.returnType !== "void" && m.returnType !== null);
    const isQuery = cls.name.toLowerCase().includes("query") && 
                    cls.methods.some(m => m.returnType !== "void");

    if (isCommand || isQuery) {
      this.detections.push({
        pattern: "cqrs",
        category: "modern",
        detected: true,
        confidence: "medium",
        location: { className: cls.name },
        evidence: [
          isCommand ? "Command (operación de escritura, void)" : "",
          isQuery ? "Query (operación de lectura, retorna datos)" : "",
          "Separación Command/Query Responsibility",
        ].filter(Boolean),
      });
    }
  }

  private generateViolations(filename: string): JavaPatternViolation[] {
    const violations: JavaPatternViolation[] = [];

    this.detections.forEach(detection => {
      const config = this.getPatternConfig(detection.pattern, detection.category);
      if (!config || !config.enabled) return;

      let message = `✓ Patrón detectado: ${this.formatPatternName(detection.pattern)} (${detection.category})`;
      if (detection.confidence) {
        message += ` [Confianza: ${detection.confidence}]`;
      }

      if (detection.location?.className) {
        message += `\n   Clase: ${detection.location.className}`;
      }
      if (detection.location?.methodName) {
        message += `\n   Método: ${detection.location.methodName}`;
      }

      if (detection.evidence && detection.evidence.length > 0) {
        message += `\n   Evidencia:`;
        detection.evidence.forEach(e => {
          message += `\n   - ${e}`;
        });
      }

      if (detection.antipatterns && detection.antipatterns.length > 0) {
        message += `\n   ⚠️  Anti-patrones detectados:`;
        detection.antipatterns.forEach(ap => {
          message += `\n   - ${ap}`;
        });
      }

      violations.push({
        rule: `pattern-${detection.pattern}`,
        pattern: detection.pattern,
        category: detection.category,
        severity: config.severity,
        message,
        className: detection.location?.className,
        methodName: detection.location?.methodName,
        line: detection.location?.line,
        evidence: detection.evidence,
      });
    });

    return violations;
  }

  private getPatternConfig(pattern: JavaPatternName, category: JavaPatternCategory): any {
    const categoryConfig = this.config.rules[category];
    if (!categoryConfig) return null;

    const patternKey = this.patternNameToConfigKey(pattern);
    return (categoryConfig as any)[patternKey] || null;
  }

  private patternNameToConfigKey(pattern: JavaPatternName): string {
    return pattern.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
  }

  private formatPatternName(pattern: JavaPatternName): string {
    return pattern
      .split("-")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }
}
