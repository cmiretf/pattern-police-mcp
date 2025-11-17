
package examples.patterns;

public abstract class TemplateMethodPattern {
    public final void templateMethod() {
        stepOne();
        stepTwo();
        stepThree();
    }
    
    protected abstract void stepOne();
    protected abstract void stepTwo();
    
    protected void stepThree() {
        System.out.println("Default step three");
    }
}

class ConcreteTemplate extends TemplateMethodPattern {
    @Override
    protected void stepOne() {
        System.out.println("Concrete step one");
    }
    
    @Override
    protected void stepTwo() {
        System.out.println("Concrete step two");
    }
}
