
package examples.patterns;

import java.util.Objects;

public class ValueObjectPattern {
    private final double amount;
    private final String currency;
    
    public ValueObjectPattern(double amount, String currency) {
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
        if (!(obj instanceof ValueObjectPattern)) return false;
        ValueObjectPattern other = (ValueObjectPattern) obj;
        return Double.compare(other.amount, amount) == 0 &&
               Objects.equals(currency, other.currency);
    }
    
    @Override
    public int hashCode() {
        return Objects.hash(amount, currency);
    }
}
