package ch.noseryoung.blj.backend.domain.task;

import ch.noseryoung.blj.backend.domain.user.User;
import ch.noseryoung.blj.backend.domain.user.UserService;
import ch.noseryoung.blj.backend.domain.category.Category;
import ch.noseryoung.blj.backend.domain.category.CategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = "http://localhost:3000")
public class TaskController {

    @Autowired
    private TaskService taskService;

    @Autowired
    private UserService userService;

    @Autowired
    private CategoryService categoryService;

    @PostMapping
    public ResponseEntity<Task> createTask(@RequestBody TaskCreateDTO taskDTO, Authentication authentication) {
        String username = authentication.getName();

        Task createdTask = taskService.createTask(taskDTO, username);

        return new ResponseEntity<>(createdTask, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<Task>> getAllTasks(
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) Boolean completed) {

        try {
            List<Task> tasks;
            if (userId != null && completed != null) {
                tasks = taskService.getTasksByUserIdAndCompleted(userId, completed);
            } else if (userId != null) {
                tasks = taskService.getTasksByUserId(userId);
            } else {
                tasks = taskService.getAllTasks();
            }
            return ResponseEntity.ok(tasks);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/{taskId}")
    public ResponseEntity<?> getTaskById(@PathVariable Long taskId) {
        try {
            Task task = taskService.getTaskById(taskId);
            if (task == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(task);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", "Failed to retrieve task");
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/{taskId}")
    public ResponseEntity<?> updateTask(
            @PathVariable Long taskId,
            @Valid @RequestBody TaskUpdateRequest request) {

        try {
            Task existingTask = taskService.getTaskById(taskId);
            if (existingTask == null) {
                return ResponseEntity.notFound().build();
            }

            // Update task fields
            existingTask.setTitle(request.getTitle());
            existingTask.setDescription(request.getDescription());
            existingTask.setCompleted(request.isCompleted());

            // Update category if provided
            if (request.getCategoryId() != null) {
                Category category = categoryService.getCategoryById(Long.valueOf(request.getCategoryId()));
                if (category != null) {
                    existingTask.setCategory(category);
                }
            }

            Task updatedTask = taskService.updateTask(taskId, existingTask);
            return ResponseEntity.ok(updatedTask);

        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", "Failed to update task: " + e.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PatchMapping("/{taskId}/complete")
    public ResponseEntity<?> toggleTaskComplete(@PathVariable Long taskId) {
        try {
            Task task = taskService.toggleTaskComplete(taskId);
            return ResponseEntity.ok(task);
        } catch (RuntimeException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", e.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", "Failed to toggle task completion");
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @DeleteMapping("/{taskId}")
    public ResponseEntity<?> deleteTask(@PathVariable Long taskId) {
        try {
            Task task = taskService.getTaskById(taskId);
            if (task == null) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("message", "Task not found");
                return new ResponseEntity<>(errorResponse, HttpStatus.NOT_FOUND);
            }

            taskService.deleteTask(taskId);
            Map<String, String> successResponse = new HashMap<>();
            successResponse.put("message", "Task deleted successfully");
            return new ResponseEntity<>(successResponse, HttpStatus.OK);

        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", "Failed to delete task");
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}