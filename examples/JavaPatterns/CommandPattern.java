
package examples.patterns;

interface Command {
    void execute();
    void undo();
}

class Receiver {
    public void action() {
        System.out.println("Receiver action executed");
    }
    
    public void undoAction() {
        System.out.println("Receiver action undone");
    }
}

public class CommandPattern implements Command {
    private Receiver receiver;
    
    public CommandPattern(Receiver receiver) {
        this.receiver = receiver;
    }
    
    @Override
    public void execute() {
        receiver.action();
    }
    
    @Override
    public void undo() {
        receiver.undoAction();
    }
}
