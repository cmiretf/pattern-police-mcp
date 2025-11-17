
package examples.patterns;

interface Component {
    String operation();
}

class ConcreteComponent implements Component {
    @Override
    public String operation() {
        return "ConcreteComponent";
    }
}

abstract class ComponentDecorator implements Component {
    protected Component component;
    
    public ComponentDecorator(Component component) {
        this.component = component;
    }
}

public class DecoratorPattern extends ComponentDecorator {
    public DecoratorPattern(Component component) {
        super(component);
    }
    
    @Override
    public String operation() {
        return "Decorated(" + component.operation() + ")";
    }
}
