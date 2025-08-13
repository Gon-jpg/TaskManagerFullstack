package ch.noseryoung.blj.backend.domain.task;

import org.springframework.data.jpa.repository.JpaRepository;

public interface TaskRepository extends JpaRepository<Task, Long> {
    Task findByTitle(String title);
    Task findAllTasksByUserId(Long userId);
}
