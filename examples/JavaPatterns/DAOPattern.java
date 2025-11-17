
package examples.patterns;

import java.util.List;
import java.util.ArrayList;

class User {
    private Long id;
    private String name;
    
    public User(Long id, String name) {
        this.id = id;
        this.name = name;
    }
    
    public Long getId() { return id; }
    public String getName() { return name; }
}

interface UserDao {
    void create(User user);
    User read(Long id);
    void update(User user);
    void delete(Long id);
    List<User> findAll();
}

public class DAOPattern implements UserDao {
    @Override
    public void create(User user) {
        System.out.println("Creating user: " + user.getName());
    }
    
    @Override
    public User read(Long id) {
        return new User(id, "User" + id);
    }
    
    @Override
    public void update(User user) {
        System.out.println("Updating user: " + user.getName());
    }
    
    @Override
    public void delete(Long id) {
        System.out.println("Deleting user with id: " + id);
    }
    
    @Override
    public List<User> findAll() {
        return new ArrayList<>();
    }
}
