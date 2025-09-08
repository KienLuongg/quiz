package com.example.quizexam_student.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.Set;

@Entity
@Table(name = "t_sem")
@Data
@NoArgsConstructor
@Getter
@Setter
@AllArgsConstructor
@Builder
@EqualsAndHashCode
public class Sem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "sem_id")
    private int id;

    @Column(name = "name", length = 10, nullable = false)
    @NotBlank(message = "Sem Name is required")
    @Size(max = 10, message = "Sem Name must be less than or equal to 10 characters")
    private String name;

    @OneToMany(mappedBy = "sem")
    @JsonIgnore
    private Set<Subject> subjects;
}