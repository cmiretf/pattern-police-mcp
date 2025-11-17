package examples;

import java.util.*;

// ===== SINGLETON PATTERN =====
public class DatabaseConnection {
    private static final DatabaseConnection INSTANCE = new DatabaseConnection();
    
    private DatabaseConnection() {
        // Private constructor
    }
    
    public static DatabaseConnection getInstance() {
        return INSTANCE;
    }
    
    @Override
    protected Object clone() throws CloneNotSupportedException {
        throw new CloneNotSupportedException();
    }
}

// ===== BUILDER PATTERN =====
class User {
    private final String firstName;
    private final String lastName;
    private final String email;
    private final String phone;
    
    private User(Builder builder) {
        this.firstName = builder.firstName;
        this.lastName = builder.lastName;
        this.email = builder.email;
        this.phone = builder.phone;
    }
    
    public static class Builder {
        private String firstName;
        private String lastName;
        private String email;
        private String phone;
        
        public Builder withFirstName(String firstName) {
            this.firstName = firstName;
            return this;
        }
        
        public Builder withLastName(String lastName) {
            this.lastName = lastName;
            return this;
        }
        
        public Builder withEmail(String email) {
            this.email = email;
            return this;
        }
        
        public Builder withPhone(String phone) {
            this.phone = phone;
            return this;
        }
        
        public User build() {
            return new User(this);
        }
    }
}

// ===== FACTORY METHOD PATTERN =====
abstract class PaymentProcessor {
    public abstract Payment createPayment(double amount);
    
    public void processPayment(double amount) {
        Payment payment = createPayment(amount);
        payment.process();
    }
}

interface Payment {
    void process();
}

class CreditCardPayment implements Payment {
    private double amount;
    
    public CreditCardPayment(double amount) {
        this.amount = amount;
    }
    
    @Override
    public void process() {
        System.out.println("Processing credit card payment: $" + amount);
    }
}

class PayPalPayment implements Payment {
    private double amount;
    
    public PayPalPayment(double amount) {
        this.amount = amount;
    }
    
    @Override
    public void process() {
        System.out.println("Processing PayPal payment: $" + amount);
    }
}

// ===== OBSERVER PATTERN =====
class NewsPublisher {
    private List<NewsSubscriber> subscribers = new ArrayList<>();
    private String latestNews;
    
    public void addSubscriber(NewsSubscriber subscriber) {
        subscribers.add(subscriber);
    }
    
    public void removeSubscriber(NewsSubscriber subscriber) {
        subscribers.remove(subscriber);
    }
    
    public void publishNews(String news) {
        this.latestNews = news;
        notifySubscribers();
    }
    
    private void notifySubscribers() {
        for (NewsSubscriber subscriber : subscribers) {
            subscriber.update(latestNews);
        }
    }
}

interface NewsSubscriber {
    void update(String news);
}

class EmailSubscriber implements NewsSubscriber {
    private String email;
    
    public EmailSubscriber(String email) {
        this.email = email;
    }
    
    @Override
    public void update(String news) {
        System.out.println("Email sent to " + email + ": " + news);
    }
}

// ===== STRATEGY PATTERN =====
interface SortStrategy {
    void sort(int[] array);
}

class QuickSort implements SortStrategy {
    @Override
    public void sort(int[] array) {
        System.out.println("Sorting using QuickSort");
    }
}

class MergeSort implements SortStrategy {
    @Override
    public void sort(int[] array) {
        System.out.println("Sorting using MergeSort");
    }
}

class Sorter {
    private SortStrategy strategy;
    
    public void setStrategy(SortStrategy strategy) {
        this.strategy = strategy;
    }
    
    public void executeSort(int[] array) {
        strategy.sort(array);
    }
}

// ===== DECORATOR PATTERN =====
interface Coffee {
    double getCost();
    String getDescription();
}

class SimpleCoffee implements Coffee {
    @Override
    public double getCost() {
        return 2.0;
    }
    
    @Override
    public String getDescription() {
        return "Simple Coffee";
    }
}

abstract class CoffeeDecorator implements Coffee {
    protected Coffee decoratedCoffee;
    
    public CoffeeDecorator(Coffee coffee) {
        this.decoratedCoffee = coffee;
    }
}

class MilkDecorator extends CoffeeDecorator {
    public MilkDecorator(Coffee coffee) {
        super(coffee);
    }
    
    @Override
    public double getCost() {
        return decoratedCoffee.getCost() + 0.5;
    }
    
    @Override
    public String getDescription() {
        return decoratedCoffee.getDescription() + ", Milk";
    }
}

// ===== ADAPTER PATTERN =====
interface MediaPlayer {
    void play(String audioType, String fileName);
}

interface AdvancedMediaPlayer {
    void playVlc(String fileName);
    void playMp4(String fileName);
}

class VlcPlayer implements AdvancedMediaPlayer {
    @Override
    public void playVlc(String fileName) {
        System.out.println("Playing vlc file: " + fileName);
    }
    
    @Override
    public void playMp4(String fileName) {
        // do nothing
    }
}

class MediaAdapter implements MediaPlayer {
    AdvancedMediaPlayer advancedMusicPlayer;
    
    public MediaAdapter(String audioType) {
        if(audioType.equalsIgnoreCase("vlc")) {
            advancedMusicPlayer = new VlcPlayer();
        }
    }
    
    @Override
    public void play(String audioType, String fileName) {
        if(audioType.equalsIgnoreCase("vlc")) {
            advancedMusicPlayer.playVlc(fileName);
        }
    }
}

// ===== TEMPLATE METHOD PATTERN =====
abstract class DataProcessor {
    public final void processData() {
        loadData();
        validateData();
        transformData();
        saveData();
    }
    
    protected abstract void loadData();
    protected abstract void transformData();
    
    protected void validateData() {
        System.out.println("Validating data...");
    }
    
    protected void saveData() {
        System.out.println("Saving data...");
    }
}

class CSVDataProcessor extends DataProcessor {
    @Override
    protected void loadData() {
        System.out.println("Loading CSV data...");
    }
    
    @Override
    protected void transformData() {
        System.out.println("Transforming CSV data...");
    }
}

// ===== COMMAND PATTERN =====
interface Command {
    void execute();
    void undo();
}

class Light {
    public void turnOn() {
        System.out.println("Light is ON");
    }
    
    public void turnOff() {
        System.out.println("Light is OFF");
    }
}

class TurnOnCommand implements Command {
    private Light light;
    
    public TurnOnCommand(Light light) {
        this.light = light;
    }
    
    @Override
    public void execute() {
        light.turnOn();
    }
    
    @Override
    public void undo() {
        light.turnOff();
    }
}

// ===== COMPOSITE PATTERN =====
interface Component {
    void operation();
}

class Leaf implements Component {
    private String name;
    
    public Leaf(String name) {
        this.name = name;
    }
    
    @Override
    public void operation() {
        System.out.println("Leaf: " + name);
    }
}

class Composite implements Component {
    private List<Component> children = new ArrayList<>();
    
    public void add(Component component) {
        children.add(component);
    }
    
    public void remove(Component component) {
        children.remove(component);
    }
    
    @Override
    public void operation() {
        for (Component child : children) {
            child.operation();
        }
    }
}

// ===== ITERATOR PATTERN =====
class BookCollection implements Iterable<String> {
    private List<String> books = new ArrayList<>();
    
    public void addBook(String book) {
        books.add(book);
    }
    
    @Override
    public Iterator<String> iterator() {
        return books.iterator();
    }
}

// ===== PROXY PATTERN =====
interface Image {
    void display();
}

class RealImage implements Image {
    private String filename;
    
    public RealImage(String filename) {
        this.filename = filename;
        loadFromDisk();
    }
    
    private void loadFromDisk() {
        System.out.println("Loading " + filename);
    }
    
    @Override
    public void display() {
        System.out.println("Displaying " + filename);
    }
}

class ImageProxy implements Image {
    private RealImage realImage;
    private String filename;
    
    public ImageProxy(String filename) {
        this.filename = filename;
    }
    
    @Override
    public void display() {
        if (realImage == null) {
            realImage = new RealImage(filename);
        }
        realImage.display();
    }
}
