package com.example.quizexam_student.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.util.Set;

@Entity
@Table(name = "t_level")
@Data
@NoArgsConstructor
@Getter
@Setter
public class Level {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "level_id")
    private int id;

    @Column(name = "name", length = 20, nullable = false)
    @NotBlank(message = "Level name is required.")
    @Size(max = 20, message = "Level name must be less than or equal to 20 characters")
    private String name;

    @Column(name = "point", nullable = false)
    @NotNull(message = "Point is required.")
    @Positive(message = "Point must be greater than 0.")
    private Double point;

    @OneToMany(cascade = CascadeType.ALL, mappedBy = "level")
    @JsonIgnore
    private Set<Question> questions;

    @Column(name = "status")
    private int status;
}