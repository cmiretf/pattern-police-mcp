
package examples.patterns;

interface Strategy {
    int execute(int a, int b);
}

class AddStrategy implements Strategy {
    @Override
    public int execute(int a, int b) {
        return a + b;
    }
}

class MultiplyStrategy implements Strategy {
    @Override
    public int execute(int a, int b) {
        return a * b;
    }
}

public class StrategyPattern {
    private Strategy strategy;
    
    public void setStrategy(Strategy strategy) {
        this.strategy = strategy;
    }
    
    public int performOperation(int a, int b) {
        return strategy.execute(a, b);
    }
}
