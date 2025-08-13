package ch.noseryoung.blj.backend.domain.task;

import ch.noseryoung.blj.backend.domain.user.User;
import ch.noseryoung.blj.backend.domain.user.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/users/{userId}/tasks")
public class TaskController {

    @Autowired
    private TaskService taskService;

    @Autowired
    private UserService userService;

    @GetMapping
    public List<Task> getAllTasksForUser(@PathVariable Long userId) {
        return taskService.getTasksByUserId(userId);
    }

    @GetMapping("/{taskId}")
    public ResponseEntity<Task> getTaskById(@PathVariable Long userId, @PathVariable Long taskId) {
        Task task = taskService.getTaskById(taskId);
        if (task != null && task.getUser().getId().equals(userId)) {
            return ResponseEntity.ok(task);
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping
    public ResponseEntity<Task> createTask(@PathVariable Long userId, @RequestBody Task task) {
        User user = userService.getUserById(userId);
        if (user != null) {
            task.setUser(user);
            Task createdTask = taskService.createTask(task);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdTask);
        }
        return ResponseEntity.notFound().build();
    }
}
