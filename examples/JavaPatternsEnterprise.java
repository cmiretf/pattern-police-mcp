package examples;

import java.util.*;
import javax.persistence.*;
import org.springframework.stereotype.*;
import org.springframework.beans.factory.annotation.Autowired;

// ===== DAO PATTERN =====
interface UserDao {
    void create(UserEntity user);
    UserEntity read(Long id);
    void update(UserEntity user);
    void delete(Long id);
    List<UserEntity> findAll();
}

class UserDaoImpl implements UserDao {
    @Override
    public void create(UserEntity user) {
        System.out.println("Creating user in database");
    }
    
    @Override
    public UserEntity read(Long id) {
        return new UserEntity();
    }
    
    @Override
    public void update(UserEntity user) {
        System.out.println("Updating user in database");
    }
    
    @Override
    public void delete(Long id) {
        System.out.println("Deleting user from database");
    }
    
    @Override
    public List<UserEntity> findAll() {
        return new ArrayList<>();
    }
}

// ===== DTO PATTERN =====
class UserDTO {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getFirstName() {
        return firstName;
    }
    
    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }
    
    public String getLastName() {
        return lastName;
    }
    
    public void setLastName(String lastName) {
        this.lastName = lastName;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
}

// ===== VALUE OBJECT PATTERN =====
class Money {
    private final double amount;
    private final String currency;
    
    public Money(double amount, String currency) {
        this.amount = amount;
        this.currency = currency;
    }
    
    public double getAmount() {
        return amount;
    }
    
    public String getCurrency() {
        return currency;
    }
    
    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (!(obj instanceof Money)) return false;
        Money money = (Money) obj;
        return Double.compare(money.amount, amount) == 0 &&
               Objects.equals(currency, money.currency);
    }
    
    @Override
    public int hashCode() {
        return Objects.hash(amount, currency);
    }
}

// ===== REPOSITORY PATTERN =====
@Repository
interface UserRepository extends JpaRepository<UserEntity, Long> {
    List<UserEntity> findByLastName(String lastName);
    Optional<UserEntity> findByEmail(String email);
}

class UserEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String firstName;
    private String lastName;
    private String email;
    
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
}

interface JpaRepository<T, ID> {
    T save(T entity);
    Optional<T> findById(ID id);
    List<T> findAll();
    void deleteById(ID id);
}

// ===== SERVICE LAYER PATTERN =====
@Service
class UserService {
    @Autowired
    private final UserRepository userRepository;
    
    @Autowired
    private final UserMapper userMapper;
    
    public UserService(UserRepository userRepository, UserMapper userMapper) {
        this.userRepository = userRepository;
        this.userMapper = userMapper;
    }
    
    public UserDTO registerUser(UserDTO userDTO) {
        UserEntity entity = userMapper.toEntity(userDTO);
        UserEntity saved = userRepository.save(entity);
        return userMapper.toDTO(saved);
    }
    
    public UserDTO getUserById(Long id) {
        Optional<UserEntity> user = userRepository.findById(id);
        return user.map(userMapper::toDTO).orElse(null);
    }
    
    public List<UserDTO> getAllUsers() {
        return userRepository.findAll()
            .stream()
            .map(userMapper::toDTO)
            .collect(java.util.stream.Collectors.toList());
    }
}

// ===== DATA MAPPER PATTERN =====
@Component
class UserMapper {
    public UserDTO toDTO(UserEntity entity) {
        UserDTO dto = new UserDTO();
        dto.setId(entity.getId());
        return dto;
    }
    
    public UserEntity toEntity(UserDTO dto) {
        UserEntity entity = new UserEntity();
        entity.setId(dto.getId());
        return entity;
    }
}

// ===== MVC PATTERN =====
// Model
@Entity
class Product {
    @Id
    @GeneratedValue
    private Long id;
    private String name;
    private double price;
    
    public Long getId() { return id; }
    public String getName() { return name; }
    public double getPrice() { return price; }
}

// Controller
@RestController
class ProductController {
    @Autowired
    private final ProductService productService;
    
    public ProductController(ProductService productService) {
        this.productService = productService;
    }
    
    public List<Product> getAllProducts() {
        return productService.findAll();
    }
    
    public Product getProduct(Long id) {
        return productService.findById(id);
    }
    
    public Product createProduct(Product product) {
        return productService.save(product);
    }
}

@Service
class ProductService {
    @Autowired
    private final ProductRepository productRepository;
    
    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }
    
    public List<Product> findAll() {
        return productRepository.findAll();
    }
    
    public Product findById(Long id) {
        return productRepository.findById(id).orElse(null);
    }
    
    public Product save(Product product) {
        return productRepository.save(product);
    }
}

@Repository
interface ProductRepository extends JpaRepository<Product, Long> {
}

// ===== DEPENDENCY INJECTION PATTERN =====
@Service
class OrderService {
    private final OrderRepository orderRepository;
    private final EmailService emailService;
    private final PaymentService paymentService;
    
    @Autowired
    public OrderService(OrderRepository orderRepository, 
                       EmailService emailService,
                       PaymentService paymentService) {
        this.orderRepository = orderRepository;
        this.emailService = emailService;
        this.paymentService = paymentService;
    }
    
    public void processOrder(Order order) {
        orderRepository.save(order);
        paymentService.processPayment(order);
        emailService.sendOrderConfirmation(order);
    }
}

class Order {
    private Long id;
    private double total;
}

@Repository
interface OrderRepository extends JpaRepository<Order, Long> {
}

@Service
class EmailService {
    public void sendOrderConfirmation(Order order) {
        System.out.println("Sending email confirmation");
    }
}

@Service
class PaymentService {
    public void processPayment(Order order) {
        System.out.println("Processing payment");
    }
}

// ===== FACADE PATTERN =====
class OrderFacade {
    private final OrderRepository orderRepository;
    private final InventoryService inventoryService;
    private final PaymentService paymentService;
    private final ShippingService shippingService;
    
    public OrderFacade(OrderRepository orderRepository,
                      InventoryService inventoryService,
                      PaymentService paymentService,
                      ShippingService shippingService) {
        this.orderRepository = orderRepository;
        this.inventoryService = inventoryService;
        this.paymentService = paymentService;
        this.shippingService = shippingService;
    }
    
    public void placeOrder(Order order) {
        inventoryService.reserveItems(order);
        paymentService.processPayment(order);
        orderRepository.save(order);
        shippingService.scheduleShipping(order);
    }
}

@Service
class InventoryService {
    public void reserveItems(Order order) {
        System.out.println("Reserving items");
    }
}

@Service
class ShippingService {
    public void scheduleShipping(Order order) {
        System.out.println("Scheduling shipping");
    }
}

// Annotations definitions (for compilation)
@interface Entity {}
@interface Id {}
@interface GeneratedValue { GenerationType strategy() default GenerationType.AUTO; }
@interface Autowired {}
@interface Component {}
enum GenerationType { IDENTITY, AUTO }
