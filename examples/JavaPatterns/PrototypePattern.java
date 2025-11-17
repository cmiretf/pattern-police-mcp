
package examples.patterns;

public class PrototypePattern implements Cloneable {
    private String name;
    private int value;
    
    public PrototypePattern(String name, int value) {
        this.name = name;
        this.value = value;
    }
    
    @Override
    public Object clone() throws CloneNotSupportedException {
        return super.clone();
    }
    
    public String getName() {
        return name;
    }
    
    public int getValue() {
        return value;
    }
}
