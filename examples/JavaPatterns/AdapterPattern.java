
package examples.patterns;

interface Target {
    void request();
}

class Adaptee {
    public void specificRequest() {
        System.out.println("Specific request");
    }
}

public class AdapterPattern implements Target {
    private Adaptee adaptee;
    
    public AdapterPattern(Adaptee adaptee) {
        this.adaptee = adaptee;
    }
    
    @Override
    public void request() {
        adaptee.specificRequest();
    }
}
