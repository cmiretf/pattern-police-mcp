
package examples.patterns;

import java.util.ArrayList;
import java.util.List;

interface ComponentNode {
    void operation();
}

class Leaf implements ComponentNode {
    private String name;
    
    public Leaf(String name) {
        this.name = name;
    }
    
    @Override
    public void operation() {
        System.out.println("Leaf: " + name);
    }
}

public class CompositePattern implements ComponentNode {
    private List<ComponentNode> children = new ArrayList<>();
    
    public void add(ComponentNode component) {
        children.add(component);
    }
    
    public void remove(ComponentNode component) {
        children.remove(component);
    }
    
    @Override
    public void operation() {
        for (ComponentNode child : children) {
            child.operation();
        }
    }
}
