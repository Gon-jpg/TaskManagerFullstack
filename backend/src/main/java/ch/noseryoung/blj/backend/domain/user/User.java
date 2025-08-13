package ch.noseryoung.blj.backend.domain.user;

import ch.noseryoung.blj.backend.domain.task.Task;
import jakarta.persistence.*;
import lombok.*;

import java.util.Set;


@Entity
@Table(name = "app_user")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "username", nullable = false, unique = true)
    private String username;

    @Column(name = "password", nullable = false)
    private String password;

    @OneToMany(mappedBy =  "user", cascade = CascadeType.ALL)
    private Set<Task> tasks;
}
