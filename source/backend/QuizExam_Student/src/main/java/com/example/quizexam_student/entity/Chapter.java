package com.example.quizexam_student.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.util.Set;

@Entity
@Table(name = "t_chapter")
@Data
@NoArgsConstructor
@Getter
@Setter
@Builder
@AllArgsConstructor
@EqualsAndHashCode(exclude = {"questions", "subject"})
public class Chapter {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "chaper_id")
    private int id;

    @Column(name = "name", length = 100, nullable = false)
    private String name;

    @Column(name = "status", nullable = false)
    private int status;

    @ManyToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "subject_id")
    private Subject subject;

    @ManyToMany(cascade = CascadeType.ALL, mappedBy = "chapters")
    @JsonIgnore
    private Set<Question> questions;
}