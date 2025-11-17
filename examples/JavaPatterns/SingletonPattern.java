
package examples.patterns;

public class SingletonPattern {
    private static final SingletonPattern INSTANCE = new SingletonPattern();
    
    private SingletonPattern() {
        // Constructor privado
    }
    
    public static SingletonPattern getInstance() {
        return INSTANCE;
    }
    
    @Override
    protected Object clone() throws CloneNotSupportedException {
        throw new CloneNotSupportedException();
    }
    
    public void doSomething() {
        System.out.println("Singleton instance working!");
    }
}
