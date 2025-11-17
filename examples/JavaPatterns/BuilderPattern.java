
package examples.patterns;

public class BuilderPattern {
    private final String name;
    private final String email;
    private final String phone;
    private final String address;
    
    private BuilderPattern(Builder builder) {
        this.name = builder.name;
        this.email = builder.email;
        this.phone = builder.phone;
        this.address = builder.address;
    }
    
    public static class Builder {
        private String name;
        private String email;
        private String phone;
        private String address;
        
        public Builder withName(String name) {
            this.name = name;
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
        
        public Builder withAddress(String address) {
            this.address = address;
            return this;
        }
        
        public BuilderPattern build() {
            return new BuilderPattern(this);
        }
    }
}
