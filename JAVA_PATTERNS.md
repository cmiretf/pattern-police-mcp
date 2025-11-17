# Pattern Police - Java Design Patterns Detection

Pattern Police detecta **más de 50 patrones de diseño** en código Java, organizados en 6 categorías principales.

## 📋 Tabla de Contenidos

- [Patrones Creacionales GoF (5)](#patrones-creacionales-gof)
- [Patrones Estructurales GoF (7)](#patrones-estructurales-gof)
- [Patrones de Comportamiento GoF (11)](#patrones-de-comportamiento-gof)
- [Patrones Enterprise/J2EE (15+)](#patrones-enterprise-j2ee)
- [Patrones Arquitecturales (7)](#patrones-arquitecturales)
- [Patrones Modernos (6)](#patrones-modernos)

---

## Patrones Creacionales GoF

### 1. Singleton
**Detecta:** Una única instancia global del objeto

**Evidencia buscada:**
- Constructor privado
- Campo estático final de tipo propio
- Método `getInstance()` estático

**Anti-patrones detectados:**
- Instancia no es final (no thread-safe)
- Falta `clone()` override
- Serializable sin `readResolve()`

**Ejemplo:**
```java
public class DatabaseConnection {
    private static final DatabaseConnection INSTANCE = new DatabaseConnection();
    
    private DatabaseConnection() {}
    
    public static DatabaseConnection getInstance() {
        return INSTANCE;
    }
}
```

### 2. Builder
**Detecta:** Construcción paso a paso de objetos complejos

**Evidencia buscada:**
- Clase Builder interna/externa
- Método `build()`
- Métodos fluent (with/set que retornan this)

**Ejemplo:**
```java
public class User {
    private User(Builder builder) { ... }
    
    public static class Builder {
        public Builder withName(String name) { return this; }
        public User build() { return new User(this); }
    }
}
```

### 3. Factory Method
**Detecta:** Creación de objetos mediante método factory

**Evidencia buscada:**
- Métodos estáticos públicos
- Nombres: create, factory, new, get
- Retorno no void

**Ejemplo:**
```java
public class PaymentProcessor {
    public static Payment createPayment(String type) {
        if ("credit".equals(type)) return new CreditCardPayment();
        return new PayPalPayment();
    }
}
```

### 4. Abstract Factory
**Detecta:** Familias de objetos relacionados

**Evidencia buscada:**
- Interface o clase abstracta
- 2+ métodos create()
- Crea diferentes tipos de objetos relacionados

### 5. Prototype
**Detecta:** Clonación de objetos

**Evidencia buscada:**
- Implementa `Cloneable`
- Método `clone()` público

---

## Patrones Estructurales GoF

### 6. Adapter
**Detecta:** Adapta interfaces incompatibles

**Evidencia buscada:**
- Nombre incluye "Adapter" o "Wrapper"
- Implementa interfaz
- Usa composición para adaptee

### 7. Bridge
**Detecta:** Separa abstracción de implementación

**Evidencia buscada:**
- Clase abstracta
- Campo de implementación
- Separa abstracción de implementación

### 8. Composite
**Detecta:** Estructura de árbol de objetos

**Evidencia buscada:**
- Campo colección (List/Set)
- Métodos add/remove

### 9. Decorator
**Detecta:** Añade funcionalidad dinámicamente

**Evidencia buscada:**
- Nombre incluye "Decorator"
- Extiende clase base
- Campo componente envuelto

### 10. Facade
**Detecta:** Interfaz simplificada a subsistema complejo

**Evidencia buscada:**
- Nombre incluye "Facade"
- 2+ subsistemas encapsulados
- Métodos públicos simplificados

### 11. Flyweight
**Detecta:** Compartición eficiente de objetos

**Evidencia buscada:**
- Caché estático (Map/HashMap)
- Método get estático para reutilización

### 12. Proxy
**Detecta:** Representante/placeholder de otro objeto

**Evidencia buscada:**
- Nombre incluye "Proxy"
- Implementa misma interfaz
- Campo privado para real subject

---

## Patrones de Comportamiento GoF

### 13. Chain of Responsibility
**Detecta:** Cadena de handlers

**Evidencia buscada:**
- Campo next handler
- Método handle/process

### 14. Command
**Detecta:** Encapsula request como objeto

**Evidencia buscada:**
- Método `execute()`
- Método `undo()` (opcional)
- Nombre incluye "Command"

### 15. Interpreter
**Detecta:** Interpreta gramática/lenguaje

**Evidencia buscada:**
- Método interpret/evaluate
- Nombre incluye "Expression"

### 16. Iterator
**Detecta:** Acceso secuencial a colección

**Evidencia buscada:**
- Implementa `Iterator`
- Métodos `next()` y `hasNext()`

### 17. Mediator
**Detecta:** Mediador entre objetos

**Evidencia buscada:**
- Nombre incluye "Mediator"
- Lista de colegas
- Método notify/mediate

### 18. Memento
**Detecta:** Captura y restaura estado

**Evidencia buscada:**
- Nombre incluye "Memento"
- Campos private final para estado
- Existe Caretaker

### 19. Observer
**Detecta:** Notificación automática de cambios

**Evidencia buscada:**
- Lista de observers/listeners
- Método notify/update
- Método add observer/listener

**Ejemplo:**
```java
public class NewsPublisher {
    private List<NewsSubscriber> subscribers = new ArrayList<>();
    
    public void addSubscriber(NewsSubscriber sub) {
        subscribers.add(sub);
    }
    
    private void notifySubscribers() {
        for (NewsSubscriber sub : subscribers) {
            sub.update(latestNews);
        }
    }
}
```

### 20. State
**Detecta:** Cambia comportamiento según estado

**Evidencia buscada:**
- Campo de estado
- Método de transición de estado
- Interface State

### 21. Strategy
**Detecta:** Algoritmos intercambiables

**Evidencia buscada:**
- Interface de estrategia
- Campo de estrategia
- Método execute/perform

**Ejemplo:**
```java
interface SortStrategy {
    void sort(int[] array);
}

class Sorter {
    private SortStrategy strategy;
    
    public void setStrategy(SortStrategy strategy) {
        this.strategy = strategy;
    }
}
```

### 22. Template Method
**Detecta:** Esqueleto de algoritmo

**Evidencia buscada:**
- Clase abstracta
- Métodos abstractos
- Método template público

### 23. Visitor
**Detecta:** Operaciones sobre estructura de objetos

**Evidencia buscada:**
- Nombre incluye "Visitor"
- 2+ métodos visit()
- Método accept()

---

## Patrones Enterprise J2EE

### 24. DAO (Data Access Object)
**Detecta:** Abstracción de acceso a datos

**Evidencia buscada:**
- Nombre incluye "DAO"
- 3+ operaciones CRUD
- Abstracción de acceso a datos

**Anti-patrones:**
- DAO debería ser interfaz

**Ejemplo:**
```java
public interface UserDao {
    void create(User user);
    User read(Long id);
    void update(User user);
    void delete(Long id);
    List<User> findAll();
}
```

### 25. Repository
**Detecta:** Colección de agregados de dominio

**Evidencia buscada:**
- Nombre incluye "Repository"
- Extiende JpaRepository/CrudRepository
- Métodos de dominio (findBy, save)

**Anti-patrones:**
- Repository debería ser interfaz

**Ejemplo:**
```java
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    List<User> findByLastName(String lastName);
}
```

### 26. DTO (Data Transfer Object)
**Detecta:** Transferencia de datos sin lógica de negocio

**Evidencia buscada:**
- Nombre incluye "DTO"
- Solo getters/setters
- Sin lógica de negocio

**Anti-patrones:**
- DTO no debería contener lógica de negocio

**Ejemplo:**
```java
public class UserDTO {
    private Long id;
    private String name;
    
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
}
```

### 27. Service Layer
**Detecta:** Lógica de negocio y orquestación

**Evidencia buscada:**
- Nombre incluye "Service" o @Service
- 2+ métodos de negocio
- Orquesta múltiples dependencias

**Anti-patrones:**
- Dependencias deberían ser final
- No depender de DAO directamente (usar Repository)

**Ejemplo:**
```java
@Service
public class UserService {
    @Autowired
    private final UserRepository repository;
    
    public UserDTO registerUser(UserDTO dto) {
        // Lógica de negocio
    }
}
```

### 28. Factory (Enterprise variants)
**Detecta:** Variantes enterprise de Factory

### 29. Data Mapper
**Detecta:** Mapeo entre objetos y BD

**Evidencia buscada:**
- Nombre incluye "Mapper"
- 2+ métodos de mapeo (map, to, from)

### 30. Active Record
**Detecta:** Objeto con datos + persistencia

**Evidencia buscada:**
- Métodos CRUD como parte del objeto
- Método save() no estático

### 31. Value Object
**Detecta:** Objeto inmutable de valor

**Evidencia buscada:**
- Todos los campos final
- Implementa equals/hashCode
- Sin setters

**Ejemplo:**
```java
public class Money {
    private final double amount;
    private final String currency;
    
    @Override
    public boolean equals(Object obj) { ... }
    
    @Override
    public int hashCode() { ... }
}
```

---

## Patrones Arquitecturales

### 32. MVC (Model-View-Controller)
**Detecta:** Separación de datos, UI y control

**Evidencia buscada:**
- Controllers (@Controller/@RestController)
- Models (@Entity)
- Views (templates)

**Ejemplo:**
```java
@RestController
public class ProductController {
    @Autowired
    private ProductService service;
}
```

### 33. Front Controller
**Detecta:** Punto de entrada centralizado

**Evidencia buscada:**
- @ControllerAdvice, @WebFilter
- DispatcherServlet
- Nombre incluye "FrontController"

### 34. Business Delegate
**Detecta:** Desacopla presentación de negocio

### 35. Session Facade
**Detecta:** Fachada de servicios de negocio

### 36. Service Locator
**Detecta:** Lookup centralizado

**Anti-patrones:**
- Service Locator es anti-patrón en Java moderno - usar Dependency Injection

### 37. Transfer Object Assembler
**Detecta:** Composición de DTOs

### 38. Composite Entity
**Detecta:** Grafo de entidades dependientes

---

## Patrones Modernos

### 39. Dependency Injection
**Detecta:** Inversión de control

**Evidencia buscada:**
- @Autowired, @Inject
- Constructor injection con campos final

**Anti-patrones:**
- Preferir constructor injection sobre field injection

**Ejemplo:**
```java
@Service
public class OrderService {
    private final OrderRepository repository;
    
    @Autowired
    public OrderService(OrderRepository repository) {
        this.repository = repository;
    }
}
```

### 40. Circuit Breaker
**Detecta:** Previene fallos en cascada

**Evidencia buscada:**
- @CircuitBreaker, @HystrixCommand
- Estados OPEN/CLOSED/HALF_OPEN

### 41. Saga
**Detecta:** Transacciones distribuidas

### 42. CQRS (Command Query Responsibility Segregation)
**Detecta:** Separación Command/Query

**Evidencia buscada:**
- Commands (operaciones escritura, void)
- Queries (operaciones lectura, retorna datos)

### 43. Event Sourcing
**Detecta:** Estado como secuencia de eventos

**Evidencia buscada:**
- Clases Event
- EventStore
- Método apply()

### 44. Unit of Work
**Detecta:** Gestión de transacciones

---

## Uso

### Validar código Java
```bash
validate_java_code con tu código Java
```

### Validar archivo Java
```bash
validate_java_file con filepath: "./ruta/al/archivo.java"
```

### Listar todos los patrones
```bash
list_java_patterns
```

---

## Configuración

Todos los patrones están configurados en `java-patterns.config.json` y pueden ser habilitados/deshabilitados individualmente.

Cada patrón tiene:
- `enabled`: true/false
- `severity`: "error", "warning", o "info"
- `detectAntipatterns`: true/false (donde aplica)
- `confidence`: "low", "medium", o "high"

---

## Ejemplos

Ver archivos de ejemplo en:
- `examples/JavaPatternsGoF.java` - Patrones GoF
- `examples/JavaPatternsEnterprise.java` - Patrones Enterprise

---

## Total de Patrones Detectados

- **Creacionales GoF**: 5 patrones
- **Estructurales GoF**: 7 patrones
- **Comportamiento GoF**: 11 patrones
- **Enterprise/J2EE**: 15+ patrones
- **Arquitecturales**: 7 patrones
- **Modernos**: 6 patrones

**TOTAL: 50+ patrones de diseño Java** 🎉
