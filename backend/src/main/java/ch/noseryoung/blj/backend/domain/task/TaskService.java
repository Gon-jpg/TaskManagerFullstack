package ch.noseryoung.blj.backend.domain.task;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TaskService {

    @Autowired
    private TaskRepository taskRepository;

    public List<Task> getAllTasks() {
        return taskRepository.findAll();
    }

    public Task getTaskById(Long id) {
        return taskRepository.findById(id).orElse(null);
    }

    public List<Task> getTasksByUserId(Long userId) {
        return (List<Task>) taskRepository.findAllTasksByUserId(userId);
    }

    // Create a new task
    public Task createTask(Task task) {
        return taskRepository.save(task);
    }

    public Task deleteTask(Long id) {
        Task task = getTaskById(id);
        if (task != null) {
            taskRepository.delete(task);
        }
        return task;
    }

    public Task updateTask(Long id, Task taskDetails) {
        Task task = getTaskById(id);
        if (task != null) {
            task.setTitle(taskDetails.getTitle());
            task.setDescription(taskDetails.getDescription());
            task.setCompleted(taskDetails.isCompleted());
            return taskRepository.save(task);
        }
        return null;
    }
}
