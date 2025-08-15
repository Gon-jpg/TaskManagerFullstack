package ch.noseryoung.blj.backend.domain.task;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TaskCreateDTO {
    private String title;
    private String description;
    private Integer categoryId;
}